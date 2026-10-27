import { IsInt, IsNotEmpty, IsUUID, Min } from 'class-validator';

export class CreateCartItemDto {
  @IsUUID()
  @IsNotEmpty()
  cartId!: string;

  @IsUUID()
  @IsNotEmpty()
  variantId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;
}