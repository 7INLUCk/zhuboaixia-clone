# 伴播面板 UX 优化 — 落地执行手册

> 最后更新：2026-04-06 12:02 | 状态：待 Boss 确认方案，下轮会话执行

---

## 问题 1：时间轴点击切换视频（P0 - 核心 Bug）

### 现象
左侧预览区下方的时间轴分块（常态轮播 / 口令触发）点击后，上方视频不切换。

### 根因
- `NORMAL_STATES` 中 6 个常态动作只有 1 个有 `videoUrl`（如 av1 只有 ns2 摇摇身子有视频）
- 点击无 videoUrl 的分块 → `previewStateId` 设为该 id → `currentVideoUrl = undefined` → 视频消失
- 用户感知：点击没反应

### 修复方案（3 项）

**A. 视频切换 fallback 逻辑**
文件：`src/CanvasPanel.tsx`，约 600-620 行
```tsx
// 现有逻辑：
if (previewEventId) { currentVideoUrl = eventActions.find(...)?.videoUrl }
else if (previewStateId) { currentVideoUrl = normalStates.find(...)?.videoUrl }

// 改为：找不到对应 videoUrl 时 fallback 到默认视频
if (previewEventId) { currentVideoUrl = eventActions.find(...)?.videoUrl }
else if (previewStateId) {
  const st = normalStates.find(s => s.id === previewStateId)
  currentVideoUrl = st?.videoUrl || normalStates.find(s => s.videoUrl)?.videoUrl
}
```

**B. 选中态视觉反馈**
常态分块（约 674 行）和事件态分块（约 715 行）：
- 被选中分块：background 增亮一个档次 + 顶部 2px 指示条（常态蓝色 `#60A5FA`，事件态黄色 `#F59E0B`）
- 未选中分块：保持现有样式

**C. 点击后暂停自动轮播**
- 用户手动点击分块时，暂停自动轮播 10 秒
- 10 秒无操作后自动恢复
- 实现：新增 `autoPlayPausedUntil` 状态，在 handleTimelineBlockClick / handleEventBlockClick 中设置

---

## 问题 2：文案优化（P1 - Boss 已确认）

### 改动
| 位置 | 改前 | 改后 |
|------|------|------|
| 常态标签（约 661 行） | `直播中（自动轮播）` | `🎭 直播时自动展示 · 点击预览` |
| 循环时间（约 663 行） | `{normalDuration}s 循环` | `{normalDuration}s 一轮` |
| 事件态标签（约 706 行） | `⚡ 口令触发（点击播放）` | `🎤 主播说口令触发 · 点击预览` |

---

## 问题 3：视觉优化（P1 - Boss 已确认）

### (a) 背景色 黑 → 白
文件：`src/CanvasPanel.tsx`，约 596 行
```tsx
// 改前
background: '#1a1a2e'
// 改后
background: '#FFFFFF'
```
同时检查周围容器颜色是否需要配合调整为浅色系。

### (b) 视频缩放 cover → contain
文件：`src/CanvasPanel.tsx`，约 615 行（ChromaKeyVideo 的 style）
```tsx
// 需要在 ChromaKeyVideo 组件中支持 objectFit 传参
// 或直接改组件内部的 video/canvas 样式为 objectFit: 'contain'
```
同时将 maxHeight 从 260 适当缩小（建议 200-220），给下方时间轴留空间。

---

## 问题 4：搭话配置优化（P1）

### (a) 预设问答 → 示例引导
文件：`src/AutoChatPanel.tsx`，约 72 行
```tsx
// 改前
const [fixedChats, setFixedChats] = useState<FixedChat[]>([
  { id: 'f1', trigger: '库存没有了', response: '没有了哦', outfitId: null, actionId: null },
  { id: 'f2', trigger: '全场保价...', response: '主播身上这件黑色羽绒服...', outfitId: 'o1', actionId: 'a3' },
])

// 改后
const [fixedChats, setFixedChats] = useState<FixedChat[]>([])
```

新增固定搭话按钮的 placeholder 改为示例：
- 触发词输入框 placeholder：`例：主播问到价格时`
- 回复输入框 placeholder：`例：对！这款碎花裙 129 元很划算～`

列表为空时显示引导卡片：
```tsx
{fixedChats.length === 0 && (
  <div>还没有固定搭话？添加一条试试 →</div>
)}
```

### (b) 编辑框内联优化（不用弹窗）
保持内联编辑，改为展开卡片式：
- 编辑态向下展开，不覆盖其他内容
- 分区布局：上半部触发词 + 回复（大输入框），下半部造型/动作（可折叠）
- 输入框加大：height 36→44px，fontSize 12→13
- 每个字段有 placeholder 示例
- 底部「保存」「取消」按钮靠右对齐
- 列表态卡片简洁：触发词 → 回复摘要 + 造型标签

---

## 执行顺序

1. **P0** 修复时间轴点击切换视频 + 选中态 + 暂停轮播
2. **P1** 文案改写
3. **P1** 视频背景白 + contain
4. **P1** 搭话清空预设 + 内联编辑优化

每项完成后：截图验收 → 部署 miaobo-b.pages.dev → 通知 Boss

---

## 关键文件

| 文件 | 涉及改动 |
|------|----------|
| `src/CanvasPanel.tsx` | 问题 1/2/3（时间轴交互、文案、视觉） |
| `src/AutoChatPanel.tsx` | 问题 4（搭话配置） |
| `src/AvatarLibraryPanel.tsx` | 可能涉及（如果预览区域共用组件） |
