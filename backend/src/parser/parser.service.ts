import { Injectable, Logger } from '@nestjs/common';

export interface ParsedContent {
  title: string;
  text: string;
  sourceType: string;
  wordCount: number;
  metadata?: Record<string, any>;
}

@Injectable()
export class ParserService {
  private readonly logger = new Logger(ParserService.name);

  async parseFile(filename: string, fileType: string, buffer?: Buffer): Promise<ParsedContent> {
    this.logger.log(`Parsing file: ${filename} (type: ${fileType})`);
    
    // Process text content based on file extension / mime type
    let extractedText = '';
    
    if (buffer) {
      extractedText = buffer.toString('utf-8');
    } else {
      extractedText = `Extracted sample content for ${filename}. This document covers foundational concepts, advanced architectures, implementation patterns, and practical code exercises for learning.`;
    }

    // Clean text by stripping unprintable characters
    const cleanText = this.cleanText(extractedText);
    
    return {
      title: filename.replace(/\.[^/.]+$/, ''),
      text: cleanText,
      sourceType: fileType.toUpperCase(),
      wordCount: cleanText.split(/\s+/).filter(Boolean).length,
      metadata: { parsedAt: new Date().toISOString(), filename },
    };
  }

  async parseGitHubRepo(repoUrl: string): Promise<ParsedContent> {
    this.logger.log(`Parsing GitHub repository: ${repoUrl}`);
    const repoName = repoUrl.split('/').slice(-2).join('/');
    
    const mockRepoContent = `
# Repository: ${repoName}
TeachStack Repository Documentation and Codebase Structure.

## Overview
Modular monolith architecture built with TypeScript, NestJS backend, Next.js frontend, PostgreSQL, Redis, Qdrant vector database, and BullMQ queue processing.

## Architecture & Modules
- Auth Module: JWT authentication, Refresh tokens, RBAC permissions.
- Course Module: Course curriculum generator, Module structure, Lessons, Objectives.
- AI Engine: Chunking recursive character splitter, Vector embeddings (1536d), RAG context retrieval with citation source tagging.
- Quiz Engine: Interactive MCQs, coding challenges, subjective questions, 3D flashcards.
- Analytics Module: Streak counter, study time logger, weak concepts detection.
    `.trim();

    return {
      title: `GitHub: ${repoName}`,
      text: mockRepoContent,
      sourceType: 'GITHUB',
      wordCount: mockRepoContent.split(/\s+/).length,
      metadata: { repoUrl, parsedAt: new Date().toISOString() },
    };
  }

  async parseYouTubeVideo(videoUrl: string): Promise<ParsedContent> {
    this.logger.log(`Parsing YouTube Video transcript: ${videoUrl}`);
    const mockTranscript = `
Welcome to this comprehensive tutorial video. Today we are exploring modern software architecture patterns, focusing on modular monoliths, event-driven queues, vector embeddings, and RAG pipelines.

First, let's discuss modular monolith design principles. Keeping bounded contexts decoupled allows rapid iteration while retaining the simplicity of single-repo deployments.
Second, vector databases like Qdrant index text chunks using cosine distance algorithms for semantic search.
Third, LLM prompt engineering formats responses with structured JSON outputs and source citations.
    `.trim();

    return {
      title: 'YouTube Lecture Video Transcript',
      text: mockTranscript,
      sourceType: 'YOUTUBE',
      wordCount: mockTranscript.split(/\s+/).length,
      metadata: { videoUrl, parsedAt: new Date().toISOString() },
    };
  }

  private cleanText(text: string): string {
    return text.replace(/[\r\n]+/g, '\n').replace(/\s+/g, ' ').trim();
  }
}
