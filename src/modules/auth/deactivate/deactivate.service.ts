import {
	BadRequestException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { verify } from 'argon2'
import type { Request } from 'express'

import { TokenType, type User } from '@/prisma/generated'
import { PrismaService } from '@/src/core/prisma/prisma.service'
import { generateToken } from '@/src/shared/utils/generate-token.util'
import { getSessionMetadata } from '@/src/shared/utils/session-metadata.util'
import { destroySession } from '@/src/shared/utils/session.util'

import { MailService } from '../../libs/mail/mail.service'
import { TelegramService } from '../../libs/telegram/telegram.service'

import { DeactivateAccountInput } from './inputs/deactivate-account.input'

@Injectable()
export class DeactivateService {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly configService: ConfigService,
		private readonly mailService: MailService,
		private readonly telegramService: TelegramService
	) {}

	public async deactivate(
		req: Request,
		input: DeactivateAccountInput,
		user: User,
		userAgent: string
	) {
		const { email, password, pin } = input

		if (user.email !== email) {
			throw new BadRequestException('Invalid email')
		}

		const isPasswordValid = await verify(user.password, password)

		if (!isPasswordValid) {
			throw new BadRequestException('Invalid password')
		}

		if (!pin) {
			await this.sendDeactivationToken(req, user, userAgent)

			return {
				message: 'Confirmation code required'
			}
		}

		await this.validateDeactivationToken(req, pin)

		return { user }
	}

	private async validateDeactivationToken(req: Request, token: string) {
		const existingToken = await this.prismaService.token.findUnique({
			where: {
				token,
				type: TokenType.DEACTIVATE
			}
		})

		if (!existingToken) {
			throw new NotFoundException('Token not found')
		}

		const hasExpired = new Date(existingToken.expiresIn) < new Date()

		if (hasExpired) {
			throw new BadRequestException('Token expired')
		}

		await this.prismaService.user.update({
			where: {
				id: existingToken.userId
			},
			data: {
				isDeactivated: true,
				deactivatedAt: new Date()
			}
		})

		await this.prismaService.token.delete({
			where: {
				id: existingToken.id,
				type: TokenType.DEACTIVATE
			}
		})

		return destroySession(req, this.configService)
	}

	public async sendDeactivationToken(
		req: Request,
		user: User,
		userAgent: string
	) {
		const deactivationToken = await generateToken(
			this.prismaService,
			user,
			TokenType.DEACTIVATE,
			false
		)

		const metadata = getSessionMetadata(req, userAgent)

		await this.mailService.sendDeactivationToken(
			user.email,
			deactivationToken.token,
			metadata
		)

		if (
			deactivationToken.user.notificationsSettings
				.telegramNotifications &&
			deactivationToken.user.telegramId
		) {
			await this.telegramService.sendDeactivationToken(
				deactivationToken.user.telegramId,
				deactivationToken.token,
				metadata
			)

			await this.telegramService.sendAccountDeletion(
				deactivationToken.user.telegramId
			)
		}

		return true
	}
}
