import type { GenerateInput } from './types';
export type { GenerateInput } from './types';

export function buildGeneratePrompt(i: GenerateInput): string {
  const brandVoiceDetails = i.brandVoice
    ? `Brand Voice: ${i.brandVoice.name}
Rules: ${i.brandVoice.rules?.join('; ') || 'None'}
Personality: ${i.brandVoice.personality?.join(', ') || 'None'}
Words to use: ${i.brandVoice.wordsToUse?.join(', ') || 'None'}
Words to avoid: ${i.brandVoice.wordsToAvoid?.join(', ') || 'None'}`
    : 'No custom brand voice specified.';

  return `You are CopyCraft, a principal UX writer and interface content strategist.
Create structured, production-ready interface copy based on this product context:

Component: ${i.component}
Product / Feature: ${i.product}
User Goal: ${i.goal}
User Action: ${i.action}
Audience: ${i.audience}
Tone: ${i.tone}
Context: ${i.context || 'Standard flow'}
Constraints: ${i.constraints || 'None'}
Character Limit: ${i.characterLimit ? `${i.characterLimit} characters` : 'None specified'}
Platform: ${i.platform || 'Web & Mobile'}
Accessibility requirements: ${i.accessibilityReqs || 'WCAG 2.2 AA compliant'}
${brandVoiceDetails}

UX Writing Principles:
1. Write concise interface copy optimized for scannability and fast comprehension.
2. Avoid generic verbs like "Submit", "Proceed", or "Click here"; use specific outcome-oriented action verbs (e.g. "Create workspace", "Delete account", "Send invite").
3. Make consequences explicit before irreversible actions.
4. Avoid filler jargon, unnecessary apologies ("Oops", "Sorry"), and manipulative dark patterns.
5. Preserve user agency and offer clear recovery paths.

Return a valid JSON object matching EXACTLY this structure:
{
  "headline": "A concise headline or prompt (max 8 words)",
  "body": "Clear explanatory body copy explaining context or outcome (1-3 sentences)",
  "primary_action": "Specific primary button text (1-3 words)",
  "secondary_action": "Secondary exit/dismiss button text (e.g. Cancel, Not now)",
  "supporting_text": "Helper text, microcopy, or safety reassurance",
  "error_text": "Inline error message if input or validation fails",
  "alternatives": [
    { "label": "Concise", "copy": "Alternative copy string", "score": 92, "reason": "Why this works", "tone": "Minimal", "useCase": "Mobile dialog" },
    { "label": "Empathetic", "copy": "Alternative copy string", "score": 90, "reason": "Why this works", "tone": "Empathetic", "useCase": "Customer settings" },
    { "label": "Direct", "copy": "Alternative copy string", "score": 94, "reason": "Why this works", "tone": "Confident", "useCase": "Power users" }
  ],
  "analysis": {
    "clarity": 94,
    "conciseness": 91,
    "tone": 92,
    "accessibility": 93,
    "specificity": 95,
    "actionability": 94,
    "confidence": 92,
    "strengths": ["Clear outcome-based CTA", "Explains consequence upfront", "Plain language"],
    "improvements": ["Keep supporting text under two lines on small screens"],
    "dimensionFeedback": [
      { "dimension": "Clarity", "score": 94, "rationale": "Clear language", "recommendation": "Maintain specific nouns" },
      { "dimension": "Conciseness", "score": 91, "rationale": "No fluff words", "recommendation": "Ensure short button labels" },
      { "dimension": "Tone", "score": 92, "rationale": "Fits requested tone", "recommendation": "Avoid passive phrasing" },
      { "dimension": "Accessibility", "score": 93, "rationale": "Logical hierarchy", "recommendation": "Ensure distinct visual weighting" },
      { "dimension": "Specificity", "score": 95, "rationale": "Concrete noun used", "recommendation": "Keep action naming aligned with user goal" },
      { "dimension": "Actionability", "score": 94, "rationale": "Action is immediate", "recommendation": "Keep secondary exit path visible" },
      { "dimension": "Confidence", "score": 92, "rationale": "Assertive guidance", "recommendation": "Reinforce user control" }
    ]
  }
}`;
}

export function buildAnalyzePrompt(copy: string, context: string = ''): string {
  return `You are CopyCraft, a principal UX writer and interface content auditor.
Analyze this interface copy against 7 core UX writing heuristics:
Copy to inspect:
"${copy}"

Additional context:
"${context || 'General product interface'}"

Evaluate and score each dimension from 0 to 100:
1. Clarity: Is the meaning immediately obvious without re-reading?
2. Conciseness: Is every word doing real work? Is unnecessary filler removed?
3. Tone: Is the voice appropriate, respectful, and not condescending?
4. Accessibility: Does it rely on visual clues? Is language plain and readable for all users?
5. Specificity: Does it name the specific object/action rather than vague terms like "item" or "data"?
6. Actionability: Is it clear what happens next and what the user must do?
7. Confidence: Does it communicate certainty and trust without wavering or false promises?

Return a valid JSON object matching EXACTLY this structure:
{
  "clarity": 88,
  "conciseness": 85,
  "tone": 90,
  "accessibility": 89,
  "specificity": 86,
  "actionability": 91,
  "confidence": 88,
  "strengths": ["Identifies clear next step", "Uses plain terminology"],
  "improvements": ["Replace vague verbs with the concrete outcome", "Shorten supporting text"],
  "dimensionFeedback": [
    { "dimension": "Clarity", "score": 88, "rationale": "Explain what influenced clarity score", "recommendation": "Concrete advice for clarity" },
    { "dimension": "Conciseness", "score": 85, "rationale": "Explain conciseness", "recommendation": "Cut words where possible" },
    { "dimension": "Tone", "score": 90, "rationale": "Explain tone assessment", "recommendation": "Advice on tone" },
    { "dimension": "Accessibility", "score": 89, "rationale": "Explain accessibility heuristic", "recommendation": "Actionable accessibility improvement" },
    { "dimension": "Specificity", "score": 86, "rationale": "Explain specificity", "recommendation": "Name the specific object/action" },
    { "dimension": "Actionability", "score": 91, "rationale": "Explain actionability", "recommendation": "Optimize call to action" },
    { "dimension": "Confidence", "score": 88, "rationale": "Explain confidence", "recommendation": "Reassure user agency" }
  ]
}`;
}

export function buildImprovePrompt(copy: string, instruction: string, context: string = ''): string {
  return `You are CopyCraft, a principal UX writer.
Improve the following interface copy based on this specific instruction:
Instruction: "${instruction}"
Original Copy: "${copy}"
Context: "${context || 'Standard interface'}"

Return the improved copy and full evaluation as JSON:
{
  "headline": "Improved headline",
  "body": "Improved body copy",
  "primary_action": "Improved primary button label",
  "secondary_action": "Improved secondary button label",
  "supporting_text": "Improved supporting helper text",
  "error_text": "Improved error text if relevant",
  "alternatives": [
    { "label": "Option A", "copy": "Variant copy", "score": 93, "reason": "Why this works", "tone": "Direct", "useCase": "Fast scan" },
    { "label": "Option B", "copy": "Variant copy", "score": 91, "reason": "Why this works", "tone": "Friendly", "useCase": "Consumer onboarding" },
    { "label": "Option C", "copy": "Variant copy", "score": 95, "reason": "Why this works", "tone": "Minimal", "useCase": "Compact mobile" }
  ],
  "analysis": {
    "clarity": 95,
    "conciseness": 94,
    "tone": 92,
    "accessibility": 93,
    "specificity": 95,
    "actionability": 95,
    "confidence": 94,
    "strengths": ["Addressed instruction directly", "Clear outcome stated"],
    "improvements": ["Ensure visual hierarchy matches new brevity"],
    "dimensionFeedback": [
      { "dimension": "Clarity", "score": 95, "rationale": "High readability", "recommendation": "Keep phrasing consistent" },
      { "dimension": "Conciseness", "score": 94, "rationale": "Tighter sentence structure", "recommendation": "Maintain single idea per sentence" },
      { "dimension": "Tone", "score": 92, "rationale": "Appropriate and calm", "recommendation": "Avoid decorative words" },
      { "dimension": "Accessibility", "score": 93, "rationale": "Screen reader friendly", "recommendation": "Ensure color contrast on button" },
      { "dimension": "Specificity", "score": 95, "rationale": "Specific object named", "recommendation": "No changes needed" },
      { "dimension": "Actionability", "score": 95, "rationale": "Direct command CTA", "recommendation": "Ready for production" },
      { "dimension": "Confidence", "score": 94, "rationale": "Clear and trustworthy", "recommendation": "Ready for production" }
    ]
  }
}`;
}

export function buildVariationsPrompt(copy: string, context: string = ''): string {
  return `You are CopyCraft, a principal UX writer.
Generate three distinct, high quality UX copy variations for this interface text:
"${copy}"
Context: "${context || 'Standard interface'}"

Return JSON:
{
  "alternatives": [
    { "label": "Clear & Direct", "copy": "Variation 1", "score": 94, "reason": "Rationale for why this works", "tone": "Confident", "useCase": "High-urgency workflows" },
    { "label": "Empathetic & Supportive", "copy": "Variation 2", "score": 91, "reason": "Rationale for why this works", "tone": "Empathetic", "useCase": "Consumer onboarding" },
    { "label": "Ultra Concise", "copy": "Variation 3", "score": 95, "reason": "Rationale for why this works", "tone": "Minimal", "useCase": "Mobile dialogs" }
  ]
}`;
}
