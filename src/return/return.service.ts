import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReturnDto } from './dto/create-return.dto';
import { UpdateReturnStatusDto } from './dto/update-return-status.dto';
import { ReturnResponseDto } from './dto/return-response.dto';
import { toDto } from 'src/common/utils/to-dto.util';
import { writeAudit } from 'src/common/helpers/audit.helper';
import { notify } from 'src/common/helpers/notify.helper';

const returnInclude = {
  items: true,
};

@Injectable()
export class ReturnService {
  constructor(private readonly prisma: PrismaService) {}

  // create return request 
  async createReturn(
    userId: string,
    dto: CreateReturnDto,
  ): Promise<ReturnResponseDto> {
    // load order + items
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: { items: true },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (order.userId !== userId) {
      throw new ForbiddenException('Not your order');
    }
    if (order.status !== 'delivered') {
      throw new BadRequestException('Only delivered orders can be returned');
    }

    // validate each item belongs to the order and quantity is valid
    for (const item of dto.items) {
      const orderItem = order.items.find((i) => i.id === item.orderItemId);
      if (!orderItem) {
        throw new BadRequestException(
          `Order item ${item.orderItemId} does not belong to this order`,
        );
      }
      if (item.quantity > orderItem.quantity) {
        throw new BadRequestException(
          `Return quantity exceeds ordered quantity for item ${item.orderItemId}`,
        );
      }
    }

    // prevent items already in an active return
    const activeReturnItems = await this.prisma.returnItem.findMany({
      where: {
        orderItemId: { in: dto.items.map((i) => i.orderItemId) },
        return: { status: { in: ['pending', 'approved'] } },
      },
      select: { orderItemId: true },
    });
    if (activeReturnItems.length > 0) {
      const conflictIds = activeReturnItems.map((i) => i.orderItemId);
      throw new BadRequestException(
        `Items already in an active return: ${conflictIds.join(', ')}`,
      );
    }

    const created = await this.prisma.$transaction(async (tx) => {
      return await tx.return.create({
        data: {
          orderId: dto.orderId,
          userId,
          reason: dto.reason,
          reasonNote: dto.reasonNote ?? null,
          status: 'pending',
          items: {
            create: dto.items.map((i) => ({
              orderItemId: i.orderItemId,
              quantity: i.quantity,
            })),
          },
        },
        include: returnInclude,
      });
    });

    return toDto(ReturnResponseDto, created);
  }

  // my returns
  async getMyReturns(userId: string): Promise<ReturnResponseDto[]> {
    const returns = await this.prisma.return.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: returnInclude,
    });
    return toDto(ReturnResponseDto, returns);
  }

  // get by id (owner/admin)
  async getReturnById(
    id: string,
    userId: string,
    isAdmin: boolean,
  ): Promise<ReturnResponseDto> {
    const ret = await this.prisma.return.findUnique({
      where: { id },
      include: returnInclude,
    });
    if (!ret) {
      throw new NotFoundException('Return not found');
    }
    if (!isAdmin && ret.userId !== userId) {
      throw new ForbiddenException('Not your return');
    }
    return toDto(ReturnResponseDto, ret);
  }

  // admin: all returns
  async getAllReturns(): Promise<ReturnResponseDto[]> {
    const returns = await this.prisma.return.findMany({
      orderBy: { createdAt: 'desc' },
      include: returnInclude,
    });
    return toDto(ReturnResponseDto, returns);
  }

  // admin: update status (refund restores stock)
  async updateStatus(
    id: string,
    dto: UpdateReturnStatusDto,
  ): Promise<ReturnResponseDto> {
    const existing = await this.prisma.return.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!existing) {
      throw new NotFoundException('Return not found');
    }
    if (existing.status === 'refunded') {
      throw new BadRequestException('Return already refunded');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const ret = await tx.return.update({
        where: { id },
        data: {
          status: dto.status,
          resolvedAt:
            dto.status === 'approved' ||
            dto.status === 'rejected' ||
            dto.status === 'refunded'
              ? new Date()
              : existing.resolvedAt,
        },
        include: returnInclude,
      });

      // refund: restore stock
      if (dto.status === 'refunded') {
        for (const item of existing.items) {
          const orderItem = await tx.orderItem.findUnique({
            where: { id: item.orderItemId },
          });
          if (orderItem?.variantId) {
            await tx.productVariant.update({
              where: { id: orderItem.variantId },
              data: { stockQuantity: { increment: item.quantity } },
            });
          }
        }

        await writeAudit(tx, 'order_updated', {
          orderId: existing.orderId,
          userId: null,
          payload: { returnId: id, status: 'refunded' },
        });
      }

      // notify
      await notify(
        tx,
        existing.userId,
        `return_${dto.status}`,
        `Your return request has been ${dto.status}.`,
      );

      return ret;
    });

    return toDto(ReturnResponseDto, updated);
  }

  // cancel by owner (only while pending)
  async cancelReturn(
    id: string,
    userId: string,
  ): Promise<{ message: string }> {
    const existing = await this.prisma.return.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Return not found');
    }
    if (existing.userId !== userId) {
      throw new ForbiddenException('Not your return');
    }
    if (existing.status !== 'pending') {
      throw new BadRequestException('Only pending returns can be cancelled');
    }

    await this.prisma.return.delete({ where: { id } });

    return { message: 'Return cancelled' };
  }
}