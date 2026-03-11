# Browser Control SOP - OpenClaw browser tool 操控指南

> 由米迦（miijia2）整理，来自 2026-03-09 实战经验。
> 适用所有 Agent。

---

## 一、已知 Bug：act 间歇性超时（重要）

**现象**：`browser.snapshot` / `browser.open` 成功，但 `browser.act` 报 `Can't reach the OpenClaw browser control service (timed out after 20000ms)`。

**根因**：WebSocket CDP 连接进入 zombie state。snapshot 走另一通道，所以成功；act 走 CDP，所以失败。

**官方状态**：已知 Bug（GitHub Issues #14503 / #11518），截至 2026-03 未修复。

**Workaround（按顺序执行）**：
1. `browser stop`（停止 profile）
2. `browser start`（重新启动）
3. `browser open(原来的URL)` → 得到**新 targetId**（旧的全部失效，不能复用）
4. 用新 targetId 继续操作

**注意**：如果当前 tab 有重要的前端会话上下文（如聊天记录、表单状态），stop/start 会清除它。优先考虑手动粘贴链路，仅在上下文可以重建时才 stop/start。

---

## 二、向 Web 页面输入框发送文本的正确流程

当需要往网页 textarea / 输入框输入内容并提交时，标准三步：

### 第一步：拿 aria ref
```
browser.snapshot(refs="aria", targetId=xxx)
```
在返回的 aria tree 里找到目标 textbox，记下它的 ref（如 `e156`）。

### 第二步：click 聚焦
```
browser.act(kind="click", ref="e156", targetId=xxx)
```

### 第三步：type 输入内容
```
browser.act(kind="type", ref="e156", text="你的内容", targetId=xxx)
```
> ⚠️ `type` 必须带 `ref` 字段，否则报"ref is required"。
> ⚠️ `fill` 也需要额外的 `fields` 参数，不如直接用 `type`。

### 第四步：press Enter 提交
```
browser.act(kind="press", key="Enter", ref="e156", targetId=xxx)
```

---

## 三、禁止操作清单（血泪教训）

| 情况 | 禁止动作 | 原因 |
|------|---------|------|
| 需要测试浏览器是否正常 | `browser open(新URL)` | 会关闭当前 tab，销毁前端会话上下文 |
| act 超时 | 无限重试 | 报错明确说"Do NOT retry" |
| act 超时 | restart gateway | 会中断所有 Agent sessions |
| browser restart 后 | 复用旧 targetId | 旧 targetId 全部失效，必须重新 open 拿新 ID |
| 新 targetId 后立即 act | 跳过 snapshot | 必须先 snapshot 拿新 ref，再 act |

---

## 四、测试浏览器连通性的正确方式

```
browser.screenshot(profile="openclaw")  ✅ 安全，不破坏任何 tab
browser.snapshot(targetId=xxx)           ✅ 安全，只读
```
永远不要用 `browser.open` 来"测试"浏览器。

---

## 五、act 抖动状态分级

| 状态 | 现象 | 应对 |
|------|------|------|
| 完全正常 | snapshot ✅ act ✅ | 正常操作 |
| 抖动态 | snapshot ✅ act ❌ | stop→start→reopen，或手动粘贴 |
| 完全故障 | snapshot ❌ act ❌ | restart gateway（需 Boss 确认） |

---

## 六、MiiMii vibe-coding 专属注意事项

- AI 助手的聊天历史存在当前 **tab 的前端 session** 中
- 关闭 tab 或导航到其他页面 = **上下文完全清零，无法恢复**
- 给 Agent 发提示词前，先截图确认 AI 助手聊天框是否有历史
- 无上下文时，提示词必须包含完整背景（项目名、分支、问题描述、目标文件）
