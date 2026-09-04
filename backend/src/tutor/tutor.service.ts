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
    const cleanQuestion = question?.trim();
    if (!cleanQuestion) throw new ForbiddenException('Question cannot be empty.');
    const history = await this.prisma.chat.findMany({ where: { userId, courseId }, orderBy: { createdAt: 'desc' }, take: 6, select: { question: true, answer: true } });
    const conversationContext = history.reverse().map((item) => `Student: ${item.question}\nTutor: ${item.answer}`).join('\n\n');
    const result = await this.ai.generateRagAnswer(courseId, cleanQuestion, conversationContext);
    const chat = await this.prisma.chat.create({ data: { userId, courseId, question: cleanQuestion, answer: result.answer, citations: JSON.stringify(result.citations) } });
    return { id: chat.id, question: chat.question, answer: chat.answer, citations: result.citations, createdAt: chat.createdAt };
  }

  async simplifyLesson(userId: string, courseId: string, lessonId: string) {
    await this.assertCourseAccess(userId, courseId);
    const lesson = await this.prisma.lesson.findFirst({ where: { id: lessonId, module: { courseId } }, select: { title: true, markdown: true } });
    if (!lesson) throw new NotFoundException('Lesson not found.');
    return { explanation: await this.ai.simplifyLesson(lesson.title, lesson.markdown) };
  }

  async getHistory(userId: string, courseId: string) {
    await this.assertCourseAccess(userId, courseId);
    const chats = await this.prisma.chat.findMany({ where: { userId, courseId }, orderBy: { createdAt: 'asc' } });
    return chats.map((c) => ({ id: c.id, question: c.question, answer: c.answer, citations: c.citations ? JSON.parse(c.citations) : [], createdAt: c.createdAt }));
  }
}
