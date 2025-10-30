import { Module, RequestMethod } from '@nestjs/common'
import type { MiddlewareConsumer } from '@nestjs/common/interfaces'

import { RawBodyMiddleware } from '@/src/shared/middlewares/raw-body.middleware'

import { NotificationsService } from '../notifications/notifications.service'

import { WebhookController } from './webhook.controller'
import { WebhookService } from './webhook.service'

@Module({
	controllers: [WebhookController],
	providers: [WebhookService, NotificationsService]
})
export class WebhookModule {
	public configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(RawBodyMiddleware)
			.forRoutes({ path: 'webhook/livekit', method: RequestMethod.POST })
	}
}
