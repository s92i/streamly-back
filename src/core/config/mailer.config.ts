import type { MailerOptions } from '@nestjs-modules/mailer'
import { ConfigService } from '@nestjs/config'

export function getMailerConfig(configService: ConfigService): MailerOptions {
	return {
		transport: {
			host: configService.getOrThrow<string>('MAIL_HOST'),
			port: configService.getOrThrow<number>('MAIL_PORT'),
			secure: false,
			auth: {
				user: configService.getOrThrow<string>('MAIL_LOGIN'),
				pass: configService.getOrThrow<string>('MAIL_PASSWORD')
			},
			tls: {
				rejectUnauthorized: false
			}
		},
		defaults: {
			from: `"${configService.getOrThrow('SENDER_NAME')}" <${configService.getOrThrow('SENDER_EMAIL')}>`
		}
	}
}
