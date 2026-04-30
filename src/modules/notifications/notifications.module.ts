// import { Module } from '@nestjs/common';
// import { NotificationsService } from './notifications.service';
// import { NotificationsController } from './notifications.controller';

// @Module({
//   controllers: [NotificationsController],
//   providers: [NotificationsService],
// })
// export class NotificationsModule {}

import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationProcessor } from './notifications.processor';
import { NotificationGateway } from './notifications.gateway';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'notifications',
    }),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationProcessor, NotificationGateway],
  exports: [NotificationsService],
})
export class NotificationsModule {}
