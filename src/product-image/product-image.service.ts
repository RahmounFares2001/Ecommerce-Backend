import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UploadService } from 'src/upload/upload.service';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { UpdateProductImageDto } from './dto/update-product-image.dto';
import { ProductImageDto } from './dto/product-image.dto';
import { toDto } from 'src/common/utils/to-dto.util';

@Injectable()
export class ProductImageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

  // upload image
  async uploadProductImage(
    file: Express.Multer.File,
    dto: CreateProductImageDto,
  ): Promise<ProductImageDto> {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const uploadResult = await this.uploadService.uploadImage(
      file,
      '/product/images',
    );

    if (dto.isPrimary) {
      await this.prisma.productImage.updateMany({
        where: { productId: dto.productId },
        data: { isPrimary: false },
      });
    }

    const newImage = await this.prisma.productImage.create({
      data: {
        productId: dto.productId,
        variantId: dto.variantId || null,
        url: uploadResult.url,
        altText: dto.altText || null,
        displayOrder: dto.displayOrder ?? 0,
        isPrimary: dto.isPrimary ?? false,
      },
    });

    return toDto(ProductImageDto, newImage);
  }

  // get images
  async getProductImages(productId: string): Promise<ProductImageDto[]> {
    const images = await this.prisma.productImage.findMany({
      where: { productId },
      orderBy: { displayOrder: 'asc' },
    });

    return toDto(ProductImageDto, images);
  }

  // update
  async updateImage(id: string, dto: UpdateProductImageDto): Promise<ProductImageDto> {
    const existing = await this.prisma.productImage.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Image not found');
    }

    if (dto.isPrimary) {
      await this.prisma.productImage.updateMany({
        where: { productId: existing.productId },
        data: { isPrimary: false },
      });
    }

    const updated = await this.prisma.productImage.update({
      where: { id },
      data: {
        altText: dto.altText !== undefined ? dto.altText : existing.altText,
        displayOrder: dto.displayOrder !== undefined ? dto.displayOrder : existing.displayOrder,
        isPrimary: dto.isPrimary !== undefined ? dto.isPrimary : existing.isPrimary,
      },
    });

    return toDto(ProductImageDto, updated);
  }

  // delete
  async deleteImage(id: string): Promise<{ message: string }> {
    const image = await this.prisma.productImage.findUnique({ where: { id } });
    if (!image) {
      throw new NotFoundException('Image not found');
    }

    await this.prisma.productImage.delete({ where: { id } });

    return { message: 'Image deleted successfully' };
  }
}