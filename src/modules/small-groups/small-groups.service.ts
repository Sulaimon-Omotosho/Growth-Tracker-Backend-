import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSmallGroupDto } from './dto/create-small-group.dto';
import { UpdateSmallGroupDto } from './dto/update-small-group.dto';

import { addWeeks } from 'date-fns';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class SmallGroupsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async joinCell(userId: string, cellId: string) {
    const cell = await this.prisma.cell.findUnique({
      where: { id: cellId },
      include: { onboardingRoom: true },
    });

    // if (participant.user.cellId) {
    //   throw new BadRequestException('User already belongs to a cell');
    // }

    if (!cell || !cell.onboardingRoom) {
      throw new NotFoundException('Cell or its Onboarding Room not found.');
    }

    const existingParticipant =
      await this.prisma.onboardingParticipant.findUnique({
        where: {
          userId_onboardingRoomId: {
            userId,
            onboardingRoomId: cell.onboardingRoom.id,
          },
        },
      });

    if (existingParticipant) {
      throw new ConflictException('You have already applied to this cell.');
    }

    const participant = await this.prisma.onboardingParticipant.create({
      data: {
        userId,
        onboardingRoomId: cell.onboardingRoom.id,
        expectedEndDate: addWeeks(new Date(), 4),
        status: 'ONBOARDING',
      },
    });

    const recipientIds = [cell.leaderId, userId].filter((id): id is string =>
      Boolean(id),
    );

    await this.notificationsService.createNotification({
      recipientIds,
      senderId: userId,
      title: 'New Onboarding Applicant',
      message: `Onboarding process started for ${cell.name}. Probation period: 4 weeks.`,
      type: 'REQUEST',
    });

    return participant;
  }

  // Onboarding
  async extendOnboarding(participantId: string, weeks: 2 | 4) {
    const participant = await this.prisma.onboardingParticipant.findUnique({
      where: { id: participantId },
      include: {
        onboardingRoom: {
          include: {
            cell: {
              select: {
                name: true,
                leader: {
                  select: { id: true, firstName: true, lastName: true },
                },
              },
            },
            department: { select: { name: true } },
          },
        },
      },
    });

    if (!participant) throw new NotFoundException('Participant not found');

    const newEndDate = addWeeks(participant.expectedEndDate, weeks);

    await this.prisma.onboardingParticipant.update({
      where: { id: participantId },
      data: {
        expectedEndDate: newEndDate,
        extensionWeeks: { increment: weeks },
        status: 'EXTENDED',
      },
    });

    // Notify Applicant
    await this.notificationsService.createNotification({
      recipientIds: [participant.userId],
      title: 'Onboarding Extended',
      message: `Your onboarding for ${participant.onboardingRoom.cell?.name} has been extended by ${weeks} weeks.`,
      type: 'ANNOUNCEMENT',
    });
  }

  async approveMember(participantId: string) {
    return this.prisma.$transaction(async (tx) => {
      const participant = await tx.onboardingParticipant.findUnique({
        where: { id: participantId },
        include: {
          onboardingRoom: {
            include: {
              cell: { include: { users: true } },
            },
          },
          user: true,
        },
      });

      if (!participant) {
        throw new NotFoundException('Participant not found');
      }
      const cell = participant.onboardingRoom.cell;

      await tx.user.update({
        where: { id: participant.userId },
        data: {
          cellId: cell?.id,
          communityId: cell?.communityId,
          zoneId: cell?.zoneId,
        },
      });

      await tx.onboardingParticipant.update({
        where: { id: participantId },
        data: { status: 'APPROVED' },
      });

      const existingMemberIds = cell?.users.map((m) => m.id) || [];
      const recipients = Array.from(
        new Set(
          [cell?.leaderId, participant.userId, ...existingMemberIds].filter(
            (id): id is string => Boolean(id),
          ),
        ),
      );

      await this.notificationsService.createNotification({
        recipientIds: recipients,
        title: 'New Cell Member',
        message: `${participant.user.firstName} has successfully completed onboarding and is now a member of ${cell?.name}!`,
        type: 'ANNOUNCEMENT',
      });

      return { success: true };
    });
  }

  async onboardingRoom(id: string) {
    if (!id) throw new ForbiddenException('No room found');

    const room = await this.prisma.onboardingRoom.findUnique({
      where: { id: id },
      include: {
        cell: true,
        department: true,
      },
    });
    return room;
  }

  create(createSmallGroupDto: CreateSmallGroupDto) {
    return 'This action adds a new smallGroup';
  }

  findAll() {
    return `This action returns all smallGroups`;
  }

  findOne(id: number) {
    return `This action returns a #${id} smallGroup`;
  }

  update(id: number, updateSmallGroupDto: UpdateSmallGroupDto) {
    return `This action updates a #${id} smallGroup`;
  }

  remove(id: number) {
    return `This action removes a #${id} smallGroup`;
  }
}
