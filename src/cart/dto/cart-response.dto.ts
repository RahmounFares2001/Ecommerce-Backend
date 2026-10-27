import { Expose, Type } from 'class-transformer';
import { CartItemResponseDto } from './cart-item-response.dto';

export class CartResponseDto {
  @Expose()
  id!: string;

  @Expose()
  userId?: string | null;

  @Expose()
  guestToken?: string | null;

  @Expose()
  @Type(() => CartItemResponseDto)
  items!: CartItemResponseDto[];

  @Expose()
  updatedAt!: Date;
}