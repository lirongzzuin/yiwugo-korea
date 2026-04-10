import { NextRequest, NextResponse } from 'next/server';
import * as yiwugo from '../../../../lib/yiwugo-server';

export const dynamic = 'force-dynamic';

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

    // Yiwugo product detail response fields (from docs):
    // totalprice (CNY yuan), smallNum (MOQ), dealQuantitys (sales count),
    // propertyList (options), defaultFreight, loginId, exchangeService
    const priceCny = parseFloat(detail.totalprice || detail.sellPrice || '0');
    const priceKrw = Math.round(priceCny * 190 * 1.05);

    // Collect images from various possible fields
    const images: string[] = [];
    if (detail.imgUrl) images.push(detail.imgUrl);
    if (detail.picUrl) images.push(detail.picUrl);
    if (Array.isArray(detail.imgList)) {
      detail.imgList.forEach((img: any) => {
        const url = typeof img === 'string' ? img : img?.url || img?.imgUrl;
        if (url && !images.includes(url)) images.push(url);
      });
    }
    if (Array.isArray(detail.pictureList)) {
      detail.pictureList.forEach((pic: any) => {
        const url = typeof pic === 'string' ? pic : pic?.pictureUrl || pic?.url;
        if (url && !images.includes(url)) images.push(url);
      });
    }

    // Map propertyList to specifications
    const specifications: Record<string, string> = {};
    if (Array.isArray(detail.propertyList)) {
      detail.propertyList.forEach((prop: any) => {
        if (prop.cvalue) {
          const values = Array.isArray(prop.cvalueList)
            ? prop.cvalueList.map((v: any) => v?.cvalue || v).join(', ')
            : '';
          specifications[prop.cvalue] = values;
        }
      });
    }

    return NextResponse.json({
      id: String(detail.productId || detail.num || productId),
      title: detail.title || detail.productName || detail.newtitle || '',
      priceKrw,
      priceCny: priceCny.toFixed(2),
      imageUrl: images[0] || '',
      images: [...new Set(images)],
      shopName: detail.shopName || '',
      shopId: String(detail.shopId || detail.loginId || ''),
      salesCount: parseInt(detail.dealQuantitys || detail.dealQuantity || '0', 10),
      minOrder: parseInt(detail.smallNum || detail.beginNumber || '1', 10),
      boothNumber: detail.boothNo || '',
      description: detail.description || detail.productDesc || '',
      specifications,
      mainProduct: detail.mainProduct || '',
      defaultFreight: detail.defaultFreight || '',
      exchangeService: detail.exchangeService || 0,
    });
  } catch (error) {
    console.error('Error in /api/products/[id]:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'API unavailable' }, { status: 502 });
  }
}
