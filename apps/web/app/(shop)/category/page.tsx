'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

// Chinese category name → Korean mapping
const CATEGORY_NAME_MAP: Record<string, string> = {
  '饰品': '액세서리',
  '工艺品': '공예품',
  '五金': '철물',
  '箱包': '가방',
  '服装服饰': '패션의류',
  '日用百货': '생활잡화',
  '针纺织品': '섬유직물',
  '鞋类': '신발',
  '玩具': '완구',
  '文体': '문구/체육',
  '电子电器': '전자/가전',
  '化妆品': '화장품',
  '食品': '식품',
  '汽摩配件': '자동차부품',
  '母婴用品': '유아용품',
  '宠物用品': '반려동물',
  '运动户外': '스포츠/아웃도어',
  '家居家装': '홈인테리어',
  '办公文教': '사무/교육',
  '护肤品': '스킨케어',
};

// Emoji icon mapping for categories
const CATEGORY_ICON_MAP: Record<string, string> = {
  '饰品': '💎',
  '工艺品': '🎨',
  '五金': '🔧',
  '箱包': '👜',
  '服装服饰': '👗',
  '日用百货': '🏠',
  '针纺织品': '🧵',
  '鞋类': '👟',
  '玩具': '🧸',
  '文体': '✏️',
  '电子电器': '📱',
  '化妆品': '💄',
  '食品': '🍜',
  '汽摩配件': '🚗',
  '母婴用品': '👶',
  '宠物用品': '🐾',
  '运动户外': '⚽',
  '家居家装': '🌿',
  '办公文教': '📚',
  '护肤品': '🧴',
};

interface ApiCategory {
  id: number;
  type: string;
  entype: string;
  img?: string;
  rank?: string;
}

export default function CategoryPage() {
  const [apiCategories, setApiCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setApiCategories(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">전체 카테고리</h1>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full" />
          </div>
        ) : apiCategories.length > 0 ? (
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              이우고 상품 분류
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {apiCategories.map((cat) => {
                const koreanName = CATEGORY_NAME_MAP[cat.type] || cat.type;
                const icon = CATEGORY_ICON_MAP[cat.type] || '📦';
                return (
                  <Link
                    key={cat.id}
                    href={`/search?categoryId=${cat.id}`}
                    className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <span className="text-3xl mb-2">{icon}</span>
                    <span className="text-sm font-medium text-gray-700 text-center">
                      {koreanName}
                    </span>
                    {cat.entype && (
                      <span className="text-xs text-gray-400 text-center mt-0.5">
                        {cat.entype}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">카테고리를 불러올 수 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
