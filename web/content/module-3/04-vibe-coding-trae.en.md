---
title: "Vibe coding: ship the pipeline with Trae"
module: "module-3"
moduleTitle: "Macro analysis agent in practice (phase 1)"
duration: "~100 min"
description: "Use the four-step vibe-coding loop (manual flow, I/O contract, Trae codegen, run-to-verify) to finish fetch_news.py and news_agent.py—fetch AP News, call Claude, write summary.json."
tags: ["Vibe coding", "Trae", "I/O contract", "Claude API", "Python"]
expert:
  name: "Lab coach Miko"
  model: "gpt-4o"
  intro: "I'm Miko—four-step Trae workflows and I/O contracts. Paste the last error line if stuck."
  systemPrompt: |
    You are Miko, teaching finance folks to ship small Python utilities via Trae and plain-language specs.
    English, ~200 words max; stress validating outputs against contracts, not reading every line.
---

By the end of this lesson you can:

- Recite the four vibe-coding steps and why you must verify outputs even if you skip reading code  
- Implement `fetch_news()` persisting `raw_news` inside `data/summary.json`  
- Implement `run_agent()` reading `raw_news`, calling Claude, updating `items` and `last_updated`  
- Run both scripts back-to-back and debug the frequent failure modes  

---

## Pacing (reference)

| Time | Block | Notes |
|------|--------|------|
| 0–10′ | Env check | Python, key, deps |
| 10–20′ | Method | Four steps |
| 20–35′ | Demo | fetch_news |
| 35–55′ | Lab | fetch_news |
| 55–70′ | Demo | news_agent |
| 70–88′ | Lab | news_agent |
| 88–96′ | Debug clinic | Common errors |
| 96–100′ | Celebrate | Web UI next |

---

## 1 · Environment check

```bash
python --version
# or
python3 --version
```

Expect Python 3.x. Open `.env` and confirm `ANTHROPIC_API_KEY` is a real secret—not the placeholder.

**Quick fixes**: use `python3` if `python` missing; `pip install requests beautifulsoup4 anthropic python-dotenv` if imports fail.

---

## 2 · Four-step vibe coding

1. **Narrate the manual flow** — how would a human do it?  
2. **Write the I/O contract** — inputs, happy path outputs, failure outputs.  
3. **Ask Trae to codegen** — paste steps + contract together.  
4. **Run and verify** — terminal + JSON must match the contract; iterate in natural language.

You may skip line-by-line reading, but **not** acceptance testing.

---

## 3 · `fetch_news.py` contract

| Item | Spec |
|------|------|
| Function | `fetch_news()` |
| Args | None |
| Success | Write `raw_news` array into `data/summary.json` with `title, time, summary, url`; max 20 rows; print count |
| Failure | Print error; set `raw_news` to `[]`; preserve other JSON keys |

**Sample Trae brief** (tune selectors with real HTML):

```
Implement fetch_news.py.

Manual flow:
1) Open https://apnews.com/hub/business
2) Collect headline items  
3) For each: title, publish time, ~100 char lede, canonical URL
4) Keep newest 20
5) Persist JSON

I/O contract:
- fetch_news() takes no args
- On success: merge into data/summary.json under "raw_news", print "Fetched N items"
- On failure: print stack/context, set raw_news to []

Tech: requests + BeautifulSoup; 10s timeout + 1 retry; mkdir data/ if missing; merge without clobbering other keys.

Add:
if __name__ == "__main__":
    fetch_news()
```

**Verify**: `python fetch_news.py` then inspect `raw_news`. If zero rows, ask Trae for broader selectors (e.g., anchor tags whose href contains `/article/`).

---

## 4 · `news_agent.py` contract

| Item | Spec |
|------|------|
| Function | `run_agent()` |
| Reads | `raw_news` from `data/summary.json` |
| Success | Update `items` + `last_updated`; each item has `title, summary, market_impact, url` |
| Failure | Print error; avoid corrupting prior `items` if you choose to freeze state |

Load `ANTHROPIC_API_KEY` via `python-dotenv`—never commit secrets.

**Sample Trae brief** (align the middle block with your lesson 2 prompt):

```
Implement news_agent.py.

Behavior:
- Read raw_news from data/summary.json
- Call Claude with the News Agent prompt template (inject the list where {news_list} goes)
- Require JSON {"items":[...]} with fields title, summary, market_impact, url; empty list allowed
- On success: write items + last_updated; keep raw_news untouched
- On failure: print details; leave items as-is

Use anthropic SDK; pick a Claude Sonnet model string that your API key supports (if a lesson nickname like claude-sonnet-4-6 fails, substitute the current Sonnet ID from Anthropic docs)
Add robust JSON extraction (models sometimes wrap JSON with prose)

Add:
if __name__ == "__main__":
    run_agent()
```

**End-to-end**: `python fetch_news.py` then `python news_agent.py`; inspect `items`.

---

## 5 · Frequent issues

| Signal | Likely cause | Next step |
|--------|--------------|-----------|
| `ModuleNotFoundError` | Missing wheel | Install stack |
| Empty `raw_news` | CSS selectors | Broaden parsing |
| JSON errors on disk | Corrupt file | Reset baseline object |
| `AuthenticationError` | Bad key / `.env` | Fix `KEY=value` formatting |
| Empty `items` | No finance hits today | Acceptable or loosen filter |

---

## 6 · Deliverables

- [ ] `fetch_news.py` fills `raw_news`  
- [ ] `news_agent.py` fills `items` (or valid empty set)  
- [ ] You can explain fetch vs analyze responsibilities  

**Next lesson**: turn the same JSON into a **refreshable web product** (Flask + UI), then recap phase 1 and preview structured JSON for phase 2.
