import { Markup } from 'telegraf'

export const BUTTONS = {
	authSuccess: Markup.inlineKeyboard([
		[
			Markup.button.callback('📜 My subscriptions', 'follows'),
			Markup.button.callback('👤 View profile', 'me')
		],
		[Markup.button.url('🌐 Website', 'https://streamly.com')]
	]),
	profile: Markup.inlineKeyboard([
		Markup.button.url(
			'⚙ Settings',
			'https://streamly.com/dashboard/settings'
		)
	])
}
