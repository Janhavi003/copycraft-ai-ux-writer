import { NextResponse } from 'next/server';
import { insights } from '@/lib/ai/provider';

export async function GET() {
  try {
    const list = await insights();
    return NextResponse.json({ insights: list });
  } catch {
    return NextResponse.json({ insights: [] });
  }
}
