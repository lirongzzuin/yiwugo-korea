import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsBoolean,
  IsArray,
  MaxLength,
} from 'class-validator';

export class CreateReviewDto {
  @IsString()
  productId!: string;

  @IsOptional()
  @IsString()
  orderId?: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  content?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsBoolean()
  qualityGood?: boolean;

  @IsOptional()
  @IsBoolean()
  deliveryGood?: boolean;

  @IsOptional()
  @IsBoolean()
  transAccurate?: boolean;
}
