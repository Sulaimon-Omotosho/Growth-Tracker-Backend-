import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { isNegative } from 'class-validator';
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

  // Check Name Availability
  async checkTeamName(name: string) {
    const count = await this.prisma.churchTeam.count({
      where: {
        name: { equals: name, mode: 'insensitive' },
      },
    });
    return { available: count === 0 };
  }

  async checkDeptName(name: string, churchTeamId: string) {
    const count = await this.prisma.department.count({
      where: {
        name: { equals: name, mode: 'insensitive' },
        churchTeamId: churchTeamId,
      },
    });
    return { available: count === 0 };
  }

  async checkDistName(name: string) {
    const count = await this.prisma.district.count({
      where: {
        name: { equals: name, mode: 'insensitive' },
      },
    });
    return { available: count === 0 };
  }

  async checkCommName(name: string, districtId: string) {
    const count = await this.prisma.community.count({
      where: {
        name: { equals: name, mode: 'insensitive' },
        districtId: districtId,
      },
    });
    return { available: count === 0 };
  }

  async checkZoneName(name: string, communityId: string) {
    const count = await this.prisma.zone.count({
      where: {
        name: { equals: name, mode: 'insensitive' },
        communityId: communityId,
      },
    });
    return { available: count === 0 };
  }

  async checkCellName(name: string, communityId: string) {
    const count = await this.prisma.cell.count({
      where: {
        name: { equals: name, mode: 'insensitive' },
        communityId: communityId,
      },
    });
    return { available: count === 0 };
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
  // Search All Zones
  async searchAllZones(query: string) {
    return this.prisma.zone.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
      take: 20, // At most 20 as requested
      include: {
        community: { select: { name: true } },
      },
    });
  }

  // Search Cell
  async searchCell(data: { q?: string; communityId: string }) {
    const { q, communityId } = data;

    return this.prisma.cell.findMany({
      where: {
        communityId: communityId,
        name: {
          contains: q || '',
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        name: true,
        address: true,
        leader: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      take: 10,
    });
  }

  // Search Small Group
  async searchGroups(query: string) {
    if (!query) return [];

    return this.prisma.smallGroup.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            interests: {
              some: {
                name: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
            },
          },
        ],
      },
      take: 10,
      include: {
        interests: {
          select: {
            name: true,
          },
        },
        leader: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  // Create Team
  async addTeam(data: any) {
    const { name, leaderId, description } = data;

    const existingTeam = await this.prisma.churchTeam.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    });

    if (existingTeam) {
      throw new ConflictException(
        `A team with the name "${name}" already exists.`,
      );
    }

    await this.validateLeader(leaderId);

    return this.prisma.churchTeam.create({
      data: { name, leaderId, description },
    });
  }

  // Create Department
  async addDepartment(data: any) {
    const { name, leaderId, churchTeamId, email, description } = data;

    const existingDept = await this.prisma.department.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
        churchTeamId: churchTeamId,
      },
    });

    if (existingDept) {
      throw new ConflictException(
        `A department with the name "${name}" already exists in this team.`,
      );
    }

    await this.validateLeader(leaderId);

    return this.prisma.department.create({
      data: { name, leaderId, description, churchTeamId, email },
    });
  }

  // Create District
  async addDistrict(data: any) {
    const { name, leaderId } = data;

    const existingName = await this.prisma.district.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    });

    if (existingName) {
      throw new ConflictException(
        `A district with the name "${name}" already exists.`,
      );
    }

    await this.validateLeader(leaderId);

    return this.prisma.district.create({
      data: { name, leaderId },
    });
  }

  // Create Community
  async addCommunity(data: any) {
    const { name, leaderId, districtId } = data;

    const existingName = await this.prisma.community.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
        districtId: districtId,
      },
    });

    if (existingName) {
      throw new ConflictException(
        `A community with the name "${name}" already exists in this district.`,
      );
    }

    await this.validateLeader(leaderId);

    return this.prisma.community.create({
      data: { name, leaderId, districtId },
    });
  }

  // Create Zone
  async addZone(data: any) {
    const { name, leaderId, communityId } = data;

    const existingName = await this.prisma.zone.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
        communityId: communityId,
      },
    });

    if (existingName) {
      throw new ConflictException(
        `A zone with the name "${name}" already exists in this community.`,
      );
    }

    await this.validateLeader(leaderId);

    return this.prisma.zone.create({
      data: { name, leaderId, communityId },
    });
  }

  // Create Cell
  async addCell(data: any) {
    const { name, isOnline, leaderId, communityId, zoneId, address } = data;

    const existingName = await this.prisma.cell.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
        communityId: communityId,
      },
    });

    if (existingName) {
      throw new ConflictException(
        `A cell with the name "${name}" already exists in this community.`,
      );
    }

    await this.validateLeader(leaderId);

    return this.prisma.cell.create({
      data: {
        name,
        isOnline,
        leader: { connect: { id: leaderId } },
        zone: { connect: { id: zoneId } },
        community: { connect: { id: communityId } },
        address: address
          ? {
              create: {
                street: address.street,
                city: address.city,
                state: address.state,
                country: address.country,
                zipCode: address.zipCode,
              },
            }
          : undefined,
      },
      include: { address: true },
    });
  }

  //Create A Small Group
  async addSmallGroup(data: any) {
    const { name, description, leaderId, interests } = data;
    try {
      return await this.prisma.smallGroup.create({
        data: {
          name,
          description,
          leaderId,
          interests: {
            connectOrCreate: (interests || []).map((interestName) => {
              const cleanName = interestName.toLowerCase().trim();
              return {
                where: { name: cleanName },
                create: { name: cleanName },
              };
            }),
          },
        },
        include: {
          interests: true,
          leader: {
            select: {
              firstName: true,
              lastName: true,
              image: true,
            },
          },
        },
      });
    } catch (error) {
      throw new Error(
        'Failed to create small group. Please check your inputs.',
      );
    }
  }

  // Create A Course
  async createCourseWithSessions(dto: any) {
    const { title, description, category, sessions } = dto;

    if (!sessions || sessions.length === 0) {
      throw new BadRequestException('A course must have at least one session.');
    }

    try {
      return await this.prisma.course.create({
        data: {
          title,
          description,
          category,
          totalSessions: sessions.length,
          sessions: {
            create: sessions.map((session: any, index: number) => ({
              title: session.title,
              description: session.description || '',
              order: index + 1,
              maxGrade: session.maxGrade || 100,
              passGrade: session.passGrade || 50,
            })),
          },
        },
        include: {
          sessions: true,
        },
      });
    } catch (error) {
      console.error('Course Creation Error:', error);
      throw new BadRequestException(
        'Could not create course. Ensure titles are unique.',
      );
    }
  }

  // Join Cell
  async joinCell(userId: string, cellId: string) {
    const cell = await this.prisma.cell.findUnique({
      where: { id: cellId },
      select: { communityId: true, zoneId: true },
    });

    if (!cell) {
      throw new NotFoundException('The requested Cell does not exist.');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        cellId: cellId,
        communityId: cell.communityId,
        zoneId: cell.zoneId,
      },
    });
  }

  // Join Small Group
  async joinSmallGroup(smallGroupId: string, userId: string) {
    try {
      return await this.prisma.smallGroup.update({
        where: { id: smallGroupId },
        data: {
          members: {
            connect: { id: userId },
          },
        },
      });
    } catch (error) {
      throw new NotFoundException('The specified small group was not found.');
    }
  }

  // Join Department
  async joinDept(userId: string, deptId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: { departments: true },
        },
      },
    });

    if (user!._count.departments >= 3) {
      throw new BadRequestException('You can only join max 3 departments.');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        departments: {
          // disconnect: {id: deptId},
          connect: { id: deptId },
        },
      },
      include: {
        departments: {
          include: { churchTeam: true },
        },
      },
    });
  }

  // Get All Teams
  async getTeams() {
    return this.prisma.churchTeam.findMany({
      include: {
        leader: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        _count: {
          select: { departments: true },
        },
      },
    });
  }

  // Get All Departments
  async getDepartments(teamId?: string) {
    return this.prisma.department.findMany({
      where: teamId ? { churchTeamId: teamId } : {},
      include: {
        leader: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        churchTeam: {
          select: { name: true },
        },
        _count: {
          select: { members: true },
        },
      },
    });
  }

  // Get My Departments
  async getUserDepartments(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        departments: {
          include: {
            leader: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                image: true,
              },
            },
            _count: {
              select: { members: true },
            },
          },
        },
        _count: {
          select: {
            departments: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.departments;
  }

  // Get Department Members
  async getDepartmentMembers(deptId?: string) {
    return this.prisma.department.findUnique({
      where: { id: deptId },
      select: {
        members: true,
      },
    });
  }

  // Get All Districts
  async getDistricts() {
    return this.prisma.district.findMany({
      include: {
        leader: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        _count: {
          select: { communities: true },
        },
      },
    });
  }

  // Get All Communities
  async getCommunities(districtId?: string) {
    return this.prisma.community.findMany({
      where: districtId ? { districtId: districtId } : {},
      include: {
        leader: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        district: {
          select: { name: true },
        },
        _count: {
          select: { users: true, cells: true },
        },
      },
    });
  }

  // Get All Zones
  async getZones(communityId?: string) {
    return this.prisma.zone.findMany({
      where: communityId ? { communityId: communityId } : {},
      include: {
        leader: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        community: {
          select: { name: true },
        },
        _count: {
          select: { users: true },
        },
      },
    });
  }

  // Get All Cells
  async getCells(communityId?: string) {
    return this.prisma.cell.findMany({
      where: communityId ? { communityId: communityId } : {},
      include: {
        address: true,
        leader: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        community: {
          select: { name: true },
        },
        zone: {
          select: { name: true },
        },
        _count: {
          select: { users: true },
        },
      },
    });
  }

  // Get All Cells by Zones
  async getCellsByZone(zoneId: string) {
    return this.prisma.cell.findMany({
      where: { zoneId },
      include: {
        address: true,
        leader: {
          select: { firstName: true, lastName: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  // Get My Cell Data
  async getUserCell(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        cell: {
          include: {
            address: true,
            leader: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
                email: true,
                image: true,
              },
            },
            community: {
              include: {
                district: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            zone: {
              select: {
                name: true,
              },
            },
            users: {
              select: {
                id: true,
                username: true,
                image: true,
              },
            },
            _count: { select: { users: true } },
          },
        },
      },
    });

    if (!user?.cell) {
      throw new NotFoundException('You are not currently assigned to a cell');
    }

    return user.cell;
  }

  // Get Cell Members
  async getCellMembers(cellId?: string) {
    return this.prisma.cell.findUnique({
      where: { id: cellId },
      select: {
        users: true,
      },
    });
  }

  // Get My Small Groups
  async getUserSmallGroups(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        smallGroups: {
          include: {
            leader: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                image: true,
              },
            },
            _count: {
              select: { members: true },
            },
          },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');

    return user.smallGroups;
  }

  // Get Courses
  async getAllCourses() {
    return this.prisma.course.findMany({
      where: {
        isActive: true,
      },
      include: {
        _count: {
          select: {
            sessions: true,
            enrollments: true,
          },
        },
        // sessions: { select: { title: true, order: true } }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Course by id
  async getUniqueCourse(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        sessions: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return course;
  }

  // Delete Teams
  async deleteTeams(ids: string[]) {
    return this.prisma.churchTeam.deleteMany({
      where: {
        id: { in: ids },
      },
    });
  }
}
