import { Expose } from 'class-transformer';

export class DiscountValidationResponseDto {
  @Expose() valid!: boolean;
  @Expose() discountAmount!: string;
  @Expose() code!: string;
}