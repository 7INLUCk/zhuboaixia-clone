# LEARNINGS.md

## 2026-03-29 23:50 - flex 布局中 `height: '100%'` 解析失败根因

### 问题
在 flex 容器中，子组件用 `height: '100%'` 无法正确获取父容器高度，导致底部元素被 `overflow: hidden` 裁掉。

### 根因
父容器是 `flex: 1`（无固定高度），子组件的 `height: '100%'` 找不到明确的高度参考值，百分比计算失败。这在多层 flex 嵌套时尤其常见。

### 正确解法
用 `flex: 1` + `minHeight: 0` 代替 `height: '100%'`：
```tsx
<div style={{
  flex: 1,       // 正确：通过 flex 获取高度
  minHeight: 0,  // 关键：允许 flex 子项正确收缩
  display: 'flex',
  flexDirection: 'column',
}}>
  <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>内容区</div>
  <div style={{ flexShrink: 0 }}>底部固定区</div>
</div>
```

### 防复发
- 在 flex 布局中，永远不要用 `height: '100%'`，用 `flex: 1` + `minHeight: 0`
- `overflow: hidden` 的父容器 + 被裁的底部 → 先检查子项是否用了 `height: '100%'`

---

## 2026-03-30 04:05 - 会话上下文溢出导致 session 重置

### 问题
飞书会话在 03:55 dispatch 完成后被重置，所有对话历史丢失（memory 文件完好）。

### 根因
- 02:00-03:55 约 2 小时内发起了 20+ 次 dispatch，密度极高
- 03:48-03:55 连续 spawn 5 个生图子 agent（全部 SIGTERM），上下文膨胀
- 上下文占用过高触发自动清理，session 历史被清空

### 恢复
- 用 feishu-bot-history skill（`--anchor-msg-id --hours 3`）成功恢复完整对话记录
- 文件存档（memory/*.md）未受影响

### 防复发
1. **上下文告警**：HEARTBEAT.md 已加入上下文检查，≥60% 告警，≥80% 紧急存档
2. **主动 compact**：完成大任务块后主动存档 + 重置，不等被动触发
3. **子 agent 避免密集 spawn**：生图等长时间任务走后台，不密集并行
4. **关键决策即时写入**：不在对话历史里当临时便签，重要信息立即落文件

---

## 2026-04-02 10:25 - 飞书卡片 cross-app 错误（凭证匹配问题）

### 事件
- 回复超过2句，尝试用 send_card.py 发卡片
- 报错：`open_id cross app`（用错 app-id/app-secret）
- SOUL.md 里的凭证 `cli_a908451ff7f9dbb4` 和当前消息的 bot（miijia）不匹配

### 根因
- 每个飞书 bot 有自己的 app-id/app-secret
- 用 A bot 的凭证给 B bot 的用户发消息 → cross-app 错误
- 当前 inbound_meta 显示 account_id="miijia"，需要用 miijia 对应的凭证

### 修复方向
- 查找 miijia bot 的 app-id/app-secret（可能在工作目录配置或 skill 文件里）
- 或用 inbound_meta 里的 chat_id 直接路由（OpenClaw 内部处理）

### 教训
- 飞书卡片发送前，先确认当前消息对应的 bot 凭证
- inbound_meta.account_id 是关键标识
- 优先用 OpenClaw 自动路由（不手动指定凭证）
