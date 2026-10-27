// src/shipping-method/shipping-method.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateShippingMethodDto } from './dto/create-shipping-method.dto';
import { UpdateShippingMethodDto } from './dto/update-shipping-method.dto';
import { ShippingMethodResponseDto } from './dto/shipping-method-response.dto';
import { toDto } from 'src/common/utils/to-dto.util';
import { Prisma } from '@prisma/client';

@Injectable()
export class ShippingMethodService {
  constructor(private readonly prisma: PrismaService) {}

  // create
  async create(dto: CreateShippingMethodDto): Promise<ShippingMethodResponseDto> {
    if (dto.estimatedDaysMax < dto.estimatedDaysMin) {
      throw new BadRequestException('estimatedDaysMax must be >= estimatedDaysMin');
    }

    const method = await this.prisma.shippingMethod.create({
      data: {
        name: dto.name,
        price: new Prisma.Decimal(dto.price),
        estimatedDaysMin: dto.estimatedDaysMin,
        estimatedDaysMax: dto.estimatedDaysMax,
        isActive: dto.isActive ?? true,
      },
    });

    return toDto(ShippingMethodResponseDto, method);
  }

  // list all (admin)
  async findAll(): Promise<ShippingMethodResponseDto[]> {
    const methods = await this.prisma.shippingMethod.findMany({
      orderBy: { price: 'asc' },
    });
    return toDto(ShippingMethodResponseDto, methods);
  }

  // list active 
  async findActive(): Promise<ShippingMethodResponseDto[]> {
    const methods = await this.prisma.shippingMethod.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });
    return toDto(ShippingMethodResponseDto, methods);
  }

  // get by id
  async findOne(id: string): Promise<ShippingMethodResponseDto> {
    const method = await this.prisma.shippingMethod.findUnique({ where: { id } });
    if (!method) {
      throw new NotFoundException('Shipping method not found');
    }
    return toDto(ShippingMethodResponseDto, method);
  }

  // update
  async update(id: string, dto: UpdateShippingMethodDto): Promise<ShippingMethodResponseDto> {
    const existing = await this.prisma.shippingMethod.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Shipping method not found');
    }

    const min = dto.estimatedDaysMin ?? existing.estimatedDaysMin;
    const max = dto.estimatedDaysMax ?? existing.estimatedDaysMax;
    if (max < min) {
      throw new BadRequestException('estimatedDaysMax must be >= estimatedDaysMin');
    }

    const updated = await this.prisma.shippingMethod.update({
      where: { id },
      data: {
        name: dto.name ?? existing.name,
        price: dto.price !== undefined ? new Prisma.Decimal(dto.price) : existing.price,
        estimatedDaysMin: min,
        estimatedDaysMax: max,
        isActive: dto.isActive !== undefined ? dto.isActive : existing.isActive,
      },
    });

    return toDto(ShippingMethodResponseDto, updated);
  }

  // delete
  async remove(id: string): Promise<{ message: string }> {
    const existing = await this.prisma.shippingMethod.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Shipping method not found');
    }

    // block deletion if any order references it
    const usage = await this.prisma.order.count({ where: { shippingMethodId: id } });
    if (usage > 0) {
      throw new BadRequestException(
        'Cannot delete shipping method used by existing orders. Disable it instead.',
      );
    }

    await this.prisma.shippingMethod.delete({ where: { id } });

    return { message: 'Shipping method deleted successfully' };
  }
}