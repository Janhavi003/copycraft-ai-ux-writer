import { NextResponse } from 'next/server';
import { variationsInputSchema } from '@/lib/schemas';
import { variations } from '@/lib/ai/provider';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { copy, context } = variationsInputSchema.parse(body);
    const result = await variations(copy, context);
    return NextResponse.json({
      alternatives: result.value,
      demo: result.demo,
      fallbackReason: result.fallbackReason ?? null,
      userNotice: result.userNotice ?? null,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Invalid request payload';
    return NextResponse.json({ message: msg }, { status: 400 });
  }
}
