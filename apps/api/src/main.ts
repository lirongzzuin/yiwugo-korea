import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as helmet from 'helmet';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import { createLogger, format, transports } from 'winston';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';

const winstonLogger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    process.env.NODE_ENV === 'production'
      ? format.json()
      : format.combine(format.colorize(), format.simple()),
  ),
  defaultMeta: { service: 'yiwugo-api' },
  transports: [
    new transports.Console(),
    ...(process.env.NODE_ENV === 'production'
      ? [
          new transports.File({ filename: 'logs/error.log', level: 'error' }),
          new transports.File({ filename: 'logs/combined.log' }),
        ]
      : []),
  ],
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port', 4000);
  const nodeEnv = configService.get<string>('app.nodeEnv', 'development');

  // Security
  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());

  // CORS
  const corsOrigins = configService.get<string>('app.corsOrigins', 'http://localhost:3000');
  app.enableCors({
    origin: corsOrigins.split(',').map((o) => o.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  });

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global filters (order matters: last registered = first executed)
  app.useGlobalFilters(
    new HttpExceptionFilter(winstonLogger),
    new PrismaExceptionFilter(winstonLogger),
  );

  // Global interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(winstonLogger),
    new TimeoutInterceptor(),
    new TransformInterceptor(),
  );

  // Swagger
  if (nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('YiwuGo Korea API')
      .setDescription('YiwuGo Korea marketplace backend API')
      .setVersion('1.0')
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
      .addTag('health', 'Health check endpoints')
      .addTag('auth', 'Authentication endpoints')
      .addTag('users', 'User management')
      .addTag('products', 'Product catalog')
      .addTag('orders', 'Order management')
      .addTag('payments', 'Payment processing')
      .addTag('search', 'Search functionality')
      .addTag('categories', 'Category management')
      .addTag('cart', 'Shopping cart')
      .addTag('wishlist', 'Wishlist management')
      .addTag('reviews', 'Product reviews')
      .addTag('coupons', 'Coupon system')
      .addTag('points', 'Points system')
      .addTag('notifications', 'User notifications')
      .addTag('shipping', 'Shipping & tracking')
      .addTag('admin', 'Admin panel')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
    winstonLogger.info('Swagger docs available at /api/docs');
  }

  await app.listen(port);
  winstonLogger.info(`YiwuGo Korea API running on port ${port} [${nodeEnv}]`);
}

bootstrap();
