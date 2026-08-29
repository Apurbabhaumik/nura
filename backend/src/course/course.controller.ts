import { Controller, Get, Post, Body, Param, Query, Delete, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto, GenerateFromIngestionDto } from './dto/create-course.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('course')
@UseGuards(JwtAuthGuard)
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  async createManual(@Body() dto: CreateCourseDto) {
    return this.courseService.createManual(dto);
  }

  @Post('generate-from-ingestion')
  async generateFromIngestion(@Body() dto: GenerateFromIngestionDto) {
    return this.courseService.generateFromIngestion(dto);
  }

  @Get()
  async findAllByWorkspace(@Query('workspaceId') workspaceId: string) {
    return this.courseService.findAllByWorkspace(workspaceId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.courseService.findOne(id);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.courseService.remove(id);
  }
}
