import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { WorkspaceMembersService } from './workspace-members.service';
import { AddMemberDto } from '../workspaces/dto/add-member.dto';
import { JwtAuthGuard } from '@fubs/shared';
import { WorkspaceMemberGuard } from '../auth/guards/workspace-member.guard';
import { WorkspacePermissionsByRoleControlGuard } from '../auth/guards/workspace-permissions-by-role.guard';
import { WorkspacePrivilegesGuard } from '../auth/guards/workspace-privileges.guard';

@ApiTags('workspace-members')
@ApiBearerAuth()
@UseGuards(
  JwtAuthGuard,
  WorkspacePermissionsByRoleControlGuard,
  WorkspacePrivilegesGuard
)
@Controller('workspaces/:workspaceId/members')
export class WorkspaceMembersController {
  constructor(
    private readonly workspaceMembersService: WorkspaceMembersService
  ) {}

  @Get()
  @UseGuards(WorkspaceMemberGuard)
  @ApiOperation({ summary: 'Get all members of a workspace' })
  @ApiResponse({ status: 200, description: 'List of workspace members' })
  @ApiResponse({ status: 404, description: 'Workspace not found' })
  @ApiResponse({
    status: 403,
    description: 'Access denied - not a workspace member',
  })
  getMembers(@Param('workspaceId') workspaceId: string) {
    return this.workspaceMembersService.getMembers(workspaceId);
  }

  @Post()
  @ApiOperation({ summary: 'Add a user (member or admin) to the workspace' })
  @ApiResponse({ status: 201, description: 'User added successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Workspace not found' })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions - not workspace owner',
  })
  addUser(
    @Param('workspaceId') workspaceId: string,
    @Body() addMemberDto: AddMemberDto
  ) {
    return this.workspaceMembersService.addMember(workspaceId, addMemberDto);
  }

  @Delete(':userId')
  @ApiOperation({ summary: 'Remove a member from the workspace' })
  @ApiResponse({ status: 200, description: 'Member removed successfully' })
  @ApiResponse({ status: 404, description: 'Workspace or member not found' })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions - not workspace owner',
  })
  removeMember(
    @Param('workspaceId') workspaceId: string,
    @Param('userId') memberUserId: string
  ) {
    return this.workspaceMembersService.removeMember(workspaceId, memberUserId);
  }
}
