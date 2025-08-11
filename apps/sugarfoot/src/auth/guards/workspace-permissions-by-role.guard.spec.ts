import { ForbiddenException, ExecutionContext } from '@nestjs/common';
import { WorkspacePermissionsByRoleControlGuard } from './workspace-permissions-by-role.guard';
import { WorkspaceMemberRole } from '@fubs/shared';

describe('WorkspacePermissionsByRoleControlGuard', () => {
  let guard: WorkspacePermissionsByRoleControlGuard;

  beforeEach(() => {
    guard = new WorkspacePermissionsByRoleControlGuard();
  });

  function mockContext(role: WorkspaceMemberRole, method: string) {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { role, id: 'user-id' },
          method,
        }),
      }),
    } as unknown as ExecutionContext;
  }

  it('should allow owner for any method', async () => {
    const context = mockContext(WorkspaceMemberRole.OWNER, 'POST');
    const context2 = mockContext(WorkspaceMemberRole.OWNER, 'GET');
    const context3 = mockContext(WorkspaceMemberRole.OWNER, 'DELETE');
    const context4 = mockContext(WorkspaceMemberRole.OWNER, 'PATCH');
    await expect(guard.canActivate(context)).resolves.toBe(true);
    await expect(guard.canActivate(context2)).resolves.toBe(true);
    await expect(guard.canActivate(context3)).resolves.toBe(true);
    await expect(guard.canActivate(context4)).resolves.toBe(true);
  });

  it('should allow member for GET', async () => {
    const context = mockContext(WorkspaceMemberRole.MEMBER, 'GET');
    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('should forbid member for POST', async () => {
    const context = mockContext(WorkspaceMemberRole.MEMBER, 'POST');
    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException
    );
  });

  it('should forbid member for DELETE', async () => {
    const context = mockContext(WorkspaceMemberRole.MEMBER, 'DELETE');
    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException
    );
  });

  it('should forbid member for PATCH', async () => {
    const context = mockContext(WorkspaceMemberRole.MEMBER, 'PATCH');
    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException
    );
  });

  it('should forbid admin for DELETE', async () => {
    const context = mockContext(WorkspaceMemberRole.ADMIN, 'DELETE');
    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException
    );
  });

  it('should forbid admin for POST', async () => {
    const context = mockContext(WorkspaceMemberRole.ADMIN, 'POST');
    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException
    );
  });

  it('should allow admin for GET', async () => {
    const context = mockContext(WorkspaceMemberRole.ADMIN, 'GET');
    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('should allow admin for PATCH', async () => {
    const context = mockContext(WorkspaceMemberRole.ADMIN, 'PATCH');
    await expect(guard.canActivate(context)).resolves.toBe(true);
  });
});
