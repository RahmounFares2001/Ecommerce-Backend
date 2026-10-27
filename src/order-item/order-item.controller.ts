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

import { OrderItemService } from './order-item.service';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { OrderItemResponseDto } from './dto/order-item-response.dto';

import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { JwtPayloadType } from 'src/common/types/jwt-payload.type';
import { Role } from 'src/common/enums/role.enum';

@Controller('order-items')
export class OrderItemController {
  constructor(private readonly orderItemService: OrderItemService) {}

  // add item
  @Post()
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Add item to order' })
  async addItem(
    @CurrentUser() user: JwtPayloadType,
    @Body() dto: CreateOrderItemDto,
  ): Promise<OrderItemResponseDto> {
    const isAdmin = (user as any).role === Role.Admin;
    return await this.orderItemService.addItem(user.id, isAdmin, dto);
  }

  // get item by id
  @Get(':id')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Get order item by id' })
  async getItemById(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayloadType,
  ): Promise<OrderItemResponseDto> {
    const isAdmin = (user as any).role === Role.Admin;
    return await this.orderItemService.getItemById(id, user.id, isAdmin);
  }

  // get items by order
  @Get('order/:orderId')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Get order items by order' })
  async getItemsByOrder(
    @Param('orderId') orderId: string,
    @CurrentUser() user: JwtPayloadType,
  ): Promise<OrderItemResponseDto[]> {
    const isAdmin = (user as any).role === Role.Admin;
    return await this.orderItemService.getItemsByOrder(orderId, user.id, isAdmin);
  }

  // update quantity
  @Patch(':id')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Update order item quantity' })
  async updateItem(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayloadType,
    @Body() dto: UpdateOrderItemDto,
  ): Promise<OrderItemResponseDto> {
    const isAdmin = (user as any).role === Role.Admin;
    return await this.orderItemService.updateItem(id, user.id, isAdmin, dto);
  }

  // remove item
  @Delete(':id')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Remove order item' })
  async removeItem(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayloadType,
  ): Promise<{ message: string }> {
    const isAdmin = (user as any).role === Role.Admin;
    return await this.orderItemService.removeItem(id, user.id, isAdmin);
  }
}