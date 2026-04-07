---
title: "Tool use: how agents touch the real world"
module: "module-2"
moduleTitle: "Module 2: Agent engineering"
duration: "25 min"
description: "Tool calls are JSON intents executed by your runtime—schemas, serial vs parallel execution, timeouts, retries, and surfacing errors back to the model."
tags: ["Tool use", "Function calling", "APIs", "Intermediate"]
expert:
  name: "Riku, tools architect"
  model: "gpt-4o"
  intro: "Hi, I’m Riku—schemas, timeouts, parallelism—ask me anything 👋"
  systemPrompt: |
    You are Riku, advising on agent tool design and execution.
    Use small JSON examples; explain serial vs parallel with timing.
    Reply in English, under 200 words.
---

By the end of this lesson:

> ✓ Trace Schema → model JSON → executor → tool_result  
> ✓ Explain that the LLM never directly runs code  
> ✓ Choose serial vs parallel calls  
> ✓ Reason about timeouts, retries, fallbacks  

**Prerequisite:** Lesson 1  

---

## 1 · LLM has no hands

```widget:before-after
{
  "title": "Three layers of a tool",
  "subtitle": "Model proposes JSON; runtime executes; structured results return",
  "tabs": [
    {
      "label": "① Schema",
      "prompt": "Tell the model what exists\n\n{\n  \"name\": \"search\",\n  \"description\": \"Search the public web for fresh facts\",\n  \"parameters\": { ... }\n}",
      "analysis": "Descriptions drive when/how the model calls. Vague text → misfires.",
      "type": "neutral"
    },
    {
      "label": "② tool_call",
      "prompt": "Model output (JSON intent only)\n\n{ \"tool_calls\":[{\"name\":\"search\",\"arguments\":{\"query\":\"2024 Nobel Physics\"}}] }\n\nStill no network I/O yet.",
      "analysis": "This is a request object, not executable code. Runtime must perform the HTTP/API call.",
      "type": "good"
    },
    {
      "label": "③ tool_result",
      "prompt": "Success or failure envelope\n\n{ \"result\": \"...\" }\nor { \"error\": \"timeout 5000ms\" }",
      "analysis": "Always return something. Silent failures stall the loop; errors are observations for the next thought.",
      "type": "good"
    }
  ]
}
```

| | Serial | Parallel |
|---|--------|----------|
| Pattern | A finishes → B | A,B,C overlap |
| Time | sum | max |
| Use | downstream deps | independent fetches |

---

## 2 · Lifecycle diagram

```widget:diagram
{
  "title": "Tool call lifecycle",
  "caption": "Happy path vs timeout path—both must reach the model as tool_result.",
  "svg": "<svg viewBox='0 0 560 400' xmlns='http://www.w3.org/2000/svg'><defs><marker id='at' viewBox='0 0 10 10' refX='8' refY='5' markerWidth='6' markerHeight='6' orient='auto-start-reverse'><path d='M2 1L8 5L2 9' fill='none' stroke='context-stroke' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/></marker></defs><line x1='90' y1='40' x2='90' y2='390' stroke='var(--b)' stroke-width='0.5'/><line x1='280' y1='40' x2='280' y2='390' stroke='var(--b)' stroke-width='0.5'/><line x1='460' y1='40' x2='460' y2='390' stroke='var(--b)' stroke-width='0.5'/><g class='c-purple'><rect x='40' y='12' rx='8' width='100' height='26' stroke-width='0.5'/><text class='ts' x='90' y='29' text-anchor='middle'>LLM</text></g><g class='c-teal'><rect x='220' y='12' rx='8' width='120' height='26' stroke-width='0.5'/><text class='ts' x='280' y='29' text-anchor='middle'>Executor</text></g><g class='c-blue'><rect x='410' y='12' rx='8' width='100' height='26' stroke-width='0.5'/><text class='ts' x='460' y='29' text-anchor='middle'>API</text></g><line x1='92' y1='58' x2='278' y2='58' stroke='var(--s)' stroke-width='1.5' marker-end='url(#at)'/><line x1='282' y1='86' x2='458' y2='86' stroke='var(--s)' stroke-width='1.5' marker-end='url(#at)'/><line x1='458' y1='148' x2='282' y2='148' stroke='var(--s)' stroke-width='1.5' marker-end='url(#at)'/><line x1='278' y1='198' x2='92' y2='198' stroke='var(--color-text-success)' stroke-width='1.5' marker-end='url(#at)'/><text class='ts' x='185' y='364' style='fill:var(--color-text-danger)'>errors return too</text></svg>"
}
```

---

## 3 · Sandbox: parallel speedup

```widget:sandbox
{
  "title": "Tool performance sandbox",
  "hint": "Toggle parallel vs serial latency",
  "params": [
    { "id": "toolCount", "label": "Calls", "min": 1, "max": 6, "default": 3, "step": 1 },
    { "id": "avgDelay", "label": "Avg latency ms", "min": 100, "max": 5000, "default": 1000, "step": 100, "fmt": "auto" },
    { "id": "timeoutMs", "label": "Timeout ms", "min": 500, "max": 10000, "default": 5000, "step": 500, "fmt": "auto" },
    { "id": "retryCount", "label": "Retries", "min": 0, "max": 3, "default": 1, "step": 1 },
    { "id": "failRate", "label": "Fail %", "min": 0, "max": 50, "default": 10, "step": 5, "fmt": "%" }
  ],
  "checkboxes": [
    { "id": "parallel", "label": "Parallel calls", "default": false }
  ],
  "metrics": [
    { "label": "Serial ms", "expr": "toolCount * avgDelay", "fmt": "auto" },
    { "label": "Parallel ms", "expr": "avgDelay", "fmt": "auto" },
    { "label": "Mode ms", "expr": "parallel ? avgDelay : toolCount * avgDelay", "fmt": "auto", "warnAbove": 5000, "dangerAbove": 10000 },
    { "label": "Speedup", "expr": "toolCount", "fmt": "auto" }
  ],
  "growth": {
    "title": "Cumulative latency",
    "steps": "toolCount",
    "labelExpr": "i",
    "valueExpr": "parallel ? avgDelay : i * avgDelay",
    "maxExpr": "timeoutMs",
    "fmt": "auto"
  }
}
```

---

## 4 · Lab: executor with timeout/retry

```widget:code-playground
{
  "title": "Tool lab",
  "hint": "Flip parallel and timeout",
  "mode": "sandbox",
  "files": [
    {
      "path": "agent.js",
      "active": true,
      "code": "import { createToolExecutor } from './executor.js';\nimport { tools } from './tools.js';\nconst config = { timeout: {{timeout}}, retries: {{retries}}, parallel: {{parallel}} };\nconsole.log('🔧 Tool experiment');\nconsole.log(config);\nconst executor = createToolExecutor(tools, config);\nconst toolCalls = [\n  { name: 'search', arguments: { query: '2024 Nobel physics' } },\n  { name: 'weather', arguments: { city: 'Beijing' } },\n  { name: 'calculator', arguments: { expression: '365*24' } },\n];\nconst t0 = Date.now();\nconst results = await executor.run(toolCalls);\nconsole.log('elapsed', Date.now()-t0, 'ms');\nfor (const r of results) console.log(r.error ? '✗'+r.error : '✓'+r.name);\n",
      "slots": [
        { "id": "timeout", "default": "5000" },
        { "id": "retries", "default": "1" },
        { "id": "parallel", "default": "true" }
      ]
    },
    {
      "path": "tools.js",
      "code": "export const tools = {\n  search: { async execute(args){ await new Promise(r=>setTimeout(r,800)); return {snippet:`About ${args.query}`}; } },\n  weather: { async execute(args){ await new Promise(r=>setTimeout(r,600)); return {city:args.city,temp:'20C'}; } },\n  calculator: { async execute(args){ await new Promise(r=>setTimeout(r,100)); return {result: eval(args.expression)}; } },\n};"
    },
    {
      "path": "executor.js",
      "code": "export function createToolExecutor(tools, {timeout,retries,parallel}){\n  async function one(call){\n    const tool = tools[call.name];\n    if(!tool) return {name:call.name,error:'unknown tool'};\n    for(let a=0;a<=retries;a++){\n      try{\n        const res = await Promise.race([tool.execute(call.arguments), new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout '+timeout)),timeout))]);\n        return {name:call.name,result:res};\n      }catch(e){\n        if(a===retries) return {name:call.name,error:e.message};\n      }\n    }\n  }\n  return { async run(calls){ return parallel ? Promise.all(calls.map(one)) : (async()=>{const o=[];for(const c of calls)o.push(await one(c));return o;})(); }};\n}"
    }
  ],
  "outputHeight": 340
}
```

---

## 5 · Quiz

```widget:quiz
{
  "title": "Tool use quiz",
  "questions": [
    {
      "id": "q1",
      "text": "Tool call times out. What should happen?",
      "type": "single",
      "options": [
        { "text": "Ignore and continue", "correct": false },
        { "text": "Return structured error to the model", "correct": true },
        { "text": "Kill the agent", "correct": false }
      ],
      "explanation": "Errors are observations—let the policy decide retry, fallback, or user messaging."
    },
    {
      "id": "q2",
      "text": "Three 1s calls independent—serial vs parallel total time?",
      "type": "single",
      "options": [
        { "text": "1s vs 3s", "correct": false },
        { "text": "3s vs ~1s", "correct": true },
        { "text": "Same", "correct": false }
      ],
      "explanation": "Parallel waits for the slowest leg, not the sum."
    },
    {
      "id": "q3",
      "text": "Schema description is \"a tool\". Impact?",
      "type": "single",
      "options": [
        { "text": "No effect", "correct": false },
        { "text": "Misfires and bad args", "correct": true },
        { "text": "Runtime crash", "correct": false }
      ],
      "explanation": "The model chooses tools from text—quality of descriptions drives accuracy."
    }
  ]
}
```

---

## Summary

- Tools are the **only** channel to real systems.  
- **JSON in, JSON out**—runtime owns side effects.  
- **Never swallow errors.**  
- **Great schemas → reliable calls.**  

```widget:checklist
{
  "title": "Lesson 4 checklist",
  "id": "module-2-lesson-04-en",
  "items": [
    "I can trace the tool lifecycle",
    "I return errors as tool_result",
    "I know serial vs parallel tradeoffs",
    "I ran the lab",
    "Quiz done"
  ]
}
```

---

[← Prev](/lesson/module-2/03-memory-system) · [Next →](/lesson/module-2/05-planning-react)
