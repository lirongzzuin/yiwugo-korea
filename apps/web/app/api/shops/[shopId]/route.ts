import { NextRequest, NextResponse } from 'next/server';
import * as yiwugo from '../../../../lib/yiwugo-server';

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

    const shopInfo = detail.shopdetail?.shop || detail.shopinfo || detail;
    const shopBooth = detail.shopdetail?.shopbooth || {};

    return NextResponse.json({
      id: String(shopInfo.shopId || shopId),
      shopName: shopInfo.shopName || '',
      mainProduct: shopInfo.mainProduct || '',
      introduction: shopInfo.introduction || '',
      boothNo: shopInfo.boothNo || shopBooth.boothno || '',
      pictureUrl: shopInfo.pictureUrlA || shopInfo.pictureUrlSa || '',
      shopImageUrl: shopInfo.shopImageUrl || '',
      contacter: shopInfo.contacter || '',
      telephone: shopInfo.telephone || '',
      mobile: shopInfo.mobile || '',
      subMarket: shopInfo.subMarket || shopBooth.submarket || '',
      subFloor: shopInfo.subFloor || shopBooth.subfloor || '',
      marketInfo: shopBooth.marketInfo || shopBooth.newMarketInfo || '',
      productCount: detail.productCount || 0,
      credit: shopInfo.credit || 0,
      integrityFraction: shopInfo.integrityFraction || 0,
      licenseImg: detail.LicenseImg || '',
      products: (detail.srplist || []).map((p: any) => ({
        id: String(p.id),
        title: p.title || '',
        imageUrl: p.picture1 || p.picture2 || '',
        sellPrice: p.sellPrice || 0,
        salesCount: p.dealQuantity || 0,
      })),
    });
  } catch (error) {
    console.error('Error in /api/shops/[shopId]:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
