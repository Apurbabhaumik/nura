import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ParserService } from '../parser/parser.service';
import { AiService } from '../ai/ai.service';
import { CreateCourseDto, GenerateFromIngestionDto } from './dto/create-course.dto';

@Injectable()
export class CourseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly parser: ParserService,
    private readonly ai: AiService,
  ) {}

  private async assertWorkspaceOwner(userId: string, workspaceId: string) {
    const workspace = await this.prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (!workspace) throw new NotFoundException('Workspace not found.');
    if (workspace.ownerId !== userId) throw new ForbiddenException('You do not have access to this workspace.');
    return workspace;
  }

  private async assertCourseOwner(userId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: { workspace: true },
    });
    if (!course) throw new NotFoundException('Course not found.');
    if (course.workspace.ownerId !== userId) throw new ForbiddenException('You do not have access to this course.');
    return course;
  }

  async createManual(userId: string, dto: CreateCourseDto) {
    await this.assertWorkspaceOwner(userId, dto.workspaceId);
    return this.prisma.course.create({
      data: {
        workspaceId: dto.workspaceId,
        title: dto.title,
        description: dto.description || 'Custom course created manually.',
        difficulty: dto.difficulty || 'intermediate',
        visibility: dto.visibility || 'private',
      },
    });
  }

  async generateFromIngestion(userId: string, dto: GenerateFromIngestionDto) {
    await this.assertWorkspaceOwner(userId, dto.workspaceId);

    let parsedText = '';
    let titleHint = dto.filename || 'Ingested Learning Course';

    if (dto.url) {
      if (dto.url.includes('github.com')) {
        const parsed = await this.parser.parseGitHubRepo(dto.url);
        parsedText = parsed.text;
        titleHint = parsed.title;
      } else if (dto.url.includes('youtube.com') || dto.url.includes('youtu.be')) {
        const parsed = await this.parser.parseYouTubeVideo(dto.url);
        parsedText = parsed.text;
        titleHint = parsed.title;
      } else {
        throw new ForbiddenException('Only GitHub and YouTube URLs are supported.');
      }
    } else if (dto.fileContent) {
      const parsed = await this.parser.parseFile(dto.filename || 'document.txt', 'text/plain', Buffer.from(dto.fileContent, 'base64'));
      parsedText = parsed.text;
      titleHint = parsed.title;
    } else {
      throw new ForbiddenException('Provide a GitHub/YouTube URL or file content.');
    }

    if (!parsedText.trim()) throw new ForbiddenException('No readable content was found in the source.');

    const generated = await this.ai.generateCourseStructure(parsedText, titleHint);
    const course = await this.prisma.course.create({
      data: {
        workspaceId: dto.workspaceId,
        title: generated.title,
        description: generated.description,
        difficulty: generated.difficulty.toLowerCase(),
      },
    });

    try {
      await this.prisma.upload.create({
        data: {
          courseId: course.id,
          filename: dto.filename || dto.url || 'Ingested Document',
          type: dto.url ? 'URL' : 'FILE',
          status: 'COMPLETED',
        },
      });

      await this.ai.indexCourseChunks(course.id, parsedText, course.title);

      for (const mod of generated.modules) {
        const createdMod = await this.prisma.module.create({
          data: { courseId: course.id, title: mod.title, order: mod.order },
        });
        for (const les of mod.lessons) {
          const createdLesson = await this.prisma.lesson.create({
            data: {
              moduleId: createdMod.id,
              title: les.title,
              markdown: les.markdown,
              estimatedTime: les.estimatedTime,
            },
          });
          if (les.flashcards?.length) {
            await this.prisma.flashcard.createMany({
              data: les.flashcards.map((fc) => ({ lessonId: createdLesson.id, front: fc.front, back: fc.back })),
            });
          }
          if (les.quiz) {
            const createdQuiz = await this.prisma.quiz.create({
              data: { lessonId: createdLesson.id, difficulty: les.quiz.difficulty, timeLimit: les.quiz.timeLimit },
            });
            if (les.quiz.questions?.length) {
              await this.prisma.question.createMany({
                data: les.quiz.questions.map((q) => ({
                  quizId: createdQuiz.id,
                  question: q.question,
                  answer: q.answer,
                  options: JSON.stringify(q.options),
                  type: q.type,
                })),
              });
            }
          }
        }
      }
    } catch (error) {
      await this.prisma.course.delete({ where: { id: course.id } }).catch(() => undefined);
      throw error;
    }

    return this.findOne(userId, course.id);
  }

  async findAllByWorkspace(userId: string, workspaceId: string) {
    await this.assertWorkspaceOwner(userId, workspaceId);
    return this.prisma.course.findMany({
      where: { workspaceId },
      include: { modules: { include: { lessons: true } }, _count: { select: { uploads: true, chats: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    await this.assertCourseOwner(userId, id);
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        modules: {
          orderBy: { order: 'asc' },
          include: { lessons: { include: { quizzes: { include: { questions: true } }, flashcards: true, progress: true } } },
        },
        uploads: true,
      },
    });
    if (!course) throw new NotFoundException('Course not found.');
    return course;
  }

  async remove(userId: string, id: string) {
    await this.assertCourseOwner(userId, id);
    await this.prisma.course.delete({ where: { id } });
    return { success: true };
  }
}
