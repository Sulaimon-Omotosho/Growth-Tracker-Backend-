import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SmallGroupsService } from './small-groups.service';
import { CreateSmallGroupDto } from './dto/create-small-group.dto';
import { UpdateSmallGroupDto } from './dto/update-small-group.dto';
import { JwtAuthGuard } from '../auth/guards/jwt/jwt.guard';

@Controller('small-groups')
@UseGuards(JwtAuthGuard)
export class SmallGroupsController {
  constructor(private readonly smallGroupsService: SmallGroupsService) {}

  @Post('join/:id')
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

  @Get('onboarding/room/:id')
  onboardingRoom(@Param('id') id: string) {
    return this.smallGroupsService.onboardingRoom(id);
  }

  @Patch('onboarding/extend/:participantId')
  async extendOnboarding(
    @Param('participantId') participantId: string,
    @Body('weeks') weeks: 2 | 4,
  ) {
    return this.smallGroupsService.extendOnboarding(participantId, weeks);
  }

  @Patch('onboarding/approve/:participantId')
  async approveMember(@Param('participantId') participantId: string) {
    return this.smallGroupsService.approveMember(participantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.smallGroupsService.remove(+id);
  }
}
