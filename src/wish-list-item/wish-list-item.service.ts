import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddWishlistItemDto } from './dto/add-wishlist-item.dto';
import { WishlistItemResponseDto } from './dto/wishlist-item-response.dto';
import { toDto } from 'src/common/utils/to-dto.util';

const wishlistInclude = {
  product: {
    include: {
      images: { orderBy: { displayOrder: 'asc' as const } },
      category: true,
    },
  },
};

@Injectable()
export class WishlistService {
  constructor(private readonly prisma: PrismaService) {}

  // add to wishlist (returns existing if already present)
  async addItem(
    userId: string,
    dto: AddWishlistItemDto,
  ): Promise<WishlistItemResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });
    if (!product || !product.isActive) {
      throw new NotFoundException('Product not found');
    }

    const existing = await this.prisma.wishlistItem.findUnique({
      where: {
        userId_productId: { userId, productId: dto.productId },
      },
      include: wishlistInclude,
    });
    if (existing) {
      return toDto(WishlistItemResponseDto, existing);
    }

    const item = await this.prisma.wishlistItem.create({
      data: { userId, productId: dto.productId },
      include: wishlistInclude,
    });

    return toDto(WishlistItemResponseDto, item);
  }

  // my wishlist
  async getMyWishlist(userId: string): Promise<WishlistItemResponseDto[]> {
    const items = await this.prisma.wishlistItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: wishlistInclude,
    });
    return toDto(WishlistItemResponseDto, items);
  }

  // remove one
  async removeItem(
    id: string,
    userId: string,
  ): Promise<{ message: string }> {
    const existing = await this.prisma.wishlistItem.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Wishlist item not found');
    }
    if (existing.userId !== userId) {
      throw new ConflictException('Not your wishlist item');
    }

    await this.prisma.wishlistItem.delete({ where: { id } });
    return { message: 'Removed from wishlist' };
  }

  // remove by productId 
  async removeByProduct(
    userId: string,
    productId: string,
  ): Promise<{ message: string }> {
    const existing = await this.prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (!existing) {
      throw new NotFoundException('Not in wishlist');
    }

    await this.prisma.wishlistItem.delete({ where: { id: existing.id } });
    return { message: 'Removed from wishlist' };
  }

  // toggle: add if missing, remove if present
  async toggle(
    userId: string,
    productId: string,
  ): Promise<{ added: boolean; message: string }> {
    const existing = await this.prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (existing) {
      await this.prisma.wishlistItem.delete({ where: { id: existing.id } });
      return { added: false, message: 'Removed from wishlist' };
    }

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product || !product.isActive) {
      throw new NotFoundException('Product not found');
    }

    await this.prisma.wishlistItem.create({
      data: { userId, productId },
    });
    return { added: true, message: 'Added to wishlist' };
  }
}