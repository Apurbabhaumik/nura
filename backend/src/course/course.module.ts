import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { ParserModule } from '../parser/parser.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [ParserModule, AiModule],
  controllers: [CourseController],
  providers: [CourseService],
  exports: [CourseService],
})
export class CourseModule {}
