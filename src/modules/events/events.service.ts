import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
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
