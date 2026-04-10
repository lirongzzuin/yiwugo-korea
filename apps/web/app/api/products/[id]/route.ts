import { NextRequest, NextResponse } from 'next/server';
import * as yiwugo from '../../../../lib/yiwugo-server';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;
    const detail = await yiwugo.getProductDetail(productId);

    if (!detail) {
      return NextResponse.json(
        { error: '상품을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // Map raw Yiwugo product detail to frontend shape
    const sellPrice = Number(detail.sellPrice || 0);
    const priceCny = sellPrice > 100 ? sellPrice / 100 : sellPrice;
    const priceKrw = Math.round(priceCny * 180 * 1.05);

    const images: string[] = [];
    if (detail.imgUrl) images.push(detail.imgUrl);
    if (detail.picUrl) images.push(detail.picUrl);
    if (Array.isArray(detail.imgList)) {
      detail.imgList.forEach((img: any) => {
        const url = typeof img === 'string' ? img : img?.url || img?.imgUrl;
        if (url) images.push(url);
      });
    }

    return NextResponse.json({
      id: detail.productId || detail.num || productId,
      title: detail.title || detail.productName || '',
      priceKrw,
      priceCny: priceCny.toFixed(2),
      imageUrl: images[0] || '',
      images: [...new Set(images)],
      shopName: detail.shopName || '',
      shopId: detail.shopId || '',
      salesCount: detail.dealQuantity || 0,
      minOrder: detail.smallNum || detail.beginNumber || 1,
      boothNumber: detail.boothNo || '',
      description: detail.description || detail.productDesc || '',
      specifications: detail.specifications || detail.attrs || {},
      mainProduct: detail.mainProduct || '',
    });
  } catch (error) {
    console.error('Error in /api/products/[id]:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
