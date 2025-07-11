import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsEnum, IsUUID } from 'class-validator';
import { type UUID } from '@fubs/shared';

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
}
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

interface Task {
  projectId: UUID;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: UUID;
  dueDate?: string;
  createdAt: string;
}


export class CreateTaskDto implements Task {
  @ApiProperty({ description: 'ID of the project that the task is being created', type: String, example: 'project-12312' })
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  projectId: UUID;

  @ApiProperty({ description: 'Title of the task', type: String, example: 'Implement authentication' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Description of the task', type: String, example: 'Implement JWT authentication for the application', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Status of the task', enum: TaskStatus, example: TaskStatus.TODO })
  @IsNotEmpty()
  @IsEnum(TaskStatus)
  status: TaskStatus;

  @ApiProperty({ description: 'Priority of the task', enum: TaskPriority, example: TaskPriority.MEDIUM })
  @IsNotEmpty()
  @IsEnum(TaskPriority)
  priority: TaskPriority;

  @ApiProperty({ description: 'ID of the user assigned to the task', type: String, example: 'user-12312', required: false })
  @IsOptional()
  @IsString()
  @IsUUID()
  assignedTo?: UUID;

  @ApiProperty({ description: 'Due date of the task in ISO format', type: String, example: '2023-10-01T00:00:00Z', required: false })
  @IsOptional()
  @IsString()
  dueDate?: string;

  @ApiProperty({ description: 'Creation date of the task in ISO format', type: String, example: '2023-09-01T00:00:00Z' })
  @IsNotEmpty()
  @IsString()
  createdAt: string;
}
