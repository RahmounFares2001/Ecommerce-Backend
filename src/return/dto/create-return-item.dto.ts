import { IsInt, IsUUID, Min } from 'class-validator';

export class CreateReturnItemDto {
  @IsUUID()
  orderItemId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;
}