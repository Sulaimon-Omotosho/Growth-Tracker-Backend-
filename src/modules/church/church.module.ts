import { Module } from '@nestjs/common';
import { ChurchService } from './church.service';
import { ChurchController } from './church.controller';

@Module({
  providers: [ChurchService],
  controllers: [ChurchController]
})
export class ChurchModule {}
