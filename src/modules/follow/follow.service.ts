import {
	ConflictException,
	Injectable,
	NotFoundException
} from '@nestjs/common'

import type { User } from '@/prisma/generated'
import { PrismaService } from '@/src/core/prisma/prisma.service'

import { TelegramService } from '../libs/telegram/telegram.service'
import { NotificationsService } from '../notifications/notifications.service'

@Injectable()
export class FollowService {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly notificationService: NotificationsService,
		private readonly telegramService: TelegramService
	) {}

	public async findMyFollowers(user: User) {
		return this.prismaService.follow.findMany({
			where: { followingId: user.id },
			orderBy: { createdAt: 'desc' },
			include: {
				follower: true,
				following: true
			}
		})
	}

	public async findMyFollowings(user: User) {
		return this.prismaService.follow.findMany({
			where: { followerId: user.id },
			orderBy: { createdAt: 'desc' },
			include: {
				follower: true,
				following: true
			}
		})
	}

	public async follow(user: User, channelId: string) {
		const channel = await this.prismaService.user.findUnique({
			where: {
				id: channelId
			}
		})

		if (!channel) {
			throw new NotFoundException('Channel not found')
		}

		if (channel.id === user.id) {
			throw new ConflictException('You cannot subscribe to yourself')
		}

		const existingFollow = await this.prismaService.follow.findFirst({
			where: {
				followerId: user.id,
				followingId: channel.id
			}
		})

		if (existingFollow) {
			throw new ConflictException(
				'You are already subscribed to this channel'
			)
		}

		const follow = await this.prismaService.follow.create({
			data: {
				followerId: user.id,
				followingId: channel.id
			},
			include: {
				follower: true,
				following: {
					include: {
						notificationsSettings: true
					}
				}
			}
		})

		if (follow.following.notificationsSettings?.siteNotifications) {
			await this.notificationService.createNewFollowing(
				follow.following.id,
				follow.follower
			)
		}

		if (
			follow.following.notificationsSettings?.telegramNotifications &&
			follow.following.telegramId
		) {
			await this.telegramService.sendNewFollowing(
				follow.following.telegramId,
				follow.follower
			)
		}

		return true
	}

	public async unfollow(user: User, channelId: string) {
		const channel = await this.prismaService.user.findUnique({
			where: {
				id: channelId
			}
		})

		if (!channel) {
			throw new NotFoundException('Channel not found')
		}

		if (channel.id === user.id) {
			throw new ConflictException('You cannot unsubscribe from yourself')
		}

		const existingFollow = await this.prismaService.follow.findFirst({
			where: {
				followerId: user.id,
				followingId: channel.id
			}
		})

		if (!existingFollow) {
			throw new ConflictException(
				'You are not subscribed to this channel'
			)
		}

		await this.prismaService.follow.delete({
			where: {
				id: existingFollow.id,
				followerId: user.id,
				followingId: channel.id
			}
		})

		return true
	}
}
