import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UpdateCodStatusDto } from './dto/update-cod-status.dto';
import { OrderResponseDto } from './dto/order-response.dto';

import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { JwtPayloadType } from 'src/common/types/jwt-payload.type';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // create order
  @Post()
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Create order from cart' })
  async createOrder(
    @CurrentUser() user: JwtPayloadType | undefined,
    @Headers('x-guest-token') guestToken: string | undefined,
    @Body() dto: CreateOrderDto,
  ): Promise<OrderResponseDto> {
    return await this.orderService.createOrder(user?.id, guestToken, dto);
  }

  // my orders
  @Get('me')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Get my orders' })
  async getMyOrders(@CurrentUser() user: JwtPayloadType): Promise<OrderResponseDto[]> {
    return await this.orderService.getMyOrders(user.id);
  }

  // admin: all orders
  @Get()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Get all orders (admin)' })
  async getAllOrders(): Promise<OrderResponseDto[]> {
    return await this.orderService.getAllOrders();
  }

  // get by id
  @Get(':id')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Get order by id' })
  async getOrderById(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayloadType,
  ): Promise<OrderResponseDto> {
    const isAdmin = (user as any).role === Role.Admin;
    return await this.orderService.getOrderById(id, user.id, isAdmin);
  }

  // admin: update status
  @Patch(':id/status')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Update order status (admin)' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ): Promise<OrderResponseDto> {
    return await this.orderService.updateStatus(id, dto);
  }

  // admin: update COD status
  @Patch(':id/cod')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Update COD status (admin)' })
  async updateCodStatus(
    @Param('id') id: string,
    @Body() dto: UpdateCodStatusDto,
  ): Promise<OrderResponseDto> {
    return await this.orderService.updateCodStatus(id, dto);
  }

  // cancel order
  @Patch(':id/cancel')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Cancel order' })
  async cancelOrder(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayloadType,
    @Body() body: { note?: string },
  ): Promise<OrderResponseDto> {
    const isAdmin = (user as any).role === Role.Admin;
    return await this.orderService.cancelOrder(id, user.id, isAdmin, body?.note);
  }
}