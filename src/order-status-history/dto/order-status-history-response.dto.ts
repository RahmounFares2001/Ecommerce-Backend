import { Expose } from 'class-transformer';

export class OrderStatusHistoryResponseDto {
  @Expose() id!: string;
  @Expose() orderId!: string;
  @Expose() status!: string;
  @Expose() note?: string | null;
  @Expose() createdAt!: Date;
}