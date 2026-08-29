import { Controller, Post, Get, Body, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { TutorService } from './tutor.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('tutor')
@UseGuards(JwtAuthGuard)
export class TutorController {
  constructor(private readonly tutorService: TutorService) {}

  @Post('chat')
  async askQuestion(
    @GetUser('id') userId: string,
    @Body('courseId') courseId: string,
    @Body('question') question: string,
  ) {
    return this.tutorService.askQuestion(userId, courseId, question);
  }

  @Get('history/:courseId')
  async getHistory(
    @GetUser('id') userId: string,
    @Param('courseId', ParseUUIDPipe) courseId: string,
  ) {
    return this.tutorService.getHistory(userId, courseId);
  }
}
