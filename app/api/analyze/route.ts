import { NextResponse } from 'next/server';
import { analyzeInputSchema } from '@/lib/schemas';
import { analyze } from '@/lib/ai/provider';

export async function POST(req: Request) {
  try {
    const { text, context } = analyzeInputSchema.parse(await req.json());
    const result = await analyze(text, context);
    return NextResponse.json({ analysis: result.value, demo: result.demo, fallbackReason: result.fallbackReason ?? null });
  } catch (e) {
    return NextResponse.json({ message: e instanceof Error ? e.message : 'Invalid request' }, { status: 400 });
  }
}
