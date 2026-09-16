import {z} from 'zod';
export const analysisSchema=z.object({clarity:z.number().min(0).max(100),accessibility:z.number().min(0).max(100),tone:z.number().min(0).max(100),conciseness:z.number().min(0).max(100),confidence:z.number().min(0).max(100),strengths:z.array(z.string()),improvements:z.array(z.string())});
export const alternativeSchema=z.object({label:z.string(),copy:z.string(),score:z.number().min(0).max(100),reason:z.string()});
export const copyResponseSchema=z.object({headline:z.string(),body:z.string(),primary_action:z.string(),secondary_action:z.string(),supporting_text:z.string(),alternatives:z.array(alternativeSchema).default([]),analysis:analysisSchema});
export const generateInputSchema=z.object({component:z.string().min(1),product:z.string().min(2),goal:z.string().min(2),action:z.string().min(2),audience:z.string().min(1),tone:z.string().min(1),context:z.string().optional().default(''),brandVoice:z.object({name:z.string(),rules:z.array(z.string()),personality:z.array(z.string())}).optional()});
export const analyzeInputSchema=z.object({text:z.string().min(2),context:z.string().optional().default('')});
export const improveInputSchema=z.object({copy:z.string().min(2),instruction:z.string().min(2),context:z.string().optional().default('')});
export const variationsInputSchema=z.object({copy:z.string().min(2),context:z.string().optional().default('')});
