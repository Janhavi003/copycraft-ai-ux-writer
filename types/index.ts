export type Tone = 'Friendly' | 'Professional' | 'Confident' | 'Empathetic' | 'Playful' | 'Minimal';
export type Audience = 'General' | 'Consumers' | 'Developers' | 'Designers' | 'Business' | 'Enterprise';
export type ComponentType = 'Button' | 'Modal' | 'Form' | 'Error' | 'Empty State' | 'Tooltip' | 'Onboarding' | 'Notification' | 'Login' | 'Signup' | 'Checkout' | 'Confirmation' | 'Search' | 'Navigation' | 'Settings' | 'Account';
export interface Analysis { clarity:number; accessibility:number; tone:number; conciseness:number; confidence:number; strengths:string[]; improvements:string[] }
export interface Alternative { label:string; copy:string; score:number; reason:string }
export interface CopyGeneration { id:string; projectId?:string; component:ComponentType; product:string; goal:string; action:string; audience:Audience; tone:Tone; headline:string; body:string; primaryAction:string; secondaryAction:string; supportingText:string; score:number; analysis:Analysis; alternatives?:Alternative[]; createdAt:string }
export interface BrandVoice { id:string; name:string; description:string; personality:string[]; rules:string[] }
export interface Project { id:string; name:string; description:string; audience:Audience; brandVoiceId?:string; guidelines:string[]; copyCount:number; avgScore:number; updatedAt:string }
export interface Insight { id:string; title:string; body:string; action:string }
export interface AppStore { projects:Project[]; brandVoices:BrandVoice[]; generations:CopyGeneration[] }
