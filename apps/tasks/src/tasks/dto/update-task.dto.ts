import { PartialType } from "@nestjs/swagger";
import { CreateTaskDto } from "./create-task.dto";

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  // Additional properties for updating a task can be added here if needed
}
