import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException
} from '@nestjs/common'
import { CommentsService } from '../comments.service';

@Injectable()
export class ExistingCommentGuard implements CanActivate {
  constructor(private readonly commentsService: CommentsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()

    const commentId = request.params.commentId

    const foundComment = await this.commentsService.getCommentById(commentId)

    if (!foundComment) {
      throw new NotFoundException('Comment not found')
    }

    return true
  }
}
