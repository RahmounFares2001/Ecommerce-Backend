import { Expose, Type } from 'class-transformer';
import { ProductVariantDto } from 'src/product-variant/dto/product-variant.dto';

export class CartItemResponseDto {
  @Expose()
  id!: string;

  @Expose()
  cartId!: string;

  @Expose()
  variantId!: string;

  @Expose()
  quantity!: number;

  @Expose()
  @Type(() => ProductVariantDto)
  variant!: ProductVariantDto;
}