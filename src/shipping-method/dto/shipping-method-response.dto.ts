import { Expose } from 'class-transformer';

export class ShippingMethodResponseDto {
  @Expose() id!: string;
  @Expose() name!: string;
  @Expose() price!: string;
  @Expose() estimatedDaysMin!: number;
  @Expose() estimatedDaysMax!: number;
  @Expose() isActive!: boolean;
}