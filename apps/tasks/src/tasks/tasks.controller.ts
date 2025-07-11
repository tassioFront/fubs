import {
  Controller,
  Post,
  Body,
  Param,
  Request,
  UseGuards,
  Get,
  Delete,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';

import { JwtAuthGuard } from '@fubs/shared';
import { type UUID } from '@fubs/shared';
import { UpdateTaskDto } from './dto/update-task.dto';
interface JwtUser {
  id: string;
}

interface JwtRequest {
  user: JwtUser;
}

@UseGuards(JwtAuthGuard)
@ApiTags('tasks')
@ApiBearerAuth()
@Controller('projects/:projectId/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task in a project' })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async create(
    @Param('projectId') projectId: string,
    @Body() createTaskDto: CreateTaskDto,
    @Request() req: JwtRequest
  ) {
    const userId = req.user.id;
    try {
      return await this.tasksService.create(projectId as UUID, createTaskDto, userId);
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks for a project' })
  @ApiResponse({ status: 200, description: 'List of tasks' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async findAllByProjectId(@Param('projectId') projectId: string) {
    try {
      return await this.tasksService.findAllByProjectId(projectId as UUID);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      throw error;
    }
  }

  @Patch(':taskId/assign/:assignedUserId')
  @ApiOperation({ summary: 'Assign a task to a user' })
  @ApiResponse({ status: 200, description: 'Task assigned successfully' })
  @ApiResponse({ status: 404, description: 'Task or user not found' })
  async assignTask(
    @Param('taskId') taskId: string,
    @Param('assignedUserId') assignedUserId: string,
  ) {
    try {
      return await this.tasksService.assignTaskToUser(taskId as UUID, assignedUserId);
    } catch (error) {
      console.error("Error assigning task:", error);
      throw error;
    }
  }
  @Patch(':taskId/unassign/:assignedUserId')
  @ApiOperation({ summary: 'Unassign a task from a user' })
  @ApiResponse({ status: 200, description: 'Task unassigned successfully' })
  @ApiResponse({ status: 404, description: 'Task or user not found' })
  async unassignTask(
    @Param('taskId') taskId: string,
    @Param('assignedUserId') assignedUserId: string,
  ) {
    try {
      return await this.tasksService.unassignTask(taskId as UUID, assignedUserId as UUID);
    } catch (error) {
      console.error("Error unassigning task:", error);
      throw error;
    }
  }

  @Delete(':taskId')
  @ApiOperation({ summary: 'Delete a task' })
  @ApiResponse({ status: 200, description: 'Task deleted successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async deleteTask(@Param('taskId') taskId: string) {
    try {
      return await this.tasksService.deleteTask(taskId as UUID);
    } catch (error) {
      console.error("Error deleting task:", error);
      throw error;
    }
  }

  @Patch(':taskId')
  @ApiOperation({ summary: 'Update a task' })
  @ApiResponse({ status: 200, description: 'Task updated successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async updateTask(
    @Param('taskId') taskId: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    try {
      return await this.tasksService.updateTask(taskId as UUID, updateTaskDto);
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  }
}
