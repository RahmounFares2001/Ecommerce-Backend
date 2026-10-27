import { IsInt, Min } from 'class-validator';

export class UpdateReturnItemDto {
  @IsInt()
  @Min(1)
  quantity!: number;
}