import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(
    workspaceId: string,
    createProjectDto: CreateProjectDto,
    userId: number
  ): Promise<Project> {
    // Check if user has access to the workspace
    const workspace = await this.prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        OR: [
          { ownerId: userId },
          {
            members: {
              some: {
                userId,
              },
            },
          },
        ],
      },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found or access denied');
    }

    return this.prisma.project.create({
      data: {
        name: createProjectDto.name,
        description: createProjectDto.description,
        status: createProjectDto.status || 'ACTIVE',
        workspaceId,
      },
      include: {
        workspace: true,
      },
    });
  }

  async findAll(workspaceId: string, userId: number): Promise<Project[]> {
    // Check if user has access to the workspace
    const workspace = await this.prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        OR: [
          { ownerId: userId },
          {
            members: {
              some: {
                userId,
              },
            },
          },
        ],
      },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found or access denied');
    }

    return this.prisma.project.findMany({
      where: {
        workspaceId,
      },
      include: {
        workspace: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, userId: number): Promise<Project> {
    const project = await this.prisma.project.findFirst({
      where: {
        id,
        workspace: {
          OR: [
            { ownerId: userId },
            {
              members: {
                some: {
                  userId,
                },
              },
            },
          ],
        },
      },
      include: {
        workspace: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found or access denied');
    }

    return project;
  }

  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
    userId: number
  ): Promise<Project> {
    // Check if user has access to the project and can modify it
    const project = await this.prisma.project.findFirst({
      where: {
        id,
        workspace: {
          OR: [
            { ownerId: userId },
            {
              members: {
                some: {
                  userId,
                  role: 'ADMIN',
                },
              },
            },
          ],
        },
      },
      include: {
        workspace: true,
      },
    });

    if (!project) {
      throw new NotFoundException(
        'Project not found or insufficient permissions'
      );
    }

    return this.prisma.project.update({
      where: { id },
      data: updateProjectDto,
      include: {
        workspace: true,
      },
    });
  }

  async remove(id: string, userId: number): Promise<void> {
    // Check if user has admin access to the project
    const project = await this.prisma.project.findFirst({
      where: {
        id,
        workspace: {
          OR: [
            { ownerId: userId },
            {
              members: {
                some: {
                  userId,
                  role: 'ADMIN',
                },
              },
            },
          ],
        },
      },
    });

    if (!project) {
      throw new NotFoundException(
        'Project not found or insufficient permissions'
      );
    }

    await this.prisma.project.delete({
      where: { id },
    });
  }

  async findByWorkspace(workspaceId: string): Promise<Project[]> {
    return this.prisma.project.findMany({
      where: {
        workspaceId,
      },
      include: {
        workspace: true,
      },
    });
  }
}
