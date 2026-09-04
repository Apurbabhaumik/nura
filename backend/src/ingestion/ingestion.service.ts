import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job, Queue, Worker } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { ParserService } from '../parser/parser.service';
import { AiService } from '../ai/ai.service';

interface IngestionJobData { userId: string; courseId: string; uploadId: string; url: string; }

@Injectable()
export class IngestionQueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(IngestionQueueService.name);
  private readonly queueName = 'nura-ingestion';
  private queue?: Queue<IngestionJobData>;
  private worker?: Worker<IngestionJobData>;

  constructor(private readonly config: ConfigService, private readonly prisma: PrismaService, private readonly parser: ParserService, private readonly ai: AiService) {}

  onModuleInit() {
    const redisUrl = this.config.get<string>('REDIS_URL');
    let connection: any = { host: this.config.get<string>('REDIS_HOST') || 'localhost', port: Number(this.config.get<string>('REDIS_PORT') || 6379) };
    if (redisUrl) { const url = new URL(redisUrl); connection = { host: url.hostname, port: Number(url.port || 6379), password: url.password || undefined, username: url.username || undefined }; }
    this.queue = new Queue<IngestionJobData>(this.queueName, { connection, defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 3000 }, removeOnComplete: 100, removeOnFail: 100 } });
    this.worker = new Worker<IngestionJobData>(this.queueName, (job) => this.process(job), { connection, concurrency: Number(this.config.get<string>('INGESTION_CONCURRENCY') || 2) });
    this.worker.on('failed', (job, error) => this.logger.error(`Ingestion job ${job?.id || 'unknown'} failed: ${error.message}`));
    this.worker.on('error', (error) => this.logger.error(`Ingestion worker error: ${error.message}`));
  }

  async enqueue(data: IngestionJobData) { if (!this.queue) throw new Error('Ingestion queue is not initialized.'); const job = await this.queue.add('generate-course', data, { jobId: data.uploadId }); return { jobId: job.id, courseId: data.courseId, uploadId: data.uploadId }; }

  private async process(job: Job<IngestionJobData>) {
    const { courseId, uploadId, url } = job.data;
    await this.prisma.upload.update({ where: { id: uploadId }, data: { status: 'PROCESSING' } });
    await job.updateProgress({ percentage: 10, stage: 'reading-source' });
    try {
      const parsed = url.includes('github.com') ? await this.parser.parseGitHubRepo(url) : await this.parser.parseYouTubeVideo(url);
      await job.updateProgress({ percentage: 30, stage: 'generating-curriculum' });
      const generated = await this.ai.generateCourseStructure(parsed.text, parsed.title);
      await job.updateProgress({ percentage: 65, stage: 'saving-course' });
      await this.prisma.$transaction(async (tx) => {
        await tx.module.deleteMany({ where: { courseId } });
        await tx.course.update({ where: { id: courseId }, data: { title: generated.title, description: generated.description, difficulty: generated.difficulty.toLowerCase() } });
        for (const mod of generated.modules) {
          const createdMod = await tx.module.create({ data: { courseId, title: mod.title, order: mod.order } });
          for (const lesson of mod.lessons) {
            const createdLesson = await tx.lesson.create({ data: { moduleId: createdMod.id, title: lesson.title, markdown: lesson.markdown, estimatedTime: lesson.estimatedTime } });
            if (lesson.flashcards?.length) await tx.flashcard.createMany({ data: lesson.flashcards.map((fc) => ({ lessonId: createdLesson.id, front: fc.front, back: fc.back })) });
            if (lesson.quiz) { const quiz = await tx.quiz.create({ data: { lessonId: createdLesson.id, difficulty: lesson.quiz.difficulty, timeLimit: lesson.quiz.timeLimit } }); if (lesson.quiz.questions?.length) await tx.question.createMany({ data: lesson.quiz.questions.map((q) => ({ quizId: quiz.id, question: q.question, answer: q.answer, options: JSON.stringify(q.options), type: q.type })) }); }
          }
        }
      });
      await job.updateProgress({ percentage: 80, stage: 'indexing-knowledge' });
      await this.ai.indexCourseChunks(courseId, parsed.text, generated.title);
      await this.prisma.upload.update({ where: { id: uploadId }, data: { status: 'COMPLETED' } });
      await job.updateProgress({ percentage: 100, stage: 'completed' });
      return { courseId, uploadId };
    } catch (error) { await this.prisma.upload.update({ where: { id: uploadId }, data: { status: 'FAILED' } }).catch(() => undefined); throw error; }
  }

  async getJobStatus(jobId: string) {
    if (!this.queue) throw new Error('Ingestion queue is not initialized.');
    const job = await this.queue.getJob(jobId); if (!job) return null;
    return { id: job.id, courseId: job.data.courseId, state: await job.getState(), progress: job.progress, failedReason: job.failedReason || null, returnvalue: job.returnvalue || null };
  }

  async onModuleDestroy() { await this.worker?.close(); await this.queue?.close(); }
}
