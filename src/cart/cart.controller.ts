import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartResponseDto } from './dto/cart-response.dto';

import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { JwtPayloadType } from 'src/common/types/jwt-payload.type';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // get my cart
  @Get()
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Get my cart' })
  async getCart(
    @CurrentUser() user: JwtPayloadType | undefined,
    @Headers('x-guest-token') guestToken?: string,
  ): Promise<CartResponseDto> {
    return await this.cartService.getCart(user?.id, guestToken);
  }

  // add item
  @Post('items')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Add item to cart' })
  async addItem(
    @CurrentUser() user: JwtPayloadType | undefined,
    @Headers('x-guest-token') guestToken: string | undefined,
    @Body() dto: AddCartItemDto,
  ): Promise<CartResponseDto> {
    return await this.cartService.addItem(user?.id, guestToken, dto);
  }

  // update item quantity
  @Patch('items/:id')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Update cart item' })
  async updateItem(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayloadType | undefined,
    @Headers('x-guest-token') guestToken: string | undefined,
    @Body() dto: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    return await this.cartService.updateItem(id, user?.id, guestToken, dto);
  }

  // remove item
  @Delete('items/:id')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Remove cart item' })
  async removeItem(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayloadType | undefined,
    @Headers('x-guest-token') guestToken: string | undefined,
  ): Promise<CartResponseDto> {
    return await this.cartService.removeItem(id, user?.id, guestToken);
  }

  // clear cart
  @Delete()
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Clear cart' })
  async clearCart(
    @CurrentUser() user: JwtPayloadType | undefined,
    @Headers('x-guest-token') guestToken: string | undefined,
  ): Promise<CartResponseDto> {
    return await this.cartService.clearCart(user?.id, guestToken);
  }

  // merge guest cart into user cart
  @Post('merge')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Merge guest cart into user cart' })
  async mergeGuestCart(
    @CurrentUser() user: JwtPayloadType,
    @Headers('x-guest-token') guestToken: string,
  ): Promise<CartResponseDto> {
    return await this.cartService.mergeGuestCart(user.id, guestToken);
  }
}