import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { AuditAction } from '@prisma/client';
import { BaseQueryDto } from 'src/common/dto/base-query.dto';

export class AuditLogQueryDto extends BaseQueryDto {
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsEnum(AuditAction)
  action?: AuditAction;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}