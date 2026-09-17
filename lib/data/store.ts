import type { AppStore, CopyGeneration, Project, BrandVoice } from '@/types';
import { initialStore } from './seed';

const KEY = 'copycraft-store-v3';
const LEGACY_KEY = 'copycraft-store-v2';

export function loadStore(): AppStore {
  if (typeof window === 'undefined') return structuredClone(initialStore);
  try {
    let raw = localStorage.getItem(KEY);
    if (!raw) {
      const legacy = localStorage.getItem(LEGACY_KEY);
      if (legacy) {
        raw = legacy;
        localStorage.setItem(KEY, legacy);
        localStorage.removeItem(LEGACY_KEY);
      }
    }
    if (!raw) {
      const seeded = structuredClone(initialStore);
      localStorage.setItem(KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return structuredClone(initialStore);

    return {
      projects: Array.isArray(parsed.projects) ? parsed.projects : initialStore.projects,
      brandVoices: Array.isArray(parsed.brandVoices) ? parsed.brandVoices : initialStore.brandVoices,
      generations: Array.isArray(parsed.generations) ? parsed.generations : initialStore.generations,
      defaultVoiceId: parsed.defaultVoiceId || initialStore.defaultVoiceId || 'pulse',
    };
  } catch {
    return structuredClone(initialStore);
  }
}

export function saveStore(store: AppStore): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
    window.dispatchEvent(new Event('copycraft-store-change'));
  } catch (err) {
    console.error('Failed to save CopyCraft store:', err);
  }
}

export function resetStore(): AppStore {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(KEY);
    localStorage.removeItem(LEGACY_KEY);
    const fresh = structuredClone(initialStore);
    localStorage.setItem(KEY, JSON.stringify(fresh));
    window.dispatchEvent(new Event('copycraft-store-change'));
    return fresh;
  }
  return structuredClone(initialStore);
}

export function upsertGeneration(store: AppStore, g: CopyGeneration): AppStore {
  const existingIdx = store.generations.findIndex(x => x.id === g.id);
  const generations = existingIdx >= 0
    ? store.generations.map(x => x.id === g.id ? g : x)
    : [g, ...store.generations];

  const projects = store.projects.map(p => {
    if (p.id === g.projectId) {
      const projectCopies = generations.filter(x => x.projectId === p.id);
      const totalScore = projectCopies.reduce((acc, curr) => acc + curr.score, 0);
      const avg = projectCopies.length ? Math.round(totalScore / projectCopies.length) : p.avgScore;
      return {
        ...p,
        copyCount: projectCopies.length,
        avgScore: avg,
        updatedAt: 'Just now',
      };
    }
    return p;
  });

  return { ...store, generations, projects };
}

export function deleteGeneration(store: AppStore, id: string): AppStore {
  const target = store.generations.find(g => g.id === id);
  const generations = store.generations.filter(g => g.id !== id);
  const projects = store.projects.map(p => {
    if (target && p.id === target.projectId) {
      const remainingCopies = generations.filter(x => x.projectId === p.id);
      const totalScore = remainingCopies.reduce((acc, curr) => acc + curr.score, 0);
      return {
        ...p,
        copyCount: remainingCopies.length,
        avgScore: remainingCopies.length ? Math.round(totalScore / remainingCopies.length) : 0,
        updatedAt: 'Just now',
      };
    }
    return p;
  });
  return { ...store, generations, projects };
}

export function upsertProject(store: AppStore, p: Project): AppStore {
  const existingIdx = store.projects.findIndex(x => x.id === p.id);
  const projects = existingIdx >= 0
    ? store.projects.map(x => x.id === p.id ? p : x)
    : [p, ...store.projects];
  return { ...store, projects };
}

export function deleteProject(store: AppStore, id: string): AppStore {
  const projects = store.projects.filter(p => p.id !== id);
  const generations = store.generations.map(g =>
    g.projectId === id ? { ...g, projectId: undefined, projectName: undefined } : g
  );
  return { ...store, projects, generations };
}

export function upsertBrandVoice(store: AppStore, v: BrandVoice): AppStore {
  const existingIdx = store.brandVoices.findIndex(x => x.id === v.id);
  const brandVoices = existingIdx >= 0
    ? store.brandVoices.map(x => x.id === v.id ? v : x)
    : [v, ...store.brandVoices];
  return { ...store, brandVoices };
}

export function deleteBrandVoice(store: AppStore, id: string): AppStore {
  const brandVoices = store.brandVoices.filter(v => v.id !== id);
  const defaultVoiceId = store.defaultVoiceId === id ? (brandVoices[0]?.id || '') : store.defaultVoiceId;
  return { ...store, brandVoices, defaultVoiceId };
}

export function setDefaultBrandVoice(store: AppStore, id: string): AppStore {
  const brandVoices = store.brandVoices.map(v => ({
    ...v,
    isDefault: v.id === id,
  }));
  return { ...store, brandVoices, defaultVoiceId: id };
}

export function exportStoreJson(store: AppStore): string {
  return JSON.stringify(store, null, 2);
}

export function importStoreJson(jsonStr: string): AppStore | null {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      projects: Array.isArray(parsed.projects) ? parsed.projects : [],
      brandVoices: Array.isArray(parsed.brandVoices) ? parsed.brandVoices : [],
      generations: Array.isArray(parsed.generations) ? parsed.generations : [],
      defaultVoiceId: parsed.defaultVoiceId || '',
    };
  } catch {
    return null;
  }
}
