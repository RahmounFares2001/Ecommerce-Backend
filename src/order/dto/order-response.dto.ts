import { Expose, Type } from 'class-transformer';
import { OrderItemResponseDto } from './order-item-response.dto';

export class OrderResponseDto {
  @Expose() id!: string;
  @Expose() orderNumber!: string;
  @Expose() userId?: string | null;
  @Expose() status!: string;
  @Expose() codStatus!: string;
  @Expose() currency!: string;
  @Expose() subtotal!: string;
  @Expose() discountAmount!: string;
  @Expose() shippingCost!: string;
  @Expose() totalAmount!: string;
  @Expose() shippingSnapshot!: any;
  @Expose() notes?: string | null;
  @Expose() createdAt!: Date;
  @Expose() updatedAt!: Date;

  @Expose()
  @Type(() => OrderItemResponseDto)
  items!: OrderItemResponseDto[];
}