import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('workspace')
@UseGuards(JwtAuthGuard)
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Post()
  async create(@GetUser('id') userId: string, @Body() dto: CreateWorkspaceDto) {
    return this.workspaceService.create(userId, dto);
  }

  @Get()
  async findAll(@GetUser('id') userId: string) {
    return this.workspaceService.findAll(userId);
  }

  @Get(':id')
  async findOne(@GetUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.workspaceService.findOne(userId, id);
  }

  @Put(':id')
  async update(
    @GetUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('name') name: string,
  ) {
    return this.workspaceService.update(userId, id, name);
  }

  @Delete(':id')
  async remove(@GetUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.workspaceService.remove(userId, id);
  }
}
