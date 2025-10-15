import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { render } from '@react-email/components'
import axios from 'axios'

import { VerificationTemplate } from './templates/verification.template'

@Injectable()
export class MailService {
	public constructor(private readonly configService: ConfigService) {}

	public async sendVerificationToken(email: string, token: string) {
		const domain = this.configService.getOrThrow<string>('ALLOWED_ORIGIN')
		const html = await render(VerificationTemplate({ domain, token }))

		return this.sendMail(email, 'Account verification', html)
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
