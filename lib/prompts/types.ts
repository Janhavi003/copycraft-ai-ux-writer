export interface GenerateInput {
  component: string;
  product: string;
  goal: string;
  action: string;
  audience: string;
  tone: string;
  context?: string;
  constraints?: string;
  characterLimit?: number;
  platform?: string;
  locale?: string;
  accessibilityReqs?: string;
  brandVoice?: {
    name: string;
    rules: string[];
    personality: string[];
    tone?: string;
    wordsToUse?: string[];
    wordsToAvoid?: string[];
    exampleCopy?: string;
  };
}
