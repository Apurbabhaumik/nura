import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';

@Injectable()
export class WorkspaceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateWorkspaceDto) {
    return this.prisma.workspace.create({
      data: {
        name: dto.name,
        ownerId: userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.workspace.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found.');
    }

    if (workspace.ownerId !== userId) {
      throw new ForbiddenException('You do not have access to this workspace.');
    }

    return workspace;
  }

  async update(userId: string, id: string, name: string) {
    await this.findOne(userId, id); // validates ownership and existence

    return this.prisma.workspace.update({
      where: { id },
      data: { name },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id); // validates ownership and existence

    await this.prisma.workspace.delete({
      where: { id },
    });

    return { success: true };
  }
}
