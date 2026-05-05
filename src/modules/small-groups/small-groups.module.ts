import { Module } from '@nestjs/common';
import { SmallGroupsService } from './small-groups.service';
import { SmallGroupsController } from './small-groups.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [SmallGroupsController],
  providers: [SmallGroupsService],
})
export class SmallGroupsModule {}
