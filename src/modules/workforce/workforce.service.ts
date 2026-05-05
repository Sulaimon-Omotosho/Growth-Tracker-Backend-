import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { addWeeks } from 'date-fns';

@Injectable()
export class WorkforceService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  private async validateLeader(leaderId: string) {
    const pastor = await this.prisma.user.findUnique({
      where: { id: leaderId },
    });

    if (!pastor) {
      throw new NotFoundException('Pastor not found');
    }
  }

  async addDepartment(data: any) {
    const { name, leaderId, churchTeamId, email, description } = data;

    const existingDept = await this.prisma.department.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        churchTeamId: churchTeamId,
      },
    });

    if (existingDept) {
      throw new ConflictException(
        `A department with the name "${name}" already exists.`,
      );
    }

    await this.validateLeader(leaderId);

    return this.prisma.$transaction(async (tx) => {
      const department = await tx.department.create({
        data: {
          name,
          leaderId,
          description,
          churchTeamId,
          email,
          onboardingRoom: { create: {} },
        },
        include: {
          onboardingRoom: true,
          churchTeam: true, // To get the church team leaderId
        },
      });

      // Notify Hierarchy: Department Leader and Church Team Leader
      const recipients = [leaderId];
      if (department.churchTeam.leaderId) {
        recipients.push(department.churchTeam.leaderId);
      }

      await this.notificationsService.createNotification({
        recipientIds: recipients,
        title: 'New Department Established',
        message: `The ${name} department has been created and its onboarding room is active.`,
        type: 'REQUEST',
      });

      return department;
    });
  }

  async joinDept(userId: string, deptId: string) {
    const department = await this.prisma.department.findUnique({
      where: { id: deptId },
      include: {
        onboardingRoom: true,
        _count: { select: { members: true } },
      },
    });

    if (!department || !department.onboardingRoom) {
      throw new NotFoundException(
        'Department or its onboarding room not found.',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { _count: { select: { departments: true } } },
    });

    // Limit check
    if (user!._count.departments >= 3) {
      throw new BadRequestException(
        'You can only belong to a maximum of 3 departments.',
      );
    }

    // Create Onboarding Record (Probation)
    const participant = await this.prisma.onboardingParticipant.create({
      data: {
        userId,
        onboardingRoomId: department.onboardingRoom.id,
        expectedEndDate: addWeeks(new Date(), 6),
        status: 'ONBOARDING',
      },
      include: { user: true },
    });

    // Notify: Department Leader and the Applicant
    await this.notificationsService.createNotification({
      recipientIds: [department.leaderId as string, userId],
      senderId: userId,
      title: 'Department Onboarding Started',
      message: `${participant.user.firstName} has started onboarding for the ${department.name} department.`,
      type: 'REQUEST',
    });

    return participant;
  }

  async extendOnboarding(participantId: string, weeks: 2 | 4) {
    const participant = await this.prisma.onboardingParticipant.findUnique({
      where: { id: participantId },
      include: {
        user: true,
        onboardingRoom: {
          include: {
            department: true,
          },
        },
      },
    });

    if (!participant) {
      throw new NotFoundException('Onboarding participant not found.');
    }

    const currentEndDate = participant.expectedEndDate || new Date();
    const newEndDate = addWeeks(currentEndDate, weeks);

    const updatedParticipant = await this.prisma.onboardingParticipant.update({
      where: { id: participantId },
      data: {
        expectedEndDate: newEndDate,
        status: 'EXTENDED',
      },
    });

    const sourceName = participant.onboardingRoom.department?.name;

    await this.notificationsService.createNotification({
      recipientIds: [participant.userId],
      title: 'Probation Period Extended',
      message: `Your onboarding for ${sourceName} has been extended by ${weeks} weeks. New end date: ${newEndDate.toLocaleDateString()}.`,
      type: 'ANNOUNCEMENT',
    });

    return updatedParticipant;
  }

  async approveDepartmentMember(participantId: string) {
    return this.prisma.$transaction(async (tx) => {
      const participant = await tx.onboardingParticipant.findUnique({
        where: { id: participantId },
        include: {
          onboardingRoom: {
            include: { department: { include: { members: true } } },
          },
          user: true,
        },
      });

      if (!participant || !participant.onboardingRoom.department) {
        throw new NotFoundException('Onboarding session invalid.');
      }

      const dept = participant.onboardingRoom.department;

      await tx.user.update({
        where: { id: participant.userId },
        data: {
          departments: { connect: { id: dept.id } },
        },
      });

      await tx.onboardingParticipant.update({
        where: { id: participantId },
        data: { status: 'APPROVED' },
      });

      const existingMemberIds = dept.members.map((m) => m.id);
      const recipients = Array.from(
        new Set(
          [dept.leaderId, participant.userId, ...existingMemberIds].filter(
            (id): id is string => Boolean(id),
          ),
        ),
      );

      await this.notificationsService.createNotification({
        recipientIds: recipients,
        title: 'Welcome to the Team',
        message: `${participant.user.firstName} ${participant.user.lastName} has successfully joined the ${dept.name} department!`,
        type: 'ANNOUNCEMENT',
      });

      return { success: true };
    });
  }
}
