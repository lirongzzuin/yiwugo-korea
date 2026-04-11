'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

// Chinese category name → Korean mapping (matches actual API response)
const CATEGORY_NAME_MAP: Record<string, string> = {
  '辅料': '부자재', '配饰': '패션잡화', '医疗器械': '의료기기', '五金': '철물/공구',
  '机械': '기계', '鞋靴': '신발', '家电': '가전', '数码': '디지털',
  '汽车用品': '자동차용품', '百货': '생활잡화', '母婴': '유아/출산', '工艺品': '공예품',
  '个护': '개인위생', '帽子围巾': '모자/스카프', '节庆礼品': '축제/선물', '箱包': '가방',
  '宠物用品': '반려동물', '体育用品': '스포츠', '办公文教': '사무/문구', '服饰': '의류',
  '内衣': '속옷/언더웨어', '袜类': '양말', '厨卫': '주방/욕실', '饰品': '액세서리',
  '玩具': '완구', '地摊挑货': '시장용품', '美妆': '뷰티', '药品': '의약품',
};

const CATEGORY_ICON_MAP: Record<string, string> = {
  '辅料': '🧵', '配饰': '⌚', '医疗器械': '🏥', '五金': '🔧',
  '机械': '⚙️', '鞋靴': '👟', '家电': '🏠', '数码': '📱',
  '汽车用品': '🚗', '百货': '🛒', '母婴': '👶', '工艺品': '🎨',
  '个护': '🧴', '帽子围巾': '🧢', '节庆礼品': '🎁', '箱包': '👜',
  '宠物用品': '🐾', '体育用品': '⚽', '办公文教': '📚', '服饰': '👗',
  '内衣': '👙', '袜类': '🧦', '厨卫': '🍳', '饰品': '💎',
  '玩具': '🧸', '地摊挑货': '🏪', '美妆': '💄', '药品': '💊',
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
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-on-surface mb-6">전체 카테고리</h1>

        {loading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center p-4 bg-surface-container-lowest rounded-xl animate-pulse">
                <div className="w-10 h-10 rounded-full bg-surface-container mb-2" />
                <div className="w-14 h-3 bg-surface-container rounded" />
              </div>
            ))}
          </div>
        ) : apiCategories.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {apiCategories.map((cat) => {
              const koreanName = CATEGORY_NAME_MAP[cat.type] || cat.type;
              const icon = CATEGORY_ICON_MAP[cat.type] || '📦';
              return (
                <Link
                  key={cat.id}
                  href={`/category/${encodeURIComponent(cat.type)}`}
                  className="flex flex-col items-center p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/20 hover:shadow-md hover:border-primary/30 transition-all"
                >
                  <span className="text-3xl mb-2">{icon}</span>
                  <span className="text-sm font-medium text-on-surface text-center">
                    {koreanName}
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-on-surface-variant">카테고리를 불러올 수 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
