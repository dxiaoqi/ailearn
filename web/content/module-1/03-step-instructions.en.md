---
title: "Step-by-step instructions: shape the model’s reasoning path"
module: "module-1"
moduleTitle: "Module 1: Prompt engineering basics"
duration: "30 min"
description: "Use explicit steps to control analysis order, avoid leaps to conclusions, and cover every dimension—so complex tasks become predictable and reproducible."
tags: ["Steps", "Analysis order", "Chain-of-th", "Structure"]
expert:
  name: "Max, analysis coach"
  model: "gpt-4o"
  intro: "Hi, I’m Max—I help with task breakdown and step design. Ask me anything about step instructions 👋"
  systemPrompt: |
    You are Max, a coach for task decomposition and step-by-step prompting.
    Prefer concrete step templates over theory.
    Reply in English under 200 words unless a longer critique is requested.
---

By the end of this chapter you can:

> ✓ Tell when a task needs step instructions and when it doesn’t  
> ✓ Write a coherent ordered sequence of steps  
> ✓ Use steps for multi-dimensional analysis and avoid jumping to conclusions  

**Tips by background:**
- **Business folks**: focus on §§1–2; in §3 at least master numbered steps  
- **PM / engineering**: conditional and nested patterns in §3 matter for complex flows  
- **Everyone**: Exercise 2 uses your real task—that’s where the learning lands  

---

## Section 0: pick a task where AI analysis feels “too jumpy”

The core exercise is: take an analysis task you already use AI for, where the logic feels rushed or shallow, and redesign it with steps. Decide what that task is before you start—it shows up in both exercises.

---

## Section 1: why order matters

The model generates left to right; each token depends on prior text. **If it states a conclusion early, later reasoning tends to defend that conclusion**—even when the data disagree.

> **Analogy: report written conclusion-first vs analysis-first**
>
> **Analyst A** writes “market outlook good,” then hunts supporting data → may ignore bad news.  
> **Analyst B** lays out data, finds patterns, then writes the conclusion → more grounded.  
> Your step instructions choose which analyst the model plays.

### Typical issues without steps

- **Leap to conclusions**: data → verdict with no visible reasoning  
- **Confirmation bias**: follows the tone of the prompt, not the evidence  
- **Missing dimensions**: multi-faceted problems lose whole angles  
- **Wrong order**: checks that should come first happen late  

### When you need step instructions

Ask: how many distinct “processing moves” sit between input and output?

| Moves | Guidance |
|-------|----------|
| 1 (translate, rewrite, summarize) | usually no steps |
| 2–3 (analyze + classify + rank) | steps help |
| 4+ (deep analysis, many criteria) | **steps are required** |

> **Analogy: instructions for an intern**  
> “Analyze this report” → random start, missed angles, fuzzy verdict.  
> “Count competitors, compare pricing, compare features, then recommend” → fixed path, full coverage.  
> Step instructions are that **analysis playbook**.

---

## Section 2: with vs without steps—side by side

### Scenario 1: user interviews → product needs

```widget:before-after
{
  "title": "Interview analysis: with and without steps",
  "subtitle": "How order changes the reasoning path",
  "tabs": [
    {
      "label": "❌ No steps",
      "prompt": "Analyze the following user interviews and extract product needs with priorities.\n\n<interviews>\n{{interview text}}\n</interviews>",
      "analysis": "The model may jump straight to a priority list, skipping taxonomy and frequency. Why something ranks high stays opaque; small input changes can flip the ranking.",
      "type": "bad"
    },
    {
      "label": "✓ With steps",
      "prompt": "Analyze the following user interviews:\n\n<interviews>\n{{interview text}}\n</interviews>\n\nStep 1: List every problem users mention, quote by quote\nStep 2: Classify each as feature / experience / performance\nStep 3: Count mentions per category\nStep 4: Combine frequency and impact to rank priorities",
      "analysis": "Each step feeds the next. Frequency in Step 3 grounds priorities in Step 4—the chain is visible and more reproducible.",
      "type": "good"
    }
  ]
}
```

### Scenario 2: publish readiness

```widget:before-after
{
  "title": "Content review: with and without explicit checks",
  "subtitle": "Why a fixed verification order matters",
  "tabs": [
    {
      "label": "❌ No steps",
      "prompt": "Decide if the following article may be published:\n\n<article>\n{{article}}\n</article>",
      "analysis": "Decisions feel like gut calls; rationale is weak and hard to reproduce; style differences skew the “rules” applied.",
      "type": "bad"
    },
    {
      "label": "✓ Ordered checks",
      "prompt": "Review the article in order:\n\n<article>\n{{article}}\n</article>\n\nStep 1: Factual errors (yes/no, list issues)\nStep 2: Compliance issues (yes/no, list issues)\nStep 3: Readability score 1–5 with reason\nStep 4: Combine all three—publish or not, with reasons",
      "analysis": "Each dimension is checked independently, then merged. “Publish” must pass explicit gates—traceable and consistent.",
      "type": "good"
    }
  ]
}
```

---

## Section 3: three step patterns

### Pattern 1: numbered (most common)

**Use when** order is fixed and steps depend on each other.

```
Analyze competitors:

<competitor>{{competitor info}}</competitor>
<our_product>{{our product info}}</our_product>

Step 1: List all known competitor features
Step 2: For each, mark vs us: we have / we lack / both
Step 3: Among competitor-only features, pick the 3 users likely care about most
Step 4: For each of the 3, propose one counter-move
```

Step 3 needs Step 2; Step 4 needs Step 3.

---

### Pattern 2: conditional (branching paths)

**Use when** a key fork changes the whole path.

```
Analyze this user request:

<request>{{request text}}</request>

Step 1: Decide if this is a functional need or an experience need

If functional:
  Step 2a: Assess technical feasibility (high / med / low)
  Step 3a: Estimate build cost (large / med / small)
  Step 4a: Recommend whether to build

If experience:
  Step 2b: Name 3 affected user scenarios
  Step 3b: Estimate improvement size (large / med / small)
  Step 4b: Give a priority recommendation
```

Branches stop functional and experience needs from being scored the same way.

---

### Pattern 3: nested (same pipeline per object)

**Use when** several items share one analysis flow, then you compare.

```
Analyze these three user stories:

<stories>{{three stories}}</stories>

For each story:
  a. Core pain in one sentence
  b. Product areas involved
  c. Priority (high/med/low) with reason

When all three are done:
  d. Most recurring pains across stories
  e. Overall feature priority recommendation
```

Every object runs the same substeps before aggregation—no skipped item.

---

### Choosing a pattern

| Situation | Pattern |
|-----------|---------|
| Fixed order, dependent steps | Numbered |
| Outcome depends on a key decision | Conditional |
| Same flow on multiple objects | Nested |

> You can **combine**: numbered shell + conditional inside a step.

---

## Section 4: three common design mistakes

### Mistake 1: reversed order

Putting the verdict before the evidence.

```widget:before-after
{
  "title": "Order: conclusion first vs analysis first",
  "subtitle": "How ordering affects objectivity",
  "tabs": [
    {
      "label": "❌ Verdict before evidence",
      "prompt": "Step 1: Decide if this plan is viable\nStep 2: List reasons in favor\nStep 3: List reasons against",
      "analysis": "Once viability is decided, pros/cons become rhetorical. Cons get softened; pros inflated.",
      "type": "bad"
    },
    {
      "label": "✓ Evidence before verdict",
      "prompt": "Step 1: List all evidence supporting the plan\nStep 2: List all evidence against\nStep 3: Compare weight on both sides, then judge viability",
      "analysis": "The conclusion emerges from analysis. Evidence is gathered independently—fairer tradeoffs.",
      "type": "good"
    }
  ]
}
```

**Rule:** collect and weigh evidence in steps 1…N−1; **derive** the conclusion in the last step.

---

### Mistake 2: uneven granularity

One step is “assess the big picture,” another is “sum column three.” Time and depth skew.

**Rule:** each step should be roughly “one paragraph” of work at similar scale.

---

### Mistake 3: too many steps

Beyond ~7 steps, drift mid-chain is common.

**Fix:** split into two prompts—first analyzes, second synthesizes from that output.

---

## Section 5: two exercises

### Exercise 1: find the ordering bug (basics)

```widget:prompt-practice
{
  "title": "Exercise 1: fix step order",
  "instruction": "These steps evaluate whether to build a new feature. Find the design flaw and write a corrected sequence:",
  "original": "Step 1: Give a build/no-build recommendation\nStep 2: List reasons users will like it\nStep 3: Rate build difficulty (high/medium/low)\nStep 4: Estimate impact on retention",
  "scenarios": [
    { "emoji": "🧩", "label": "Feature triage", "description": "Value a new capability" },
    { "emoji": "📊", "label": "Data analysis", "description": "Metric movements" },
    { "emoji": "🔍", "label": "Case review", "description": "Feasibility argument" }
  ],
  "placeholder": "[What’s wrong]\n...\n\n[Corrected steps]\nStep 1:\nStep 2:\nStep 3:\nStep 4:",
  "hint": "Flaw: Step 1 is the verdict while 2–4 are the analysis—classic conclusion-first.\n\nBetter sequence:\nStep 1: Rate build difficulty (H/M/L) with reasons\nStep 2: Estimate retention impact (large/med/small) with evidence\nStep 3: List top reasons users would love it (2–3 bullets)\nStep 4: Synthesize into a recommendation with priority",
  "systemPrompt": "You are an expert in step instructions. Score the student’s diagnosis and fix (100 pts): (1) spotted conclusion-first, (2) evidence before verdict, (3) clear dependencies, (4) even granularity—25 each. Format: X/100, 1–2 strengths, 1–2 improvements; if <60, suggest a rewrite. Encouraging tone, English, ≤150 words."
}
```

---

### Exercise 2: design steps for your task (advanced)

Describe your task, count distinct moves, pick numbered / conditional / nested, then A/B test with and without steps in Claude—check coverage and fewer leaps.

```widget:prompt-practice
{
  "title": "Exercise 2: design your step sequence",
  "instruction": "Describe your task, then write full step instructions. Example frame: “Analyze the following: <input>{{input}}</input> Step 1: … Step 2: …”",
  "original": "(Paste your task: inputs and desired output.)",
  "scenarios": [
    { "emoji": "📈", "label": "Business analysis", "description": "Market / competitor / data" },
    { "emoji": "📋", "label": "Content review", "description": "Editorial / policy / QA" },
    { "emoji": "🗣️", "label": "User research", "description": "Interviews / feedback / needs" }
  ],
  "placeholder": "Analyze the following:\n\n<input>\n{{input}}\n</input>\n\nStep 1:\nStep 2:\nStep 3: (optional)\nStep 4: (synthesis / conclusion)",
  "hint": "Interview needs example:\n\nAnalyze interviews:\n<interviews>{{text}}</interviews>\nStep 1: Extract every mentioned issue\nStep 2: Classify (feature/experience/perf)\nStep 3: Count frequency per class\nStep 4: Rank product needs by frequency × impact",
  "systemPrompt": "You evaluate custom step sequences (100 pts): (1) covers key processing moves, (2) analysis before conclusion, (3) even step size, (4) fitting pattern (numbered/conditional/nested)—25 each. Format: X/100, 1–2 highlights, 1–2 fixes. English, ≤150 words, encouraging."
}
```

---

## Chapter checklist

```widget:checklist
{
  "title": "Chapter 3 checklist",
  "id": "module-1-lesson-3-steps",
  "items": [
    "I can decide if a task needs steps from the number of processing moves",
    "I know when to use numbered, conditional, or nested steps",
    "I did Exercise 1 and fixed a bad step order",
    "I did Exercise 2 for a real task and compared with/without steps"
  ]
}
```

---

> **Next: Few-shot examples**  
> Chapter 4 covers subtle judgment boundaries—when words fail and examples teach faster.  
> **Prep:** think of a judgment task where the model often errs on edge cases.

---

## Appendix: Exercise 1 answer

**Problem:** Step 1 is the final call while 2–4 are analyses—conclusion-first, so later steps rationalize instead of investigate.

**Better sequence:**  
1) Difficulty (H/M/L) + why  
2) Retention impact (L/M/S) + evidence  
3) User-like reasons (2–3)  
4) Synthesis → recommendation + priority  

**Principle:** evidence in steps 1–3, conclusion in step 4.

---

**Previous** → [XML and separation](/lesson/module-1/02-xml-isolation)  
**Next** → [Few-shot examples](/lesson/module-1/04-fewshot)
