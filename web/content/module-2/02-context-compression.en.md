---
title: "Context management & compression: why contexts blow up—and fixes"
module: "module-2"
moduleTitle: "Module 2: Agent engineering"
duration: "25 min"
description: "See why context grows linearly, compare four strategies (none, sliding window, summarization, hybrid), and trade off retention vs tokens using the sandbox and lab."
tags: ["Context", "Compression", "Sliding window", "Summary", "Intermediate"]
expert:
  name: "Leo, context advisor"
  model: "gpt-4o"
  intro: "Hi, I’m Leo. I focus on context sizing, sliding windows, summaries, and hybrids—ask anytime 👋"
  systemPrompt: |
    You are Leo, a technical advisor for LLM context management.
    You help learners understand why context grows and how to trade off the four compression strategies.
    Use concrete token numbers; compare strategies with short numeric examples.
    Reply in English, under 200 words.
    When asked “which is best,” steer toward task shape—not a single universal answer.
---

By the end of this lesson:

> ✓ Estimate context at any turn and spot ceiling risk  
> ✓ Explain the four strategies and what information you lose  
> ✓ Pick a strategy for a given task  
> ✓ Compare token savings in the sandbox  

**Prerequisite:** Lesson 1 · Agent loop  

---

## 1 · Why context always threatens to blow up

From lesson 1:

> **Context at turn N ≈ system_tokens + N × (obs_per_turn + asst_per_turn)**

Example: system = 400, obs = 280, asst = 160 → +440 tokens per turn.

| Turn | Context | % of 128k |
|------|---------|-----------|
| 1 | 840 | 0.7% |
| 5 | 2,600 | 2% |
| 20 | 9,200 | 7.2% |
| 50 | 22,400 | 17.5% |

If obs jumps to 800 (big search snippets):

| Turn | Context | % of 128k |
|------|---------|-----------|
| 20 | 19,600 | **15.3%** |
| 50 | 48,400 | **37.8%** |
| 100 | 96,400 | **75.3%** |
| 130 | 125,200 | **97.8%** |

**Without compression, every agent eventually hits the ceiling**—only a question of when.

---

### Four strategies

```widget:before-after
{
  "title": "Four context strategies",
  "subtitle": "No universal winner—ask whether early history still matters for later reasoning.",
  "tabs": [
    {
      "label": "No compression",
      "prompt": "Keep full history\n\n[system]  400 tok\n[turn 1]  440 tok\n...\n[turn N]  440 tok\n\ntotal = 400 + N × 440\nlinear growth",
      "analysis": "Information loss: none. Implementation: trivial.\nFit: short runs (<10 turns), budgets far below the cap.\nRisk: cost grows linearly; you eventually truncate.",
      "type": "neutral"
    },
    {
      "label": "Sliding window",
      "prompt": "Keep only last K turns\n\n[system] always kept\n[turn 1..N-K] dropped\n[turn N-K+1..N] kept\n\ntotal ≈ 400 + K × 440 (flat)",
      "analysis": "Loss: early turns vanish (e.g., user prefs from turn 1).\nImplementation: easy (slice the array).\nFit: chit-chat where early text doesn’t matter.\nRisk: the model “forgets” crucial early facts.",
      "type": "bad"
    },
    {
      "label": "Summarize",
      "prompt": "LLM compresses early history into one summary\n\n[system] 400\n[summary] 300 ← replaces many turns\n[last few turns] verbatim",
      "analysis": "Loss: fine detail (summaries drop nuance).\nImplementation: medium (extra LLM call).\nFit: long jobs needing early semantics, not raw text.\nCost: summary tokens + quality variance.",
      "type": "good"
    },
    {
      "label": "Hybrid",
      "prompt": "Summary + keep last K turns (common default)\n\n[system]\n[summary of early]\n[last K turns verbatim]",
      "analysis": "Loss: lowest among aggressive strategies—semantics in summary, details in recent turns.\nImplementation: harder (when to summarize, windowing).\nFit: most product agents today.",
      "type": "good"
    }
  ]
}
```

**Takeaway:** pick by **does early history still matter for the next steps?**

- Yes → summary or hybrid  
- No → sliding window  
- Few turns → often no compression  

---

## 2 · Diagram: before / after compression

```widget:diagram
{
  "title": "Growth vs hybrid compression",
  "caption": "Left: unbounded linear stacks toward 128k. Right: after turn 4 compression replaces old history with a flat summary block; only the last K turns grow.",
  "svg": "<svg viewBox='0 0 720 340' xmlns='http://www.w3.org/2000/svg'><text class='th' x='170' y='20' text-anchor='middle'>No compression</text><text class='th' x='540' y='20' text-anchor='middle'>Hybrid (summary + K)</text><line x1='355' y1='8' x2='355' y2='305' stroke='var(--b)' stroke-width='0.5' stroke-dasharray='4 3'/><g transform='translate(20,30)'><line x1='40' y1='260' x2='310' y2='260' stroke='var(--s)' stroke-width='1'/><line x1='40' y1='0' x2='40' y2='260' stroke='var(--s)' stroke-width='1'/><text class='ts' x='32' y='265' text-anchor='end'>0</text><text class='ts' x='175' y='280' text-anchor='middle'>Turn</text><line x1='40' y1='10' x2='310' y2='10' stroke='var(--color-text-danger)' stroke-width='0.5' stroke-dasharray='6 3'/><text class='ts' x='312' y='14' style='fill:var(--color-text-danger);font-size:10px'>128k</text><g class='c-purple'><rect x='50' y='245' width='36' height='15' rx='3' stroke-width='0.5'/><text class='ts' x='68' y='256' text-anchor='middle' style='font-size:8px'>sys</text></g><g class='c-blue'><rect x='98' y='220' width='36' height='40' rx='3' stroke-width='0.5'/><text class='ts' x='116' y='244' text-anchor='middle' style='font-size:9px'>R4</text></g><g class='c-blue'><rect x='146' y='170' width='36' height='90' rx='3' stroke-width='0.5'/><text class='ts' x='164' y='220' text-anchor='middle' style='font-size:9px'>R8</text></g><g class='c-blue'><rect x='194' y='115' width='36' height='145' rx='3' stroke-width='0.5'/><text class='ts' x='212' y='194' text-anchor='middle' style='font-size:9px'>R12</text></g><g class='c-blue'><rect x='242' y='55' width='36' height='205' rx='3' stroke-width='0.5'/><text class='ts' x='260' y='164' text-anchor='middle' style='font-size:9px'>R16</text></g></g><g transform='translate(380,30)'><line x1='40' y1='260' x2='310' y2='260' stroke='var(--s)' stroke-width='1'/><line x1='40' y1='0' x2='40' y2='260' stroke='var(--s)' stroke-width='1'/><text class='ts' x='32' y='265' text-anchor='end'>0</text><text class='ts' x='175' y='280' text-anchor='middle'>Turn</text><line x1='40' y1='10' x2='310' y2='10' stroke='var(--color-text-danger)' stroke-width='0.5' stroke-dasharray='6 3'/><text class='ts' x='312' y='14' style='fill:var(--color-text-danger);font-size:10px'>128k</text><g class='c-blue'><rect x='50' y='220' width='36' height='40' rx='3' stroke-width='0.5'/><text class='ts' x='68' y='244' text-anchor='middle' style='font-size:9px'>R4</text></g><line x1='94' y1='215' x2='94' y2='265' stroke='var(--color-text-success)' stroke-width='1.5' stroke-dasharray='4 2'/><text class='ts' x='96' y='210' style='fill:var(--color-text-success);font-size:9px'>zip</text><g class='c-teal'><rect x='98' y='240' width='36' height='20' rx='3' stroke-width='0.5'/><text class='ts' x='116' y='254' text-anchor='middle' style='font-size:8px'>sum</text></g><g class='c-amber'><rect x='98' y='205' width='36' height='35' rx='3' stroke-width='0.5'/><text class='ts' x='116' y='226' text-anchor='middle' style='font-size:9px'>R8</text></g><g class='c-teal'><rect x='146' y='240' width='36' height='20' rx='3' stroke-width='0.5'/></g><g class='c-amber'><rect x='146' y='190' width='36' height='50' rx='3' stroke-width='0.5'/><text class='ts' x='164' y='220' text-anchor='middle' style='font-size:9px'>R12</text></g><g class='c-teal'><rect x='194' y='240' width='36' height='20' rx='3' stroke-width='0.5'/></g><g class='c-amber'><rect x='194' y='170' width='36' height='70' rx='3' stroke-width='0.5'/><text class='ts' x='212' y='210' text-anchor='middle' style='font-size:9px'>R16</text></g></g><g transform='translate(20,320)'><g class='c-purple'><rect x='0' y='-6' width='10' height='10' rx='2' stroke-width='0.5'/></g><text class='ts' x='14' y='3'>System</text><g class='c-blue'><rect x='65' y='-6' width='10' height='10' rx='2' stroke-width='0.5'/></g><text class='ts' x='79' y='3'>Full history</text><g class='c-teal'><rect x='140' y='-6' width='10' height='10' rx='2' stroke-width='0.5'/></g><text class='ts' x='154' y='3'>Summary</text><g class='c-amber'><rect x='200' y='-6' width='10' height='10' rx='2' stroke-width='0.5'/></g><text class='ts' x='214' y='3'>Last K</text></g></svg>"
}
```

---

## 3 · Sandbox: compare strategies live

```widget:sandbox
{
  "title": "Compression strategy sandbox",
  "hint": "Tune turns and sizes; compare token spend",
  "params": [
    { "id": "turns", "label": "Turns completed", "min": 1, "max": 24, "default": 12, "step": 1 },
    { "id": "winSize", "label": "Keep last K turns", "min": 1, "max": 10, "default": 4, "step": 1, "hint": "Window for sliding / hybrid" },
    { "id": "sysTok", "label": "system_tokens", "min": 100, "max": 2000, "default": 400, "step": 50, "fmt": "auto" },
    { "id": "perTurn", "label": "Tokens per turn (obs+asst)", "min": 100, "max": 1200, "default": 440, "step": 20, "fmt": "auto" },
    { "id": "summTok", "label": "Summary tokens", "min": 50, "max": 1000, "default": 300, "step": 50, "fmt": "auto" }
  ],
  "metrics": [
    { "label": "① None", "expr": "sysTok + turns * perTurn", "fmt": "k", "warnAbove": 80000, "dangerAbove": 115000 },
    { "label": "② Sliding window", "expr": "sysTok + (turns < winSize ? turns : winSize) * perTurn", "fmt": "k" },
    { "label": "③ Summarize", "expr": "turns <= winSize ? sysTok + turns * perTurn : sysTok + summTok + (turns < winSize ? turns : winSize) * perTurn", "fmt": "k" },
    { "label": "④ Savings ①→③", "expr": "turns <= winSize ? 0 : ((sysTok + turns * perTurn) - (sysTok + summTok + (turns < winSize ? turns : winSize) * perTurn)) / (sysTok + turns * perTurn) * 100", "fmt": "%", "warnAbove": 0 }
  ],
  "growth": {
    "title": "Context per turn (no-compression baseline)",
    "steps": "turns",
    "labelExpr": "i",
    "valueExpr": "sysTok + i * perTurn",
    "maxExpr": "128000",
    "fmt": "k"
  }
}
```

Try: raise turns to 20; push `summTok`; set `winSize = 1`; crank `perTurn` to mimic huge tool payloads.

---

## 4 · Lab: code the four strategies

```widget:code-playground
{
  "title": "Compression lab",
  "hint": "Switch strategy and inspect saved tokens",
  "mode": "sandbox",
  "files": [
    {
      "path": "main.js",
      "active": true,
      "code": "import { simulate } from './strategies.js';\nimport { printReport } from './report.js';\n\nconst totalTurns = {{totalTurns}};\nconst strategy = {{strategy}};\nconst windowSize = {{windowSize}};\n\nconsole.log('🔬 Context compression');\nconsole.log('strategy:', strategy);\nconsole.log('turns:', totalTurns);\nconsole.log('window:', windowSize);\nconsole.log('');\n\nconst history = [];\nhistory.push({ role: 'system', content: 'You are a travel planner. Plan trips from user needs.' });\nhistory.push({ role: 'user', content: 'I am vegetarian, budget 5000 CNY, Yunnan 5 days.' });\n\nfor (let turn = 1; turn <= totalTurns; turn++) {\n  history.push({ role: 'assistant', content: `Day ${turn}: visit spot ${turn}, lunch, hotel. ~${800 + turn * 100} CNY.` });\n  if (turn < totalTurns) {\n    history.push({ role: 'user', content: `Day ${turn} works. Plan day ${turn + 1}.` });\n  }\n}\n\nconsole.log(`Raw history: ${history.length} msgs`);\nconst result = await simulate(strategy, history, windowSize);\nprintReport(result, strategy);",
      "slots": [
        { "id": "totalTurns", "default": "8", "tooltip": "Try 3, 8, 16" },
        { "id": "strategy", "default": "'none'", "tooltip": "'none' | 'sliding_window' | 'summarize' | 'hybrid'" },
        { "id": "windowSize", "default": "4", "tooltip": "Recent turns kept" }
      ]
    },
    {
      "path": "strategies.js",
      "code": "export async function simulate(strategy, history, windowSize) {\n  const sysMsg = history.find(m => m.role === 'system');\n  const dialogMsgs = history.filter(m => m.role !== 'system');\n  const beforeTokens = countTokens(history.map(m => m.content).join('')).tokens;\n  let compressed;\n  let summaryText = null;\n  if (strategy === 'none') {\n    compressed = [...history];\n  } else if (strategy === 'sliding_window') {\n    const keep = dialogMsgs.slice(-windowSize * 2);\n    compressed = [sysMsg, ...keep];\n  } else if (strategy === 'summarize') {\n    const earlyMsgs = dialogMsgs.slice(0, -4);\n    const recentMsgs = dialogMsgs.slice(-4);\n    if (earlyMsgs.length > 0) {\n      const summaryReq = earlyMsgs.map(m => `${m.role}: ${m.content}`).join('\\n');\n      console.log('[zip] LLM summary...');\n      const resp = await callLLM([\n        { role: 'system', content: 'Compress the dialog into <=100 words. Keep prefs and decisions. Summary only.' },\n        { role: 'user', content: summaryReq }\n      ]);\n      summaryText = resp.content;\n      console.log('[zip] summary:', summaryText);\n      compressed = [sysMsg, { role: 'system', content: 'Summary: ' + summaryText }, ...recentMsgs];\n    } else compressed = [...history];\n  } else if (strategy === 'hybrid') {\n    const earlyMsgs = dialogMsgs.slice(0, -windowSize * 2);\n    const recentMsgs = dialogMsgs.slice(-windowSize * 2);\n    if (earlyMsgs.length > 0) {\n      const summaryReq = earlyMsgs.map(m => `${m.role}: ${m.content}`).join('\\n');\n      console.log('[zip] LLM summary...');\n      const resp = await callLLM([\n        { role: 'system', content: 'Compress the dialog into <=100 words. Keep prefs and decisions. Summary only.' },\n        { role: 'user', content: summaryReq }\n      ]);\n      summaryText = resp.content;\n      compressed = [sysMsg, { role: 'system', content: 'Summary: ' + summaryText }, ...recentMsgs];\n    } else compressed = [sysMsg, ...recentMsgs];\n  } else {\n    console.error('unknown', strategy);\n    compressed = [...history];\n  }\n  const afterTokens = countTokens(compressed.map(m => m.content).join('')).tokens;\n  return { before: beforeTokens, after: afterTokens, messages: compressed.length, summary: summaryText };\n}"
    },
    {
      "path": "report.js",
      "code": "export function printReport(result, strategy) {\n  console.log('');\n  console.log('──────── report ────────');\n  console.log('strategy:', strategy);\n  console.log('before:', result.before, 'tok');\n  console.log('after:', result.after, 'tok');\n  const saved = result.before - result.after;\n  const rate = result.before > 0 ? Math.round(saved / result.before * 100) : 0;\n  console.log('saved:', saved, 'tok (' + rate + '%)');\n  console.log('msgs:', result.messages);\n  if (result.summary) {\n    console.log('');\n    console.log('⚠ Did the summary keep \"vegetarian\"?');\n    console.log('  If not, later turns may suggest meat venues.');\n  }\n}"
    }
  ],
  "outputHeight": 340
}
```

---

## Advanced: production patterns

**Hot / warm / cold tiers:** hot = last few turns; warm = running summary; cold = external memory—retrieve on demand (next lesson ties to RAG).

**Importance scoring:** keep user-stated prefs and tool payloads; drop “ok / thanks” fluff.

**Progressive compression:** re-summarize older tiers as the session lengthens.

:::callout{variant="blue" title="Pick a strategy"}
1. Few turns, small obs → **none**  
2. Early info irrelevant → **sliding window**  
3. Need early meaning → **summary** or **hybrid**  
4. Long product sessions → **tiering + scoring**  
:::

---

## 5 · Quiz

```widget:quiz
{
  "title": "Context quiz",
  "questions": [
    {
      "id": "q1",
      "text": "User says “I’m vegetarian” on turn 1. After 20 turns with sliding window K=5, the model suggests meat dishes. Why?",
      "type": "single",
      "options": [
        { "text": "max_turns too high", "correct": false },
        { "text": "Turn 1 fell out of the window—preference was dropped", "correct": true },
        { "text": "The model cannot understand diets", "correct": false }
      ],
      "explanation": "A window of 5 keeps only recent turns. Move prefs into summaries or long-term memory instead of hoping the window retains turn 1."
    },
    {
      "id": "q2",
      "text": "Main advantage of summarization vs sliding window?",
      "type": "single",
      "options": [
        { "text": "Easier to implement", "correct": false },
        { "text": "Preserves semantics of early history instead of deleting it", "correct": true },
        { "text": "Zero information loss", "correct": false }
      ],
      "explanation": "Summaries condense early dialog; you still lose raw detail but keep meaning—usually better than hard truncation."
    },
    {
      "id": "q3",
      "text": "When is “no compression” most reasonable?",
      "type": "single",
      "options": [
        { "text": "Short runs where context stays far under the cap", "correct": true },
        { "text": "Very long chats needing every token", "correct": false },
        { "text": "Never", "correct": false }
      ],
      "explanation": "Zero loss and zero extra machinery—best when you are nowhere near limits."
    }
  ]
}
```

---

## Summary

- Context **grows linearly**—compression only changes the slope  
- Trade **retention vs tokens vs complexity**  
- Sliding windows **forget** early constraints  
- Summaries **cost an extra call** and drop detail  
- **Hybrid** is the usual production default  

```widget:checklist
{
  "title": "Lesson 2 checklist",
  "id": "module-2-lesson-02-en",
  "items": [
    "I can estimate context size by turn",
    "I can explain all four strategies",
    "I know why sliding windows forget",
    "I know summarize/hybrid costs",
    "I ran the sandbox comparisons",
    "I ran the compression lab",
    "I finished the quiz"
  ]
}
```

---

[← Prev](/lesson/module-2/01-agent-loop) · [Next →](/lesson/module-2/03-memory-system)
