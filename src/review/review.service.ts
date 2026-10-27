import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { toDto } from 'src/common/utils/to-dto.util';
import { ReviewQuery } from 'src/common/dto/review-query';
import { notify } from 'src/common/helpers/notify.helper';

@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService) {}

  // create review
  async createReview(
    userId: string,
    dto: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (dto.orderItemId) {
      const orderItem = await this.prisma.orderItem.findUnique({
        where: { id: dto.orderItemId },
        include: { order: true, review: true },
      });
      if (!orderItem) {
        throw new NotFoundException('Order item not found');
      }
      if (orderItem.order.userId !== userId) {
        throw new ForbiddenException('This order item is not yours');
      }
      if (orderItem.order.status !== 'delivered') {
        throw new BadRequestException('You can only review delivered items');
      }
      if (orderItem.review) {
        throw new BadRequestException('This order item is already reviewed');
      }
    }

    const review = await this.prisma.review.create({
      data: {
        productId: dto.productId,
        userId,
        rating: dto.rating,
        comment: dto.comment ?? null,
        orderItemId: dto.orderItemId ?? null,
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
    });

    return toDto(ReviewResponseDto, review);
  }

  // public reviews for a product
  async getProductReviews(
    productId: string,
    query: ReviewQuery,
  ): Promise<ReviewResponseDto[]> {
    const { page = 1, limit = 10, rating } = query;
    const skip = (page - 1) * limit;

    const reviews = await this.prisma.review.findMany({
      where: {
        productId,
        isApproved: true,
        ...(rating ? { rating: Number(rating) } : {}),
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
    });

    return toDto(ReviewResponseDto, reviews);
  }

  // my reviews
  async getMyReviews(userId: string): Promise<ReviewResponseDto[]> {
    const reviews = await this.prisma.review.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
    });

    return toDto(ReviewResponseDto, reviews);
  }

  // get by id
  async getReviewById(id: string): Promise<ReviewResponseDto> {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
    });
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return toDto(ReviewResponseDto, review);
  }

  // update (owner)
  async updateReview(
    id: string,
    userId: string,
    dto: UpdateReviewDto,
  ): Promise<ReviewResponseDto> {
    const existing = await this.prisma.review.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Review not found');
    }
    if (existing.userId !== userId) {
      throw new ForbiddenException('You can only update your own review');
    }

    const updated = await this.prisma.review.update({
      where: { id },
      data: {
        rating: dto.rating ?? existing.rating,
        comment: dto.comment !== undefined ? dto.comment : existing.comment,
        isApproved:
          dto.isApproved !== undefined ? dto.isApproved : existing.isApproved,
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
    });

    return toDto(ReviewResponseDto, updated);
  }

  // delete (owner)
  async deleteReview(id: string, userId: string): Promise<{ message: string }> {
    const existing = await this.prisma.review.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Review not found');
    }
    if (existing.userId !== userId) {
      throw new ForbiddenException('You can only delete your own review');
    }

    await this.prisma.review.delete({ where: { id } });

    return { message: 'Review deleted successfully' };
  }

  // admin: approve/reject
  async setApproved(id: string, isApproved: boolean): Promise<ReviewResponseDto> {
    const existing = await this.prisma.review.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Review not found');
    }

    const updated = await this.prisma.review.update({
      where: { id },
      data: { isApproved },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
    });

    // notift when admin approves
    await notify(
      this.prisma,
      existing.userId,
      'review_approved',
      `Your review has been approved.`,
    );

    return toDto(ReviewResponseDto, updated);
  }

  // admin: delete any review
  async adminDeleteReview(id: string): Promise<{ message: string }> {
    const existing = await this.prisma.review.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Review not found');
    }

    await this.prisma.review.delete({ where: { id } });

    return { message: 'Review deleted successfully' };
  }
}


