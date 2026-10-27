import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuditLogQueryDto } from './dto/audit-log-query.dto';
import { AuditLogResponseDto } from './dto/audit-log-response.dto';
import { toDto } from 'src/common/utils/to-dto.util';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  // list with filters
  async findAll(query: AuditLogQueryDto): Promise<AuditLogResponseDto[]> {
    const { page = 1, limit = 20, orderId, userId, action, from, to } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.AuditLogWhereInput = {
      ...(orderId ? { orderId } : {}),
      ...(userId ? { userId } : {}),
      ...(action ? { action } : {}),
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    };

    const logs = await this.prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    return toDto(AuditLogResponseDto, logs);
  }

  // by id
  async findOne(id: string): Promise<AuditLogResponseDto> {
    const log = await this.prisma.auditLog.findUnique({ where: { id } });
    if (!log) {
      throw new NotFoundException('Audit log not found');
    }
    return toDto(AuditLogResponseDto, log);
  }

  // by order (timeline of all things happen in order)
  async findByOrder(orderId: string): Promise<AuditLogResponseDto[]> {
    const logs = await this.prisma.auditLog.findMany({
      where: { orderId },
      orderBy: { createdAt: 'asc' },
    });
    return toDto(AuditLogResponseDto, logs);
  }
}