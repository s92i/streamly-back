import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'

import { PrismaService } from '@/src/core/prisma/prisma.service'

import { MailService } from '../libs/mail/mail.service'
import { StorageService } from '../libs/storage/storage.service'
import { TelegramService } from '../libs/telegram/telegram.service'
import { NotificationsService } from '../notifications/notifications.service'

@Injectable()
export class CronService {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly mailService: MailService,
		private readonly storageService: StorageService,
		private readonly telegramService: TelegramService,
		private readonly notificationsService: NotificationsService
	) {}

	@Cron(CronExpression.EVERY_DAY_AT_1AM)
	public async deleteDeactivatedAccounts() {
		const sevenDaysAgo = new Date()
		sevenDaysAgo.setDate(sevenDaysAgo.getDay() - 7)

		const deactivatedAccounts = await this.prismaService.user.findMany({
			where: {
				isDeactivated: true,
				deactivatedAt: {
					lte: sevenDaysAgo
				}
			},
			include: {
				notificationsSettings: true,
				stream: true
			}
		})

		for (const user of deactivatedAccounts) {
			await this.mailService.sendAccountDeletion(user.email)
			this.storageService.remove(user.avatar)

			if (
				user.notificationsSettings.telegramNotifications &&
				user.telegramId
			) {
				await this.telegramService.sendAccountDeletion(user.telegramId)
			}

			if (user.avatar) {
				this.storageService.remove(user.avatar)
			}

			if (user.stream.thumbnailUrl) {
				this.storageService.remove(user.stream.thumbnailUrl)
			}
		}

		await this.prismaService.user.deleteMany({
			where: {
				isDeactivated: true,
				deactivatedAt: {
					lte: sevenDaysAgo
				}
			}
		})
	}

	@Cron('0 0 */4 * *')
	public async notifyUsersEnableTwoFactor() {
		const users = await this.prismaService.user.findMany({
			where: {
				isTotpEnabled: false
			},
			include: {
				notificationsSettings: true
			}
		})

		for (const user of users) {
			await this.mailService.sendEnableTwoFactor(user.email)

			if (user.notificationsSettings.siteNotifications) {
				await this.notificationsService.createEnableTwoFactor(user.id)
			}

			if (
				user.notificationsSettings.telegramNotifications &&
				user.telegramId
			) {
				await this.telegramService.sendEnableTwoFactor(user.telegramId)
			}
		}
	}

	@Cron(CronExpression.EVERY_DAY_AT_1AM)
	public async verifyChannels() {
		const users = await this.prismaService.user.findMany({
			include: {
				notificationsSettings: true
			}
		})

		for (const user of users) {
			const followersCount = await this.prismaService.follow.count({
				where: {
					followingId: user.id
				}
			})

			if (followersCount > 10 && !user.isVerified) {
				await this.prismaService.user.update({
					where: {
						id: user.id
					},
					data: {
						isVerified: true
					}
				})

				await this.mailService.sendVerifyChannel(user.email)

				if (user.notificationsSettings.siteNotifications) {
					await this.notificationsService.createVerifyChannel(user.id)
				}

				if (
					user.notificationsSettings.telegramNotifications &&
					user.telegramId
				) {
					await this.telegramService.sendVerifyChannel(
						user.telegramId
					)
				}
			}
		}
	}

	@Cron(CronExpression.EVERY_DAY_AT_1AM)
	public async deleteOldNotifications() {
		const sevenDaysAgo = new Date()
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

		await this.prismaService.notification.deleteMany({
			where: {
				createdAt: {
					lte: sevenDaysAgo
				}
			}
		})
	}
}
