import { Module } from '@nestjs/common';
import { IngestionQueueService } from './ingestion.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ParserModule } from '../parser/parser.module';
import { AiModule } from '../ai/ai.module';

@Module({ imports: [PrismaModule, ParserModule, AiModule], providers: [IngestionQueueService], exports: [IngestionQueueService] })
export class IngestionModule {}
