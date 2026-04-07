---
title: "Agent prompts 101: what agents are, when to use them, core rules"
module: "module-1"
moduleTitle: "Module 1: Prompt engineering basics"
duration: "45 min"
description: "Separate single-turn prompts from tool-loop agents: pick the right problems, write tool specs, heuristics, and thinking cues in the system prompt."
tags: ["Agent", "Tools", "Heuristics", "LLM apps"]
expert:
  name: "Lin, agent architect"
  model: "gpt-4o"
  intro: "Hi, I’m Lin—agent boundaries, tool text, guardrails 👋"
  systemPrompt: |
    You are Lin, coaching agent-style system prompts vs plain chat.
    Favor concrete tool/heuristic snippets.
    English, ≤200 words unless deeper review requested.
---

By chapter end you can:

> ✓ Explain chat vs tool-loop agents in your own words  
> ✓ Decide agent-worthy tasks vs plain prompts  
> ✓ Apply three design pillars: agent POV, heuristics, interleaved thinking  
> ✓ Draft a starter agent system prompt with tools + rules  

**Note:** Full tool loops need APIs or agent platforms (Claude Code, Dify, n8n…). Here we focus on **prompt design**.

---

## Section 1: agent = model in a tool loop

Chat: one user turn → one model turn → done.  
Agent: **decide → call tool → read result → decide again** until done.

> **Analogy:** drop a slip at the door vs employee with laptop + files + email—keeps working with tools until the job closes.

```widget:before-after
{
  "title": "Chat vs agent",
  "subtitle": "Different operating modes",
  "tabs": [
    {
      "label": "💬 Chat prompt",
      "prompt": "Single exchange; only prompt contents; final text is the deliverable; cheap to retry.",
      "analysis": "Closed info, fixed path—Chapters 1–6 techniques apply.",
      "type": "neutral"
    },
    {
      "label": "🤖 Agent",
      "prompt": "Multi-step loops; fetches fresh info; intermediates are decisions; mistakes may have side effects.",
      "analysis": "Open info, dynamic path—needs tool clarity + operational rules.",
      "type": "neutral"
    }
  ]
}
```

---

## Section 2: when to agent

**Good signals (≥2):** clear goal, unknown path, needs live data, >5 dependent steps.  

**Poor fits:** fixed pipeline (use stepped chat), irreversible ops without human gates, trivial one-shot asks.

> Start chat-first; graduate to agents only when data/tools truly required.

```widget:before-after
{
  "title": "Default choice",
  "subtitle": "Agents everywhere vs judicious use",
  "tabs": [
    {
      "label": "❌ Agent for everything",
      "prompt": "Even fixed pipelines and tiny queries go through an agent.",
      "analysis": "Higher complexity, harder debug, unnecessary risk.",
      "type": "bad"
    },
    {
      "label": "✓ Right-sized tool",
      "prompt": "Fixed path → stepped chat. External info + long deps → agent.",
      "analysis": "Simplest fix wins engineering-wise.",
      "type": "good"
    }
  ]
}
```

---

## Section 3: three design pillars

### Pillar 1 — Think like the agent

Only system text + tool cards exist. If **you** can’t choose tools/param shapes, neither can it.  
Quality bar: **clear names**, **non-overlapping scopes**, complete param/return docs.

```widget:before-after
{
  "title": "Tool descriptions",
  "subtitle": "Vague vs crisp",
  "tabs": [
    {
      "label": "❌ Overlap / vagueness",
      "prompt": "tool1: search stuff\ntool2: find content\ntool3: get data",
      "analysis": "Random tool choice or thrash—classic failure mode.",
      "type": "bad"
    },
    {
      "label": "✓ Scoped tools",
      "prompt": "search_web: public web\nquery_internal_db: CRM records\nread_file: uploaded paths",
      "analysis": "One obvious pick per task shape.",
      "type": "good"
    }
  ]
}
```

### Pillar 2 — Heuristics (explicit “common sense”)

Spell stop conditions, caps, retry limits, confirm-before-delete, honesty about uncertainty.

```
## Operating rules
1. Stop searching once you have a clear answer.
2. Before deletes/sends/DB writes—tell user and wait.
3. ≤10 tool calls per task unless user expands scope.
4. Tool errors: retry ≤2, then explain failure.
5. If unsure: state confidence—don’t fabricate.
```

```widget:before-after
{
  "title": "Heuristic specificity",
  "subtitle": "“Be careful” vs executable policy",
  "tabs": [
    {
      "label": "❌ Vague",
      "prompt": "Be cautious; handle issues well.",
      "analysis": "Unenforceable—model improvises at the worst times.",
      "type": "bad"
    },
    {
      "label": "✓ Concrete",
      "prompt": "Confirm before delete; ≤2 retries; ≤10 calls.",
      "analysis": " Observable, testable, debuggable.",
      "type": "good"
    }
  ]
}
```

### Pillar 3 — Prompt reflection between tools

```
## Thinking cadence
1. Open with a 1–2 sentence plan.
2. After each tool result: sanity-check vs goal.
3. On surprises: diagnose before continuing.
4. Before “done”: verify all requirements.
```

Interleaved thinking (where supported) reinforces “read tool output *before* next call.”

---

## Section 4: template assembly

```
# Role
You are a [task] agent helping users [outcome].

# Tools
## search_web
Purpose: public web lookup
Use: news, stats, public docs
Args: query (str)
Returns: [{title, snippet, url}]

## read_file
Purpose: user-uploaded files
Use: referenced attachments
Args: filename (str)
Returns: text or error string

# Operating rules
(plan, caps, confirmations, retries)

# Thinking rules
(post-tool evaluation, conflicts, uncertainty)

# Don’t
(no hallucinations, no silent irreversible acts)
```

> **Least privilege:** grant the minimal tool set for the job.

---

## Section 5: failure modes

1. **Search loops** — add hard stop + call budget.  
2. **Confident wrongness** — require post-tool critique + source hierarchy.  
3. **Early irreversible actions** — list sensitive tools + confirmation gate.

---

## Section 6: exercises

### Exercise 1: agent or chat?

```widget:prompt-practice
{
  "title": "Exercise 1: agent fit",
  "instruction": "For each, choose **agent** or **chat** + why:\nA. Translate product blurb CN→EN\nB. Industry briefing from many fresh web sources\nC. Prioritize needs from pasted interview transcript only\nD. Poll competitor site + email on changes (2 tools, recurring)",
  "original": "A translation\nB research crawl\nC structured extraction\nD monitor+email",
  "scenarios": [
    { "emoji": "💬", "label": "Transform", "description": "Rewrite / translate" },
    { "emoji": "🔍", "label": "Gather", "description": "Multi-source research" },
    { "emoji": "⚙️", "label": "Automation", "description": "Scheduled tools" }
  ],
  "placeholder": "A: …\nB: …\nC: …\nD: … (note risk)",
  "hint": "A chat; B agent; C stepped chat; D agent + human gate on email.",
  "systemPrompt": "Score fit choices (100): path/data awareness, risk on D—25 each. English ≤150 words."
}
```

---

### Exercise 2: competitor research agent prompt

```widget:prompt-practice
{
  "title": "Exercise 2: competitor researcher",
  "instruction": "Write system prompt: role → tools (clear scopes) → heuristics → thinking → report shape. Tools: search_web, write_report.",
  "original": "Goal: given competitor names, synthesize features, pricing, recent moves into structured report.",
  "scenarios": [
    { "emoji": "🔍", "label": "Competitive intel", "description": "Features / pricing / news" },
    { "emoji": "📊", "label": "Market lens", "description": "Sizing / trends" },
    { "emoji": "📰", "label": "Briefings", "description": "News digests" }
  ],
  "placeholder": "# Role\n…\n# Tools\n## search_web\n…\n## write_report\n…\n# Rules\n…\n# Thinking\n…\n# Report format\n…",
  "hint": "Cap searches, cite shaky data as tentative, require plan upfront, structured final sections.",
  "systemPrompt": "Score agent prompt (100): tool separation, heuristics (stops/limits), reflection rules, report contract—25 each. English ≤200 words."
}
```

---

## Chapter checklist

```widget:checklist
{
  "title": "Chapter 7 checklist",
  "id": "module-1-lesson-7-agent",
  "items": [
    "I contrast chat vs tool-loop agents clearly",
    "I pick agent vs chat using goal/path/data heuristics",
    "I apply POV + heuristics + thinking rules",
    "I drafted Exercise 2’s full agent system prompt"
  ]
}
```

---

> **Next:** Chapter 8—tool card grammar (four fields, naming, overlap).

---

## Appendix: Exercise 1 answers

- **A** Chat.  
- **B** Agent (multi-source, evolving path).  
- **C** Chat + steps (all text provided).  
- **D** Agent but **confirm sends**—irreversible.  

---

**Previous** → [System prompts in production](/lesson/module-1/06-system-prompt-production)  
**Next** → [Designing agent tools](/lesson/module-1/08-agent-tools)
