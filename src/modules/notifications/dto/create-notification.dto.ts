export class CreateNotificationDto {}

// create-event.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsDateString,
} from 'class-validator';

export enum EventPriority {
  NORMAL = 'NORMAL',
  URGENT = 'URGENT',
}

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(EventPriority)
  @IsOptional()
  priority?: EventPriority;

  @IsString()
  @IsNotEmpty()
  scope: string;

  @IsString()
  authorId: string; // Likely from your Auth session
}
