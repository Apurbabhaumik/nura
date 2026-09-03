import { Controller, Get, Post, Body, Param, Query, Delete, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto, GenerateFromIngestionDto } from './dto/create-course.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('course')
@UseGuards(JwtAuthGuard)
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  createManual(@GetUser('id') userId: string, @Body() dto: CreateCourseDto) {
    return this.courseService.createManual(userId, dto);
  }

  @Post('generate-from-ingestion')
  generateFromIngestion(@GetUser('id') userId: string, @Body() dto: GenerateFromIngestionDto) {
    return this.courseService.generateFromIngestion(userId, dto);
  }

  @Get()
  findAllByWorkspace(@GetUser('id') userId: string, @Query('workspaceId') workspaceId: string) {
    return this.courseService.findAllByWorkspace(userId, workspaceId);
  }

  @Get(':id')
  findOne(@GetUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.courseService.findOne(userId, id);
  }

  @Delete(':id')
  remove(@GetUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.courseService.remove(userId, id);
  }
}
