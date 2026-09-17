import { describe, expect, it } from 'vitest';
import {
  analysisSchema,
  copyResponseSchema,
  generateInputSchema,
  analyzeInputSchema,
  improveInputSchema,
  variationsInputSchema,
  alternativeSchema,
  scoreDimensionSchema,
  brandVoiceInputSchema,
} from '@/lib/schemas';

describe('Zod Schemas Validation', () => {
  describe('scoreDimensionSchema', () => {
    it('accepts valid score dimensions', () => {
      const valid = {
        dimension: 'Clarity',
        score: 95,
        rationale: 'Direct language used without ambiguous terms.',
        recommendation: 'Keep primary noun consistent.',
      };
      expect(scoreDimensionSchema.safeParse(valid).success).toBe(true);
    });

    it('rejects invalid score out of 0-100 bounds', () => {
      const invalid = {
        dimension: 'Tone',
        score: 105,
        rationale: 'Over 100',
        recommendation: 'Fix bounds',
      };
      expect(scoreDimensionSchema.safeParse(invalid).success).toBe(false);
    });
  });

  describe('analysisSchema', () => {
    it('accepts valid 7-dimension analysis with feedback', () => {
      const valid = {
        clarity: 92,
        conciseness: 88,
        tone: 90,
        accessibility: 94,
        specificity: 91,
        actionability: 95,
        confidence: 90,
        strengths: ['Plain language', 'Clear next step'],
        improvements: ['Shorten button label'],
        dimensionFeedback: [
          {
            dimension: 'Clarity',
            score: 92,
            rationale: 'Very clear',
            recommendation: 'None',
          },
        ],
      };
      const parsed = analysisSchema.safeParse(valid);
      expect(parsed.success).toBe(true);
    });

    it('supplies default scores for optional specificity and actionability if missing', () => {
      const partial = {
        clarity: 90,
        conciseness: 85,
        tone: 85,
        accessibility: 90,
        confidence: 85,
        strengths: [],
        improvements: [],
      };
      const parsed = analysisSchema.safeParse(partial);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.specificity).toBe(88);
        expect(parsed.data.actionability).toBe(90);
      }
    });
  });

  describe('copyResponseSchema', () => {
    it('accepts valid structured copy response', () => {
      const valid = {
        headline: 'Delete your bank account?',
        body: 'This permanently removes your account. This action cannot be undone.',
        primary_action: 'Delete account',
        secondary_action: 'Cancel',
        supporting_text: 'Download statements before continuing.',
        error_text: '',
        alternatives: [
          {
            label: 'Direct',
            copy: 'Delete bank account',
            score: 95,
            reason: 'Scannable',
          },
        ],
        analysis: {
          clarity: 94,
          conciseness: 90,
          tone: 92,
          accessibility: 93,
          specificity: 95,
          actionability: 94,
          confidence: 91,
          strengths: ['Clear outcome'],
          improvements: ['Keep concise'],
        },
      };
      expect(copyResponseSchema.safeParse(valid).success).toBe(true);
    });

    it('rejects copy response missing headline or body', () => {
      const invalid = {
        primary_action: 'Continue',
      };
      expect(copyResponseSchema.safeParse(invalid).success).toBe(false);
    });
  });

  describe('generateInputSchema', () => {
    it('validates complete generation input', () => {
      const input = {
        component: 'Confirmation',
        product: 'Pulse App',
        goal: 'Remove debit card',
        action: 'User clicks remove',
        audience: 'Consumers',
        tone: 'Empathetic',
        context: 'Cannot be undone',
        platform: 'iOS App',
      };
      expect(generateInputSchema.safeParse(input).success).toBe(true);
    });

    it('rejects input with empty product or goal', () => {
      const invalid = {
        component: 'Modal',
        product: '',
        goal: '',
        action: 'click',
        audience: 'Consumers',
        tone: 'Friendly',
      };
      expect(generateInputSchema.safeParse(invalid).success).toBe(false);
    });
  });

  describe('analyzeInputSchema and improveInputSchema', () => {
    it('validates analyzeInput with text', () => {
      expect(analyzeInputSchema.safeParse({ text: 'Delete account' }).success).toBe(true);
      expect(analyzeInputSchema.safeParse({ text: '' }).success).toBe(false);
    });

    it('validates improveInput with copy and instruction', () => {
      expect(
        improveInputSchema.safeParse({
          copy: 'Are you sure?',
          instruction: 'Make it shorter',
        }).success
      ).toBe(true);

      expect(
        improveInputSchema.safeParse({
          copy: '',
          instruction: 'Make it shorter',
        }).success
      ).toBe(false);
    });
  });
});
