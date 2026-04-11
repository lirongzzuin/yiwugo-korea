'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import ProductPrice from './ProductPrice';
import { useWishlistStore } from '@/stores/wishlist-store';

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
  /** Show ranking number */
  rank?: number;
}

const badgeStyles: Record<string, string> = {
  TOP: 'bg-primary text-white',
  SALE: 'bg-red-500 text-white',
  HOT: 'bg-orange-500 text-white',
  NEW: 'bg-tertiary text-white',
};

const badgeLabels: Record<string, string> = {
  TOP: '인기',
  SALE: '특가',
  HOT: '핫딜',
  NEW: '신상',
};

export default function ProductCard({ product, className, rank }: ProductCardProps) {
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isWishlisted = useWishlistStore((s) => s.isWishlisted(product.id));
  const [mounted, setMounted] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const discountPercent = product.discountPercent ||
    (product.originalPriceKRW && product.originalPriceKRW > product.priceKRW
      ? Math.round((1 - product.priceKRW / product.originalPriceKRW) * 100)
      : 0);

  const handleToggleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      productId: product.id,
      productName: product.name,
      imageUrl: product.imageUrl || '',
      priceKrw: product.priceKRW,
      priceCny: product.priceCNY || 0,
      category: product.category || '',
      addedAt: new Date().toISOString(),
    });
  };

  const isFav = mounted ? isWishlisted : false;

  return (
    <Link
      href={`/product/${product.id}`}
      className={cn(
        'group block bg-surface-container-lowest rounded-xl overflow-hidden hover:shadow-medium transition-all duration-200',
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-surface-container">
        {!imgError && product.imageUrl ? (
          <>
            {!imgLoaded && (
              <div className="absolute inset-0 bg-surface-container animate-pulse" />
            )}
            <img
              src={product.imageUrl}
              alt={product.name}
              className={cn(
                'w-full h-full object-cover group-hover:scale-105 transition-transform duration-300',
                imgLoaded ? 'opacity-100' : 'opacity-0'
              )}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
            />
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-surface-container">
            <span className="material-symbols-outlined text-[32px] text-on-surface-variant/20">image</span>
          </div>
        )}

        {/* Rank badge */}
        {rank && rank <= 3 && (
          <div className={cn(
            'absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-sm',
            rank === 1 ? 'bg-amber-500' : rank === 2 ? 'bg-stone-400' : 'bg-amber-700'
          )}>
            {rank}
          </div>
        )}

        {/* Badge */}
        {product.badge && !rank && (
          <span
            className={cn(
              'absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm',
              badgeStyles[product.badge]
            )}
          >
            {badgeLabels[product.badge] || product.badge}
          </span>
        )}

        {/* Discount badge */}
        {discountPercent > 0 && !product.badge && !rank && (
          <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-500 text-white shadow-sm">
            -{discountPercent}%
          </span>
        )}

        {/* Favorite */}
        <button
          onClick={handleToggleFav}
          className={cn(
            'absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full backdrop-blur-sm transition-all',
            isFav ? 'bg-primary/10' : 'bg-white/70 hover:bg-white'
          )}
          aria-label={isFav ? '찜 해제' : '찜하기'}
        >
          <span
            className={cn(
              'material-symbols-outlined text-[18px] transition-all',
              isFav ? 'text-primary scale-110' : 'text-stone-400'
            )}
            style={isFav ? { fontVariationSettings: "'FILL' 1" } : undefined}
          >
            favorite
          </span>
        </button>
      </div>

      {/* Info */}
      <div className="p-3 space-y-1.5">
        {product.shopName && (
          <span className="text-[10px] font-medium text-on-surface-variant/70 truncate block">
            {product.shopName}
          </span>
        )}
        <h3 className="text-sm font-medium text-on-surface line-clamp-2 leading-snug min-h-[2.5em]">
          {product.name}
        </h3>
        <ProductPrice
          priceKRW={product.priceKRW}
          originalPriceKRW={product.originalPriceKRW}
          priceCNY={product.priceCNY}
          discountPercent={product.discountPercent}
          size="sm"
        />

        {/* Rating + Sales row */}
        <div className="flex items-center gap-1.5 pt-0.5">
          {product.rating && product.rating > 0 && (
            <div className="flex items-center gap-0.5">
              <span
                className="material-symbols-outlined text-[12px] text-amber-500"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
              <span className="text-[10px] font-semibold text-amber-700">{product.rating.toFixed(1)}</span>
              {product.reviewCount !== undefined && product.reviewCount > 0 && (
                <span className="text-[10px] text-on-surface-variant">({product.reviewCount})</span>
              )}
            </div>
          )}
          {product.salesCount !== undefined && product.salesCount > 0 && (
            <>
              {product.rating && product.rating > 0 && (
                <span className="text-[8px] text-on-surface-variant/30">|</span>
              )}
              <span className="text-[10px] text-on-surface-variant">
                {product.salesCount >= 1000
                  ? `${(product.salesCount / 1000).toFixed(1)}k+ 판매`
                  : `${product.salesCount}+ 판매`
                }
              </span>
            </>
          )}
        </div>

        {product.moq && product.moq > 1 && (
          <span className="inline-block bg-surface-container px-1.5 py-0.5 rounded text-[10px] font-medium text-on-surface-variant">
            MOQ {product.moq}개
          </span>
        )}
      </div>
    </Link>
  );
}
