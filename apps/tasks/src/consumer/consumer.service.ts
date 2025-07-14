import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import type { ProjectCreatedEvent } from './project-events.interface';

@Injectable()
export class ConsumerService {
  constructor(private readonly prisma: PrismaService) {}

  async createProject(projectData: ProjectCreatedEvent) {
    try {
      const project = await this.prisma.project.create({
        data: {
          // we should update this
          id: projectData.id,
        },
      });

      return project;
    } catch (error) {
      console.error('Error creating project:', error);
      throw new InternalServerErrorException(
        `Failed to create project with ID: ${projectData.id}`
      );
    }
  }
}
