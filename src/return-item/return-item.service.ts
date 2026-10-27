import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReturnItemDto } from './dto/create-return-item.dto';
import { UpdateReturnItemDto } from './dto/update-return-item.dto';
import { ReturnItemResponseDto } from './dto/return-item-response.dto';
import { toDto } from 'src/common/utils/to-dto.util';

@Injectable()
export class ReturnItemService {
  constructor(private readonly prisma: PrismaService) {}

  // helper: verify return is pending and caller is owner or admin
  private async assertReturnEditable(
    returnId: string,
    userId: string,
    isAdmin: boolean,
  ) {
    const ret = await this.prisma.return.findUnique({
      where: { id: returnId },
      select: { userId: true, status: true, orderId: true },
    });
    if (!ret) {
      throw new NotFoundException('Return not found');
    }
    if (!isAdmin && ret.userId !== userId) {
      throw new ForbiddenException('Not your return');
    }
    if (ret.status !== 'pending') {
      throw new BadRequestException('Return is no longer editable');
    }
    return ret;
  }

  // add item to a pending return 
  async addItem(
    userId: string,
    isAdmin: boolean,
    dto: CreateReturnItemDto,
  ): Promise<ReturnItemResponseDto> {
    const ret = await this.assertReturnEditable(dto.returnId, userId, isAdmin);

    // order item must belong to the parent order
    const orderItem = await this.prisma.orderItem.findUnique({
      where: { id: dto.orderItemId },
    });
    if (!orderItem || orderItem.orderId !== ret.orderId) {
      throw new BadRequestException('Order item does not belong to this order');
    }

    // cannot return more than was ordered
    if (dto.quantity > orderItem.quantity) {
      throw new BadRequestException('Quantity exceeds ordered quantity');
    }

    // prevent duplicate entry for the same order item within the same return
    const duplicate = await this.prisma.returnItem.findFirst({
      where: { returnId: dto.returnId, orderItemId: dto.orderItemId },
    });
    if (duplicate) {
      throw new BadRequestException('Item is already in this return');
    }

    const created = await this.prisma.returnItem.create({
      data: {
        returnId: dto.returnId,
        orderItemId: dto.orderItemId,
        quantity: dto.quantity,
      },
    });

    return toDto(ReturnItemResponseDto, created);
  }

  // update quantity 
  async updateItem(
    id: string,
    userId: string,
    isAdmin: boolean,
    dto: UpdateReturnItemDto,
  ): Promise<ReturnItemResponseDto> {
    const existing = await this.prisma.returnItem.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Return item not found');
    }
    await this.assertReturnEditable(existing.returnId, userId, isAdmin);

    const orderItem = await this.prisma.orderItem.findUnique({
      where: { id: existing.orderItemId },
    });
    if (!orderItem) {
      throw new NotFoundException('Order item not found');
    }
    if (dto.quantity > orderItem.quantity) {
      throw new BadRequestException('Quantity exceeds ordered quantity');
    }

    const updated = await this.prisma.returnItem.update({
      where: { id },
      data: { quantity: dto.quantity },
    });

    return toDto(ReturnItemResponseDto, updated);
  }

  // remove item
  async removeItem(
    id: string,
    userId: string,
    isAdmin: boolean,
  ): Promise<{ message: string }> {
    const existing = await this.prisma.returnItem.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Return item not found');
    }
    await this.assertReturnEditable(existing.returnId, userId, isAdmin);

    await this.prisma.returnItem.delete({ where: { id } });

    return { message: 'Return item removed successfully' };
  }

  // get by id
  async getById(
    id: string,
    userId: string,
    isAdmin: boolean,
  ): Promise<ReturnItemResponseDto> {
    const item = await this.prisma.returnItem.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException('Return item not found');
    }

    const ret = await this.prisma.return.findUnique({
      where: { id: item.returnId },
      select: { userId: true },
    });
    if (!ret || (!isAdmin && ret.userId !== userId)) {
      throw new ForbiddenException('Not your return');
    }

    return toDto(ReturnItemResponseDto, item);
  }

  // list items for a return
  async getByReturn(
    returnId: string,
    userId: string,
    isAdmin: boolean,
  ): Promise<ReturnItemResponseDto[]> {
    const ret = await this.prisma.return.findUnique({
      where: { id: returnId },
      select: { userId: true },
    });
    if (!ret) {
      throw new NotFoundException('Return not found');
    }
    if (!isAdmin && ret.userId !== userId) {
      throw new ForbiddenException('Not your return');
    }

    const items = await this.prisma.returnItem.findMany({
      where: { returnId },
    });

    return toDto(ReturnItemResponseDto, items);
  }
}