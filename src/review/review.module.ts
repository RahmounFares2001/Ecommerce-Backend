import { Module } from '@nestjs/common';
import { ReviewController } from './review.service';
import { ReviewService } from './review.controller';

@Module({
  controllers: [ReviewController],
  providers: [ReviewService],
  exports: [ReviewService]
})
export class ReviewModule {}
