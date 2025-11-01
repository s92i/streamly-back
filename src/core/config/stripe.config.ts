import { ConfigService } from '@nestjs/config'

import { TypeStripeOptions } from '@/src/modules/libs/stripe/types/Stripe.types'

export function getStripeConfig(
	configService: ConfigService
): TypeStripeOptions {
	return {
		apiKey: configService.getOrThrow<string>('STRIPE_SECRET_KEY'),
		config: {
			apiVersion: '2025-10-29.clover'
		}
	}
}
