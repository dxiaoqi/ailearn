---
title: "Web product + phase recap + JSON primer"
module: "module-3"
moduleTitle: "Macro analysis agent in practice (phase 1)"
duration: "~100 min"
description: "Productize the CLI pipeline as a refreshable web app via Trae, recap the five-lesson arc, and learn minimal JSON discipline to prep multi-agent handoffs."
tags: ["Flask", "Shipping", "JSON", "Recap", "Trae"]
expert:
  name: "Product coach Eli"
  model: "gpt-4o"
  intro: "I'm Eli—turning briefs into Trae-friendly specs and explaining why JSON beats prose for machines."
  systemPrompt: |
    You are Eli, helping finance learners ship small AI pipelines as demoable web products.
    English, ~200 words max; emphasize crisp requirements and acceptance tests, not framework trivia.
---

By the end of this lesson you can:

- Draft a product brief before touching Trae, then translate it into a long, testable instruction  
- Run the local stack (often Flask) and verify cards, refresh, and loading states in the browser  
- Narrate the five-lesson thread: diagram → prompt → context → scripts → web UI  
- State three JSON rules and rewrite a sample `market_impact` sentence into structured JSON  

---

## Pacing (reference)

| Time | Block | Notes |
|------|--------|------|
| 0–5′ | Goal | From terminal to shareable UI |
| 5–15′ | Brief | Solo + pair read |
| 15–40′ | Instructor demo | Brief → Trae → backend choice |
| 40–70′ | Independent build | Personal variants |
| 70–75′ | Showcase | Browser acceptance |
| 75–… | Optional deploy | e.g. Vercel—instructor adds |
| …–88′ | Recap | Five-step arc |
| 88–96′ | JSON primer | Rules + micro exercise |
| 96–100′ | Phase 2 teaser | Multi-agent JSON pipes |

---

## 1 · Why a written brief first?

In vibe coding, **precision upstream beats heroics downstream**. Replace “make it nicer” with observable traits: dark theme, card grid, headline/summary/impact chip, outbound link, etc.

---

## 2 · Sample mega-prompt for Trae

Use as a baseline, then personalize:

```
I already have:
- fetch_news.py → writes AP News rows to data/summary.json under raw_news
- news_agent.py → reads raw_news, calls Claude, writes items

items shape: [{"title":"...","summary":"...","market_impact":"...","url":"..."}]

Build a web product.

UI:
- Card layout for each item, dark professional styling (finance news cues)
- Each card: title, summary, market impact as a tag/chip, link to source

Interaction:
- “Refresh now” button triggers both scripts
- Show a loading state while work runs
- When data updates, re-render the list

Automation:
- Schedule a daily 08:00 run

Pick the stack; I care about the behavior and polish.
```

**Teaching beat**: if Trae picks **Flask**, note that browsers cannot execute local Python directly—you need a **backend** to accept clicks, run scripts, return JSON. Mastery of Flask internals is **not** required; running and **acceptance testing** is.

**Iteration examples**: spacing, dead clicks, responsive column collapse—describe symptoms plainly to Trae.

---

## 3 · Independent lab

1. Drive from **your** brief—don’t clone the instructor verbatim.  
2. On bugs, narrate **symptoms** first (“button spins forever”, “network500 on /api/news”).  
3. Launch via Trae’s instructions (`python app.py` common); open `http://localhost:5000` unless Trae sets another port.  
4. Accept when cards, refresh, and loading states behave.

**Instructor stance**: coach Trae communication, not syntax—unless it is clearly environment.

**Frequent snags**: stack traces to Trae; blank page → API JSON path; missing loading state → front-end handler.

---

## 4 · Phase 1 recap

1. Flow + role card  
2. Four-layer prompt + JSON schema  
3. Context doc + repo scaffold  
4. Fetch + analyze scripts in the terminal  
5. Web shell with refresh

**Arc**: from a sticky note spec to a clickable product.

---

## 5 · JSON primer (sets up phase 2)

**Motivation**: another agent or service must read `market_impact` and extract assets/directions—**plain prose is brittle**.

### Three rules

1. **Name every value** — `{"direction": "down"}` beats a bare `"down"`.  
2. **Use real types** — store `-1.2` as a number when you mean percent change.  
3. **Nest when needed** — multiple impacts become an array of objects.

### Micro drill (~3 min)

Sentence: “On Fed hike expectations, USD strengthens and gold sells off.”

Example encoding:

```json
{"trigger": "Fed hike expectations", "impacts": [{"asset": "USD", "direction": "up"}, {"asset": "Gold", "direction": "down"}]}
```

---

## 6 · Phase 2 teaser

- Add an **analyst agent** that consumes news JSON.  
- Agents coordinate through **JSON contracts**, not loose chat.  
- Automate fetch → analyze → publish loops.

---

## 7 · Full artifact checklist

- [ ] Flowchart  
- [ ] Role card  
- [ ] Four-layer prompt  
- [ ] Context worksheet  
- [ ] `fetch_news.py` + `news_agent.py`  
- [ ] Working web UI with refresh  
- [ ] JSON micro-translation  
