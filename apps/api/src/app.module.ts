import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';

import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import redisConfig from './config/redis.config';
import jwtConfig from './config/jwt.config';
import throttleConfig from './config/throttle.config';

import { HealthModule } from './modules/health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './common/services/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';

import { YiwugoModule } from './modules/yiwugo/yiwugo.module';
import { TranslationModule } from './modules/translation/translation.module';
import { ExchangeRateModule } from './modules/exchange-rate/exchange-rate.module';

import { ShopModule } from './modules/shop/shop.module';
import { ProductModule } from './modules/product/product.module';
import { CartModule } from './modules/cart/cart.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { CategoryModule } from './modules/category/category.module';
import { SearchModule } from './modules/search/search.module';
import { ShippingModule } from './modules/shipping/shipping.module';

import { PaymentModule } from './modules/payment/payment.module';
import { OrderModule } from './modules/order/order.module';
import { CouponModule } from './modules/coupon/coupon.module';
import { PointsModule } from './modules/points/points.module';
import { RefundModule } from './modules/refund/refund.module';

import { ChatModule } from './modules/chat/chat.module';
import { InquiryModule } from './modules/inquiry/inquiry.module';
import { ContentModule } from './modules/content/content.module';
import { FileModule } from './modules/file/file.module';

import { SettlementModule } from './modules/settlement/settlement.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AuditModule } from './modules/audit/audit.module';
import { TaxModule } from './modules/tax/tax.module';
import { RecommendationModule } from './modules/recommendation/recommendation.module';

@Module({
  imports: [
    // Global config
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, redisConfig, jwtConfig, throttleConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 100,
      },
    ]),

    // Scheduled tasks
    ScheduleModule.forRoot(),

    // Event system
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      maxListeners: 20,
      verboseMemoryLeak: true,
    }),

    // Infrastructure modules
    PrismaModule,
    RedisModule,

    // Feature modules
    HealthModule,
    AuthModule,
    UserModule,
    YiwugoModule,
    TranslationModule,
    ExchangeRateModule,
    ShopModule,
    ProductModule,
    CartModule,
    WishlistModule,
    CategoryModule,
    SearchModule,
    ShippingModule,
    PointsModule,
    CouponModule,
    PaymentModule,
    RefundModule,
    OrderModule,
    ChatModule,
    InquiryModule,
    ContentModule,
    FileModule,
    AnalyticsModule,
    AuditModule,
    TaxModule,
    SettlementModule,
    RecommendationModule,
  ],
})
export class AppModule {}
