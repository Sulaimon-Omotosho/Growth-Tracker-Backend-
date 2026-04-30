// notification.processor.ts
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationGateway } from './notifications.gateway';

@Processor('notifications')
export class NotificationProcessor extends WorkerHost {
  constructor(
    private prisma: PrismaService,
    private readonly gateway: NotificationGateway,
  ) {
    super();
  }

  async process(job: Job<any>): Promise<any> {
    const { recipientId, senderId, title, message, type, link } = job.data;

    // Save to DB using your exact schema
    const notification = await this.prisma.notification.create({
      data: {
        recipientId,
        senderId,
        title,
        message,
        type,
        link,
      },
      include: {
        sender: { select: { firstName: true, lastName: true, image: true } },
      },
    });

    // Push to the user's browser in real-time
    this.gateway.sendNotificationToUser(recipientId, notification);

    return notification;
  }
}
