import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { ParserModule } from '../parser/parser.module';
import { AiModule } from '../ai/ai.module';
import { IngestionModule } from '../ingestion/ingestion.module';

@Module({ imports: [ParserModule, AiModule, IngestionModule], controllers: [CourseController], providers: [CourseService], exports: [CourseService] })
export class CourseModule {}
