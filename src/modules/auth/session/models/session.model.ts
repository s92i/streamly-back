import { Field, ID, ObjectType } from '@nestjs/graphql'

import {
	DeviceInfo,
	LocationInfo,
	SessionMetadata
} from '@/src/shared/types/session-metadata.types'

@ObjectType()
export class LocationModel implements LocationInfo {
	@Field(() => String)
	country: string

	@Field(() => String)
	city: string

	@Field(() => Number)
	latitude: number

	@Field(() => Number)
	longitude: number
}

@ObjectType()
export class DeviceModel implements DeviceInfo {
	@Field(() => String)
	public browser: string

	@Field(() => String)
	public os: string

	@Field(() => String)
	public type: string
}

@ObjectType()
export class SessionMetadataModel implements SessionMetadata {
	@Field(() => LocationModel)
	public location: LocationModel

	@Field(() => DeviceModel)
	public device: DeviceModel

	@Field(() => String)
	public ip: string
}

@ObjectType()
export class SessionModel {
	@Field(() => ID)
	public id: string

	@Field(() => String)
	public userId: string

	@Field(() => String)
	public createdAt: string

	@Field(() => SessionMetadataModel)
	public metadata: SessionMetadataModel
}
