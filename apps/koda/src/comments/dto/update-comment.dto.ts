import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty, IsString } from 'class-validator';

export class UpdateCommentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  commentId: string;
}
