import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAnnouncementDto, CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { startOfDay, endOfDay } from 'date-fns';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateEventDto) {
    return this.prisma.event.create({
      data: {
        title: dto.title,
        description: dto.description,
        location: dto.location,
        type: dto.type,
        capacity: dto.capacity,

        sessions: {
          create: dto.sessions.map((session) => ({
            start: new Date(session.start),
            end: new Date(session.end),
          })),
        },
      },
      include: {
        sessions: true,
      },
    });
  }

  async findAll() {
    return this.prisma.event.findMany({
      include: { sessions: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUpcomingEvents() {
    return this.prisma.event.findMany({
      where: {
        sessions: {
          some: {
            start: { gte: new Date() },
          },
        },
      },
      include: {
        sessions: { orderBy: { start: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getEventsByDate(date: Date) {
    return this.prisma.event.findMany({
      where: {
        sessions: {
          some: {
            start: {
              gte: startOfDay(date),
              lte: endOfDay(date),
            },
          },
        },
      },
      include: {
        sessions: { orderBy: { start: 'asc' } },
      },
    });
  }

  // ANNOUNCEMENT
  async createAnnouncement(userId: string, dto: CreateAnnouncementDto) {
    return this.prisma.announcement.create({
      data: {
        ...dto,
        authorId: userId,
      },
    });
  }

  async getAnnouncement(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        cellId: true,
        communityId: true,
        districtId: true,
        zoneId: true,
        // Handle the arrays for many-to-many relations
        departments: { select: { id: true } },
        teams: { select: { id: true } },
        smallGroups: { select: { id: true } },
      },
    });

    if (!user) throw new NotFoundException('User not found');

    // Flatten everything into one array of IDs
    const targetIds = [
      user.cellId,
      user.communityId,
      user.districtId,
      user.zoneId,
      ...user.departments.map((d) => d.id),
      ...user.teams.map((t) => t.id),
      ...user.smallGroups.map((g) => g.id),
    ].filter(Boolean) as string[];

    return this.prisma.announcement.findMany({
      where: {
        OR: [{ scope: 'GENERAL' }, { targetId: { in: targetIds } }],
      },
      include: {
        author: {
          select: { firstName: true, lastName: true, image: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} event`;
  }

  update(id: number, updateEventDto: UpdateEventDto) {
    return `This action updates a #${id} event`;
  }

  remove(id: number) {
    return `This action removes a #${id} event`;
  }
}
