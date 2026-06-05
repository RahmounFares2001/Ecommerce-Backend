import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsUUID, Length, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 255)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 255)
  @Transform(({ value }) => value?.toLowerCase().trim())
  slug!: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value || null)
  description?: string | null;

  @IsUUID()
  @IsOptional()
  categoryId?: string | null;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}