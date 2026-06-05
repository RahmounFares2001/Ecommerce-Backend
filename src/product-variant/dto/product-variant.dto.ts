import { Expose, Type } from "class-transformer";
import { ProductImageDto } from "src/product-image/dto/product-image.dto";

export class ProductVariantDto {
    @Expose()
    id!: string;
  
    @Expose()
    sku!: string;
  
    @Expose()
    price!: number; // Decimal to number in response
  
    @Expose()
    comparePrice?: number | null;
  
    @Expose()
    stockQuantity!: number;
  
    @Expose()
    attributes?: Record<string, any>;
  
    @Expose()
    isActive!: boolean;
  
    @Expose()
    @Type(() => ProductImageDto)
    images?: ProductImageDto[];
  }