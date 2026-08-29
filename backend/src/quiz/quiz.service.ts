import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuizService {
  constructor(private readonly prisma: PrismaService) {}

  async getQuizByLesson(lessonId: string) {
    const quiz = await this.prisma.quiz.findFirst({
      where: { lessonId },
      include: { questions: true },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found for this lesson.');
    }

    return {
      ...quiz,
      questions: quiz.questions.map((q) => ({
        ...q,
        options: JSON.parse(q.options),
      })),
    };
  }

  async submitQuiz(userId: string, lessonId: string, answers: Record<string, string>) {
    const quiz = await this.prisma.quiz.findFirst({
      where: { lessonId },
      include: { questions: true },
    });

    if (!quiz) throw new NotFoundException('Quiz not found.');

    let correctCount = 0;
    const totalCount = quiz.questions.length;
    const feedback: Record<string, { correct: boolean; correctAnswer: string }> = {};

    for (const q of quiz.questions) {
      const userAns = (answers[q.id] || '').trim().toLowerCase();
      const correctAns = q.answer.trim().toLowerCase();
      const isCorrect = userAns === correctAns;

      if (isCorrect) correctCount++;
      feedback[q.id] = { correct: isCorrect, correctAnswer: q.answer };
    }

    const percentage = Math.round((correctCount / Math.max(1, totalCount)) * 100);
    const completed = percentage >= 70;

    // Update Progress
    await this.prisma.progress.upsert({
      where: {
        // Unique constraint helper
        id: (await this.prisma.progress.findFirst({ where: { userId, lessonId } }))?.id || 'new-progress-id',
      },
      update: {
        percentage,
        completed,
      },
      create: {
        userId,
        lessonId,
        percentage,
        completed,
      },
    });

    return {
      score: correctCount,
      total: totalCount,
      percentage,
      passed: completed,
      feedback,
    };
  }

  async getFlashcardsByLesson(lessonId: string) {
    return this.prisma.flashcard.findMany({
      where: { lessonId },
    });
  }

  async createFlashcard(lessonId: string, front: string, back: string) {
    return this.prisma.flashcard.create({
      data: { lessonId, front, back },
    });
  }
}
