import {
    NotFoundException,
    ForbiddenException,
    BadRequestException,
  } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

// Ensures the caller can access the order

export async function assertOrderAccess(
  prisma: PrismaService,
  orderId: string,
  userId: string,
  isAdmin: boolean,
  editable = false,
): Promise<{ userId: string | null; status: string }> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { userId: true, status: true },
  });

  if (!order) {
    throw new NotFoundException('Order not found');
  }

  if (!isAdmin && order.userId !== userId) {
    throw new ForbiddenException('Not your order');
  }

  if (editable && order.status !== 'pending') {
    throw new BadRequestException('Order is no longer editable');
  }

  return order;
}