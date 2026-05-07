import { Exclude, Expose, Type } from 'class-transformer';
import { AddressResponseDto } from 'src/addresses/dto/address.dto';

export class UserResponseDto {
  @Expose()
  id!: string;

  @Expose()
  email!: string;

  @Expose()
  firstName!: string | null;

  @Expose()
  lastName!: string | null;

  @Expose()
  phone!: string | null;

  @Expose()
  preferredCurrency!: string;

  @Expose()
  preferredLocale!: string;

  @Expose()
  role!: string;

  @Expose()
  isActive!: boolean;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;

  @Expose()
  @Type(() => AddressResponseDto)
  addresses?: AddressResponseDto[];

  // Exclude sensitive fields
  // @Exclude()
  // passwordHash!: string;
}