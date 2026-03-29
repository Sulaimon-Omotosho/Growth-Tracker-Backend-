import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChurchService {
  constructor(private prisma: PrismaService) {}

  private async validateLeader(leaderId: string) {
    const pastor = await this.prisma.user.findUnique({
      where: { id: leaderId },
    });

    if (!pastor) {
      throw new NotFoundException('Pastor not found');
    }
  }

  // Search Team
  async searchTeam(q: string) {
    return this.prisma.churchTeam.findMany({
      where: {
        name: {
          contains: q || '',
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        name: true,
      },
      take: 10,
    });
  }

  // Search District
  async searchDistrict(q: string) {
    return this.prisma.district.findMany({
      where: {
        name: {
          contains: q || '',
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        name: true,
      },
      take: 10,
    });
  }

  // Search Community
  async searchCommunity(q: string) {
    return this.prisma.community.findMany({
      where: {
        name: {
          contains: q || '',
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        name: true,
      },
      take: 10,
    });
  }

  // Search Zone
  async searchZone(data: any) {
    const { q, communityId } = data;

    return this.prisma.zone.findMany({
      where: {
        AND: [
          {
            name: {
              contains: q || '',
              mode: 'insensitive',
            },
          },
          {
            communityId: communityId,
          },
        ],
      },
      select: {
        id: true,
        name: true,
      },
      take: 10,
    });
  }

  // Create Team
  async addTeam(data: any) {
    const { name, leaderId, description } = data;

    await this.validateLeader(leaderId);

    return this.prisma.churchTeam.create({
      data: { name, leaderId, description },
    });
  }

  // Create Department
  async addDepartment(data: any) {
    const { name, leaderId, churchTeamId, email, description } = data;

    await this.validateLeader(leaderId);

    return this.prisma.department.create({
      data: { name, leaderId, description, churchTeamId, email },
    });
  }

  // Create District
  async addDistrict(data: any) {
    const { name, leaderId } = data;

    await this.validateLeader(leaderId);

    return this.prisma.district.create({
      data: { name, leaderId },
    });
  }

  // Create Community
  async addCommunity(data: any) {
    const { name, leaderId, districtId } = data;

    await this.validateLeader(leaderId);

    return this.prisma.community.create({
      data: { name, leaderId, districtId },
    });
  }

  // Create Zone
  async addZone(data: any) {
    const { name, leaderId, communityId } = data;

    await this.validateLeader(leaderId);

    return this.prisma.zone.create({
      data: { name, leaderId, communityId },
    });
  }

  // Create Cell
  async addCell(data: any) {
    const { name, leaderId, communityId, zoneId } = data;

    await this.validateLeader(leaderId);

    return this.prisma.cell.create({
      data: { name, leaderId, zoneId, communityId },
    });
  }

  // Get All Teams
  async getTeams() {
    return this.prisma.churchTeam.findMany({
      include: {
        leader: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  }
}
