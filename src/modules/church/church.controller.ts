import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  Req,
  Request,
} from '@nestjs/common';
import { ChurchService } from './church.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from '../auth/guards/jwt/jwt.guard';

@Controller('church')
@UseGuards(JwtAuthGuard)
export class ChurchController {
  constructor(private readonly churchService: ChurchService) {}

  @Get('teams/check-team-name')
  async checkTeam(@Query('name') name: string) {
    return this.churchService.checkTeamName(name);
  }

  @Get('teams/check-dept-name')
  async checkDept(
    @Query('name') name: string,
    @Query('churchTeamId') churchTeamId: string,
  ) {
    return this.churchService.checkDeptName(name, churchTeamId);
  }

  @Get('teams/check-dist-name')
  async checkDist(@Query('name') name: string) {
    return this.churchService.checkDistName(name);
  }

  @Get('teams/check-comm-name')
  async checkComm(
    @Query('name') name: string,
    @Query('districtId') districtId: string,
  ) {
    return this.churchService.checkCommName(name, districtId);
  }

  @Get('teams/check-zone-name')
  async checkZone(
    @Query('name') name: string,
    @Query('communityId') communityId: string,
  ) {
    return this.churchService.checkZoneName(name, communityId);
  }

  @Get('teams/check-cell-name')
  async checkCell(
    @Query('name') name: string,
    @Query('communityId') communityId: string,
  ) {
    return this.churchService.checkCellName(name, communityId);
  }

  @Get('search/team')
  searchTeam(@Query('q') q: string) {
    return this.churchService.searchTeam(q);
  }

  @Get('search/district')
  searchDistrict(@Query('q') q: string) {
    return this.churchService.searchDistrict(q);
  }

  @Get('search/community')
  searchCommunity(@Query('q') q: string) {
    return this.churchService.searchCommunity(q);
  }

  @Get('search/zone')
  searchZone(@Query('q') q: string, @Query('communityId') communityId: string) {
    return this.churchService.searchZone({ q, communityId });
  }

  @Get('search/all/zones')
  async searchAllZones(@Query('q') query: string) {
    return this.churchService.searchAllZones(query);
  }

  @Get('zones/:zoneId/cells')
  async getCellsByZone(@Param('zoneId') zoneId: string) {
    return this.churchService.getCellsByZone(zoneId);
  }

  @Get('search/cell')
  searchCell(@Query('q') q: string, @Query('communityId') communityId: string) {
    return this.churchService.searchCell({ q, communityId });
  }

  @Get('search/small-groups')
  async searchSmallGroup(@Query('q') query: string) {
    return this.churchService.searchGroups(query);
  }

  @Post('add/team')
  addTeam(@Body() body: any) {
    return this.churchService.addTeam(body);
  }

  @Post('add/department')
  addDepartment(@Body() body: any) {
    return this.churchService.addDepartment(body);
  }

  @Post('add/district')
  addDistrict(@Body() body: any) {
    return this.churchService.addDistrict(body);
  }

  @Post('add/community')
  addCommunity(@Body() body: any) {
    return this.churchService.addCommunity(body);
  }

  @Post('add/zone')
  addZone(@Body() body: any) {
    return this.churchService.addZone(body);
  }

  @Post('add/cell')
  addCell(@Body() body: any) {
    return this.churchService.addCell(body);
  }

  @Post('add/small-group')
  addSmallGroup(@Body() body: any) {
    return this.churchService.addSmallGroup(body);
  }

  @Post('add/course')
  // @Roles('ADMIN', 'PASTOR')
  async createCourse(@Body() createCourseDto: any) {
    return this.churchService.createCourseWithSessions(createCourseDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('members/join/cell')
  async joinCell(@Body('cellId') cellId: string, @Req() req: any) {
    return this.churchService.joinCell(req.user.id, cellId);
  }

  @Post('members/join/small-group')
  async joinSmallGroup(@Body() body: { smallGroupId: string }, @Request() req) {
    return this.churchService.joinSmallGroup(body.smallGroupId, req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('members/join/dept')
  async joinDept(@Body('deptId') deptId: string, @Req() req: any) {
    return this.churchService.joinDept(req.user.id, deptId);
  }

  @Get('get/teams')
  @UseGuards(AuthGuard('jwt'))
  getTeams() {
    return this.churchService.getTeams();
  }

  @Get('get/departments')
  @UseGuards(AuthGuard('jwt'))
  getDepartments(@Query('teamId') teamId?: string) {
    return this.churchService.getDepartments(teamId);
  }

  @Get('get/my-departments')
  async getMyDepartments(@Req() req: any) {
    return this.churchService.getUserDepartments(req.user.id);
  }

  @Get('get/departments/:id/members')
  @UseGuards(AuthGuard('jwt'))
  getDeptMembers(@Param('id') id?: string) {
    return this.churchService.getDepartmentMembers(id);
  }

  @Get('get/districts')
  @UseGuards(AuthGuard('jwt'))
  getDistricts() {
    return this.churchService.getDistricts();
  }

  @Get('get/communities')
  @UseGuards(AuthGuard('jwt'))
  getCommunities(@Query('districtId') districtId?: string) {
    return this.churchService.getCommunities(districtId);
  }

  @Get('get/zones')
  @UseGuards(AuthGuard('jwt'))
  getZones(@Query('communityId') communityId?: string) {
    return this.churchService.getZones(communityId);
  }

  @Get('get/cells')
  getCells(@Query('communityId') communityId?: string) {
    return this.churchService.getCells(communityId);
  }

  @Get('get/my-cell')
  async getMyCell(@Req() req: any) {
    return this.churchService.getUserCell(req.user.id);
  }

  @Get('get/cells/:id/members')
  @UseGuards(AuthGuard('jwt'))
  getCellsMembers(@Param('id') id?: string) {
    return this.churchService.getCellMembers(id);
  }

  @Get('get/my-groups')
  async getMyGroups(@Req() req: any) {
    return this.churchService.getUserSmallGroups(req.user.id);
  }

  @Get('courses/all')
  async getAllCourses() {
    return this.churchService.getAllCourses();
  }

  @Get('courses/:id')
  async getCourse(@Param('id') id: string) {
    return this.churchService.getUniqueCourse(id);
  }

  @Delete('teams/bulk-delete')
  @UseGuards(AuthGuard('jwt'))
  async deleteTeams(@Body('ids') ids: string[]) {
    return this.churchService.deleteTeams(ids);
  }
}
