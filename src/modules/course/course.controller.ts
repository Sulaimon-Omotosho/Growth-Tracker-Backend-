import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { JwtAuthGuard } from '../auth/guards/jwt/jwt.guard';

@Controller('course')
@UseGuards(JwtAuthGuard)
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post('add')
  // @Roles('ADMIN', 'PASTOR')
  async createCourse(@Body() createCourseDto: any) {
    return this.courseService.createCourseWithSessions(createCourseDto);
  }

  @Get('get/all')
  async getAllCourses() {
    return this.courseService.getAllCourses();
  }

  @Get('get/:id')
  async getCourse(@Param('id') id: string) {
    return this.courseService.getUniqueCourse(id);
  }

  @Post('upsert')
  async upsertCourse(@Body() data: any) {
    return this.courseService.upsertCourse(data);
  }

  @Post('grade-attendance')
  async markAttendance(
    @Body('userId') userId: string,
    @Body('sessionId') sessionId: string,
    @Body('grade') grade: number,
  ) {
    return this.courseService.markAttendance(userId, sessionId, grade);
  }

  @Get('available')
  async getAvailable(@Req() req: any) {
    return this.courseService.getAvailableCourses(req.user.id);
  }

  @Get('my-enrollments')
  async getMyEnrollments(@Req() req: any) {
    return this.courseService.getMyEnrollments(req.user.id);
  }

  @Get(':id')
  async getMyCourse(@Param('id') courseId: string, @Req() req: any) {
    return this.courseService.getCourseForStudent(courseId, req.user.id);
  }

  @Post(':id/enroll')
  async enroll(@Param('id') courseId: string, @Req() req: any) {
    return this.courseService.enrollUser(req.user.id, courseId);
  }

  @Get(':id/progress')
  async getCourseProgress(@Param('id') courseId: string, @Req() req: any) {
    const userId = req.user.id;
    return this.courseService.getCourseForStudent(courseId, userId);
  }

  @Post('mark')
  @HttpCode(HttpStatus.OK)
  async markStudentAttendance(
    @Body('userId') userId: string,
    @Body('sessionId') sessionId: string,
    @Body('grade') grade: number,
  ) {
    return this.courseService.markAttendance(userId, sessionId, grade);
  }

  // @Post()
  // create(@Body() createCourseDto: CreateCourseDto) {
  //   return this.courseService.create(createCourseDto);
  // }

  // @Post('enroll')
  // @HttpCode(HttpStatus.CREATED)
  // async enroll(@Req() req: any, @Body('courseId') courseId: string) {
  //   const userId = req.user.id;
  //   return this.courseService.courseEnrollUser(userId, courseId);
  // }

  // @Get()
  // findAll() {
  //   return this.courseService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.courseService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
  //   return this.courseService.update(+id, updateCourseDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.courseService.remove(+id);
  // }
}
