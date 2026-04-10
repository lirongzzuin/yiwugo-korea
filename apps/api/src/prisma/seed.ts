import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const YIWUGO_CATEGORIES = [
  { code: '01', nameZh: '玩具', nameKo: '완구', icon: '🧸', slug: 'toys' },
  { code: '02', nameZh: '工艺品', nameKo: '공예품', icon: '🏺', slug: 'crafts' },
  { code: '03', nameZh: '饰品', nameKo: '액세서리', icon: '💍', slug: 'accessories' },
  { code: '04', nameZh: '箱包', nameKo: '가방', icon: '👜', slug: 'bags' },
  { code: '05', nameZh: '服装', nameKo: '의류', icon: '👕', slug: 'apparel' },
  { code: '06', nameZh: '内衣', nameKo: '속옷', icon: '👙', slug: 'underwear' },
  { code: '07', nameZh: '袜子', nameKo: '양말', icon: '🧦', slug: 'socks' },
  { code: '08', nameZh: '鞋子', nameKo: '신발', icon: '👟', slug: 'shoes' },
  { code: '09', nameZh: '帽子', nameKo: '모자', icon: '🧢', slug: 'hats' },
  { code: '10', nameZh: '围巾', nameKo: '스카프', icon: '🧣', slug: 'scarves' },
  { code: '11', nameZh: '皮带', nameKo: '벨트', icon: '🪢', slug: 'belts' },
  { code: '12', nameZh: '眼镜', nameKo: '안경', icon: '👓', slug: 'glasses' },
  { code: '13', nameZh: '钟表', nameKo: '시계', icon: '⌚', slug: 'watches' },
  { code: '14', nameZh: '珠宝', nameKo: '보석', icon: '💎', slug: 'jewelry' },
  { code: '15', nameZh: '厨房用品', nameKo: '주방', icon: '🍳', slug: 'kitchen' },
  { code: '16', nameZh: '日用百货', nameKo: '일용품', icon: '🧴', slug: 'daily' },
  { code: '17', nameZh: '文具', nameKo: '문구', icon: '✏️', slug: 'stationery' },
  { code: '18', nameZh: '办公用品', nameKo: '사무', icon: '🖨️', slug: 'office' },
  { code: '19', nameZh: '体育用品', nameKo: '체육', icon: '⚽', slug: 'sports' },
  { code: '20', nameZh: '电子产品', nameKo: '전자', icon: '📱', slug: 'electronics' },
  { code: '21', nameZh: '化妆品', nameKo: '화장품', icon: '💄', slug: 'cosmetics' },
  { code: '22', nameZh: '家居装饰', nameKo: '인테리어', icon: '🛋️', slug: 'interior' },
  { code: '23', nameZh: '灯饰', nameKo: '조명', icon: '💡', slug: 'lighting' },
  { code: '24', nameZh: '包装用品', nameKo: '포장', icon: '📦', slug: 'packaging' },
  { code: '25', nameZh: '汽车用品', nameKo: '오토', icon: '🚗', slug: 'auto' },
  { code: '26', nameZh: '五金工具', nameKo: '철물', icon: '🔧', slug: 'hardware' },
];

async function main() {
  console.log('Seeding database...');

  // 1. Create admin user
  const passwordHash = await bcrypt.hash('admin123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@yiwugo-korea.com' },
    update: {},
    create: {
      email: 'admin@yiwugo-korea.com',
      passwordHash,
      name: 'Admin',
      role: 'ADMIN',
      memberType: 'INDIVIDUAL',
      isEmailVerified: true,
      isActive: true,
    },
  });
  console.log(`Admin user created: ${admin.email}`);

  // 2. Create categories
  for (const cat of YIWUGO_CATEGORIES) {
    await prisma.category.upsert({
      where: { code: cat.code },
      update: {
        nameZh: cat.nameZh,
        nameKo: cat.nameKo,
        icon: cat.icon,
        slug: cat.slug,
      },
      create: {
        code: cat.code,
        nameZh: cat.nameZh,
        nameKo: cat.nameKo,
        icon: cat.icon,
        slug: cat.slug,
        sortOrder: parseInt(cat.code, 10),
        isActive: true,
      },
    });
  }
  console.log(`${YIWUGO_CATEGORIES.length} categories created`);

  // 3. Create static pages
  const staticPages = [
    {
      slug: 'terms',
      title: '이용약관',
      content: `<h1>이용약관</h1>
<p>제1조 (목적)</p>
<p>이 약관은 YiwuGo Korea(이하 "회사")가 제공하는 전자상거래 관련 서비스를 이용함에 있어 회사와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
<p>제2조 (정의)</p>
<p>"서비스"란 회사가 운영하는 yiwugo-korea.com 사이트 및 관련 모바일 앱을 통해 제공하는 중국 이우 소상품 도시 상품 중개 서비스를 말합니다.</p>
<p>제3조 (약관의 효력 및 변경)</p>
<p>본 약관은 서비스를 이용하고자 하는 모든 이용자에게 적용됩니다.</p>`,
    },
    {
      slug: 'privacy',
      title: '개인정보처리방침',
      content: `<h1>개인정보처리방침</h1>
<p>YiwuGo Korea(이하 "회사")는 개인정보보호법에 따라 이용자의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보 처리방침을 수립합니다.</p>
<p>1. 수집하는 개인정보 항목</p>
<p>회사는 서비스 제공을 위해 필요한 최소한의 개인정보를 수집합니다: 이메일, 이름, 전화번호, 배송지 주소, 통관 고유부호</p>
<p>2. 개인정보의 이용목적</p>
<p>회원관리, 주문처리, 배송, 통관, 고객상담</p>`,
    },
    {
      slug: 'about',
      title: '회사소개',
      content: `<h1>YiwuGo Korea</h1>
<p>중국 최대 소상품 도시 이우(义乌) 시장의 상품을 한국에서 쉽고 안전하게 구매할 수 있는 플랫폼입니다.</p>
<p>직접 방문하지 않아도 이우 시장의 다양한 상품을 한국어로 검색하고, 원화로 결제하며, 통관과 배송까지 원스톱으로 처리합니다.</p>`,
    },
  ];

  for (const page of staticPages) {
    await prisma.staticPage.upsert({
      where: { slug: page.slug },
      update: {
        title: page.title,
        content: page.content,
      },
      create: {
        slug: page.slug,
        title: page.title,
        content: page.content,
        isPublished: true,
      },
    });
  }
  console.log(`${staticPages.length} static pages created`);

  // 4. Create FAQs
  const faqs = [
    {
      question: '이우고 코리아는 어떤 서비스인가요?',
      answer: '이우고 코리아는 중국 이우 소상품 도시의 상품을 한국어로 검색하고, 원화로 결제하며, 통관과 배송까지 원스톱으로 처리하는 구매대행 플랫폼입니다.',
      category: 'general',
      sortOrder: 1,
    },
    {
      question: '최소 주문 수량이 있나요?',
      answer: '상품마다 최소 주문 수량(MOQ)이 다릅니다. 각 상품 페이지에서 최소 주문 수량을 확인해 주세요. 일반적으로 소량 주문도 가능하지만, 공장 직거래 상품의 경우 MOQ가 높을 수 있습니다.',
      category: 'order',
      sortOrder: 2,
    },
    {
      question: '배송은 얼마나 걸리나요?',
      answer: '항공 배송은 주문 확인 후 약 7~14일, 해상 배송은 약 20~30일 소요됩니다. 통관 상황에 따라 다소 변동될 수 있습니다.',
      category: 'shipping',
      sortOrder: 3,
    },
    {
      question: '관세는 어떻게 처리되나요?',
      answer: '개인 통관 시 물품가격 150달러(미국 200달러) 이하는 관세가 면제됩니다. 면세 범위를 초과하는 경우 관세 및 부가세가 부과되며, 통관 진행 시 안내해 드립니다. 통관 고유부호가 필요합니다.',
      category: 'customs',
      sortOrder: 4,
    },
    {
      question: '환불/교환이 가능한가요?',
      answer: '상품 수령 후 7일 이내에 환불/교환 신청이 가능합니다. 단, 해외 배송 특성상 반품 배송비가 발생할 수 있으며, 상품 하자가 아닌 단순 변심의 경우 왕복 배송비를 부담하셔야 합니다.',
      category: 'refund',
      sortOrder: 5,
    },
    {
      question: '결제 수단은 무엇이 있나요?',
      answer: '토스페이먼츠(신용카드, 계좌이체, 가상계좌)와 카카오페이를 지원합니다.',
      category: 'payment',
      sortOrder: 6,
    },
    {
      question: '사업자 회원의 혜택은 무엇인가요?',
      answer: '사업자 회원은 세금계산서 발행, 대량 주문 할인, 전담 매니저 배정, 우선 통관 처리 등의 혜택을 받으실 수 있습니다.',
      category: 'general',
      sortOrder: 7,
    },
    {
      question: '포인트는 어떻게 적립되나요?',
      answer: '구매 확정 시 결제 금액의 1%가 포인트로 적립됩니다. 리뷰 작성 시 추가 포인트가 지급되며, 적립된 포인트는 다음 주문 시 사용 가능합니다.',
      category: 'points',
      sortOrder: 8,
    },
  ];

  for (const faq of faqs) {
    const existing = await prisma.fAQ.findFirst({
      where: { question: faq.question },
    });

    if (!existing) {
      await prisma.fAQ.create({
        data: {
          question: faq.question,
          answer: faq.answer,
          category: faq.category,
          sortOrder: faq.sortOrder,
          isPublished: true,
        },
      });
    }
  }
  console.log(`${faqs.length} FAQs created`);

  // 5. Create sample banners
  const banners = [
    {
      title: '이우고 코리아 그랜드 오픈!',
      imageUrl: '/images/banners/grand-opening.webp',
      linkUrl: '/events/grand-opening',
      position: 'HOME_TOP' as const,
      sortOrder: 1,
    },
    {
      title: '신규 회원 5,000원 할인 쿠폰',
      imageUrl: '/images/banners/welcome-coupon.webp',
      linkUrl: '/coupons',
      position: 'HOME_TOP' as const,
      sortOrder: 2,
    },
    {
      title: '사업자 회원 특별 혜택',
      imageUrl: '/images/banners/business-benefit.webp',
      linkUrl: '/business',
      position: 'HOME_MIDDLE' as const,
      sortOrder: 1,
    },
  ];

  for (const banner of banners) {
    const existing = await prisma.banner.findFirst({
      where: { title: banner.title },
    });

    if (!existing) {
      await prisma.banner.create({
        data: {
          title: banner.title,
          imageUrl: banner.imageUrl,
          linkUrl: banner.linkUrl,
          position: banner.position,
          sortOrder: banner.sortOrder,
          isActive: true,
        },
      });
    }
  }
  console.log(`${banners.length} banners created`);

  // 6. Create default system settings
  const systemSettings = [
    { key: 'defaultExchangeRate', value: '190.00' },
    { key: 'defaultCommissionRate', value: '0.08' },
    { key: 'minOrderAmountKrw', value: '10000' },
    { key: 'freeShippingThresholdKrw', value: '100000' },
    { key: 'maxPointUsageRate', value: '0.1' },
    { key: 'pointEarnRate', value: '0.01' },
    { key: 'autoConfirmDays', value: '14' },
    { key: 'maintenanceMode', value: 'false' },
  ];

  for (const setting of systemSettings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: { key: setting.key, value: setting.value },
    });
  }
  console.log(`${systemSettings.length} system settings created`);

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
