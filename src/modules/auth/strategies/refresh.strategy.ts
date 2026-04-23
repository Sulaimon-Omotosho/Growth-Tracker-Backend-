import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: (req: Request) => {
        return req.cookies?.['refreshToken'];
      },
      secretOrKey: process.env.JWT_REFRESH_SECRET!,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const refreshToken = req.cookies?.['refreshToken'];
    if (!refreshToken) throw new UnauthorizedException();

    return { id: payload.sub, refreshToken };
  }
}
