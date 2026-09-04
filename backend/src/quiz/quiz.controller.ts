import { Controller, Get, Post, Patch, Body, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('quiz')
@UseGuards(JwtAuthGuard)
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get('lesson/:lessonId')
  getQuizByLesson(@GetUser('id') userId: string, @Param('lessonId', ParseUUIDPipe) lessonId: string) {
    return this.quizService.getQuizByLesson(userId, lessonId);
  }

  @Post('submit')
  submitQuiz(
    @GetUser('id') userId: string,
    @Body('lessonId') lessonId: string,
    @Body('answers') answers: Record<string, string>,
  ) {
    return this.quizService.submitQuiz(userId, lessonId, answers);
  }

  @Get('attempts/:lessonId')
  getAttempts(@GetUser('id') userId: string, @Param('lessonId', ParseUUIDPipe) lessonId: string) {
    return this.quizService.getAttempts(userId, lessonId);
  }

  @Get('progress/:lessonId')
  getProgress(@GetUser('id') userId: string, @Param('lessonId', ParseUUIDPipe) lessonId: string) {
    return this.quizService.getProgress(userId, lessonId);
  }

  @Patch('progress/:lessonId')
  updateProgress(
    @GetUser('id') userId: string,
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
    @Body('percentage') percentage: number,
  ) {
    return this.quizService.updateProgress(userId, lessonId, percentage);
  }

  @Get('flashcards/:lessonId')
  getFlashcardsByLesson(@GetUser('id') userId: string, @Param('lessonId', ParseUUIDPipe) lessonId: string) {
    return this.quizService.getFlashcardsByLesson(userId, lessonId);
  }
}
