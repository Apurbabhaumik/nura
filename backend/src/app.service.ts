import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHealth(): { status: string; timestamp: string } {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  }

  async getReadiness(): Promise<{
    status: string;
    timestamp: string;
    dependencies: { database: string };
  }> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ready',
        timestamp: new Date().toISOString(),
        dependencies: { database: 'up' },
      };
    } catch {
      throw new ServiceUnavailableException({
        status: 'not_ready',
        timestamp: new Date().toISOString(),
        dependencies: { database: 'down' },
      });
    }
  }
}
