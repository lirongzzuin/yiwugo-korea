'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import ProductPrice from './ProductPrice';

export interface Product {
  id: string;
  name: string;
  imageUrl: string;
  category?: string;
  priceKRW: number;
  originalPriceKRW?: number;
  priceCNY?: number;
  discountPercent?: number;
  moq?: number;
  salesCount?: number;
  badge?: 'TOP' | 'SALE' | 'HOT' | 'NEW' | null;
  shopName?: string;
  rating?: number;
  reviewCount?: number;
}

interface ProductCardProps {
  product: Product;
  className?: string;
}

const badgeStyles: Record<string, string> = {
  TOP: 'bg-primary text-white',
  SALE: 'bg-secondary-container text-white',
  HOT: 'bg-red-500 text-white',
  NEW: 'bg-tertiary text-white',
};

export default function ProductCard({ product, className }: ProductCardProps) {
  const [isFav, setIsFav] = useState(false);

  return (
    <Link
      href={`/product/${product.id}`}
      className={cn(
        'group block bg-surface-container-lowest rounded-xl overflow-hidden hover:shadow-medium transition-shadow',
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-surface-container">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {/* Badge */}
        {product.badge && (
          <span
            className={cn(
              'absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-md',
              badgeStyles[product.badge]
            )}
          >
            {product.badge}
          </span>
        )}
        {/* Favorite */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsFav(!isFav);
          }}
          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
        >
          <span
            className={cn(
              'material-symbols-outlined text-[20px]',
              isFav ? 'text-primary' : 'text-stone-400'
            )}
            style={isFav ? { fontVariationSettings: "'FILL' 1" } : undefined}
          >
            favorite
          </span>
        </button>
      </div>

      {/* Info */}
      <div className="p-3 space-y-1.5">
        {product.category && (
          <span className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wide">
            {product.category}
          </span>
        )}
        <h3 className="text-sm font-medium text-on-surface line-clamp-2 leading-snug">
          {product.name}
        </h3>
        <ProductPrice
          priceKRW={product.priceKRW}
          originalPriceKRW={product.originalPriceKRW}
          priceCNY={product.priceCNY}
          discountPercent={product.discountPercent}
          size="sm"
        />
        <div className="flex items-center gap-2 text-[10px] text-on-surface-variant">
          {product.moq && (
            <span className="bg-surface-container-low px-1.5 py-0.5 rounded text-[10px] font-medium">
              MOQ {product.moq}개
            </span>
          )}
          {product.salesCount !== undefined && product.salesCount > 0 && (
            <span>{product.salesCount.toLocaleString()}개 판매</span>
          )}
        </div>
      </div>
    </Link>
  );
}
