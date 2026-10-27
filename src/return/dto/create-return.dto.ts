import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { ReturnReason } from '@prisma/client';
import { CreateReturnItemDto } from './create-return-item.dto';

export class CreateReturnDto {
  @IsUUID()
  @IsNotEmpty()
  orderId!: string;

  @IsEnum(ReturnReason)
  reason!: ReturnReason;

  @IsString()
  @IsOptional()
  reasonNote?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateReturnItemDto)
  items!: CreateReturnItemDto[];
}