---
title: "XML & isolation: system vs user prompts and reusable templates"
module: "module-1"
moduleTitle: "Module 1: Prompt engineering basics"
duration: "35 min"
description: "Split stable rules into system prompts, stream changing data through tagged user prompts, and reuse templates with Prompt Caching in mind."
tags: ["XML", "System prompt", "Templates"]
expert:
  name: "Leo, structure coach"
  model: "gpt-4o"
  intro: "Hi, I’m Leo—layers, XML, templates 👋"
  systemPrompt: |
    You are Leo, coaching prompt structure, XML tags, and template design.
    Reply in English ≤200 words; prefer copy-pasteable examples.
---

By chapter end:

> ✓ Decide what belongs in system vs user messages  
> ✓ Isolate dynamic payloads with semantic XML tags  
> ✓ Ship reusable templates with placeholders  
> ✓ Explain why long static system prompts help caching  

**Audience notes:** business readers: sections 1–3 + caching concept. Builders: read all, especially caching.

---

## Section 0 · No new tooling

Use claude.ai or your usual surface. Pick a task you repeat weekly—it fuels both exercises.

---

## Section 1 · Two buckets

Claude exposes **system** and **user** containers. Separation improves clarity *and* throughput.

> **Analogy:** handbook vs daily ticket  
> **System** = handbook (role, rules, formats, guardrails)  
> **User** = ticket (this customer, this CSV, special one-off asks)

### System carries stable truth

- Role / expertise  
- Tone, length, when to clarify  
- Product or policy background  
- Output skeletons (JSON schema, section order)  
- Must-nots  

### User carries volatile payloads

- Raw inputs (feedback, docs, tables)  
- Per-run tweaks (“shorter”, “in French”)  
- Lightweight context summaries  

```widget:before-after
{
  "title": "Support reply layering",
  "subtitle": "Same task—monolith vs split prompts",
  "tabs": [
    {
      "label": "❌ Monolith",
      "prompt": "You are CS, formal tone, ≤200 chars, refunds apologize first. Customer: waited 3 weeks, furious.",
      "analysis": "Rules + data glued together—no reuse, easy to omit a rule next time.",
      "type": "bad"
    },
    {
      "label": "✓ Layered",
      "prompt": "[SYSTEM — configure once]\nYou are professional CS, formal, ≤200 words, refunds: apologize then process.\n\n[USER — per case]\n<complaint>\nWaited three weeks, very angry.\n</complaint>",
      "analysis": "Swap only `<complaint>` per case; system stays cached and consistent.",
      "type": "good"
    }
  ]
}
```

---

## Section 2 · XML = cognitive borders

Tags tell the model *what kind* of blob it is holding—especially vital as prompts grow.

> **Analogy:** groceries vs coupons on the belt—don’t scan coupons as SKUs.

### Single payload

```
Analyze this feedback:

<feedback>
A: UI confusing—can’t find settings
B: Loads 30s
C: Likes features, hates colors
</feedback>

Classify by type and severity H/M/L.
```

### Multiple typed blobs

```
Advise using policy + case:

<policy>
7-day returns; refund 3–5 days; quality issues → 30-day window
</policy>

<customer_case>
Mr Zhang; day 8; non-defective; “just dislike”
</customer_case>
```

### Naming tags

```widget:before-after
{
  "title": "Tag naming",
  "subtitle": "Semantics matter",
  "tabs": [
    {
      "label": "❌ Opaque",
      "prompt": "<a>...</a>\n<b>...</b>",
      "analysis": "No hints about content type.",
      "type": "bad"
    },
    {
      "label": "✓ Meaningful",
      "prompt": "<user_feedback>...</user_feedback>\n<policy>...</policy>",
      "analysis": "Names document intent for the model.",
      "type": "good"
    }
  ]
}
```

**Rules:** descriptive nouns, snake_case for multi-word, avoid `<x>`, nest general outside specific.

---

## Section 3 · Templates = static + tagged dynamic

> **Test:** “Will this string change next invocation?”  
> Yes → user XML. No → system.

```widget:before-after
{
  "title": "Weekly analytics template",
  "subtitle": "One-off paragraph vs reusable shell",
  "tabs": [
    {
      "label": "Before",
      "prompt": "Analyst, find ±20% WoW spikes in: [paste numbers]",
      "analysis": "Rewrite rules weekly; thresholds drift.",
      "type": "bad"
    },
    {
      "label": "After",
      "prompt": "[SYSTEM]\nOps analyst. Anomaly = ±20% WoW. Output table + hypotheses + confidence.\n\n[USER]\n<weekly_data>\n{{paste CSV}}\n</weekly_data>",
      "analysis": "Rules frozen in system; only data changes.",
      "type": "good"
    }
  ]
}
```

Benefits: consistent frame, faster authoring, single place to edit policy.

---

## Section 4 · Prompt Caching (concept)

Long **stable** system prompts can be cached—first call pays, later calls reuse embeddings/tokens (API feature; consumer UI may auto-optimize).

Conditions: sufficiently long static prefix, **byte-identical** between calls, enable cache flags in API.

Design impact: cram durable context into system; keep volatile text in user layers.

---

## Section 5 · Exercises

### Exercise 1 · Classify static vs dynamic

```widget:prompt-practice
{
  "title": "Exercise 1 · Split the prompt",
  "instruction": "Split into SYSTEM (static) + USER (XML). Original:\n\nYou are a senior market analyst, concise ≤300 words. We sell B2B SaaS to large enterprises. Analyze competitor ‘Acme’ latest launch, rate threat H/M/L, propose counter moves. Launch notes: [paste]",
  "original": "Analyst … [Chinese excerpt retained conceptually—student pastes EN task]",
  "scenarios": [
    { "emoji": "📊", "label": "Market", "description": "Comp intel" },
    { "emoji": "🛠️", "label": "Product", "description": "Feature impact" },
    { "emoji": "💼", "label": "Exec", "description": "Decisions" }
  ],
  "placeholder": "[SYSTEM]\n...\n\n[USER]\n<...>",
  "hint": "SYSTEM: persona, company context, threat rubric. USER: <competitor_name> + <update_content>.",
  "systemPrompt": "Grade static/dynamic split + XML naming. 100 pts, 25 each dimension. English ≤150 words, encouraging."
}
```

### Exercise 2 · Template a recurring chore

```widget:prompt-practice
{
  "title": "Exercise 2 · Template rewrite",
  "instruction": "Paste a prompt you reuse weekly. Rewrite as SYSTEM + USER with XML placeholders. Test old vs new.",
  "original": "(your recurring prompt)",
  "scenarios": [
    { "emoji": "📝", "label": "Writing", "description": "Reports / posts" },
    { "emoji": "🔍", "label": "Analysis", "description": "Data / feedback" },
    { "emoji": "💬", "label": "Comms", "description": "Customers" }
  ],
  "placeholder": "[SYSTEM] …\n\n[USER]\n<tag>{{fill}}</tag>",
  "hint": "See weekly data example above.",
  "systemPrompt": "Evaluate template hygiene: static in system, semantic tags, reusability. 100 pts. English ≤150 words."
}
```

---

## Checklist

```widget:checklist
{
  "title": "Chapter 2 checklist",
  "id": "module-1-lesson-2-xml-en",
  "items": [
    "I can explain system vs user cargo",
    "I wrap dynamic data in meaningful XML",
    "Exercise 1 done (compare appendix)",
    "Exercise 2 tested old vs new side-by-side"
  ]
}
```

---

> **Next:** [Step instructions](/lesson/module-1/03-step-instructions)

---

## Appendix · Exercise 1 key

SYSTEM: analyst persona, company profile, threat definitions.  
USER: `<competitor_name>`, `<update_content>`.

---

[← Prev](/lesson/module-1/01-prompt-structure) · [Next →](/lesson/module-1/03-step-instructions)
