import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Request, Response } from 'express';
import { Roles } from './decorators/roles.decorators';
import { Role } from 'src/common/enum';
import {
  GoogleDto,
  LoginDto,
  RegisterDto,
  UpdateRoleDto,
} from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  private setAuthCookies(
    res: Response,
    tokens: { accessToken: string; refreshToken: string },
  ) {
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60,
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 3,
    });
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const data = await this.auth.login(loginDto.email, loginDto.password);
    this.setAuthCookies(res, data);
    return { user: data.user };
  }

  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const data = await this.auth.register(
      registerDto.email,
      registerDto.password,
    );
    this.setAuthCookies(res, data);
    return { user: data.user };
  }

  @Post('google')
  async google(
    @Body('token') googleDto: GoogleDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const data = await this.auth.googleAuth(googleDto.token);
    this.setAuthCookies(res, data);
    return { user: data.user };
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) throw new UnauthorizedException('No Refresh Token');

    const data = await this.auth.refresh(refreshToken);
    res.cookie('accessToken', data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1 * 60 * 60 * 1000,
    });

    return { success: true };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return { message: 'Logged out' };
  }

  @Patch('users/:id/role')
  @Roles(Role.CAMPUS_PASTOR, Role.PASTOR)
  updateRole(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.auth.updateRole(id, updateRoleDto.role);
  }

  @Get('health')
  check() {
    return {
      status: 'ok',
      service: 'auth-api',
      timestamp: new Date().toISOString(),
    };
  }
}
