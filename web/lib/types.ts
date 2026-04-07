// ─── Widget Protocol Types ────────────────────────────────────────

export type WidgetType =
  | "before-after"
  | "prompt-practice"
  | "checklist"
  | "quiz"
  | "diagram"
  | "model-compare"
  | "model-iterate"
  | "card-ref"
  // ── Agent Class 交互组件 ──────────────────────
  | "callout"
  | "sandbox"
  | "ai-chat"
  | "scenario-eval"
  | "code-playground"

export interface WidgetConfig {
  type: WidgetType
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

// Before/After comparison widget
export interface BeforeAfterConfig {
  title: string
  subtitle?: string
  tabs: Array<{
    label: string
    prompt: string
    analysis: string
    type: "good" | "bad" | "neutral"
  }>
}

// Prompt practice widget
export interface PromptPracticeConfig {
  title: string
  instruction: string
  original: string
  scenarios: Array<{
    emoji: string
    label: string
    description: string
  }>
  placeholder: string
  hint?: string
  systemPrompt?: string
}

// Checklist widget
export interface ChecklistConfig {
  title: string
  id: string
  items: string[]
}

// Quiz widget
export interface QuizConfig {
  title: string
  questions: Array<{
    id: string
    text: string
    type: "single" | "multiple"
    options: Array<{ text: string; correct: boolean }>
    explanation?: string
  }>
  scoring?: { correct: number; wrong: number }
}

// Diagram / SVG widget
export interface DiagramConfig {
  title?: string
  svg: string
  caption?: string
  height?: number
}

// Model comparison
export interface ModelCompareConfig {
  mode: "side-by-side" | "sequential"
  prompt: string
  models: string[]
  systemPrompt?: string
}

// ── Callout ────────────────────────────────────────────────────────
export interface CalloutConfig {
  variant?: "blue" | "green" | "amber" | "red"
  title?: string
  body: string
}

// ── Sandbox ────────────────────────────────────────────────────────
export interface SandboxParam {
  id: string
  label: string
  min: number
  max: number
  step?: number
  default: number
  hint?: string
  fmt?: string
}

export interface SandboxCheckbox {
  id: string
  label: string
  default?: boolean
  hint?: string
}

export interface SandboxMetric {
  label: string
  expr: string
  fmt?: string
  warnAbove?: number
  dangerAbove?: number
}

export interface SandboxGrowth {
  title?: string
  steps: string       // expr resolving to number of rows
  labelExpr: string   // expr for the row label (has `i` in scope)
  valueExpr: string   // expr for the bar value
  maxExpr: string     // expr for the max value (determines bar width)
  fmt?: string
}

export interface SandboxConfig {
  title?: string
  hint?: string
  params: SandboxParam[]
  checkboxes?: SandboxCheckbox[]
  metrics: SandboxMetric[]
  growth?: SandboxGrowth
}

// ── AI Chat ────────────────────────────────────────────────────────
export interface AiChatConfig {
  title?: string
  hint?: string
  welcome?: string
  systemPrompt?: string
  placeholder?: string
  maxHeight?: number
  maxTokens?: number
}

// ── Scenario Eval ──────────────────────────────────────────────────
export interface ScenarioEvalConfig {
  title?: string
  description?: string
  placeholder?: string
  buttonLabel?: string
  systemPrompt?: string
  dimensions?: string[]
}

// ── Code Playground ───────────────────────────────────────────────
export interface CodePlaygroundSlot {
  id: string
  placeholder?: string
  default?: string
  tooltip?: string
}

export interface CodePlaygroundFile {
  path: string
  code: string
  language?: string
  slots?: CodePlaygroundSlot[]
  active?: boolean
}

export interface CodePlaygroundConfig {
  title?: string
  hint?: string
  files: CodePlaygroundFile[]
  systemPrompt?: string
  mode?: "sandbox" | "ai"
  autoRun?: boolean
  outputHeight?: number
}

// ─── Content Types ────────────────────────────────────────────────

export interface TocItem {
  id: string
  text: string
  level: number
}

export interface LessonMeta {
  title: string
  module: string
  moduleTitle: string
  duration: string
  description?: string
  expert?: ExpertConfig
  tags?: string[]
}

export interface ExpertConfig {
  name: string
  avatar?: string
  model?: string
  systemPrompt: string
  intro?: string
}
