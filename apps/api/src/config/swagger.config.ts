import { DocumentBuilder } from '@nestjs/swagger';

export function createSwaggerConfig() {
  return new DocumentBuilder()
    .setTitle('YiwuGo Korea API')
    .setDescription(
      'YiwuGo Korea marketplace backend API - 이우 소상품 도시 한국 직구 플랫폼',
    )
    .setVersion('1.0')
    .setContact('YiwuGo Korea', 'https://yiwugo-korea.com', 'support@yiwugo-korea.com')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT access token',
        in: 'header',
      },
      'access-token',
    )
    .addServer('http://localhost:4000', 'Local Development')
    .addServer('https://api.yiwugo-korea.com', 'Production')
    .addTag('health', 'Health check endpoints')
    .addTag('auth', 'Authentication & authorization')
    .addTag('users', 'User management')
    .addTag('products', 'Product catalog from Yiwugo')
    .addTag('orders', 'Order lifecycle management')
    .addTag('payments', 'Payment processing (TossPayments, KakaoPay)')
    .addTag('search', 'Product search (Meilisearch)')
    .addTag('categories', 'Category management')
    .addTag('cart', 'Shopping cart')
    .addTag('wishlist', 'Wishlist management')
    .addTag('reviews', 'Product reviews')
    .addTag('coupons', 'Coupon system')
    .addTag('points', 'Points & rewards')
    .addTag('notifications', 'User notifications')
    .addTag('shipping', 'Shipping & customs tracking')
    .addTag('chat', 'Real-time chat')
    .addTag('admin', 'Admin panel endpoints')
    .build();
}
