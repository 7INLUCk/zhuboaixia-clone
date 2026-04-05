# current-task.md

## 伴播面板 Timeline 回归改造（Issue #2）— 进行中

### 已完成
- ✅ TimelineLeftBar 深色风格（复用 9cad07c 样式）
- ✅ 可视化时间轴条（🔵蓝色交替段 + 🟠橙色触发段）
- ✅ 每个已绑定形象独立卡片（头像+名称+视频预览+LIVE标签）
- ✅ 多对多绑定逻辑
- ✅ 事件态口令移到动作设置 Tab
- ✅ 方案 C 渐变过渡带已落地
- ✅ 伴播触发机制设计确认（v2：口令即切品，无独立切品机制）
- ✅ 动作设置面板改造方案（3口令→2口令：展示/退场）
- ✅ 所有改动已 commit + push + 部署

### 下个会话待办
- [ ] Boss 确认面板改造方案后执行（2口令版：展示+退场）
- [ ] PR 创建 + 合并（codex/issue-2-timeline-regression → b）
- [ ] 废弃组件清理（VoiceContent / AutoChatContent / VoiceSwitchContent）
- [ ] SystemSettingsContent 实现（版本分级+NDI+设备状态）
- [ ] 底部侧边按钮整合
- [ ] 动作设置面板改造：3口令→2口令（展示+退场）

### 关键信息
- 分支：`codex/issue-2-timeline-regression`
- Issue：#2
- 最新 commit：`44e22eb` style: Timeline右侧渐变过渡带
- 预览：https://miaobo-b.pages.dev
- 文件：`zhuboaixia-clone/src/CanvasPanel.tsx` (~2300行)
