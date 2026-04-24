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
  UseGuards,
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
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from './guards/roles/roles.guard';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  // private setAuthCookies(
  //   res: Response,
  //   tokens: { accessToken: string; refreshToken: string },
  // ) {
  //   res.cookie('accessToken', tokens.accessToken, {
  //     httpOnly: true,
  //     secure: process.env.NODE_ENV === 'production',
  //     sameSite: 'lax',
  //     maxAge: 1000 * 60 * 60,
  //   });

  //   res.cookie('refreshToken', tokens.refreshToken, {
  //     httpOnly: true,
  //     secure: process.env.NODE_ENV === 'production',
  //     sameSite: 'lax',
  //     maxAge: 1000 * 60 * 60 * 24 * 3,
  //   });
  // }

  private setAuthCookies(
    res: Response,
    tokens: { accessToken: string; refreshToken: string },
  ) {
    const isProduction = process.env.NODE_ENV === 'production';

    const cookieOptions: any = {
      httpOnly: true,
      sameSite: isProduction ? 'none' : 'lax',
      secure: isProduction ? true : false,
      path: '/',
    };

    res.cookie('accessToken', tokens.accessToken, {
      ...cookieOptions,
      maxAge: 1000 * 60 * 75,
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      ...cookieOptions,
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
    // @Body('token') googleDto: GoogleDto,
    @Body() googleDto: GoogleDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const data = await this.auth.googleAuth(googleDto.token);
    this.setAuthCookies(res, data);
    return { user: data.user };
  }

  // REFRESH
  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  async refresh(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const user = req.user;
    const tokens = await this.auth.refreshTokens(user.id, user.refreshToken);

    this.setAuthCookies(res, tokens);

    return { success: true };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
    };

    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);
    return { message: 'Logged out' };
  }

  @Patch('users/:id/role')
  @UseGuards(AuthGuard('jwt'))
  updateRole(
    @Param('id') targetId: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @Req() req: any,
  ) {
    return this.auth.updateRole(req.user.id, targetId, updateRoleDto.role);
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
