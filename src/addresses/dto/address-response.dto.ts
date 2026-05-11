import { Expose } from 'class-transformer';

export class AddressResponseDto {
  @Expose()
  id!: string;

  @Expose()
  label!: string | null
  
  @Expose()
  streetLine1!: string;

  @Expose()
  streetLine2!: string | null;

  @Expose()
  city!: string;

  @Expose()
  state!: string| null;

  @Expose()
  postalCode!: string;

  @Expose()
  countryCode!: string;

  @Expose()
  isDefault!: boolean;
}