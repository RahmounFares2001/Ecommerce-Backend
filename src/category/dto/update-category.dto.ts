import { IsString, IsOptional, IsBoolean, IsUUID, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateCategoryDto {
  @IsString()
  @IsOptional()
  @Length(2, 150)
  name?: string;

  @IsString()
  @IsOptional()
  @Length(2, 150)
  @Transform(({ value }) => value?.toLowerCase().trim())
  slug?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value || null)
  description?: string | null;

  @IsUUID()
  @IsOptional()
  parentId?: string | null;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}