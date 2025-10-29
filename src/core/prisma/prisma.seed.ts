import { BadRequestException, Logger } from '@nestjs/common'
import { hash } from 'argon2'

import { Prisma, PrismaClient } from '../../../prisma/generated'

import { categoriesData } from './data/categories.data'
import { streamTitles } from './data/stream-titles.data'
import { usernames } from './data/usernames.data'

const prisma = new PrismaClient({
	transactionOptions: {
		maxWait: 5000,
		timeout: 10000,
		isolationLevel: Prisma.TransactionIsolationLevel.Serializable
	}
})

async function main() {
	try {
		Logger.log('Beginning of database population')

		await prisma.$transaction([
			prisma.user.deleteMany(),
			prisma.socialLink.deleteMany(),
			prisma.stream.deleteMany(),
			prisma.category.deleteMany()
		])

		await prisma.category.createMany({
			data: categoriesData
		})

		Logger.log('Categories successfully created')

		const categories = await prisma.category.findMany()

		const categoriesBySlug = Object.fromEntries(
			categories.map(category => [category.slug, category])
		)

		await prisma.$transaction(async tx => {
			for (const username of usernames) {
				const randomCategory =
					categoriesBySlug[
						Object.keys(categoriesBySlug)[
							Math.floor(
								Math.random() *
									Object.keys(categoriesBySlug).length
							)
						]
					]

				const userExists = await tx.user.findUnique({
					where: {
						username
					}
				})

				if (!userExists) {
					const createdUser = await tx.user.create({
						data: {
							email: `${username}@streamly.com`,
							password: await hash('123456789'),
							username,
							displayName: username,
							avatar: `/channels/${username}.webp`,
							isEmailVerified: true,
							socialLinks: {
								createMany: {
									data: [
										{
											title: 'Telegram',
											url: `https://t.me/${username}`,
											position: 1
										},
										{
											title: 'YouTube',
											url: `https://youtube.com/@${username}`,
											position: 2
										}
									]
								}
							}
						}
					})
					const randomTitles = streamTitles[randomCategory.slug]
					const randomTitle =
						randomTitles[
							Math.floor(Math.random() * randomTitles.length)
						]
					await tx.stream.create({
						data: {
							title: randomTitle,
							thumbnailUrl: `/streams/${createdUser.username}.webp`,
							user: {
								connect: {
									id: createdUser.id
								}
							},
							category: {
								connect: {
									id: randomCategory.id
								}
							}
						}
					})
					Logger.log(
						`User "${createdUser.username}" and their stream have been successfully created`
					)
				}
			}
		})
		Logger.log('Database population completed successfully')
	} catch (error) {
		Logger.error(error)
		throw new BadRequestException('Error while filling the database')
	} finally {
		Logger.log('Closing connection to the database...')
		await prisma.$disconnect()
		Logger.log('Connection to the database successfully closed')
	}
}

main()
