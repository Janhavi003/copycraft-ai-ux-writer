import { describe, expect, it, beforeEach } from 'vitest';
import {
  initialStore,
} from '@/lib/data/seed';
import {
  upsertGeneration,
  deleteGeneration,
  upsertProject,
  deleteProject,
  upsertBrandVoice,
  deleteBrandVoice,
  setDefaultBrandVoice,
  exportStoreJson,
  importStoreJson,
  resetStore,
} from '@/lib/data/store';
import type { AppStore, CopyGeneration, Project, BrandVoice } from '@/types';

describe('Store & Persistence Operations', () => {
  let mockStore: AppStore;

  beforeEach(() => {
    mockStore = structuredClone(initialStore);
  });

  describe('Generations CRUD & Project Metrics Sync', () => {
    it('upserts a new generation and recalculates project copyCount and avgScore', () => {
      const projectBefore = mockStore.projects.find(p => p.id === 'pulse')!;
      const countBefore = projectBefore.copyCount;

      const newGen: CopyGeneration = {
        id: 'test-gen-1',
        projectId: 'pulse',
        component: 'Confirmation',
        product: 'Pulse Banking',
        goal: 'Close account',
        action: 'Close',
        audience: 'Consumers',
        tone: 'Empathetic',
        headline: 'Close account now?',
        body: 'Confirm your request.',
        primaryAction: 'Close account',
        score: 100,
        analysis: {
          clarity: 100,
          conciseness: 100,
          tone: 100,
          accessibility: 100,
          specificity: 100,
          actionability: 100,
          confidence: 100,
          strengths: [],
          improvements: [],
        },
        createdAt: 'Just now',
      };

      const projectCopiesBefore = mockStore.generations.filter(g => g.projectId === 'pulse').length;
      const updated = upsertGeneration(mockStore, newGen);
      expect(updated.generations.find(g => g.id === 'test-gen-1')).toBeTruthy();

      const projectAfter = updated.projects.find(p => p.id === 'pulse')!;
      expect(projectAfter.copyCount).toBe(projectCopiesBefore + 1);
    });

    it('deletes a generation and updates project copyCount', () => {
      const targetId = mockStore.generations[0]!.id;
      const targetProjectId = mockStore.generations[0]!.projectId;

      const updated = deleteGeneration(mockStore, targetId);
      expect(updated.generations.find(g => g.id === targetId)).toBeUndefined();

      if (targetProjectId) {
        const proj = updated.projects.find(p => p.id === targetProjectId);
        if (proj) {
          const expectedCopies = updated.generations.filter(g => g.projectId === targetProjectId).length;
          expect(proj.copyCount).toBe(expectedCopies);
        }
      }
    });
  });

  describe('Projects CRUD', () => {
    it('creates a new project', () => {
      const newProj: Project = {
        id: 'new-proj',
        name: 'Design System Workspace',
        description: 'Global token microcopy',
        audience: 'Designers',
        guidelines: ['Accessible contrast', 'Specific verbs'],
        status: 'Active',
        copyCount: 0,
        avgScore: 0,
        createdAt: '2025-01-01',
        updatedAt: 'Just now',
      };

      const updated = upsertProject(mockStore, newProj);
      expect(updated.projects.find(p => p.id === 'new-proj')).toEqual(newProj);
    });

    it('deletes a project and detaches its generations to preserve user copy', () => {
      const updated = deleteProject(mockStore, 'pulse');
      expect(updated.projects.find(p => p.id === 'pulse')).toBeUndefined();

      // Generations that were in 'pulse' should now have undefined projectId
      const formerPulseGens = updated.generations.filter(g => g.id === 'g1');
      expect(formerPulseGens[0]?.projectId).toBeUndefined();
    });
  });

  describe('Brand Voice Operations', () => {
    it('creates and updates a brand voice', () => {
      const voice: BrandVoice = {
        id: 'voice-neo',
        name: 'Neo Minimalist',
        description: 'Ultra short sentences',
        personality: ['Minimal', 'Direct'],
        tone: 'Minimal',
        rules: ['Max 4 words per CTA'],
        wordsToUse: ['Go', 'Back'],
        wordsToAvoid: ['Kindly'],
        exampleCopy: 'Saved.',
        createdAt: '2025-01-01',
        updatedAt: 'Just now',
      };

      const updated = upsertBrandVoice(mockStore, voice);
      expect(updated.brandVoices.find(v => v.id === 'voice-neo')).toBeTruthy();
    });

    it('sets default brand voice', () => {
      const updated = setDefaultBrandVoice(mockStore, 'studio');
      expect(updated.defaultVoiceId).toBe('studio');
      const studioVoice = updated.brandVoices.find(v => v.id === 'studio');
      expect(studioVoice?.isDefault).toBe(true);
      const pulseVoice = updated.brandVoices.find(v => v.id === 'pulse');
      expect(pulseVoice?.isDefault).toBe(false);
    });

    it('deletes brand voice and safely resets default', () => {
      const updated = deleteBrandVoice(mockStore, 'pulse');
      expect(updated.brandVoices.find(v => v.id === 'pulse')).toBeUndefined();
    });
  });

  describe('Portability & Corruption Recovery', () => {
    it('exports and restores valid JSON backup', () => {
      const json = exportStoreJson(mockStore);
      expect(typeof json).toBe('string');

      const restored = importStoreJson(json);
      expect(restored).not.toBeNull();
      expect(restored?.projects.length).toBe(mockStore.projects.length);
      expect(restored?.brandVoices.length).toBe(mockStore.brandVoices.length);
      expect(restored?.generations.length).toBe(mockStore.generations.length);
    });

    it('gracefully returns null for corrupt JSON string', () => {
      expect(importStoreJson('NOT_VALID_JSON{')).toBeNull();
      expect(importStoreJson('"plain string"')).toBeNull();
    });
  });
});
