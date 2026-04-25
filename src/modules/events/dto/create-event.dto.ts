import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsArray,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AnnouncementScope, EventType, Priority } from '@prisma/client';

class SessionDto {
  @IsDateString()
  start: string;

  @IsDateString()
  end: string;
}

export class CreateEventDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsEnum(EventType)
  type: EventType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  capacity?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SessionDto)
  sessions: SessionDto[];
}

export class CreateAnnouncementDto {
  @IsString()
  title!: string;

  @IsString()
  content!: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsEnum(AnnouncementScope)
  scope!: AnnouncementScope;

  @IsOptional()
  @IsString()
  targetId?: string;

  @IsEnum(Priority)
  priority!: Priority;
}
