import { IsInt, IsUUID, Min } from 'class-validator';

export class CreateReturnItemDto {
  @IsUUID()
  returnId!: string;

  @IsUUID()
  orderItemId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;
}