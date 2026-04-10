'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const MAIN_CATEGORIES = [
  { slug: 'living', label: '생활/주방', icon: '🏠' },
  { slug: 'fashion', label: '패션/의류', icon: '👗' },
  { slug: 'digital', label: '전자/디지털', icon: '📱' },
  { slug: 'beauty', label: '뷰티/건강', icon: '💄' },
  { slug: 'stationery', label: '문구/완구', icon: '✏️' },
  { slug: 'sports', label: '스포츠', icon: '⚽' },
  { slug: 'pets', label: '반려동물', icon: '🐾' },
  { slug: 'tools', label: '공구/산업', icon: '🔧' },
  { slug: 'interior', label: '인테리어', icon: '🌿' },
  { slug: 'food', label: '식품/음료', icon: '🍜' },
  { slug: 'auto', label: '자동차', icon: '🚗' },
  { slug: 'kids', label: '유아동', icon: '👶' },
];

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

        {/* Korean category grid */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">주요 카테고리</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {MAIN_CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <span className="text-3xl mb-2">{cat.icon}</span>
                <span className="text-sm font-medium text-gray-700 text-center">
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Yiwugo API categories */}
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full" />
          </div>
        ) : apiCategories.length > 0 ? (
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              이우고 상품 분류
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {apiCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/search?categoryId=${cat.id}`}
                  className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  {cat.img && (
                    <img
                      src={cat.img}
                      alt={cat.type}
                      className="w-10 h-10 rounded object-cover"
                    />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-800">{cat.type}</p>
                    {cat.entype && (
                      <p className="text-xs text-gray-500">{cat.entype}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
