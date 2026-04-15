---
title: "What is an agent, and what can it do?"
module: "module-3"
moduleTitle: "Macro analysis agent in practice (phase 1)"
duration: "~100 min"
description: "Build a mental model of agents vs chat, Agent / Automation / Human nodes, then ship a flowchart and a natural-language role card for a daily AP News finance briefing agent."
tags: ["Agent", "Node types", "Flowchart", "Role card", "AP News"]
expert:
  name: "Macro mentor Lin"
  model: "gpt-4o"
  intro: "Hi, I'm Lin. I help you design agent workflows for finance—flowcharts, role cards, and node types."
  systemPrompt: |
    You are Lin, a course coach for finance practitioners designing AI agent workflows.
    Reply in English, max ~200 words; state the takeaway first; use AP News and research-prep style examples.
---

By the end of this lesson you can:

- Contrast chat-style use from an agent that runs a job  
- Label steps as Agent / Automation / Human  
- Draw a flowchart for an “AP News finance digest” with at least one failure branch  
- Fill a News Agent role card in prose, including a non-empty “on failure” clause  

---

## Pacing (reference)

| Time | Block | Notes |
|------|--------|------|
| 0–10′ | Warm-up | One line each: repetitive “manual information work” |
| 10–30′ | Core① What is an agent? | Analogies + Q&A |
| 30–45′ | Core ② Node types | Rapid finance-flavored drills |
| 45–65′ | Drill ① Flowchart | Solo, instructor circulates |
| 65–75′ | Share | 2–3 volunteers, critique edges & failures |
| 75–90′ | Drill ② Role card | Five-field template |
| 90–100′ | Preview + Q&A | Next: turn the card into a prompt |

---

## 1 · Opening: manual information work

**Prompt**: How much time do you spend tidying information by hand? If you had a junior analyst, how would you brief them?

Capture examples (headlines, research summaries, morning notes). Optionally sort by **source** vs **output shape**—you will reuse these scenarios.

**Bridge**: Most tasks are “signals in → process → conclusion out.” Question: **can an agent own this?** How is that different from casual ChatGPT use?

---

## 2 · Concept: what is an agent?

Typical chat is **you ask, it answers**—you drive every turn.

An **agent** is closer to a **taskable analyst**: you assign “every morning, scan AP News for market-moving items and draft five bullets,” and it can fetch data, use tools, judge relevance, and report when done.

| Chat-style use | Agent |
|----------------|-------|
| Turn-by-turn, you present | Job-style brief, can run async |
| Rarely calls external tools | Can hit the web, files, APIs |
| You push each step | Can retry within guardrails |

**Analogy**: once a junior understands the standing order, they repeat it daily and only escalate true ambiguities. **Autonomy + tools + some error handling** are the hallmarks.

> **vs RPA (FAQ)**: RPA replays fixed UI steps; one selector change can break it. Agents lean on semantics and judgment—closer to a human reading context.

---

## 3 · Three node types

Not every step needs an LLM.

1. **Agent node**: needs language understanding or judgment; hard to capture with rigid rules.  
   *e.g. score importance, write summaries, tie items to market narrative.*

2. **Automation node**: deterministic execution.  
   *e.g. cron, save file, convert format, send email.*

3. **Human node**: accountability, compliance, or subjective strategy.  
   *e.g. final portfolio decision, risk sign-off.*

**Quick quiz**:

- Daily 08:00 fetch job → **Automation**  
- “Does this headline matter for equities?” → **Agent**  
- Persist JSON to disk → **Automation**  
- “Do we rebalance today?” → **Human**

**Principle**: agent steps cost more and fail in richer ways. **Prefer automation when rules suffice; never skip human gates where policy requires it.**

> If unsure, ask: does this step need **semantic judgment**? Yes → Agent; no → Automation. When still fuzzy, bias to automation for reliability.

---

## 4 · Drill ①: flowchart — AP News digest

**Scenario**: automate a **finance-relevant** digest from AP News each morning.

**Requirements**:

1. Label every step **Agent / Automation / Human**.  
2. Include **at least one failure branch** (site down, empty list, timeout).

**Review angles**: mis-labeled “save file” as Agent; vague “on error” branches; missing storage or trigger steps.

---

## 5 · Drill ②: News Agent role card

The flowchart is the system; the **role card** is the **job description** inside the agent node. This lesson stays in prose; **next lesson** upgrades it to a strict prompt.

| Field | Meaning |
|-------|---------|
| Goal | Business outcome |
| Inputs | What feeds are allowed, caps, fields |
| Processing | Filter/sort/extract rules in words |
| Outputs | Max items, fields per item |
| On failure | Empty feed, upstream errors, no relevant news—**no fabrication** |

---

## 6 · FAQ (short)

- **Is this “hard CS”?** The track stresses crisp requirements more than syntax.  
- **Does it become real software?** Lesson 4 runs in the terminal; lesson 5 can become a small web app.  
- **Why AP News?** Free, credible, relatively stable HTML—swap later if you like.

---

## 7 · Deliverables

- [ ] Flowchart with node types + ≥1 failure path  
- [ ] Role card with five fields; “on failure” filled in  
- [ ] Can explain scope, non-goals, failure behavior, and node types aloud  

**Next lesson**: four-layer prompts as **logic gates**, plus **JSON** so code can parse outputs reliably.
