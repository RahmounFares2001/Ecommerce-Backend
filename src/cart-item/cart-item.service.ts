import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartItemResponseDto } from './dto/cart-item-response.dto';
import { toDto } from 'src/common/utils/to-dto.util';

const cartItemInclude = {
  variant: {
    include: {
      images: { orderBy: { displayOrder: 'asc' as const } },
    },
  },
};

@Injectable()
export class CartItemService {
  constructor(private readonly prisma: PrismaService) {}

  // create item
  async createItem(dto: CreateCartItemDto): Promise<CartItemResponseDto> {
    const cart = await this.prisma.cart.findUnique({ where: { id: dto.cartId } });
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }
  
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: dto.variantId },
    });
    if (!variant || !variant.isActive) {
      throw new NotFoundException('Variant not found');
    }
    if (variant.stockQuantity < dto.quantity) {
      throw new BadRequestException('Not enough stock');
    }
  
    const existing = await this.prisma.cartItem.findUnique({
      where: {
        cartId_variantId: { cartId: dto.cartId, variantId: dto.variantId },
      },
    });
  
    if (existing) {
      const updated = await this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + dto.quantity },
        include: cartItemInclude,
      });
      return toDto(CartItemResponseDto, updated);
    }
  
    const created = await this.prisma.cartItem.create({
      data: {
        cartId: dto.cartId,
        variantId: dto.variantId,
        quantity: dto.quantity,
      },
      include: cartItemInclude,
    });
  
    return toDto(CartItemResponseDto, created);
  }

  // get by id
  async getItemById(id: string): Promise<CartItemResponseDto> {
    const item = await this.prisma.cartItem.findUnique({
      where: { id },
      include: cartItemInclude,
    });
    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    return toDto(CartItemResponseDto, item);
  }

  // get by cart
  async getItemsByCart(cartId: string): Promise<CartItemResponseDto[]> {
    const items = await this.prisma.cartItem.findMany({
      where: { cartId },
      include: cartItemInclude,
    });

    return toDto(CartItemResponseDto, items);
  }

  // update
  async updateItem(id: string, dto: UpdateCartItemDto): Promise<CartItemResponseDto> {
    const existing = await this.prisma.cartItem.findUnique({
      where: { id },
      include: { variant: true },
    });
    if (!existing) {
      throw new NotFoundException('Cart item not found');
    }

    if (dto.quantity !== undefined && existing.variant.stockQuantity < dto.quantity) {
      throw new BadRequestException('Not enough stock');
    }

    const updated = await this.prisma.cartItem.update({
      where: { id },
      data: {
        quantity: dto.quantity ?? existing.quantity,
      },
      include: cartItemInclude,
    });

    return toDto(CartItemResponseDto, updated);
  }

  // delete
  async deleteItem(id: string): Promise<{ message: string }> {
    const existing = await this.prisma.cartItem.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Cart item not found');
    }

    await this.prisma.cartItem.delete({ where: { id } });

    return { message: 'Cart item deleted successfully' };
  }
}