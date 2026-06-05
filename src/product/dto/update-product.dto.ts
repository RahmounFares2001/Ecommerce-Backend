import { IsString, IsOptional, IsBoolean, IsUUID, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  @Length(3, 255)
  name?: string;

  @IsString()
  @IsOptional()
  @Length(3, 255)
  @Transform(({ value }) => value?.toLowerCase().trim())
  slug?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value || null)
  description?: string | null;

  @IsUUID()
  @IsOptional()
  categoryId?: string | null;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}