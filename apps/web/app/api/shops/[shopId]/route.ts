import { NextRequest, NextResponse } from 'next/server';
import * as yiwugo from '../../../../lib/yiwugo-server';
import { normalizeImageUrl } from '../../../../lib/yiwugo-server';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: { shopId: string } }
) {
  try {
    const shopId = params.shopId;
    const detail = await yiwugo.getShopDetail(shopId);

    if (!detail) {
      return NextResponse.json(
        { error: '상점을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const shopInfo = detail.shopdetail?.shop || detail.shopinfo || {};
    const shopBooth = detail.shopdetail?.shopbooth || {};

    // Map srplist products with proper price conversion (sellPrice in 分)
    const products = (detail.srplist || []).map((p: any) => {
      const imageUrl = normalizeImageUrl(p.picture1 || p.picture2 || '');
      const priceCny = p.price ? Number(p.price) / 100 : 0; // price in 分
      return {
        id: String(p.id),
        title: p.title || '',
        imageUrl,
        priceCny,
        priceKrw: Math.round(priceCny * 190 * 1.05),
        salesCount: p.dealQuantity || 0,
      };
    });

    return NextResponse.json({
      id: String(shopInfo.shopId || shopId),
      shopName: shopInfo.shopName || '',
      mainProduct: shopInfo.mainProduct || '',
      introduction: shopInfo.introduction || '',
      boothNo: shopBooth.boothno || shopInfo.boothNo || '',
      pictureUrl: normalizeImageUrl(shopInfo.pictureUrlA || shopInfo.pictureUrlSa || ''),
      shopImageUrl: normalizeImageUrl(shopInfo.shopImageUrl || ''),
      contacter: shopInfo.contacter || '',
      telephone: shopInfo.telephone || '',
      mobile: shopInfo.mobile || '',
      subMarket: shopBooth.submarket || shopInfo.subMarket || '',
      subFloor: String(shopBooth.subfloor || shopInfo.subFloor || ''),
      marketInfo: shopBooth.newMarketInfo || shopBooth.marketInfo || '',
      productCount: detail.productCount || 0,
      credit: shopInfo.credit || 0,
      integrityFraction: shopInfo.integrityFraction || 0,
      licenseImg: normalizeImageUrl(detail.LicenseImg || ''),
      products,
    });
  } catch (error) {
    console.error('Error in /api/shops/[shopId]:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'API unavailable' }, { status: 502 });
  }
}
