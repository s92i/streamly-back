import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'

import type { User } from '@/prisma/generated'
import { Authorization } from '@/src/shared/decorators/auth.decorator'
import { Authorized } from '@/src/shared/decorators/authorized.decorator'

import { ChangeNotificationsSettingsInput } from './inputs/change-notifications-settings.input'
import { ChangeNotificationsSettingsResponse } from './models/notifications-settings.model'
import { NotificationModel } from './models/notifications.model'
import { NotificationsService } from './notifications.service'

@Resolver('Notification')
export class NotificationsResolver {
	public constructor(
		private readonly notificationsService: NotificationsService
	) {}

	@Authorization()
	@Query(() => Number, { name: 'findNotificationsUnreadCount' })
	public async findUnreadCount(@Authorized() user: User) {
		return this.notificationsService.findUnreadCount(user)
	}

	@Authorization()
	@Query(() => [NotificationModel], { name: 'findNotificationsByUser' })
	public async findByUser(@Authorized() user: User) {
		return this.notificationsService.findByUser(user)
	}

	@Authorization()
	@Mutation(() => ChangeNotificationsSettingsResponse, {
		name: 'changeNotificationsSettings'
	})
	public async changeSettings(
		@Authorized() user: User,
		@Args('data') input: ChangeNotificationsSettingsInput
	) {
		return this.notificationsService.changeSettings(user, input)
	}
}
