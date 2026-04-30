// import { Injectable } from '@nestjs/common';
// import { CreateNotificationDto } from './dto/create-notification.dto';
// import { UpdateNotificationDto } from './dto/update-notification.dto';

// @Injectable()
// export class NotificationsService {
//   create(createNotificationDto: CreateNotificationDto) {
//     return 'This action adds a new notification';
//   }

//   findAll() {
//     return `This action returns all notifications`;
//   }

//   findOne(id: number) {
//     return `This action returns a #${id} notification`;
//   }

//   update(id: number, updateNotificationDto: UpdateNotificationDto) {
//     return `This action updates a #${id} notification`;
//   }

//   remove(id: number) {
//     return `This action removes a #${id} notification`;
//   }
// }

// apps/api/src/modules/notifications/notification.service.ts
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { NotificationType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectQueue('notifications') private readonly notifyQueue: Queue,
    private prisma: PrismaService,
  ) {}

  // Queue a new notification (Producer)
  // apps/api/src/modules/notifications/notification.service.ts

  async createNotification(data: {
    recipientId: string;
    senderId?: string;
    title: string;
    message?: string;
    type: NotificationType;
    link?: string;
  }) {
    await this.notifyQueue.add('send-notification', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 4000,
      },
      removeOnComplete: {
        count: 100,
        age: 60 * 60 * 24,
      },
      removeOnFail: {
        count: 500,
        age: 60 * 60 * 24 * 7,
      },
    });
  }

  // Fetch for the UI
  async getUserNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { recipientId: userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { sender: { select: { firstName: true, image: true } } },
    });
  }

  // Mark as read
  async markAsRead(notificationId: string) {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }
}

// async notifyGroupApplication(applicantName: string, leaderId: string, groupName: string, appId: string) {
//     return this.createNotification({
//       recipientId: leaderId,
//       title: 'New Group Application',
//       message: `${applicantName} has requested to join ${groupName}.`,
//       type: 'REQUEST',
//       link: `/admin/workforce/applications/${appId}`,
//     });
//   }

//   async notifyApproval(userId: string, groupName: string, groupId: string) {
//     return this.createNotification({
//       recipientId: userId,
//       title: 'Application Approved! 🎉',
//       message: `Congratulations, you have been approved for ${groupName}.`,
//       type: 'REQUEST',
//       link: `/dashboard/workforce/${groupId}/onboarding`,
//     });
//   }

//   async notifyMessage(recipientId: string, senderId: string, senderName: string, text: string) {
//     return this.createNotification({
//       recipientId,
//       senderId,
//       title: `Message from ${senderName}`,
//       message: text.length > 50 ? `${text.substring(0, 50)}...` : text,
//       type: 'MESSAGE',
//       link: `/dashboard/messages`,
//     });
//   }

// apps/api/src/modules/groups/groups.service.ts

// async approveUser(applicationId: string) {
//   const app = await this.prisma.groupApplication.update({
//     where: { id: applicationId },
//     data: { status: 'APPROVED' },
//     include: { group: true, user: true }
//   });

//   // Just one clean line!
//   await this.notificationService.notifyApproval(
//     app.userId,
//     app.group.name,
//     app.groupId
//   );

//   return { success: true };
// }
