import { Expose } from 'class-transformer';

export class AuditLogResponseDto {
  @Expose() id!: string;
  @Expose() orderId?: string | null;
  @Expose() userId?: string | null;
  @Expose() action!: string;
  @Expose() payload!: any;
  @Expose() createdAt!: Date;
}