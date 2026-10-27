import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartResponseDto } from './dto/cart-response.dto';
import { cartInclude } from './cart.selects';
import { toDto } from 'src/common/utils/to-dto.util';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  // resolve or create cart for user or guest
  private async resolveCart(userId?: string, guestToken?: string) {
    if (userId) {
      let cart = await this.prisma.cart.findFirst({
        where: { userId },
        include: cartInclude,
      });

      if (!cart) {
        cart = await this.prisma.cart.create({
          data: { userId },
          include: cartInclude,
        });
      }

      return cart;
    }

    if (!guestToken) {
      throw new BadRequestException('guestToken is required for guests');
    }

    let cart = await this.prisma.cart.findUnique({
      where: { guestToken },
      include: cartInclude,
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { guestToken },
        include: cartInclude,
      });
    }

    return cart;
  }

  // get my cart
  async getCart(userId?: string, guestToken?: string): Promise<CartResponseDto> {
    const cart = await this.resolveCart(userId, guestToken);
    return toDto(CartResponseDto, cart);
  }

  // add item
  async addItem(
    userId: string | undefined,
    guestToken: string | undefined,
    dto: AddCartItemDto,
  ): Promise<CartResponseDto> {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: dto.variantId },
    });
    if (!variant || !variant.isActive) {
      throw new NotFoundException('Variant not found');
    }
    if (variant.stockQuantity < dto.quantity) {
      throw new BadRequestException('Not enough stock');
    }

    const cart = await this.resolveCart(userId, guestToken);

    const existing = await this.prisma.cartItem.findUnique({
      where: {
        cartId_variantId: { cartId: cart.id, variantId: dto.variantId },
      },
    });

    if (existing) {
      await this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + dto.quantity },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          variantId: dto.variantId,
          quantity: dto.quantity,
        },
      });
    }

    const updated = await this.prisma.cart.findUnique({
      where: { id: cart.id },
      include: cartInclude,
    });

    if (!updated) {
        throw new NotFoundException('Cart not found');
    }

    return toDto(CartResponseDto, updated);
  }

  // update item quantity
  async updateItem(
    itemId: string,
    userId: string | undefined,
    guestToken: string | undefined,
    dto: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true, variant: true },
    });
    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    // ownership check
    if (userId && item.cart.userId !== userId) {
      throw new ForbiddenException('Not your cart');
    }
    if (!userId && item.cart.guestToken !== guestToken) {
      throw new ForbiddenException('Not your cart');
    }

    if (item.variant.stockQuantity < dto.quantity) {
      throw new BadRequestException('Not enough stock');
    }

    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: dto.quantity },
    });

    const cart = await this.prisma.cart.findUnique({
      where: { id: item.cartId },
      include: cartInclude,
    });

    if (!cart) {
        throw new NotFoundException('Cart not found');
    }

    return toDto(CartResponseDto, cart);
  }

  // remove item
  async removeItem(
    itemId: string,
    userId: string | undefined,
    guestToken: string | undefined,
  ): Promise<CartResponseDto> {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });
    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    if (userId && item.cart.userId !== userId) {
      throw new ForbiddenException('Not your cart');
    }
    if (!userId && item.cart.guestToken !== guestToken) {
      throw new ForbiddenException('Not your cart');
    }

    await this.prisma.cartItem.delete({ where: { id: itemId } });

    const cart = await this.prisma.cart.findUnique({
      where: { id: item.cartId },
      include: cartInclude,
    });

    if (!cart) {
        throw new NotFoundException('Cart not found');
    }

    return toDto(CartResponseDto, cart);
  }

  // clear cart
  async clearCart(userId?: string, guestToken?: string): Promise<CartResponseDto> {
    const cart = await this.resolveCart(userId, guestToken);

    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    const updated = await this.prisma.cart.findUnique({
      where: { id: cart.id },
      include: cartInclude,
    });

    if (!updated) {
        throw new NotFoundException('cart not found');
    }
    
    return toDto(CartResponseDto, updated);
  }

  // merge guest cart into user cart (call at login)
  async mergeGuestCart(userId: string, guestToken: string): Promise<CartResponseDto> {
    const userCart = await this.resolveCart(userId);
    const guestCart = await this.prisma.cart.findUnique({
      where: { guestToken },
      include: { items: true },
    });

    if (!guestCart) {
      return toDto(CartResponseDto, userCart);
    }

    for (const guestItem of guestCart.items) {
      const existing = await this.prisma.cartItem.findUnique({
        where: {
          cartId_variantId: {
            cartId: userCart.id,
            variantId: guestItem.variantId,
          },
        },
      });

      if (existing) {
        await this.prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + guestItem.quantity },
        });
      } else {
        await this.prisma.cartItem.create({
          data: {
            cartId: userCart.id,
            variantId: guestItem.variantId,
            quantity: guestItem.quantity,
          },
        });
      }
    }

    // delete guest cart
    await this.prisma.cart.delete({ where: { id: guestCart.id } });

    const merged = await this.prisma.cart.findUnique({
      where: { id: userCart.id },
      include: cartInclude,
    });

    if (!merged) {
        throw new NotFoundException('cart not found');
    }

    return toDto(CartResponseDto, merged);
  }
}