import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderStatusHistoryResponseDto } from './dto/order-status-history-response.dto';
import { toDto } from 'src/common/utils/to-dto.util';
import { assertOrderAccess } from 'src/common/helpers/order-access.helper';

@Injectable()
export class OrderStatusHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  // get history by order
  async getByOrder(
    orderId: string,
    userId: string,
    isAdmin: boolean,
  ): Promise<OrderStatusHistoryResponseDto[]> {
    await assertOrderAccess(this.prisma, orderId, userId, isAdmin, false);

    const history = await this.prisma.orderStatusHistory.findMany({
      where: { orderId },
      orderBy: { createdAt: 'asc' },
    });

    return toDto(OrderStatusHistoryResponseDto, history);
  }

  // get single entry by id
  async getById(
    id: string,
    userId: string,
    isAdmin: boolean,
  ): Promise<OrderStatusHistoryResponseDto> {
    const entry = await this.prisma.orderStatusHistory.findUnique({
      where: { id },
    });
    if (!entry) {
      throw new NotFoundException('History entry not found');
    }

    await assertOrderAccess(this.prisma, entry.orderId, userId, isAdmin, false);

    return toDto(OrderStatusHistoryResponseDto, entry);
  }
}