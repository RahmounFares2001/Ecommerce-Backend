import { Expose } from 'class-transformer';

export class ReturnItemResponseDto {
  @Expose() id!: string;
  @Expose() returnId!: string;
  @Expose() orderItemId!: string;
  @Expose() quantity!: number;
}