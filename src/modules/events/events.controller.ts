import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateAnnouncementDto, CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt/jwt.guard';

@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  @Get('by-date')
  async getByDate(@Query('date') date: string) {
    const parsedDate = new Date(date);
    return this.eventsService.getEventsByDate(parsedDate);
  }

  @Get('upcoming')
  async getUpcoming() {
    return this.eventsService.getUpcomingEvents();
  }

  // ANNOUNCEMENT
  @Post('leadership/announcement')
  leaderAnnouncement(
    @Req() requestAnimationFrame,
    @Body() dto: CreateAnnouncementDto,
  ) {
    return this.eventsService.createAnnouncement(
      requestAnimationFrame.user.id,
      dto,
    );
  }

  @Get('my-announcements')
  getMyAnnouncements(@Req() req: any) {
    return this.eventsService.getAnnouncement(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(+id, updateEventDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventsService.remove(+id);
  }
}
