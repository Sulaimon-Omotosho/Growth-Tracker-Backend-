import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

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

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  // TOKEN
  private generateTokens(user: { id: string; role: string }) {
    const payload: JwtPayload = {
      sub: user.id,
      role: user.role,
    };

    return {
      accessToken: this.jwt.sign(payload, {
        expiresIn: '1h',
      }),
      refreshToken: this.jwt.sign({ sub: user.id }, { expiresIn: '3d' }),
    };
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

    const tokens = this.generateTokens(user);

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

    const tokens = this.generateTokens(user);

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

    const tokens = this.generateTokens(user);

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
  async refresh(refreshToken: string) {
    try {
      const payload = this.jwt.verify<{ sub: string }>(refreshToken);

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) throw new NotFoundException('User not found');

      return {
        accessToken: this.generateTokens(user).accessToken,
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // ROLE UPDATE
  async updateRole(userId: string, role: any) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
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
