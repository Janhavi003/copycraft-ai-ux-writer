import { NextResponse } from 'next/server';
import { improveInputSchema } from '@/lib/schemas';
import { improve } from '@/lib/ai/provider';

export async function POST(req: Request) {
  try {
    const { copy, instruction, context } = improveInputSchema.parse(await req.json());
    const result = await improve(copy, instruction, context);
    return NextResponse.json({ result: result.value, demo: result.demo, fallbackReason: result.fallbackReason ?? null });
  } catch (e) {
    return NextResponse.json({ message: e instanceof Error ? e.message : 'Invalid request' }, { status: 400 });
  }
}
