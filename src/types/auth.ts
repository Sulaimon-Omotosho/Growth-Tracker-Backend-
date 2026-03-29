export class RegisterDto {
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
}

export type Role = 'ADMIN' | 'USER' | 'SUPERVISOR';
