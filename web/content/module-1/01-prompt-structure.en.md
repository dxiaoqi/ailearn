---
title: "Prompt structure: the five-part checklist"
module: "module-1"
moduleTitle: "Module 1: Prompt engineering basics"
duration: "35 min"
description: "Use Anthropic’s five-part frame—goal, variable payload, steps, examples, closing constraints—to debug weak prompts and rewrite real tasks."
tags: ["Structure", "Five parts", "Framework", "Beginner"]
expert:
  name: "Mia, prompt advisor"
  model: "gpt-4o"
  intro: "Hi, I’m Mia—structure, rewrites, five-part audits 👋"
  systemPrompt: |
    You are Mia, a coach for prompt structure.
    Prefer concrete rewrite examples over theory.
    Reply in English under 200 words unless a longer critique is requested.
---

By chapter end you can:

> ✓ Spot which parts a sloppy prompt is missing  
> ✓ Rewrite an ad-hoc prompt into a structured version  
> ✓ Apply the checklist to real work tasks  

---

## Map

| # | Topic | You can… |
|---|-------|----------|
| **1** | **Prompt structure** | **Ship a complete five-part prompt** |
| 2 | XML separation | Isolate dynamic data with tags |
| 3 | Step instructions | Control analysis order |
| 4 | Few-shot | Encode judgment with examples |
| 5 | Output format | JSON, prefills, trimming fluff |
| 6 | System prompts & cache | Production patterns |
| 7 | Agents intro | Multi-step autonomy |
| 8 | Agent tools | Schemas models actually follow |
| 9 | Context tactics | Long-run quality |

---

## Section 0 · Setup

You only need any Claude surface (claude.ai or API). No code. If you already write prompts daily, skim theory and focus on Exercise 2.

---

## Section 1 · What “good” looks like

Most people stream-of-consciousness into the box. Anthropic testing shows stronger prompts usually cover **five blocks**—not always all five, but gaps often explain weak outputs.

### Five parts

| Part | Purpose | Ask yourself |
|------|---------|--------------|
| **① Goal** | What to produce | Audience? Format? Success criteria? |
| **② Variable payload** | Data that changes each run | What’s different this time? |
| **③ Steps** | Thinking / action order | What process should the model follow? |
| **④ Examples** | Judgment for edge cases | What nuance is hard to describe? |
| **⑤ Closing constraints** | Final guardrails | Length? Tone? Must-include items? |

Order is flexible. Treat this as a **checklist**, not a rigid template.

---

## Section 2 · Bad vs good

Scenario: answer an upset customer email.

```widget:before-after
{
  "title": "Complaint reply: sloppy vs structured",
  "subtitle": "Same task, missing parts vs complete framing",
  "tabs": [
    {
      "label": "❌ Weak",
      "prompt": "Write a reply to a customer complaint",
      "analysis": "No complaint text, tone, length, or structure—model must invent facts. Missing payload, steps, closing.",
      "type": "bad"
    },
    {
      "label": "✓ Stronger",
      "prompt": "You are a senior CX lead. Draft a professional email replying to:\n\n<complaint>{{complaint}}</complaint>\n\nSteps: 1) empathize + apologize 2) explain cause 3) offer fix 4) thank them\nTone: sincere, ≤200 words\nStart the email body immediately after <reply>\n<reply>",
      "analysis": "Role, isolated data, numbered path, format caps, prefill removes hedging intros.",
      "type": "good"
    }
  ]
}
```

---

## Section 3 · Apply to three roles

### A · PM distilling feedback

```
You are a senior PM skilled at turning feedback into crisp needs.

<feedback>
{{10–30 snippets from this week}}
</feedback>

Steps:
1. Label each item (feature / UX / perf / other)
2. Count by category
3. Surface themes mentioned ≥3×
4. Rank by impact → priority matrix

Format: summary table first, then detail per theme

<analysis>
```

### B · Ops weekly review

```
You analyze weekly ops KPIs and flag anomalies.
Rule: ±20% WoW = anomaly.

<data>
{{CSV for the week}}
</data>

Steps:
1. Compute WoW deltas
2. Flag every metric beyond ±20%
3. For each anomaly give 1–2 hypotheses (confidence: H/M/L)
4. Suggest next actions

If unsure, tag 【TBD】—don’t guess
```

### C · Marketing case study

```
You write punchy B2B case studies.

<interview>
{{interview transcript}}
</interview>

<product_info>
{{3 proof points}}
</product_info>

Story arc: pain (1) → solution (2) → quantified outcome  
≤400 words, grounded tone, include ≥1 customer quote
```

**Pattern:** role first, tagged payload, numbered steps, format last.

---

## Section 4 · Drills

### Exercise 1 · Identify missing parts

```widget:prompt-practice
{
  "title": "Exercise 1 · Missing pieces",
  "instruction": "List which five-part elements are missing from:\n\n「Summarize the core ideas of this article」\nand what breaks when each is absent.",
  "original": "Summarize the core ideas of this article",
  "scenarios": [
    { "emoji": "🎯", "label": "Goal", "description": "Define deliverable" },
    { "emoji": "📄", "label": "Payload", "description": "Changing data" },
    { "emoji": "🪜", "label": "Steps", "description": "Process order" },
    { "emoji": "💡", "label": "Examples", "description": "Judgment" },
    { "emoji": "📐", "label": "Closing", "description": "Format guardrails" }
  ],
  "placeholder": "Missing ___ because ___\n...",
  "hint": "At minimum: no article text, no audience, no method, no output spec.",
  "systemPrompt": "You grade analyses of the prompt ‘Summarize the core ideas of this article.’ Expect at least: missing article (payload), audience/role, step plan, output format. 100 pts. English, ≤150 words, encouraging tone. Format: Score X/100, 2 strengths, 1–2 improvements."
}
```

### Exercise 2 · Rewrite your real prompt

```widget:prompt-practice
{
  "title": "Exercise 2 · Rewrite a real task",
  "instruction": "Pick a task you run often. Paste your old one-liner, then rebuild it with the five parts. Send both to Claude and compare quality.",
  "original": "(paste your old prompt or pick “help me draft … email”)",
  "scenarios": [
    { "emoji": "📧", "label": "Comms", "description": "Email / chat" },
    { "emoji": "📊", "label": "Analysis", "description": "Reports" },
    { "emoji": "✍️", "label": "Writing", "description": "Marketing copy" },
    { "emoji": "🔍", "label": "Research", "description": "Notes / briefs" }
  ],
  "placeholder": "Before:\n\nAfter (role, <tags>, steps, format):\n\n",
  "hint": "Meeting invite example: add role, <meeting_info>, 4 numbered steps, tone + length, <email> prefill.",
  "systemPrompt": "Grade five-part rewrites: role, tagged payload, steps, closing. 100 pts (20 each). English ≤200 words. Praise 2 specifics, suggest 1–2 upgrades."
}
```

---

## Chapter checklist

```widget:checklist
{
  "title": "Chapter 1 checklist",
  "id": "module-1-lesson-1-structure-en",
  "items": [
    "I can explain the five parts in my own words",
    "I finished Exercise 1 with 3–4 missing elements called out",
    "I rewrote a real prompt in Exercise 2",
    "I compared old vs new in Claude and felt the gap"
  ]
}
```

---

> **Next:** [XML & separation](/lesson/module-1/02-xml-isolation)  
> Bring a reusable task you run weekly.

---

## Appendix · Exercise 1 key

Prompt: “Summarize the core ideas of this article”

- **Missing payload** – no article  
- **Missing audience** – depth/tone undefined  
- **Missing steps** – model picks a random reading strategy  
- **Missing output shape** – length/bullets/quotes unspecified  

---

**Next lesson** → [XML & separation](/lesson/module-1/02-xml-isolation)
