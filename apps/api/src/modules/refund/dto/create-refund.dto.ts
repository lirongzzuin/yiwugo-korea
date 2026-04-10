import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateRefundDto {
  @IsString()
  orderId!: string;

  @IsString()
  reason!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
