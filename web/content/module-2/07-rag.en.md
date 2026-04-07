---
title: "RAG: injecting external knowledge safely"
module: "module-2"
moduleTitle: "Module 2: Agent engineering"
duration: "30 min"
description: "Offline chunking + embedding + online retrieval—balance chunk size and top-k; keep embedding models consistent."
tags: ["RAG", "Embeddings", "Chunking", "Intermediate"]
expert:
  name: "Mika, retrieval architect"
  model: "gpt-4o"
  intro: "Hi, I’m Mika—chunks, top-k, embedding drift 👋"
  systemPrompt: |
    You are Mika, advising on RAG systems.
    Quantify retrieval vs brute-force context.
    Reply in English, under 250 words.
---

By the end of this lesson:

> ✓ Explain knowledge-cutoff + private data gaps  
> ✓ Sketch offline index + online retrieval  
> ✓ Tune chunk size and top-k  
> ✓ Demand embedding parity between index and query  

**Prerequisites:** Lessons 1 & 3  

---

## 1 · Why bolt static models to live corpora?

| Gap | Meaning |
|-----|---------|
| Knowledge cutoff | Training date ends |
| Private data | Never seen in pretraining |

**RAG:** retrieve **k** text chunks, inject only those snippets.

```widget:before-after
{
  "title": "Dump vs retrieve",
  "subtitle": "500-page handbook, question about returns",
  "tabs": [
    {
      "label": "Dump",
      "prompt": "250k tokens >> 128k window—even if it fit, mostly noise and huge cost.",
      "analysis": "Impractical for most orgs.",
      "type": "bad"
    },
    {
      "label": "RAG",
      "prompt": "Embed query → top-3 chunks ≈ 1.5k tokens → answer cites sources.",
      "analysis": "Low noise, controlled spend, scales to TB corpora.",
      "type": "good"
    }
  ]
}
```

| Phase | When | Flow |
|-------|------|------|
| Index | Ingest | chunk → embed → store |
| Query | Each question | embed question → search → inject top-k |

---

## 2 · Pipeline diagram

```widget:diagram
{
  "title": "RAG stages",
  "caption": "Offline index above the line; online retrieval below—same embedding model both sides.",
  "svg": "<svg viewBox='0 0 660 300' xmlns='http://www.w3.org/2000/svg'><text class='ts' x='20' y='18' style='fill:var(--color-text-tertiary)'>Offline index</text><g class='c-gray'><rect x='20' y='28' rx='8' width='90' height='34' stroke-width='0.5'/><text class='ts' x='65' y='50' text-anchor='middle'>Docs</text></g><g class='c-blue'><rect x='150' y='28' rx='8' width='90' height='34' stroke-width='0.5'/><text class='ts' x='195' y='50' text-anchor='middle'>Chunk</text></g><g class='c-purple'><rect x='280' y='28' rx='8' width='120' height='34' stroke-width='0.5'/><text class='ts' x='340' y='50' text-anchor='middle'>Embed</text></g><g class='c-teal'><rect x='440' y='28' rx='8' width='130' height='34' stroke-width='0.5'/><text class='ts' x='505' y='50' text-anchor='middle'>Vector DB</text></g><rect x='0' y='82' width='660' height='1' fill='var(--b)'/><text class='ts' x='20' y='108' style='fill:var(--color-text-tertiary)'>Online query</text><g class='c-gray'><rect x='20' y='118' rx='8' width='90' height='34' stroke-width='0.5'/><text class='ts' x='65' y='140' text-anchor='middle'>Query</text></g><g class='c-purple'><rect x='150' y='118' rx='8' width='120' height='34' stroke-width='0.5'/><text class='ts' x='210' y='140' text-anchor='middle'>Embed</text></g><text class='ts' x='210' y='165' text-anchor='middle' style='fill:var(--color-text-danger);font-size:10px'>same model</text><g class='c-teal'><rect x='310' y='118' rx='8' width='120' height='34' stroke-width='0.5'/><text class='ts' x='370' y='140' text-anchor='middle'>top-k</text></g><g class='c-amber'><rect x='470' y='118' rx='8' width='120' height='34' stroke-width='0.5'/><text class='ts' x='530' y='140' text-anchor='middle'>Inject</text></g><g class='c-purple'><rect x='440' y='180' rx='8' width='180' height='34' stroke-width='0.5'/><text class='ts' x='530' y='202' text-anchor='middle'>LLM answers</text></g><text class='th' x='330' y='250' text-anchor='middle'>Key knobs</text><text class='ts' x='330' y='275' text-anchor='middle'>chunk size × top-k ≈ injected tokens</text></svg>"
}
```

---

## 3 · Sandbox: chunk × k

```widget:sandbox
{
  "title": "RAG knobs",
  "hint": "Watch injected tokens",
  "params": [
    { "id": "chunkSize", "label": "Chunk tokens", "min": 128, "max": 2048, "default": 512, "step": 128, "fmt": "auto" },
    { "id": "topK", "label": "top-k", "min": 1, "max": 10, "default": 3, "step": 1 },
    { "id": "docPages", "label": "Pages (est.)", "min": 10, "max": 1000, "default": 200, "step": 10, "fmt": "auto" },
    { "id": "tokPerPage", "label": "Tokens/page", "min": 200, "max": 800, "default": 500, "step": 50, "fmt": "auto" },
    { "id": "queryTok", "label": "Prompt overhead", "min": 200, "max": 1000, "default": 400, "step": 50, "fmt": "auto" }
  ],
  "metrics": [
    { "label": "Chunk count", "expr": "docPages * tokPerPage / chunkSize", "fmt": "auto" },
    { "label": "Injected tok", "expr": "topK * chunkSize", "fmt": "k" },
    { "label": "Total ctx", "expr": "queryTok + topK * chunkSize", "fmt": "k", "warnAbove": 60000, "dangerAbove": 110000 },
    { "label": "% of 128k", "expr": "(queryTok + topK * chunkSize) / 128000 * 100", "fmt": "%", "warnAbove": 50, "dangerAbove": 85 }
  ],
  "growth": {
    "title": "Context vs k",
    "steps": "topK",
    "labelExpr": "i",
    "valueExpr": "queryTok + i * chunkSize",
    "maxExpr": "128000",
    "fmt": "k"
  }
}
```

---

## 4 · Lab: mini RAG

```widget:code-playground
{
  "title": "RAG lab",
  "hint": "Change topK / chunk",
  "mode": "sandbox",
  "files": [
    {
      "path": "rag.js",
      "active": true,
      "code": "import { knowledgeBase, search } from './knowledge.js';\nconst query = {{query}};\nconst topK = {{topK}};\nconst chunkSize = {{chunkSize}};\nconsole.log('Q:', query, 'k:', topK, 'chunk:', chunkSize);\nconst chunks = knowledgeBase(chunkSize);\nconsole.log('chunks', chunks.length);\nconst results = search(query, chunks, topK);\nfor (let i=0;i<results.length;i++) console.log('#'+(i+1), results[i].source, results[i].text.slice(0,80));\nconst ctx = results.map((r,i)=>'['+(i+1)+':'+r.source+'] '+r.text).join('\\n\\n');\nconst resp = await callLLM([\n {role:'system',content:'Support bot. Only use provided references. If missing, say you cannot find it. <=100 words, cite [#].'},\n {role:'user',content:'Refs:\\n'+ctx+'\\nQ:'+query}\n]);\nconsole.log('💬', resp.content);\n",
      "slots": [
        { "id": "query", "default": "'What is your return policy and how many days?'" },
        { "id": "topK", "default": "3" },
        { "id": "chunkSize", "default": "500" }
      ]
    },
    {
      "path": "knowledge.js",
      "code": "const RAW=[\n {source:'Returns',text:'Within 30 days unopened full refund. Opened: 7 days with 10% fee. Bring receipt. Non-returnable: specials & custom. Refund in 3-5 biz days.'},\n {source:'Warranty',text:'12-month hardware warranty. No accidental damage. Repairs 7-14 days. Extended plans ~8%/yr.'},\n {source:'Shipping',text:'Standard 3-5 days, $15 freight; free >$299. Express +$25. Remote +2-3 days.'},\n {source:'Loyalty',text:'Silver >$2000 spend: 5% off. Gold >$8000: 10% + priority support.'},\n {source:'Payments',text:'Cards + wallets. Installments >$1000: 3/6/12 mo.'},\n {source:'Support',text:'Chat 9-21 weekdays. Phone 400-xxx weekdays 9-18. Email 48h. Emergency path in app.'},\n];\nexport function knowledgeBase(size){\n const out=[];\n for(const d of RAW){\n  if(d.text.length<=size) out.push({...d});\n  else for(let i=0;i<d.text.length;i+=size) out.push({source:d.source,text:d.text.slice(i,i+size)});\n }\n return out;\n}\nexport function search(query, chunks, k){\n const scored=chunks.map(c=>{\n  let s=0;\n  for(const w of query.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)){\n   if(c.text.toLowerCase().includes(w)) s++;\n   if(c.source.toLowerCase().includes(w)) s+=2;\n  }\n  if(/return|refund|退/.test(query)&&/return|refund|退/.test(c.text)) s+=10;\n  if(/warranty|保/.test(query)&&/warranty|保/.test(c.text)) s+=10;\n  return {...c,score:s};\n });\n scored.sort((a,b)=>b.score-a.score);\n return scored.slice(0,k).filter(r=>r.score>0);\n}"
    }
  ],
  "outputHeight": 380
}
```

---

## 5 · Quiz

```widget:quiz
{
  "title": "RAG quiz",
  "questions": [
    {
      "id": "q1",
      "text": "Chunk size tradeoff?",
      "type": "single",
      "options": [
        { "text": "Bigger always better", "correct": false },
        { "text": "Smaller always better", "correct": false },
        { "text": "Balance noise vs completeness—often 512–1024 tok", "correct": true }
      ],
      "explanation": "Huge chunks add irrelevant text; tiny chunks split semantics."
    },
    {
      "id": "q2",
      "text": "Why not paste the entire KB?",
      "type": "single",
      "options": [
        { "text": "Just slower", "correct": false },
        { "text": "KB ≫ context, noisy, costly", "correct": true },
        { "text": "LLM cannot read long strings", "correct": false }
      ],
      "explanation": "Even with bigger windows, retrieval keeps signal high."
    },
    {
      "id": "q3",
      "text": "Index with model A, query with model B?",
      "type": "single",
      "options": [
        { "text": "Fine", "correct": false },
        { "text": "Slightly slower", "correct": false },
        { "text": "Invalid—vectors live in different spaces", "correct": true }
      ],
      "explanation": "Use one embedding model end-to-end."
    }
  ]
}
```

---

## Summary

- RAG solves **freshness + private corpora**.  
- **Chunk × top-k** sets context cost.  
- **Same embedding model** for ingest and query.  

```widget:checklist
{
  "title": "Lesson 7 checklist",
  "id": "module-2-lesson-07-en",
  "items": [
    "I can sketch the two-phase pipeline",
    "I can reason about chunk vs k",
    "I ran the RAG lab",
    "Quiz done"
  ]
}
```

---

[← Prev](/lesson/module-2/06-multi-agent) · [Back to course](/courses/agent-engineering)

**You finished the Agent engineering track.** 🎉
