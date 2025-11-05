import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { type UUID } from '@fubs/shared';

export class CreateCommentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  taskId: UUID;

  @ApiProperty()
  @IsOptional()
  @IsUUID()
  createdBy: UUID;
}
