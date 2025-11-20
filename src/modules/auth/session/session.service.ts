import {
	BadRequestException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { verify } from 'argon2'
import { Request } from 'express'
import { TOTP } from 'otpauth'

import { PrismaService } from '@/src/core/prisma/prisma.service'
import { RedisService } from '@/src/core/redis/redis.service'
import { getSessionMetadata } from '@/src/shared/utils/session-metadata.util'
import { destroySession, saveSession } from '@/src/shared/utils/session.util'

import { VerificationService } from '../verification/verification.service'

import { LoginInput } from './inputs/login.input'

@Injectable()
export class SessionService {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly redisService: RedisService,
		private readonly configService: ConfigService,
		private readonly verificationService: VerificationService
	) {}

	public async findByUser(req: Request) {
		const userId = req.session.userId

		if (!userId) {
			throw new NotFoundException('User not found in session')
		}

		const keys = await this.redisService.keys('*')

		const userSessions = []

		for (const key of keys) {
			const sessionData = await this.redisService.get(key)

			if (sessionData) {
				const session = JSON.parse(sessionData)

				if (session.userId === userId) {
					userSessions.push({
						...session,
						id: key.split(':')[1]
					})
				}
			}
		}

		userSessions.sort((a, b) => b.createdAt - a.createdAt)

		return userSessions.filter(session => session.id !== req.session.id)
	}

	public async findCurrent(req: Request) {
		const sessionId = req.session.id

		const sessionData = await this.redisService.get(
			`${this.configService.getOrThrow<string>('SESSION_FOLDER')}${sessionId}`
		)

		const session = JSON.parse(sessionData)

		return {
			...session,
			id: sessionId
		}
	}

	public async login(req: Request, input: LoginInput, userAgent: string) {
		const { login, password, pin } = input

		const user = await this.prismaService.user.findFirst({
			where: {
				OR: [
					{ username: { equals: login } },
					{ email: { equals: login } }
				]
			}
		})

		if (!user || user.isDeactivated) {
			throw new NotFoundException('User not found')
		}

		const isPasswordValid = await verify(user.password, password)

		if (!isPasswordValid) {
			throw new NotFoundException('Invalid password')
		}

		if (!user.isEmailVerified) {
			await this.verificationService.sendVerificationToken(user)
			throw new BadRequestException(
				'Account not verified. Please check your email for confirmation'
			)
		}

		if (user.isTotpEnabled) {
			if (!pin) {
				return {
					message: 'A code is required to complete authorization',
					user: null
				}
			}

			const totp = new TOTP({
				issuer: 'Streamly',
				label: `${user.email}`,
				algorithm: 'SHA1',
				digits: 6,
				secret: user.totpSecret
			})

			const delta = totp.validate({ token: pin })
			if (delta === null) {
				throw new BadRequestException('Invalid code')
			}
		}

		const metadata = getSessionMetadata(req, userAgent)

		await saveSession(req, user, metadata)

		return {
			user,
			message: 'Login successful'
		}
	}

	public async logout(req: Request) {
		return destroySession(req, this.configService)
	}

	public async clearSession(req: Request) {
		req.res.clearCookie(
			this.configService.getOrThrow<string>('SESSION_NAME')
		)

		return true
	}

	public async remove(req: Request, id: string) {
		const folder = this.configService.getOrThrow<string>('SESSION_FOLDER')
		const key = `${folder}${id}`

		if (req.session.id === id) {
			await new Promise((resolve, reject) => {
				req.session.destroy(err => {
					if (err) return reject(err)
					resolve(true)
				})
			})

			req.res?.clearCookie(
				this.configService.getOrThrow<string>('SESSION_NAME')
			)
			await this.redisService.del(key)
			return true
		}

		await this.redisService.del(key)
		return true
	}
}
