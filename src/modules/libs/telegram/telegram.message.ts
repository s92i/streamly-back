import type { SponsorshipPlan, User } from '@/prisma/generated'
import type { SessionMetadata } from '@/src/shared/types/session-metadata.types'

export const MESSAGES = {
	welcome:
		`<b>👋 Welcome to Streamly</b>\n\n` +
		`To receive notifications and enhance your experience using the platform, let's link your Telegram account with TeaStream.\n\n` +
		`Click the button below and go to the <b>Notifications</b> section to complete the setup.`,
	authSuccess: `🎉 You have successfully authorized, and your Telegram account has been linked with Streamly`,
	invalidToken: `❌ Invalid or expired token.`,
	profile: (user: User, followersCount: number) =>
		`<b>👤 User Profile:</b>\n\n` +
		`🧑 Username: <b>${user.username}</b>\n` +
		`📧 Email: <b>${user.email}</b>\n` +
		`💜 Number of followers: <b>${followersCount}</b>\n` +
		`📖 About: <b>${user.bio || 'Not specified'}</b>\n\n` +
		`🛠️ Click the button below to go to profile settings.`,
	follows: (user: User) =>
		`📺 <a href="https://streamly.com/${user.username}">${user.username}</a>`,
	resetPassword: (token: string, metadata: SessionMetadata) =>
		`<b>🔐 Password Reset</b>\n\n` +
		`You have requested a password reset for your account on <b>Streamly</b>.\n\n` +
		`To create a new password, please follow the link below:\n\n` +
		`<b><a href="https://streamly.com/account/recovery/${token}">Reset Password</a></b>\n\n` +
		`📅 <b>Request Date:</b> ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}\n\n` +
		`ℹ️ <b>Request Information:</b>\n\n` +
		`📍 <b>Location:</b> ${metadata.location.country}, ${metadata.location.city}\n` +
		`💻 <b>Operating System:</b> ${metadata.device.os}\n` +
		`🌐 <b>Browser:</b> ${metadata.device.browser}\n` +
		`🏚 <b>IP Address:</b> ${metadata.ip}\n\n` +
		`If you did not make this request, simply ignore this message.\n\n` +
		`Thank you for using <b>Streamly</b> 🚀`,
	deactivate: (token: string, metadata: SessionMetadata) =>
		`<b>⚠ Account Deactivation Request</b>\n\n` +
		`You have initiated the process of deactivating your account on <b>Streamly</b>.\n\n` +
		`To complete the operation, please confirm your request by entering the following confirmation code:\n\n` +
		`🔑 <b>Confirmation Code:</b> ${token}\n` +
		`📅 <b>Request Date:</b> ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}\n\n` +
		`ℹ️ <b>Request Information:</b>\n\n` +
		`📍 <b>Location:</b> ${metadata.location.country}, ${metadata.location.city}\n` +
		`💻 <b>Operating System:</b> ${metadata.device.os}\n` +
		`🌐 <b>Browser:</b> ${metadata.device.browser}\n` +
		`🏚 <b>IP Address:</b> ${metadata.ip}\n\n` +
		`⚠️ <b>What happens after deactivation ?</b>\n\n` +
		`1. You will be automatically logged out and lose access to your account.\n` +
		`2. If you do not cancel the deactivation within 7 days, your account will be <b>permanently deleted</b> along with all your information, data, and subscriptions.\n\n` +
		`⏳ <b>Please note:</b> If you change your mind within 7 days, you can contact our support team to restore access to your account before it is completely deleted.\n\n` +
		`After the account is deleted, restoring it will be impossible, and all data will be lost without the possibility of recovery.\n\n` +
		`If you've changed your mind, simply ignore this message — your account will remain active.\n\n` +
		`Thank you for using <b>Streamly</b> We're always happy to see you on our platform and hope you'll stay with us.\n\n` +
		`With respect,\n` +
		`The Streamly team`,
	accountDeleted:
		`<b>⚠️ Your account has been completely deleted.</b>\n\n` +
		`Your account has been fully erased from the Streamly database. All your data and information have been permanently deleted. ❌\n\n` +
		`🔕 You will no longer receive notifications on Telegram or by email.\n\n` +
		`If you wish to return to the platform, you can register again using the following link:\n` +
		`<b><a href="https://streamly.com/account/create">Register on Streamly</a></b>\n\n` +
		`Thank you for being with us! We will always be happy to see you on our platform again. 🚀\n\n` +
		`With respect,\n` +
		`The Streamly team`,
	streamStart: (channel: User) =>
		`🎥 A stream has started on the channel ${channel.displayName}\n\n` +
		`Watch here: <a href="https://streamly.com/${channel.username}">Go to the stream</a>`,
	newFollowing: (follower: User, followersCount: number) =>
		`👤 You have a new follower\n\n` +
		`This user <a href="https://streamly.com/${follower.username}">${follower.displayName}</a>\n\n` +
		`Total number of followers on your channel: ${followersCount}`,
	newSponsorship: (plan: SponsorshipPlan, sponsor: User) =>
		`<b>🎉 New sponsorship!</b>\n\n` +
		`You have received a new sponsorship for the plan <b>${plan.title}</b>\n` +
		`💰 Amount: <b>${plan.price}$</b>\n` +
		`🙋‍♂️ Sponsor: <a href='https://streamly.com/${sponsor.username}'>${sponsor.displayName}</a>\n` +
		`📅 Date of issue: <b>${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</b>`,
	enableTwoFactor:
		`🔐 Ensure your security!\n\n` +
		`Enable two-factor authentication in your <a href="https://streamly.com/dashboard/settings">account settings</a>`,
	verifyChannel:
		`<b>🎉 Congratulations! Your channel has been verified</b>\n\n` +
		`We are pleased to inform you that your channel is now verified, and you have received an official badge.\n\n` +
		`The verification badge confirms the authenticity of your channel and increases viewer trust.\n\n` +
		`Thank you for being with us and continuing to grow your channel with Streamly!`
}
