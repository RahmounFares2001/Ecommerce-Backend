import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UpdateCodStatusDto } from './dto/update-cod-status.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { orderInclude } from './order.selects';
import { toDto } from 'src/common/utils/to-dto.util';
import { OrderStatus, Prisma } from '@prisma/client';
import { writeAudit } from 'src/common/helpers/audit.helper';
import { notify } from 'src/common/helpers/notify.helper';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  // generate order number ORD-YYYY-NNNNNN
  private async generateOrderNumber(tx: Prisma.TransactionClient): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `ORD-${year}-`;

    const last = await tx.order.findFirst({
      where: { orderNumber: { startsWith: prefix } },
      orderBy: { orderNumber: 'desc' },
      select: { orderNumber: true },
    });

    const next = last ? parseInt(last.orderNumber.split('-')[2], 10) + 1 : 1;
    return `${prefix}${next.toString().padStart(6, '0')}`;
  }

  // create order (from cart)
  async createOrder(
    userId: string | undefined,
    guestToken: string | undefined,
    dto: CreateOrderDto,
  ): Promise<OrderResponseDto> {
    if (!userId && !guestToken) {
      throw new BadRequestException('guestToken required for guests');
    }

    // load cart
    const cart = await this.prisma.cart.findFirst({
      where: userId ? { userId } : { guestToken },
      include: {
        items: { include: { variant: { include: { product: true } } } },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // shipping method
    const shippingMethod = await this.prisma.shippingMethod.findUnique({
      where: { id: dto.shippingMethodId },
    });
    if (!shippingMethod || !shippingMethod.isActive) {
      throw new NotFoundException('Shipping method not found');
    }

    // shipping address (snapshot)
    let shippingSnapshot: any = {};
    if (dto.shippingAddressId) {
      const address = await this.prisma.address.findUnique({
        where: { id: dto.shippingAddressId },
      });
      if (!address || (userId && address.userId !== userId)) {
        throw new NotFoundException('Address not found');
      }
      shippingSnapshot = { ...address };
    }

    // discount
    let discountCode: any = null;
    let discountAmount = new Prisma.Decimal(0);

    if (dto.discountCode) {
      discountCode = await this.prisma.discountCode.findUnique({
        where: { code: dto.discountCode.toUpperCase() },
      });
      if (!discountCode || !discountCode.isActive) {
        throw new BadRequestException('Invalid discount code');
      }
      if (discountCode.expiresAt && discountCode.expiresAt < new Date()) {
        throw new BadRequestException('Discount code expired');
      }
      if (
        discountCode.usageLimit !== null &&
        discountCode.usedCount >= discountCode.usageLimit
      ) {
        throw new BadRequestException('Discount code usage limit reached');
      }
    }

    // compute subtotal
    let subtotal = new Prisma.Decimal(0);
    for (const item of cart.items) {
      const line = new Prisma.Decimal(item.variant.price).mul(item.quantity);
      subtotal = subtotal.add(line);
    }

    // compute discount 
    if (discountCode) {
      if (discountCode.minOrderAmount && subtotal.lt(discountCode.minOrderAmount)) {
        throw new BadRequestException('Minimum order amount not reached');
      }

      let eligibleSubtotal = subtotal;

      if (discountCode.scope === 'category' && discountCode.categoryId) {
        eligibleSubtotal = cart.items
          .filter((i) => i.variant.product.categoryId === discountCode.categoryId)
          .reduce(
            (sum, i) => sum.add(new Prisma.Decimal(i.variant.price).mul(i.quantity)),
            new Prisma.Decimal(0),
          );
        if (eligibleSubtotal.lte(0)) {
          throw new BadRequestException('No eligible items for this discount code');
        }
      } else if (discountCode.scope === 'product' && discountCode.productId) {
        eligibleSubtotal = cart.items
          .filter((i) => i.variant.productId === discountCode.productId)
          .reduce(
            (sum, i) => sum.add(new Prisma.Decimal(i.variant.price).mul(i.quantity)),
            new Prisma.Decimal(0),
          );
        if (eligibleSubtotal.lte(0)) {
          throw new BadRequestException('No eligible items for this discount code');
        }
      }

      discountAmount =
        discountCode.discountType === 'percentage'
          ? eligibleSubtotal.mul(discountCode.discountValue).div(100)
          : new Prisma.Decimal(discountCode.discountValue);

      if (discountAmount.gt(subtotal)) {
        discountAmount = subtotal;
      }
    }

    const shippingCost = new Prisma.Decimal(shippingMethod.price);
    const totalAmount = subtotal.sub(discountAmount).add(shippingCost);

    // stock check
    for (const item of cart.items) {
      if (item.variant.stockQuantity < item.quantity) {
        throw new BadRequestException(`Not enough stock for ${item.variant.sku}`);
      }
    }

    // ---- TRANSACTION ----
    const order = await this.prisma.$transaction(
      async (tx) => {
        const orderNumber = await this.generateOrderNumber(tx);

        const newOrder = await tx.order.create({
          data: {
            userId: userId ?? null,
            shippingAddressId: dto.shippingAddressId ?? null,
            shippingMethodId: shippingMethod.id,
            discountCodeId: discountCode?.id ?? null,
            orderNumber,
            status: OrderStatus.pending,
            currency: 'DZD',
            subtotal,
            discountAmount,
            shippingCost,
            totalAmount,
            shippingSnapshot,
            notes: dto.notes ?? null,
            items: {
              create: cart.items.map((item) => ({
                variantId: item.variantId,
                quantity: item.quantity,
                unitPrice: item.variant.price,
                totalPrice: new Prisma.Decimal(item.variant.price).mul(item.quantity),
                productName: item.variant.product.name,
                variantSnapshot: item.variant.attributes as any,
              })),
            },
            statusHistory: {
              create: { status: OrderStatus.pending, note: 'Order created' },
            },
          },
          include: orderInclude,
        });

        // decrement stock
        for (const item of cart.items) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stockQuantity: { decrement: item.quantity } },
          });
        }

        // increment discount usage
        if (discountCode) {
          await tx.discountCode.update({
            where: { id: discountCode.id },
            data: { usedCount: { increment: 1 } },
          });
        }

        // clear cart
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

        // audit
        await writeAudit(tx, 'order_created', {
          orderId: newOrder.id,
          userId: userId ?? null,
          payload: {
            orderNumber: newOrder.orderNumber,
            totalAmount: totalAmount.toString(),
          },
        });

        // notify
        if (userId) {
          await notify(
            tx,
            userId,
            'order_created',
            `Your order ${newOrder.orderNumber} has been placed.`,
          );
        }

        return newOrder;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    return toDto(OrderResponseDto, order);
  }

  // get my orders
  async getMyOrders(userId: string): Promise<OrderResponseDto[]> {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: orderInclude,
    });
    return toDto(OrderResponseDto, orders);
  }

  // get by id 
  async getOrderById(
    id: string,
    userId?: string,
    isAdmin = false,
  ): Promise<OrderResponseDto> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: orderInclude,
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (!isAdmin && order.userId !== userId) {
      throw new ForbiddenException('Not your order');
    }
    return toDto(OrderResponseDto, order);
  }

  // admin: all orders
  async getAllOrders(): Promise<OrderResponseDto[]> {
    const orders = await this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: orderInclude,
    });
    return toDto(OrderResponseDto, orders);
  }

  // update status (admin)
  async updateStatus(
    id: string,
    dto: UpdateOrderStatusDto,
  ): Promise<OrderResponseDto> {
    const existing = await this.prisma.order.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Order not found');
    }

    const order = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id },
        data: { status: dto.status },
        include: orderInclude,
      });

      await tx.orderStatusHistory.create({
        data: { orderId: id, status: dto.status, note: dto.note ?? null },
      });

      await writeAudit(tx, 'order_status_changed', {
        orderId: id,
        userId: null,
        payload: { from: existing.status, to: dto.status },
      });

      // notify
      if (existing.userId) {
        await notify(
          tx,
          existing.userId,
          `order_${dto.status}`,
          `Your order ${existing.orderNumber} is now ${dto.status}.`,
        );
      }
      return updated;
    });

    return toDto(OrderResponseDto, order);
  }

  // update COD status (admin)
  async updateCodStatus(
    id: string,
    dto: UpdateCodStatusDto,
  ): Promise<OrderResponseDto> {
    const existing = await this.prisma.order.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Order not found');
    }

    const order = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id },
        data: {
          codStatus: dto.codStatus,
          codCollectedAt:
            dto.codStatus === 'collected'
              ? new Date()
              : existing.codCollectedAt,
          codNotes: dto.codNotes ?? existing.codNotes,
        },
        include: orderInclude,
      });

      await writeAudit(tx, 'cod_status_changed', {
        orderId: id,
        userId: null,
        payload: { from: existing.codStatus, to: dto.codStatus },
      });

      // notify
      if (existing.userId && dto.codStatus === 'collected') {
        await notify(
          tx,
          existing.userId,
          'cod_collected',
          `Payment for order ${existing.orderNumber} has been collected.`,
        );
      }

      return updated;
    });

    return toDto(OrderResponseDto, order);
  }

  // cancel (owner/admin) (restore stock)
  async cancelOrder(
    id: string,
    userId?: string,
    isAdmin = false,
    note?: string,
  ): Promise<OrderResponseDto> {
    const existing = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!existing) {
      throw new NotFoundException('Order not found');
    }
    if (!isAdmin && existing.userId !== userId) {
      throw new ForbiddenException('Not your order');
    }
    if (existing.status === 'cancelled') {
      throw new BadRequestException('Order already cancelled');
    }
    if (existing.status === 'shipped' || existing.status === 'delivered') {
      throw new BadRequestException('Cannot cancel shipped/delivered order');
    }

    const order = await this.prisma.$transaction(async (tx) => {
      // restore stock
      for (const item of existing.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stockQuantity: { increment: item.quantity } },
          });
        }
      }

      const updated = await tx.order.update({
        where: { id },
        data: { status: 'cancelled' },
        include: orderInclude,
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          status: 'cancelled',
          note: note ?? 'Order cancelled',
        },
      });

      await writeAudit(tx, 'order_cancelled', {
        orderId: id,
        userId: userId ?? null,
        payload: { from: existing.status },
      });

      // notify
      if (existing.userId) {
        await notify(
          tx,
          existing.userId,
          'order_cancelled',
          `Your order ${existing.orderNumber} has been cancelled.`,
        );
      }

      return updated;
    });

    return toDto(OrderResponseDto, order);
  }
}