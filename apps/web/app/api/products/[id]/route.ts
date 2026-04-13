import { NextRequest, NextResponse } from 'next/server';
import * as yiwugo from '../../../../lib/yiwugo-server';
import { normalizeImageUrl } from '../../../../lib/yiwugo-server';
import { translateBatch } from '../../../../lib/translation-service';
import { applyGlossary } from '../../../../lib/translation-glossary';

export const dynamic = 'force-dynamic';
export const maxDuration = 10; // Vercel Hobby 플랜 최대치

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

/**
 * 번역이 실패하더라도 원문을 반환하는 안전한 래퍼
 */
async function safeTranslateBatch(texts: string[]): Promise<string[]> {
  try {
    const results = await translateBatch(texts);
    // 결과 개수가 맞지 않으면 원문 + 글로사리로 보완
    if (results.length !== texts.length) {
      return texts.map((t, i) => results[i] ?? applyGlossary(t));
    }
    return results;
  } catch {
    // 완전 실패 시에도 글로사리 폴백
    return texts.map((t) => applyGlossary(t));
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const productId = params.id;

  try {
    // 이우고 API 호출과 환율을 병렬로
    const [data, rate] = await Promise.all([
      yiwugo.getProductDetail(productId).catch((err) => {
        console.error('[products/[id]] yiwugo error:', err);
        return null;
      }),
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

    const rawTitle = vo.title || data.title || '';
    const rawShopName = shopInfo.shopName || '';
    const rawMarketInfo = shopBooth.newMarketInfo || shopBooth.marketInfo || shopInfo.marketInfo || '';

    // Price
    let priceCny = parseFloat(data.totalprice || '0');
    if (priceCny === 0 && data.unitprice) {
      priceCny = parseFloat(data.unitprice);
    }
    if (priceCny === 0 && vo.sellPrice) {
      priceCny = Number(vo.sellPrice) / 100;
    }
    const priceKrw = Math.round(priceCny * rate);

    // Images
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

    // ─── 서버사이드 안전 번역 ───────────────────────────
    const textsToTranslate: string[] = [
      rawTitle,
      rawShopName,
      rawMarketInfo,
      ...rawSkuOptions.map((s: any) => s.name),
      ...Object.keys(rawSpecs),
      ...Object.values(rawSpecs),
    ];

    const translatedTexts = await safeTranslateBatch(textsToTranslate);

    let idx = 0;
    const title = translatedTexts[idx++] || applyGlossary(rawTitle);
    const shopName = translatedTexts[idx++] || applyGlossary(rawShopName);
    const marketInfo = translatedTexts[idx++] || applyGlossary(rawMarketInfo);

    const skuOptions = rawSkuOptions.map((s: any) => ({
      ...s,
      name: translatedTexts[idx++] || applyGlossary(s.name),
    }));

    const specKeys = Object.keys(rawSpecs);
    const translatedSpecKeys: string[] = [];
    for (let i = 0; i < specKeys.length; i++) {
      translatedSpecKeys.push(translatedTexts[idx++] || applyGlossary(specKeys[i]));
    }

    const specifications: Record<string, string> = {};
    specKeys.forEach((origKey, i) => {
      const translatedKey = translatedSpecKeys[i];
      const translatedValue = translatedTexts[idx++] || applyGlossary(rawSpecs[origKey]);
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
