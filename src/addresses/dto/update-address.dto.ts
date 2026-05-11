import { IsBoolean, IsOptional, IsString, Length, Matches } from 'class-validator';

export class UpdateAddressDto {
  @IsOptional()
  @IsString()
  @Length(1, 50)
  label?: string;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  streetLine1?: string;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  streetLine2?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  city?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  state?: string;

  @IsOptional()
  @IsString()
  @Length(3, 20)
  postalCode?: string;

  @IsOptional()
  @Matches(/^[A-Z]{2}$/)
  countryCode?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}