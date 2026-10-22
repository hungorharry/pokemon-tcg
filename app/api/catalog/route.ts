import { NextResponse } from 'next/server';
import catalogData from '@/data/catalog/catalog.json';

export async function GET() {
  return NextResponse.json(catalogData);
}
