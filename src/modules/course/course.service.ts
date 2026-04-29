import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CourseService {
  constructor(private prisma: PrismaService) {}

  // Create A Course
  async createCourseWithSessions(dto: any) {
    const { title, description, category, sessions } = dto;

    if (!sessions || sessions.length === 0) {
      throw new BadRequestException('A course must have at least one session.');
    }

    try {
      return await this.prisma.course.create({
        data: {
          title,
          description,
          category,
          totalSessions: sessions.length,
          sessions: {
            create: sessions.map((session: any, index: number) => ({
              title: session.title,
              description: session.description || '',
              order: index + 1,
              maxGrade: session.maxGrade || 100,
              passGrade: session.passGrade || 50,
            })),
          },
        },
        include: {
          sessions: true,
        },
      });
    } catch (error) {
      console.error('Course Creation Error:', error);
      throw new BadRequestException(
        'Could not create course. Ensure titles are unique.',
      );
    }
  }
  /**
   * ADMIN: Create or Update a course with its sessions
   */
  async upsertCourse(data: any) {
    const { id, sessions, ...courseData } = data;

    return this.prisma.$transaction(async (tx) => {
      const course = id
        ? await tx.course.update({ where: { id }, data: courseData })
        : await tx.course.create({ data: courseData });

      // Handle Sessions: Delete existing ones and recreate to maintain order
      // Or use a more complex diffing logic if IDs are stable
      if (sessions) {
        await tx.courseSession.deleteMany({ where: { courseId: course.id } });
        await tx.courseSession.createMany({
          data: sessions.map((s: any, index: number) => ({
            ...s,
            courseId: course.id,
            order: index + 1,
          })),
        });
      }

      return course;
    });
  }

  // Get Courses
  async getAllCourses() {
    return this.prisma.course.findMany({
      where: {
        isActive: true,
      },
      include: {
        _count: {
          select: {
            sessions: true,
            enrollments: true,
          },
        },
        // sessions: { select: { title: true, order: true } }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Course by id
  async getUniqueCourse(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        sessions: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return course;
  }
  /**
   * ADMIN: Mark Attendance & Grade
   */
  async markAttendance(userId: string, sessionId: string, grade: number) {
    const session = await this.prisma.courseSession.findUnique({
      where: { id: sessionId },
    });
    if (!session) throw new NotFoundException('Session not found');

    const isPassed = grade >= session.passGrade;

    return this.prisma.sessionAttendance.upsert({
      where: { userId_sessionId: { userId, sessionId } },
      update: { grade, isPassed },
      create: { userId, sessionId, grade, isPassed },
    });
  }
  /**
   * CLIENT: Get course with student-specific progress
   */
  async getCourseForStudent(courseId: string, userId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        sessions: { orderBy: { order: 'asc' } },
        enrollments: { where: { userId } },
      },
    });

    if (!course) throw new NotFoundException('Course not found');

    // Fetch attendance for this user for all sessions in this course
    const attendance = await this.prisma.sessionAttendance.findMany({
      where: {
        userId,
        session: { courseId },
      },
    });

    // Merge sessions with attendance status
    const curriculum = course.sessions.map((session) => {
      const record = attendance.find((a) => a.sessionId === session.id);
      return {
        ...session,
        isCompleted: record?.isPassed || false,
        grade: record?.grade || null,
        attendedAt: record?.attendedAt || null,
      };
    });

    const completedCount = curriculum.filter((s) => s.isCompleted).length;
    const progress =
      course.sessions.length > 0
        ? Math.round((completedCount / course.sessions.length) * 100)
        : 0;

    return {
      ...course,
      sessions: curriculum,
      stats: {
        progress,
        completedCount,
        totalSessions: course.sessions.length,
      },
    };
  }

  /**
   * CLIENT: Enroll user
   */
  async enrollUser(userId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) throw new NotFoundException('Course not found');

    // Check Prerequisite
    if (course.prerequisiteId) {
      const prereqEnrollment = await this.prisma.courseEnrollment.findUnique({
        where: { userId_courseId: { userId, courseId: course.prerequisiteId } },
      });
      if (prereqEnrollment?.status !== 'COMPLETED') {
        throw new BadRequestException('Prerequisite course not completed');
      }
    }

    return this.prisma.courseEnrollment.upsert({
      where: { userId_courseId: { userId, courseId } },
      update: {},
      create: {
        userId,
        courseId,
        status: 'IN_PROGRESS',
      },
    });
  }

  // Start a Course
  // async courseEnrollUser(userId: string, courseId: string) {
  //   const course = await this.prisma.course.findUnique({
  //     where: { id: courseId },
  //     include: { sessions: true },
  //   });

  //   if (!course) {
  //     throw new NotFoundException(`Course with ID ${courseId} not found`);
  //   }

  //   const existing = await this.prisma.courseEnrollment.findUnique({
  //     where: {
  //       userId_courseId: { userId, courseId },
  //     },
  //   });

  //   if (existing) {
  //     throw new BadRequestException('You are already enrolled in this track');
  //   }

  //   return this.prisma.courseEnrollment.create({
  //     data: {
  //       userId,
  //       courseId,
  //       status: 'IN_PROGRESS',
  //       sessionProgress: {
  //         create: course.sessions.map((session) => ({
  //           sessionId: session.id,
  //           status: 'NOT_STARTED',
  //         })),
  //       },
  //     },
  //   });
  // }

  // create(createCourseDto: CreateCourseDto) {
  //   return 'This action adds a new course';
  // }

  // findAll() {
  //   return `This action returns all course`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} course`;
  // }

  // update(id: number, updateCourseDto: UpdateCourseDto) {
  //   return `This action updates a #${id} course`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} course`;
  // }
}
