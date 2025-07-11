import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWorkspaceDto {
  @ApiProperty({
    description: 'The name of the workspace',
    example: 'My Company',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @MinLength(1, { message: 'Workspace name cannot be empty' })
  @MaxLength(100, { message: 'Workspace name cannot exceed 100 characters' })
  name!: string;

  @ApiPropertyOptional({
    description: 'Optional description of the workspace',
    example: 'Main workspace for company projects',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Description cannot exceed 500 characters' })
  description?: string;
}
