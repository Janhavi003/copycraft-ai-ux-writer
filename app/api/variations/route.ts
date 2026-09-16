import { NextResponse } from 'next/server';
import { variationsInputSchema } from '@/lib/schemas';
import { variations } from '@/lib/ai/provider';

export async function POST(req: Request) {
  try {
    const { copy, context } = variationsInputSchema.parse(await req.json());
    const result = await variations(copy, context);
    return NextResponse.json({ alternatives: result.value, demo: result.demo, fallbackReason: result.fallbackReason ?? null });
  } catch (e) {
    return NextResponse.json({ message: e instanceof Error ? e.message : 'Invalid request' }, { status: 400 });
  }
}
