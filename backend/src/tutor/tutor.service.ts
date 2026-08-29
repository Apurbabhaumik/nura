import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class TutorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
  ) {}

  async askQuestion(userId: string, courseId: string, question: string) {
    // Generate RAG response using vector search & LLM prompt
    const { answer, citations } = await this.ai.generateRagAnswer(courseId, question);

    // Save Chat in Database
    const chat = await this.prisma.chat.create({
      data: {
        userId,
        courseId,
        question,
        answer,
        citations: JSON.stringify(citations),
      },
    });

    return {
      id: chat.id,
      question: chat.question,
      answer: chat.answer,
      citations,
      createdAt: chat.createdAt,
    };
  }

  async getHistory(userId: string, courseId: string) {
    const chats = await this.prisma.chat.findMany({
      where: { userId, courseId },
      orderBy: { createdAt: 'asc' },
    });

    return chats.map((c) => ({
      id: c.id,
      question: c.question,
      answer: c.answer,
      citations: c.citations ? JSON.parse(c.citations) : [],
      createdAt: c.createdAt,
    }));
  }
}
