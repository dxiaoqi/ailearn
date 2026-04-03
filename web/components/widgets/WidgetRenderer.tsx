import { BeforeAfterWidget } from "./BeforeAfterWidget"
import { ChecklistWidget } from "./ChecklistWidget"
import { DiagramWidget } from "./DiagramWidget"
import { PromptPracticeWidget } from "./PromptPracticeWidget"
import { QuizWidget } from "./QuizWidget"
import { CalloutWidget } from "./CalloutWidget"
import { SandboxWidget } from "./SandboxWidget"
import { AiChatWidget } from "./AiChatWidget"
import { ScenarioEvalWidget } from "./ScenarioEvalWidget"
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
} from "@/lib/types"

interface Props {
  type: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: Record<string, any>
  children?: React.ReactNode
}

export function WidgetRenderer({ type, config, children }: Props) {
  switch (type) {
    case "before-after":
      return <BeforeAfterWidget config={config as BeforeAfterConfig} />
    case "checklist":
      return <ChecklistWidget config={config as ChecklistConfig} />
    case "diagram":
      return <DiagramWidget config={config as DiagramConfig} />
    case "prompt-practice":
      return <PromptPracticeWidget config={config as PromptPracticeConfig} />
    case "quiz":
      return <QuizWidget config={config as QuizConfig} />
    case "callout":
      return <CalloutWidget config={config as CalloutConfig}>{children}</CalloutWidget>
    case "sandbox":
      return <SandboxWidget config={config as SandboxConfig} />
    case "ai-chat":
      return <AiChatWidget config={config as AiChatConfig}>{children}</AiChatWidget>
    case "scenario-eval":
      return <ScenarioEvalWidget config={config as ScenarioEvalConfig}>{children}</ScenarioEvalWidget>
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
