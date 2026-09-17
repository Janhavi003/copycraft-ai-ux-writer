import { describe, expect, it } from 'vitest';
import {
  buildGeneratePrompt,
  buildAnalyzePrompt,
  buildImprovePrompt,
  buildVariationsPrompt,
} from '@/lib/prompts';

describe('Prompt Construction Suite', () => {
  it('buildGeneratePrompt includes component, goals, tone, and brand voice rules', () => {
    const prompt = buildGeneratePrompt({
      component: 'Confirmation',
      product: 'Pulse Banking',
      goal: 'Delete bank account',
      action: 'Click delete',
      audience: 'Consumers',
      tone: 'Empathetic',
      context: 'Irreversible action',
      brandVoice: {
        name: 'Pulse',
        personality: ['Calm', 'Trustworthy'],
        rules: ['Plain language', 'Explain consequences'],
        wordsToUse: ['Keep', 'Remove'],
        wordsToAvoid: ['Oops', 'Submit'],
      },
    });

    expect(prompt).toContain('Component: Confirmation');
    expect(prompt).toContain('Pulse Banking');
    expect(prompt).toContain('Delete bank account');
    expect(prompt).toContain('Brand Voice: Pulse');
    expect(prompt).toContain('Plain language');
    expect(prompt).toContain('Words to avoid: Oops, Submit');
    expect(prompt).toContain('dimensionFeedback');
  });

  it('buildAnalyzePrompt instructs model to evaluate 7 heuristics', () => {
    const prompt = buildAnalyzePrompt('Delete bank account', 'Settings screen');
    expect(prompt).toContain('Clarity');
    expect(prompt).toContain('Conciseness');
    expect(prompt).toContain('Tone');
    expect(prompt).toContain('Accessibility');
    expect(prompt).toContain('Specificity');
    expect(prompt).toContain('Actionability');
    expect(prompt).toContain('Confidence');
    expect(prompt).toContain('Delete bank account');
  });

  it('buildImprovePrompt includes specific instruction and original copy', () => {
    const prompt = buildImprovePrompt('Click here to submit', 'Make the action verb specific');
    expect(prompt).toContain('Instruction: "Make the action verb specific"');
    expect(prompt).toContain('Original Copy: "Click here to submit"');
  });

  it('buildVariationsPrompt specifies 3 distinct alternatives', () => {
    const prompt = buildVariationsPrompt('Delete account permanently');
    expect(prompt).toContain('Delete account permanently');
    expect(prompt).toContain('alternatives');
  });
});
