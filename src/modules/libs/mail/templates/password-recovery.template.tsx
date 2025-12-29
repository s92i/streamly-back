import { Body, Head, Heading, Link, Preview, Section, Tailwind, Text } from '@react-email/components'
import { Html } from '@react-email/html'
import type { SessionMetadata } from '@/src/shared/types/session-metadata.types'
import * as React from 'react'

interface PasswordRecoveryTemplateProps {
    domain: string
    token: string
    metadata: SessionMetadata
}

export function PasswordRecoveryTemplate({domain, token, metadata}: PasswordRecoveryTemplateProps) {
    const resetLink = `${domain}/account/recovery/${token}`

    return (
        <Html>
            <Head />
            <Preview>Password reset</Preview>
            <Tailwind>
                <Body className='max-w-2xl mx-auto p-6 bg-slate-50'>
                <Section className='text-center mb-8'>
                        <Heading className='text-3xl text-black font-bold'>Password reset</Heading>
                        <Text className='text-base text-black mt-2'>
                        You requested a password reset for your account.
                        </Text>
                        <Text className='text-base text-black mt-2'>
                        To create a new password, click the link below:
                        </Text>
                        <Link href={resetLink} className='inline-flex justify-center items-center rounded-full text-sm font-medium text-white bg-[#18B9AE] px-5 py-2'>Reset password</Link>
                </Section>
                <Section className='bg-gray-100 rounded-lg p-6 mb-6'>
                    <Heading className='text-xl font-semibold text-[#18B9AE]'>
                    Information about the request:
                    </Heading>
                    <ul className='list-disc list-inside text-black mt-2'>
                        <li>🌍 Location: {metadata.location.country}, {metadata.location.city}</li>
                        <li>📱 Device: {metadata.device.os}</li>
                        <li>🌐 Browser: {metadata.device.browser}</li>
                        <li>💻 IP Address: {metadata.ip}</li>
                    </ul>
                    <Text className='text-gray-600 mt-2'>If you did not initiate this request, please ignore this email.</Text>
                </Section>
                <Section className='text-center mt-8'>
                        <Text className='text-gray-600'>
                        If you have any questions or encounter difficulties, feel free to contact our support service at {' '}
                        <Link href="mailto:contact@streamly-live.click" className='text-[#18B9AE] underline'>contact@streamly-live.click</Link>
                        </Text>
                </Section>
                </Body>
            </Tailwind>
        </Html>
    )
}