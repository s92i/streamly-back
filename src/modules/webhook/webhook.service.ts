import { Injectable } from '@nestjs/common'

import { PrismaService } from '@/src/core/prisma/prisma.service'

import { LivekitService } from '../libs/livekit/livekit.service'
import { NotificationsService } from '../notifications/notifications.service'

@Injectable()
export class WebhookService {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly livekitService: LivekitService,
		private readonly notificationsService: NotificationsService
	) {}

	public async receiveWebhookLivekit(body: string, authorization: string) {
		const event = await this.livekitService.receiver.receive(
			body,
			authorization,
			true
		)

		if (event.event === 'ingress_started') {
			const stream = await this.prismaService.stream.update({
				where: {
					ingressId: event.ingressInfo.ingressId
				},
				data: {
					isLive: true
				},
				include: {
					user: true
				}
			})

			const followers = await this.prismaService.follow.findMany({
				where: {
					followingId: stream.user.id,
					follower: {
						isDeactivated: false
					}
				},
				include: {
					follower: {
						include: {
							notificationsSettings: true
						}
					}
				}
			})

			for (const follow of followers) {
				const follower = follow.follower

				if (follower.notificationsSettings.siteNotifications) {
					await this.notificationsService.createStreamStart(
						follower.id,
						stream.user
					)
				}
			}
		}

		if (event.event === 'ingress_ended') {
			const stream = await this.prismaService.stream.update({
				where: {
					ingressId: event.ingressInfo.ingressId
				},
				data: {
					isLive: false
				}
			})

			await this.prismaService.chatMessage.deleteMany({
				where: {
					streamId: stream.id
				}
			})
		}
	}
}
