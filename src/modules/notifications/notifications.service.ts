import { Injectable } from '@nestjs/common'

import {
	NotificationType,
	type SponsorshipPlan,
	TokenType,
	type User
} from '@/prisma/generated'
import { PrismaService } from '@/src/core/prisma/prisma.service'
import { generateToken } from '@/src/shared/utils/generate-token.util'

import { ChangeNotificationsSettingsInput } from './inputs/change-notifications-settings.input'

@Injectable()
export class NotificationsService {
	public constructor(private readonly prismaService: PrismaService) {}

	public async findUnreadCount(user: User) {
		const count = await this.prismaService.notification.count({
			where: {
				isRead: false,
				userId: user.id
			}
		})

		return count
	}

	public async findByUser(user: User) {
		await this.prismaService.notification.updateMany({
			where: {
				isRead: false,
				userId: user.id
			},
			data: {
				isRead: true
			}
		})

		const notifications = await this.prismaService.notification.findMany({
			where: {
				userId: user.id
			},
			orderBy: {
				createdAt: 'desc'
			}
		})

		return notifications
	}

	public async createStreamStart(userId: string, channel: User) {
		const notification = await this.prismaService.notification.create({
			data: {
				message: `<b className='font-medium'>Don't miss it!</b>
				<p>Join the stream on the channel <a href='/${channel.username}' className='font-semibold'>${channel.displayName}</a></p>
				`,
				type: NotificationType.STREAM_START,
				user: {
					connect: {
						id: userId
					}
				}
			}
		})

		return notification
	}

	public async createNewFollowing(userId: string, follower: User) {
		const notification = await this.prismaService.notification.create({
			data: {
				message: `<b className='font-medium'>You have a new subscriber!</b>
				<p>This is a user <a href='/${follower.username}' className='font-semibold'>${follower.displayName}</a></p>
				`,
				type: NotificationType.NEW_FOLLOWER,
				user: {
					connect: {
						id: userId
					}
				}
			}
		})

		return notification
	}

	public async createNewSponsorship(
		userId: string,
		plan: SponsorshipPlan,
		sponsor: User
	) {
		const notification = await this.prismaService.notification.create({
			data: {
				message: `<b className='font-medium'>You have a new sponsor!</b>
				<p>The user <a href='/${sponsor.username} className='font-semibold')>${sponsor.displayName}</a> has become your sponsor by choosing the plan <strong>${plan.title}</strong></p>
				`,
				type: NotificationType.NEW_SPONSORSHIP,
				user: {
					connect: {
						id: userId
					}
				}
			}
		})

		return notification
	}

	public async createEnableTwoFactor(userId: string) {
		const notification = await this.prismaService.notification.create({
			data: {
				message: `<b className='font-medium'>Upgrade your security !</b>
<p>Enable two-factor authentication in your account settings to increase your level of protection</p>`,
				type: NotificationType.ENABLE_TWO_FACTOR,
				userId
			}
		})

		return notification
	}

	public async createVerifyChannel(userId: string) {
		const notification = await this.prismaService.notification.create({
			data: {
				message: `<b className='font-medium'>Congratulations !</b>
<p>Your channel has been verified, and now a checkmark will appear next to your channel.</p>`,
				type: NotificationType.VERIFIED_CHANNEL,
				userId
			}
		})

		return notification
	}

	public async changeSettings(
		user: User,
		input: ChangeNotificationsSettingsInput
	) {
		const { siteNotifications, telegramNotifications } = input

		const notificationsSettings =
			await this.prismaService.notificationsSettings.upsert({
				where: {
					userId: user.id
				},
				create: {
					siteNotifications,
					telegramNotifications,
					user: {
						connect: {
							id: user.id
						}
					}
				},
				update: {
					siteNotifications,
					telegramNotifications
				},
				include: {
					user: true
				}
			})

		if (
			notificationsSettings?.telegramNotifications &&
			!notificationsSettings?.user?.telegramId
		) {
			const telegramAuthToken = await generateToken(
				this.prismaService,
				user,
				TokenType.TELEGRAM_AUTH
			)

			return {
				notificationsSettings,
				telegramAuthToken: telegramAuthToken.token
			}
		}

		if (
			!notificationsSettings?.telegramNotifications &&
			notificationsSettings?.user?.telegramId
		) {
			await this.prismaService.user.update({
				where: {
					id: user.id
				},
				data: {
					telegramId: null
				}
			})

			return { notificationsSettings }
		}

		return { notificationsSettings }
	}
}
