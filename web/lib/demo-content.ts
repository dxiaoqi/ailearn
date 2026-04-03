import type { LessonMeta } from "./types"

export const demoMeta: LessonMeta = {
  title: "Prompt 工程基础：从模糊到精准",
  module: "week-1",
  moduleTitle: "模块一：Prompt 工程",
  duration: "45 分钟",
  description: "掌握写出有效 Prompt 的五要素框架，学会区分好坏 Prompt，并通过练习内化这套思维方式。",
  tags: ["Prompt", "基础", "框架"],
  expert: {
    name: "Prompt 专家 Alex",
    model: "gpt-4o",
    intro: "你好！我是这门课的专属顾问 Alex，专注于 Prompt 工程。有任何问题随时问我 👋",
    systemPrompt: `你是一个专注于 Prompt 工程的资深 AI 顾问，名叫 Alex。
你的风格：简洁、实用、善于举例。
你的职责：
1. 解答学生关于 Prompt 写法的疑问
2. 评估学生写的 Prompt，给出具体改进建议
3. 用真实场景帮助学生理解抽象概念

回复要求：
- 用中文回复
- 每次回复控制在 200 字以内，除非学生要求详细解释
- 给出具体可执行的建议，不要泛泛而谈
- 如果学生分享了 Prompt，先指出 1-2 个核心问题，再给出改进版本`,
  },
}

const t = "`"
const ttt = "```"

export const demoContent = `
${t}ai-lesson${t} 是这门课的学习引擎。本文你将掌握让 AI 真正「听话」的核心方法。

## 为什么 Prompt 质量差异巨大？

你可能有过这样的体验：同样是让 AI 写邮件，有人得到了完整、专业的回复，有人得到了一堆废话。**原因不在于 AI 能力，而在于 Prompt 的质量。**

Prompt 是你与 AI 之间的契约。契约越清晰，AI 越能精准执行。

模糊的 Prompt → AI 只能猜测你的意图 → 输出质量不可控

精准的 Prompt → AI 明确知道角色、任务、约束 → 输出可预测、可复现

---

## 好 Prompt 的五要素

一个高质量的 Prompt 通常包含以下五个维度，并非每次都需要全部具备，但越完整，输出越可控：

| 要素 | 说明 | 示例 |
|------|------|------|
| **角色** | AI 扮演谁 | "你是一位资深产品经理" |
| **任务** | 做什么 | "分析以下用户反馈" |
| **背景** | 上下文信息 | "这是 Q3 季度的 NPS 调研数据" |
| **格式** | 输出形式 | "用 3 个要点总结，每点不超过 30 字" |
| **约束** | 边界条件 | "不要提及竞品，聚焦我们产品本身" |

> **类比**：五要素就像餐厅点餐。"来一份"（无要素）vs "来一份中辣的宫保鸡丁，少油，不要花生，出餐时间控制在 10 分钟内"（五要素齐全）。

---

## 好 vs. 差：直观对比

同一个任务，不同的写法，输出质量天差地别。仔细对比下面两个版本：

${ttt}widget:before-after
{
  "title": "好 vs. 差的提示词对比",
  "subtitle": "同一个任务，不同写法，输出质量天差地别。",
  "tabs": [
    {
      "label": "差的写法",
      "prompt": "帮我写一封客户投诉回复邮件",
      "analysis": "问题：没有提供客户投诉内容、没有规定语气、没有限制长度、没有说明是否需要道歉。模型只能猜，导致输出结果完全不可控。",
      "type": "bad"
    },
    {
      "label": "好的写法",
      "prompt": "你是一位经验丰富的客服经理，擅长化解客户不满。\\n\\n客户投诉内容：\\n<complaint>\\n[投诉内容]\\n</complaint>\\n\\n请用以下格式回复：\\n1. 首先真诚道歉（1-2句）\\n2. 说明问题原因（客观，不推卸责任）\\n3. 给出具体解决方案和时间承诺\\n4. 结尾表达对客户的重视\\n\\n语气：专业、温暖、不过分道歉。长度：150-200字。",
      "analysis": "优点：明确了角色（客服经理）、提供了背景（投诉内容用XML包裹）、规定了格式（4步结构）、限制了语气和长度。AI 的输出范围被大幅收窄，质量可预期。",
      "type": "good"
    }
  ]
}
${ttt}

---

## XML 标签：分离动态内容的利器

当 Prompt 中有**固定指令**和**每次变化的内容**时，用 XML 标签分离它们。这是让 Prompt 可复用的关键技巧。

${ttt}widget:diagram
{
  "title": "XML 标签分离结构图",
  "caption": "固定部分是模板，动态部分每次替换",
  "svg": "<svg viewBox='0 0 680 260' xmlns='http://www.w3.org/2000/svg'><defs><marker id='arr-d' viewBox='0 0 10 10' refX='8' refY='5' markerWidth='6' markerHeight='6' orient='auto-start-reverse'><path d='M2 1L8 5L2 9' fill='none' stroke='context-stroke' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/></marker></defs><g class='c-gray'><rect x='20' y='20' rx='12' stroke-width='0.5' width='286' height='220'/><text class='th' x='38' y='50'>固定指令（模板）</text><text class='t' x='38' y='80'>你是一位客服经理，</text><text class='t' x='38' y='102'>请回复以下投诉：</text></g><g class='c-amber'><rect x='32' y='115' rx='8' stroke-width='0.5' width='262' height='106'/><text class='ts' x='46' y='138' style='font-family:monospace'>&lt;complaint&gt;</text><text class='ts' x='46' y='160' style='font-style:italic'>动态内容在这里</text><text class='ts' x='46' y='182' style='font-family:monospace'>&lt;/complaint&gt;</text><text class='ts' x='46' y='203'>每次调用时替换</text></g><line x1='314' y1='130' x2='366' y2='130' fill='none' stroke='#888780' stroke-width='1.5' marker-end='url(#arr-d)'/><g class='c-teal'><rect x='374' y='20' rx='12' stroke-width='0.5' width='286' height='220'/><text class='th' x='392' y='50'>实际使用时</text><text class='t' x='392' y='80'>你是一位客服经理，</text><text class='t' x='392' y='102'>请回复以下投诉：</text></g><g class='c-amber'><rect x='386' y='115' rx='8' stroke-width='0.5' width='262' height='106'/><text class='ts' x='400' y='138' style='font-family:monospace'>&lt;complaint&gt;</text><text class='ts' x='400' y='158'>我的订单已三天，</text><text class='ts' x='400' y='178'>还没有发货...</text><text class='ts' x='400' y='200' style='font-family:monospace'>&lt;/complaint&gt;</text></g></svg>"
}
${ttt}

把这个模式记住：**指令固定，内容可换**，这就是一个可复用的 Prompt 模板。

---

## 练习：改写一个提示词

理论说完了，现在动手。把下面这个典型的「差」Prompt 改成包含五要素的版本。

${ttt}widget:prompt-practice
{
  "title": "练习：改写 Prompt",
  "instruction": "下面是一个差的提示词，请按照五要素结构改写它：",
  "original": "帮我分析一下这份财务报告",
  "scenarios": [
    { "emoji": "📊", "label": "产品经理", "description": "分析用户数据报告" },
    { "emoji": "📢", "label": "市场运营", "description": "分析广告投放报告" },
    { "emoji": "💹", "label": "财务分析师", "description": "分析季度财务报告" }
  ],
  "placeholder": "在这里写你改写的提示词。提示：想想谁在说话（角色）、要分析什么（用标签包裹动态内容）、分析的步骤、输出格式...",
  "hint": "参考结构：你是一位[职位]，擅长[专长]。请分析以下报告：[report][报告内容][/report]。分析维度：1.[维度一] 2.[维度二]。输出格式：使用标题和要点，控制在300字以内。",
  "systemPrompt": "你是一个 Prompt 工程专家，负责评估学生改写的 Prompt 质量。评估维度：角色定义、任务明确度、背景结构化、格式要求、约束条件，各20分。回复格式：总分X/100、做得好的地方1-2点、可改进的地方1-2点。如果总分低于60分，给出改进版本。语气鼓励但直接，用中文回复，控制在200字以内。"
}
${ttt}

---

## 本模块完成清单

完成下面的任务，标记你的学习成果：

${ttt}widget:checklist
{
  "title": "本模块完成清单",
  "id": "module-week1-prompt-basics",
  "items": [
    "我能说出好 Prompt 的五要素",
    "我能区分好/差提示词的关键差异",
    "我理解了 XML 标签分离动态内容的作用",
    "我用五要素框架改写了一个提示词"
  ]
}
${ttt}

---

**下一节** → [输出格式控制：让 AI 给你想要的结构](#)
`
