import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { SmallGroupsService } from './small-groups.service';
import { CreateSmallGroupDto } from './dto/create-small-group.dto';
import { UpdateSmallGroupDto } from './dto/update-small-group.dto';

@Controller('small-groups')
export class SmallGroupsController {
  constructor(private readonly smallGroupsService: SmallGroupsService) {}

  @Post(':id/join')
  async joinCell(@Req() req: any, @Param('id') cellId: string) {
    const userId = req.user.id;
    return this.smallGroupsService.joinCell(userId, cellId);
  }

  @Get()
  findAll() {
    return this.smallGroupsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.smallGroupsService.findOne(+id);
  }

  @Patch('onboarding/:participantId/extend')
  async extendOnboarding(
    @Param('participantId') participantId: string,
    @Body('weeks') weeks: 2 | 4,
  ) {
    return this.smallGroupsService.extendOnboarding(participantId, weeks);
  }

  @Patch('onboarding/:participantId/approve')
  async approveMember(@Param('participantId') participantId: string) {
    return this.smallGroupsService.approveMember(participantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.smallGroupsService.remove(+id);
  }
}
