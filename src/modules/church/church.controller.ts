import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ChurchService } from './church.service';

@Controller('church')
export class ChurchController {
  constructor(private readonly churchService: ChurchService) {}

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

  @Post('team')
  addTeam(@Body() body: any) {
    return this.churchService.addTeam(body);
  }

  @Post('department')
  addDepartment(@Body() body: any) {
    return this.churchService.addDepartment(body);
  }

  @Post('district')
  addDistrict(@Body() body: any) {
    return this.churchService.addDistrict(body);
  }

  @Post('community')
  addCommunity(@Body() body: any) {
    return this.churchService.addCommunity(body);
  }

  @Post('zone')
  addZone(@Body() body: any) {
    return this.churchService.addZone(body);
  }

  @Post('cell')
  addCell(@Body() body: any) {
    return this.churchService.addCell(body);
  }

  @Get('allTeams')
  getTeams() {
    return this.churchService.getTeams();
  }
}
