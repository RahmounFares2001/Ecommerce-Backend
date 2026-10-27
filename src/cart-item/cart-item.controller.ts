import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { CartItemService } from './cart-item.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartItemResponseDto } from './dto/cart-item-response.dto';

import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';

@Controller('cart-items')
export class CartItemController {
  constructor(private readonly cartItemService: CartItemService) {}

  // create
  @Post()
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Add item to cart' })
  async createItem(@Body() dto: CreateCartItemDto): Promise<CartItemResponseDto> {
    return await this.cartItemService.createItem(dto);
  }

  // by id
  @Get(':id')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Get cart item by id' })
  async getItemById(@Param('id') id: string): Promise<CartItemResponseDto> {
    return await this.cartItemService.getItemById(id);
  }

  // by cart
  @Get('cart/:cartId')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Get cart items by cart' })
  async getItemsByCart(
    @Param('cartId') cartId: string,
  ): Promise<CartItemResponseDto[]> {
    return await this.cartItemService.getItemsByCart(cartId);
  }

  // update
  @Patch(':id')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Update cart item' })
  async updateItem(
    @Param('id') id: string,
    @Body() dto: UpdateCartItemDto,
  ): Promise<CartItemResponseDto> {
    return await this.cartItemService.updateItem(id, dto);
  }

  // delete
  @Delete(':id')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Delete cart item' })
  async deleteItem(@Param('id') id: string): Promise<{ message: string }> {
    return await this.cartItemService.deleteItem(id);
  }
}