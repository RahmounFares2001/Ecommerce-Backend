import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CodStatus } from '@prisma/client';

export class UpdateCodStatusDto {
  @IsEnum(CodStatus)
  codStatus!: CodStatus;

  @IsString()
  @IsOptional()
  codNotes?: string;
}