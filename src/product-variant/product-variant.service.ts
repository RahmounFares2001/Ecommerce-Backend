import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { ProductVariantDto } from './dto/product-variant.dto';
import { toDto } from 'src/common/utils/to-dto.util';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductVariantService {
  constructor(private readonly prisma: PrismaService) {}

  // Create variant
  async createVariant(dto: CreateProductVariantDto): Promise<ProductVariantDto> {
    // verify parent product exists
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // check SKU unique
    const existingSku = await this.prisma.productVariant.findUnique({
      where: { sku: dto.sku },
    });
    if (existingSku) {
      throw new ConflictException(`Variant SKU '${dto.sku}' already exists`);
    }

    // create 
    const variant = await this.prisma.productVariant.create({
      data: {
        productId: dto.productId,
        sku: dto.sku,
        price: dto.price,
        comparePrice: dto.comparePrice ?? null,
        stockQuantity: dto.stockQuantity ?? 0,
        attributes: dto.attributes ?? {},
        isActive: dto.isActive ?? true,
      },
      include: {
        images: true,
      },
    });

    return toDto(ProductVariantDto, variant);
  }

  // Get variant by ID
  async getVariantById(id: string): Promise<ProductVariantDto> {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }

    return toDto(ProductVariantDto, variant);
  }

  // Get all variants for a product
  async getVariantsByProductId(productId: string): Promise<ProductVariantDto[]> {
    const variants = await this.prisma.productVariant.findMany({
      where: { productId },
      orderBy: { price: 'asc' },
      include: {
        images: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    return toDto(ProductVariantDto, variants);
  }

  // Update variant
  async updateVariant(id: string, dto: UpdateProductVariantDto): Promise<ProductVariantDto> {
    const existing = await this.prisma.productVariant.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Product variant not found');
    }

    // Check SKU collision if updating SKU
    if (dto.sku && dto.sku !== existing.sku) {
      const duplicateSku = await this.prisma.productVariant.findUnique({
        where: { sku: dto.sku },
      });
      if (duplicateSku) {
        throw new ConflictException(`Variant SKU '${dto.sku}' already exists`);
      }
    }

    const updated = await this.prisma.productVariant.update({
      where: { id },
      data: {
        sku: dto.sku ?? existing.sku,
        price: dto.price !== undefined ? dto.price : existing.price,
        comparePrice: dto.comparePrice !== undefined ? dto.comparePrice : existing.comparePrice,
        stockQuantity: dto.stockQuantity !== undefined ? dto.stockQuantity : existing.stockQuantity,
        attributes: dto.attributes ?? existing.attributes ?? Prisma.JsonNull,
      },
      include: {
        images: true,
      },
    });

    return toDto(ProductVariantDto, updated);
  }

  // Delete variant
  async deleteVariant(id: string): Promise<{ message: string }> {
    const existing = await this.prisma.productVariant.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Product variant not found');
    }

    await this.prisma.productVariant.delete({ where: { id } });

    return { message: 'Product variant deleted successfully' };
  }
}