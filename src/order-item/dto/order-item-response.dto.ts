import { Expose } from 'class-transformer';

export class OrderItemResponseDto {
  @Expose() id!: string;
  @Expose() orderId!: string;
  @Expose() variantId?: string | null;
  @Expose() quantity!: number;
  @Expose() unitPrice!: string;
  @Expose() totalPrice!: string;
  @Expose() productName!: string;
  @Expose() variantSnapshot!: any;
}