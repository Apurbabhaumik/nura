import { Controller, Get, Post, Body, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('quiz')
@UseGuards(JwtAuthGuard)
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get('lesson/:lessonId')
  async getQuizByLesson(@Param('lessonId', ParseUUIDPipe) lessonId: string) {
    return this.quizService.getQuizByLesson(lessonId);
  }

  @Post('submit')
  async submitQuiz(
    @GetUser('id') userId: string,
    @Body('lessonId') lessonId: string,
    @Body('answers') answers: Record<string, string>,
  ) {
    return this.quizService.submitQuiz(userId, lessonId, answers);
  }

  @Get('flashcards/:lessonId')
  async getFlashcardsByLesson(@Param('lessonId', ParseUUIDPipe) lessonId: string) {
    return this.quizService.getFlashcardsByLesson(lessonId);
  }

  @Post('flashcards')
  async createFlashcard(
    @Body('lessonId') lessonId: string,
    @Body('front') front: string,
    @Body('back') back: string,
  ) {
    return this.quizService.createFlashcard(lessonId, front, back);
  }
}
