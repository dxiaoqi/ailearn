---
title: "Few-shot examples: embed human judgment in the prompt"
module: "module-1"
moduleTitle: "Module 1: Prompt engineering basics"
duration: "40 min"
description: "Structure few-shot examples, pick the right count, and cover edge cases—so the model learns what prose alone cannot teach."
tags: ["Few-shot", "Examples", "Edge cases", "Classification"]
expert:
  name: "Nora, example coach"
  model: "gpt-4o"
  intro: "Hi, I’m Nora—I design few-shot examples. Ask when to use them and how to write them 👋"
  systemPrompt: |
    You are Nora, a coach for few-shot example design.
    Prefer triplets (input / reasoning / output) over vague advice.
    Reply in English under 200 words unless a longer critique is requested.
---

By chapter end you can:

> ✓ Know when examples beat prose  
> ✓ Write examples that teach *how* to decide, not just *what* outputs look like  
> ✓ Cover key edge cases with 2–3 examples  
> ✓ Know when rich examples can over-constrain frontier models  

---

## Section 0: pick a “hard to explain” judgment

Think of a task where long descriptions still mislead the model, but 1–2 concrete examples fix it—sentiment, moderation, priority, tone…

---

## Section 1: prose vs examples

> **Analogy: learning scrambled eggs**  
> Words: “not too hot, enough oil, pull off heat early.”  
> Demo: watch once, you *see* “just set.”  
> Similarly, “formal but warm” or “strict but flexible” needs **demonstration**.

### Prose fits when

- Rules are crisp (7-day return, max 200 words)  
- The model already knows the domain  
- You mostly need format control (JSON skeleton)  

### Examples almost required when

- **Subtle judgment** (tone, quality bars)  
- **Style imitation** hard to name  
- **Fuzzy boundaries** where rules fail  

---

## Section 2: strong example = input + reasoning + output

Skipping reasoning hides *why* the label fits—boundary cases stay wrong.

```widget:before-after
{
  "title": "Example structure",
  "subtitle": "Input/output only vs triplet with reasoning",
  "tabs": [
    {
      "label": "❌ Input + output only",
      "prompt": "Example:\nInput: \"Waited 20 min but it was still tasty\"\nOutput: neutral",
      "analysis": "No notion that delivery complaint + tasty core = neutral-leaning-positive. Similar mixed texts still confuse the model.",
      "type": "bad"
    },
    {
      "label": "✓ Input + reasoning + output",
      "prompt": "Example:\nInput: \"Waited 20 min but it was still tasty\"\nReasoning: Complaint on timing (negative signal) but core experience positive—weight the meal.\nOutput: neutral",
      "analysis": "The model learns the weighting rule and can generalize to other mixed reviews.",
      "type": "good"
    }
  ]
}
```

### Structured triplets with XML

```
Classify comment sentiment: positive / negative / neutral

Logic: weight core product experience over logistics complaints.

Example 1:
<example_input>Waited 20 minutes but still tasty</example_input>
<example_reasoning>Timing complaint (negative), but “tasty” is core positive—net neutral-leaning-positive.</example_reasoning>
<example_output>neutral</example_output>

Example 2:
<example_input>Pretty packaging, everything inside shattered</example_input>
<example_reasoning>Packaging is secondary; broken contents are core failure—negative.</example_reasoning>
<example_output>negative</example_output>

Now classify:
<input>{{comment}}</input>
```

`<example_reasoning>` is optional but usually worth it.

---

## Section 3: how many examples, what to cover

| Count | Use |
|-------|-----|
| 0 | clear rules; model’s prior is enough |
| 1 | simple pattern establishment |
| 3 | typical + boundary + counter-intuitive—**sweet spot** |
| 5+ | many distinct sub-types only |

> More shots ≠ always better; too many can rigidify outputs.

Cover **judgment deltas**, not redundant near-duplicates.

```widget:before-after
{
  "title": "Coverage: redundant vs diverse",
  "subtitle": "Three similar positives vs three different situations",
  "tabs": [
    {
      "label": "❌ All “obvious” cases",
      "prompt": "Ex1: clearly positive → positive\nEx2: another clearly positive → positive\nEx3: clearly negative → negative",
      "analysis": "Boundary mixes still unseen; edge errors persist.",
      "type": "bad"
    },
    {
      "label": "✓ Diverse decision boundaries",
      "prompt": "Ex1: typical positive → positive\nEx2: mixed signals → neutral\nEx3: sounds negative but means satisfied → positive",
      "analysis": "Teaches tradeoffs; boundary accuracy jumps.",
      "type": "good"
    }
  ]
}
```

> Before writing: *where does this task fail most?* Aim examples there.

---

## Section 4: frontier models

Very detailed template-y shots can **lock** style/format.  
**Practice:** zero-shot first, see failures, then add **targeted** shots—avoid premature optimization.

| Add examples early | Try zero-shot first |
|--------------------|---------------------|
| Subtle boundaries | Common, crisp rules |
| Odd required formats | You don’t know failure modes yet |
| Repeated specific mistakes | Tasks needing creativity |

---

## Section 5: exercises

### Exercise 1: need examples? (basics)

```widget:prompt-practice
{
  "title": "Exercise 1: need few-shot?",
  "instruction": "For each task, say need / don’t need examples and why:\nA. Translate article CN→EN\nB. Sentiment (pos/neg/neu)\nC. Structure data into JSON (schema given)\nD. Decide if feedback is “product-worthy” (subjective bar)",
  "original": "A: translation\nB: sentiment\nC: JSON shaping\nD: subjective triage",
  "scenarios": [
    { "emoji": "🌐", "label": "Content ops", "description": "Translate / reshape" },
    { "emoji": "🎯", "label": "Judgment", "description": "Classify / score" },
    { "emoji": "🔧", "label": "Extraction", "description": "Parse / structure" }
  ],
  "placeholder": "A: need? why?\n\nB: …\n\nC: …\n\nD: …",
  "hint": "A: usually no—unless style/term glossary.\nB: yes—boundaries are contextual.\nC: usually no—unless nested/ambiguous schema.\nD: yes—subjective bars need demonstrations.",
  "systemPrompt": "Score need/don’t judgments (100): clarity tasks vs fuzzy judgments vs D nuance—25 each. Format: X/100, 1–2 correct calls, 1–2 misses. English ≤150 words, encouraging."
}
```

---

### Exercise 2: write 2–3 triplets (advanced)

```widget:prompt-practice
{
  "title": "Exercise 2: triplet examples",
  "instruction": "Write 2–3 input/reasoning/output examples for your judgment task, stressing edge cases.",
  "original": "(Task + rubric + common failure boundaries.)",
  "scenarios": [
    { "emoji": "💬", "label": "Sentiment", "description": "Pos/neg/neu" },
    { "emoji": "📌", "label": "Triage", "description": "Worth building?" },
    { "emoji": "📄", "label": "Moderation", "description": "Publish bar" }
  ],
  "placeholder": "Logic line: …\n\nExample 1:\n<example_input>…</example_input>\n<example_reasoning>…</example_reasoning>\n<example_output>…</example_output>\n\nExample 2: …\n\nExample 3 (optional): …",
  "hint": "Use three moods: clearly positive; mixed complaint+tasty→neutral; “meh/okay” reads neutral in reviews.",
  "systemPrompt": "Grade triplet examples (100): (1) triple structure, (2) reasoning explains label, (3) diverse situations, (4) teaches the rule. Format: X/100, highlights, fixes; if weak, sketch better shots. English ≤150 words."
}
```

---

## Chapter checklist

```widget:checklist
{
  "title": "Chapter 4 checklist",
  "id": "module-1-lesson-4-fewshot",
  "items": [
    "I know when a task needs examples vs prose alone",
    "I write input + reasoning + output, not only I/O pairs",
    "I cover different judgment cases, not duplicate easy ones",
    "I finished Exercise 2 and compared accuracy before/after"
  ]
}
```

---

> **Next: Output format control**—prefill, JSON, tagged verdicts for downstream use.  
> **Prep:** a place you want copy-paste-ready AI output.

---

## Appendix: Exercise 1 key

- **A** Usually no (unless special style/terms).  
- **B** Yes—boundaries are situational.  
- **C** Usually no if schema is explicit.  
- **D** Strong yes—subjective “good requirement” needs demos.  

---

**Previous** → [Step instructions](/lesson/module-1/03-step-instructions)  
**Next** → [Output format](/lesson/module-1/05-output-format)
