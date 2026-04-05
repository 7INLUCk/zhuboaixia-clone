# 当前任务：伴播面板 v5 三步走引导改造

## 状态：方案确认，待实施

### 方案核心（Boss 确认可）
**3 步走引导 + 白话解释 + 左右联动**

右面板改为「配置向导」，每个商品选完后展开三步：

#### Step 1：选个伴播模特（替代「形象绑定」）
- 白话解释：给商品配一个虚拟模特，主播说"看N号上身效果"模特就出场
- 交互：形象库网格，点击即绑定，绑定后自动展开 Step 2
- 完成条件：已绑定一个形象

#### Step 2：设定出场和退场（替代「全局口令」）
- 白话解释：主播说什么模特就出来/退场，口令可以改
- 交互：两个口令卡片（出场+退场），可编辑
- 完成条件：两个口令都已配置（默认值也算）

#### Step 3：加特殊动作（可选，替代「事件态口令」）
- 白话解释：给模特加特殊动作，主播说对应口令就触发
- 交互：每个动作一张卡片，口令可编辑，可添加新口令
- 完成条件：可选

### 左侧 Timeline 增强
- 每个商品卡片显示完成度标签：🔴未绑形象 / 🟡已绑未配口令 / 🟢全部就绪
- 点击商品 → 右面板刷新到该商品的三步配置

### 左右联动规则
1. 选商品（左 Timeline）→ 右面板显示三步向导
2. 绑形象（右 Step 1）→ 左预览显示该形象视频
3. 点常规态卡片 → 左预览切换到对应态
4. 改口令 → 左预览显示示例动画

### 术语白话化
- 形象绑定 → 选伴播模特
- 常规状态 → 默认展示
- 事件态口令 → 特殊动作口令
- 全局口令 → 怎么出场/怎么退场
- 解绑 → 换一个模特
- 自定义口令 → 改个说法

### 关键信息
- Issue #5: https://github.com/7INLUCk/zhuboaixia-clone/issues/5
- PR #6: https://github.com/7INLUCk/zhuboaixia-clone/pull/6
- 分支: codex/issue-5-unified-panel
- v4 当状部署: https://miaobo-b.pages.dev
- v5 方案已用飞书卡片发给 Boss（10 张卡片），Boss 确认"我觉得还可以"

### 技术上下文
- 文件：`/Users/yuchuyang/.openclaw/workspace-miijia2/zhuboaixia-clone/src/CanvasPanel.tsx`（~2300 行）
- 已有 UnifiedBanboPanel 组件（v4 版），v5 需要大幅重构为向导式
- BanboTab 类型改为 'unified'
- SystemSettingsContent 代码保留但渲染已移除
- 滚动问题已用 position: absolute; inset: 0 解决

### 下个会话要做的
1. 重构 UnifiedBanboPanel 为三步走向导
2. 每个区块添加白话解释文案
3. 步骤间自动展开/折叠逻辑
4. 左 Timeline 加完成度标签（🔴🟡🟢）
5. 术语全部白话化
6. 提交 PR 到 b 分支
