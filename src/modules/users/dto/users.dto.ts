import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsDateString()
  @IsOptional()
  dob?: string;

  @IsEnum(['MALE', 'FEMALE'])
  @IsOptional()
  gender?: 'MALE' | 'FEMALE';

  @IsString()
  @IsOptional()
  about?: string;
}
