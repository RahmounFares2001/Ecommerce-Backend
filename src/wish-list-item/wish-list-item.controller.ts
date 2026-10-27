import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { AddWishlistItemDto } from './dto/add-wishlist-item.dto';
import { WishlistItemResponseDto } from './dto/wishlist-item-response.dto';

import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { JwtPayloadType } from 'src/common/types/jwt-payload.type';
import { WishlistService } from './wish-list-item.service';

@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  // add
  @Post()
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Add product to wishlist' })
  async addItem(
    @CurrentUser() user: JwtPayloadType,
    @Body() dto: AddWishlistItemDto,
  ): Promise<WishlistItemResponseDto> {
    return await this.wishlistService.addItem(user.id, dto);
  }

  // my wishlist
  @Get('me')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Get my wishlist' })
  async getMyWishlist(
    @CurrentUser() user: JwtPayloadType,
  ): Promise<WishlistItemResponseDto[]> {
    return await this.wishlistService.getMyWishlist(user.id);
  }

  // toggle
  @Post('toggle/:productId')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Toggle product in wishlist' })
  async toggle(
    @CurrentUser() user: JwtPayloadType,
    @Param('productId') productId: string,
  ): Promise<{ added: boolean; message: string }> {
    return await this.wishlistService.toggle(user.id, productId);
  }

  // remove by id
  @Delete(':id')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Remove wishlist item' })
  async removeItem(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayloadType,
  ): Promise<{ message: string }> {
    return await this.wishlistService.removeItem(id, user.id);
  }

  // remove by product
  @Delete('product/:productId')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Remove product from wishlist' })
  async removeByProduct(
    @Param('productId') productId: string,
    @CurrentUser() user: JwtPayloadType,
  ): Promise<{ message: string }> {
    return await this.wishlistService.removeByProduct(user.id, productId);
  }
}