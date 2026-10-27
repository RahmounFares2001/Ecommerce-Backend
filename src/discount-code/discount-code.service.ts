import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ConflictException,
  } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDiscountCodeDto } from './dto/create-discount-code.dto';
import { UpdateDiscountCodeDto } from './dto/update-discount-code.dto';
import { ValidateDiscountCodeDto } from './dto/validate-discount-code.dto';
import { DiscountCodeResponseDto } from './dto/discount-code-response.dto';
import { DiscountValidationResponseDto } from './dto/discount-validation-response.dto';
import { toDto } from 'src/common/utils/to-dto.util';
import { Prisma } from '@prisma/client';
  
@Injectable()
export class DiscountCodeService {
  constructor(private readonly prisma: PrismaService) {}

  // create
  async create(dto: CreateDiscountCodeDto): Promise<DiscountCodeResponseDto> {
    // scope checks
    if (dto.scope === 'category' && !dto.categoryId) {
      throw new BadRequestException('categoryId required when scope is category');
    }
    if (dto.scope === 'product' && !dto.productId) {
      throw new BadRequestException('productId required when scope is product');
    }

    // unique code check
    const existing = await this.prisma.discountCode.findUnique({
      where: { code: dto.code.toUpperCase() },
    });
    if (existing) {
      throw new ConflictException(`Code '${dto.code}' already exists`);
    }

    const discount = await this.prisma.discountCode.create({
      data: {
        code: dto.code.toUpperCase(),
        description: dto.description ?? null,
        discountType: dto.discountType,
        discountValue: new Prisma.Decimal(dto.discountValue),
        currency: dto.currency ?? 'DZD',
        scope: dto.scope ?? 'all',
        categoryId: dto.categoryId ?? null,
        productId: dto.productId ?? null,
        minOrderAmount:
          dto.minOrderAmount !== undefined
            ? new Prisma.Decimal(dto.minOrderAmount)
            : null,
        usageLimit: dto.usageLimit ?? null,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        isActive: dto.isActive ?? true,
      },
    });

    return toDto(DiscountCodeResponseDto, discount);
  }

  // list all (admin)
  async findAll(): Promise<DiscountCodeResponseDto[]> {
    const codes = await this.prisma.discountCode.findMany({
      orderBy: { code: 'asc' },
    });
    return toDto(DiscountCodeResponseDto, codes);
  }

  // get by id
  async findOne(id: string): Promise<DiscountCodeResponseDto> {
    const code = await this.prisma.discountCode.findUnique({ where: { id } });
    if (!code) {
      throw new NotFoundException('Discount code not found');
    }
    return toDto(DiscountCodeResponseDto, code);
  }

  // update
  async update(
    id: string,
    dto: UpdateDiscountCodeDto,
  ): Promise<DiscountCodeResponseDto> {
    const existing = await this.prisma.discountCode.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Discount code not found');
    }

    if (dto.code && dto.code.toUpperCase() !== existing.code) {
      const dup = await this.prisma.discountCode.findUnique({
        where: { code: dto.code.toUpperCase() },
      });
      if (dup) {
        throw new ConflictException(`Code '${dto.code}' already exists`);
      }
    }

    const updated = await this.prisma.discountCode.update({
      where: { id },
      data: {
        code: dto.code ? dto.code.toUpperCase() : existing.code,
        description: dto.description ?? existing.description,
        discountType: dto.discountType ?? existing.discountType,
        discountValue:
          dto.discountValue !== undefined
            ? new Prisma.Decimal(dto.discountValue)
            : existing.discountValue,
        currency: dto.currency ?? existing.currency,
        scope: dto.scope ?? existing.scope,
        categoryId: dto.categoryId ?? existing.categoryId,
        productId: dto.productId ?? existing.productId,
        minOrderAmount:
          dto.minOrderAmount !== undefined
            ? new Prisma.Decimal(dto.minOrderAmount)
            : existing.minOrderAmount,
        usageLimit: dto.usageLimit ?? existing.usageLimit,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : existing.expiresAt,
        isActive: dto.isActive !== undefined ? dto.isActive : existing.isActive,
      },
    });

    return toDto(DiscountCodeResponseDto, updated);
  }

  // delete
  async remove(id: string): Promise<{ message: string }> {
    const existing = await this.prisma.discountCode.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Discount code not found');
    }

    // block deletion if used by any order
    const usage = await this.prisma.order.count({ where: { discountCodeId: id } });
    if (usage > 0) {
      throw new BadRequestException(
        'Cannot delete discount code used by existing orders. Disable it instead.',
      );
    }

    await this.prisma.discountCode.delete({ where: { id } });

    return { message: 'Discount code deleted successfully' };
  }

  // validate a code against a cart subtotal (public, called from checkout)
  async validate(
    dto: ValidateDiscountCodeDto,
  ): Promise<DiscountValidationResponseDto> {
    const code = await this.prisma.discountCode.findUnique({
      where: { code: dto.code.toUpperCase() },
    });

    if (!code) {
      throw new BadRequestException('Invalid discount code');
    }
    if (!code.isActive) {
      throw new BadRequestException('Discount code is not active');
    }
    if (code.expiresAt && code.expiresAt < new Date()) {
      throw new BadRequestException('Discount code has expired');
    }
    if (code.usageLimit !== null && code.usedCount >= code.usageLimit) {
      throw new BadRequestException('Discount code usage limit reached');
    }

    const subtotal = new Prisma.Decimal(dto.subtotal);
    if (code.minOrderAmount && subtotal.lt(code.minOrderAmount)) {
      throw new BadRequestException(
        `Minimum order amount ${code.minOrderAmount.toString()} not reached`,
      );
    }

    let discountAmount: Prisma.Decimal;
    if (code.discountType === 'percentage') {
      discountAmount = subtotal.mul(code.discountValue).div(100);
    } else {
      discountAmount = new Prisma.Decimal(code.discountValue);
    }

    // cap discount at subtotal
    if (discountAmount.gt(subtotal)) {
      discountAmount = subtotal;
    }

    return toDto(DiscountValidationResponseDto, {
      valid: true,
      discountAmount: discountAmount.toFixed(2),
      code: code.code,
    });
  }
}