import { Controller, Post, Get, Body, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { TutorService } from './tutor.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('tutor')
@UseGuards(JwtAuthGuard)
export class TutorController {
  constructor(private readonly tutorService: TutorService) {}

  @Post('chat')
  askQuestion(@GetUser('id') userId: string, @Body('courseId') courseId: string, @Body('question') question: string) {
    return this.tutorService.askQuestion(userId, courseId, question);
  }

  @Post('simplify')
  simplifyLesson(@GetUser('id') userId: string, @Body('courseId') courseId: string, @Body('lessonId') lessonId: string) {
    return this.tutorService.simplifyLesson(userId, courseId, lessonId);
  }

  @Get('history/:courseId')
  getHistory(@GetUser('id') userId: string, @Param('courseId', ParseUUIDPipe) courseId: string) {
    return this.tutorService.getHistory(userId, courseId);
  }
}
