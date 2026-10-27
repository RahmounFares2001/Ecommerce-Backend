import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { NotificationService } from './notification.service';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { NotificationResponseDto } from './dto/notification-response.dto';

import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { JwtPayloadType } from 'src/common/types/jwt-payload.type';

@Controller('notifications')
@UseGuards(AccessTokenGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // list
  @Get()
  @ApiOperation({ summary: 'Get my notifications' })
  async getMyNotifications(
    @CurrentUser() user: JwtPayloadType,
    @Query() query: NotificationQueryDto,
  ): Promise<NotificationResponseDto[]> {
    return await this.notificationService.getMyNotifications(user.id, query);
  }

  // unread count
  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notifications count' })
  async getUnreadCount(
    @CurrentUser() user: JwtPayloadType,
  ): Promise<{ count: number }> {
    return await this.notificationService.getUnreadCount(user.id);
  }

  // mark all read
  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(
    @CurrentUser() user: JwtPayloadType,
  ): Promise<{ count: number }> {
    return await this.notificationService.markAllAsRead(user.id);
  }

  // mark one read
  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markAsRead(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayloadType,
  ): Promise<NotificationResponseDto> {
    return await this.notificationService.markAsRead(id, user.id);
  }

  // delete one
  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification' })
  async deleteNotification(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayloadType,
  ): Promise<{ message: string }> {
    return await this.notificationService.deleteNotification(id, user.id);
  }

  // clear all
  @Delete()
  @ApiOperation({ summary: 'Clear all my notifications' })
  async clearAll(
    @CurrentUser() user: JwtPayloadType,
  ): Promise<{ count: number }> {
    return await this.notificationService.clearAll(user.id);
  }
}