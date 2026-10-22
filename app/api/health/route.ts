import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    ebayConfigured: Boolean(process.env.EBAY_CLIENT_ID),
    aiSentinel: true,
    fanaticsSync: true,
    time: new Date().toISOString(),
    currency: 'USD',
    pricePolicy: 'FIXED_PRICE only; excludes AUCTION; PSA ONLY validated',
  });
}
