import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuizService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertLessonAccess(userId: string, lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: { include: { course: { include: { workspace: true } } } } },
    });
    if (!lesson) throw new NotFoundException('Lesson not found.');
    if (lesson.module.course.workspace.ownerId !== userId) throw new ForbiddenException('You do not have access to this lesson.');
    return lesson;
  }

  async getQuizByLesson(userId: string, lessonId: string) {
    await this.assertLessonAccess(userId, lessonId);
    const quiz = await this.prisma.quiz.findFirst({ where: { lessonId }, include: { questions: true } });
    if (!quiz) throw new NotFoundException('Quiz not found for this lesson.');
    return {
      ...quiz,
      questions: quiz.questions.map((q) => ({ id: q.id, question: q.question, options: JSON.parse(q.options), type: q.type })),
    };
  }

  async submitQuiz(userId: string, lessonId: string, answers: Record<string, string>) {
    await this.assertLessonAccess(userId, lessonId);
    const quiz = await this.prisma.quiz.findFirst({ where: { lessonId }, include: { questions: true } });
    if (!quiz) throw new NotFoundException('Quiz not found.');

    let correctCount = 0;
    const feedback: Record<string, { correct: boolean; correctAnswer: string }> = {};
    for (const q of quiz.questions) {
      const userAns = (answers?.[q.id] || '').trim().toLowerCase();
      const correctAns = q.answer.trim().toLowerCase();
      const correct = userAns === correctAns;
      if (correct) correctCount++;
      feedback[q.id] = { correct, correctAnswer: q.answer };
    }

    const total = quiz.questions.length;
    const percentage = Math.round((correctCount / Math.max(1, total)) * 100);
    const passed = percentage >= 70;

    const [attempt] = await this.prisma.$transaction([
      this.prisma.quizAttempt.create({
        data: {
          userId,
          quizId: quiz.id,
          answers: JSON.stringify(answers || {}),
          feedback: JSON.stringify(feedback),
          score: correctCount,
          total,
          percentage,
          passed,
        },
      }),
      this.prisma.progress.upsert({
        where: { userId_lessonId: { userId, lessonId } },
        update: { percentage, completed: passed },
        create: { userId, lessonId, percentage, completed: passed },
      }),
    ]);

    return { attemptId: attempt.id, score: correctCount, total, percentage, passed, feedback, createdAt: attempt.createdAt };
  }

  async getAttempts(userId: string, lessonId: string) {
    await this.assertLessonAccess(userId, lessonId);
    const quiz = await this.prisma.quiz.findFirst({ where: { lessonId } });
    if (!quiz) return [];
    const attempts = await this.prisma.quizAttempt.findMany({
      where: { userId, quizId: quiz.id },
      orderBy: { createdAt: 'desc' },
    });
    return attempts.map((a) => ({ ...a, answers: JSON.parse(a.answers), feedback: JSON.parse(a.feedback) }));
  }

  async updateProgress(userId: string, lessonId: string, percentage: number) {
    await this.assertLessonAccess(userId, lessonId);
    const safePercentage = Math.max(0, Math.min(100, Math.round(Number(percentage) || 0)));
    return this.prisma.progress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: { percentage: safePercentage, completed: safePercentage >= 100 },
      create: { userId, lessonId, percentage: safePercentage, completed: safePercentage >= 100 },
    });
  }

  async getProgress(userId: string, lessonId: string) {
    await this.assertLessonAccess(userId, lessonId);
    return this.prisma.progress.findUnique({ where: { userId_lessonId: { userId, lessonId } } });
  }

  async getFlashcardsByLesson(userId: string, lessonId: string) {
    await this.assertLessonAccess(userId, lessonId);
    return this.prisma.flashcard.findMany({ where: { lessonId } });
  }
}
