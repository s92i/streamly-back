import { Field, ObjectType } from '@nestjs/graphql'

import type { NotificationsSettings } from '@/prisma/generated'

import { UserModel } from '../../auth/account/models/user.model'

@ObjectType()
export class NotificationsSettingsModel implements NotificationsSettings {
	@Field(() => String)
	public id: string

	@Field(() => Boolean)
	public siteNotifications: boolean

	@Field(() => Boolean)
	public telegramNotifications: boolean

	@Field(() => UserModel)
	public user: UserModel

	@Field(() => String)
	public userId: string

	@Field(() => Date)
	public createdAt: Date

	@Field(() => Date)
	public updatedAt: Date
}

@ObjectType()
export class ChangeNotificationsSettingsResponse {
	@Field(() => NotificationsSettingsModel)
	public notificationsSettings: NotificationsSettingsModel

	@Field(() => String, { nullable: true })
	public telegramAuthToken?: string
}
