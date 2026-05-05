import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SmallGroupsService } from './small-groups.service';
import { CreateSmallGroupDto } from './dto/create-small-group.dto';
import { UpdateSmallGroupDto } from './dto/update-small-group.dto';

@Controller('small-groups')
export class SmallGroupsController {
  constructor(private readonly smallGroupsService: SmallGroupsService) {}

  @Post()
  create(@Body() createSmallGroupDto: CreateSmallGroupDto) {
    return this.smallGroupsService.create(createSmallGroupDto);
  }

  @Get()
  findAll() {
    return this.smallGroupsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.smallGroupsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSmallGroupDto: UpdateSmallGroupDto,
  ) {
    return this.smallGroupsService.update(+id, updateSmallGroupDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.smallGroupsService.remove(+id);
  }
}
