import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { render } from '@react-email/components'
import axios from 'axios'

import type { SessionMetadata } from '@/src/shared/types/session-metadata.types'

import { AccountDeletionTemplate } from './templates/account-deletion.template'
import { DeactivateTemplate } from './templates/deactivate.template'
import { PasswordRecoveryTemplate } from './templates/password-recovery.template'
import { VerificationTemplate } from './templates/verification.template'

@Injectable()
export class MailService {
	public constructor(private readonly configService: ConfigService) {}

	public async sendVerificationToken(email: string, token: string) {
		const domain = this.configService.getOrThrow<string>('ALLOWED_ORIGIN')
		const html = await render(VerificationTemplate({ domain, token }))

		return this.sendMail(email, 'Account verification', html)
	}

	public async sendPasswordResetToken(
		email: string,
		token: string,
		metadata: SessionMetadata
	) {
		const domain = this.configService.getOrThrow<string>('ALLOWED_ORIGIN')
		const html = await render(
			PasswordRecoveryTemplate({ domain, token, metadata })
		)

		return this.sendMail(email, 'Password reset', html)
	}

	public async sendDeactivationToken(
		email: string,
		token: string,
		metadata: SessionMetadata
	) {
		const html = await render(DeactivateTemplate({ token, metadata }))

		return this.sendMail(email, 'Account deactivation', html)
	}

	public async sendAccountDeletion(email: string) {
		const domain = this.configService.getOrThrow<string>('ALLOWED_ORIGIN')
		const html = await render(AccountDeletionTemplate({ domain }))

		return this.sendMail(email, 'Account deletion', html)
	}

	private async sendMail(to: string, subject: string, html: string) {
		const apiKey = this.configService.getOrThrow<string>('BREVO_API_KEY')
		const senderEmail =
			this.configService.getOrThrow<string>('SENDER_EMAIL')
		const senderName = this.configService.getOrThrow<string>('SENDER_NAME')

		const response = await axios.post(
			'https://api.brevo.com/v3/smtp/email',
			{
				sender: { name: senderName, email: senderEmail },
				to: [{ email: to }],
				subject,
				htmlContent: html
			},
			{
				headers: {
					'api-key': apiKey,
					'Content-Type': 'application/json',
					accept: 'application/json'
				}
			}
		)

		return response.data
	}
}
