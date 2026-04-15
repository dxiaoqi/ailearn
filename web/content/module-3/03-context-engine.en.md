---
title: "Context engine: the right inputs + project scaffold"
module: "module-3"
moduleTitle: "Macro analysis agent in practice (phase 1)"
duration: "~100 min"
description: "Learn three context rules (what, order, how much), finish a context design doc, scaffold the news_agent tree in Trae, install deps, and preview the AP News Business page before coding."
tags: ["Context", "Trae", "Scaffold", "AP News", "Pipeline"]
expert:
  name: "Build coach Ren"
  model: "gpt-4o"
  intro: "I'm Ren—context boundaries, Trae layouts, and dependency sanity checks."
  systemPrompt: |
    You are Ren, coaching context design and light engineering for finance workflows.
    English, ~200 words max; focus on information bounds, injection order, cost; minimal code detail.
---

By the end of this lesson you can:

- State the three context rules and why “input quality drives output quality”  
- Complete a context design worksheet (source, fields, caps, order, failures)  
- Scaffold the repo in Trae, install requirements, and orient yourself on AP News Business  

---

## Pacing (reference)

| Time | Block | Notes |
|------|--------|------|
| 0–5′ | Review | Where `{news_list}` comes from |
| 5–30′ | Three rules | Demo overload vs curated |
| 30–50′ | Drill ① | Context worksheet |
| 50–55′ | Trae UI | Tree / terminal / AI chat |
| 55–80′ | Drill ② | Generate tree + pip |
| 80–90′ | AP News tour | List cells, headline, time, URL |
| 90–100′ | Preview | API key + `python --version` |

---

## 1 · Prompts are ready—where is the reading pack?

Models do not browse AP News for you. Before each run you assemble the **reading pack** and inject it—this is **context engineering**.

---

## 2 · Three rules

**Analogy**: board packs—empty, 500 random pages, or ten curated pages with the right ordering.

### Rule 1 — What goes in?

- Good: headline, timestamp, ~100 chars of lede, canonical URL; today’s date.  
- Bad: full articles × many rows; off-topic sections; stale noise crowding today.

### Rule 2 — Order (recommended)

1. Role  
2. Today’s date  
3. News list  
4. Task  
5. Output guardrails  

Establish identity, hand over materials, restate the job.

### Rule 3 — How much?

- Example cap: **≤20** rows, **~100 characters** of summary each.  
- Too many rows dilute signal; full text explodes latency and cost.

**Class demo**: identical prompt, first feed 50 noisy items, then ~15 finance-skewed items—compare outputs to show **context, not clever wording**, is the lever.

---

## 3 · Drill ①: context worksheet

Fill: **source / fields / limits / injection order / failure behavior**.

**Coach note**: “Source = entire site” is a smell—filter sections upstream so the window isn’t 80% noise.

---

## 4 · Trae surfaces

- **File tree** — edit files.  
- **Terminal** — `python`, `pip`.  
- **AI chat** — natural language codegen / refactors.

This lesson emphasizes **scaffolding**; lesson 4 runs the scripts.

---

## 5 · Drill ②: scaffold via Trae

Paste into Trae (instructor demos, learners mirror):

```
Create a project named news_agent with:

- app.py (Flask backend stub; comment: finish in lesson 5)
- fetch_news.py (comment: fetch from apnews.com)
- news_agent.py (comment: call Claude API for summaries)
- index.html (comment: web UI in lesson 5)
- data/summary.json initial: {"date": "", "raw_news": [], "items": []}
- .env with ANTHROPIC_API_KEY=your_api_key_here
- .gitignore ignoring .env and __pycache__
- requirements.txt lines: requests, beautifulsoup4, anthropic, flask, python-dotenv, apscheduler, flask-cors

Add short header comments to each Python file.
```

**Learner steps**

1. Send prompt; verify files.  
2. Run `pip install -r requirements.txt` (or `pip3` / `python -m pip`).  
3. Open `.env`; real key arrives in lesson 4.

**Common issues**: `pip` not found; network timeouts (mirror); partial file creation—resend or add files manually.

---

## 6 · AP News orientation

Visit `https://apnews.com/hub/business` and note list placement, headline/time/summary patterns, and article URL shapes. Lesson 4 asks Trae to implement fetchers—you only need a **visual map** today.

---

## 7 · Before lesson 4

1. Replace `your_api_key_here` with a real Anthropic key.  
2. Confirm `python --version` (or `python3`) prints 3.x.

---

## 8 · Deliverables

- [ ] Context worksheet complete (five sections)  
- [ ] Trae tree matches the scaffold  
- [ ] `pip install -r requirements.txt` succeeds  
- [ ] You can find the Business hub and read its list layout  
- [ ] (After class) `.env` holds a real key  

**Next**: **Vibe coding**—generate `fetch_news.py` and `news_agent.py`, see real summaries in the terminal.
