import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'

import { NotificationsService } from '../notifications/notifications.service'

import { CronService } from './cron.service'

@Module({
	imports: [ScheduleModule.forRoot()],
	providers: [CronService, NotificationsService]
})
export class CronModule {}
