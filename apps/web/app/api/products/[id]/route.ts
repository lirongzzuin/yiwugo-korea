import { NextRequest, NextResponse } from 'next/server';
import * as yiwugo from '../../../../lib/yiwugo-server';
import { normalizeImageUrl } from '../../../../lib/yiwugo-server';
import { translateBatch } from '../../../../lib/translation-service';

export const dynamic = 'force-dynamic';

async function getExchangeRate(): Promise<number> {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/CNY', {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const json = await res.json();
      if (json.rates?.KRW) {
        const base = Math.round(json.rates.KRW * 100) / 100;
        return Math.round(base * 1.015 * 100) / 100; // 해외결제 수수료 1.5%
      }
    }
  } catch { /* fallback */ }
  return 219;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;
    const [data, rate] = await Promise.all([
      yiwugo.getProductDetail(productId),
      getExchangeRate(),
    ]);

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
    const rawTitle = vo.title || data.title || '';
    const rawShopName = shopInfo.shopName || '';
    const rawMarketInfo = shopBooth.newMarketInfo || shopBooth.marketInfo || shopInfo.marketInfo || '';

    // Price: totalprice in 元(CNY). If 0, try sellPrice from vo (in 分) or unitprice
    let priceCny = parseFloat(data.totalprice || '0');
    if (priceCny === 0 && data.unitprice) {
      priceCny = parseFloat(data.unitprice);
    }
    if (priceCny === 0 && vo.sellPrice) {
      priceCny = Number(vo.sellPrice) / 100; // sellPrice in 分(cents)
    }
    const priceKrw = Math.round(priceCny * rate);

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
    if (vo.picture1) addImage(vo.picture1);

    // Price tiers
    const priceTiers = (detailInner.sdiProductsPriceList || []).map((tier: any) => ({
      startNumber: tier.startNumber,
      endNumber: tier.endNumber,
      sellPrice: tier.sellPrice / 100,
    }));

    // SKU options
    const rawSkuOptions = (detailInner.productPropertySkuBoList || []).map((sku: any) => ({
      name: sku.specificationNameOne || '',
      imageUrl: normalizeImageUrl(sku.picture || ''),
      price: sku.price ? sku.price / 100 : 0,
      stock: sku.stock || 0,
    }));

    // Specs
    const rawSpecs: Record<string, string> = {};
    (detailInner.productExtendList || []).forEach((ext: any) => {
      if (ext.name && ext.value) {
        rawSpecs[ext.name] = ext.value;
      }
    });
    if (Array.isArray(data.propertyList)) {
      data.propertyList.forEach((prop: any) => {
        if (prop.cvalue) {
          const values = Array.isArray(prop.cvalueList)
            ? prop.cvalueList.map((v: any) => v?.cvalue || v).join(', ')
            : '';
          rawSpecs[prop.cvalue] = values;
        }
      });
    }

    // ─── 서버사이드 일괄 번역 ────────────────────────────
    // 모든 텍스트를 한 번에 배치 번역 (캐시 + 글로사리 + API)
    const textsToTranslate: string[] = [
      rawTitle,                                           // [0]
      rawShopName,                                        // [1]
      rawMarketInfo,                                      // [2]
      ...rawSkuOptions.map((s: any) => s.name),           // [3 ~ 3+skuCount-1]
      ...Object.keys(rawSpecs),                           // spec keys
      ...Object.values(rawSpecs),                         // spec values
    ].filter(Boolean);

    const translatedTexts = await translateBatch(textsToTranslate);

    // 번역 결과 분배
    let idx = 0;
    const title = translatedTexts[idx++] || rawTitle;
    const shopName = translatedTexts[idx++] || rawShopName;
    const marketInfo = translatedTexts[idx++] || rawMarketInfo;

    const skuOptions = rawSkuOptions.map((s: any) => ({
      ...s,
      name: translatedTexts[idx++] || s.name,
    }));

    const specKeys = Object.keys(rawSpecs);
    const translatedSpecKeys: string[] = [];
    for (let i = 0; i < specKeys.length; i++) {
      translatedSpecKeys.push(translatedTexts[idx++] || specKeys[i]);
    }

    const specifications: Record<string, string> = {};
    specKeys.forEach((origKey, i) => {
      const translatedKey = translatedSpecKeys[i];
      const translatedValue = translatedTexts[idx++] || rawSpecs[origKey];
      specifications[translatedKey] = translatedValue;
    });

    return NextResponse.json({
      id: String(productId),
      title,
      titleOriginal: rawTitle !== title ? rawTitle : undefined,
      priceKrw,
      priceCny: priceCny.toFixed(2),
      imageUrl: images[0] || '',
      images,
      shopName,
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
      marketInfo,
      exchangeRate: rate,
    });
  } catch (error) {
    console.error('Error in /api/products/[id]:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'API unavailable' },
      { status: 502 }
    );
  }
}
