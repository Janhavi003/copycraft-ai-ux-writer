export type Tone = 'Friendly' | 'Professional' | 'Confident' | 'Empathetic' | 'Playful' | 'Minimal' | 'Direct';

export type Audience = 'General' | 'Consumers' | 'Developers' | 'Designers' | 'Business' | 'Enterprise';

export type ComponentType =
  | 'Button'
  | 'Confirmation'
  | 'Error'
  | 'Empty State'
  | 'Toast'
  | 'Form'
  | 'Tooltip'
  | 'Banner'
  | 'Dialog'
  | 'Navigation'
  | 'Onboarding'
  | 'Success'
  | 'Permission'
  | 'Loading'
  | 'Login'
  | 'Signup'
  | 'Checkout'
  | 'Search'
  | 'Settings'
  | 'Account';

export interface ScoreDimension {
  dimension: 'Clarity' | 'Conciseness' | 'Tone' | 'Accessibility' | 'Specificity' | 'Actionability' | 'Confidence';
  score: number;
  rationale: string;
  recommendation: string;
}

export interface Analysis {
  clarity: number;
  conciseness: number;
  tone: number;
  accessibility: number;
  specificity: number;
  actionability: number;
  confidence: number;
  strengths: string[];
  improvements: string[];
  dimensionFeedback?: ScoreDimension[];
}

export interface Alternative {
  label: string;
  copy: string;
  score: number;
  reason: string;
  tone?: string;
  useCase?: string;
}

export interface CopyGeneration {
  id: string;
  projectId?: string;
  projectName?: string;
  component: ComponentType;
  product: string;
  goal: string;
  action: string;
  audience: Audience;
  tone: Tone;
  brandVoiceId?: string;
  brandVoiceName?: string;
  headline: string;
  body: string;
  primaryAction: string;
  secondaryAction?: string;
  supportingText?: string;
  errorText?: string;
  constraints?: string;
  characterLimit?: number;
  platform?: string;
  locale?: string;
  accessibilityReqs?: string;
  score: number;
  analysis: Analysis;
  alternatives?: Alternative[];
  createdAt: string;
  updatedAt?: string;
}

export interface BrandVoice {
  id: string;
  name: string;
  description: string;
  personality: string[];
  tone: string;
  rules: string[];
  wordsToUse: string[];
  wordsToAvoid: string[];
  exampleCopy: string;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  product?: string;
  team?: string;
  audience: Audience;
  brandVoiceId?: string;
  status: 'Active' | 'In Review' | 'Archived';
  guidelines: string[];
  copyCount: number;
  avgScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface Insight {
  id: string;
  title: string;
  body: string;
  action: string;
  href?: string;
}

export interface AppStore {
  projects: Project[];
  brandVoices: BrandVoice[];
  generations: CopyGeneration[];
  defaultVoiceId?: string;
}
