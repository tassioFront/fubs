import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '@fubs/shared';

@UseGuards(JwtAuthGuard)
@ApiTags('projects')
@ApiBearerAuth()
@Controller('api/workspaces/:workspaceId/projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project in a workspace' })
  @ApiResponse({ status: 201, description: 'Project created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Workspace not found' })
  create(
    @Param('workspaceId') workspaceId: string,
    @Body() createProjectDto: CreateProjectDto,
    @Request() req: AuthenticatedRequest
  ) {
    const userId = req.user.id;
    return this.projectsService.create(workspaceId, createProjectDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all projects in a workspace' })
  @ApiResponse({ status: 200, description: 'List of projects' })
  @ApiResponse({ status: 404, description: 'Workspace not found' })
  findAll(
    @Param('workspaceId') workspaceId: string,
    @Request() req: AuthenticatedRequest
  ) {
    const userId = req.user.id;
    return this.projectsService.findAll(workspaceId, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a project by ID' })
  @ApiResponse({ status: 200, description: 'Project details' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    const userId = req.user.id;
    return this.projectsService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a project' })
  @ApiResponse({ status: 200, description: 'Project updated successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @Request() req: AuthenticatedRequest
  ) {
    const userId = req.user.id;
    return this.projectsService.update(id, updateProjectDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a project' })
  @ApiResponse({ status: 200, description: 'Project deleted successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    const userId = req.user.id;
    return this.projectsService.remove(id, userId);
  }
}
