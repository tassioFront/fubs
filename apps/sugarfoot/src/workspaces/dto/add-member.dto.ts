import { IsEnum, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { WorkspaceMemberRole } from '@fubs/shared';

export class AddMemberDto {
  @ApiProperty({
    description: 'User ID from users-service',
    example: 123,
  })
  @IsUUID('4', { message: 'User ID must be a valid uuid' })
  userId!: string;

  @ApiProperty({
    description: 'Role for the new member',
    enum: WorkspaceMemberRole,
    example: WorkspaceMemberRole.MEMBER,
  })
  @IsEnum(WorkspaceMemberRole, {
    message: 'Role must be either ADMIN or MEMBER',
  })
  role!: WorkspaceMemberRole;
}
