import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { WorkforceService } from './workforce.service';
import { JwtAuthGuard } from '../auth/guards/jwt/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('workforce')
export class WorkforceController {
  constructor(private readonly workforceService: WorkforceService) {}

  @Post()
  async create(@Body() createDto: any) {
    return this.workforceService.addDepartment(createDto);
  }

  @Post(':id/join')
  async join(@Req() req: any, @Param('id') deptId: string) {
    const userId = req.user.id;
    return this.workforceService.joinDept(userId, deptId);
  }

  @Patch('onboarding/:participantId/approve')
  async approveMember(@Param('participantId') participantId: string) {
    return this.workforceService.approveDepartmentMember(participantId);
  }

  @Patch('onboarding/:participantId/extend')
  async extendStay(
    @Param('participantId') participantId: string,
    @Body('weeks') weeks: 2 | 4,
  ) {
    return this.workforceService.extendOnboarding(participantId, weeks);
  }
}
