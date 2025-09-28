import { Field, ID, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class UserModel {
	@Field(() => ID)
	public id: string

	@Field(() => String)
	public email: string

	@Field(() => String)
	public password: string

	@Field(() => String)
	public username: string

	@Field(() => String)
	public displayName: string

	@Field(() => String, { nullable: true })
	public avatar: string

	@Field(() => String, { nullable: true })
	public bio: string

	@Field(() => Date)
	public createdAt: string

	@Field(() => Date)
	public updatedAt: string
}
