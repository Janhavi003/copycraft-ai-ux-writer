import { NextResponse } from 'next/server';
import { generateInputSchema } from '@/lib/schemas';
import { generate } from '@/lib/ai/provider';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = generateInputSchema.parse(body);
    const result = await generate(input);
    return NextResponse.json({
      result: result.value,
      demo: result.demo,
      fallbackReason: result.fallbackReason ?? null,
      userNotice: result.userNotice ?? null,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Invalid request payload';
    return NextResponse.json({ message: msg }, { status: 400 });
  }
}
