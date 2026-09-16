import { NextResponse } from 'next/server';
import { generateInputSchema } from '@/lib/schemas';
import { generate } from '@/lib/ai/provider';

export async function POST(req: Request) {
  try {
    const input = generateInputSchema.parse(await req.json());
    const result = await generate(input);
    return NextResponse.json({ result: result.value, demo: result.demo, fallbackReason: result.fallbackReason ?? null });
  } catch (e) {
    return NextResponse.json({ message: e instanceof Error ? e.message : 'Invalid request' }, { status: 400 });
  }
}
