import {
    IsBoolean,
    IsDateString,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
    Length,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DiscountScope, DiscountType, SupportedCurrency } from '@prisma/client';

export class CreateDiscountCodeDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  code!: string;

  @IsString()
  @IsOptional()
  @Length(0, 255)
  description?: string;

  @IsEnum(DiscountType)
  discountType!: DiscountType;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  discountValue!: number;

  @IsEnum(SupportedCurrency)
  @IsOptional()
  currency?: SupportedCurrency;

  @IsEnum(DiscountScope)
  @IsOptional()
  scope?: DiscountScope;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsUUID()
  @IsOptional()
  productId?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  minOrderAmount?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  usageLimit?: number;

  @IsDateString()
  @IsOptional()
  expiresAt?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}