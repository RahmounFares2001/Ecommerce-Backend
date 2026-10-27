import { Expose } from 'class-transformer';

export class NotificationResponseDto {
  @Expose() id!: string;
  @Expose() userId!: string;
  @Expose() type!: string;
  @Expose() message!: string;
  @Expose() isRead!: boolean;
  @Expose() createdAt!: Date;
  @Expose() readAt?: Date | null;
}