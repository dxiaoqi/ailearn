---
title: "Prompt engine: writing instructions that work"
module: "module-3"
moduleTitle: "Macro analysis agent in practice (phase 1)"
duration: "~100 min"
description: "Turn the role card into a four-layer prompt (logic gates), lock JSON shape and failure paths, and leave a manuscript ready for the code labs in lesson 4."
tags: ["Prompt", "Four layers", "JSON", "Logic gates", "News agent"]
expert:
  name: "Prompt coach Ava"
  model: "gpt-4o"
  intro: "I'm Ava—I help you tighten finance prompts, JSON shapes, and edge cases."
  systemPrompt: |
    You are Ava, a prompt design coach for finance-facing AI features.
    Answer in English, ~200 words max; stress verifiable formats and failure handling; avoid vague “analyze this.”
---

By the end of this lesson you can:

- Explain “prompts as logic gates” and contrast ad-hoc questions vs structured prompts  
- Author a full four-layer News Agent prompt (role / context / task / guardrails)  
- Specify JSON fields and empty-list behavior, then peer-review and revise  

---

## Pacing (reference)

| Time | Block | Notes |
|------|--------|------|
| 0–5′ | Review | Sample role cards—weak “output shape” |
| 5–20′ | Live demo | Same story: casual ask vs four-layer prompt |
| 20–40′ | Four layers | Gate analogy + finance mapping + full sample |
| 40–50′ | Bad vs good | Show real output deltas |
| 50–70′ | Drill ① | Solo four-layer draft |
| 70–85′ | Drill ② | Pair swap, adversarial Q&A |
| 85–95′ | Debrief | Four common failure modes |
| 95–100′ | Preview | Context + Trae scaffold |

---

## 1 · From role card to executable instructions

Typical gap: “return a digest” without **how many rows**, **which fields**, **plain text vs JSON**. This lesson closes those gates.

---

## 2 · Live experiment**Setup**: ~200 words of real AP copy.

1. **Casual**: “Summarize today’s AP finance headlines—what matters?” Expect loose format and uneven depth.  
2. **Structured**: Use the template below with the same text standing in for `{news_list}`. Expect stable fields and parse-ready JSON.

**Takeaway**: the model isn’t “smarter” on round two—the **gates** are explicit about inputs, processing, and exits.

---

## 3 · Four layers = logic gates

| Layer | Job | Finance analogy |
|-------|-----|-----------------|
| 1 Role | Who you are, boundaries, no outside facts | Job description in / out of scope |
| 2 Context | What materials exist today (source, caps, placeholders) | The briefing pack for this meeting |
| 3 Task | Rules + output contract (count, fields, JSON) | Submission template |
| 4 Constraints | Bans + if/then behavior | Compliance + escalations |

**Analogy**: prompt = job description + today’s assignment. In markets work you usually want **auditable, repeatable** outputs—not freestyle prose.

---

## 4 · Full sample: News Agent (four layers)

Replace `{news_list}` with the injected list your fetcher builds in lessons 3–4.

```
【Layer 1: Role】
You are a financial-markets news analyst.
You only use the headlines I provide—no outside sources or invented stories.

【Layer 2: Context】
Here is today’s AP News list (max 20 items):
{news_list}

【Layer 3: Task】
Select finance-relevant items, sort by importance desc.
For each item output:
- title: original headline, unchanged
- summary: 2–3 sentences on what happened
- market_impact: one sentence on why practitioners should care
- url: canonical link
Return at most 5 items as JSON: {"items": [...]}
No extra prose outside JSON.

【Layer 4: Constraints】
- Skip entertainment/sports/lifestyle without mentioning them
- If nothing is finance-relevant: {"items": [], "message": "No major finance stories today"}
- Never fabricate; every clause must trace to the provided text
```

**Why JSON?** Lesson 4 onward, Python reads the model output. Lock the schema now to avoid rework.

---

## 5 · Weak vs strong (four checks)

| Check | Weak | Strong |
|-------|------|--------|
| Role | “You are a helpful assistant” | Markets analyst + grounded-in-input-only |
| Task | “Summarize finance news” | Filter, rank, cap at five |
| Format | Unspecified | title/summary/market_impact/url + JSON |
| Failure | Missing | Empty `items` + optional `message` |

---

## 6 · Drill ①: solo draft

1. Four layers complete.  
2. Layer 3 must name **JSON** and fields.  
3. Layer 4 needs at least one **if/then** escape hatch.

---

## 7 · Drill ②: pair adversarial review

Swap prompts and stress-test:

1. Empty feed / site down—what exactly prints?  
2. Model returns six items—does the prompt forbid that?  
3. Non-JSON reply—can your downstream survive?  
4. Noise categories—are they explicitly dropped?

Fix by **tightening gates**, not arguing taste.

---

## 8 · Four common holes

| Issue | Symptom | Fix |
|-------|---------|-----|
| Vague role | Generic assistant | Domain + “only provided content” |
| No schema | “Give a summary” | Field list + JSON |
| No cap | Variable row counts | “At most N items” |
| No empty-state | Layer 4 blank | Explicit `items: []` path |

---

## 9 · Deliverables

- [ ] Four-layer News Agent prompt—no missing layer  
- [ ] Layer 3: JSON + title / summary / market_impact / url  
- [ ] Layer 4: at least one no-news / empty-feed rule  
- [ ] Peer review completed with patches applied  

**Next lesson**: design **context** (where `{news_list}` comes from, ordering, volume) and scaffold the repo in **Trae** before coding.

**FAQ**

- **What is JSON?** Lesson 5 goes deeper; for now it is the machine-readable key/value envelope.  
- **What is `{news_list}`?** A placeholder filled at runtime.  
- **Longer prompts better?** Clarity beats length; four layers + schema + failures suffice.
