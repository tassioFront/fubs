import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException
} from '@nestjs/common'
import { TasksService } from 'src/tasks/tasks.service'

@Injectable()
export class ExistingTaskGuard implements CanActivate {
  constructor(private readonly tasksService: TasksService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()

    const taskId = request.params.taskId

    const foundTask = await this.tasksService.findById(taskId)

    if (!foundTask) {
      throw new NotFoundException('Task not found')
    }

    return true
  }
}
