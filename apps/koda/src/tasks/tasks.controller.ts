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

import { type AuthenticatedRequest, JwtAuthGuard } from '@fubs/shared';
import { type UUID } from '@fubs/shared';
import { UpdateTaskDto } from './dto/update-task.dto';
import { WorkspaceMemberGuard } from '../auth/guards/workspace-member.guard';
@UseGuards(JwtAuthGuard)
@ApiTags('tasks')
@ApiBearerAuth()
@Controller('projects/:projectId/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @UseGuards(WorkspaceMemberGuard)
  @ApiOperation({ summary: 'Create a new task in a project' })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async create(
    @Param('projectId') projectId: string,
    @Body() createTaskDto: CreateTaskDto,
    @Request() req: AuthenticatedRequest
  ) {
    const userId = req.user.id;
    return await this.tasksService.create(
      projectId as UUID,
      createTaskDto,
      userId
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks for a project' })
  @ApiResponse({ status: 200, description: 'List of tasks' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async findAllByProjectId(@Param('projectId') projectId: string) {
    return await this.tasksService.findAllByProjectId(projectId as UUID);
  }

  @Patch(':taskId/assign/:assignedUserId')
  @ApiOperation({ summary: 'Assign a task to a user' })
  @ApiResponse({ status: 200, description: 'Task assigned successfully' })
  @ApiResponse({ status: 404, description: 'Task or user not found' })
  async assignTask(
    @Param('taskId') taskId: string,
    @Param('assignedUserId') assignedUserId: string
  ) {
    return await this.tasksService.assignTaskToUser(
      taskId as UUID,
      assignedUserId
    );
  }
  @Patch(':taskId/unassign/:assignedUserId')
  @ApiOperation({ summary: 'Unassign a task from a user' })
  @ApiResponse({ status: 200, description: 'Task unassigned successfully' })
  @ApiResponse({ status: 404, description: 'Task or user not found' })
  async unassignTask(
    @Param('taskId') taskId: string,
    @Param('assignedUserId') assignedUserId: string
  ) {
    return await this.tasksService.unassignTask(
      taskId as UUID,
      assignedUserId as UUID
    );
  }

  @Delete(':taskId')
  @ApiOperation({ summary: 'Delete a task' })
  @ApiResponse({ status: 200, description: 'Task deleted successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async deleteTask(@Param('taskId') taskId: string) {
    return await this.tasksService.deleteTask(taskId as UUID);
  }

  @Patch(':taskId')
  @ApiOperation({ summary: 'Update a task' })
  @ApiResponse({ status: 200, description: 'Task updated successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async updateTask(
    @Param('taskId') taskId: string,
    @Body() updateTaskDto: UpdateTaskDto
  ) {
    return await this.tasksService.updateTask(taskId as UUID, updateTaskDto);
  }
}
