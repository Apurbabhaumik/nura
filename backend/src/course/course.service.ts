import { Injectable, NotFoundException } from '@nestjs/common';
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

  async createManual(dto: CreateCourseDto) {
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

  async generateFromIngestion(dto: GenerateFromIngestionDto) {
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
        const parsed = await this.parser.parseFile('Web Document', 'txt');
        parsedText = parsed.text;
      }
    } else if (dto.filename) {
      const parsed = await this.parser.parseFile(dto.filename, 'pdf', dto.fileContent ? Buffer.from(dto.fileContent) : undefined);
      parsedText = parsed.text;
      titleHint = parsed.title;
    } else {
      parsedText = 'Standard software engineering, software architecture, and artificial intelligence syllabus.';
    }

    // AI Course Scaffold Generation
    const generated = await this.ai.generateCourseStructure(parsedText, titleHint);

    // Save Course to Database
    const course = await this.prisma.course.create({
      data: {
        workspaceId: dto.workspaceId,
        title: generated.title,
        description: generated.description,
        difficulty: generated.difficulty.toLowerCase(),
      },
    });

    // Save Upload record
    await this.prisma.upload.create({
      data: {
        courseId: course.id,
        filename: dto.filename || dto.url || 'Ingested Document',
        type: dto.url ? 'URL' : 'FILE',
        status: 'COMPLETED',
      },
    });

    // Index chunks in vector store
    await this.ai.indexCourseChunks(course.id, parsedText, course.title);

    // Save Modules, Lessons, Quizzes & Flashcards
    for (const mod of generated.modules) {
      const createdMod = await this.prisma.module.create({
        data: {
          courseId: course.id,
          title: mod.title,
          order: mod.order,
        },
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

        // Flashcards
        for (const fc of les.flashcards) {
          await this.prisma.flashcard.create({
            data: {
              lessonId: createdLesson.id,
              front: fc.front,
              back: fc.back,
            },
          });
        }

        // Quiz
        if (les.quiz) {
          const createdQuiz = await this.prisma.quiz.create({
            data: {
              lessonId: createdLesson.id,
              difficulty: les.quiz.difficulty,
              timeLimit: les.quiz.timeLimit,
            },
          });

          for (const q of les.quiz.questions) {
            await this.prisma.question.create({
              data: {
                quizId: createdQuiz.id,
                question: q.question,
                answer: q.answer,
                options: JSON.stringify(q.options),
                type: q.type,
              },
            });
          }
        }
      }
    }

    return this.findOne(course.id);
  }

  async findAllByWorkspace(workspaceId: string) {
    return this.prisma.course.findMany({
      where: { workspaceId },
      include: {
        modules: {
          include: {
            lessons: true,
          },
        },
        _count: {
          select: { uploads: true, chats: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              include: {
                quizzes: {
                  include: { questions: true },
                },
                flashcards: true,
                progress: true,
              },
            },
          },
        },
        uploads: true,
      },
    });

    if (!course) throw new NotFoundException('Course not found.');
    return course;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.course.delete({ where: { id } });
    return { success: true };
  }
}
