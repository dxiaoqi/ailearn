---
title: "Designing agent tools: four fields, naming, killing overlap"
module: "module-1"
moduleTitle: "Module 1: Prompt engineering basics"
duration: "40 min"
description: "Write tool cards the model can actually follow—function, fit, params, returns—and name them so agents never flip a coin between duplicates."
tags: ["Agent", "Tools", "Specs", "API design"]
expert:
  name: "Kai, tool designer"
  model: "gpt-4o"
  intro: "Hi, I’m Kai—four-part tool specs, naming, overlap 👋"
  systemPrompt: |
    You are Kai, coaching tool descriptions for LLM agents.
    Stress concrete specs and non-overlapping scopes.
    English, ≤200 words unless reviewing a full toolbench.
---

By chapter end you can:

> ✓ Fill the four required fields per tool  
> ✓ Self-review from the agent’s POV  
> ✓ Shrink overlapping tools (50% overlap rule)  
> ✓ Sketch a coherent multi-tool bench for a scenario  

---

## Section 0: tools are the only API

The model only sees your prose cards. Ambiguity there caps agent quality—period.

> **Analogy:** tools without READMEs → random misuse.

---

## Section 1: agent POV review

Ask: with **only** these cards, could *I* pick the right tool, arguments, and parse outputs? If not, edit.

---

## Section 2: the four fields

```
## tool_name
Function: one precise sentence of capability
When to use:
- scenario A
- scenario B
When **not** to use: (if confusing neighbors exist)
- scenario X → use other_tool instead
Parameters:
param (required/optional, type): meaning & format
Returns:
structure + failure behavior
```

### Field 1 — Function  
One sentence that **differentiates** peers.

```widget:before-after
{
  "title": "Function blur vs clarity",
  "subtitle": "Impacts routing accuracy",
  "tabs": [
    {
      "label": "❌ Vague",
      "prompt": "search: find information",
      "analysis": "Web? DB? Files? Agent guesses.",
      "type": "bad"
    },
    {
      "label": "✓ Specific",
      "prompt": "search_web: retrieve public pages/news/reports; no login walls.",
      "analysis": "Immediate fit/no-fit reasoning.",
      "type": "good"
    }
  ]
}
```

### Field 2 — When to use / not  
“Not for internal rows → use query_internal_db” prevents wrong-tool calls.

### Field 3 — Parameters  
Name, type, meaning, bounds, examples.

### Field 4 — Returns  
Shape, fields, empty/error behavior.

```widget:before-after
{
  "title": "Completeness",
  "subtitle": "Skip a field → class of failures",
  "tabs": [
    {
      "label": "❌ Incomplete card",
      "prompt": "Only a one-line blurb—no fit list, no returns.",
      "analysis": "Wrong tool, bad args, surprise parsing.",
      "type": "bad"
    },
    {
      "label": "✓ Full card",
      "prompt": "Function + fit + params + structured returns.",
      "analysis": "Stable autonomous usage.",
      "type": "good"
    }
  ]
}
```

---

## Section 3: naming

- Verb-led (`search_web`, `get_order`)  
- Object in name when ambiguous  
- Distinguish near-neighbors in the name itself  

```widget:before-after
{
  "title": "Names as hints",
  "subtitle": "Bad names multiply cognitive load",
  "tabs": [
    {
      "label": "❌ Opaque",
      "prompt": "tool1, helper, data, process",
      "analysis": "Forces full re-read every call.",
      "type": "bad"
    },
    {
      "label": "✓ Descriptive",
      "prompt": "search_web, query_customer_db, read_uploaded_file, send_slack_dm",
      "analysis": "Intent obvious at a glance.",
      "type": "good"
    }
  ]
}
```

---

## Section 4: overlap hurts

If >50% of use cases “could” use either tool, redesign: **merge**, **split scopes**, or **delete dupes**.

```widget:before-after
{
  "title": "Overlap vs boundaries",
  "subtitle": "More tools ≠ better if redundant",
  "tabs": [
    {
      "label": "❌ Triplicate search",
      "prompt": "search / find / lookup — all “get data”",
      "analysis": "Stochastic routing; flaky runs.",
      "type": "bad"
    },
    {
      "label": "✓ Partitioned search",
      "prompt": "search_web vs query_internal_db vs read_uploaded_file",
      "analysis": "One best tool per info source.",
      "type": "good"
    }
  ]
}
```

---

## Section 5: example bench (content assistant)

`search_web` vs `fetch_url` split **unknown discovery** vs **known URL fetch**—cross-reference “not for” lines so border cases know which to call.

*(Full bilingual example omitted for length—mirrors Chinese lesson’s `write_draft` set.)*

---

## Section 6: exercises

### Exercise 1: rescue bad tools

```widget:prompt-practice
{
  "title": "Exercise 1: diagnose & rewrite",
  "instruction": "For each poor spec below, list issues then rewrite with four fields:\n\n1) get_data — \"fetch needed data\"\n2) process — \"handle input, return result\", param input:string\n3) search — \"search related info\" plus find_info — \"find information\"",
  "original": "Three vague/overlapping tools as above.",
  "scenarios": [
    { "emoji": "🔍", "label": "Naming", "description": "Verbs & scope" },
    { "emoji": "📋", "label": "Spec quality", "description": "Four fields" },
    { "emoji": "⚠️", "label": "Overlap", "description": "Merge / split" }
  ],
  "placeholder": "Tool1 issues…\nRewrite…\n\nTool2…\n\nTool3 overlap fix…",
  "hint": "get_data: name+source+args; process: narrow verb+typed IO; search/find merge or split internal vs web.",
  "systemPrompt": "Score tool rescue (100): diagnosis, four-field rewrite, de-overlap strategy, specificity—25 each. English ≤200 words."
}
```

---

### Exercise 2: analytics agent bench

```widget:prompt-practice
{
  "title": "Exercise 2: analytics toolbox",
  "instruction": "Design 3–4 non-overlapping tools: query data → stats → chart spec → report. Four fields each.",
  "original": "Need: DB pull, aggregates, chart description, final writeup.",
  "scenarios": [
    { "emoji": "🗃️", "label": "Query", "description": "SQL / filters" },
    { "emoji": "📊", "label": "Stats", "description": "Aggregates" },
    { "emoji": "📈", "label": "Viz", "description": "Chart spec" },
    { "emoji": "📝", "label": "Report", "description": "Narrative output" }
  ],
  "placeholder": "## query_…\n## stats_…\n## chart_…\n## write_…",
  "hint": "Separate raw fetch from aggregation; chart tool consumes aggregates, not SQL.",
  "systemPrompt": "Score bench (100): coverage, non-overlap, param clarity, agent POV walkthrough—“sales last week + chart” path—25 each. English ≤200 words."
}
```

---

## Chapter checklist

```widget:checklist
{
  "title": "Chapter 8 checklist",
  "id": "module-1-lesson-8-agent-tools",
  "items": [
    "I know the four tool fields by heart",
    "I POV-review cards before shipping",
    "I apply the 50% overlap rule",
    "I completed Exercise 2’s bounded toolbench"
  ]
}
```

---

> **Next:** context strategies—compaction, files, sub-agents.

---

## Appendix: Exercise 1 pointers

1. **get_data** — meaningless name; specify domain, source, identifiers.  
2. **process** — verb too broad; define actual transform + I/O types.  
3. **search vs find** — merge if identical; else separate corpora explicitly.

---

**Previous** → [Agent prompts 101](/lesson/module-1/07-agent-intro)  
**Next** → [Context management](/lesson/module-1/09-context-management)
