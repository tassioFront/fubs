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
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { WorkspacesService } from './workspaces.service';
import {
  CreateWorkspaceDto,
  WorkspaceResponseDto,
} from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { JwtAuthGuard } from '@fubs/shared';
import type { AuthenticatedRequest } from '@fubs/shared';
import { WorkspacePermissionsByRoleControlGuard } from '../auth/guards/workspace-permissions-by-role.guard';
import { WorkspacePrivilegesGuard } from '../auth/guards/workspace-privileges.guard';

@ApiTags('workspaces')
@ApiBearerAuth()
@UseGuards(
  JwtAuthGuard,
  WorkspacePermissionsByRoleControlGuard,
  WorkspacePrivilegesGuard
)
@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new workspace' })
  @ApiResponse({ status: 201, description: 'Workspace created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({
    status: 403,
    description: 'Access denied - require authentication',
  })
  async create(
    @Body() createWorkspaceDto: CreateWorkspaceDto,
    @Request() req: AuthenticatedRequest
  ): Promise<WorkspaceResponseDto> {
    const workspace = await this.workspacesService.create(
      createWorkspaceDto,
      req.user
    );
    return new WorkspaceResponseDto({
      id: workspace.id,
      name: workspace.name,
      description: workspace.description,
      ownerId: workspace.ownerId,
      memberIds: workspace.members.map((m) => m.userId),
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all workspaces for the current user' })
  @ApiResponse({ status: 200, description: 'List of workspaces' })
  @ApiResponse({
    status: 403,
    description: 'Access denied - require authentication',
  })
  async findAll(@Request() req: AuthenticatedRequest) {
    const userId = req.user.id;
    const workspaces = await this.workspacesService.findAll(userId);
    return workspaces.map(
      (workspace) =>
        new WorkspaceResponseDto({
          id: workspace.id,
          name: workspace.name,
          description: workspace.description,
          ownerId: workspace.ownerId,
          memberIds: workspace.members.map((m) => m.userId),
        })
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a workspace by ID' })
  @ApiResponse({ status: 200, description: 'Workspace details' })
  @ApiResponse({ status: 404, description: 'Workspace not found' })
  @ApiResponse({
    status: 403,
    description: 'Access denied - not a workspace member',
  })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const workspace = await this.workspacesService.findOne(id);
    return new WorkspaceResponseDto({
      id: workspace?.id,
      name: workspace?.name,
      description: workspace?.description,
      ownerId: workspace?.ownerId,
      memberIds: workspace?.members.map((m) => m.userId),
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a workspace' })
  @ApiResponse({ status: 200, description: 'Workspace updated successfully' })
  @ApiResponse({ status: 404, description: 'Workspace not found' })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions - user not workspace owner or admin',
  })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateWorkspaceDto: UpdateWorkspaceDto
  ) {
    return this.workspacesService.update(id, updateWorkspaceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a workspace' })
  @ApiResponse({ status: 200, description: 'Workspace deleted successfully' })
  @ApiResponse({ status: 404, description: 'Workspace not found' })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions - user not workspace owner',
  })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.workspacesService.remove(id);
  }
}
