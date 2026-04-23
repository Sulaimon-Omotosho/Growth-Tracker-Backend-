import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/common/enum';

type JwtPayload = {
  sub: string;
  role: string;
};

type GoogleUser = {
  email: string;
  given_name: string;
  family_name: string;
  picture: string;
};

const roleHierarchy = [
  'MEMBER',
  'CELL',
  'ZONE',
  'HOD',
  'DISTRICT',
  'TEAM',
  'PASTOR',
  'CAMPUS_PASTOR',
];

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  // TOKEN
  private async generateTokens(user: { id: string; role: string }) {
    const payload: JwtPayload = {
      sub: user.id,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '1h',
      }),
      this.jwt.signAsync(
        { sub: user.id },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: '3d',
        },
      ),
    ]);
    return { accessToken, refreshToken };
  }

  // LOGIN
  async login(email: string, password: string) {
    if (!email || !password) {
      throw new UnauthorizedException('Missing credentials');
    }

    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const valid = await bcrypt.compare(password, user.password!);
    if (!valid) {
      throw new UnauthorizedException('Invalid password');
    }

    const tokens = await this.generateTokens(user);

    return {
      user: { id: user.id, email: user.email, role: user.role },
      ...tokens,
    };
  }

  // REGISTER
  async register(email: string, password: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });

    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const hashed = await bcrypt.hash(password, 13);
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashed,
        role: 'MEMBER',
      },
    });

    const tokens = await this.generateTokens(user);

    return {
      user: { id: user.id, email: user.email, role: user.role },
      ...tokens,
    };
  }

  // GOOGLE AUTH
  // Login
  async googleAuth(googleToken: string) {
    const googleUser = await this.verifyGoogleToken(googleToken);
    if (!googleUser.email) {
      throw new UnauthorizedException('Google auth failed');
    }

    let user = await this.prisma.user.findUnique({
      where: { email: googleUser.email },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: googleUser.email,
          firstName: googleUser.given_name,
          lastName: googleUser.family_name,
          image: googleUser.picture,
          provider: 'google',
          role: 'MEMBER',
        },
      });
    }

    const tokens = await this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        image: user.image,
      },
      ...tokens,
    };
  }

  // Verify
  private async verifyGoogleToken(token: string): Promise<GoogleUser> {
    const res = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new UnauthorizedException('Invalid Google token');
    }

    return res.json();
  }

  // REFRESH TOKEN

  async refreshTokens(userId: string, refreshToken: string) {
    try {
      const payload = await this.jwt.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      if (userId !== payload.sub) {
        throw new UnauthorizedException('Invalid token owner');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) throw new UnauthorizedException('Access Denied');

      return await this.generateTokens(user);
    } catch (e) {
      throw new UnauthorizedException('Refresh token invalid');
    }
  }

  // ROLE UPDATE
  // async updateRole(userId: string, role: any) {
  //   return this.prisma.user.update({
  //     where: { id: userId },
  //     data: { role },
  //   });
  // }
  async updateRole(adminId: string, targetId: string, newRole: Role) {
    const requester = await this.prisma.user.findUnique({
      where: { id: adminId },
    });
    if (!requester) throw new UnauthorizedException();

    const allowedRoles = [
      'ZONE',
      'HOD',
      'DISTRICT',
      'TEAM',
      'PASTOR',
      'CAMPUS_PASTOR',
    ];
    if (!allowedRoles.includes(requester.role)) {
      throw new ForbiddenException(
        'Your role does not have permission to manage users.',
      );
    }

    const requesterRank = roleHierarchy.indexOf(requester.role);
    const targetRank = roleHierarchy.indexOf(newRole);
    if (targetRank >= requesterRank) {
      throw new ForbiddenException(
        'You cannot assign a role higher than or equal to your own.',
      );
    }

    return this.prisma.user.update({
      where: { id: targetId },
      data: { role: newRole },
    });
  }

  // HEALTH
  async health() {
    return {
      status: 'ok',
      service: 'auth-service',
      timestamp: new Date().toISOString(),
    };
  }
}
