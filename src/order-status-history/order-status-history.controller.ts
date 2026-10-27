import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { OrderStatusHistoryService } from './order-status-history.service';
import { OrderStatusHistoryResponseDto } from './dto/order-status-history-response.dto';

import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { JwtPayloadType } from 'src/common/types/jwt-payload.type';
import { Role } from 'src/common/enums/role.enum';

@Controller('order-status-history')
export class OrderStatusHistoryController {
  constructor(
    private readonly orderStatusHistoryService: OrderStatusHistoryService,
  ) {}

  // by order
  @Get('order/:orderId')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Get status history by order' })
  async getByOrder(
    @Param('orderId') orderId: string,
    @CurrentUser() user: JwtPayloadType,
  ): Promise<OrderStatusHistoryResponseDto[]> {
    const isAdmin = (user as any).role === Role.Admin;
    return await this.orderStatusHistoryService.getByOrder(
      orderId,
      user.id,
      isAdmin,
    );
  }

  // by id
  @Get(':id')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Get status history entry by id' })
  async getById(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayloadType,
  ): Promise<OrderStatusHistoryResponseDto> {
    const isAdmin = (user as any).role === Role.Admin;
    return await this.orderStatusHistoryService.getById(id, user.id, isAdmin);
  }
}