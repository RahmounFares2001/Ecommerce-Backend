import { IsInt, IsOptional, IsString, Max, Min, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateReviewDto {
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  @IsString()
  @IsOptional()
  @Length(5, 1000)
  @Transform(({ value }) => value?.trim())
  comment?: string | null;

  @IsOptional()
  isApproved?: boolean; 
}