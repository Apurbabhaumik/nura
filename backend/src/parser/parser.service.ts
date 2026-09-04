import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import pdfParse from 'pdf-parse';
import { YoutubeTranscript } from 'youtube-transcript';

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
  private readonly maxRepoFiles = 120;
  private readonly maxRepoChars = 450_000;

  constructor(private readonly config: ConfigService) {}

  async parseFile(filename: string, fileType: string, buffer?: Buffer): Promise<ParsedContent> {
    if (!buffer?.length) throw new BadRequestException('The uploaded file is empty.');
    if (buffer.length > 50 * 1024 * 1024) throw new BadRequestException('Files larger than 50MB are not supported.');

    this.logger.log(`Parsing file: ${filename} (${fileType})`);
    const ext = filename.toLowerCase().split('.').pop() || '';
    let extractedText = '';
    let metadata: Record<string, any> = { filename, parsedAt: new Date().toISOString() };

    if (ext === 'pdf' || fileType.toLowerCase().includes('pdf')) {
      const parsed = await pdfParse(buffer);
      extractedText = parsed.text;
      metadata = { ...metadata, pages: parsed.numpages, pdfInfo: parsed.info };
    } else if (['txt', 'md', 'markdown', 'csv', 'json', 'js', 'ts', 'tsx', 'jsx', 'py', 'java', 'scala', 'html', 'css', 'xml', 'yaml', 'yml'].includes(ext) || fileType.startsWith('text/')) {
      extractedText = buffer.toString('utf-8');
    } else {
      throw new BadRequestException(`Unsupported file type: .${ext || 'unknown'}. Upload PDF, text, Markdown, code, CSV, or JSON.`);
    }

    const cleanText = this.cleanText(extractedText);
    if (!cleanText) throw new BadRequestException('No readable text was found in the file.');

    return {
      title: filename.replace(/\.[^/.]+$/, ''),
      text: cleanText,
      sourceType: ext === 'pdf' ? 'PDF' : fileType.toUpperCase(),
      wordCount: this.wordCount(cleanText),
      metadata,
    };
  }

  async parseGitHubRepo(repoUrl: string): Promise<ParsedContent> {
    const parsedUrl = new URL(repoUrl);
    if (parsedUrl.protocol !== 'https:' || parsedUrl.hostname !== 'github.com') {
      throw new BadRequestException('Only https://github.com repository URLs are supported.');
    }

    const path = parsedUrl.pathname.replace(/^\/+|\/+$/g, '').replace(/\.git$/, '');
    const [owner, repo] = path.split('/');
    if (!owner || !repo) throw new BadRequestException('Invalid GitHub repository URL.');

    this.logger.log(`Ingesting GitHub repository ${owner}/${repo}`);
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'NURA-Ingestion',
      'X-GitHub-Api-Version': '2022-11-28',
    };
    const token = this.config.get<string>('GITHUB_TOKEN');
    if (token) headers.Authorization = `Bearer ${token}`;

    const repoResponse = await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`, { headers });
    if (!repoResponse.ok) throw new BadRequestException(`Unable to read GitHub repository (${repoResponse.status}).`);
    const repoInfo: any = await repoResponse.json();
    const branch = repoInfo.default_branch || 'main';

    const treeResponse = await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/${encodeURIComponent(branch)}?recursive=1`, { headers });
    if (!treeResponse.ok) throw new BadRequestException(`Unable to enumerate repository files (${treeResponse.status}).`);
    const treeData: any = await treeResponse.json();

    const allowedExtensions = new Set(['md', 'txt', 'json', 'yaml', 'yml', 'ts', 'tsx', 'js', 'jsx', 'py', 'java', 'scala', 'go', 'rs', 'c', 'cpp', 'h', 'hpp', 'cs', 'rb', 'php', 'html', 'css', 'sql', 'sh', 'toml']);
    const ignored = /(^|\/)(node_modules|dist|build|\.next|coverage|vendor|target|\.git)(\/|$)/;
    const files = (treeData.tree || [])
      .filter((item: any) => item.type === 'blob' && !ignored.test(item.path))
      .filter((item: any) => {
        const extension = String(item.path).split('.').pop()?.toLowerCase();
        return extension ? allowedExtensions.has(extension) : false;
      })
      .filter((item: any) => !item.size || item.size <= 200_000)
      .slice(0, this.maxRepoFiles);

    const sections: string[] = [
      `# Repository: ${owner}/${repo}`,
      repoInfo.description ? `Description: ${repoInfo.description}` : '',
      repoInfo.language ? `Primary language: ${repoInfo.language}` : '',
    ].filter(Boolean);

    let totalChars = sections.join('\n').length;
    for (const file of files) {
      if (totalChars >= this.maxRepoChars) break;
      const rawUrl = `https://raw.githubusercontent.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${encodeURIComponent(branch)}/${file.path.split('/').map(encodeURIComponent).join('/')}`;
      const res = await fetch(rawUrl, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
      if (!res.ok) continue;
      const text = await res.text();
      const remaining = this.maxRepoChars - totalChars;
      const clipped = text.slice(0, Math.max(0, remaining));
      sections.push(`\n## File: ${file.path}\n${clipped}`);
      totalChars += clipped.length;
    }

    const cleanText = this.cleanText(sections.join('\n'));
    if (!cleanText) throw new BadRequestException('No readable repository content was found.');

    return {
      title: `GitHub: ${owner}/${repo}`,
      text: cleanText,
      sourceType: 'GITHUB',
      wordCount: this.wordCount(cleanText),
      metadata: {
        repoUrl,
        owner,
        repo,
        branch,
        filesIncluded: files.length,
        truncated: treeData.truncated === true || totalChars >= this.maxRepoChars,
        parsedAt: new Date().toISOString(),
      },
    };
  }

  async parseYouTubeVideo(videoUrl: string): Promise<ParsedContent> {
    const parsedUrl = new URL(videoUrl);
    const allowedHosts = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be']);
    if (parsedUrl.protocol !== 'https:' || !allowedHosts.has(parsedUrl.hostname)) {
      throw new BadRequestException('Only HTTPS YouTube URLs are supported.');
    }

    this.logger.log(`Fetching YouTube transcript: ${videoUrl}`);
    try {
      const transcript = await YoutubeTranscript.fetchTranscript(videoUrl);
      const text = this.cleanText(transcript.map((entry: any) => entry.text).join(' '));
      if (!text) throw new Error('Empty transcript');
      const videoId = this.extractYouTubeId(parsedUrl);

      return {
        title: `YouTube: ${videoId || 'Video transcript'}`,
        text,
        sourceType: 'YOUTUBE',
        wordCount: this.wordCount(text),
        metadata: { videoUrl, videoId, transcriptSegments: transcript.length, parsedAt: new Date().toISOString() },
      };
    } catch (error: any) {
      this.logger.warn(`YouTube transcript unavailable: ${error?.message || error}`);
      throw new BadRequestException('This YouTube video does not expose a transcript that NURA can read.');
    }
  }

  private extractYouTubeId(url: URL): string | null {
    if (url.hostname === 'youtu.be') return url.pathname.split('/').filter(Boolean)[0] || null;
    if (url.pathname.startsWith('/shorts/')) return url.pathname.split('/')[2] || null;
    return url.searchParams.get('v');
  }

  private wordCount(text: string): number {
    return text.split(/\s+/).filter(Boolean).length;
  }

  private cleanText(text: string): string {
    return text
      .replace(/\u0000/g, '')
      .replace(/\r\n/g, '\n')
      .replace(/[\t ]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }
}
