import { Body, Controller, Post, UseGuards, UseInterceptors, Param, Get, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

import { CreateTaskDto } from '../dtos/create-task.dto';
import { AppService } from '../app.service';
import { Task } from '@prisma/client';
import { type UUID } from '@fubs/shared/';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@ApiTags('tasks')
@Controller('task')
export class TaskController {
  constructor(private readonly appService: AppService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Task created successfully', type: Task })
  async createTask(@Body() createTaskDto: CreateTaskDto): Promise<Task> {
    return this.appService.createTask(createTaskDto);
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: String, description: 'ID of the task' })
  @ApiOperation({ summary: 'Get a task by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Task retrieved successfully', type: Task })
  async getTaskById(@Param('id') id: UUID): Promise<Task> {
    return this.appService.getTaskById(id);
  }
}
