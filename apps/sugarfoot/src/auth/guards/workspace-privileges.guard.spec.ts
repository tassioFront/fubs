import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { WorkspacePrivilegesGuard } from './workspace-privileges.guard';
import { WorkspacesService } from '../../workspaces/workspaces.service';
import {
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';

const mockWorkspacesService = {
  userHasAccess: jest.fn(),
  findOne: jest.fn(),
};

const mockContext = (
  userId = 'user-1',
  workspaceId,
  method = 'GET',
  url = '/sugarfoot/workspaces'
) => {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        user: { id: userId },
        params: { workspaceId },
        method,
        url,
      }),
    }),
  } as unknown as ExecutionContext;
};

describe('WorkspacePrivilegesGuard', () => {
  let guard: WorkspacePrivilegesGuard;

  beforeEach(() => {
    guard = new WorkspacePrivilegesGuard(
      mockWorkspacesService as unknown as WorkspacesService
    );
    jest.clearAllMocks();
  });

  it('should allow access if workspaceId is missing and URL is allowed', async () => {
    const context = mockContext('user-1', undefined, 'GET');
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should throw BadRequestException if workspaceId is missing and URL is not allowed', async () => {
    const context = mockContext(
      'user-1',
      undefined,
      'GET',
      '/sugarfoot/api/other'
    );
    let err = null;
    try {
      await guard.canActivate(context);
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(BadRequestException);
    expect(err.message).toBe('Workspace ID is required');
  });

  it('should allow access if user has workspace access', async () => {
    mockWorkspacesService.userHasAccess.mockResolvedValue(true);
    const context = mockContext('user-1', 'ws-1');
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    expect(mockWorkspacesService.userHasAccess).toHaveBeenCalledWith(
      'ws-1',
      'user-1'
    );
  });

  it('should throw NotFoundException if workspace was not found', async () => {
    mockWorkspacesService.userHasAccess.mockResolvedValue(false);
    mockWorkspacesService.findOne.mockResolvedValue(false);
    const context = mockContext('user-2', 'ws-2');
    let err = null;
    try {
      await guard.canActivate(context);
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(NotFoundException);
    expect(err.message).toBe('Workspace not found');
  });

  it('should throw ForbiddenException if workspace exists and user does not have access', async () => {
    mockWorkspacesService.userHasAccess.mockResolvedValue(false);
    mockWorkspacesService.findOne.mockResolvedValue(true);
    const context = mockContext('user-2', 'ws-2');
    let err = null;
    try {
      await guard.canActivate(context);
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(ForbiddenException);
    expect(err.message).toBe('Access denied');
  });

  it('should throw InternalServerErrorException on unexpected error', async () => {
    let err = null;
    mockWorkspacesService.userHasAccess.mockRejectedValue(
      new Error('Unexpected')
    );
    const context = mockContext('user-3', 'ws-3');
    try {
      await guard.canActivate(context);
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(InternalServerErrorException);
    expect(err.message).toBe(
      'An unexpected error occurred while verifying workspace ownership'
    );
  });
});
