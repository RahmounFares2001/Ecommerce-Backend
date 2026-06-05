import { Expose, Type, Transform } from 'class-transformer';
import { ReviewUserDto } from './review-user.dto';


export class ReviewResponseDto {
  @Expose()
  id!: string;

  @Expose()
  productId!: string;

  @Expose()
  userId!: string;

  @Expose()
  @Type(() => ReviewUserDto)
  user!: ReviewUserDto;

  @Expose()
  rating!: number;

  @Expose()
  @Transform(({ value }) => value ?? undefined)
  comment?: string | null;

  @Expose()
  isApproved!: boolean;

  @Expose()
  createdAt!: Date;

  @Expose()
  @Transform(({ value }) => value ?? undefined)
  orderItemId?: string | null;
}