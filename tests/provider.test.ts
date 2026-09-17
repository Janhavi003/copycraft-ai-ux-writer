import { describe, expect, it } from 'vitest';
import {
  generateDemoCopy,
  generateDemoAnalysis,
  generateDemoImprovement,
  generateDemoVariations,
  generate,
  analyze,
  improve,
  variations,
  insights,
} from '@/lib/ai/provider';

describe('AI Provider & Demo Mode Suite', () => {
  describe('generateDemoCopy component specialization', () => {
    it('generates error copy tailored to system failures', () => {
      const res = generateDemoCopy({
        component: 'Error',
        product: 'Analytics Cloud',
        goal: 'Load team report',
        action: 'Query execution',
        audience: 'Business',
        tone: 'Professional',
      });
      expect(res.headline.toLowerCase()).toContain('couldn’t');
      expect(res.primary_action).toBe('Try again');
      expect(res.analysis.clarity).toBeGreaterThan(80);
      expect(res.analysis.dimensionFeedback?.length).toBe(7);
    });

    it('generates empty state copy with clear creation CTA', () => {
      const res = generateDemoCopy({
        component: 'Empty State',
        product: 'Projects',
        goal: 'View all active projects',
        action: 'Visits projects view',
        audience: 'Designers',
        tone: 'Friendly',
      });
      expect(res.headline.toLowerCase()).toContain('no projects items yet');
      expect(res.primary_action.toLowerCase()).toContain('create');
    });

    it('generates confirmation modal copy with consequence disclosure', () => {
      const res = generateDemoCopy({
        component: 'Confirmation',
        product: 'Workspace',
        goal: 'Delete workspace permanently',
        action: 'Delete workspace',
        audience: 'Enterprise',
        tone: 'Direct',
      });
      expect(res.supporting_text).toContain('cannot be undone');
      expect(res.primary_action).toBe('Delete workspace');
    });

    it('generates permission copy emphasizing privacy and purpose', () => {
      const res = generateDemoCopy({
        component: 'Permission',
        product: 'Mobile App',
        goal: 'Scan payment cards via camera',
        action: 'Camera access',
        audience: 'Consumers',
        tone: 'Empathetic',
      });
      expect(res.headline.toLowerCase()).toContain('allow');
      expect(res.primary_action).toBe('Allow access');
    });
  });

  describe('generateDemoAnalysis heuristics scoring', () => {
    it('penalizes generic verbs like "Click here" or "Submit"', () => {
      const badCopy = 'Click here to submit your form now.';
      const analysis = generateDemoAnalysis(badCopy);
      expect(analysis.specificity).toBeLessThan(85);
      expect(analysis.actionability).toBeLessThan(85);
      expect(analysis.improvements.some(i => i.toLowerCase().includes('generic'))).toBe(true);
    });

    it('scores concise, specific microcopy higher', () => {
      const goodCopy = 'Delete bank account? This permanently removes your transaction history. Delete account.';
      const analysis = generateDemoAnalysis(goodCopy);
      expect(analysis.clarity).toBeGreaterThanOrEqual(90);
      expect(analysis.conciseness).toBeGreaterThanOrEqual(90);
      expect(analysis.dimensionFeedback?.length).toBe(7);
    });
  });

  describe('generateDemoImprovement', () => {
    const original = 'Are you really sure you want to proceed?\nThis will erase all data.\nProceed';

    it('shortens copy when instructed', () => {
      const improved = generateDemoImprovement(original, 'Make this shorter');
      expect(improved.headline.length).toBeLessThanOrEqual(30);
    });

    it('replaces generic proceed with specific action when instructed', () => {
      const improved = generateDemoImprovement(original, 'Make the action clearer and more specific');
      expect(improved.primary_action.toLowerCase()).not.toBe('proceed');
    });

    it('adjusts tone when empathetic is requested', () => {
      const improved = generateDemoImprovement(original, 'Make it more empathetic');
      expect(improved.headline.toLowerCase()).toContain('help');
    });
  });

  describe('generateDemoVariations', () => {
    it('returns three distinct alternatives with rationale and score', () => {
      const alts = generateDemoVariations('Delete bank account');
      expect(alts.length).toBe(3);
      alts.forEach(a => {
        expect(a.label).toBeTruthy();
        expect(a.copy).toBeTruthy();
        expect(a.score).toBeGreaterThan(0);
        expect(a.reason).toBeTruthy();
      });
    });
  });

  describe('Offline safe execution without API keys', () => {
    it('generate falls back to demo mode safely without throwing', async () => {
      const res = await generate({
        component: 'Toast',
        product: 'Editor',
        goal: 'Save draft',
        action: 'Auto-save triggered',
        audience: 'General',
        tone: 'Minimal',
      });
      expect(res.demo).toBe(true);
      expect(res.value.headline).toBeTruthy();
      expect(res.value.primary_action).toBeTruthy();
    });

    it('analyze falls back to demo analysis safely', async () => {
      const res = await analyze('Delete your account');
      expect(res.demo).toBe(true);
      expect(res.value.clarity).toBeGreaterThan(0);
    });

    it('improve falls back to demo improvement safely', async () => {
      const res = await improve('Confirm action', 'Make it concise');
      expect(res.demo).toBe(true);
      expect(res.value.headline).toBeTruthy();
    });

    it('variations returns alternatives safely', async () => {
      const res = await variations('Delete workspace');
      expect(res.demo).toBe(true);
      expect(res.value.length).toBe(3);
    });

    it('insights returns structured recommendations', async () => {
      const list = await insights();
      expect(list.length).toBeGreaterThanOrEqual(3);
      expect(list[0]?.title).toBeTruthy();
      expect(list[0]?.action).toBeTruthy();
    });
  });
});
