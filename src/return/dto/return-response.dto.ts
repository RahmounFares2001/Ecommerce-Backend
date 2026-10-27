import { Expose, Type } from 'class-transformer';
import { ReturnItemResponseDto } from './return-item-response.dto';

export class ReturnResponseDto {
  @Expose() id!: string;
  @Expose() orderId!: string;
  @Expose() userId!: string;
  @Expose() reason!: string;
  @Expose() reasonNote?: string | null;
  @Expose() status!: string;
  @Expose() resolvedAt?: Date | null;
  @Expose() createdAt!: Date;
  @Expose() updatedAt!: Date;

  @Expose()
  @Type(() => ReturnItemResponseDto)
  items!: ReturnItemResponseDto[];
}