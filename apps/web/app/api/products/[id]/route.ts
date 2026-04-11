import { NextRequest, NextResponse } from 'next/server';
import * as yiwugo from '../../../../lib/yiwugo-server';
import { normalizeImageUrl } from '../../../../lib/yiwugo-server';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;
    const data = await yiwugo.getProductDetail(productId);

    if (!data) {
      return NextResponse.json(
        { error: '상품을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const detailInner = data.detail || {};
    const vo = detailInner.productDetailVO || {};
    const shopInfo = data.shopinfo?.shop || {};
    const shopBooth = data.shopinfo?.shopbooth || {};

    // Title from productDetailVO
    const title = vo.title || data.title || '';

    // Price: totalprice in 元(CNY). If 0, try sellPrice from vo (in 分) or unitprice
    let priceCny = parseFloat(data.totalprice || '0');
    if (priceCny === 0 && data.unitprice) {
      priceCny = parseFloat(data.unitprice);
    }
    if (priceCny === 0 && vo.sellPrice) {
      priceCny = Number(vo.sellPrice) / 100; // sellPrice in 分(cents)
    }
    const priceKrw = Math.round(priceCny * 190 * 1.05);

    // Collect images from detail.sdiProductsPicList
    const images: string[] = [];
    const addImage = (url: string) => {
      const normalized = normalizeImageUrl(url);
      if (normalized && !images.includes(normalized)) images.push(normalized);
    };

    const picList = detailInner.sdiProductsPicList || [];
    picList.forEach((pic: any) => {
      if (pic.picture1) addImage(pic.picture1);
    });
    // Fallback from productDetailVO
    if (vo.picture1) addImage(vo.picture1);

    // Price tiers from sdiProductsPriceList
    const priceTiers = (detailInner.sdiProductsPriceList || []).map((tier: any) => ({
      startNumber: tier.startNumber,
      endNumber: tier.endNumber,
      sellPrice: tier.sellPrice / 100, // 分 → 元
    }));

    // SKU options from productPropertySkuBoList
    const skuOptions = (detailInner.productPropertySkuBoList || []).map((sku: any) => ({
      name: sku.specificationNameOne || '',
      imageUrl: normalizeImageUrl(sku.picture || ''),
      price: sku.price ? sku.price / 100 : 0,
      stock: sku.stock || 0,
    }));

    // Specs from productExtendList
    const specifications: Record<string, string> = {};
    (detailInner.productExtendList || []).forEach((ext: any) => {
      if (ext.name && ext.value) {
        specifications[ext.name] = ext.value;
      }
    });
    // Also add from propertyList
    if (Array.isArray(data.propertyList)) {
      data.propertyList.forEach((prop: any) => {
        if (prop.cvalue) {
          const values = Array.isArray(prop.cvalueList)
            ? prop.cvalueList.map((v: any) => v?.cvalue || v).join(', ')
            : '';
          specifications[prop.cvalue] = values;
        }
      });
    }

    return NextResponse.json({
      id: String(productId),
      title,
      priceKrw,
      priceCny: priceCny.toFixed(2),
      imageUrl: images[0] || '',
      images,
      shopName: shopInfo.shopName || '',
      shopId: String(shopInfo.shopId || data.sid || ''),
      salesCount: parseInt(data.dealQuantitys || detailInner.sellCounts || '0', 10),
      minOrder: data.smallnum || vo.startNumber || 1,
      boothNumber: shopBooth.boothno || '',
      description: '',
      specifications,
      priceTiers,
      skuOptions,
      mainProduct: shopInfo.mainProduct || '',
      defaultFreight: data.defaultfreight || '',
      exchangeService: data.exchangeService || 0,
      metric: vo.metric || '개',
      marketInfo: shopBooth.newMarketInfo || shopBooth.marketInfo || shopInfo.marketInfo || '',
    });
  } catch (error) {
    console.error('Error in /api/products/[id]:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'API unavailable' }, { status: 502 });
  }
}
