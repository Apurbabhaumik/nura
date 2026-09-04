import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats(userId: string) {
    const courses = await this.prisma.course.findMany({
      where: { workspace: { ownerId: userId } },
      include: { modules: { include: { lessons: true } } },
    });
    const userProgress = await this.prisma.progress.findMany({
      where: { userId, lesson: { module: { course: { workspace: { ownerId: userId } } } } },
      include: { lesson: { include: { module: { include: { course: true } } } } },
    });
    const sessions = await this.prisma.studySession.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 500 });
    const attempts = await this.prisma.quizAttempt.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 500 });

    const totalAssignedLessons = courses.reduce((sum, course) => sum + course.modules.reduce((m, mod) => m + mod.lessons.length, 0), 0);
    const completedLessons = userProgress.filter((p) => p.completed).length;
    const totalStudyMinutes = sessions.reduce((sum, session) => sum + session.minutes, 0);
    const averageQuizScore = attempts.length ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length) : 0;
    const weakAreas = userProgress.filter((p) => p.percentage < 70).map((p) => ({ lessonId: p.lessonId, lessonTitle: p.lesson?.title || 'Lesson', courseTitle: p.lesson?.module?.course?.title || 'Course', score: p.percentage, recommendation: 'Re-read the lesson and review its flashcards before retrying the quiz.' }));

    const activity = new Map<string, number>();
    sessions.forEach((session) => {
      const day = session.createdAt.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
      activity.set(day, (activity.get(day) || 0) + session.minutes);
    });

    return {
      dailyStreakDays: this.calculateStreak(sessions.map((s) => s.createdAt)),
      totalStudyMinutes,
      completedLessons,
      totalAssignedLessons,
      completionRate: totalAssignedLessons ? Math.round((completedLessons / totalAssignedLessons) * 100) : 0,
      averageQuizScore,
      coursesCount: courses.length,
      quizAttempts: attempts.length,
      weakAreas,
      weeklyActivity: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({ day, minutes: activity.get(day) || 0 })),
    };
  }

  private calculateStreak(dates: Date[]) {
    const days = new Set(dates.map((date) => date.toISOString().slice(0, 10)));
    let streak = 0;
    const cursor = new Date();
    cursor.setUTCHours(0, 0, 0, 0);
    while (days.has(cursor.toISOString().slice(0, 10))) { streak++; cursor.setUTCDate(cursor.getUTCDate() - 1); }
    return streak;
  }

  async logStudyTime(userId: string, minutes: number) {
    const safeMinutes = Math.max(1, Math.min(Math.round(Number(minutes) || 15), 480));
    return this.prisma.studySession.create({ data: { userId, minutes: safeMinutes } });
  }
}
