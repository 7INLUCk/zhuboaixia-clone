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

---

## 2026-04-02 10:45 - 第N次纠正：所有回复必须走卡片（Boss 强制）

### 事件
- Boss 发截图纠正："全部输出内容都要按照卡片样式输出，多内容就多卡片"
- 我之前先发纯文本分析，再补发卡片 → 违规
- Boss 明确：内容多就用多张卡片，不要先文本后卡片

### 根因
- 我对规则理解偏差：以为"超过2句才走卡片"
- Boss 实际要求：所有回复都走卡片，这是强制铁律
- 多内容拆成多张卡片（封面→grid→详情→待办→总结）

### 补救
- 立即重发：4张卡片（封面+方案对比+方案A详情+下一步）
- 模板：参考 report.json 多卡片拆分模式

### 防复发铁律
- **所有回复必须走卡片**，不管几句
- **内容多用多张卡片**，拆分标准：封面/对比/详情/待办/总结
- **回复前自检**：任何要发给 Boss 的内容 → 直接构造卡片 JSON
- **禁止先文本后卡片**，禁止"先说再补"

---

## 2026-04-02 14:06 - 飞书发图方法变更（message 工具可用）

### 事件
- 用 feishu-send-image 脚本发图，发到了群聊（oc_xxx）而不是当前会话（open_id）
- 尝试用 open_id 作为 chat-id 参数时报错 "invalid receive_id"
- 改用 message 工具的 filePath 参数 → 成功发送到正确会话

### 结论
- **message 工具的 filePath 参数现在可以正常工作**（之前有 bug #25200）
- feishu-send-image 脚本对 open_id 格式的 chat-id 支持有问题

### 正确方法
```bash
# 方法1（推荐）：message 工具 filePath 参数
message(action=send, channel=feishu, filePath="/path/to/image.jpg", message="描述")

# 方法2：feishu-send-image 脚本（仅适用于群聊 oc_xxx 格式）
python3 send_image.py --image /path/to/image.jpg --chat-id "oc_xxx" --agent miijia
```

### 教训
- 发图到私聊会话 → 优先用 message 工具 filePath 参数
- 发图到群聊 → 可以用 feishu-send-image 脚本

---

## 2026-04-02 14:08 - 飞书私聊发图正确方法（最终方案）

### 问题
- message 工具 filePath 参数发图后 Boss 没收到
- feishu-send-image 脚本报错 "invalid receive_id"

### 根因
- 私聊发图需要用 `receive_id_type=open_id` 参数
- 飞书 API 调用时必须明确指定 receive_id_type

### 正确方法（已验证）
```bash
# 1. 获取 token
TOKEN=$(curl -s -X POST "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal" \
  -H "Content-Type: application/json" \
  -d '{"app_id":"xxx","app_secret":"xxx"}' | jq -r '.tenant_access_token')

# 2. 上传图片获取 image_key
IMAGE_KEY=$(curl -s -X POST "https://open.feishu.cn/open-apis/im/v1/images" \
  -H "Authorization: Bearer $TOKEN" \
  -F "image_type=message" \
  -F "image=@/path/to/image.jpg" | jq -r '.data.image_key')

# 3. 发送图片消息（关键：receive_id_type=open_id）
curl -X POST "https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=open_id" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "receive_id": "ou_xxx",
    "msg_type": "image",
    "content": "{\"image_key\":\"img_v3_xxx\"}"
  }'
```

### 教训
- 飞书 API 发消息必须指定 receive_id_type
- 私聊用 open_id，群聊用 chat_id
- message 工具可能没有正确传递 receive_id_type

---

## 2026-04-02 14:12 - feishu-send-image 脚本优化完成

### 问题
- 原脚本不支持纯 open_id 格式（必须带 "user:" 前缀）
- 私聊发图需要手动指定 receive_id_type

### 优化内容
1. **新增 `parse_chat_id()` 函数**：自动识别 ID 格式
   - `ou_xxx` → open_id
   - `oc_xxx` → chat_id
   - `user:ou_xxx` → open_id
   - `open_id:ou_xxx` → open_id

2. **新增 --receive-id-type 参数**：显式指定 ID 类型

3. **删除 `resolve_chat_id()` 函数**：移除复杂的 P2P chat 创建逻辑

4. **增强错误提示和文档**

### 测试验证
```bash
python3 send_image.py --image photo.jpg --chat-id "ou_xxx" --agent miijia
# 输出：💬 Target: ou_xxx (type: open_id)
# 发送成功
```

### 文件位置
`/Users/yuchuyang/.openclaw/workspace-miijia2/skills/feishu-send-image/scripts/send_image.py`

---

## 2026-04-03 14:58 - 会话问候必须走卡片（第N次纠正）

### 事件
- 新会话启动，问候用了3句纯文本（"嘿 Leo，新会话刚热好…今天想搞什么？"）
- Boss 纠正：超过2句话就必须走卡片，问候也不例外

### 教训
- **问候也是回复**，超过2句就要走卡片
- 新会话启动的"简短寒暄"如果超过2句，必须构造卡片
- 只有"好的"、"OK"、"已处理"这种1-2句确认才不需要卡片

### 防复发
- 每次回复前数句子：1-2句 → 纯文本；≥3句 → 卡片
- 问候、汇报、分析、总结——全部适用同一规则

---

## 2026-04-03 14:58 - 搜索规则矛盾待确认

### 矛盾点
- Boss 要求：每次搜索用 **Tavily + Brave Search** 双重验证
- SOUL.md 现行规则：**绝对禁止使用内置 web_search（Brave）**，因为限速 1次/秒会 429
- AGENTS.md 现行规则：Tavily + Baidu/DuckDuckGo 补充源

### 待确认
- Boss 是否要更新规则，允许使用 Brave Search（内置 web_search）作为第二验证源？
- 还是 Boss 指的是用其他方式调用 Brave（非内置 web_search）？

### 行动
- 等 Boss 确认后，更新 SOUL.md + AGENTS.md 相应规则

---

## 2026-04-03 16:38 - 分析回复未走卡片（再次违规）

### 事件
- Boss 问 Superpowers 插件是否值得装
- 我发了 8+ 句纯文本分析（定义、功能、4条不建议理由、适合场景）
- Boss 纠正：写进准则了为什么还忘？

### 根因
- 回复前没有执行 5 秒自检（数句子）
- 习惯性直接打字分析，没有先判断内容量再选择输出方式

### 补救
- 已补发卡片（1张，灰色 header + 5 条理由 + 结论）
- 已写入 LEARNINGS

### 防复发
- **回复前必须数句子**，这是铁律，不是建议
- 任何分析/对比/建议类回复 → 默认走卡片
- 只有"好的"/"OK"/"不做"这种才允许纯文本

---

## 2026-04-03 17:37 - 子 agent 指令不够精确导致未复刻 UI

### 事件
- Boss 给了配置面板截图，要求先复刻面板 UI，再加伴播开关
- 我给子 agent 的指令说「在 BuyinControlPanel 里加开关」
- 子 agent 保留了 9:16 画布，只是在中间加了个 toggle，没有复刻 8 Tab 配置面板
- Boss 纠正：方案里说会复刻，为什么实际没做？

### 根因
- 子 agent 指令只描述了「做什么」（加开关），没描述「做成什么样」（复刻截图）
- 没有附截图路径作为参考
- 没有明确「先复刻 UI 再加功能」的执行顺序

### 教训
- 给子 agent 的指令必须包含：①精确的 UI 描述 ②截图参考路径 ③明确的执行顺序
- 复杂 UI 改造应该分步验证：先确认 UI 复刻正确，再加业务逻辑
- 不要假设子 agent 会「自动」参考截图，必须显式指定
