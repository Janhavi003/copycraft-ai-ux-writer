import type {AppStore,CopyGeneration,Project,BrandVoice} from '@/types';
import {initialStore} from './seed';
const KEY='copycraft-store-v2';
export function loadStore():AppStore { if(typeof window==='undefined') return initialStore; try { const raw=localStorage.getItem(KEY); return raw?JSON.parse(raw):structuredClone(initialStore); } catch { return structuredClone(initialStore); } }
export function saveStore(store:AppStore){ if(typeof window!=='undefined') localStorage.setItem(KEY,JSON.stringify(store)); }
export function resetStore(){ if(typeof window!=='undefined') localStorage.removeItem(KEY); }
export function upsertGeneration(store:AppStore,g:CopyGeneration):AppStore { const generations=[g,...store.generations.filter(x=>x.id!==g.id)]; const projects=store.projects.map(p=>p.id===g.projectId?{...p,copyCount:p.copyCount+1,avgScore:Math.round((p.avgScore*p.copyCount+g.score)/(p.copyCount+1)),updatedAt:'Just now'}:p); return {...store,generations,projects}; }
export function upsertProject(store:AppStore,p:Project):AppStore { return {...store,projects:[p,...store.projects.filter(x=>x.id!==p.id)]}; }
export function upsertBrandVoice(store:AppStore,v:BrandVoice):AppStore { return {...store,brandVoices:[v,...store.brandVoices.filter(x=>x.id!==v.id)]}; }
