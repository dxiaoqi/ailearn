# AI 组件渲染系统 — 完整设计规范与 Prompt 手册

> 版本 1.0 · 适用于本地 HTML 页面 · AI 辅助渲染
>
> 本文档是一套完整的约束集合，将其完整粘贴至 AI 的 system prompt 或 context 开头，AI 便能按照统一规范生成所有组件。

---

## 目录

1. [系统概述](#1-系统概述)
2. [Design Token 体系](#2-design-token-体系)
3. [排版规范](#3-排版规范)
4. [颜色语义系统](#4-颜色语义系统)
5. [通用 UI 组件](#5-通用-ui-组件)
6. [图表与图形系统](#6-图表与图形系统)
   - 6.1 流程图 Flowchart
   - 6.2 架构图 Structural diagram
   - 6.3 时序图 Sequence diagram
   - 6.4 泳道图 Swimlane diagram
   - 6.5 ERD 实体关系图
   - 6.6 决策树 Decision tree
7. [交互规范](#7-交互规范)
8. [动画规范](#8-动画规范)
9. [响应式规范](#9-响应式规范)
10. [深色模式规范](#10-深色模式规范)
11. [无障碍规范](#11-无障碍规范)
12. [System Prompt 模板](#12-system-prompt-模板)
13. [场景 Prompt 速查卡](#13-场景-prompt-速查卡)
14. [错误修复手册](#14-错误修复手册)
15. [课程级交互 Widget 体系（Agent Class 扩展）](#15-课程级交互-widget-体系agent-class-扩展)
    - 15.1 Widget 体系总览（两种语法 · 选型规则）
    - 15.2 `callout` — 内联提示框
    - 15.3 `quiz` — 多选题练习
    - 15.4 `sandbox` — 参数沙盒
    - 15.5 `ai-chat` — AI 导师对话
    - 15.6 `scenario-eval` — AI 场景适配评估
    - 15.7 已有 Widget 速查
    - 15.8 AI 接入规范（`/api/chat` 路由）
    - 15.9 课程内容结构建议

---

## 1. 系统概述

### 核心哲学

- **描述意图，不描述实现**：告诉 AI「左侧蓝色圆形头像缩写」，而非「div + border-radius:50%」
- **语义优先**：颜色、字号、间距都传递意义，不做纯装饰
- **最小化原则**：每个组件只包含必要信息，不过度设计
- **深色/浅色自适应**：所有颜色必须通过 CSS 变量，禁止硬编码

### 技术约束

```
渲染环境：本地 HTML 文件（file:// 或 localhost）
允许 CDN：cdnjs.cloudflare.com · esm.sh · cdn.jsdelivr.net · unpkg.com
禁止：硬编码颜色值（#333 等）· position:fixed · DOCTYPE/html/head/body 包裹
图形引擎：SVG（图表）+ HTML（交互组件）
外部字体：可选，缺省使用系统字体栈
```

---

## 2. Design Token 体系

### 2.1 CSS 变量完整列表

将以下变量注入页面根节点 `:root`，所有组件通过变量引用颜色，**禁止任何硬编码颜色值**。

```css
:root {
  /* === 背景色 === */
  --color-background-primary:   #ffffff;   /* 卡片、弹窗主背景 */
  --color-background-secondary: #f5f4f0;   /* 页面底色、metric 卡片 */
  --color-background-tertiary:  #eceae3;   /* 次级分组背景 */
  --color-background-info:      #e6f1fb;   /* 信息蓝浅背景 */
  --color-background-success:   #eaf3de;   /* 成功绿浅背景 */
  --color-background-warning:   #faeeda;   /* 警告橙浅背景 */
  --color-background-danger:    #fcebeb;   /* 危险红浅背景 */

  /* === 文字色 === */
  --color-text-primary:         #1a1a18;   /* 主文字 */
  --color-text-secondary:       #6b6b66;   /* 次级文字 */
  --color-text-tertiary:        #9e9e99;   /* 提示/占位文字 */
  --color-text-info:            #0c447c;   /* 信息蓝文字 */
  --color-text-success:         #27500a;   /* 成功绿文字 */
  --color-text-warning:         #633806;   /* 警告橙文字 */
  --color-text-danger:          #791f1f;   /* 危险红文字 */

  /* === 边框色 === */
  --color-border-tertiary:      rgba(0,0,0,0.10);  /* 默认细边框 */
  --color-border-secondary:     rgba(0,0,0,0.18);  /* hover 边框 */
  --color-border-primary:       rgba(0,0,0,0.28);  /* 强调边框 */
  --color-border-info:          #85b7eb;
  --color-border-success:       #97c459;
  --color-border-warning:       #ef9f27;
  --color-border-danger:        #f09595;

  /* === 圆角 === */
  --radius-sm:  4px;
  --radius-md:  8px;
  --radius-lg:  12px;
  --radius-xl:  16px;
  --radius-pill: 999px;

  /* === 间距 === */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;

  /* === 字体 === */
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-mono: "JetBrains Mono", "Fira Code", "Cascadia Code", monospace;

  /* === 过渡 === */
  --transition-fast:   0.12s ease;
  --transition-normal: 0.20s ease;
  --transition-slow:   0.35s ease;

  /* === SVG 图表专用别名 === */
  --p:   var(--color-text-primary);
  --s:   var(--color-text-secondary);
  --t:   var(--color-text-tertiary);
  --bg1: var(--color-background-primary);
  --bg2: var(--color-background-secondary);
  --b:   var(--color-border-tertiary);
}
```

### 2.2 深色模式覆盖

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-background-primary:   #1e1e1c;
    --color-background-secondary: #2a2a28;
    --color-background-tertiary:  #333330;
    --color-background-info:      #0c2f52;
    --color-background-success:   #162d06;
    --color-background-warning:   #2e1a03;
    --color-background-danger:    #2d0f0f;

    --color-text-primary:         #e8e6de;
    --color-text-secondary:       #9c9a92;
    --color-text-tertiary:        #6b6b66;
    --color-text-info:            #85b7eb;
    --color-text-success:         #97c459;
    --color-text-warning:         #ef9f27;
    --color-text-danger:          #f09595;

    --color-border-tertiary:      rgba(255,255,255,0.10);
    --color-border-secondary:     rgba(255,255,255,0.18);
    --color-border-primary:       rgba(255,255,255,0.28);
  }
}
```

---

## 3. 排版规范

### 3.1 字号层级

| 用途 | 字号 | 字重 | 行高 |
|------|------|------|------|
| 页面主标题 | 22px | 500 | 1.3 |
| 区块标题 | 18px | 500 | 1.4 |
| 组件标题 | 16px | 500 | 1.4 |
| 正文 / 卡片标题 | 14px | 400 | 1.6 |
| 次级正文 | 13px | 400 | 1.6 |
| 标签 / 说明 | 12px | 400 | 1.5 |
| 最小标注 | 11px | 400 | 1.5 |

> **禁止使用 10px 以下字号**（移动端辨识度问题）  
> **禁止使用 600/700 字重**（与宿主 UI 视觉冲突）  
> **只使用 400（regular）和 500（medium）**

### 3.2 SVG 图表专用字号

SVG 内部只允许两种字号：

```
主标签（节点标题）：14px，class="th"（font-weight: 500）
副标签（节点描述）：12px，class="ts"（font-weight: 400）
```

所有 SVG `<text>` 必须携带 `class="t"` / `"ts"` / `"th"` 之一，禁止裸文字节点。

### 3.3 文字大小写

- 所有文字使用 **sentence case**（首字母大写，其余小写）
- 禁止 ALL CAPS、Title Case
- 包括 SVG 标签、按钮文字、表头、图例

---

## 4. 颜色语义系统

### 4.1 九色调色板（Ramp System）

每个 ramp 有 7 个色阶（50=最浅 → 900=最深），SVG 图表通过 `class="c-{ramp}"` 使用，自动适配深色模式。

| Class | 色系 | 50 | 400 | 800 | 语义 |
|-------|------|----|-----|-----|------|
| `c-purple` | 紫 | #EEEDFE | #7F77DD | #3C3489 | 核心功能、主流程 |
| `c-teal` | 青 | #E1F5EE | #1D9E75 | #085041 | 数据层、成功路径 |
| `c-blue` | 蓝 | #E6F1FB | #378ADD | #0C447C | 信息、只读节点 |
| `c-green` | 绿 | #EAF3DE | #639922 | #27500A | 正向结果 |
| `c-amber` | 琥珀 | #FAEEDA | #BA7517 | #633806 | 警告、缓存、旁路 |
| `c-coral` | 珊瑚 | #FAECE7 | #D85A30 | #712B13 | 外部系统、边界 |
| `c-red` | 红 | #FCEBEB | #E24B4A | #791F1F | 错误、失败路径 |
| `c-gray` | 灰 | #F1EFE8 | #888780 | #444441 | 中性、起止节点 |
| `c-pink` | 粉 | #FBEAF0 | #D4537E | #72243E | 特殊标注 |

### 4.2 颜色使用原则

```
原则 1：颜色传递语义，不做装饰
原则 2：单个图表最多使用 3 种 ramp
原则 3：同类节点必须使用同一 ramp
原则 4：有色背景上的文字，使用该 ramp 的 800/900 色阶
原则 5：SVG 中禁止硬编码十六进制颜色（连接线/箭头除外）
```

### 4.3 彩色节点文字规则

有色背景节点（如 `c-blue`）内的文字：
- **浅色模式**：填充 50 色阶，文字用 800 色阶（标题）/ 600 色阶（副标题）
- **深色模式**：填充 800 色阶，文字用 100 色阶（标题）/ 200 色阶（副标题）
- **同节点双行文字必须用两个不同色阶**，不能相同

---

## 5. 通用 UI 组件

### 5.1 Card（卡片）

```
形态：白色背景 · 0.5px 边框(border-tertiary) · radius-lg · padding 16px 20px
hover：边框色变 border-secondary · 无阴影
click：scale(0.998) 微缩效果
featured 版本：边框改为 2px border-info（唯一使用 2px 的例外）
```

**Prompt 写法：**
```
制作一张数据记录卡片：
- 左侧 40px 圆形头像，背景 background-info，文字用姓名首字母缩写
- 右侧：主标题 15px/500，副标题 13px/secondary
- 分割线下方：两列 key-value 信息表，12px，key 用 secondary 色
- 整体 hover 时边框加深
- 点击触发 sendPrompt('查看详情：姓名')
```

### 5.2 Metric Card（指标卡）

```
形态：background-secondary 填充（非白色）· 无边框 · radius-md · padding 16px
内容：12px secondary 标签 → 26px/500 数值 → 12px delta（正值绿/负值红）
可选：内嵌 SVG 迷你折线图（高度 36px）
```

### 5.3 Badge / Pill（标签）

```
尺寸：11px/500 · padding 3px 8px · radius-pill
五种语义：info(蓝) · success(绿) · warning(橙) · danger(红) · neutral(灰)
规则：背景用 background-{semantic} · 文字用 text-{semantic} · 边框 0.5px border-{semantic}
```

### 5.4 Button（按钮）

```
基础：13px/500 · padding 7px 14px · radius-md · border 0.5px border-secondary
      hover：background-secondary · active：scale(0.97)
主要按钮(primary)：background = text-primary · color = background-primary · 无边框
危险按钮(danger)：border-danger · color-danger · hover background-danger
禁用：opacity 0.45 · pointer-events none
sendPrompt 按钮：文字末尾加 ↗ 符号
```

### 5.5 Tab Bar（标签页）

```
容器：border-bottom 0.5px · 无背景
标签项：13px/500 · padding 9px 16px · secondary 色
激活态：text-primary · border-bottom 2px text-primary · 下移 -0.5px 覆盖容器线
切换：面板 fadeIn 0.15s
```

### 5.6 Accordion（手风琴）

```
每项：border-top 0.5px（第一项）+ border-bottom 0.5px
触发行：flex 两端对齐 · 标题 13px/500 · 箭头符号 ▾
展开动画：max-height 0→scrollHeight · 0.25s ease · 同时只开一项
内容区：12px/secondary · line-height 1.6 · padding 底部 14px
```

### 5.7 Stepper（步骤条）

```
方向：垂直（推荐）/ 水平
节点圆圈：22px · 三态：
  - 待完成：bg-secondary · border-secondary · text-secondary
  - 当前：bg text-primary · color background-primary · 无边框
  - 已完成：bg-success · text-success · border-success · 显示 ✓
连接线：1px · border-tertiary · min-height 16px · 最后一步不显示
内容：标题 13px/500 · 描述 12px/secondary
```

### 5.8 Progress Bar（进度条）

```
轨道：高 6px · background-secondary · radius-pill · overflow hidden
填充：radius-pill · transition width 0.4s ease
颜色语义：默认 text-primary · 成功 text-success · 警告 text-warning · 危险 text-danger
标签：flex 两端对齐 · 12px/secondary · 间距 6px
```

### 5.9 Toast（通知）

```
位置：右上角（HTML中用 absolute，避免 fixed）
尺寸：宽 240-280px · radius-md · padding 10px 14px
左侧色条：3px · height 32px · radius 2px
颜色：success=绿 · info=蓝 · warning=橙 · danger=红
动画：slideIn from top 0.2s · 3秒后 slideOut · 可手动关闭 ×
```

### 5.10 Skeleton（骨架屏）

```css
/* shimmer 动画 */
@keyframes shimmer {
  to { background-position: 200% center; }
}
.skeleton {
  border-radius: var(--radius-sm);
  background: linear-gradient(
    90deg,
    var(--color-background-secondary) 25%,
    var(--color-background-primary) 50%,
    var(--color-background-secondary) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.4s linear infinite;
}
```

### 5.11 Empty State（空状态）

```
布局：垂直居中 · gap 10px · padding 32px
图标：SVG 内联 · 48px · opacity 0.35 · 灰色线条风格
标题：14px/500
描述：12px/secondary · 居中
操作按钮：primary style · margin-top 6px
```

### 5.12 Data Table（数据表格）

```
表头：11px/500/tertiary · padding 8px 12px · border-bottom 0.5px
单元格：13px · padding 10px 12px · border-bottom 0.5px
末行：无 border-bottom
hover 行：background-secondary
可排序列：表头右侧加 ↑↓ 指示器
```

### 5.13 Chip Filter（筛选标签）

```
默认态：border-tertiary · secondary 色 · radius-pill · 12px/500
激活态：background text-primary · 白色文字 · 无边框
交互：点击切换，支持单选/多选，触发列表实时过滤（JS 控制 display）
```

---

## 6. 图表与图形系统

### SVG 全局规范

所有图表使用 SVG 渲染，遵循以下硬性规则：

```
viewBox：固定宽度 680，高度按内容动态计算
用法：<svg width="100%" viewBox="0 0 680 {H}">
安全区：x=40~640，y=40~(H-40)
箭头 marker：必须在每个 SVG 的 <defs> 中声明
文字：必须携带 class="t"/"ts"/"th"，禁止裸 <text>
节点宽度：标题字符数×8 + 48px（两侧各24px padding）
两行节点高度：56px（标题行22px + 副标题行22px + gap12px）
单行节点高度：44px
禁止：负坐标 · 旋转文字 · 超出 x=640 的元素 · 硬编码颜色
```

**箭头 marker 标准声明（每个 SVG 必须复制）：**

```svg
<defs>
  <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5"
          markerWidth="6" markerHeight="6" orient="auto-start-reverse">
    <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke"
          stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </marker>
</defs>
```

**内置 CSS class（已在宿主页面加载）：**

| Class | 效果 |
|-------|------|
| `class="t"` | 14px regular，主色文字 |
| `class="ts"` | 12px regular，次级色文字 |
| `class="th"` | 14px medium(500)，主色文字 |
| `class="box"` | 中性矩形：bg-secondary 填充，border-tertiary 描边 |
| `class="node"` | 可点击组：hover 微暗，cursor pointer |
| `class="arr"` | 箭头线：1.5px，inherit 颜色 |
| `class="leader"` | 引导虚线：0.5px，dashed，tertiary 色 |
| `class="c-{ramp}"` | 彩色节点：自动填充+描边+文字（深色模式自动翻转）|

---

### 6.1 流程图 Flowchart

**适用**：顺序流程、审批流、数据管道、生命周期

**节点形状语义：**

| 形状 | 含义 | SVG 实现 |
|------|------|----------|
| 圆角矩形 rx=22（胶囊形）| 起止节点 | `<rect rx="22">` |
| 圆角矩形 rx=8 | 普通步骤 | `<rect rx="8">` |
| 菱形 | 判断/决策 | `<polygon points="...">` |
| 平行四边形 | 输入/输出 | `<polygon>` |

**布局规则：**
- 主流程垂直向下，分支水平展开
- 节点间距：主轴 60px，分支轴 80px
- 箭头与节点边缘保持 8px 间距
- 条件分支用 `stroke-dasharray="4 3"` 虚线
- 失败/异常路径用 `class="c-red"`

**Prompt 模板：**

```
绘制一个【主题】流程图，要求：
- 起点：【描述触发条件】
- 步骤序列：
  1. 【步骤1名称】- 【一句话描述，5字内】
  2. 【步骤2名称】- 【描述】
  3. 判断节点：【判断条件】
     - 是 → 【步骤A】
     - 否 → 【步骤B，用红色节点+虚线箭头】
  4. 【后续步骤...】
- 终点：【描述结束状态】
- 颜色：主流程用 c-purple，异常路径用 c-red，结束节点用 c-gray
- 所有节点可点击，点击触发 sendPrompt 询问该步骤详情
- viewBox 高度根据内容自动计算
```

---

### 6.2 架构图 Structural Diagram

**适用**：系统架构、服务边界、层级归属、云资源拓扑

**容器层级规则：**

```
第1层（最外）：rx=16~20 · 最浅填充(50色阶) · 0.5px描边 · 标题左上角14px/500
第2层：rx=12 · 次浅填充(100色阶) · 使用不同 ramp
第3层（最内）：rx=8 · 100~200色阶 · 同ramp或对比ramp
最大嵌套：3层
最小内边距：20px（内容不能紧贴容器边缘）
```

**外部节点规则：**
- 外部系统/客户端放在容器外部
- 用箭头表示数据流向（进入/流出容器）
- 外部节点标签保持简短（≤6字）

**Prompt 模板：**

```
绘制【系统名称】架构图：

外部：
- 【外部系统A】位于左侧，用 c-gray 节点
- 【外部系统B】位于顶部

容器（由外到内）：
1. 最外层容器：标签「【层名称】」，c-purple 配色，包含：
   - 子区域1：「【名称】」，c-teal，功能：【一句话】
   - 子区域2：「【名称】」，c-teal，功能：【一句话】
2. 数据层容器：c-blue，包含：
   - 【数据库节点】
   - 【缓存节点】，用 c-amber

数据流：
- 外部A → 最外层容器（实线箭头）
- 子区域1 → 子区域2（内部虚线箭头，表示调用关系）

底部独立区域：【监控/基础设施层】，c-gray，横向排列子节点
```

---

### 6.3 时序图 Sequence Diagram

**适用**：系统间交互、API 调用链、协议握手、消息传递

**视觉规范：**

```
参与者（Actor）：顶部矩形标签，44px 高
生命线（Lifeline）：从参与者底部向下的垂直虚线，1px，tertiary 色
激活条（Activation bar）：覆盖在生命线上，6px 宽，primary 色，表示执行中
消息箭头：水平线，带箭头
  - 同步调用：实线 + 实心箭头
  - 异步调用：实线 + 开放箭头
  - 返回消息：虚线 + 开放箭头
消息标签：12px，箭头上方 4px 处
时间轴：从上到下，代表时间先后
```

**布局计算：**

```
参与者数量 N，每个参与者间距 = (680 - 80) / (N-1)
参与者矩形宽度：max(name_chars × 8 + 32, 100)，最大 160px
生命线 x = 参与者矩形中心 x
消息箭头：从源生命线 x → 目标生命线 x，y = 当前时序 y
每条消息占用垂直空间：50px
```

**SVG 实现模板：**

```svg
<svg width="100%" viewBox="0 0 680 {H}">
<defs><!-- 箭头 marker --></defs>

<!-- 参与者：3个，间距 240px，起始 x=100 -->
<g class="node c-purple">
  <rect x="60" y="30" width="120" height="44" rx="8" stroke-width="0.5"/>
  <text class="th" x="120" y="52" text-anchor="middle" dominant-baseline="central">客户端</text>
</g>
<g class="node c-teal">
  <rect x="280" y="30" width="120" height="44" rx="8" stroke-width="0.5"/>
  <text class="th" x="340" y="52" text-anchor="middle" dominant-baseline="central">API 服务</text>
</g>
<g class="node c-blue">
  <rect x="500" y="30" width="120" height="44" rx="8" stroke-width="0.5"/>
  <text class="th" x="560" y="52" text-anchor="middle" dominant-baseline="central">数据库</text>
</g>

<!-- 生命线 -->
<line x1="120" y1="74" x2="120" y2="{底部Y}" stroke="var(--t)" stroke-width="1" stroke-dasharray="4 3"/>
<line x1="340" y1="74" x2="340" y2="{底部Y}" stroke="var(--t)" stroke-width="1" stroke-dasharray="4 3"/>
<line x1="560" y1="74" x2="560" y2="{底部Y}" stroke="var(--t)" stroke-width="1" stroke-dasharray="4 3"/>

<!-- 消息1：客户端 → API（同步调用）-->
<line x1="120" y1="110" x2="332" y2="110" class="arr" stroke="#378ADD" stroke-width="1" marker-end="url(#arrow)"/>
<text class="ts" x="225" y="104" text-anchor="middle">POST /api/login</text>

<!-- 激活条：API 服务执行中 -->
<rect x="337" y="110" width="6" height="60" fill="var(--p)" opacity="0.3" rx="1"/>

<!-- 消息2：API → DB（查询）-->
<line x1="343" y1="130" x2="552" y2="130" class="arr" stroke="#378ADD" stroke-width="1" marker-end="url(#arrow)"/>
<text class="ts" x="450" y="124" text-anchor="middle">SELECT user</text>

<!-- 消息3：DB → API（返回，虚线）-->
<line x1="552" y1="155" x2="343" y2="155" stroke="var(--s)" stroke-width="1" stroke-dasharray="4 3" marker-end="url(#arrow)"/>
<text class="ts" x="450" y="149" text-anchor="middle">user record</text>

<!-- 消息4：API → 客户端（返回，虚线）-->
<line x1="337" y1="175" x2="128" y2="175" stroke="var(--s)" stroke-width="1" stroke-dasharray="4 3" marker-end="url(#arrow)"/>
<text class="ts" x="225" y="169" text-anchor="middle">200 {token}</text>
</svg>
```

**Prompt 模板：**

```
绘制【场景名称】时序图，参与者：【A、B、C...】

消息序列：
1. A → B：「【消息内容/接口名】」（同步调用 / 异步）
2. B → C：「【消息】」
3. C → B：「【返回值】」（返回消息，用虚线）
4. B → A：「【响应】」（返回消息，用虚线）

特殊标注：
- 步骤2-3 期间，B 显示激活条（表示等待）
- 如果步骤X失败，显示「【错误消息】」用红色箭头标注

参与者颜色：A用 c-purple · B用 c-teal · C用 c-blue
```

---

### 6.4 泳道图 Swimlane Diagram

**适用**：跨角色流程、审批链路、责任边界划分

**视觉规范：**

```
泳道方向：水平（角色横排，流程从上往下）/ 垂直（角色竖排，流程从左往右）
泳道标签：
  - 水平泳道：左侧固定宽度列（80px）写角色名，垂直居中，14px/500
  - 每条泳道：高度 ≥ 120px，由内容决定
泳道分隔线：0.5px，border-secondary
泳道背景：奇偶交替使用 background-primary / background-secondary
节点：在对应泳道内，遵循流程图节点规范
跨泳道箭头：穿越分隔线，箭头样式不变
```

**布局计算：**

```
画布宽度：680px
泳道标签列宽：90px
内容区宽度：590px
节点在内容区内水平排列，间距 ≥ 40px
跨泳道箭头：垂直穿越，路径需避开其他节点
```

**SVG 实现模板：**

```svg
<svg width="100%" viewBox="0 0 680 {H}">
<defs><!-- arrow --></defs>

<!-- 泳道背景（3条泳道，每条高140px）-->
<rect x="0" y="0" width="680" height="50" fill="var(--bg2)"/>  <!-- 表头 -->
<rect x="0" y="50" width="680" height="140" fill="var(--bg1)"/>
<rect x="0" y="190" width="680" height="140" fill="var(--bg2)"/>
<rect x="0" y="330" width="680" height="140" fill="var(--bg1)"/>

<!-- 分隔线 -->
<line x1="0" y1="50"  x2="680" y2="50"  stroke="var(--b)" stroke-width="0.5"/>
<line x1="0" y1="190" x2="680" y2="190" stroke="var(--b)" stroke-width="0.5"/>
<line x1="0" y1="330" x2="680" y2="330" stroke="var(--b)" stroke-width="0.5"/>
<line x1="90" y1="0"  x2="90"  y2="{H}" stroke="var(--b)" stroke-width="0.5"/>

<!-- 角色标签 -->
<text class="th" x="45" y="120" text-anchor="middle" dominant-baseline="central">用户</text>
<text class="th" x="45" y="260" text-anchor="middle" dominant-baseline="central">前端</text>
<text class="th" x="45" y="400" text-anchor="middle" dominant-baseline="central">后端</text>

<!-- 标题行 -->
<text class="th" x="380" y="25" text-anchor="middle" dominant-baseline="central">用户注册流程</text>

<!-- 用户泳道内的节点 -->
<g class="node c-gray">
  <rect x="110" y="98" width="120" height="44" rx="22" stroke-width="0.5"/>
  <text class="th" x="170" y="120" text-anchor="middle" dominant-baseline="central">填写注册表单</text>
</g>

<!-- 跨泳道箭头（用户→前端）-->
<line x1="170" y1="142" x2="170" y2="238" class="arr" marker-end="url(#arrow)"/>

<!-- 前端泳道内的节点 -->
<g class="node c-purple">
  <rect x="110" y="238" width="140" height="56" rx="8" stroke-width="0.5"/>
  <text class="th" x="180" y="260" text-anchor="middle" dominant-baseline="central">表单校验</text>
  <text class="ts" x="180" y="280" text-anchor="middle" dominant-baseline="central">格式 · 必填项</text>
</g>
</svg>
```

**Prompt 模板：**

```
绘制【流程名称】泳道图：

泳道（从上到下）：
1. 【角色A】（如：用户）
2. 【角色B】（如：前端系统）
3. 【角色C】（如：后端服务）

流程步骤（标明每步所在泳道）：
- 【角色A】：【步骤1】→ 触发 → 【角色B】
- 【角色B】：【步骤2】→ 校验完成 → 【角色C】
- 【角色C】：【步骤3（判断节点：成功/失败）】
  - 成功 → 【角色A】：【响应】（绿色箭头）
  - 失败 → 【角色B】：【错误】（红色箭头）

颜色：角色A用 c-gray · 角色B用 c-purple · 角色C用 c-teal
判断节点用菱形
所有节点可点击查询详情
```

---

### 6.5 ERD 实体关系图

**实现方式**：使用 mermaid.js（`erDiagram` 语法），不用手写 SVG 坐标。

**适用**：数据库 schema、领域模型、API 数据结构

**mermaid 语法速查：**

```
||--||   一对一（强制）
||--o{   一对多（可选多）
}|--|{   多对多
PK       主键
FK       外键
string / integer / uuid / timestamp / boolean   字段类型
```

**HTML 实现模板（完整）：**

```html
<div id="erd-container" style="overflow-x:auto"></div>

<script type="module">
import mermaid from 'https://esm.sh/mermaid@11/dist/mermaid.esm.min.mjs';

const dark = matchMedia('(prefers-color-scheme: dark)').matches;
await document.fonts.ready;

mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  themeVariables: {
    darkMode: dark,
    fontSize: '13px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    lineColor:  dark ? '#9c9a92' : '#73726c',
    textColor:  dark ? '#c2c0b6' : '#3d3d3a',
    primaryColor:      dark ? '#2a2a28' : '#f5f4f0',
    primaryBorderColor: dark ? '#444441' : '#d3d1c7',
    primaryTextColor:   dark ? '#e8e6de' : '#1a1a18',
  },
});

const diagram = `erDiagram
  USERS {
    uuid id PK
    string email
    string name
    timestamp created_at
  }
  POSTS {
    uuid id PK
    uuid user_id FK
    string title
    text content
    timestamp published_at
  }
  COMMENTS {
    uuid id PK
    uuid post_id FK
    uuid user_id FK
    text body
  }
  TAGS {
    uuid id PK
    string name
  }
  POST_TAGS {
    uuid post_id FK
    uuid tag_id FK
  }
  USERS ||--o{ POSTS : "writes"
  POSTS ||--o{ COMMENTS : "has"
  USERS ||--o{ COMMENTS : "writes"
  POSTS ||--o{ POST_TAGS : "has"
  TAGS  ||--o{ POST_TAGS : "tagged in"
`;

const { svg } = await mermaid.render('erd-svg', diagram);
document.getElementById('erd-container').innerHTML = svg;

/* 圆角处理：将实体外框替换为 rect rx=8 */
document.querySelectorAll('#erd-container .node').forEach(node => {
  const firstPath = node.querySelector('path[d]');
  if (!firstPath) return;
  const d = firstPath.getAttribute('d');
  const nums = d.match(/-?[\d.]+/g)?.map(Number);
  if (!nums || nums.length < 8) return;
  const xs = [nums[0],nums[2],nums[4],nums[6]];
  const ys = [nums[1],nums[3],nums[5],nums[7]];
  const x = Math.min(...xs), y = Math.min(...ys);
  const w = Math.max(...xs) - x, h = Math.max(...ys) - y;
  const rect = document.createElementNS('http://www.w3.org/2000/svg','rect');
  rect.setAttribute('x',x); rect.setAttribute('y',y);
  rect.setAttribute('width',w); rect.setAttribute('height',h);
  rect.setAttribute('rx','8');
  for (const a of ['fill','stroke','stroke-width','class','style']) {
    if (firstPath.hasAttribute(a)) rect.setAttribute(a, firstPath.getAttribute(a));
  }
  firstPath.replaceWith(rect);
});

/* 去除行内边框 */
document.querySelectorAll(
  '#erd-container .row-rect-odd path, #erd-container .row-rect-even path'
).forEach(p => p.setAttribute('stroke','none'));
</script>
```

**Prompt 模板：**

```
用 mermaid erDiagram 生成以下数据模型的 ERD：

实体列表：
1. 【实体名1】字段：
   - id: uuid PK
   - 【字段名】: 【类型】
   - ...
2. 【实体名2】字段：...

关系：
- 【实体A】 与 【实体B】：一对多（一个A有多个B）
- 【实体B】 与 【实体C】：多对多（通过中间表 {中间表名}）
- 关系标签：「【动词短语，如 writes/belongs to】」

要求：
- 使用完整 HTML 实现模板
- 适配深色模式
- 实体外框圆角 rx=8
- 行内边框去除，用背景色区分奇偶行
```

---

### 6.6 决策树 Decision Tree

**适用**：故障排查、条件分类、规则引擎可视化

**与流程图的区别**：
- 决策树聚焦「分类结果」，叶节点是最终答案
- 流程图聚焦「执行步骤」，节点是动作

**视觉规范：**
- 菱形节点：判断问题，`c-gray` 或 `c-purple`
- 矩形叶节点：最终结果，颜色语义化（成功=green/teal，失败=red，中性=gray）
- 分支标签：直接写在箭头旁，是/否 or 具体条件
- 从上到下，层级清晰，同层节点水平对齐

**Prompt 模板：**

```
绘制【问题领域】决策树：

根节点问题：「【第一个判断条件】」

分支1（是）→ 子问题：「【条件2】」
  - 子分支1a（是）→ 结果：「【最终答案A】」（c-green）
  - 子分支1b（否）→ 结果：「【最终答案B】」（c-amber）

分支2（否）→ 子问题：「【条件3】」
  - 子分支2a（是）→ 结果：「【最终答案C】」（c-teal）
  - 子分支2b（否）→ 结果：「【最终答案D】」（c-red）

布局：根节点居中顶部，层间距 80px，同层节点均匀分布
所有节点可点击询问该判断条件的详情
```

---

## 7. 交互规范

### 7.1 sendPrompt 使用规则

```javascript
// 全局函数，模拟用户向 AI 发送消息
sendPrompt('你想了解什么？');

// 使用场景：
// 1. 节点点击：深入了解某个组件/概念
// 2. 结果触发：测验完成后上报分数
// 3. 导航引导：帮用户跳转到相关内容

// 命名规范：
sendPrompt('展示详情：节点名称');
sendPrompt('解释：概念名称');
sendPrompt('测验完成，得分：${score}');
```

### 7.2 五态设计

所有交互组件必须设计这 5 种状态：

| 状态 | 要求 |
|------|------|
| 空/初始 | 显示空状态组件或占位符 |
| 加载中 | Skeleton 或 spinner，按钮 disabled |
| 正常 | 完整数据展示 |
| Hover | 边框/背景/阴影变化，0.12s 过渡 |
| 错误 | 红色提示 + 重试入口 |

### 7.3 表单校验

```
触发时机：失焦(blur)时校验 + 提交时全量校验
错误样式：输入框 border-danger · 下方红色 11px 错误文字
成功样式：可选绿色对勾图标
空值处理：未填时结果区显示「—」
```

### 7.4 状态机（AI 调用必备）

```
IDLE → LOADING → SUCCESS
              ↓
            ERROR → IDLE（重试）

IDLE：按钮可用，输入框可编辑
LOADING：按钮 disabled + 文字变「生成中…」，流式输出逐字显示
SUCCESS：显示结果，提供复制/重试按钮
ERROR：红色提示框 + 重试按钮 + 错误原因简述
```

---

## 8. 动画规范

### 8.1 时间曲线

```css
--transition-fast:   0.12s ease;   /* hover 态切换 */
--transition-normal: 0.20s ease;   /* 面板切换、展开 */
--transition-slow:   0.35s ease;   /* 页面级过渡 */
```

### 8.2 允许的动画属性

```css
/* 允许：性能好，不触发重排 */
transform · opacity · filter(仅blur)

/* 谨慎：触发重绘 */
width · height · max-height（手风琴展开可用）

/* 禁止：触发重排，性能差 */
transition: all  /* 改为具体属性 */
top · left · margin  /* 改用 transform */
```

### 8.3 Shimmer 骨架屏

```css
@keyframes shimmer {
  to { background-position: 200% center; }
}
/* 宽度随内容，高度匹配真实元素，duration 1.4s */
```

### 8.4 禁止的动画

- 纯炫技的旋转、闪烁（无语义）
- 动画期间禁用交互（动画不阻塞点击）
- 超过 2s 的循环动画（用户感知为「卡顿」）

### 8.5 减弱动画支持

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 9. 响应式规范

### 9.1 断点

```css
/* Mobile first */
/* 默认：< 640px，单列 */
@media (min-width: 640px)  { /* 平板：2列 */ }
@media (min-width: 1024px) { /* 桌面：3列+ */ }
```

### 9.2 网格系统

```css
/* 推荐写法：自适应列数 */
.grid-auto {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

/* 内部元素防撑开 */
.grid-auto > * {
  min-width: 0;
}
```

### 9.3 移动端规则

- 可点击区域最小 44×44px（苹果 HIG 标准）
- `<input>` 字号 ≥ 16px（防 iOS 自动缩放）
- 图片加 `width:100%; height:auto`
- 避免 `min-width` 固定值超过 320px
- 表格：窄屏改为堆叠布局或允许横向滚动

---

## 10. 深色模式规范

### 10.1 强制要求

所有颜色通过 CSS 变量，不允许出现：
```css
/* 禁止 */
color: #333;
background: #fff;
border-color: rgba(0,0,0,0.1);

/* 正确 */
color: var(--color-text-primary);
background: var(--color-background-primary);
border-color: var(--color-border-tertiary);
```

### 10.2 SVG 深色模式

- 彩色节点使用 `class="c-{ramp}"`，自动翻转（深色模式用深色填充+浅色文字）
- 连接线颜色用十六进制中间色阶（如 `#378ADD` 蓝色400），两种模式均可辨识
- 所有 `<text>` 必须用 `class="t"/"ts"/"th"` — 继承 CSS 变量颜色

### 10.3 心理测试

> 想象背景是近黑色（#1e1e1c），问自己：
> - 所有文字还能读清吗？
> - 边框线还可见吗？
> - 图标还能辨识吗？
>
> 如果任何一项「不能」，检查是否有硬编码颜色。

---

## 11. 无障碍规范

### 11.1 最小要求

```html
<!-- 按钮必须是真实按钮或有 role -->
<button onclick="...">操作</button>
<div role="button" tabindex="0" onclick="...">操作</div>

<!-- 图标按钮必须有标签 -->
<button aria-label="关闭对话框">×</button>

<!-- 表单输入关联标签 -->
<label for="email">邮箱</label>
<input id="email" type="email">

<!-- 颜色不是唯一区分手段（配合形状/文字）-->
<!-- focus 状态可见 -->
:focus-visible { outline: 2px solid var(--color-border-info); outline-offset: 2px; }
```

### 11.2 SVG 图表

```svg
<!-- 添加 role 和 aria-label -->
<svg role="img" aria-label="系统架构图：包含3个服务层">
  <!-- 可点击节点加 tabindex -->
  <g role="button" tabindex="0" aria-label="用户服务：点击了解详情">
```

---

## 12. System Prompt 模板

将以下内容复制为 AI 对话的 System Prompt，即可让 AI 严格按照本规范生成组件：

---

```
你是一个前端组件渲染专家，严格遵循以下设计系统规范生成 HTML/SVG 组件。

=== 核心约束 ===
1. 所有颜色必须使用 CSS 变量（--color-*），禁止硬编码十六进制值
2. CSS 变量体系：
   背景：--color-background-primary/secondary/tertiary/info/success/warning/danger
   文字：--color-text-primary/secondary/tertiary/info/success/warning/danger
   边框：--color-border-tertiary(默认)/secondary(hover)/primary(强调)
   圆角：--radius-sm(4px)/md(8px)/lg(12px)/xl(16px)/pill(999px)
3. 字重只用 400(regular) 和 500(medium)，禁止 600/700
4. 字号层级：卡片标题14px/正文13px/标签12px/最小11px，禁止10px以下
5. 所有文字使用 sentence case
6. 禁止 position:fixed（用 absolute 替代）
7. 禁止 transition:all（改为具体属性）
8. 深色模式通过 @media(prefers-color-scheme:dark) 覆盖变量

=== SVG 图表规范 ===
1. viewBox 固定宽度 680，高度按内容计算：<svg width="100%" viewBox="0 0 680 {H}">
2. 每个 SVG 必须在 <defs> 中声明箭头 marker：
   <defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></marker></defs>
3. 所有 <text> 必须有 class：class="t"(14px regular) / class="ts"(12px) / class="th"(14px/500)
4. 可用彩色节点 class：c-purple/c-teal/c-blue/c-green/c-amber/c-coral/c-red/c-gray/c-pink
   施加于 <g> 或 <rect>/<circle>/<ellipse>，禁止施加于 <path>
5. 节点宽度计算：标题字符数×8 + 48px；单行高44px，双行高56px
6. 连接线 fill="none"（否则渲染为黑色实心形状）
7. 所有节点用 class="node" 包裹，可加 onclick="sendPrompt('...')"
8. 边框宽度：0.5px（禁止 1px/2px，除了 featured 卡片的 2px 例外）

=== 九色调色板（SVG 彩色节点）===
c-purple：#EEEDFE(50) → #7F77DD(400) → #3C3489(800)
c-teal：  #E1F5EE(50) → #1D9E75(400) → #085041(800)
c-blue：  #E6F1FB(50) → #378ADD(400) → #0C447C(800)
c-green： #EAF3DE(50) → #639922(400) → #27500A(800)
c-amber： #FAEEDA(50) → #BA7517(400) → #633806(800)
c-coral： #FAECE7(50) → #D85A30(400) → #712B13(800)
c-red：   #FCEBEB(50) → #E24B4A(400) → #791F1F(800)
c-gray：  #F1EFE8(50) → #888780(400) → #444441(800)
颜色使用原则：同类节点同色；单图表≤3种ramp；颜色传语义不做装饰

=== 图表类型选择 ===
流程图：顺序步骤+条件分支，用 SVG 圆角矩形+菱形判断节点
架构图：层级归属+服务边界，用嵌套大圆角矩形容器
时序图：系统间消息传递，用 SVG 生命线+水平消息箭头
泳道图：跨角色流程，用分隔线划分泳道+角色标签列
ERD：数据库关系，用 mermaid.js erDiagram 语法
决策树：条件分类，用菱形判断节点+叶节点结果

=== 交互规范 ===
sendPrompt(text)：全局函数，节点点击时调用，传入询问内容
五态设计：空/加载中/正常/hover/错误，至少实现前3种
AI 调用状态机：IDLE→LOADING→SUCCESS/ERROR→IDLE

=== 禁止事项 ===
禁止硬编码颜色 | 禁止负坐标 | 禁止旋转文字 | 禁止 transition:all
禁止 position:fixed | 禁止裸 <text>（无class）| 禁止 <path> 上的 c-* class
禁止 font-weight 600/700 | 禁止 font-size 10px 以下
```

---

## 13. 场景 Prompt 速查卡

### 卡片类

```
制作一个【类型】卡片组件：
内容结构：
- 顶部：【头像/图标】+【主标题 15px/500】+【副标题 13px/secondary】+【右侧 badge】
- 中部（分割线后）：【key-value 信息，12px，key 用 secondary 色】
- 底部（可选）：【操作按钮区】
交互：hover 边框加深，click 触发 sendPrompt('查看：名称')
深色/浅色模式自适应，无硬编码颜色
```

### 指标看板

```
制作4个指标卡片横向排列：
每卡包含：
- 指标名（12px/secondary）
- 数值（26px/500/primary）
- 环比变化（12px，正值绿色+↑，负值红色+↓）
- 7日迷你折线图（36px高，SVG内联）
数据：【逐项填写 名称/数值/变化/趋势数组】
移动端变2列
```

### 流程图

```
绘制【名称】流程图（SVG，680px宽）：
起点：【触发条件】
步骤：
1. 【步骤名】（c-purple）- 【功能描述5字内】
2. 判断：【条件】
   - 是 → 【步骤A】
   - 否 → 【步骤B】（c-red，虚线箭头）
3. 【后续步骤...】
终点：【结果状态】（c-gray，胶囊形）
要求：节点可点击，触发 sendPrompt 询问详情
```

### 架构图

```
绘制【系统名】架构图（SVG，680px宽）：
最外层容器：「【层名】」c-purple，包含：
  - 服务A（c-teal）：【功能】
  - 服务B（c-teal）：【功能】
数据层容器：「Data layer」c-blue，包含：
  - 主库（c-blue）
  - 缓存（c-amber）
基础设施层：「Infra」c-gray，横排子节点
外部：客户端（c-gray）→ API网关（c-purple）箭头指向最外层
```

### 时序图

```
绘制【场景】时序图（SVG，680px宽）：
参与者（从左到右）：
- 【角色A】（c-purple）
- 【角色B】（c-teal）
- 【角色C】（c-blue）
消息序列：
1. A→B：「【接口/事件名】」同步，实线
2. B→C：「【查询】」同步，实线
3. C→B：「【返回值】」返回，虚线
4. B→A：「【响应】」返回，虚线
步骤2-3间 B 显示激活条
```

### 泳道图

```
绘制【流程名】泳道图（SVG，680px宽，垂直泳道）：
泳道（从上到下）：
1. 【角色A】- c-gray 节点
2. 【角色B】- c-purple 节点
3. 【角色C】- c-teal 节点
流程：
- A泳道：起始节点「【名称】」→ 跨道箭头到B
- B泳道：「【处理步骤】」→ 判断节点 → 跨道到C / 返回A
- C泳道：「【最终步骤】」
泳道交替背景：primary/secondary
```

### ERD

```
生成【系统名】数据库 ERD（mermaid erDiagram）：
实体：
1. 【ENTITY1】字段：id(uuid PK)，【field】(【type】)...
2. 【ENTITY2】字段：...
关系：
- ENTITY1 ||--o{ ENTITY2 : "【动词】"（一对多）
- ENTITY2 }|--|{ ENTITY3 : "【动词】"（多对多）
输出完整 HTML，包含：mermaid 初始化/深色模式适配/圆角处理/去除行内边框
```

### AI 对话组件

```
制作一个 AI 问答组件：
输入区：多行文本框 + 发送按钮
状态机：
- IDLE：按钮显示「发送」，文本框可编辑
- LOADING：按钮变「生成中…」+ disabled，输出区逐字流式显示
- SUCCESS：显示完整回答，提供「复制」和「重新生成」按钮
- ERROR：红色提示「生成失败」+ 重试按钮
输出区：markdown 渲染，等宽字体，带滚动
System Prompt：「【AI角色定义和输出格式要求】」
```

---

## 14. 错误修复手册

### T1：深色模式文字不可见

```css
/* 找到硬编码颜色，替换为变量 */
color: #333        → color: var(--color-text-primary)
color: #666        → color: var(--color-text-secondary)
background: #fff   → background: var(--color-background-primary)
background: #f5f5f5 → background: var(--color-background-secondary)
border-color: rgba(0,0,0,.1) → border-color: var(--color-border-tertiary)
```

### T2：SVG 连接线变成黑色实心

```svg
<!-- 所有 path/polyline 用作连接线时必须加 fill="none" -->
<path d="M..." fill="none" stroke="..." .../>
<polyline points="..." fill="none" .../>
```

### T3：SVG 文字颜色不跟随深色模式

```svg
<!-- 错误：硬编码文字颜色 -->
<text fill="#333">标签</text>

<!-- 正确：使用预置 class -->
<text class="th" x="..." y="...">标签</text>
```

### T4：节点文字溢出

```
检查：标题字符数 × 8 + 48 是否 > rect width
修复：增大 rect width，或缩短标签文字
规则：节点宽度 = max(title_chars×8, subtitle_chars×7) + 48
```

### T5：箭头穿过其他节点

```svg
<!-- 错误：直线穿过中间节点 -->
<line x1="A" y1="..." x2="B" y2="..."/>

<!-- 正确：L形绕行路径 -->
<path d="M Ax Ay L Ax Ymid L Bx Ymid L Bx By" fill="none" stroke="..." marker-end="url(#arrow)"/>
```

### T6：viewBox 内容被截断

```
检查步骤：
1. 找最低元素：max(y + height) 所有 rect
2. 找最高文字：max(y) 所有 text baselines + 4px
3. viewBox height = 上述最大值 + 40
4. 检查是否有 x > 640 或 x < 0 的元素
```

### T7：Tab 切换后内容不显示

```javascript
// 检查切换逻辑
function switchTab(idx) {
  // 必须先全部隐藏
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  // 再显示目标
  document.getElementById('panel-' + idx).classList.add('active');
}
// CSS
.tab-panel { display: none; }
.tab-panel.active { display: block; }
```

### T8：c-{ramp} 颜色失效

```svg
<!-- 错误：c-* 施加于 path -->
<path class="c-blue" d="M..."/>

<!-- 错误：c-* 在过深的嵌套层 -->
<g class="c-blue">
  <g>  <!-- 多了一层 g -->
    <rect .../>  <!-- 变成孙元素，失效 -->
  </g>
</g>

<!-- 正确：c-* 施加于直接包含 shape 的 g，或直接施加于 shape -->
<g class="c-blue">
  <rect .../>
  <text class="th" .../>
</g>
```

### T9：手风琴展开高度不对

```javascript
// 展开时用 scrollHeight，不要猜测高度
const inner = item.querySelector('.accordion-inner');
body.style.maxHeight = isOpen ? '0' : inner.scrollHeight + 'px';
// 关闭时
body.style.maxHeight = '0';
```

### T10：ERD 渲染失败

```javascript
// 确认 mermaid 版本
import mermaid from 'https://esm.sh/mermaid@11/dist/mermaid.esm.min.mjs';

// 等待字体加载
await document.fonts.ready;

// 初始化必须在 render 之前
mermaid.initialize({ startOnLoad: false, ... });

// render 传入唯一 id
const { svg } = await mermaid.render('unique-id-' + Date.now(), diagram);
```

### T11：AI 流式输出乱码

```javascript
const decoder = new TextDecoder();  // 不需要额外参数
// decode 时传 stream:true
buffer += decoder.decode(value, { stream: true });

// 按行解析
const lines = buffer.split('\n');
buffer = lines.pop();  // 保留不完整行
for (const line of lines) {
  if (!line.startsWith('data: ')) continue;
  const json = line.slice(6);
  if (json === '[DONE]') continue;
  try {
    const evt = JSON.parse(json);
    if (evt.type === 'content_block_delta') {
      outputEl.textContent += evt.delta.text;
    }
  } catch {}
}
```

### T12：移动端触摸区域太小

```css
/* 可点击元素最小 44×44px */
.btn, .chip, .tab-item {
  min-height: 44px;
  min-width: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
/* 图标按钮：视觉小但触摸区大 */
.icon-btn {
  padding: 12px;  /* 视觉图标16px + 12px四周 = 40px，近似44px */
}
```

---
SVG 里的 `<rect>` **不能自适应内容**——这是 SVG 和 HTML 最根本的区别之一。

## 为什么 SVG 没有自适应

SVG 是一个**绝对坐标系**，每个元素的位置和尺寸必须在绘制时就写死。`<rect>` 不知道旁边的 `<text>` 有多宽，它们是独立的图形元素，不存在 HTML 那种「父容器包裹子内容」的盒模型。

```svg
<!-- 这两个元素互相不知道对方存在 -->
<rect x="10" y="10" width="200" height="44"/>
<text x="110" y="32">Hello world</text>
```

## 实际是怎么做的

看起来「自适应」，其实是**手动计算**出来的。

**方法一：字符数估算（静态图表用这个）**

```
节点宽度 = 最长文字的字符数 × 每字符平均宽度 + 两侧 padding
```

Anthropic Sans 14px 下，每个拉丁字符约 8px 宽，所以：

```
"Load balancer" = 13字符 × 8px + 48px(两侧各24) = 152px
实际写：width="160"（留余量）
```

汉字更宽，约 14px/字：

```
"用户服务" = 4字 × 14px + 48px = 104px
实际写：width="120"
```

这就是为什么规范里写 `rect_width = title_chars×8 + 48`。

**方法二：JavaScript 运行时测量（动态生成用这个）**

```javascript
// 先把文字渲染出来，测量实际宽度，再回头设置 rect
const text = svg.querySelector('text');
const bbox = text.getBBox(); // 拿到实际渲染宽高

const padding = 24;
rect.setAttribute('width', bbox.width + padding * 2);
rect.setAttribute('height', bbox.height + padding * 2);
rect.setAttribute('x', text.getAttribute('x') - padding - bbox.width/2);
rect.setAttribute('y', text.getAttribute('y') - padding - bbox.height/2);
```

`getBBox()` 是 SVG 原生 API，返回元素的实际边界框，但**必须在元素已渲染到 DOM 之后**才能调用。

这本质上是在 SVG 里嵌入一块 HTML，享受 HTML 的盒模型。代价是 `foreignObject` 在某些导出/打印场景下会失效。

## 实际工程里的选择

| 场景 | 方案 |
|------|------|
| 静态图表、内容固定 | 字符数估算，手写坐标 |
| 动态数据、节点内容变化 | `getBBox()` 测量后回填 |
| 复杂自适应布局 | 放弃 SVG，改用 HTML+CSS |
| 节点文字多语言/长度不确定 | `foreignObject` 或直接用 HTML |

这也是为什么复杂的图表库（Mermaid、D3）都在内部做大量的测量计算——它们用 JS 先测量所有文字宽度，算出整体布局，最后一次性写入坐标。手写 SVG 时就只能靠估算 + 经验留余量。


这是个很好的问题，把底层逻辑说清楚。分两层来讲：**通用计算模型**，然后**每种图的专属算法**。

---

## 一、通用计算模型

所有 SVG 图表的绘制，本质上都是同一个流程：

```
输入数据（节点/关系）
    ↓
1. 测量阶段：计算每个节点的尺寸
    ↓
2. 布局阶段：计算每个节点的坐标
    ↓
3. 路由阶段：计算连线路径
    ↓
4. 渲染阶段：输出 SVG 坐标
```

手写 SVG 和图表库（D3/Mermaid）做的事完全一样，区别只是手写时这些计算在你脑子里完成。

---

## 二、阶段一：测量节点尺寸

### 字符宽度估算表

```
Anthropic Sans / 系统 sans-serif，14px：

拉丁小写均值：  7.5px/字符
拉丁大写均值：  9.0px/字符
数字：          8.0px/字符
汉字：         14.0px/字符（等宽）
空格：          4.0px

实用简化：全部按 8px/字符 估算，宽松 10% 余量
```

### 节点尺寸公式

```
单行节点：
  width  = max(title_chars × 8, 80) + 48   ← 两侧各 24px padding
  height = 44

双行节点（标题 + 副标题）：
  title_w    = title_chars × 8
  subtitle_w = subtitle_chars × 7           ← 副标题 12px，字符更窄
  width  = max(title_w, subtitle_w) + 48
  height = 56                               ← 22 + 12 + 22

胶囊形起止节点（rx = height/2）：
  width  = text_chars × 8 + 64             ← 两侧各 32px
  height = 44
  rx     = 22

菱形判断节点：
  内切文字宽 text_w = text_chars × 8
  菱形宽  = text_w + 80                    ← 两侧留 40px 到顶点
  菱形高  = 60
  顶点坐标：
    top    = (cx, cy - 30)
    right  = (cx + half_w, cy)
    bottom = (cx, cy + 30)
    left   = (cx - half_w, cy)
```

---

## 三、阶段二：布局算法（各图不同）

### 3.1 流程图布局 — 分层树算法

**核心思路**：把图转成有向无环图，按层级自顶向下排列。

```
Step 1：拓扑排序，确定每个节点的层级 depth
  depth[起点] = 0
  depth[n]    = max(depth[所有父节点]) + 1

Step 2：同层节点水平排列
  total_w  = Σ(node_widths) + (n-1) × gap     ← gap 最小 40px
  start_x  = (680 - total_w) / 2              ← 居中对齐
  node_x   = start_x + Σ(前面节点宽 + gap)
  node_cx  = node_x + node_width / 2           ← 中心点

Step 3：层间垂直间距
  y[depth=0] = 40
  y[depth=d] = y[d-1] + max_height_in_layer[d-1] + row_gap
  row_gap    = 60（主流程）/ 40（分支）
```

**举例：3节点线性流程**

```
节点：A(120px) → B(160px) → C(140px)
总宽：120 + 160 + 140 + 2×60(gap) = 540px
起始x：(680-540)/2 = 70

A: x=70,  cx=130,  width=120
B: x=250, cx=330,  width=160
C: x=470, cx=540,  width=140

垂直：y=40（单行，每层间隔60）
→ depth0: y=40,  depth1: y=144, depth2: y=248
```

**有分支时的子树宽度计算**：

```
每个节点的"占地宽" = max(自身宽度, 所有子树占地宽之和 + 子树间gap)

从叶节点往上计算：
  leaf.span     = leaf.width
  parent.span   = Σ(children.span) + (n-1) × gap
  parent.cx     = (leftmost_child.cx + rightmost_child.cx) / 2
```

---

### 3.2 架构图布局 — 嵌套矩形装箱

**核心思路**：从内到外计算，先算子容器，再算父容器。

```
Step 1：叶节点（最内层服务节点）
  确定固定尺寸：width=按标题计算，height=44 or 56

Step 2：同层子节点横向排列
  row_width  = Σ(node_widths) + (n-1) × item_gap    ← item_gap=16
  row_height = max(node_heights)

Step 3：计算父容器尺寸
  container_width  = row_width + 2 × padding         ← padding=24
  container_height = label_height + row_height + 2×padding + label_gap
                   ← label_height=24（容器标题行）
                      label_gap=12

Step 4：容器内子节点起始坐标
  first_child_x = container_x + padding
  first_child_y = container_y + padding + label_height + label_gap
```

**多行子节点时**：

```
当 row_width > (parent_max_width - 2×padding) 时换行：
  max_cols     = floor((parent_max_width - 2×padding + item_gap) / (min_node_width + item_gap))
  row_count    = ceil(child_count / max_cols)
  total_height = row_count × row_height + (row_count-1) × row_gap
```

**嵌套层间距规则**：

```
外层容器 rx=16, padding=24
中层容器 rx=12, padding=20  
内层节点 rx=8,  无额外padding

颜色深度递增：同ramp的 50→100→200 色阶
```

---

### 3.3 时序图布局 — 均匀列分布

**核心思路**：N个参与者均匀分布在680px宽度，时间轴竖向延伸。

```
Step 1：参与者水平定位
  safe_width    = 640                    ← x=40到x=640
  actor_count   = N
  col_span      = safe_width / (N-1)     ← 均匀间距
  actor_cx[i]   = 40 + i × col_span

  actor_width   = min(actor_label_chars×8 + 32, col_span - 20)
  actor_x[i]    = actor_cx[i] - actor_width/2
  actor_height  = 44
  actor_y       = 30

Step 2：生命线
  lifeline_x[i] = actor_cx[i]
  lifeline_y0   = actor_y + actor_height          ← 44+30=74
  lifeline_y1   = 动态延伸（随消息增加）

Step 3：消息垂直定位
  message_y[0]  = actor_y + actor_height + 36    ← 第一条消息离actor底部36px
  message_y[k]  = message_y[k-1] + message_gap
  message_gap   = 50（普通）/ 70（含激活条）/ 40（紧凑模式）

Step 4：消息箭头坐标
  from_x = lifeline_x[sender]
  to_x   = lifeline_x[receiver]
  y      = message_y[k]
  → <line x1=from_x y1=y x2=to_x y2=y>

Step 5：激活条（执行块）
  bar_x      = lifeline_x[actor] - 3
  bar_width  = 6
  bar_y      = message_y[call]
  bar_height = message_y[return] - message_y[call]

Step 6：viewBox 高度
  H = message_y[last] + 60               ← 底部留60px
```

**3个参与者示例**：

```
N=3, col_span = 640/2 = 320

actor_cx: [40, 360, 680→改为640]   ← 边界修正
实际用：   [120, 340, 560]          ← (40+200, 40+300, 40+400) 更合理

message_y[0] = 74 + 36 = 110
message_y[1] = 110 + 50 = 160
message_y[2] = 160 + 50 = 210
message_y[3] = 210 + 50 = 260（返回）

viewBox H = 260 + 60 = 320
```

---

### 3.4 泳道图布局 — 行列交叉

**核心思路**：两个维度独立计算，行(泳道)决定Y范围，列(步骤)决定X范围，节点坐标是两者的交叉点。

```
Step 1：泳道高度
  label_col_width = 90
  lane_height[i]  = max(该泳道内所有节点高度) + 2×lane_padding
  lane_padding    = 30
  lane_y[0]       = header_height                ← header=40
  lane_y[i]       = lane_y[i-1] + lane_height[i-1]

  泳道内节点中心 y：
  node_cy[lane=i] = lane_y[i] + lane_height[i]/2

Step 2：步骤水平定位
  content_width = 680 - label_col_width = 590
  step_count    = M
  step_gap      = content_width / (M+1)        ← 首尾各留一个gap
  step_cx[j]    = label_col_width + step_gap×(j+1)

Step 3：节点坐标
  node_cx = step_cx[j]
  node_cy = lane_cy[i]
  node_x  = node_cx - node_width/2
  node_y  = node_cy - node_height/2

Step 4：跨泳道箭头
  同步骤跨泳道（垂直箭头）：
    x1 = x2 = step_cx[j]
    y1 = node_cy[from_lane] + node_height/2
    y2 = node_cy[to_lane]   - node_height/2

  同泳道跨步骤（水平箭头）：
    y1 = y2 = lane_cy[i]
    x1 = step_cx[j]   + node_width/2
    x2 = step_cx[j+1] - node_width/2

Step 5：viewBox 高度
  H = lane_y[last] + lane_height[last] + 20
```

**泳道背景绘制顺序**（重要，决定层叠关系）：

```
1. 先画所有泳道背景色块（奇偶交替）
2. 再画分隔线
3. 再画标签列背景
4. 再画角色文字
5. 最后画节点和箭头
```

---

### 3.5 ERD — 交给 Mermaid 算

ERD 不手写坐标，原因很简单：

```
ERD 的核心难题：
  N个实体，每个有M个字段，实体间有K条关系线
  需要：自动避免连线交叉 + 字段行对齐 + 表格内边框

这是"图的自动布局"问题（force-directed / Sugiyama算法）
手写 SVG 坐标完全无法处理连线交叉问题
```

Mermaid 内部用的是 **Dagre**（有向图自动布局库），调用方式：

```javascript
// Mermaid 接受声明式语法，内部完成所有布局计算
const diagram = `erDiagram
  USERS ||--o{ POSTS : writes
  ...
`;
const { svg } = await mermaid.render('id', diagram);
// svg 已经包含计算好的所有坐标
```

你能做的后处理：圆角替换、去除行内边框、主题变量注入。

---

## 四、阶段三：连线路由算法

### 直线 vs L形 vs 曲线的选择规则

```
直线（<line>）：
  条件：起点和终点之间没有其他节点
  判断：所有中间节点的 bbox 都不与这条线段相交

L形路径（<path d="M x1 y1 L x1 mid L x2 mid L x2 y2">）：
  条件：直线会穿过其他节点
  midY 选取：两个节点 y 坐标的中点
  midY = (from_bottom + to_top) / 2

曲线（贝塞尔，架构图少用，时序图不用）：
  适合表达"非正式"的依赖关系
  <path d="M x1 y1 C cx1 cy1 cx2 cy2 x2 y2">
  控制点：cx1=x1, cy1=mid  cx2=x2, cy2=mid
```

### 箭头端点偏移（防止箭头压住节点边框）

```
箭头终点不能直接到节点边缘，需要缩进 marker 长度：
  marker refX=8, markerWidth=6, stroke-width=1.5
  实际缩进 ≈ 9px

from 节点（矩形）：
  出发点 = (node_cx, node_y + node_height)     ← 底部中心
  实际 y1 = node_y + node_height               ← 不偏移（从边缘出发）

to 节点（矩形）：
  抵达点 = (node_cx, node_y)                   ← 顶部中心
  实际 y2 = node_y - 1                         ← 略微缩进，避免压线
```

---

## 五、阶段四：viewBox 高度计算

这是最容易出错的地方，标准计算流程：

```javascript
// 收集所有元素的底边 y 坐标
const bottoms = [];

// 矩形/容器
bottoms.push(rect.y + rect.height);

// 文字（text 的 y 是 baseline，需加 descent）
bottoms.push(text.y + 4);   // 4px descent 估算

// 菱形（判断节点）
bottoms.push(diamond.cy + diamond.half_height);

// 连线标签
bottoms.push(label.y + 4);

// 最终高度
const maxY = Math.max(...bottoms);
const H = maxY + 40;         // 底部 40px buffer
```

---

## 六、一张图：完整计算顺序

```
输入：节点数据 + 关系数据
         │
         ▼
  ┌─────────────────┐
  │  1. 测量阶段    │  每个节点 → width/height
  │  字符数 × 8px   │  菱形 → 半宽/半高
  └────────┬────────┘
           │
           ▼
  ┌─────────────────┐
  │  2. 布局阶段    │  分配 cx/cy（中心坐标）
  │  图类型决定算法 │  流程图→树分层
  │                 │  架构图→装箱
  │                 │  时序图→均分列
  │                 │  泳道图→行列交叉
  └────────┬────────┘
           │
           ▼
  ┌─────────────────┐
  │  3. 推导边角    │  cx/cy → x/y（左上角）
  │  x = cx - w/2   │  交叉检测 → 选直线/L形
  │  y = cy - h/2   │  计算箭头起止偏移
  └────────┬────────┘
           │
           ▼
  ┌─────────────────┐
  │  4. viewBox 高度│  max(所有底边y) + 40
  └────────┬────────┘
           │
           ▼
  输出：SVG 坐标字符串
```

---

## 七、手写 vs 自动布局的边界

```
适合手写 SVG（≤8个节点，关系简单）：
  ✓ 线性流程（A→B→C→D）
  ✓ 简单分支（一个判断节点，两条路径）
  ✓ 3-4层架构图，每层≤3个节点
  ✓ 3-4个参与者的时序图

超过这个规模，应该：
  → 用 Mermaid（支持 flowchart/sequence/erDiagram）
  → 用 D3.js（完整力导向布局）
  → 用 ELK.js（Sugiyama 层次布局，最适合流程图）
  → 用 Dagre（有向图自动路由）
```

这就是为什么所有手写的示例都刻意控制节点数——不是偷懒，是因为超过这个规模后，手算坐标的错误率会指数级上升，连线交叉问题在没有算法的情况下几乎无解。
---

## 15. Widget 体系 — Markdown 组件规范

> 适用于 `/web/content/**/*.md` 课程文件  
> 所有 widget 通过 `MarkdownRenderer` 渲染，底层为 React 客户端组件。

---

### 15.1 Widget 体系总览（两种语法 · 选型规则）

Widget 有两种书写方式，按内容性质选择：

| 场景 | 语法 | 适用 widget |
|------|------|-------------|
| **内容丰富**，正文需要 Markdown（粗体、列表、代码）| `:::name{attrs}` 指令块 | `callout`、`ai-chat`、`scenario-eval`、`quiz` |
| **数据密集**，主要是数字、公式、枚举配置 | ` ```widget:name ` 代码块 + JSON | `sandbox`、`before-after`、`checklist`、`diagram`、`prompt-practice` |

**指令块语法（remark-directive）**

```markdown
:::widget-type{attr1="值" attr2="值"}
这里是 **Markdown 内容**，支持粗体、`行内代码`、列表等。
:::
```

**代码块语法（widget protocol）**

````markdown
```widget:widget-type
{
  "key": "value"
}
```
````

两者可混用，同一 `.md` 文件里哪种都行。

---

### 15.2 `callout` — 内联提示框

**用途**：正文中插入的语义化高亮段落，四种颜色变体（blue / green / amber / red）。

#### 指令语法（推荐，支持 Markdown 内容）

```markdown
:::callout{variant="amber" title="常见误区"}
**max_turns 越大不代表越好**——每一轮都消耗 context，
应根据任务最大子步骤数设上限，而不是越大越好。
:::
```

:::callout 可省略 `title`，内容区支持完整 Markdown。:::

#### JSON 语法（纯文本时使用）

````markdown
```widget:callout
{
  "variant": "blue",
  "title":   "防焦虑声明",
  "body":    "你不需要在这节课里写任何代码。"
}
```
````

#### 配置项

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `variant` | `"blue"` \| `"green"` \| `"amber"` \| `"red"` | 否（默认 blue） | 颜色语义：blue=信息，green=正确，amber=警告，red=危险 |
| `title` | `string` | 否 | 显示在内容上方的加粗标签行，含对应图标 |
| `body` | `string` | 指令模式下不填 | JSON 模式下的纯文本内容 |

#### 颜色语义速查

```
blue  → ℹ 信息 / 认知 / 防焦虑
green → ✓ 正确做法 / 已验证
amber → ⚠ 警告 / 注意 / 常见误区
red   → ✕ 危险 / 禁止
```

---

### 15.3 `quiz` — 多选题练习

**用途**：课后或节内检验。支持单选/多选，答错后显示解析，全部答对可触发下一步逻辑。

#### 指令语法（推荐，题目内容可读性最佳）

```markdown
:::quiz{title="课后检验 · Agent Loop"}
**Agent Loop 中，决定任务终止的核心机制是？**
- [ ] 超时计时器
- [x] stop signal + max_turns 双重保障
- [ ] 用户手动中断
> 单靠任一机制都有漏洞：只靠 max_turns 会截断正常任务；只靠 stop signal 可能无限循环。

---

**下列关于 context 增长的说法，哪项正确？**
- [x] context 随轮次线性增长，每轮 LLM 调用都处理完整历史
- [ ] context 只保存最近一轮内容
- [ ] 任务完成后 context 自动清空
> 这是 token 持续消耗的根本原因，也是 max_turns 防护的意义所在。
:::
```

**结构规则**：
- `**问题？**` 段落 → 一道题
- `- [ ]` / `- [x]` 列表 → 选项（`[x]` 为正确答案）
- `> 解析说明` 块引用 → 答题后显示的解析
- `---` → 题目分隔符（可省略）
- 多个 `[x]` → 自动识别为多选题

#### JSON 语法（程序化生成或题目结构复杂时）

````markdown
```widget:quiz
{
  "title": "课后检验",
  "questions": [
    {
      "id":   "q1",
      "text": "Agent Loop 中，什么决定任务终止？",
      "type": "single",
      "options": [
        { "text": "超时计时器",                      "correct": false },
        { "text": "stop signal + max_turns 双重保障", "correct": true  },
        { "text": "用户手动中断",                     "correct": false }
      ],
      "explanation": "两者缺一不可，生产级方案需要双重保障。"
    }
  ]
}
```
````

#### 配置项（JSON 模式）

| 字段 | 类型 | 说明 |
|------|------|------|
| `title` | `string` | 卡片标题 |
| `questions[].id` | `string` | 唯一 ID（建议 q1 / q2…） |
| `questions[].text` | `string` | 题目文字 |
| `questions[].type` | `"single"` \| `"multiple"` | 单选 / 多选 |
| `questions[].options[].text` | `string` | 选项文字 |
| `questions[].options[].correct` | `boolean` | 是否正确答案 |
| `questions[].explanation` | `string` | 答题后解析（可选） |

---

### 15.4 `sandbox` — 参数沙盒

**用途**：拖动滑块实时计算指标，感受参数变化的影响。纯数据驱动，使用 JSON 语法。

#### 语法（仅 JSON，配置精确）

````markdown
```widget:sandbox
{
  "title": "Context 增长沙盒",
  "hint":  "拖动实时计算",
  "params": [
    {
      "id":      "turns",
      "label":   "max_turns",
      "min":     1,
      "max":     30,
      "step":    1,
      "default": 8,
      "hint":    "最大轮次数"
    },
    {
      "id":      "ctx",
      "label":   "ctx_per_turn",
      "min":     500,
      "max":     8000,
      "step":    500,
      "default": 2000,
      "hint":    "每轮消耗 token 数"
    }
  ],
  "checkboxes": [
    { "id": "stop", "label": "启用 stop signal", "default": true }
  ],
  "metrics": [
    {
      "label":      "总 token 上限",
      "expr":       "turns * ctx",
      "fmt":        "k",
      "warnAbove":  40000,
      "dangerAbove": 80000
    },
    {
      "label": "估算费用",
      "expr":  "(turns * ctx / 1000000) * 3",
      "fmt":   "$"
    }
  ],
  "growth": {
    "title":     "逐轮 context 增长",
    "steps":     "turns",
    "labelExpr": "i",
    "valueExpr": "i * ctx",
    "maxExpr":   "turns * ctx"
  }
}
```
````

#### 配置项

**`params[]` — 滑块**

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | `string` | 参数 ID，用于 `expr` 中引用 |
| `label` | `string` | 显示名（建议用代码风格，如 `max_turns`）|
| `min` / `max` / `step` | `number` | 滑块范围与步长 |
| `default` | `number` | 初始值 |
| `hint` | `string` | 参数说明（可选）|
| `fmt` | `string` | 数值格式（见下表）|

**`metrics[]` — 计算指标**

| 字段 | 类型 | 说明 |
|------|------|------|
| `label` | `string` | 指标名 |
| `expr` | `string` | 算术表达式，可引用所有 param `id` 和 checkbox `id`（值为 0/1）|
| `fmt` | `string` | 格式化方式 |
| `warnAbove` | `number` | 超过此值变橙色警告 |
| `dangerAbove` | `number` | 超过此值变红色危险 |

**格式化 `fmt` 速查**

| `fmt` | 效果 | 示例 |
|-------|------|------|
| `"k"` | 千位缩写 | `32.5k` |
| `"M"` | 百万缩写 | `1.23M` |
| `"$"` | 美元 3 位小数 | `$0.096` |
| `"%"` | 百分比 1 位小数 | `12.5%` |
| `"s"` | 秒 | `30s` |
| `"0"`～`"2"` | 固定小数位数 | `8`、`3.1`、`2.56` |
| 不填 | 自动 | 根据量级选 |

**`growth` — 增长曲线柱图（可选）**

| 字段 | 说明 |
|------|------|
| `steps` | 行数（表达式，可引用 params）|
| `labelExpr` | 每行的标签（作用域含变量 `i`，从 1 开始）|
| `valueExpr` | 每行的条形值（作用域含所有 params + `i`）|
| `maxExpr` | 100% 宽度对应的值（决定条形比例）|

**表达式安全说明**：`expr` 仅支持算术运算符 `+ - * / ( )`，变量名为已定义的 param/checkbox `id`。由课程作者控制，不执行用户输入。

---

### 15.5 `ai-chat` — AI 导师对话

**用途**：嵌入课程中的多轮对话窗口，学员可随时提问，AI 结合课程场景回答。

#### 指令语法（推荐，welcome 消息支持 Markdown）

```markdown
:::ai-chat{title="AI 导师" systemPrompt="你是 Agent 系统设计课程导师，专注解答 Loop、Context、工具设计问题。用简洁中文回答，控制在 150 字内。"}
你好！我是这节课的 AI 导师。

关于 **Agent Loop**、`max_turns`、context 增长，或者任何学习中遇到的问题，都可以直接问我。
:::
```

#### JSON 语法

````markdown
```widget:ai-chat
{
  "title":        "AI 导师",
  "hint":         "有疑问直接问",
  "welcome":      "你好！有什么关于 Agent Loop 的问题都可以问我。",
  "systemPrompt": "你是 Agent 课程导师，用简洁中文回答，控制在 150 字内。",
  "placeholder":  "输入你的问题…",
  "maxHeight":    320,
  "maxTokens":    200
}
```
````

#### 配置项

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | `string` | `"AI 导师"` | 卡片标题 |
| `hint` | `string` | `"有疑问直接问"` | 标题右侧提示 |
| `welcome` | `string` | — | JSON 模式下的初始 AI 消息（纯文本）|
| 指令块内容 | Markdown | — | 指令模式下的初始 AI 消息（支持 Markdown）|
| `systemPrompt` | `string` | 通用导师提示 | 系统提示词，建议包含课程主题 + 字数限制 |
| `placeholder` | `string` | `"输入你的问题…"` | 输入框占位符 |
| `maxHeight` | `number` | `280` | 消息区最大高度（px）|
| `maxTokens` | `number` | — | 单次回复最大 token 数 |

**`systemPrompt` 写作规范**：

```
模板：你是[课程名称]导师，专注解答[主题范围]相关问题。
      用简洁中文回答，控制在[N]字内。[可选：结合学员的实际场景回答]

✓ 明确主题范围：防止 AI 跑题
✓ 字数限制：150 字内适合聊天气泡，300 字内适合解释类
✗ 不要加 Markdown 格式要求（气泡已处理换行）
```

**多轮历史管理**：自动保留最近 6 条消息（3 轮），welcome 消息不计入 API 历史。

---

### 15.6 `scenario-eval` — AI 场景适配评估

**用途**：开放题练习——学员描述工作场景，AI 返回结构化评分：适配度 + 四维度分析 + 改造建议。包含 SVG 分数环。

#### 指令语法（推荐，说明文字支持 Markdown）

```markdown
:::scenario-eval{title="AI 场景适配评估" dimensions="重复性,可分解性,可验证性,数据可获取性"}
描述你的一个**实际工作场景**，AI 会从以下维度评估它是否适合用 Agent 自动化解决：

- **重复性**：这个任务每天/每周都要做吗？
- **可分解性**：任务能否拆成明确的子步骤？

完成后会给出具体的改造建议。
:::
```

#### JSON 语法

````markdown
```widget:scenario-eval
{
  "title":        "AI 场景适配评估",
  "description":  "描述你的工作场景，AI 会评估它是否适合 Agent 解决。",
  "placeholder":  "例如：我每天需要从 5 个渠道汇总数据写日报……",
  "buttonLabel":  "✦ AI 评估适配度",
  "systemPrompt": "你是 Agent 课程导师。请评估以下场景是否适合用 Agent 自动化……",
  "dimensions":   ["重复性", "可分解性", "可验证性", "数据可获取性"]
}
```
````

#### 配置项

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | `string` | `"AI 场景适配评估"` | 卡片标题 |
| `description` | `string` | — | JSON 模式下的说明文字 |
| 指令块内容 | Markdown | — | 指令模式下的说明（支持列表、粗体等）|
| `placeholder` | `string` | `"例如：我每天需要……"` | 输入框占位符 |
| `buttonLabel` | `string` | `"✦ AI 评估适配度"` | 按钮文字 |
| `systemPrompt` | `string` | 内置通用提示 | 覆盖默认评估提示词 |
| `dimensions` | `string[]` | `["重复性","可分解性","可验证性","数据可获取性"]` | 评估维度名称，影响 AI 返回的 JSON schema |

**AI 返回 JSON 结构**（内置 prompt 自动生成）：

```json
{
  "verdict":    "非常适合 | 适合 | 部分适合 | 不适合",
  "score":      0-100,
  "reason":     "30字内主要理由",
  "dimensions": [
    { "name": "重复性", "score": 0-100, "comment": "25字内" }
  ],
  "suggestion": "30字内改造建议"
}
```

**分数环颜色规则**：score ≥ 70 → 绿，40–69 → 橙，< 40 → 红。

---

### 15.7 已有 Widget 速查

下列 widget 在 Agent Class 之前已实现，可直接在 md 中使用：

| Widget | 用途 | 语法 |
|--------|------|------|
| `widget:before-after` | 提示词对比（带多 tab 切换）| JSON |
| `widget:checklist` | 可保存进度的勾选清单 | JSON |
| `widget:diagram` | SVG 嵌入图解 | JSON（svg 字段内嵌 SVG 字符串）|
| `widget:prompt-practice` | 学员改写提示词 + AI 反馈 | JSON |

**`widget:checklist` 快速示例**（课前确认清单）：

````markdown
```widget:checklist
{
  "id":    "lesson-01-pre",
  "title": "开始前确认",
  "items": [
    "我已了解本课不需要写代码",
    "我有 30 分钟不被打扰的时间",
    "我已选择了一个主线场景（可选）"
  ]
}
```
````

**`widget:before-after` 快速示例**（好坏对比）：

````markdown
```widget:before-after
{
  "title": "max_turns 设置对比",
  "tabs": [
    {
      "label":    "设置过小",
      "type":     "bad",
      "prompt":   "max_turns=2",
      "analysis": "任务中途被截断，输出不完整。"
    },
    {
      "label":    "合理设置",
      "type":     "good",
      "prompt":   "max_turns=8",
      "analysis": "覆盖正常任务的最大子步骤数，留有余量。"
    }
  ]
}
```
````

---

### 15.8 AI 接入规范（`/api/chat` 路由）

所有 AI Widget 统一调用项目内的 `/api/chat` 路由，**不直接调用 Anthropic API**。

#### 路由签名

```typescript
// POST /api/chat
// Request body:
{
  messages:     { role: "user" | "assistant", content: string }[]
  systemPrompt?: string
  userApiKey?:  string   // 可选，覆盖服务端 key
}

// Response: text/plain stream（纯文本，逐 chunk）
```

#### 三种 AI 模式

| 模式 | 使用方 | 实现方式 | 典型等待 |
|------|--------|----------|---------|
| **多轮对话** | `ai-chat` | 维护 `history[]`，每轮 POST，流式读取 | 1–3 秒/轮 |
| **Streaming 文本** | `prompt-practice` | 单次 POST，`reader.read()` 逐 chunk 追加 | 1–8 秒（流式显示）|
| **generateObject** | `scenario-eval` | 单次 POST，收集全部文本后 `JSON.parse()` | 2–6 秒 |

#### generateObject Prompt 规范

```
结构（四段式）：
1. 角色说明（1 行）：你是一个……
2. 输入数据（结构化）：学员描述的场景 / 参数列表
3. 明确指令：「只输出 JSON，不要有其他内容」
4. Schema：完整 JSON 结构，含字段类型与取值范围

关键约束：
- "只输出 JSON，不要有其他内容" ← 必须包含，否则模型会加前缀说明
- 枚举值用 | 分隔
- 数字评分用 0-100 区间
- 字数限制用「N 字内」而非英文
```

---

### 15.9 课程内容结构建议

基于 Agent Class Lesson 01 验证的段落组合规律，供新课参考：

**开场段（防焦虑 + 锚点）**

```markdown
:::callout{variant="blue" title="防焦虑声明"}
这节课不需要写代码。所有操作在浏览器里完成。
:::

```widget:checklist
{ "id": "lesson-pre", "title": "开始前确认", "items": ["已准备 30 分钟...", "..."] }
```
```

**概念段（知识建构）**

```markdown
:::callout{variant="amber" title="关键认知"}
**概念核心**：……
:::

（正文解释 + before-after 对比）

:::ai-chat{title="AI 导师" systemPrompt="…"}
有关于本节概念的疑问，直接问我。
:::
```

**练习段（评估巩固）**

```markdown
:::quiz{title="检验"}
（3 道题）
:::

:::scenario-eval{title="场景评估"}
（说明文字）
:::
```

**段落节奏规则**：
- 每 400–600 字（正文）配 1 个 widget
- callout 用于打断长文，防止阅读疲劳  
- quiz 放在概念解释完成后，不要放在中途
- ai-chat 放在概念卡片下方，学员刚看完概念立刻可以提问

*文档结束 · 如需补充场景或组件，按上述模板格式追加至对应章节*
