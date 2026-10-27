import { PrismaService } from 'src/prisma/prisma.service';
import { AuditAction, Prisma } from '@prisma/client';

type AuditPayload = Record<string, unknown>;

export async function writeAudit(
  prisma: PrismaService | Prisma.TransactionClient,
  action: AuditAction,
  data: { orderId?: string | null; userId?: string | null; payload?: AuditPayload } = {},
): Promise<void> {
  await prisma.auditLog.create({
    data: {
      action,
      orderId: data.orderId ?? null,
      userId: data.userId ?? null,
      payload: (data.payload ?? {}) as Prisma.InputJsonValue,
    },
  });
}