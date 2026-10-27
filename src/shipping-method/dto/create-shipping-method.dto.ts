import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Length, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateShippingMethodDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  price!: number;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  estimatedDaysMin!: number;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  estimatedDaysMax!: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}