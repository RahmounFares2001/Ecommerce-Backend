import { IsNotEmpty, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateOrderDto {
  @IsUUID()
  @IsOptional()
  shippingAddressId?: string;

  @IsUUID()
  @IsNotEmpty()
  shippingMethodId!: string;

  @IsString()
  @IsOptional()
  @Length(1, 50)
  discountCode?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}