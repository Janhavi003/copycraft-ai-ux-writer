import { z } from 'zod';

export const scoreDimensionSchema = z.object({
  dimension: z.enum(['Clarity', 'Conciseness', 'Tone', 'Accessibility', 'Specificity', 'Actionability', 'Confidence']),
  score: z.number().min(0).max(100),
  rationale: z.string(),
  recommendation: z.string(),
});

export const analysisSchema = z.object({
  clarity: z.number().min(0).max(100),
  conciseness: z.number().min(0).max(100),
  tone: z.number().min(0).max(100),
  accessibility: z.number().min(0).max(100),
  specificity: z.number().min(0).max(100).default(88),
  actionability: z.number().min(0).max(100).default(90),
  confidence: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  dimensionFeedback: z.array(scoreDimensionSchema).optional(),
});

export const alternativeSchema = z.object({
  label: z.string(),
  copy: z.string(),
  score: z.number().min(0).max(100),
  reason: z.string(),
  tone: z.string().optional(),
  useCase: z.string().optional(),
});

export const copyResponseSchema = z.object({
  headline: z.string(),
  body: z.string(),
  primary_action: z.string(),
  secondary_action: z.string().optional().default(''),
  supporting_text: z.string().optional().default(''),
  error_text: z.string().optional().default(''),
  alternatives: z.array(alternativeSchema).default([]),
  analysis: analysisSchema,
});

export const brandVoiceInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().default(''),
  personality: z.array(z.string()).default([]),
  tone: z.string().optional().default(''),
  rules: z.array(z.string()).default([]),
  wordsToUse: z.array(z.string()).optional().default([]),
  wordsToAvoid: z.array(z.string()).optional().default([]),
  exampleCopy: z.string().optional().default(''),
});

export const generateInputSchema = z.object({
  component: z.string().min(1),
  product: z.string().min(1),
  goal: z.string().min(1),
  action: z.string().min(1),
  audience: z.string().min(1),
  tone: z.string().min(1),
  context: z.string().optional().default(''),
  constraints: z.string().optional().default(''),
  characterLimit: z.number().optional(),
  platform: z.string().optional().default('Web'),
  locale: z.string().optional().default('en-US'),
  accessibilityReqs: z.string().optional().default(''),
  brandVoice: brandVoiceInputSchema.optional(),
});

export const analyzeInputSchema = z.object({
  text: z.string().min(1),
  context: z.string().optional().default(''),
});

export const improveInputSchema = z.object({
  copy: z.string().min(1),
  instruction: z.string().min(1),
  context: z.string().optional().default(''),
});

export const variationsInputSchema = z.object({
  copy: z.string().min(1),
  context: z.string().optional().default(''),
});
