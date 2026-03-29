import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt/jwt.guard';
// import { AuthGuard } from '../auth/guards/jwt.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('search')
  searchUser(@Query('q') q: string) {
    return this.usersService.searchUser(q || '');
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: any) {
    return this.usersService.getMe(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('all')
  getAll(@Req() req: any) {
    return this.usersService.getAll(req.user);
  }

  @Post()
  newUser(@Body() body: any) {
    return this.usersService.createUser(body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateMe(@Req() req: any, @Body() body: any) {
    return this.usersService.updateMe(req.user, body);
  }

  @Get('debug')
  debugUsers() {
    return this.usersService.debugUsers();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getById(@Req() req: any, @Param('id') id: string) {
    return this.usersService.getById(req.user, id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/role')
  updateRole(
    @Req() req: any,
    @Param('id') id: string,
    @Body('role') role: any,
  ) {
    return this.usersService.updateRole(
      req.user,
      id,
      role,
      req.headers.authorization,
    );
  }
}
