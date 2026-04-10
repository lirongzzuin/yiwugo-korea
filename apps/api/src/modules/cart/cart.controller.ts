import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '@common/decorators/current-user.decorator';
import { TransformInterceptor } from '@common/interceptors/transform.interceptor';
import { CartService } from './cart.service';

@ApiTags('Cart')
@ApiBearerAuth()
@Controller('cart')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TransformInterceptor)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: '장바구니 조회' })
  async getCart(@CurrentUser() user: JwtPayload) {
    const [cart, summary] = await Promise.all([
      this.cartService.getCart(user.sub),
      this.cartService.getCartSummary(user.sub),
    ]);
    return { shops: cart, summary };
  }

  @Post('items')
  @ApiOperation({ summary: '장바구니에 상품 추가' })
  async addItem(
    @CurrentUser() user: JwtPayload,
    @Body() body: { productId: string; quantity: number; options?: any },
  ) {
    return this.cartService.addItem(
      user.sub,
      body.productId,
      body.quantity,
      body.options,
    );
  }

  @Patch('items/:id')
  @ApiOperation({ summary: '장바구니 수량 변경' })
  async updateQuantity(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: { quantity: number },
  ) {
    return this.cartService.updateQuantity(user.sub, id, body.quantity);
  }

  @Delete('items/:id')
  @ApiOperation({ summary: '장바구니 항목 삭제' })
  async removeItem(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    await this.cartService.removeItem(user.sub, id);
    return { message: '삭제되었습니다.' };
  }

  @Delete()
  @ApiOperation({ summary: '장바구니 비우기' })
  async clearCart(@CurrentUser() user: JwtPayload) {
    await this.cartService.clearCart(user.sub);
    return { message: '장바구니가 비워졌습니다.' };
  }
}
