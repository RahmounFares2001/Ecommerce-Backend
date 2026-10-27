import { Expose } from 'class-transformer';

export class DiscountCodeResponseDto {
  @Expose() id!: string;
  @Expose() code!: string;
  @Expose() description?: string | null;
  @Expose() discountType!: string;
  @Expose() discountValue!: string;
  @Expose() currency!: string;
  @Expose() scope!: string;
  @Expose() categoryId?: string | null;
  @Expose() productId?: string | null;
  @Expose() minOrderAmount?: string | null;
  @Expose() usageLimit?: number | null;
  @Expose() usedCount!: number;
  @Expose() expiresAt?: Date | null;
  @Expose() isActive!: boolean;
}