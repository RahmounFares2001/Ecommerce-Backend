import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

export async function notify(
  prisma: PrismaService | Prisma.TransactionClient,
  userId: string,
  type: string,
  message: string,
): Promise<void> {
  await prisma.notification.create({
    data: { userId, type, message },
  });
}