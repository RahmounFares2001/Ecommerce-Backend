import { IsOptional, IsString, IsEmail, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateProfileDto {
  @IsOptional()
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9\s-]{8,15}$/)
  phone?: string;

  @IsOptional()
  preferredCurrency?: 'DZD' | 'USD' | 'EUR';

  @IsOptional()
  preferredLocale?: 'ar_DZ' | 'fr_DZ' | 'en_US';
}