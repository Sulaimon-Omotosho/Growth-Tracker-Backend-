import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { Role } from 'src/common/enum';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class GoogleDto {
  @IsString()
  token: string;
}

export class RefreshDto {
  @IsString()
  refreshToken: string;
}

export class UpdateRoleDto {
  @IsEnum(Role)
  role: Role;
}
