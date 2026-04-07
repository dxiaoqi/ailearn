import { BeforeAfterWidget } from "./BeforeAfterWidget"
import { ChecklistWidget } from "./ChecklistWidget"
import { DiagramWidget } from "./DiagramWidget"
import { PromptPracticeWidget } from "./PromptPracticeWidget"
import { QuizWidget } from "./QuizWidget"
import { CalloutWidget } from "./CalloutWidget"
import { SandboxWidget } from "./SandboxWidget"
import { AiChatWidget } from "./AiChatWidget"
import { ScenarioEvalWidget } from "./ScenarioEvalWidget"
import { CodePlaygroundWidget } from "./CodePlaygroundWidget"
import type { MarkdownWidgetUi } from "@/lib/i18n/messages"
import type {
  BeforeAfterConfig,
  ChecklistConfig,
  DiagramConfig,
  PromptPracticeConfig,
  QuizConfig,
  CalloutConfig,
  SandboxConfig,
  AiChatConfig,
  ScenarioEvalConfig,
  CodePlaygroundConfig,
} from "@/lib/types"

interface Props {
  type: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: Record<string, any>
  children?: React.ReactNode
  widgetsUi: MarkdownWidgetUi
}

export function WidgetRenderer({ type, config, children, widgetsUi }: Props) {
  switch (type) {
    case "before-after":
      return (
        <BeforeAfterWidget config={config as BeforeAfterConfig} ui={widgetsUi.beforeAfter} />
      )
    case "checklist":
      return (
        <ChecklistWidget config={config as ChecklistConfig} ui={widgetsUi.checklist} />
      )
    case "diagram":
      return <DiagramWidget config={config as DiagramConfig} />
    case "prompt-practice":
      return (
        <PromptPracticeWidget config={config as PromptPracticeConfig} ui={widgetsUi.promptPractice} />
      )
    case "quiz":
      return <QuizWidget config={config as QuizConfig} ui={widgetsUi.quiz} />
    case "callout":
      return <CalloutWidget config={config as CalloutConfig}>{children}</CalloutWidget>
    case "sandbox":
      return <SandboxWidget config={config as SandboxConfig} ui={widgetsUi.sandbox} />
    case "ai-chat":
      return (
        <AiChatWidget config={config as AiChatConfig} ui={widgetsUi.aiChat}>
          {children}
        </AiChatWidget>
      )
    case "scenario-eval":
      return (
        <ScenarioEvalWidget config={config as ScenarioEvalConfig} ui={widgetsUi.scenarioEval}>
          {children}
        </ScenarioEvalWidget>
      )
    case "code-playground":
      return (
        <CodePlaygroundWidget config={config as CodePlaygroundConfig} ui={widgetsUi.codePlayground} />
      )
    default:
      return (
        <div
          className="my-4 rounded-lg px-4 py-3 text-xs font-mono"
          style={{
            background: "var(--color-background-warning)",
            border: "0.5px solid var(--color-border-warning)",
            color: "var(--color-text-warning)",
          }}
        >
          Unknown widget type: <strong>{type}</strong>
        </div>
      )
  }
}
