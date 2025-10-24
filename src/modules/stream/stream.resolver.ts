import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js'
import * as Upload from 'graphql-upload/Upload.js'

import type { User } from '@/prisma/generated'
import { Authorization } from '@/src/shared/decorators/auth.decorator'
import { Authorized } from '@/src/shared/decorators/authorized.decorator'
import { FileValidationPipe } from '@/src/shared/pipes/file-validation.pipe'

import { ChangeStreamInfoInput } from './inputs/change-stream-info.input'
import { FiltersInput } from './inputs/filters.input'
import { StreamModel } from './models/stream.model'
import { StreamService } from './stream.service'

@Resolver('Stream')
export class StreamResolver {
	constructor(private readonly streamService: StreamService) {}

	@Query(() => [StreamModel], { name: 'findAllStreams' })
	public async findAllStreams(@Args('filters') input: FiltersInput) {
		return this.streamService.findAll(input)
	}

	@Query(() => [StreamModel], { name: 'findRandomStreams' })
	public async findRandomStreams() {
		return this.streamService.findRandom()
	}

	@Authorization()
	@Mutation(() => Boolean, { name: 'changeStreamInfo' })
	public async changeStreamInfo(
		@Authorized() user: User,
		@Args('data') input: ChangeStreamInfoInput
	) {
		return this.streamService.changeStreamInfo(user, input)
	}

	@Authorization()
	@Mutation(() => Boolean, { name: 'changeStreamThumbnail' })
	public async changeStreamThumbnail(
		@Authorized() user: User,
		@Args('thumbnail', { type: () => GraphQLUpload }, FileValidationPipe)
		thumbnail: Upload
	) {
		return this.streamService.changeStreamThumbnail(user, thumbnail)
	}

	@Authorization()
	@Mutation(() => Boolean, { name: 'removeStreamThumbnail' })
	public async removeStreamThumbnail(@Authorized() user: User) {
		return this.streamService.removeStreamThumbnail(user)
	}
}
