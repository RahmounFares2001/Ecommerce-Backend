import { IsBoolean, IsOptional, IsString, Length, Matches } from 'class-validator';

export class CreateAddressDto {
  @IsOptional()
  @IsString()
  @Length(1, 50)
  label?: string; // "Home", "Work"

  @IsString()
  @Length(1, 255)
  streetLine1!: string;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  streetLine2?: string;

  @IsString()
  @Length(1, 100)
  city!: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  state?: string;

  @IsString()
  @Length(3, 20)
  postalCode!: string;

  @IsOptional()
  @Matches(/^[A-Z]{2}$/)
  countryCode?: string = 'DZ';

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}