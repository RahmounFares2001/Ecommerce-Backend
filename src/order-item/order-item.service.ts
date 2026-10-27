// src/order-item/order-item.service.ts
import {
    Injectable,
    NotFoundException,
    BadRequestException,
  } from '@nestjs/common';
  import { PrismaService } from 'src/prisma/prisma.service';
  import { CreateOrderItemDto } from './dto/create-order-item.dto';
  import { UpdateOrderItemDto } from './dto/update-order-item.dto';
  import { OrderItemResponseDto } from './dto/order-item-response.dto';
  import { toDto } from 'src/common/utils/to-dto.util';
  import { Prisma } from '@prisma/client';
  import { assertOrderAccess } from 'src/common/helpers/order-access.helper';
  
  @Injectable()
  export class OrderItemService {
    constructor(private readonly prisma: PrismaService) {}
  
    // add item to an existing order 
    async addItem(
      userId: string,
      isAdmin: boolean,
      dto: CreateOrderItemDto,
    ): Promise<OrderItemResponseDto> {
      await assertOrderAccess(this.prisma, dto.orderId, userId, isAdmin, true);
  
      const variant = await this.prisma.productVariant.findUnique({
        where: { id: dto.variantId },
        include: { product: true },
      });
      if (!variant || !variant.isActive) {
        throw new NotFoundException('Variant not found');
      }
      if (variant.stockQuantity < dto.quantity) {
        throw new BadRequestException('Not enough stock');
      }
  
      const item = await this.prisma.$transaction(async (tx) => {
        const unitPrice = new Prisma.Decimal(variant.price);
        const totalPrice = unitPrice.mul(dto.quantity);
  
        const created = await tx.orderItem.create({
          data: {
            orderId: dto.orderId,
            variantId: dto.variantId,
            quantity: dto.quantity,
            unitPrice,
            totalPrice,
            productName: variant.product.name,
            variantSnapshot: variant.attributes as any,
          },
        });
  
        await tx.productVariant.update({
          where: { id: dto.variantId },
          data: { stockQuantity: { decrement: dto.quantity } },
        });
  
        await this.recalcOrderTotals(tx, dto.orderId);
  
        return created;
      });
  
      return toDto(OrderItemResponseDto, item);
    }
  
    // update quantity 
    async updateItem(
      id: string,
      userId: string,
      isAdmin: boolean,
      dto: UpdateOrderItemDto,
    ): Promise<OrderItemResponseDto> {
      const existing = await this.prisma.orderItem.findUnique({
        where: { id },
        include: { variant: true },
      });
      if (!existing) {
        throw new NotFoundException('Order item not found');
      }
      await assertOrderAccess(this.prisma, existing.orderId, userId, isAdmin, true);
  
      const delta = dto.quantity - existing.quantity;
  
      if (delta === 0) {
        return toDto(OrderItemResponseDto, existing);
      }
  
      if (delta > 0 && existing.variant && existing.variant.stockQuantity < delta) {
        throw new BadRequestException('Not enough stock');
      }
  
      const item = await this.prisma.$transaction(async (tx) => {
        const totalPrice = new Prisma.Decimal(existing.unitPrice).mul(dto.quantity);
  
        const updated = await tx.orderItem.update({
          where: { id },
          data: { quantity: dto.quantity, totalPrice },
        });
  
        if (existing.variantId) {
          await tx.productVariant.update({
            where: { id: existing.variantId },
            data: {
              stockQuantity:
                delta > 0 ? { decrement: delta } : { increment: -delta },
            },
          });
        }
  
        await this.recalcOrderTotals(tx, existing.orderId);
  
        return updated;
      });
  
      return toDto(OrderItemResponseDto, item);
    }
  
    // remove item 
    async removeItem(
      id: string,
      userId: string,
      isAdmin: boolean,
    ): Promise<{ message: string }> {
      const existing = await this.prisma.orderItem.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundException('Order item not found');
      }
      await assertOrderAccess(this.prisma, existing.orderId, userId, isAdmin, true);
  
      await this.prisma.$transaction(async (tx) => {
        if (existing.variantId) {
          await tx.productVariant.update({
            where: { id: existing.variantId },
            data: { stockQuantity: { increment: existing.quantity } },
          });
        }
  
        await tx.orderItem.delete({ where: { id } });
  
        await this.recalcOrderTotals(tx, existing.orderId);
      });
  
      return { message: 'Order item removed successfully' };
    }
  
    // get item by id
    async getItemById(
      id: string,
      userId: string,
      isAdmin: boolean,
    ): Promise<OrderItemResponseDto> {
      const item = await this.prisma.orderItem.findUnique({
        where: { id },
        include: { order: { select: { id: true, userId: true } } },
      });
      if (!item) {
        throw new NotFoundException('Order item not found');
      }
      await assertOrderAccess(this.prisma, item.orderId, userId, isAdmin, false);
      return toDto(OrderItemResponseDto, item);
    }
  
    // get items by order
    async getItemsByOrder(
      orderId: string,
      userId: string,
      isAdmin: boolean,
    ): Promise<OrderItemResponseDto[]> {
      await assertOrderAccess(this.prisma, orderId, userId, isAdmin, false);
  
      const items = await this.prisma.orderItem.findMany({ where: { orderId } });
      return toDto(OrderItemResponseDto, items);
    }
  
    // recalc subtotal / total after item change
    private async recalcOrderTotals(
      tx: Prisma.TransactionClient,
      orderId: string,
    ) {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });
      if (!order) return;
  
      const subtotal = order.items.reduce(
        (sum, i) => sum.add(new Prisma.Decimal(i.totalPrice)),
        new Prisma.Decimal(0),
      );
  
      const discountAmount = new Prisma.Decimal(order.discountAmount);
      const shippingCost = new Prisma.Decimal(order.shippingCost);
      const totalAmount = subtotal.sub(discountAmount).add(shippingCost);
  
      await tx.order.update({
        where: { id: orderId },
        data: { subtotal, totalAmount },
      });
    }
  }