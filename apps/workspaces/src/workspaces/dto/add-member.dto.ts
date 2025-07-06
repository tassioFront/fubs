import { IsInt, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { WorkspaceMemberRole } from '@prisma/client';

export class AddMemberDto {
  @ApiProperty({
    description: 'User ID from users-service',
    example: 123,
  })
  @IsInt({ message: 'User ID must be an integer' })
  userId!: number;

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
