import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { ReviewQuery } from 'src/common/dto/review-query';

import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { JwtPayloadType } from 'src/common/types/jwt-payload.type';
import { ReviewService } from './review.service';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  // create
  @Post()
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Create review' })
  async createReview(
    @CurrentUser() user: JwtPayloadType,
    @Body() dto: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
    return await this.reviewService.createReview(user.id, dto);
  }

  // product reviews (public)
  @Get('product/:productId')
  @ApiOperation({ summary: 'Get product reviews' })
  async getProductReviews(
    @Param('productId') productId: string,
    @Query() query: ReviewQuery,
  ): Promise<ReviewResponseDto[]> {
    return await this.reviewService.getProductReviews(productId, query);
  }

  // my reviews
  @Get('me')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Get my reviews' })
  async getMyReviews(
    @CurrentUser() user: JwtPayloadType,
  ): Promise<ReviewResponseDto[]> {
    return await this.reviewService.getMyReviews(user.id);
  }

  // by id
  @Get(':id')
  @ApiOperation({ summary: 'Get review by id' })
  async getReviewById(@Param('id') id: string): Promise<ReviewResponseDto> {
    return await this.reviewService.getReviewById(id);
  }

  // update (owner)
  @Patch(':id')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Update review' })
  async updateReview(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayloadType,
    @Body() dto: UpdateReviewDto,
  ): Promise<ReviewResponseDto> {
    return await this.reviewService.updateReview(id, user.id, dto);
  }

  // delete (owner)
  @Delete(':id')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Delete review' })
  async deleteReview(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayloadType,
  ): Promise<{ message: string }> {
    return await this.reviewService.deleteReview(id, user.id);
  }

  // admin approve
  @Patch(':id/approve')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Approve review (admin)' })
  async approveReview(@Param('id') id: string): Promise<ReviewResponseDto> {
    return await this.reviewService.setApproved(id, true);
  }

  // admin reject
  @Patch(':id/reject')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Reject review (admin)' })
  async rejectReview(@Param('id') id: string): Promise<ReviewResponseDto> {
    return await this.reviewService.setApproved(id, false);
  }

  // admin delete
  @Delete(':id/admin')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Delete review (admin)' })
  async adminDeleteReview(@Param('id') id: string): Promise<{ message: string }> {
    return await this.reviewService.adminDeleteReview(id);
  }
}