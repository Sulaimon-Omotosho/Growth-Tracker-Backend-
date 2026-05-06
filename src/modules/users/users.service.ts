import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dto/users.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Search Users
  async searchUser(q: string) {
    return this.prisma.user.findMany({
      where: {
        OR: [
          { firstName: { contains: q, mode: 'insensitive' } },
          { lastName: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
      take: 10,
    });
  }

  // Check Username Availability
  async isUsernameTaken(
    username: string,
    excludeUserId?: string,
  ): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!user) return false;
    return user.id !== excludeUserId;
  }

  // Check Email Availability
  async isEmailTaken(email: string, excludeId?: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: {
        email: { equals: email, mode: 'insensitive' },
        NOT: excludeId ? { id: excludeId } : undefined,
      },
    });
    return count > 0;
  }

  // Me
  async getMe(user: any) {
    if (!user.id) throw new ForbiddenException('Unauthenticated');

    const found = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: {
        cell: {
          include: {
            leader: true,
          },
        },
        departments: {
          include: {
            leader: true,
            churchTeam: true,
          },
        },
        onboardingParticipations: {
          select: {
            onboardingRoom: {
              include: {
                cell: true,
                department: true,
              },
            },
          },
        },
        zone: true,
        growthRecord: true,
        address: true,
        _count: {
          select: {
            leadsCell: true,
            leadsChurchTeam: true,
            leadsCommunity: true,
            hod: true,
            leadsSubTeam: true,
            districtsLed: true,
            leadsZone: true,
          },
        },
      },
    });

    if (!found) throw new NotFoundException('User not found');
    return found;
  }

  // Onboardings
  async getMyOnboardings(user: any) {
    if (!user.id) throw new ForbiddenException('Unauthenticated');

    const onboardings = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: {
        onboardingParticipations: {
          select: {
            onboardingRoom: {
              include: {
                cell: true,
                department: true,
              },
            },
          },
        },
      },
    });

    if (!onboardings) throw new NotFoundException('Onboardings not found');
    return onboardings;
  }

  // Get User Groups
  async getUserGroups(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        cell: {
          include: {
            users: {
              select: { id: true, image: true, firstName: true },
            },
          },
        },
        departments: {
          include: {
            members: {
              select: { id: true, image: true, firstName: true },
            },
          },
        },
        smallGroups: {
          include: {
            members: {
              select: { id: true, image: true, firstName: true },
            },
          },
        },
      },
    });
  }

  // All Users
  async getAll(user: any) {
    return this.prisma.user.findMany({
      select: { id: true, username: true, email: true, role: true },
    });
  }

  // Create User
  async createUser(data: any) {
    const { email, firstName, lastName, image } = data;

    if (!email) throw new ForbiddenException('Email is required');

    const existing = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existing) throw new ForbiddenException('User already exists');

    return this.prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        image,
        role: 'MEMBER',
      },
    });
  }

  // Update Profile
  async updateMe(userId: string, body: UpdateUserDto) {
    if (!userId) throw new BadRequestException('User ID is required');

    const { username, email, ...rest } = body;

    if (username) {
      const taken = await this.isUsernameTaken(username, userId);

      if (taken) {
        throw new ConflictException('Username is already taken');
      }
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...rest,
        username,
        dob: body.dob ? new Date(body.dob) : undefined,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        phone: true,
        gender: true,
        dob: true,
        about: true,
        role: true,
      },
    });
  }

  // Update Address
  async updateAddress(userId: string, body: any) {
    if (!userId) throw new BadRequestException('User ID is required');

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { addressId: true },
    });

    if (user?.addressId) {
      return this.prisma.address.update({
        where: { id: user.addressId },
        data: body,
      });
    } else {
      return this.prisma.user.update({
        where: { id: userId },
        data: {
          address: {
            create: body,
          },
        },
        include: { address: true },
      });
    }
  }

  // Debug
  async debugUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
      },
    });
  }

  // Get By Id
  async getById(user: any, id: string) {
    // if (user.role !== 'ADMIN') throw new ForbiddenException();

    const found = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!found) throw new NotFoundException('User not found');
    return found;
  }

  // Get Pastors
  async getPastors() {
    return this.prisma.user.findMany({
      where: {
        role: {
          in: [Role.CAMPUS_PASTOR, Role.PASTOR, Role.DISTRICT, Role.TEAM],
        },
      },
    });
  }

  // Get Leaders
  async getLeaders() {
    return this.prisma.user.findMany({
      where: {
        role: { in: [Role.HOD, Role.CELL, Role.ZONE] },
      },
    });
  }

  // Get Workers
  async getWorkers() {
    return this.prisma.user.findMany({
      where: {
        departments: {
          some: {},
        },
      },
      include: {
        departments: {
          select: { name: true },
        },
      },
    });
  }

  // Get Members
  async getMembers() {
    return this.prisma.user.findMany({
      where: {
        departments: {
          none: {},
        },
        role: 'MEMBER',
      },
    });
  }

  // Generic
  async getByRole(role: Role) {
    return this.prisma.user.findMany({
      where: { role },
    });
  }

  // Update Role
  async updateRole(user: any, id: string, role: any, token: string) {
    const allowedRoles = [
      'ADMIN',
      'CAMPUS_PASTOR',
      'PASTOR',
      'TEAM',
      'HOD',
      'DISTRICT',
      'ZONE',
    ];

    if (!allowedRoles.includes(user.role)) {
      throw new ForbiddenException();
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { role },
    });

    return updated;
  }
}
