import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Image proxy to bypass Yiwugo's referrer-based hotlink protection.
 * Usage: /api/img?url=https://ywgimg.yiwugo.com/...
 *
 * Yiwugo's CDN returns 403 when Referer header is from external domains.
 * This proxy fetches images server-side (no Referer) and returns them.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  // Only allow yiwugo domains for security
  try {
    const parsed = new URL(url);
    const allowed = ['yiwugo.com', 'alicdn.com'];
    if (!allowed.some((d) => parsed.hostname.endsWith(d))) {
      return new NextResponse('Domain not allowed', { status: 403 });
    }
  } catch {
    return new NextResponse('Invalid URL', { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'image/*',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return new NextResponse('Image not found', { status: response.status });
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch {
    return new NextResponse('Failed to fetch image', { status: 502 });
  }
}
