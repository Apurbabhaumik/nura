import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class TutorService {
  constructor(private readonly prisma: PrismaService, private readonly ai: AiService) {}

  private async assertCourseAccess(userId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId }, include: { workspace: true } });
    if (!course) throw new NotFoundException('Course not found.');
    if (course.workspace.ownerId !== userId) throw new ForbiddenException('You do not have access to this course.');
    return course;
  }

  async askQuestion(userId: string, courseId: string, question: string) {
    await this.assertCourseAccess(userId, courseId);
    if (!question?.trim()) throw new ForbiddenException('Question cannot be empty.');
    const { answer, citations } = await this.ai.generateRagAnswer(courseId, question.trim());
    const chat = await this.prisma.chat.create({
      data: { userId, courseId, question: question.trim(), answer, citations: JSON.stringify(citations) },
    });
    return { id: chat.id, question: chat.question, answer: chat.answer, citations, createdAt: chat.createdAt };
  }

  async getHistory(userId: string, courseId: string) {
    await this.assertCourseAccess(userId, courseId);
    const chats = await this.prisma.chat.findMany({ where: { userId, courseId }, orderBy: { createdAt: 'asc' } });
    return chats.map((c) => ({
      id: c.id,
      question: c.question,
      answer: c.answer,
      citations: c.citations ? JSON.parse(c.citations) : [],
      createdAt: c.createdAt,
    }));
  }
}
