import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { ParserModule } from './parser/parser.module';
import { AiModule } from './ai/ai.module';
import { CourseModule } from './course/course.module';
import { TutorModule } from './tutor/tutor.module';
import { QuizModule } from './quiz/quiz.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    PrismaModule,
    AuthModule,
    WorkspaceModule,
    ParserModule,
    AiModule,
    CourseModule,
    TutorModule,
    QuizModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
