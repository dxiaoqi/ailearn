---
title: "Output formats: prefill, JSON, and verdict tags"
module: "module-1"
moduleTitle: "Module 1: Prompt engineering basics"
duration: "35 min"
description: "Use assistant prefill, strict JSON, and XML verdict patterns so outputs are ready for humans or parsers—no second-pass cleanup."
tags: ["Format", "Prefill", "JSON", "Structured output"]
expert:
  name: "Kai, format engineer"
  model: "gpt-4o"
  intro: "Hi, I’m Kai—prefill, JSON, verdict extraction 👋"
  systemPrompt: |
    You are Kai, focused on controlling LLM output shape.
    Give copy-paste prompt templates.
    Reply in English under 200 words unless a longer critique is requested.
---

By chapter end you can:

> ✓ Prefill assistant messages to skip boilerplate intros  
> ✓ Ask for parse-safe JSON with field contracts  
> ✓ Use `<verdict>` (or similar) to keep reasoning + machine-readable finals  
> ✓ Harden or retry when formats slip  

**Tips:**  
- **Business:** §§1–2; skim JSON ideas  
- **Product / eng:** §§3–4 matter for shipped features  
- **Everyone:** Exercise 1 is immediately usable  

---

## Section 0: downstream thinking

Ask who consumes the output—human reading, template paste, or code—and design the contract **from that consumer backward**.

---

## Section 1: human vs programmatic consumers

```widget:before-after
{
  "title": "Readers vs programs",
  "subtitle": "Pick techniques by consumer",
  "tabs": [
    {
      "label": "👤 Human reading",
      "prompt": "Needs: readable sections, emphasis, sane length.\nOK: short acknowledgment, some flexibility.",
      "analysis": "Main lever: **prefill** the first sentence so the model jumps into substance.",
      "type": "neutral"
    },
    {
      "label": "⚙️ Program parsing",
      "prompt": "Needs: rigid JSON/CSV, stable keys, zero preamble.\nNot OK: prose wrappers, renamed fields.",
      "analysis": "Combine **prefill `{`**, explicit schema, and validation/retry.",
      "type": "neutral"
    }
  ]
}
```

---

## Section 2: prefill (assistant message seed)

Models often start with “Sure, here’s…”—harmless for humans, fatal for parsers.

> **Analogy:** hand them paper already headed “Dear customer,” so they continue in-letter, not with meta chatter.

```widget:before-after
{
  "title": "Skipping intros",
  "subtitle": "Wordy instructions vs structural prefill",
  "tabs": [
    {
      "label": "❌ “Don’t say hi” only",
      "prompt": "Prompt says: no greetings, go straight to content.",
      "analysis": "Soft request—models still preface often; unreliable in production.",
      "type": "bad"
    },
    {
      "label": "✓ Assistant prefill",
      "prompt": "Provide first tokens as an assistant message—model must continue after them.",
      "analysis": "Hard constraint: no room *before* your prefix.",
      "type": "good"
    }
  ]
}
```

### Use 1: jump into body text

```
[user]
Draft a reply email to this complaint—body only, no preamble.

<complaint>{{text}}</complaint>

[assistant prefill]
Dear customer,
```

### Use 2: force raw JSON

```
[user]
Analyze feedback as JSON only—no prose.

<feedback>{{text}}</feedback>

[assistant prefill]
{
```

### Use 3: start verdict tag

```
[user]
Analyze freely, but final decision must be inside <verdict>.

<case>{{case}}</case>

Reasoning first, then:

[assistant prefill]
<verdict>
```

> claude.com chat can’t set arbitrary assistant prefills; APIs / agent builders can.

---

## Section 3: JSON that parsers can trust

Need three pieces: **say JSON**, **define fields/types**, **prefill `{`** to block ``` fences.

```
Analyze this feedback. Output **only** a JSON object.

Fields:
{
  "sentiment": "positive|negative|neutral",
  "main_issues": ["...", "..."],
  "priority": "high|medium|low",
  "suggested_action": "one sentence"
}

<feedback>{{text}}</feedback>

[assistant prefill]
{
```

| Failure | Fix |
|---------|-----|
| Markdown code fences | Prefill `{` + “no fences” |
| Wrong keys | “Keys must match exactly” |
| Lead-in sentences | Prefill `{` |

---

## Section 4: `<final_verdict>` style—reason + extractable answer

Need reasoning for accuracy but only the tag for automation:

```
You review publishability.

<content>{{draft}}</content>

Analyze in prose, then close with either:
- <verdict>approve</verdict>
- <verdict>reject: reason</verdict>

Begin analysis:
```

**Parse:**

```javascript
const m = output.match(/<verdict>(.*?)<\/verdict>/s)
const decision = m?.[1] ?? null
```

---

## Section 5: when formats break

- **Validate + retry** (cap at ~3) for critical paths  
- **Reinforce** key format lines at the end of the prompt  
- **Downgrade** schema complexity if JSON stays flaky  

> For production flows, assume probabilistic behavior—measure pass rate over dozens of runs; <95% ⇒ harden.

---

## Section 6: exercises

### Exercise 1: add prefills

```widget:prompt-practice
{
  "title": "Exercise 1: add prefill",
  "instruction": "Rewrite for two modes: (1) human-readable analysis with no throat-clearing; (2) JSON with fields advantage / risk / recommendation. Show the assistant prefill for each.",
  "original": "You are a market analyst. Compare competitors vs us—emphasize our edge.\n\n<competitor>{{them}}</competitor>\n<our_product>{{us}}</our_product>",
  "scenarios": [
    { "emoji": "👤", "label": "Human", "description": "Readable paragraph" },
    { "emoji": "⚙️", "label": "JSON", "description": "Parser" },
    { "emoji": "🔀", "label": "Hybrid", "description": "Reason + tag" }
  ],
  "placeholder": "[Human version + Assistant: …]\n\n---\n\n[JSON version + Assistant: …]",
  "hint": "Human: prefill first analytic sentence.\nJSON: schema block + “JSON only” + prefill `{`.",
  "systemPrompt": "Score prefill design (100): correct human lead-in, JSON `{` prefill + schema, understands mechanism vs soft asks, matches downstream—25 each. English ≤150 words."
}
```

---

### Exercise 2: full format plan

```widget:prompt-practice
{
  "title": "Exercise 2: full formatting plan",
  "instruction": "Describe task + consumer, pick technique(s), write full prompt including prefill content.",
  "original": "(Task + how output is consumed.)",
  "scenarios": [
    { "emoji": "📋", "label": "Reader", "description": "Memo/email/copy" },
    { "emoji": "🗄️", "label": "Datastore", "description": "JSON/CSV ingest" },
    { "emoji": "✅", "label": "Decision", "description": "Verdict extraction" }
  ],
  "placeholder": "[Prompt]\n\n[Prefill line]",
  "hint": "Compliance: prose + `<verdict>`; tabular: strict JSON + `{` prefill.",
  "systemPrompt": "Score end-to-end format plan (100): tech matches consumer, JSON contracts if needed, correct prefill, paste-ready outputs—25 each. English ≤150 words."
}
```

---

## Chapter checklist

```widget:checklist
{
  "title": "Chapter 5 checklist",
  "id": "module-1-lesson-5-format",
  "items": [
    "I use prefill to remove boilerplate openings",
    "I can write JSON prompts with schema + `{` prefill",
    "I understand verdict-tag patterns for reason + extract",
    "I completed Exercise 2 and stress-tested format stability"
  ]
}
```

---

> **Foundations done—next: production system prompts** (Ch.6): multi-user, long-lived AI features.

---

## Appendix: Exercise 1 answers

**Human:** prefill the opening analytic sentence, e.g. `From a feature standpoint,`  
**JSON:** add schema + “only JSON” + assistant prefill `{`

---

**Previous** → [Few-shot](/lesson/module-1/04-fewshot)  
**Next** → [System prompts in production](/lesson/module-1/06-system-prompt-production)
