import OpenAI from 'openai';
import { analysisSchema, copyResponseSchema } from '@/lib/schemas';
import { buildAnalyzePrompt, buildGeneratePrompt, buildImprovePrompt } from '@/lib/prompts';
import type { GenerateInput } from '@/lib/prompts';

const apiKey = process.env.OPENAI_API_KEY?.trim();
const client = apiKey ? new OpenAI({ apiKey }) : null;

export type AiResult<T> = { value: T; demo: boolean; fallbackReason?: 'missing_key' | 'credits' | 'provider_error' };

const demo = {
  headline: 'Delete your bank account?',
  body: 'This permanently removes your account and transaction history. This action cannot be undone.',
  primary_action: 'Delete account',
  secondary_action: 'Cancel',
  supporting_text: 'Download anything you need before continuing.',
  alternatives: [
    { label: 'Clear', copy: 'Delete bank account', score: 95, reason: 'Specific and easy to scan.' },
    { label: 'Direct', copy: 'Permanently delete account', score: 93, reason: 'Makes the consequence explicit.' },
    { label: 'Empathetic', copy: 'I want to delete my account', score: 88, reason: 'Reflects user intent.' },
  ],
  analysis: {
    clarity: 94,
    accessibility: 93,
    tone: 92,
    conciseness: 89,
    confidence: 94,
    strengths: ['Clear action', 'Explains consequence', 'Uses plain language'],
    improvements: ['Keep supporting text short', 'Make destructive actions explicit'],
  },
};

function providerReason(error: unknown): 'credits' | 'provider_error' {
  const status = typeof error === 'object' && error !== null && 'status' in error ? Number((error as { status?: number }).status) : 0;
  const message = error instanceof Error ? error.message.toLowerCase() : '';
  return status === 429 || message.includes('quota') || message.includes('insufficient_quota') || message.includes('no credits')
    ? 'credits'
    : 'provider_error';
}

async function ask(prompt: string): Promise<AiResult<unknown>> {
  if (!client) return { value: demo, demo: true, fallbackReason: 'missing_key' };
  try {
    const r = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'You are CopyCraft, a senior UX writer. Return JSON only and follow the requested schema.' },
        { role: 'user', content: prompt },
      ],
    });
    return { value: JSON.parse(r.choices[0]?.message?.content || '{}'), demo: false };
  } catch (error) {
    // A local/demo workspace should remain usable even when the configured provider
    // is out of credits, temporarily unavailable, or has a bad key.
    return { value: demo, demo: true, fallbackReason: providerReason(error) };
  }
}

export async function generate(i: GenerateInput): Promise<AiResult<ReturnType<typeof copyResponseSchema.parse>>> {
  const result = await ask(buildGeneratePrompt(i));
  return { ...result, value: copyResponseSchema.parse(result.value) };
}

export async function analyze(copy: string, context = ''): Promise<AiResult<ReturnType<typeof analysisSchema.parse>>> {
  const result = await ask(buildAnalyzePrompt(copy, context));
  return { ...result, value: analysisSchema.parse(result.demo ? demo.analysis : result.value) };
}

export async function improve(copy: string, instruction: string, context = ''): Promise<AiResult<ReturnType<typeof copyResponseSchema.parse>>> {
  const result = await ask(buildImprovePrompt(copy, instruction, context));
  const fallback = {
    ...demo,
    headline: instruction.toLowerCase().includes('short') ? 'Delete account' : demo.headline,
    body: instruction.toLowerCase().includes('short') ? 'This permanently removes your account.' : demo.body,
  };
  return { ...result, value: copyResponseSchema.parse(result.demo ? fallback : result.value) };
}

export async function variations(copy: string, context = ''): Promise<AiResult<ReturnType<typeof copyResponseSchema.parse>['alternatives']>> {
  const result = await ask(`Create three distinct UX copy variations for: ${copy}. Context: ${context}. Return JSON {alternatives:[{label,copy,score,reason}]}.`);
  const parsed = copyResponseSchema.shape.alternatives.parse(result.demo ? demo.alternatives : (result.value as { alternatives?: unknown }).alternatives);
  return { ...result, value: parsed };
}

export async function insights() {
  return [
    { id: 'i1', title: 'Your error copy is getting shorter', body: 'Recent error messages are more concise while keeping the recovery action explicit.', action: 'Review error copy' },
    { id: 'i2', title: 'Confirmation copy is strong', body: 'Your confirmation patterns consistently score high for clarity.', action: 'View confirmations' },
    { id: 'i3', title: 'Generic labels need attention', body: 'A few recent actions use labels like “Submit” where a specific outcome would be clearer.', action: 'Find generic labels' },
  ];
}
