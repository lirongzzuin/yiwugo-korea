import { NextRequest, NextResponse } from 'next/server';
import * as yiwugo from '../../../../lib/yiwugo-server';
import { normalizeImageUrl } from '../../../../lib/yiwugo-server';
import { translateProducts } from '../../utils';

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

    // Translate all Chinese text to Korean
    const textsToTranslate = [
      { name: title },
      { name: shopInfo.shopName || '' },
      { name: shopInfo.mainProduct || '' },
      { name: shopBooth.newMarketInfo || shopBooth.marketInfo || shopInfo.marketInfo || '' },
      ...Object.entries(specifications).flatMap(([k, v]) => [{ name: k }, { name: v }]),
      ...skuOptions.map((s: any) => ({ name: s.name })),
    ];

    const translatedAll = await translateProducts(textsToTranslate);
    const translatedTitle = translatedAll[0]?.name || title;
    const translatedShopName = translatedAll[1]?.name || shopInfo.shopName || '';
    const translatedMainProduct = translatedAll[2]?.name || '';
    const translatedMarketInfo = translatedAll[3]?.name || '';

    // Reconstruct translated specifications (each key and value translated separately)
    const specEntries = Object.entries(specifications);
    const translatedSpecs: Record<string, string> = {};
    specEntries.forEach(([origKey, origVal], i) => {
      const baseIdx = 4 + i * 2;
      const tKey = translatedAll[baseIdx]?.name || origKey;
      const tVal = translatedAll[baseIdx + 1]?.name || origVal;
      translatedSpecs[tKey] = tVal;
    });

    // Reconstruct translated SKU options
    const skuBaseIdx = 4 + specEntries.length * 2;
    const translatedSkuOptions = skuOptions.map((s: any, i: number) => ({
      ...s,
      name: translatedAll[skuBaseIdx + i]?.name || s.name,
    }));

    return NextResponse.json({
      id: String(productId),
      title: translatedTitle,
      priceKrw,
      priceCny: priceCny.toFixed(2),
      imageUrl: images[0] || '',
      images,
      shopName: translatedShopName,
      shopId: String(shopInfo.shopId || data.sid || ''),
      salesCount: parseInt(data.dealQuantitys || detailInner.sellCounts || '0', 10),
      minOrder: data.smallnum || vo.startNumber || 1,
      boothNumber: shopBooth.boothno || '',
      description: '',
      specifications: translatedSpecs,
      priceTiers,
      skuOptions: translatedSkuOptions,
      mainProduct: translatedMainProduct,
      defaultFreight: data.defaultfreight || '',
      exchangeService: data.exchangeService || 0,
      metric: vo.metric || '개',
      marketInfo: translatedMarketInfo,
    });
  } catch (error) {
    console.error('Error in /api/products/[id]:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'API unavailable' }, { status: 502 });
  }
}
