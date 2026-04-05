# current-task.md

## 当前任务
伴播面板 UX 重做（第一轮完成，待验收调整）

## 进度
- ✅ **卡死根因修复**：MEMORY.md 45KB→6KB，删除 BOOTSTRAP.md，总注入 79KB→33KB
- ✅ **ProductAvatarContent 三级结构 UI**：常规态/事件态视频预览卡片（Git: 40cd2d8）
- ✅ **SystemSettingsContent 占位组件**：编译通过（内容待实现）
- ✅ **左侧预览重做**：静态照片 → 视频时间轴预览（每个形象一行 + 🔵常规/🟠事件时间条）
- ✅ **Tab 改名**：形象配置 / 动作设置 / 高级设置（带描述文字）
- ✅ **右侧面板优化**：去商品信息重复、状态改名、首次引导
- ✅ **底部按钮重构**：重置 + 💾 保存配置
- ✅ **已部署**：https://miaobo-b.pages.dev
- ❌ **待 Boss 验收**：新设计看效果，根据反馈调整
- ❌ 废弃组件清理（VoiceContent / AutoChatContent / VoiceSwitchContent）
- ❌ SystemSettingsContent 内容实现（版本分级+NDI+设备状态）
- ❌ 底部侧边按钮整合到 Tab

## 关键文件
- `src/CanvasPanel.tsx`（~2300行，改造中）
  - ProductAvatarContent: 行 268-549（三级结构UI）
  - TimelinePreview: 行 551-706（时间轴预览组件，新增）
  - CommandContent: 行 713-844
  - SystemSettingsContent: 行 845-860（占位）
  - CanvasPanel 主布局: 行 1999+（伴播模式部分已重写）
- 部署：`bash deploy-b.sh`（在 zhuboaixia-clone 目录）

## Git 提交记录
```
9cad07c feat: 伴播面板UX重做 - 时间轴预览+Tab改名+首次引导+去信息重复
40cd2d8 checkpoint: ProductAvatarContent三级结构+SystemSettingsContent占位
999bda6 feat: 伴播Tab改造-商品伴播管理+进退场指令组件
```
