import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class ApplyCouponDto {
  @IsString()
  couponId!: string;

  @IsNumber()
  @Min(0)
  orderAmount!: number;

  @IsOptional()
  @IsString()
  categoryId?: string;
}
