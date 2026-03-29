import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

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

  // Me
  async getMe(user: any) {
    if (!user.id) throw new ForbiddenException('Unauthenticated');

    const found = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: {
        cell: true,
        departments: true,
        growthRecord: true,
      },
    });

    if (!found) throw new NotFoundException('User not found');
    return found;
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
  async updateMe(user: any, body: any) {
    if (!user?.id) throw new ForbiddenException();

    const { username } = body;

    if (username) {
      const existing = await this.prisma.user.findUnique({
        where: { username },
      });

      if (existing && existing.id !== user.id) {
        throw new ForbiddenException('Username already taken');
      }
    }

    return this.prisma.user.update({
      where: { id: user.id },
      data: {
        ...body,
        dob: body.dob ? new Date(body.dob) : undefined,
      },
      select: {
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        phone: true,
        gender: true,
        dob: true,
        about: true,
      },
    });
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

    // const newAuthRole = allowedRoles.includes(role) ? 'ADMIN' : 'USER';

    // await axios.patch(
    //   `${process.env.AUTH_SERVICE_URL}/auth/users/${updated.authId}/role`,
    //   { role: newAuthRole },
    //   {
    //     headers: {
    //       Authorization: token,
    //     },
    //   },
    // );

    return updated;
  }
}
