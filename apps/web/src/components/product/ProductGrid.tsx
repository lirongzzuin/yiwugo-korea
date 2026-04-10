'use client';

import { cn } from '@/lib/cn';
import ProductCard, { type Product } from './ProductCard';
import { ProductCardSkeleton } from '@/components/common/Skeleton';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  skeletonCount?: number;
  className?: string;
  columns?: 2 | 3 | 4;
}

export default function ProductGrid({
  products,
  loading = false,
  skeletonCount = 8,
  className,
  columns = 2,
}: ProductGridProps) {
  const gridCols = {
    2: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    3: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
    4: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
  };

  if (loading) {
    return (
      <div className={cn('grid gap-3 md:gap-4', gridCols[columns], className)}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <span className="material-symbols-outlined text-[48px] text-stone-300 mb-3">
          inventory_2
        </span>
        <p className="text-sm text-on-surface-variant">상품이 없습니다</p>
      </div>
    );
  }

  return (
    <div className={cn('grid gap-3 md:gap-4', gridCols[columns], className)}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
