import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { toDto } from 'src/common/utils/to-dto.util';
import { Prisma } from '@prisma/client';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  // my notifications (paginated, filtered)
  async getMyNotifications(
    userId: string,
    query: NotificationQueryDto,
  ): Promise<NotificationResponseDto[]> {
    const { page = 1, limit = 20, isRead, type } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.NotificationWhereInput = {
      userId,
      ...(isRead !== undefined ? { isRead } : {}),
      ...(type ? { type } : {}),
    };

    const notifications = await this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    return toDto(NotificationResponseDto, notifications);
  }

  // unread count (number)
  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { count };
  }

  // mark one as read
  async markAsRead(id: string, userId: string): Promise<NotificationResponseDto> {
    const notif = await this.prisma.notification.findUnique({ where: { id } });
    if (!notif) {
      throw new NotFoundException('Notification not found');
    }
    if (notif.userId !== userId) {
      throw new ForbiddenException('Not your notification');
    }

    if (notif.isRead) {
      return toDto(NotificationResponseDto, notif);
    }

    const updated = await this.prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });

    return toDto(NotificationResponseDto, updated);
  }

  // mark all as read
  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return { count: result.count };
  }

  // delete one
  async deleteNotification(id: string, userId: string): Promise<{ message: string }> {
    const notif = await this.prisma.notification.findUnique({ where: { id } });
    if (!notif) {
      throw new NotFoundException('Notification not found');
    }
    if (notif.userId !== userId) {
      throw new ForbiddenException('Not your notification');
    }

    await this.prisma.notification.delete({ where: { id } });
    return { message: 'Notification deleted' };
  }

  // clear all my notifications
  async clearAll(userId: string): Promise<{ count: number }> {
    const result = await this.prisma.notification.deleteMany({
      where: { userId },
    });
    return { count: result.count };
  }
}