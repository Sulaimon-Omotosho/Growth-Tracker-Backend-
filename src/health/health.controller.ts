// import { Controller, Get } from '@nestjs/common';

// @Controller('health')
// export class HealthController {
//   @Get()
//   check() {
//     return {
//       status: 'ok',
//       service: 'auth-api',
//       timestamp: new Date().toISOString(),
//     };
//   }
// }

import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async check() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        status: 'ok',
        database: 'connected',
        service: 'auth-api',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        database: 'disconnected',
        service: 'auth-api',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
