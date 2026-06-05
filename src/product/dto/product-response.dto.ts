import { Expose, Type, Transform } from 'class-transformer';
import { CategoryResponseDto } from 'src/category/dto/category-response.dto';
import { ProductImageDto } from 'src/product-image/dto/product-image.dto';
import { ProductVariantDto } from 'src/product-variant/dto/product-variant.dto';


export class ProductResponseDto {
  @Expose()
  id!: string;

  @Expose()
  name!: string;

  @Expose()
  slug!: string;

  @Expose()
  @Transform(({ value }) => value ?? undefined)
  description?: string | null;

  @Expose()
  isActive!: boolean;

  @Expose()
  @Transform(({ value }) => value ?? undefined)
  categoryId?: string | null;

  @Expose()
  @Type(() => CategoryResponseDto)
  @Transform(({ value }) => value ?? undefined)
  category?: CategoryResponseDto | null;

  @Expose()
  @Type(() => ProductVariantDto)
  variants?: ProductVariantDto[];

  @Expose()
  @Type(() => ProductImageDto)
  images?: ProductImageDto[];

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;


}