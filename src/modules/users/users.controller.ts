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
import { Role } from '@prisma/client';
import { UpdateUserDto } from './dto/users.dto';
import { RolesGuard } from '../auth/guards/roles/roles.guard';
import { Roles } from '../auth/decorators/roles.decorators';
// import { AuthGuard } from '../auth/guards/jwt.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('search')
  searchUser(@Query('q') q: string) {
    return this.usersService.searchUser(q || '');
  }

  @UseGuards(JwtAuthGuard)
  @Get('check/username')
  async checkUsername(@Query('username') username: string, @Req() req: any) {
    if (!username) return { available: true };
    const isTaken = await this.usersService.isUsernameTaken(
      username,
      req.user.id,
    );

    return { available: !isTaken };
  }

  @Get('check/email')
  async checkEmail(@Query('email') email: string, @Req() req: any) {
    if (!email) return { available: true };

    const userId = req.user?.id;

    const isTaken = await this.usersService.isEmailTaken(email, userId);

    return { available: !isTaken };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: any) {
    return this.usersService.getMe(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/groups')
  myGroups(@Req() req: any) {
    return this.usersService.getUserGroups(req.user.id);
  }

  @Get('onboarding/me')
  myOnboardings(@Req() req: any) {
    return this.usersService.getMyOnboardings(req.user.id);
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
  @Patch('updateMe')
  updateMe(@Req() req: any, @Body() dto: UpdateUserDto) {
    const userId = req.user.id || req.user.sub;
    return this.usersService.updateMe(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('address')
  updateAddress(@Req() req: any, @Body() body: any) {
    const userId = req.user.id || req.user.sub;
    return this.usersService.updateAddress(userId, body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('CAMPUS_PASTOR')
  adminUpdateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.updateMe(id, dto);
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

  @UseGuards(JwtAuthGuard)
  @Get('role/pastors')
  async getPastors() {
    return this.usersService.getPastors();
  }

  @UseGuards(JwtAuthGuard)
  @Get('role/leaders')
  async getLeaders() {
    return this.usersService.getLeaders();
  }

  @UseGuards(JwtAuthGuard)
  @Get('role/workers')
  async getWorkers() {
    return this.usersService.getWorkers();
  }

  @UseGuards(JwtAuthGuard)
  @Get('role/members')
  async getMembers() {
    return this.usersService.getMembers();
  }

  @UseGuards(JwtAuthGuard)
  @Get('role/:roleName')
  async getBySpecificRole(@Param('roleName') roleName: Role) {
    return this.usersService.getByRole(roleName);
  }
}
