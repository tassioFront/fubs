import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectStatus } from '@prisma/client-sugarfoot';

export class CreateProjectDto {
  @ApiProperty({
    description: 'The name of the project',
    example: 'Website Redesign',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @MinLength(1, { message: 'Project name cannot be empty' })
  @MaxLength(100, { message: 'Project name cannot exceed 100 characters' })
  name!: string;

  @ApiPropertyOptional({
    description: 'Optional description of the project',
    example: 'Q3 2025 redesign project',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Description cannot exceed 500 characters' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Status of the project',
    enum: ProjectStatus,
    example: ProjectStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(ProjectStatus, {
    message: 'Status must be ACTIVE, COMPLETED, or ARCHIVED',
  })
  status?: ProjectStatus;
}
