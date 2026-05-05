import { Controller } from '@nestjs/common';
import { WorkforceService } from './workforce.service';

@Controller('workforce')
export class WorkforceController {
  constructor(private readonly workforceService: WorkforceService) {}
}
