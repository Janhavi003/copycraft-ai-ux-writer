import OpenAI from 'openai';
import { analysisSchema, copyResponseSchema, alternativeSchema } from '@/lib/schemas';
import {
  buildAnalyzePrompt,
  buildGeneratePrompt,
  buildImprovePrompt,
  buildVariationsPrompt,
} from '@/lib/prompts';
import type { GenerateInput } from '@/lib/prompts';
import type { ScoreDimension } from '@/types';
import { z } from 'zod';

const apiKey = process.env.OPENAI_API_KEY?.trim();
const client = apiKey ? new OpenAI({ apiKey }) : null;

export type FallbackReason = 'missing_key' | 'credits' | 'rate_limit' | 'timeout' | 'provider_error';

export interface AiResult<T> {
  value: T;
  demo: boolean;
  fallbackReason?: FallbackReason;
  userNotice?: string;
}

function classifyError(error: unknown): FallbackReason {
  if (!error) return 'provider_error';
  const status =
    typeof error === 'object' && error !== null && 'status' in error
      ? Number((error as { status?: number }).status)
      : 0;
  const message = error instanceof Error ? error.message.toLowerCase() : '';

  if (status === 401 || status === 403 || message.includes('api key') || message.includes('unauthorized')) {
    return 'missing_key';
  }
  if (status === 429 || message.includes('quota') || message.includes('insufficient_quota') || message.includes('no credits')) {
    return 'credits';
  }
  if (message.includes('timeout') || message.includes('timed out') || status === 504) {
    return 'timeout';
  }
  return 'provider_error';
}

function formatUserNotice(reason: FallbackReason): string {
  switch (reason) {
    case 'missing_key':
      return 'Demo Mode is active. Add OPENAI_API_KEY to your server environment (.env.local) for live AI output.';
    case 'credits':
      return 'Live AI is out of credits or rate limited. CopyCraft switched to Demo Mode — your workspace remains fully functional.';
    case 'timeout':
      return 'AI request timed out. CopyCraft switched to Demo Mode — your workspace is still usable.';
    default:
      return 'Live AI is unavailable right now, so CopyCraft switched to Demo Mode. Your workspace is still fully usable.';
  }
}

// Generate realistic, component-tailored demo copy based on user input
export function generateDemoCopy(i: GenerateInput): z.infer<typeof copyResponseSchema> {
  const component = i.component.toLowerCase();
  const product = i.product || 'Product';
  const goal = i.goal || 'complete your task';
  const action = i.action || 'continue';

  let headline = `Continue with ${product}?`;
  let body = `Review your details before taking this step. Make sure everything is accurate.`;
  let primaryAction = 'Confirm and continue';
  let secondaryAction = 'Cancel';
  let supportingText = 'You can review or change this later in settings.';
  let errorText = 'Please check your information and try again.';

  if (component.includes('error')) {
    headline = `We couldn’t ${goal.toLowerCase().replace(/^(to|user wants to)\s*/i, '')}`;
    body = `Check your network connection and try again. Your current input has been saved so you won’t lose progress.`;
    primaryAction = 'Try again';
    secondaryAction = 'Back to safety';
    supportingText = 'If this problem continues, contact workspace support.';
    errorText = 'Connection timed out (Code 504)';
  } else if (component.includes('empty')) {
    headline = `No ${product.toLowerCase()} items yet`;
    body = `Start by creating your first entry to organize your workspace and track progress.`;
    primaryAction = `Create ${product.split(' ')[0] || 'item'}`;
    secondaryAction = 'Import existing';
    supportingText = 'Need inspiration? Check our starter templates.';
  } else if (component.includes('confirmation') || component.includes('dialog')) {
    headline = `${goal.replace(/\?$/, '')}?`;
    body = `This action directly affects your ${product.toLowerCase()} configuration. Review consequences before proceeding.`;
    primaryAction = action.length < 25 ? action : 'Confirm action';
    secondaryAction = 'Cancel';
    supportingText = 'This action cannot be undone once confirmed.';
  } else if (component.includes('toast') || component.includes('notification')) {
    headline = `${product} updated`;
    body = `Your latest changes were saved to the workspace.`;
    primaryAction = 'View changes';
    secondaryAction = 'Undo';
    supportingText = 'Saved just now';
  } else if (component.includes('onboarding')) {
    headline = `Welcome to ${product}`;
    body = `Set up your preferences in under two minutes so you can ${goal.toLowerCase()}.`;
    primaryAction = 'Get started';
    secondaryAction = 'Skip for now';
    supportingText = 'Step 1 of 3 · Takes ~2 min';
  } else if (component.includes('permission')) {
    headline = `Allow ${product} to access ${action}?`;
    body = `We use this access strictly to ${goal.toLowerCase()}. Your data remains private and encrypted.`;
    primaryAction = 'Allow access';
    secondaryAction = 'Not now';
    supportingText = 'You can revoke this permission anytime in your system settings.';
  } else if (component.includes('success')) {
    headline = `Successfully completed!`;
    body = `Your request to ${goal.toLowerCase()} has been processed and applied to ${product}.`;
    primaryAction = 'Done';
    secondaryAction = 'View summary';
    supportingText = 'A confirmation copy was sent to your email.';
  } else if (component.includes('loading')) {
    headline = `Preparing your ${product}…`;
    body = `Hang tight while we organize your information and verify your workspace setup.`;
    primaryAction = 'Cancel';
    secondaryAction = '';
    supportingText = 'This usually takes less than 5 seconds.';
  } else if (component.includes('button')) {
    headline = goal;
    body = `Trigger the primary outcome for ${product}.`;
    primaryAction = action || 'Continue';
    secondaryAction = 'Cancel';
    supportingText = 'Requires confirmation';
  }

  const dimensionFeedback: ScoreDimension[] = [
    {
      dimension: 'Clarity',
      score: 95,
      rationale: `The headline directly answers what is happening without ambiguous product jargon.`,
      recommendation: `Keep the noun "${product.split(' ')[0]}" consistent across companion screens.`,
    },
    {
      dimension: 'Conciseness',
      score: 91,
      rationale: `Body copy delivers the needed context in under 25 words.`,
      recommendation: `On compact mobile displays, the supporting text can be omitted safely.`,
    },
    {
      dimension: 'Tone',
      score: 93,
      rationale: `Maintains a ${i.tone.toLowerCase()} and reassuring tone suitable for ${i.audience.toLowerCase()} users.`,
      recommendation: `Avoid exclamation marks or colloquialisms in primary flows.`,
    },
    {
      dimension: 'Accessibility',
      score: 94,
      rationale: `Language is written at an accessible reading level with explicit button verbs.`,
      recommendation: `Ensure button labels provide clear context for screen reader announcements.`,
    },
    {
      dimension: 'Specificity',
      score: 92,
      rationale: `Names specific actions rather than generic "Submit" or "Proceed".`,
      recommendation: `Ensure the primary CTA clearly states the resulting outcome.`,
    },
    {
      dimension: 'Actionability',
      score: 95,
      rationale: `Clear primary and secondary exit routes allow users to decide with confidence.`,
      recommendation: `Keep the secondary action visually distinct as a ghost or outline button.`,
    },
    {
      dimension: 'Confidence',
      score: 92,
      rationale: `Instructions communicate certainty and preserve user control.`,
      recommendation: `Reiterate data safety whenever an action is irreversible.`,
    },
  ];

  return {
    headline,
    body,
    primary_action: primaryAction,
    secondary_action: secondaryAction,
    supporting_text: supportingText,
    error_text: errorText,
    alternatives: [
      {
        label: 'Direct & Concise',
        copy: `${primaryAction}`,
        score: 95,
        reason: 'Maximum scannability for fast decision-making.',
        tone: 'Confident',
        useCase: 'Compact viewports',
      },
      {
        label: 'Supportive Context',
        copy: `${headline} — ${primaryAction}`,
        score: 92,
        reason: 'Adds extra cognitive reassurance before commitment.',
        tone: 'Empathetic',
        useCase: 'First-time users',
      },
      {
        label: 'Outcome-Focused',
        copy: `Complete: ${primaryAction}`,
        score: 90,
        reason: 'Emphasizes the end-state the user wants.',
        tone: 'Professional',
        useCase: 'Power users',
      },
    ],
    analysis: {
      clarity: 95,
      conciseness: 91,
      tone: 93,
      accessibility: 94,
      specificity: 92,
      actionability: 95,
      confidence: 92,
      strengths: [
        'Direct, outcome-oriented call to action',
        'Transparent consequences and recovery paths',
        'Plain, jargon-free terminology',
      ],
      improvements: [
        'Keep supporting text under two lines on mobile screens',
        'Ensure color contrast meets WCAG 2.2 AA in both light and dark themes',
      ],
      dimensionFeedback,
    },
  };
}

export function generateDemoAnalysis(copy: string, context = ''): z.infer<typeof analysisSchema> {
  const words = copy.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const hasGenericVerb = /\b(click here|submit|proceed|continue|ok|yes)\b/i.test(copy);
  const hasJargon = /\b(utilize|leverage|functionality|abort|terminate)\b/i.test(copy);
  const hasNegativeBlame = /\b(you failed|invalid input|bad request|your error)\b/i.test(copy);

  const clarity = hasJargon ? 76 : 92;
  const conciseness = wordCount > 40 ? 74 : wordCount < 5 ? 85 : 92;
  const tone = hasNegativeBlame ? 65 : 91;
  const accessibility = hasGenericVerb ? 78 : 93;
  const specificity = hasGenericVerb ? 72 : 94;
  const actionability = hasGenericVerb ? 75 : 93;
  const confidence = 90;

  const strengths: string[] = [];
  const improvements: string[] = [];

  if (wordCount <= 30) strengths.push('Good reading density and scannability.');
  if (!hasGenericVerb) strengths.push('Avoids vague verbs like "Submit" or "Click here".');
  if (!hasNegativeBlame) strengths.push('Maintains respectful, non-blaming tone.');
  if (hasGenericVerb) improvements.push('Replace generic verbs with the concrete user outcome.');
  if (hasJargon) improvements.push('Replace technical jargon with everyday words.');
  if (hasNegativeBlame) improvements.push('Remove blaming phrasing; guide the user toward recovery.');
  if (strengths.length === 0) strengths.push('Clear topic identification.');
  if (improvements.length === 0) improvements.push('Test with screen readers to verify announcement flow.');

  const dimensionFeedback: ScoreDimension[] = [
    {
      dimension: 'Clarity',
      score: clarity,
      rationale: hasJargon
        ? 'Contains technical words that might slow down comprehension.'
        : 'The core message is immediately comprehensible.',
      recommendation: hasJargon
        ? 'Use simpler, plain-language synonyms.'
        : 'Keep noun references consistent throughout the flow.',
    },
    {
      dimension: 'Conciseness',
      score: conciseness,
      rationale: wordCount > 35
        ? `Copy is currently ${wordCount} words; consider editing down to core facts.`
        : 'Sentence length is well-calibrated for interface reading.',
      recommendation: wordCount > 35
        ? 'Remove filler introductory phrases.'
        : 'Preserve this tight sentence structure.',
    },
    {
      dimension: 'Tone',
      score: tone,
      rationale: hasNegativeBlame
        ? 'Phrasing places blame on the user.'
        : 'The tone is calm, supportive, and professional.',
      recommendation: hasNegativeBlame
        ? 'Focus on how the system can help the user fix the issue.'
        : 'Maintain this constructive voice across related screens.',
    },
    {
      dimension: 'Accessibility',
      score: accessibility,
      rationale: hasGenericVerb
        ? 'Generic verbs like "Click" fail WCAG context requirements for assistive tech.'
        : 'Language is direct and supports screen reader clarity.',
      recommendation: hasGenericVerb
        ? 'Label interactive elements with the explicit action verb.'
        : 'Ensure visual indicators accompany any status colors.',
    },
    {
      dimension: 'Specificity',
      score: specificity,
      rationale: hasGenericVerb
        ? 'Lacks explicit object names.'
        : 'Names the exact component or data item being modified.',
      recommendation: 'Specify the exact item (e.g. "Save project" vs "Save").',
    },
    {
      dimension: 'Actionability',
      score: actionability,
      rationale: 'The next step for the user is visible.',
      recommendation: 'Ensure secondary dismissal paths are clearly provided.',
    },
    {
      dimension: 'Confidence',
      score: confidence,
      rationale: 'Language asserts system reliability and clear user agency.',
      recommendation: 'Reinforce that user work is safe and recoverable.',
    },
  ];

  return {
    clarity,
    conciseness,
    tone,
    accessibility,
    specificity,
    actionability,
    confidence,
    strengths,
    improvements,
    dimensionFeedback,
  };
}

export function generateDemoImprovement(
  copy: string,
  instruction: string,
  context = ''
): z.infer<typeof copyResponseSchema> {
  const lines = copy.split('\n').map(l => l.trim()).filter(Boolean);
  let headline = lines[0] || 'Updated interface copy';
  let body = lines[1] || 'Your changes have been reviewed and applied.';
  let primaryAction = lines[2] || 'Confirm action';
  let secondaryAction = 'Cancel';
  let supportingText = 'Changes apply immediately.';

  const inst = instruction.toLowerCase();
  if (inst.includes('short') || inst.includes('concise')) {
    headline = headline.length > 30 ? headline.slice(0, 26) + '…' : headline;
    body = body.split('.')[0] + '.';
    primaryAction = primaryAction.split(' ').slice(0, 2).join(' ') || 'Confirm';
  } else if (inst.includes('clear') || inst.includes('specific')) {
    primaryAction = primaryAction.replace(/^(Submit|Proceed|Click|OK)$/i, 'Save changes');
    headline = headline.replace(/^Something went wrong/i, 'We couldn’t save your file');
  } else if (inst.includes('empathetic')) {
    headline = `We’re here to help`;
    body = `Your data is safe. Let’s try that again together.`;
    primaryAction = 'Try again';
  } else if (inst.includes('confident')) {
    primaryAction = primaryAction.replace(/^(Try to |Maybe )/i, '');
    headline = headline.replace(/\?$/, '');
  }

  const analysis = generateDemoAnalysis(`${headline} ${body} ${primaryAction}`, context);

  return {
    headline,
    body,
    primary_action: primaryAction,
    secondary_action: secondaryAction,
    supporting_text: supportingText,
    error_text: '',
    alternatives: [
      {
        label: 'Ultra Brief',
        copy: primaryAction,
        score: 95,
        reason: 'Optimized for tight mobile buttons.',
        tone: 'Minimal',
      },
      {
        label: 'Descriptive',
        copy: `${headline} — ${primaryAction}`,
        score: 92,
        reason: 'Provides complete context before action.',
        tone: 'Professional',
      },
      {
        label: 'Reassuring',
        copy: `Safe to ${primaryAction.toLowerCase()}`,
        score: 90,
        reason: 'Reassures user of system state.',
        tone: 'Empathetic',
      },
    ],
    analysis,
  };
}

export function generateDemoVariations(copy: string, context = ''): z.infer<typeof alternativeSchema>[] {
  const words = copy.trim().split(/\s+/).slice(0, 4).join(' ');
  return [
    {
      label: 'Direct & Action-Oriented',
      copy: words || 'Save and continue',
      score: 95,
      reason: 'Leads with active verb and minimizes reading effort.',
      tone: 'Confident',
      useCase: 'Primary buttons & CTAs',
    },
    {
      label: 'Warm & Conversational',
      copy: `Ready to ${words ? words.toLowerCase() : 'finish'}?`,
      score: 91,
      reason: 'Engages users pleasantly in consumer and onboarding products.',
      tone: 'Friendly',
      useCase: 'Onboarding & empty states',
    },
    {
      label: 'Consequence-Explicit',
      copy: `${words || 'Confirm'} permanently`,
      score: 93,
      reason: 'Removes ambiguity before irreversible actions.',
      tone: 'Professional',
      useCase: 'Modals & destructive confirmations',
    },
  ];
}

async function askOpenAi(prompt: string): Promise<{ data: unknown; error?: unknown }> {
  if (!client) {
    return { data: null, error: new Error('Missing OPENAI_API_KEY') };
  }
  try {
    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You are CopyCraft, a principal UX writer. Always respond with valid, structured JSON adhering strictly to the requested schema. Never output markdown codeblocks around JSON.',
        },
        { role: 'user', content: prompt },
      ],
    });

    const raw = response.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(raw);
    return { data: parsed };
  } catch (err) {
    return { data: null, error: err };
  }
}

export async function generate(i: GenerateInput): Promise<AiResult<z.infer<typeof copyResponseSchema>>> {
  if (!client) {
    const value = generateDemoCopy(i);
    return { value, demo: true, fallbackReason: 'missing_key', userNotice: formatUserNotice('missing_key') };
  }

  const { data, error } = await askOpenAi(buildGeneratePrompt(i));
  if (error || !data) {
    const reason = classifyError(error);
    const value = generateDemoCopy(i);
    return { value, demo: true, fallbackReason: reason, userNotice: formatUserNotice(reason) };
  }

  const parsed = copyResponseSchema.safeParse(data);
  if (!parsed.success) {
    const value = generateDemoCopy(i);
    return { value, demo: true, fallbackReason: 'provider_error', userNotice: formatUserNotice('provider_error') };
  }

  return { value: parsed.data, demo: false };
}

export async function analyze(copy: string, context = ''): Promise<AiResult<z.infer<typeof analysisSchema>>> {
  if (!client) {
    const value = generateDemoAnalysis(copy, context);
    return { value, demo: true, fallbackReason: 'missing_key', userNotice: formatUserNotice('missing_key') };
  }

  const { data, error } = await askOpenAi(buildAnalyzePrompt(copy, context));
  if (error || !data) {
    const reason = classifyError(error);
    const value = generateDemoAnalysis(copy, context);
    return { value, demo: true, fallbackReason: reason, userNotice: formatUserNotice(reason) };
  }

  const parsed = analysisSchema.safeParse(data);
  if (!parsed.success) {
    const value = generateDemoAnalysis(copy, context);
    return { value, demo: true, fallbackReason: 'provider_error', userNotice: formatUserNotice('provider_error') };
  }

  return { value: parsed.data, demo: false };
}

export async function improve(
  copy: string,
  instruction: string,
  context = ''
): Promise<AiResult<z.infer<typeof copyResponseSchema>>> {
  if (!client) {
    const value = generateDemoImprovement(copy, instruction, context);
    return { value, demo: true, fallbackReason: 'missing_key', userNotice: formatUserNotice('missing_key') };
  }

  const { data, error } = await askOpenAi(buildImprovePrompt(copy, instruction, context));
  if (error || !data) {
    const reason = classifyError(error);
    const value = generateDemoImprovement(copy, instruction, context);
    return { value, demo: true, fallbackReason: reason, userNotice: formatUserNotice(reason) };
  }

  const parsed = copyResponseSchema.safeParse(data);
  if (!parsed.success) {
    const value = generateDemoImprovement(copy, instruction, context);
    return { value, demo: true, fallbackReason: 'provider_error', userNotice: formatUserNotice('provider_error') };
  }

  return { value: parsed.data, demo: false };
}

export async function variations(
  copy: string,
  context = ''
): Promise<AiResult<z.infer<typeof alternativeSchema>[]>> {
  if (!client) {
    const value = generateDemoVariations(copy, context);
    return { value, demo: true, fallbackReason: 'missing_key', userNotice: formatUserNotice('missing_key') };
  }

  const { data, error } = await askOpenAi(buildVariationsPrompt(copy, context));
  if (error || !data) {
    const reason = classifyError(error);
    const value = generateDemoVariations(copy, context);
    return { value, demo: true, fallbackReason: reason, userNotice: formatUserNotice(reason) };
  }

  const alternativesRaw = (data as { alternatives?: unknown })?.alternatives;
  const parsed = z.array(alternativeSchema).safeParse(alternativesRaw);
  if (!parsed.success) {
    const value = generateDemoVariations(copy, context);
    return { value, demo: true, fallbackReason: 'provider_error', userNotice: formatUserNotice('provider_error') };
  }

  return { value: parsed.data, demo: false };
}

export async function insights() {
  return [
    {
      id: 'i1',
      title: 'Action clarity is improving',
      body: 'Recent error and confirmation CTAs consistently specify the outcome rather than generic "Submit".',
      action: 'Review confirmation copy',
      href: '/history',
    },
    {
      id: 'i2',
      title: 'Destructive flows need explicit consequences',
      body: 'Make sure irreversible actions explain what is lost before the user commits.',
      action: 'Inspect pattern library',
      href: '/patterns',
    },
    {
      id: 'i3',
      title: 'Mobile scannability benchmark',
      body: 'Body text kept under 25 words scores 15% higher on accessibility and scannability tests.',
      action: 'Open Copy Studio',
      href: '/studio',
    },
  ];
}
