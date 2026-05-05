import { Module } from '@nestjs/common';
import { WorkforceService } from './workforce.service';
import { WorkforceController } from './workforce.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [WorkforceController],
  providers: [WorkforceService],
})
export class WorkforceModule {}
