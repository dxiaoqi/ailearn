---
title: "Memory systems: what each layer stores"
module: "module-2"
moduleTitle: "Module 2: Agent engineering"
duration: "30 min"
description: "Three layers—short-term (context), long-term (durable prefs), external (vector/RAG)—when to read/write each, and common mistakes."
tags: ["Memory", "Short-term", "Long-term", "RAG", "Intermediate"]
expert:
  name: "Nora, memory architect"
  model: "gpt-4o"
  intro: "Hi, I’m Nora. Ask me about tiering, read/write timing, and cross-session design 👋"
  systemPrompt: |
    You are Nora, an advisor on agent memory architecture.
    Explain the three layers and common misuses with short analogies.
    Reply in English, under 200 words.
    When asked where to store a fact, ask how long it must live.
---

By the end of this lesson:

> ✓ Describe what each layer stores and for how long  
> ✓ Route a fact to short / long / external  
> ✓ Spot classic mistakes (should persist but didn’t; dump whole KB into context)  
> ✓ Know when to write durable prefs at session end  

**Prerequisites:** Lessons 1–2  

---

## 1 · Memory ≠ context window

Compression optimizes short-term memory. Close the tab and the thread is gone—**unless** you persisted what mattered.

```widget:before-after
{
  "title": "Three memory layers (analogy)",
  "subtitle": "Different time horizons for different tiers",
  "tabs": [
    {
      "label": "Short-term",
      "prompt": "“What we just said”\n\nLike working memory—this screen, last numbers, current dialog.\n\nAgent = context window\nLifetime = this session",
      "analysis": "Holds chat, tool traces, scratch reasoning.\nCleared when the session ends.\nImplementation: the messages array.",
      "type": "neutral"
    },
    {
      "label": "Long-term",
      "prompt": "“You told me last week you’re vegetarian”\n\nDurable prefs, task summaries, style settings.\n\nAgent = database / KV\nLifetime = cross-session",
      "analysis": "Loaded into system text at session start.\nWritten when you explicitly decide what to keep.\nImplementation: Redis/Postgres/dedicated memory service.",
      "type": "good"
    },
    {
      "label": "External",
      "prompt": "“Look up the company handbook”\n\nHuge corpora—docs you cannot memorize.\n\nAgent = vector index + retrieval\nLifetime = independent of any one chat",
      "analysis": "Chunk → embed → store offline.\nOnline: embed query → top-k → inject snippets (RAG).\nImplementation: Pinecone / Weaviate / Chroma, etc.",
      "type": "good"
    }
  ]
}
```

**Two classic failures**

1. **Should persist, didn’t** — prefs only in short-term.  
2. **Should retrieve, dumped** — entire handbook pasted into system prompt.  

---

## 2 · Diagram

```widget:diagram
{
  "title": "Three-layer memory",
  "caption": "Short-term at top; Agent reads/writes context; long-term persists prefs; external supplies retrieved chunks.",
  "svg": "<svg viewBox='0 0 680 400' xmlns='http://www.w3.org/2000/svg'><defs><marker id='am' viewBox='0 0 10 10' refX='8' refY='5' markerWidth='6' markerHeight='6' orient='auto-start-reverse'><path d='M2 1L8 5L2 9' fill='none' stroke='context-stroke' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/></marker></defs><g class='c-blue'><rect x='20' y='15' rx='12' width='400' height='90' stroke-width='0.5'/><text class='th' x='40' y='42'>Short-term</text><text class='ts' x='40' y='62'>= context (chat + tools)</text><text class='ts' x='40' y='80'>Session: now · cap ~128k tok</text></g><text class='ts' x='440' y='42' style='fill:var(--color-text-tertiary)'>Session ends</text><text class='ts' x='440' y='58' style='fill:var(--color-text-tertiary)'>clears ↺</text><g class='c-purple'><rect x='140' y='140' rx='12' width='160' height='70' stroke-width='0.5'/><text class='th' x='220' y='172' text-anchor='middle'>Agent (LLM)</text><text class='ts' x='220' y='192' text-anchor='middle'>plan · act</text></g><line x1='180' y1='105' x2='180' y2='138' stroke='var(--s)' stroke-width='1.5' marker-end='url(#am)'/><line x1='260' y1='138' x2='260' y2='105' stroke='var(--s)' stroke-width='1.5' marker-end='url(#am)'/><g class='c-amber'><rect x='20' y='250' rx='12' width='290' height='90' stroke-width='0.5'/><text class='th' x='40' y='278'>Long-term</text><text class='ts' x='40' y='298'>prefs · summaries</text><text class='ts' x='40' y='316'>DB / KV</text></g><line x1='180' y1='210' x2='120' y2='248' stroke='var(--color-text-success)' stroke-width='1.5' marker-end='url(#am)'/><text class='ts' x='108' y='232' style='fill:var(--color-text-success);font-size:10px'>① start: load</text><line x1='240' y1='248' x2='240' y2='210' stroke='var(--color-accent)' stroke-width='1.5' stroke-dasharray='5 3' marker-end='url(#am)'/><text class='ts' x='248' y='238' style='fill:var(--color-accent);font-size:10px'>④ end: save</text><g class='c-coral'><rect x='370' y='250' rx='12' width='290' height='90' stroke-width='0.5'/><text class='th' x='390' y='278'>External</text><text class='ts' x='390' y='298'>docs · FAQs</text><text class='ts' x='390' y='316'>vector DB</text></g><line x1='280' y1='210' x2='430' y2='248' stroke='var(--color-text-info)' stroke-width='1.5' marker-end='url(#am)'/><text class='ts' x='360' y='220' style='fill:var(--color-text-info);font-size:10px'>② retrieve</text><path d='M500 250 C500 200 400 160 350 105' fill='none' stroke='var(--color-text-info)' stroke-width='1.5' stroke-dasharray='5 3' marker-end='url(#am)'/><text class='ts' x='460' y='190' style='fill:var(--color-text-info);font-size:10px'>③ inject</text><g transform='translate(20,365)'><text class='ts' x='220' y='9' style='fill:var(--color-text-tertiary)'>①②③④ = timeline</text></g></svg>"
}
```

| Moment | What happens | Layers |
|--------|--------------|--------|
| Session start | Load prefs → system | Long → short |
| Mid-chat | Tools append to context; optional retrieval | External → short |
| Session end | LLM or rules pick facts to persist | Short → long |

:::callout{variant="amber" title="Explicit design"}
Long-term read/write **never happens by magic**. If you don’t load prefs at start, the model is blind to yesterday. If you don’t save at end, new prefs die with the thread.
:::

---

## 3 · Sandbox: tier sizing

```widget:sandbox
{
  "title": "Memory tier sandbox",
  "hint": "See how short + injected long + RAG chunks add up",
  "params": [
    { "id": "shortMsgs", "label": "Short-term msgs", "min": 1, "max": 50, "default": 12, "step": 1 },
    { "id": "tokPerMsg", "label": "Tokens per msg", "min": 50, "max": 500, "default": 200, "step": 10, "fmt": "auto" },
    { "id": "longEntries", "label": "Long-term entries injected", "min": 0, "max": 20, "default": 3, "step": 1 },
    { "id": "longTokPer", "label": "Tokens per long entry", "min": 50, "max": 500, "default": 150, "step": 10, "fmt": "auto" },
    { "id": "ragChunks", "label": "RAG chunks", "min": 0, "max": 10, "default": 3, "step": 1 },
    { "id": "chunkTok", "label": "Tokens per chunk", "min": 100, "max": 1500, "default": 512, "step": 50, "fmt": "auto" }
  ],
  "metrics": [
    { "label": "Short-term", "expr": "shortMsgs * tokPerMsg", "fmt": "k" },
    { "label": "Long inject", "expr": "longEntries * longTokPer", "fmt": "auto" },
    { "label": "External inject", "expr": "ragChunks * chunkTok", "fmt": "k" },
    { "label": "Total context", "expr": "shortMsgs * tokPerMsg + longEntries * longTokPer + ragChunks * chunkTok", "fmt": "k", "warnAbove": 80000, "dangerAbove": 115000 }
  ],
  "growth": {
    "title": "Stack as short msgs grow",
    "steps": "shortMsgs",
    "labelExpr": "i",
    "valueExpr": "i * tokPerMsg + longEntries * longTokPer + ragChunks * chunkTok",
    "maxExpr": "128000",
    "fmt": "k"
  }
}
```

---

## 4 · Lab: session lifecycle

```widget:code-playground
{
  "title": "Memory lab",
  "hint": "Watch load → retrieve → answer → persist",
  "mode": "sandbox",
  "files": [
    {
      "path": "agent.js",
      "active": true,
      "code": "import { longTermDB, externalKB } from './memory.js';\n\nconsole.log('━━━ session start ━━━');\nconst userPrefs = longTermDB.read({{userId}});\nconsole.log('📥 long-term prefs:', userPrefs);\nconst systemPrompt = `Travel assistant. User prefs: ${JSON.stringify(userPrefs)}`;\nconst messages = [\n  { role: 'system', content: systemPrompt },\n  { role: 'user', content: {{userMessage}} }\n];\nconst initTokens = countTokens(messages.map(m => m.content).join('')).tokens;\nconsole.log('📋 init context:', initTokens);\n\nconsole.log('\\n━━━ retrieve external ━━━');\nconst chunks = externalKB.search(messages[1].content, {{topK}});\nconsole.log(`📥 chunks: ${chunks.length}`);\nmessages.push({ role: 'system', content: 'Refs:\\n' + chunks.map(c => c.text).join('\\n') });\nconst afterRAG = countTokens(messages.map(m => m.content).join('')).tokens;\nconsole.log('📋 after RAG:', afterRAG, '(+', afterRAG - initTokens, ')');\n\nconsole.log('\\n━━━ LLM ━━━');\nconst response = await callLLM(messages);\nmessages.push({ role: 'assistant', content: response.content });\nconsole.log('Agent:', response.content);\n\nconsole.log('\\n━━━ persist ━━━');\nconst persistDecision = await callLLM([\n  { role: 'system', content: 'Extract durable user prefs from the dialog as JSON {\"prefs\":[{\"key\":\"...\",\"value\":\"...\"}]}. Empty array if none. JSON only.' },\n  { role: 'user', content: messages.map(m => m.role + ': ' + m.content).join('\\n') }\n]);\nconsole.log('🧠 persist JSON:', persistDecision.content);\ntry {\n  const parsed = JSON.parse(persistDecision.content);\n  if (parsed.prefs?.length) {\n    longTermDB.write({{userId}}, parsed.prefs);\n    console.log('📤 saved', parsed.prefs.length, 'prefs');\n  } else console.log('📤 nothing to save');\n} catch { console.log('⚠ parse fail'); }\n",
      "slots": [
        { "id": "userId", "default": "'user_001'", "tooltip": "User key for DB" },
        { "id": "userMessage", "default": "'Family beach trip, kids friendly, budget under 8000, prefer vegetarian options.'", "tooltip": "Try prefs vs none" },
        { "id": "topK", "default": "3", "tooltip": "RAG count" }
      ]
    },
    {
      "path": "memory.js",
      "code": "const _longTermStore = {\n  user_001: { diet: 'vegetarian', style: 'brief', budget: 'medium' },\n  user_002: { diet: 'any', style: 'verbose', budget: 'high' },\n};\nexport const longTermDB = {\n  read(userId) { return _longTermStore[userId] || {}; },\n  write(userId, prefs) {\n    if (!_longTermStore[userId]) _longTermStore[userId] = {};\n    for (const p of prefs) {\n      _longTermStore[userId][p.key] = p.value;\n      console.log(`  💾 ${p.key}=${p.value}`);\n    }\n  },\n};\nconst _kb = [\n  { source: 'Sanya guide', text: 'Yalong Bay beaches, family hotels, some vegetarian menus. Off-season ~3000-6000 CNY/week.' },\n  { source: 'Xiamen', text: 'Gulangyu for kids, vegetarian restaurants, 4000-7000 CNY/week.' },\n  { source: 'Beidaihe', text: 'Budget north beach; fewer veg options. 2000-4000 CNY/week.' },\n];\nexport const externalKB = {\n  search(query, topK) {\n    const scored = _kb.map(doc => {\n      let s = 0;\n      if (/beach|海|sand/i.test(query) && /beach|海/i.test(doc.text)) s += 2;\n      if (/kid|亲子|family/i.test(query) && /family|亲子|kid/i.test(doc.text)) s += 3;\n      if (/veg|素/i.test(query) && /veg|素/i.test(doc.text)) s += 3;\n      return { ...doc, score: s };\n    });\n    scored.sort((a, b) => b.score - a.score);\n    return scored.slice(0, topK);\n  },\n};"
    }
  ],
  "outputHeight": 400
}
```

---

## 5 · Quiz

```widget:quiz
{
  "title": "Memory quiz",
  "questions": [
    {
      "id": "q1",
      "text": "User said “keep answers concise” last week. New session—how does the agent know?",
      "type": "single",
      "options": [
        { "text": "Short-term still has old thread", "correct": false },
        { "text": "Long-term loaded at session start", "correct": true },
        { "text": "External KB stores user prefs", "correct": false }
      ],
      "explanation": "Context clears between sessions. Personal prefs live in durable storage and must be injected explicitly."
    },
    {
      "id": "q2",
      "text": "Answer using a 500-page internal policy. Best layer?",
      "type": "single",
      "options": [
        { "text": "Paste all into short-term", "correct": false },
        { "text": "Store whole PDF in long-term KV", "correct": false },
        { "text": "External vector store + top-k RAG", "correct": true }
      ],
      "explanation": "Corpus >> context. Chunk, embed, retrieve—lesson 7 dives deeper."
    },
    {
      "id": "q3",
      "text": "Intermediate tool outputs in a 10-step chain—where do they live?",
      "type": "single",
      "options": [
        { "text": "Short-term until the chain finishes", "correct": true },
        { "text": "Long-term always", "correct": false },
        { "text": "External index mid-flight", "correct": false }
      ],
      "explanation": "Ephemeral chain state belongs in the running context; persist only final commitments the business needs later."
    }
  ]
}
```

---

## Summary

- **Short / long / external** = session vs durable vs corpus-scale.  
- **Design reads and writes** for long-term.  
- **RAG injects slices**, not whole libraries.  

```widget:checklist
{
  "title": "Lesson 3 checklist",
  "id": "module-2-lesson-03-en",
  "items": [
    "I can name what each layer stores",
    "I can place a new fact in the right layer",
    "I understand explicit persistence",
    "I ran the tier sandbox",
    "I ran the lifecycle lab",
    "I finished the quiz"
  ]
}
```

---

[← Prev](/lesson/module-2/02-context-compression) · [Next →](/lesson/module-2/04-tool-use)
