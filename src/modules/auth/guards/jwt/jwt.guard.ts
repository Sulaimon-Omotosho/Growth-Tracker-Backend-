import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

// {
//   provide: APP_GUARD,
//   useClass: JwtAuthGuard,
// }
