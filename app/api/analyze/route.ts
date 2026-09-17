import { NextResponse } from 'next/server';
import { analyzeInputSchema } from '@/lib/schemas';
import { analyze } from '@/lib/ai/provider';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text, context } = analyzeInputSchema.parse(body);
    const result = await analyze(text, context);
    return NextResponse.json({
      analysis: result.value,
      demo: result.demo,
      fallbackReason: result.fallbackReason ?? null,
      userNotice: result.userNotice ?? null,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Invalid request payload';
    return NextResponse.json({ message: msg }, { status: 400 });
  }
}
