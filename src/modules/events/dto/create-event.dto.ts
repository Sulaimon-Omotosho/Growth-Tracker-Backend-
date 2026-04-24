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
import { EventType } from '@prisma/client';

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
