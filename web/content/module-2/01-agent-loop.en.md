---
title: "Agent loop: what keeps an agent running?"
module: "module-2"
moduleTitle: "Module 2: Agent engineering"
duration: "20 min"
description: "Understand the core runtime of agents—the loop architecture, the observe→reason→act→stop mental model, and how sandboxes and code labs make token growth concrete."
tags: ["Agent loop", "Stopping", "Context growth", "Beginner"]
expert:
  name: "Kira, agent architect"
  model: "gpt-4o"
  intro: "Hi, I’m Kira. I help with agent systems—loops, stop conditions, and context growth. Ask me anything 👋"
  systemPrompt: |
    You are Kira, a technical advisor for AI agent architecture.
    You help learners understand agent loops and the Observe → Think → Act → Stop pattern.
    Tone: precise but friendly; use short analogies when helpful.
    Respond in English, under 200 words.
    Prefer concrete numbers or mini-examples.
    If a concept is fuzzy, give a one-line definition first, then expand.
---

By the end of this lesson you will:

> ✓ Name the four loop stages (observe, reason, act, stop)  
> ✓ Explain why context grows linearly with turns  
> ✓ Design reasonable stop conditions  
> ✓ Tune the sandbox and feel how parameters change behavior  

---

## 1 · Concept: how is an agent different from a normal program?

```widget:before-after
{
  "title": "Three execution styles",
  "subtitle": "Agents hand judgment to an LLM for flexibility, but you lose direct control of the exact path.",
  "tabs": [
    {
      "label": "Human driver",
      "prompt": "See red light\n  → decide: stop\n  → brake\n  → see green\n  → decide: go\n  → accelerate\n\nRepeat until you arrive",
      "analysis": "Humans keep sensing, deciding, and acting until the task is done. Each step adapts to surprises.",
      "type": "neutral"
    },
    {
      "label": "Traditional program",
      "prompt": "Inputs\n  → fixed branches\n  → compute\n  → output\n\nRuns once; deterministic",
      "analysis": "Classic code is linear: same input → same output. No autonomy, no fuzzy intent, no feedback loop.",
      "type": "bad"
    },
    {
      "label": "AI agent",
      "prompt": "Observe (tools, user)\n  → LLM reasons\n  → act (call tools)\n  → new observation\n  → repeat\n  → stop when criteria met → answer",
      "analysis": "Agents let the LLM plan steps for messy tasks, but paths are unpredictable—stop conditions prevent runaway loops.",
      "type": "good"
    }
  ]
}
```

**Key idea:** the defining difference is the **loop**—agents don’t “run once and exit”; they repeatedly observe, reason, act, and observe again until a stop condition fires.

That’s why agents can tackle open-ended work (“research competitors and draft a memo”), and also why you can’t perfectly predict steps or token spend up front.

---

## 2 · Diagram: four stages of the agent loop

```widget:diagram
{
  "title": "Core agent loop",
  "caption": "Each turn: observe → context grows → the LLM thinks → actions run. Stopping rules are the only intentional exit.",
  "svg": "<svg viewBox='0 0 720 340' xmlns='http://www.w3.org/2000/svg'><defs><marker id='al' viewBox='0 0 10 10' refX='8' refY='5' markerWidth='6' markerHeight='6' orient='auto-start-reverse'><path d='M2 1L8 5L2 9' fill='none' stroke='context-stroke' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/></marker></defs><g class='c-blue'><rect x='30' y='70' rx='12' width='140' height='75' stroke-width='0.5'/><text class='th' x='100' y='100' text-anchor='middle'>Observe</text><text class='ts' x='100' y='118' text-anchor='middle'>Read observation</text></g><g class='c-blue'><rect x='210' y='70' rx='12' width='140' height='75' stroke-width='0.5'/><text class='th' x='280' y='100' text-anchor='middle'>Context</text><text class='ts' x='280' y='118' text-anchor='middle'>Merged into prompt</text></g><g class='c-purple'><rect x='390' y='70' rx='12' width='140' height='75' stroke-width='0.5'/><text class='th' x='460' y='100' text-anchor='middle'>Think</text><text class='ts' x='460' y='118' text-anchor='middle'>LLM decides</text></g><g class='c-teal'><rect x='570' y='70' rx='12' width='120' height='75' stroke-width='0.5'/><text class='th' x='630' y='100' text-anchor='middle'>Act</text><text class='ts' x='630' y='118' text-anchor='middle'>Execute</text></g><line x1='170' y1='107' x2='208' y2='107' stroke='var(--s)' stroke-width='1.5' marker-end='url(#al)'/><line x1='350' y1='107' x2='388' y2='107' stroke='var(--s)' stroke-width='1.5' marker-end='url(#al)'/><line x1='530' y1='107' x2='568' y2='107' stroke='var(--s)' stroke-width='1.5' marker-end='url(#al)'/><path d='M630 147 C630 230 100 230 100 147' fill='none' stroke='var(--s)' stroke-width='1.5' stroke-dasharray='6 4' marker-end='url(#al)'/><text class='ts' x='365' y='222' text-anchor='middle' style='font-style:italic'>Loop</text><g class='c-gray'><rect x='280' y='265' rx='8' width='180' height='45' stroke-width='0.5'/><text class='th' x='370' y='285' text-anchor='middle'>Stop</text><text class='ts' x='370' y='302' text-anchor='middle'>signal / max_turns</text></g><line x1='460' y1='145' x2='460' y2='240' stroke='var(--t)' stroke-width='1' stroke-dasharray='4 3'/><line x1='460' y1='240' x2='462' y2='265' stroke='var(--t)' stroke-width='1' marker-end='url(#al)'/><text class='ts' x='490' y='258' style='fill:var(--t)'>Exit?</text></svg>"
}
```

**Context every turn:** system text stays fixed, while each turn adds fresh observations and assistant replies.

> **Context at turn N ≈ system_tokens + N × (obs_per_turn + asst_per_turn)**

Without a stop condition, that sum keeps growing until it hits a hard limit.

:::callout{variant="amber" title="Three lines of defense for stopping"}
1. **Model-issued stop signal** — the LLM explicitly signals completion.  
2. **`max_turns` ceiling** — hard cap on iterations (safety net).  
3. **External abort** — timeout, user cancel, fatal errors.

You usually want (1) + (2). Relying on only one invites infinite loops or wasted tokens.
:::

---

## 3 · Sandbox: feel context growth and stop rules

Use the sliders below to see how turns and stop settings change final context.

```widget:sandbox
{
  "title": "Agent loop sandbox",
  "hint": "Move sliders and toggles; watch the metrics update live.",
  "params": [
    { "id": "maxTurns", "label": "max_turns", "min": 1, "max": 30, "default": 8, "step": 1 },
    { "id": "stopAt", "label": "natural completion turn", "min": 1, "max": 20, "default": 3, "step": 1, "hint": "Turn where the task would finish if stop detection works" },
    { "id": "sysTok", "label": "system_tokens", "min": 100, "max": 2000, "default": 400, "step": 50, "fmt": "auto" },
    { "id": "obsTok", "label": "obs_per_turn", "min": 50, "max": 1000, "default": 280, "step": 10, "fmt": "auto" },
    { "id": "asstTok", "label": "asst_per_turn", "min": 50, "max": 600, "default": 160, "step": 10, "fmt": "auto" }
  ],
  "checkboxes": [
    { "id": "hasStop", "label": "Enable stop-signal detection", "default": true, "hint": "If off, the agent never self-stops when work is done" },
    { "id": "simError", "label": "Simulate tool error on turn 5 (+500 tokens)", "default": false }
  ],
  "metrics": [
    {
      "label": "Actual turns",
      "expr": "hasStop ? (stopAt < maxTurns ? stopAt : maxTurns) : maxTurns",
      "fmt": "auto"
    },
    {
      "label": "Final context",
      "expr": "sysTok + (hasStop ? (stopAt < maxTurns ? stopAt : maxTurns) : maxTurns) * (obsTok + asstTok) + simError * (5 <= (hasStop ? (stopAt < maxTurns ? stopAt : maxTurns) : maxTurns) ? 500 : 0)",
      "fmt": "k",
      "warnAbove": 80000,
      "dangerAbove": 115000
    },
    {
      "label": "% of 128k window",
      "expr": "(sysTok + (hasStop ? (stopAt < maxTurns ? stopAt : maxTurns) : maxTurns) * (obsTok + asstTok) + simError * (5 <= (hasStop ? (stopAt < maxTurns ? stopAt : maxTurns) : maxTurns) ? 500 : 0)) / 128000 * 100",
      "fmt": "%",
      "warnAbove": 60,
      "dangerAbove": 90
    },
    {
      "label": "Wasted turns",
      "expr": "hasStop ? 0 : (maxTurns > stopAt ? maxTurns - stopAt : 0)",
      "fmt": "auto",
      "warnAbove": 1,
      "dangerAbove": 5
    }
  ],
  "growth": {
    "title": "Context per turn (incl. waste)",
    "steps": "hasStop ? (stopAt < maxTurns ? stopAt : maxTurns) : maxTurns",
    "labelExpr": "i",
    "valueExpr": "sysTok + i * (obsTok + asstTok) + simError * (i >= 5 ? 500 : 0)",
    "maxExpr": "128000",
    "fmt": "k"
  }
}
```

### Try these experiments

1. **Disable stop detection** — actual turns jump from 3→`max_turns`; wasted turns > 0 even though work finished early.  
2. **Disable stop + raise `max_turns` to 20** — cost explodes; this is why caps matter.  
3. **Raise `stopAt` (e.g., 10) without stop detection** — fewer “wasted” turns but larger contexts.  
4. **Toggle simulated tool error** — error text enters context (+500 tok) from turn 5 onward.

---

## 4 · Lab: run a real multi-turn loop

This playground calls a real model via `callLLM`. Edit parameters, hit Run, and watch tokens climb turn by turn.

```widget:code-playground
{
  "title": "Agent loop lab",
  "hint": "Tune parameters and Run to watch multi-turn calls and token growth",
  "mode": "sandbox",
  "files": [
    {
      "path": "agent.js",
      "active": true,
      "code": "import { getConfig } from './config.js';\nimport { trackContext } from './context.js';\n\nconst config = getConfig();\nconsole.log('🚀 Agent loop start');\nconsole.log('max turns:', config.maxTurns);\nconsole.log('stop check:', config.checkStop ? 'on' : 'off');\nconsole.log('');\n\nconst steps = [\n  'Step 1: list 3 comparison dimensions (<=20 chars each)',\n  'Step 2: score dimension 1 for two cities (1-10)',\n  'Step 3: score dimensions 2 and 3',\n  'Step 4: summarize scores. End with [DONE] Recommended city: ...',\n  'Step 5: what else matters? End with [DONE] done',\n];\n\nconst messages = [\n  { role: 'system', content: config.systemPrompt },\n  { role: 'user', content: config.task }\n];\n\ntrackContext('init', messages);\n\nfor (let turn = 0; turn < config.maxTurns; turn++) {\n  console.log(`\\n━━━ Turn ${turn + 1}/${config.maxTurns} ━━━`);\n\n  const response = await callLLM(messages);\n  messages.push({ role: 'assistant', content: response.content });\n  console.log('Agent:', response.content);\n  trackContext(`Turn ${turn + 1}`, messages);\n\n  if (config.checkStop && response.content.includes('[DONE]')) {\n    console.log('\\n✓ [DONE] detected — stopping');\n    break;\n  }\n\n  if (turn === config.maxTurns - 1) {\n    console.log('\\n⚠ Hit max_turns — forced stop');\n    break;\n  }\n\n  const nextStep = steps[turn + 1] || 'Continue. Finish with [DONE].';\n  messages.push({ role: 'user', content: nextStep });\n  console.log('Next:', nextStep);\n}",
      "slots": [
        {
          "id": "maxTurns",
          "default": "5",
          "tooltip": "Try 1 (only step 1), 3 (midway), 5 (full run), 8 (see waste)"
        },
        {
          "id": "checkStop",
          "default": "true",
          "tooltip": "Set false to spin until max_turns even after [DONE]"
        },
        {
          "id": "task",
          "default": "'Compare Shenzhen vs Hangzhou for software engineers. Work step by step.'",
          "tooltip": "Swap in your own multi-step question"
        }
      ]
    },
    {
      "path": "config.js",
      "code": "export function getConfig() {\n  return {\n    systemPrompt: {{systemPrompt}},\n    maxTurns: {{maxTurns}},\n    checkStop: {{checkStop}},\n    task: {{task}},\n  };\n}",
      "slots": [
        {
          "id": "systemPrompt",
          "default": "'You compare cities. Answer only the current step, <=50 words. Append [DONE] when fully finished.'",
          "tooltip": "Keeps the model from solving everything in one reply"
        },
        {
          "id": "maxTurns",
          "default": "5",
          "tooltip": "Hard cap on loop iterations"
        },
        {
          "id": "checkStop",
          "default": "true",
          "tooltip": "Whether to stop on [DONE]"
        },
        {
          "id": "task",
          "default": "'Compare Shenzhen vs Hangzhou for software engineers. Work step by step.'",
          "tooltip": "User task string"
        }
      ]
    },
    {
      "path": "context.js",
      "code": "export function trackContext(label, messages) {\n  const full = messages.map(m => m.content).join('');\n  const info = countTokens(full);\n  const bar = '█'.repeat(Math.min(Math.round(info.tokens / 50), 30));\n  console.log(`📋 [${label}] ${messages.length} msgs | ~${info.tokens} tok ${bar}`);\n}"
    }
  ],
  "outputHeight": 360
}
```

### Experiments to run

| Change | What you should see | Lesson |
|--------|---------------------|--------|
| `maxTurns = 1` | Only step 1 executes | Too small truncates multi-step jobs |
| `maxTurns = 3` | Stops before final summary | Note context at stop |
| `checkStop = false` | Keeps going after `[DONE]` | Pure token waste |
| Easier task | `[DONE]` on turn 1 | Simple tasks need fewer loops |
| 📋 logs | Bars grow each turn | Linear context growth |

---

## 5 · Quiz: check your understanding

```widget:quiz
{
  "title": "Agent loop quiz",
  "questions": [
    {
      "id": "q1",
      "text": "An agent finishes the task, but `check_stop = false` and `max_turns = 20`. What happens?",
      "type": "single",
      "options": [
        { "text": "It stops immediately because the task is done", "correct": false },
        { "text": "It keeps looping until `max_turns` or an external stop", "correct": true },
        { "text": "The LLM always emits a stop signal automatically", "correct": false }
      ],
      "explanation": "Loops only honor explicit rules. “Task done” is invisible unless you detect a stop token/signal."
    },
    {
      "id": "q2",
      "text": "Agent: `max_turns = 5`, `system_tokens = 800`, `obs_per_turn = 400`, `asst_per_turn = 200`. Context after turn 5?",
      "type": "single",
      "options": [
        { "text": "max_turns × (obs+asst) = 3,000", "correct": false },
        { "text": "system + max_turns × (obs+asst) = 800 + 5×600 = 3,800", "correct": true },
        { "text": "Only last turn: obs + asst = 600", "correct": false }
      ],
      "explanation": "Context is cumulative: system prompt plus every prior observation and reply."
    },
    {
      "id": "q3",
      "text": "Most robust production setup?",
      "type": "single",
      "options": [
        { "text": "`max_turns` alone is enough", "correct": false },
        { "text": "Stop-signal alone is enough", "correct": false },
        { "text": "Stop signal + `max_turns` together", "correct": true }
      ],
      "explanation": "Stop signals save money; `max_turns` prevents runaway behavior if detection fails."
    }
  ]
}
```

---

## Summary

- Agent = LLM + tools + **loop**  
- Each turn: **Observe → Context → Think → Act**  
- Context grows ~linearly: `system + turns × (obs + asst)`  
- Pair **stop detection** with **`max_turns`**  
- `max_turns` is a guardrail, not a substitute for “done” detection  

```widget:checklist
{
  "title": "Lesson 1 checklist",
  "id": "module-2-lesson-01-en",
  "items": [
    "I can contrast agents with one-shot programs using the loop idea",
    "I can name the four loop stages",
    "I can estimate context at turn N with the formula",
    "I know the three stop mechanisms",
    "I explored the sandbox parameters",
    "I ran the code lab and watched token growth",
    "I answered all three quiz questions"
  ]
}
```

---

**Next** → [Lesson 2 · Context management & compression](/lesson/module-2/02-context-compression)
