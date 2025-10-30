import { Module } from '@nestjs/common'

import { NotificationsService } from '../notifications/notifications.service'

import { FollowResolver } from './follow.resolver'
import { FollowService } from './follow.service'

@Module({
	providers: [FollowResolver, FollowService, NotificationsService]
})
export class FollowModule {}
