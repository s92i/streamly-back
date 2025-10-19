import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class TotpModel {
	@Field(() => String)
	public qrcodeurl: string

	@Field(() => String)
	public secret: string
}
