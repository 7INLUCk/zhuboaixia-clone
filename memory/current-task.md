# current-task.md

## 当前任务
伴播面板 UX 重做（第二轮完成，待验收）

## 进度
- ✅ **卡死根因修复**：MEMORY.md 45KB→6KB
- ✅ **第一轮 UX 重做**：时间轴预览+Tab改名+首次引导（Git: 9cad07c）
- ✅ **第二轮：商品绑定一对一**
  - 商品列表：6个mock商品（左侧200px）
  - 形象库：7个形象可选（右侧180px）
  - 视频预览区：点击常规态6状态/事件态口令切换预览
  - 绑定逻辑：一对一，已绑定的形象标灰不可重复
  - Git: 5d64aff, Issue #1, 分支 codex/issue-1-product-avatar-binding
- ✅ **已部署**：https://miaobo-b.pages.dev
- ❌ **待 Boss 验收**：新设计看效果，根据反馈调整
- ❌ PR 合并到 main
- ❌ 废弃组件清理（VoiceContent / AutoChatContent / VoiceSwitchContent）
- ❌ SystemSettingsContent 内容实现（版本分级+NDI+设备状态）
- ❌ 底部侧边按钮整合到 Tab

## 关键文件
- `src/CanvasPanel.tsx`（~2300行）
  - 新数据结构: 行 212-310（NORMAL_STATES, EVENT_ACTIONS, AVATAR_LIBRARY, PRODUCTS）
  - ProductAvatarContent: 三栏布局（商品列表+预览+形象库）
  - TimelinePreview: 适配一对一绑定模型
- 部署：`bash deploy-b.sh`
