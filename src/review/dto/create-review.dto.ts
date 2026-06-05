import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Max, Min, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateReviewDto {
  @IsUUID()
  @IsNotEmpty()
  productId!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  rating!: number;

  @IsString()
  @IsOptional()
  @Length(5, 1000)
  @Transform(({ value }) => value?.trim())
  comment?: string | null;

  @IsUUID()
  @IsOptional()
  orderItemId?: string | null;
}