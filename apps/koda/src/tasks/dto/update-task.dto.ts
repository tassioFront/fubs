import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, IsEnum, IsUUID } from 'class-validator';
import { type UUID } from '@fubs/shared';

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}
export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export class UpdateTaskDto {
  @ApiProperty({ description: 'Title of the task', type: String, example: 'Implement authentication', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'Description of the task', type: String, example: 'Implement JWT authentication for the application', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Status of the task', enum: TaskStatus, example: TaskStatus.TODO, required: false })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiProperty({ description: 'Priority of the task', enum: TaskPriority, example: TaskPriority.MEDIUM, required: false })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiProperty({ description: 'ID of the user assigned to the task', type: String, example: 'user-12312', required: false })
  @IsOptional()
  @IsString()
  @IsUUID()
  assignedTo?: UUID;

  @ApiProperty({ description: 'Due date of the task in ISO format', type: String, example: '2023-10-01T00:00:00Z', required: false })
  @IsOptional()
  @IsString()
  dueDate?: string;
}
