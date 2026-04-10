import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { ExchangeRateService } from '@modules/exchange-rate/exchange-rate.service';

export interface CartGroupedByShop {
  shopId: string | null;
  shopName: string | null;
  shopNameKo: string | null;
  items: CartItemResponse[];
}

export interface CartItemResponse {
  id: string;
  productId: string;
  titleKo: string;
  titleOriginal: string;
  imageUrl: string | null;
  priceKrw: string;
  priceCny: string;
  quantity: number;
  minOrderQty: number;
  options: any;
  subtotalKrw: number;
  createdAt: string;
}

export interface CartSummary {
  totalItems: number;
  totalQuantity: number;
  totalKrw: number;
  totalCny: number;
  exchangeRate: number;
}

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly exchangeRateService: ExchangeRateService,
  ) {}

  /**
   * Get all cart items grouped by shop
   */
  async getCart(userId: string): Promise<CartGroupedByShop[]> {
    const cartItems = await this.prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: { shop: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group by shop
    const shopMap = new Map<string, CartGroupedByShop>();

    for (const item of cartItems) {
      const shopId = item.product.shopId ?? 'unknown';
      if (!shopMap.has(shopId)) {
        shopMap.set(shopId, {
          shopId: item.product.shopId,
          shopName: item.product.shop?.nameOriginal ?? null,
          shopNameKo: item.product.shop?.nameKo ?? null,
          items: [],
        });
      }

      const priceKrw = Number(item.product.priceKrw);
      shopMap.get(shopId)!.items.push({
        id: item.id,
        productId: item.productId,
        titleKo: item.product.titleKo,
        titleOriginal: item.product.titleOriginal,
        imageUrl: item.product.imageProxyUrls?.[0] ?? item.product.imageUrls?.[0] ?? null,
        priceKrw: String(item.product.priceKrw),
        priceCny: String(item.product.priceOriginalCny),
        quantity: item.quantity,
        minOrderQty: item.product.minOrderQty,
        options: item.options,
        subtotalKrw: priceKrw * item.quantity,
        createdAt: item.createdAt.toISOString(),
      });
    }

    return Array.from(shopMap.values());
  }

  /**
   * Add an item to the cart (or update quantity if already exists)
   */
  async addItem(
    userId: string,
    productId: string,
    quantity: number,
    options?: any,
  ): Promise<CartItemResponse> {
    // Validate product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { shop: true },
    });

    if (!product || !product.isActive) {
      throw new NotFoundException('상품을 찾을 수 없습니다.');
    }

    // Respect minimum order quantity
    if (quantity < product.minOrderQty) {
      throw new BadRequestException(
        `최소 주문 수량은 ${product.minOrderQty}개입니다.`,
      );
    }

    // Check stock
    if (product.stock !== null && quantity > product.stock) {
      throw new BadRequestException(
        `재고가 부족합니다. 현재 재고: ${product.stock}개`,
      );
    }

    // Upsert: if same product+options exists, update quantity
    const existing = await this.prisma.cartItem.findFirst({
      where: {
        userId,
        productId,
        options: options ?? undefined,
      },
    });

    let cartItem;

    if (existing) {
      cartItem = await this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity },
        include: { product: { include: { shop: true } } },
      });
    } else {
      cartItem = await this.prisma.cartItem.create({
        data: {
          userId,
          productId,
          quantity,
          options: options ?? undefined,
        },
        include: { product: { include: { shop: true } } },
      });
    }

    const priceKrw = Number(cartItem.product.priceKrw);
    return {
      id: cartItem.id,
      productId: cartItem.productId,
      titleKo: cartItem.product.titleKo,
      titleOriginal: cartItem.product.titleOriginal,
      imageUrl:
        cartItem.product.imageProxyUrls?.[0] ??
        cartItem.product.imageUrls?.[0] ??
        null,
      priceKrw: String(cartItem.product.priceKrw),
      priceCny: String(cartItem.product.priceOriginalCny),
      quantity: cartItem.quantity,
      minOrderQty: cartItem.product.minOrderQty,
      options: cartItem.options,
      subtotalKrw: priceKrw * cartItem.quantity,
      createdAt: cartItem.createdAt.toISOString(),
    };
  }

  /**
   * Update cart item quantity
   */
  async updateQuantity(
    userId: string,
    itemId: string,
    quantity: number,
  ): Promise<CartItemResponse> {
    const cartItem = await this.prisma.cartItem.findFirst({
      where: { id: itemId, userId },
      include: { product: true },
    });

    if (!cartItem) {
      throw new NotFoundException('장바구니 항목을 찾을 수 없습니다.');
    }

    if (quantity < cartItem.product.minOrderQty) {
      throw new BadRequestException(
        `최소 주문 수량은 ${cartItem.product.minOrderQty}개입니다.`,
      );
    }

    if (cartItem.product.stock !== null && quantity > cartItem.product.stock) {
      throw new BadRequestException(
        `재고가 부족합니다. 현재 재고: ${cartItem.product.stock}개`,
      );
    }

    const updated = await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: { product: { include: { shop: true } } },
    });

    const priceKrw = Number(updated.product.priceKrw);
    return {
      id: updated.id,
      productId: updated.productId,
      titleKo: updated.product.titleKo,
      titleOriginal: updated.product.titleOriginal,
      imageUrl:
        updated.product.imageProxyUrls?.[0] ??
        updated.product.imageUrls?.[0] ??
        null,
      priceKrw: String(updated.product.priceKrw),
      priceCny: String(updated.product.priceOriginalCny),
      quantity: updated.quantity,
      minOrderQty: updated.product.minOrderQty,
      options: updated.options,
      subtotalKrw: priceKrw * updated.quantity,
      createdAt: updated.createdAt.toISOString(),
    };
  }

  /**
   * Remove a single item from cart
   */
  async removeItem(userId: string, itemId: string): Promise<void> {
    const cartItem = await this.prisma.cartItem.findFirst({
      where: { id: itemId, userId },
    });

    if (!cartItem) {
      throw new NotFoundException('장바구니 항목을 찾을 수 없습니다.');
    }

    await this.prisma.cartItem.delete({ where: { id: itemId } });
  }

  /**
   * Clear all items from cart
   */
  async clearCart(userId: string): Promise<void> {
    await this.prisma.cartItem.deleteMany({ where: { userId } });
  }

  /**
   * Get cart summary with totals
   */
  async getCartSummary(userId: string): Promise<CartSummary> {
    const cartItems = await this.prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    const rate = await this.exchangeRateService.getCurrentRate();

    let totalKrw = 0;
    let totalCny = 0;
    let totalQuantity = 0;

    for (const item of cartItems) {
      const priceKrw = Number(item.product.priceKrw);
      const priceCny = Number(item.product.priceOriginalCny);
      totalKrw += priceKrw * item.quantity;
      totalCny += priceCny * item.quantity;
      totalQuantity += item.quantity;
    }

    return {
      totalItems: cartItems.length,
      totalQuantity,
      totalKrw,
      totalCny: Math.round(totalCny * 100) / 100,
      exchangeRate: rate.rate,
    };
  }
}
