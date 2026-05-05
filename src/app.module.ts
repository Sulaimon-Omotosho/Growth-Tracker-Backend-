import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health/health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ChurchModule } from './modules/church/church.module';
import { UsersModule } from './modules/users/users.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './modules/auth/guards/roles/roles.guard';
import { MessagesModule } from './modules/messages/messages.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { EventsModule } from './modules/events/events.module';
import { ManagementModule } from './modules/management/management.module';
import { CourseModule } from './modules/course/course.module';
import { BullModule } from '@nestjs/bullmq';
import { WorkforceModule } from './modules/workforce/workforce.module';
import { SmallGroupsModule } from './modules/small-groups/small-groups.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    BullModule.forRoot({
      connection: {
        // host: process.env.REDIS_HOST || 'localhost',
        // port: parseInt(process.env.REDIS_PORT as any) || 6379,
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        tls: {
          rejectUnauthorized: false, // Required for some serverless Redis providers
        },
      },
    }),
    PrismaModule,
    AuthModule,
    ChurchModule,
    UsersModule,
    MessagesModule,
    NotificationsModule,
    EventsModule,
    ManagementModule,
    CourseModule,
    WorkforceModule,
    SmallGroupsModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
