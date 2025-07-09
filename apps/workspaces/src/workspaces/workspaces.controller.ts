import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { JwtAuthGuard } from '@fubs/shared';
import type { AuthenticatedRequest } from '@fubs/shared';

@UseGuards(JwtAuthGuard)
@ApiTags('workspaces')
@ApiBearerAuth()
@Controller('api/workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new workspace' })
  @ApiResponse({ status: 201, description: 'Workspace created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(
    @Body() createWorkspaceDto: CreateWorkspaceDto,
    @Request() req: AuthenticatedRequest
  ) {
    const userId = req.user.id;
    return this.workspacesService.create(createWorkspaceDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all workspaces for the current user' })
  @ApiResponse({ status: 200, description: 'List of workspaces' })
  findAll(@Request() req: AuthenticatedRequest) {
    const userId = req.user.id;
    return this.workspacesService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a workspace by ID' })
  @ApiResponse({ status: 200, description: 'Workspace details' })
  @ApiResponse({ status: 404, description: 'Workspace not found' })
  findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    const userId = req.user.id;
    return this.workspacesService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a workspace' })
  @ApiResponse({ status: 200, description: 'Workspace updated successfully' })
  @ApiResponse({ status: 404, description: 'Workspace not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  update(
    @Param('id') id: string,
    @Body() updateWorkspaceDto: UpdateWorkspaceDto,
    @Request() req: AuthenticatedRequest
  ) {
    const userId = req.user.id;
    return this.workspacesService.update(id, updateWorkspaceDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a workspace' })
  @ApiResponse({ status: 200, description: 'Workspace deleted successfully' })
  @ApiResponse({ status: 404, description: 'Workspace not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    const userId = req.user.id;
    return this.workspacesService.remove(id, userId);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add a member to the workspace' })
  @ApiResponse({ status: 201, description: 'Member added successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Workspace not found' })
  addMember(
    @Param('id') id: string,
    @Body() addMemberDto: AddMemberDto,
    @Request() req: AuthenticatedRequest
  ) {
    const userId = req.user.id;
    return this.workspacesService.addMember(id, addMemberDto, userId);
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'Get all members of a workspace' })
  @ApiResponse({ status: 200, description: 'List of workspace members' })
  @ApiResponse({ status: 404, description: 'Workspace not found' })
  getMembers(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    const userId = req.user.id;
    return this.workspacesService.getMembers(id, userId);
  }

  @Delete(':id/members/:userId')
  @ApiOperation({ summary: 'Remove a member from the workspace' })
  @ApiResponse({ status: 200, description: 'Member removed successfully' })
  @ApiResponse({ status: 404, description: 'Workspace or member not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  removeMember(
    @Param('id') id: string,
    @Param('userId', ParseIntPipe) memberUserId: number,
    @Request() req: AuthenticatedRequest
  ) {
    const userId = req.user.id;
    return this.workspacesService.removeMember(id, memberUserId, userId);
  }
}
