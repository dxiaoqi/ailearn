---
title: "Planning & ReAct: think before you act"
module: "module-2"
moduleTitle: "Module 2: Agent engineering"
duration: "35 min"
description: "ReAct surfaces reasoning as explicit Thought steps; planning splits work—combine them for multi-step tasks with inspectable decisions."
tags: ["ReAct", "Planning", "CoT", "Advanced"]
expert:
  name: "Yuki, reasoning architect"
  model: "gpt-4o"
  intro: "Hi, I’m Yuki—ReAct, planners, when Thoughts are worth the tokens 👋"
  systemPrompt: |
    You are Yuki, advising on ReAct and planning for agents.
    Contrast runs with vs without explicit Thought.
    Reply in English, under 250 words.
---

By the end of this lesson:

> ✓ Contrast plain loops vs ReAct  
> ✓ Explain how Thought reduces bad tool picks  
> ✓ Relate planning (macro) to ReAct (micro)  
> ✓ Decide when Thought is worth its token tax  

**Prerequisites:** Lessons 1–2  

---

## 1 · Direct action vs explicit reasoning

```widget:before-after
{
  "title": "No Thought vs ReAct",
  "subtitle": "Task: check weather; if >30°C suggest indoor ideas",
  "tabs": [
    {
      "label": "Direct",
      "prompt": "Observation: user wants weather + activity ideas\nAction: search(\"indoor activities Beijing\")\nSkips checking temperature first.",
      "analysis": "Wrong tool order; wastes a call; may answer irrelevantly if cool outside.",
      "type": "bad"
    },
    {
      "label": "ReAct",
      "prompt": "Thought: need temperature before recommending venues → first call weather.\nAction: weather(\"Beijing\")",
      "analysis": "Condition recognized; tool order is correct; trace is debuggable.",
      "type": "good"
    }
  ]
}
```

Thought is **scratch space**, not the final answer. Action executes.

| | Planning | ReAct |
|---|----------|-------|
| Layer | Task split | Step reasoning |
| Output | ordered subtasks | Thought → Action |

---

## 2 · Diagram

```widget:diagram
{
  "title": "Plain loop vs ReAct",
  "caption": "ReAct inserts a visible Thought between observation and action.",
  "svg": "<svg viewBox='0 0 620 300' xmlns='http://www.w3.org/2000/svg'><text class='th' x='120' y='18' text-anchor='middle'>Plain loop</text><text class='th' x='460' y='18' text-anchor='middle'>ReAct</text><line x1='280' y1='6' x2='280' y2='290' stroke='var(--b)' stroke-width='0.5' stroke-dasharray='4 3'/><g class='c-blue'><rect x='50' y='32' rx='8' width='140' height='34' stroke-width='0.5'/><text class='th' x='120' y='54' text-anchor='middle'>Observe</text></g><g class='c-teal'><rect x='50' y='84' rx='8' width='140' height='34' stroke-width='0.5'/><text class='th' x='120' y='106' text-anchor='middle'>Act</text></g><g class='c-blue'><rect x='330' y='32' rx='8' width='260' height='34' stroke-width='0.5'/><text class='th' x='460' y='54' text-anchor='middle'>Observe</text></g><g class='c-purple'><rect x='330' y='84' rx='8' width='260' height='42' stroke-width='0.5'/><text class='th' x='460' y='105' text-anchor='middle'>💭 Thought</text></g><g class='c-teal'><rect x='330' y='144' rx='8' width='260' height='34' stroke-width='0.5'/><text class='th' x='460' y='166' text-anchor='middle'>Act</text></g></svg>"
}
```

:::callout{variant="blue" title="Token cost"}
Thought burns 50–200 tokens per step. Skip it for trivial one-shot tasks; invest when mistakes are expensive.
:::

---

## 3 · Sandbox: Planning + ReAct

```widget:code-playground
{
  "title": "Planning + ReAct playground",
  "hint": "Toggle Thought on/off",
  "mode": "sandbox",
  "files": [
    {
      "path": "react-loop.js",
      "active": true,
      "code": "const task = {{task}};\nconst maxSteps = {{maxSteps}};\nconst enableThought = {{enableThought}};\nconsole.log('Task:', task);\nconsole.log('Thought?', enableThought);\nconst plan = await callLLM([\n {role:'system',content:'Planner: break the user task into 3-5 numbered steps. Steps only.'},\n {role:'user',content:task}\n]);\nconsole.log(plan.content);\nconst steps = plan.content.split('\\n').filter(l=>/^\d/.test(l.trim()));\nconst messages=[{role:'system',content:'Executor. One step per reply <=60 words. [DONE] when finished.'},{role:'user',content:task+'\\n'+plan.content}];\nfor(let i=0;i<Math.min(steps.length,maxSteps);i++){\n console.log('\\nStep',i+1, steps[i]);\n if(enableThought){\n  messages.push({role:'user',content:'Thought only (<=40 words): what info do we have and what is this step?'});\n  const th = await callLLM(messages);\n  messages.push({role:'assistant',content:th.content});\n  console.log('Thought:', th.content);\n }\n messages.push({role:'user',content:'Execute: '+steps[i]});\n const act = await callLLM(messages);\n messages.push({role:'assistant',content:act.content});\n console.log('Act:', act.content);\n if(act.content.includes('[DONE]')) break;\n}\n",
      "slots": [
        { "id": "task", "default": "'Plan a 3-day Shanghai→Chengdu trip covering transport, hotels, sights.'" },
        { "id": "maxSteps", "default": "5" },
        { "id": "enableThought", "default": "true" }
      ]
    }
  ],
  "outputHeight": 400
}
```

---

## 4 · Lab: compare with/without Thought

```widget:code-playground
{
  "title": "ReAct lab",
  "hint": "Flip enableThought",
  "mode": "sandbox",
  "files": [
    {
      "path": "agent.js",
      "active": true,
      "code": "import { getConfig } from './config.js';\nconst c = getConfig();\nconsole.log('Thought', c.enableThought);\nconst steps = ['Step1: list needed info','Step2: first analysis','Step3: conclude with [DONE]'];\nconst messages=[{role:'system',content:c.systemPrompt},{role:'user',content:c.task}];\nfor(let i=0;i<c.maxSteps;i++){\n if(c.enableThought){\n  messages.push({role:'user',content:'Thought (<=50 words): state, gaps, next move.'});\n  const th = await callLLM(messages); messages.push({role:'assistant',content:th.content}); console.log('Thought',th.content);\n }\n messages.push({role:'user',content:steps[i]||'finish'});\n const a = await callLLM(messages); messages.push({role:'assistant',content:a.content}); console.log('Act',a.content);\n if(a.content.includes('[DONE]')) break;\n}\nconsole.log('msgs',messages.length);\n",
      "slots": [
        { "id": "enableThought", "default": "true" },
        { "id": "maxSteps", "default": "3" },
        { "id": "task", "default": "'WFH vs office for engineers—compare efficiency, health, social aspects.'" }
      ]
    },
    {
      "path": "config.js",
      "code": "export function getConfig() {\n  return {\n    enableThought: {{enableThought}},\n    maxSteps: {{maxSteps}},\n    task: {{task}},\n    systemPrompt: 'You are an analyst. Finish one step per message (<=80 words). Mark the final message with [DONE].',\n  };\n}"
    }
  ],
  "outputHeight": 380
}
```

---

## 5 · Quiz

```widget:quiz
{
  "title": "Planning & ReAct quiz",
  "questions": [
    {
      "id": "q1",
      "text": "Main role of a Thought step?",
      "type": "single",
      "options": [
        { "text": "Shrink context", "correct": false },
        { "text": "Make state + next move explicit for auditability", "correct": true },
        { "text": "Replace tools", "correct": false }
      ],
      "explanation": "Thought is explanatory state—not compression."
    },
    {
      "id": "q2",
      "text": "Best fit for ReAct?",
      "type": "single",
      "options": [
        { "text": "What time is it?", "correct": false },
        { "text": "Multi-step competitive analysis with costly mistakes", "correct": true },
        { "text": "2+2", "correct": false }
      ],
      "explanation": "High step count + high error cost → invest in visible reasoning."
    },
    {
      "id": "q3",
      "text": "Planning vs ReAct?",
      "type": "single",
      "options": [
        { "text": "Same thing", "correct": false },
        { "text": "Planning decomposes work; ReAct governs each step", "correct": true },
        { "text": "Planning forbids tools", "correct": false }
      ],
      "explanation": "Macro vs micro—usually combined."
    }
  ]
}
```

---

## Summary

- **ReAct** adds explicit Thoughts before Actions.  
- **Trade tokens for reliability** on messy tasks.  
- **Plan** first, **ReAct** while executing.  

```widget:checklist
{
  "title": "Lesson 5 checklist",
  "id": "module-2-lesson-05-en",
  "items": [
    "I can contrast ReAct vs plain loops",
    "I know when Thought is wasteful",
    "I ran both playgrounds",
    "Quiz done"
  ]
}
```

---

[← Prev](/lesson/module-2/04-tool-use) · [Next →](/lesson/module-2/06-multi-agent)
