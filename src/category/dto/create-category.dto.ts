import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsUUID, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 150)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 150)
  @Transform(({ value }) => value?.toLowerCase().trim())
  slug!: string;

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