---
title: "Context strategies: compaction, file memory, sub-agents"
module: "module-1"
moduleTitle: "Module 1: Prompt engineering basics"
duration: "40 min"
description: "When long agent runs hit the context wall—use compaction summaries, external files, or sub-agents to finish reliably."
tags: ["Agent", "Context", "Compaction", "Sub-agents"]
expert:
  name: "Nova, systems architect"
  model: "gpt-4o"
  intro: "Hi, I’m Nova—context budgets, files, fan-out 👋"
  systemPrompt: |
    You are Nova, advising on LLM context limits and mitigation patterns.
    Prefer paste-ready policy blocks for system prompts.
    English, ≤200 words unless deeper architecture review.
---

By chapter end you can:

> ✓ Explain how context limits show up in long agents  
> ✓ Pick among compaction, file memory, sub-agents (or blends)  
> ✓ Embed compaction triggers in system prompts  
> ✓ Sketch sub-agent splits that save tokens  

---

## Section 0: the hidden ceiling

Multi-step agents accumulate user turns, assistant thoughts, **and bulky tool payloads**. Past the window, you truncate, error, or quality-collapse.

> **Analogy:** whiteboard fills up—early notes get erased first.

---

## Section 1: why it breaks

Symptoms: forgets early constraints, output drifts, hard API errors, repeats tool calls after truncation.

```widget:before-after
{
  "title": "Plan vs panic",
  "subtitle": "Design context policy up front",
  "tabs": [
    {
      "label": "❌ No plan",
      "prompt": "Hope the model fits; react only when calls fail.",
      "analysis": "Long jobs die near the finish line—wasted work.",
      "type": "bad"
    },
    {
      "label": "✓ Proactive policy",
      "prompt": "Thresholds for compaction, files for state, split heavy branches.",
      "analysis": "Predictable completion path.",
      "type": "good"
    }
  ]
}
```

### Strategy overview

| Strategy | Idea | Best for |
|----------|------|----------|
| **Compaction** | Summarize → fresh thread | single-thread chains needing history |
| **File memory** | Read/write disk for facts | durable state across turns |
| **Sub-agents** | Delegate heavy branches | parallelizable subtasks |

---

## Section 2: compaction

When ~80% full (or vendor signal), emit structured summary, reopen thread.

Must capture: **goal**, **key decisions**, **done**, **todo**, **constraints**.

```
## Context policy
If you estimate >80% context used before the next tool call:
1) Emit:
<task_summary>
goal: …
completed: …
remaining: …
key_facts: …
constraints: …
</task_summary>
2) Tell the user to paste the summary into a new chat to continue.
```

```widget:before-after
{
  "title": "Summary granularity",
  "subtitle": "Too big vs too lossy",
  "tabs": [
    {
      "label": "❌ Dump entire logs",
      "prompt": "Paste all raw tool JSON into summary.",
      "analysis": "No real savings—window refills fast.",
      "type": "bad"
    },
    {
      "label": "✓ Lean summary + files",
      "prompt": "Keep decisions; park bloated payloads externally.",
      "analysis": "Thread stays small; details retrievable on demand.",
      "type": "good"
    }
  ]
}
```

Compaction loses detail—pair with **files** for raw artifacts.

---

## Section 3: file memory

Offload large facts to paths the agent rereads as needed.

Principles: write after each milestone; one concern per file; semantic names; update-in-place vs endless append.

```
## Memory files
task_notes.md — decisions + findings (timestamped bullets)
research.json — structured pulls {source, data, t}

If the active window feels tight:
- Reread task_notes.md
- Drop oldest chat turns beyond last 5 steps
```

---

## Section 4: sub-agents

Orchestrator plans; workers return **compressed** results only.

Principles: loose coupling, ≤500-token returns per worker, minimal tool sets per worker, isolate failures.

```
Main agent:
1) Decompose into 2–4 tasks
2) spawn_agent(task_spec)
3) Merge results; flag partial failures

Worker agent:
- ≤5 searches
- Return JSON {finding, confidence, sources}
- confidence low ⇒ say so, don’t guess
```

### Choosing

| Pattern | Pick |
|---------|------|
| Long single thread | compaction |
| Cross-session memory | files |
| Fan-out research | sub-agents |
| Research + artifacts | combo |

---

## Section 5: capstone exercise

```widget:prompt-practice
{
  "title": "Exercise: deep-research context plan",
  "instruction": "For a market-research agent (20–30 sources, ~30–50 tool calls, ~3k-word report):\n1) Pick strategy(ies) + why\n2) Write system-level context rules\n3) If sub-agents: roles, tools, output shapes, merge plan",
  "original": "Deep research agent hitting context limits; needs competitor/user/trend angles.",
  "scenarios": [
    { "emoji": "🗜️", "label": "Compaction", "description": "Summaries" },
    { "emoji": "📁", "label": "File memory", "description": "External state" },
    { "emoji": "🤖", "label": "Sub-agents", "description": "Fan-out work" }
  ],
  "placeholder": "1) Strategy…\n\n2) ## Context rules…\n\n3) Workers…",
  "hint": "Fan-out web searches + findings.md; coordinator keeps summaries only; compress at 80%.",
  "systemPrompt": "Score the plan (100): fit for 30–50 calls, actionable rules, worker boundaries & merges, failure handling—25 each. English ≤200 words."
}
```

---

## Chapter checklist

```widget:checklist
{
  "title": "Chapter 9 checklist",
  "id": "module-1-lesson-9-context",
  "items": [
    "I can name failure modes of context blow-ups",
    "I know when compaction / files / sub-agents apply",
    "I know the five summary buckets for compaction",
    "I finished the integrated context exercise"
  ]
}
```

---

> **Next up (when published):** Chapter 10 capstone ties the full prompt + agent stack together with an LLM-as-judge review.

---

**Previous** → [Designing agent tools](/lesson/module-1/08-agent-tools)  
**Next** → [Capstone project](/lesson/module-1/10-capstone)  
