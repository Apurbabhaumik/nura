import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  async getDashboardStats(@GetUser('id') userId: string) {
    return this.analyticsService.getDashboardStats(userId);
  }

  @Post('log-time')
  async logStudyTime(@GetUser('id') userId: string, @Body('minutes') minutes: number) {
    return this.analyticsService.logStudyTime(userId, minutes || 15);
  }
}
