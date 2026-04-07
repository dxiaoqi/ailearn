---
title: "Multi-agent collaboration: when one agent is not enough"
module: "module-2"
moduleTitle: "Module 2: Agent engineering"
duration: "40 min"
description: "Orchestrator vs workers—parallelism, isolated contexts, failure containment, and when multi-agent overhead is justified."
tags: ["Multi-agent", "Orchestrator", "Parallelism", "Advanced"]
expert:
  name: "Hana, collaboration architect"
  model: "gpt-4o"
  intro: "Hi, I’m Hana—orchestration, fan-out, graceful degradation 👋"
  systemPrompt: |
    You are Hana, advising on multi-agent designs.
    Explain orchestrator vs sub-agent boundaries.
    Reply in English, under 250 words.
---

By the end of this lesson:

> ✓ Recognize context, skill, latency, and blast-radius limits of a single agent  
> ✓ State orchestrator vs sub-agent duties  
> ✓ Compare parallel vs serial fan-out  
> ✓ Pick retry / degrade / failover patterns  

**Prerequisites:** Lessons 1–4  

---

## 1 · Why multiple agents?

| Bottleneck | Issue | Example |
|------------|-------|---------|
| Context | One window cannot hold everything | Ten competitor dossiers |
| Skills | One system prompt can’t specialize | Code + copy + legal |
| Latency | Serial fan-out is slow | Five independent searches |
| Failures | One tool stall blocks all | API timeout mid-pipeline |

**Pattern:** coordinator + experts instead of one “do everything” agent.

```widget:before-after
{
  "title": "Single vs multi-agent",
  "subtitle": "Research three competitors’ sites, pricing, reviews",
  "tabs": [
    {
      "label": "Single agent",
      "prompt": "Serial searches, one giant context, any failure stalls the chain.",
      "analysis": "Slow, hot context, tight coupling.",
      "type": "bad"
    },
    {
      "label": "Multi-agent",
      "prompt": "Orchestrator fans out per competitor; parallel contexts; isolate failures; merge summaries.",
      "analysis": "Faster wall-clock, bounded contexts per worker, partial results possible.",
      "type": "good"
    }
  ]
}
```

| Role | Does | Doesn’t |
|------|------|---------|
| Orchestrator | Decompose, dispatch, merge | Execute every tool itself |
| Sub-agent | Own subtask end-to-end | See the full org chart |
| Specialist | Domain expert surface | Handle unrelated domains |

---

## 2 · Diagram

```widget:diagram
{
  "title": "Orchestrator pattern",
  "caption": "Fan-out, parallel sub-agents, aggregate.",
  "svg": "<svg viewBox='0 0 640 340' xmlns='http://www.w3.org/2000/svg'><g class='c-purple'><rect x='200' y='66' rx='10' width='240' height='44' stroke-width='0.5'/><text class='th' x='320' y='92' text-anchor='middle'>Orchestrator</text></g><g class='c-teal'><rect x='30' y='150' rx='10' width='140' height='70' stroke-width='0.5'/><text class='th' x='100' y='185' text-anchor='middle'>Worker A</text></g><g class='c-teal'><rect x='250' y='150' rx='10' width='140' height='70' stroke-width='0.5'/><text class='th' x='320' y='185' text-anchor='middle'>Worker B</text></g><g class='c-teal'><rect x='470' y='150' rx='10' width='140' height='70' stroke-width='0.5'/><text class='th' x='540' y='185' text-anchor='middle'>Worker C</text></g><g class='c-purple'><rect x='200' y='262' rx='10' width='240' height='34' stroke-width='0.5'/><text class='th' x='320' y='284' text-anchor='middle'>Merge</text></g></svg>"
}
```

:::callout{variant="amber" title="Failure modes"}
Retry the sub-task → if still bad, degrade with partial outputs → optionally swap specialist implementations.
:::

---

## 3 · Sandbox

```widget:sandbox
{
  "title": "Single vs multi-agent timing",
  "hint": "Toggle parallel multi-agent",
  "params": [
    { "id": "subTasks", "label": "Subtasks", "min": 1, "max": 8, "default": 3, "step": 1 },
    { "id": "taskDelay", "label": "Each task ms", "min": 500, "max": 5000, "default": 2000, "step": 500, "fmt": "auto" },
    { "id": "taskTokens", "label": "Tokens per subtask", "min": 500, "max": 5000, "default": 2000, "step": 500, "fmt": "auto" },
    { "id": "orchOverhead", "label": "Orchestrator overhead tok", "min": 200, "max": 2000, "default": 500, "step": 100, "fmt": "auto" }
  ],
  "checkboxes": [
    { "id": "useMulti", "label": "Parallel multi-agent", "default": false }
  ],
  "metrics": [
    { "label": "Wall ms", "expr": "useMulti ? taskDelay + 500 : subTasks * taskDelay", "fmt": "auto", "warnAbove": 10000, "dangerAbove": 20000 },
    { "label": "Speedup", "expr": "useMulti ? subTasks : 1", "fmt": "auto" },
    { "label": "Single ctx", "expr": "subTasks * taskTokens", "fmt": "k", "warnAbove": 80000, "dangerAbove": 120000 },
    { "label": "Per-agent ctx", "expr": "useMulti ? taskTokens + orchOverhead : subTasks * taskTokens", "fmt": "k" }
  ],
  "growth": {
    "title": "Cumulative serial time",
    "steps": "subTasks",
    "labelExpr": "i",
    "valueExpr": "useMulti ? taskDelay : i * taskDelay",
    "maxExpr": "subTasks * taskDelay * 1.2",
    "fmt": "auto"
  }
}
```

---

## 4 · Lab: orchestrator

```widget:code-playground
{
  "title": "Multi-agent lab",
  "hint": "parallel vs sequential",
  "mode": "sandbox",
  "files": [
    {
      "path": "orchestrator.js",
      "active": true,
      "code": "const task = {{task}};\nconst mode = {{mode}};\nconst agentCount = {{agentCount}};\nconsole.log('Task:', task, 'mode:', mode);\nconst plan = await callLLM([\n {role:'system',content:`Split the user task into exactly ${agentCount} independent subtasks, one per line.`},\n {role:'user',content:task}\n]);\nconst sub = plan.content.split('\\n').filter(l=>l.trim());\nasync function worker(id, line) {\n console.log(`Worker ${id} ⇢`, line);\n const r = await callLLM([\n  {role:'system',content:`Expert ${id}. Answer ONLY your line in <=60 words.`},\n  {role:'user',content:line}\n ]);\n console.log(`Worker ${id} ✓`, r.content);\n return {id,line,result:r.content};\n}\nconst t0 = Date.now();\nlet results;\nif (mode === 'parallel') results = await Promise.all(sub.map((s,i)=>worker(String.fromCharCode(65+i), s)));\nelse { results=[]; for(let i=0;i<sub.length;i++) results.push(await worker(String.fromCharCode(65+i), sub[i])); }\nconsole.log('elapsed', Date.now()-t0,'ms');\nconst summary = await callLLM([\n {role:'system',content:'Merge expert bullets into <=100 words.'},\n {role:'user',content:results.map(r=>r.id+': '+r.result).join('\\n')}\n]);\nconsole.log('Merged:', summary.content);\n",
      "slots": [
        { "id": "task", "default": "'Compare iPhone, Galaxy, Mate flagships on camera, battery, price.'" },
        { "id": "mode", "default": "'parallel'" },
        { "id": "agentCount", "default": "3" }
      ]
    }
  ],
  "outputHeight": 420
}
```

---

## 5 · Quiz

```widget:quiz
{
  "title": "Multi-agent quiz",
  "questions": [
    {
      "id": "q1",
      "text": "Orchestrator primary job?",
      "type": "single",
      "options": [
        { "text": "Run every tool", "correct": false },
        { "text": "Decompose, dispatch, merge", "correct": true },
        { "text": "Store all contexts", "correct": false }
      ],
      "explanation": "Coordination, not specialization."
    },
    {
      "id": "q2",
      "text": "Best fit?",
      "type": "single",
      "options": [
        { "text": "2+2", "correct": false },
        { "text": "Parallel deep dives on 5 competitors", "correct": true },
        { "text": "Single haiku", "correct": false }
      ],
      "explanation": "Independent, parallelizable subtasks with heavy context each."
    },
    {
      "id": "q3",
      "text": "Should every worker see the entire mission?",
      "type": "single",
      "options": [
        { "text": "Yes—more data always helps", "correct": false },
        { "text": "No—minimal instructions per worker", "correct": true },
        { "text": "Random", "correct": false }
      ],
      "explanation": "Least context per worker is part of the win—global reasoning stays with orchestrator."
    }
  ]
}
```

---

## Summary

- Multi-agent **splits context and wall-clock**, not magic.  
- Orchestrator **coordinates**; workers **execute**.  
- **Parallelism ≈ linear speedup** when tasks are independent.  
- Skip multi-agent when **decomposition costs exceed gains**.  

```widget:checklist
{
  "title": "Lesson 6 checklist",
  "id": "module-2-lesson-06-en",
  "items": [
    "I know the three roles",
    "I ran parallel vs serial lab",
    "I finished the quiz"
  ]
}
```

---

[← Prev](/lesson/module-2/05-planning-react) · [Next →](/lesson/module-2/07-rag)
