import { Expose, Type } from 'class-transformer';
import { ProductResponseDto } from 'src/product/dto/product-response.dto';

export class WishlistItemResponseDto {
  @Expose() id!: string;
  @Expose() userId!: string;
  @Expose() productId!: string;
  @Expose() createdAt!: Date;

  @Expose()
  @Type(() => ProductResponseDto)
  product!: ProductResponseDto;
}