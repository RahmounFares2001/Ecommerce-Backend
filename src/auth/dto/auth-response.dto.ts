// src/auth/dto/auth-response.dto.ts
import { Expose, Type } from 'class-transformer';

export class AuthResponseDto {
  @Expose()
  accessToken!: string;

  @Expose()
  refreshToken?: string;

  @Expose()
  @Type(() => Object) 
  user!: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
    preferredCurrency?: string;
    preferredLocale?: string;
  };
}