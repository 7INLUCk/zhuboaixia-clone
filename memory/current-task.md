# current-task.md

## 伴播面板 Timeline 回归改造（Issue #2）— 进行中

### 当前状态
- ✅ TimelineLeftBar 组件已重写（深色风格，复用 9cad07c 样式）
- ✅ 多对多绑定逻辑已实现
- ✅ 事件态口令已移到动作设置 Tab
- ✅ 已 commit + push + 部署到 miaobo-b.pages.dev
- ⏳ **等待 Boss 选择整体配色方案**（发了 3 个方案的飞书卡片）

### 待 Boss 确认
整体样式方案（深色 Timeline + 白色配置区的违和感处理）：
- **方案 A**：右侧改深灰底（暗调统一）— 我推荐这个
- **方案 B**：右侧改暖灰底（过渡缓冲）
- **方案 C**：渐变过渡带（低成本快速修）

Boss 确认后立即执行选定方案。

### 待办
- [ ] Boss 确认配色方案 → 执行改造
- [ ] PR 创建 + 合并
- [ ] 废弃组件清理（VoiceContent / AutoChatContent / VoiceSwitchContent）
- [ ] SystemSettingsContent 实现（版本分级+NDI+设备状态）
- [ ] 底部侧边按钮整合

### 关键信息
- 分支：`codex/issue-2-timeline-regression`
- Issue：#2
- 最新 commit：`647937e` fix: Timeline恢复深色风格+可视化时间轴条
- 预览：https://miaobo-b.pages.dev
- 文件：`zhuboaixia-clone/src/CanvasPanel.tsx` (~2300行)
