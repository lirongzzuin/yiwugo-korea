import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
} from 'class-validator';
import { ShippingMethod, PaymentProvider } from '@prisma/client';

export class CreateOrderDto {
  @IsString()
  shippingAddressId!: string;

  @IsString()
  customsCode!: string;

  @IsEnum(ShippingMethod)
  shippingMethod!: ShippingMethod;

  @IsOptional()
  @IsString()
  couponId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  pointsToUse?: number;

  @IsEnum(PaymentProvider)
  paymentProvider!: PaymentProvider;

  @IsOptional()
  @IsString()
  deliveryMemo?: string;
}
