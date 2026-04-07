---
title: "System prompts in production: from hackathon to shipped feature"
module: "module-1"
moduleTitle: "Module 1: Prompt engineering basics"
duration: "40 min"
description: "Structure production-grade system prompts in five blocks so multi-user, long-running AI features stay consistent, safe, and cheap to run."
tags: ["System prompt", "Production", "Five blocks", "Caching"]
expert:
  name: "Sam, product architect"
  model: "gpt-4o"
  intro: "Hi, I’m Sam—production prompts, rollout, caching 👋"
  systemPrompt: |
    You are Sam, focused on production AI features and system-prompt architecture.
    Reply with concrete prompt snippets.
    English, ≤200 words unless asked for more detail.
---

By chapter end you can:

> ✓ Contrast “solo experiment” vs “production” design needs  
> ✓ Lay out the five canonical blocks  
> ✓ Decide what must live in system vs user messages  
> ✓ Reason about prompt caching for latency/cost  

**Tips:** PMs—§3 maps to PRDs; engineers—§4 on caching.

---

## Section 0: pick a *production* use case

Choose something *reused* by many users/sessions: support bot, moderation, report generator—not one-off chats.

---

## Section 1: experiment vs production

```widget:before-after
{
  "title": "Experiment vs production",
  "subtitle": "Design constraints diverge",
  "tabs": [
    {
      "label": "🧪 Experiment",
      "prompt": "Single user, tweak anytime, loose formats, you eat errors.",
      "analysis": "Fast iteration; failures are personal.",
      "type": "neutral"
    },
    {
      "label": "🏭 Production",
      "prompt": "Many users, frozen prompts in code, edge cases matter, strict formats, cost/latency budgets.",
      "analysis": "Ambiguity becomes user-visible incidents—explicit rules required.",
      "type": "neutral"
    }
  ]
}
```

Production means externalizing every “tribal” rule into the system prompt.

> **Analogy:** home cooking vs restaurant spec sheet.

---

## Section 2: five things that belong in system prompts

### 1) Role & audience  
Who is the model, for whom, at what depth?

### 2) Behavior & tone  
Length caps, voice, when to clarify, escalation paths.

### 3) Background knowledge  
Product facts, policies, FAQs the model cannot infer.

### 4) Output contract  
Section order, markdown yes/no, example skeletons.

### 5) Guardrails  
Forbidden claims, PII, competitor talk, handoff triggers.

```widget:before-after
{
  "title": "Vague vs testable rules",
  "subtitle": "Production needs verification",
  "tabs": [
    {
      "label": "❌ Fluffy rules",
      "prompt": "\"Be professional\", \"stay concise\", \"no off-topic\"",
      "analysis": "Unmeasurable—everyone interprets differently.",
      "type": "bad"
    },
    {
      "label": "✓ Testable rules",
      "prompt": "≤150 words, no Markdown; no competitor comparisons; refunds >$500 → human",
      "analysis": "You can write tests per bullet; easy PR diffs.",
      "type": "good"
    }
  ]
}
```

---

## Section 3: full assembly (e-commerce support sketch)

```
# Role
You are {{company}}’s order-support assistant for shoppers of all technical levels.
Plain language, no jargon.

# Behavior
## Voice & length
Friendly, concise: ≤150 words routine; ≤300 complex.
Use first person “I,” not “the AI.”

## Clarification
If order ID or issue missing, ask ≤2 targeted questions.

# Knowledge
## Product snapshot
{{sku list, pricing bands}}

## FAQ
Q: Returns?  
A: Within 7 days, My Orders → Returns…

# Output shape
1) Answer first (1–2 sentences)  
2) Numbered steps if how-to  
3) Close: “Tell me if you need anything else.”

No Markdown bold (UI strips it).

# Don’t
- Promise fixed resolution times  
- Compare competitors  
- Discuss internal staffing

# Escalate when
- Claim > $500  
- User demands human  
- Outside catalog scope
```

### Template skeleton

```
# Role …
# Behavior …
# Knowledge …
# Output format …
# Don’t …
# Escalate / reroute …
```

Principles: general→specific; headings for maintenance; concrete bans; don’t overfit every micro-case.

---

## Section 4: prompt caching

Large static system prompts dominate tokens. Caches (where supported) cut latency and **~order-of-magnitude** token $ on repeats—**if** the system string is stable. Tradeoff: frequent edits invalidate cache—batch monthly, not hourly tweaks.

---

## Section 5: exercises

### Exercise 1: missing blocks

```widget:prompt-practice
{
  "title": "Exercise 1: missing blocks",
  "instruction": "This system prompt is only three sentences. Against the five-block model, what’s missing and what do you add?",
  "original": "You are a smart assistant who helps users.\nBe friendly and concise.\nDon’t answer off-topic work questions.",
  "scenarios": [
    { "emoji": "🛎️", "label": "Support", "description": "CX / SaaS" },
    { "emoji": "✍️", "label": "Writing", "description": "Internal drafting" },
    { "emoji": "📊", "label": "Analytics", "description": "Auto reports" }
  ],
  "placeholder": "Missing: …\nAdd: …\n(repeat)",
  "hint": "Role too vague; no product KB; “concise” unquantified; bans/escalation fuzzy.",
  "systemPrompt": "Score gap analysis (100): noticed missing KB, numeric format rules, concrete guardrails/escalation, actionable patches—25 each. English ≤150 words."
}
```

---

### Exercise 2: write a production system prompt

```widget:prompt-practice
{
  "title": "Exercise 2: full production prompt",
  "instruction": "Use all five blocks for a real internal or external assistant you’d ship.",
  "original": "(Feature + primary users.)",
  "scenarios": [
    { "emoji": "🛎️", "label": "Support bot", "description": "Tickets / FAQs" },
    { "emoji": "✍️", "label": "Writing aid", "description": "Mail / docs" },
    { "emoji": "📊", "label": "Report gen", "description": "Metrics narratives" }
  ],
  "placeholder": "# Role\n…\n# Behavior\n…\n# Knowledge\n…\n# Output\n…\n# Don’t\n…\n# Escalate\n…",
  "hint": "Internal mail helper: company voice, length caps, no AI watermark lines.",
  "systemPrompt": "Score production prompt (100): five blocks filled, testable rules, enough KB for FAQs, guardrails—25 each. English ≤200 words."
}
```

---

## Chapter checklist

```widget:checklist
{
  "title": "Chapter 6 checklist",
  "id": "module-1-lesson-6-production",
  "items": [
    "I can state how production differs from solo experiments",
    "I know the five blocks and what each holds",
    "I finished Exercise 2 and smoke-tested in Claude"
  ]
}
```

---

> **Next: Agent prompts 101**—tool loops, heuristics, planning.

---

## Appendix: Exercise 1 sketch

- Role too generic—name product/users.  
- No knowledge—model guesses policies.  
- “Concise” unbounded—add word/structure rules.  
- “Off-topic” undefined + no human route—spell exclusions + escalation.

---

**Previous** → [Output format](/lesson/module-1/05-output-format)  
**Next** → [Agent prompts 101](/lesson/module-1/07-agent-intro)
