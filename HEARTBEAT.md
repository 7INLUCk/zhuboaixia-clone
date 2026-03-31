# HEARTBEAT.md

## 🔴 上下文告警（每次 heartbeat 必查）

每次 heartbeat 被触发时，执行 `session_status` 检查上下文占用：
- **≥ 60%**：⚠️ 告警 Boss「上下文已达 XX%，建议存档并开新会话」，同时自动执行存档（更新 current-task.md + 当日 memory）
- **≥ 80%**：🚨 紧急告警，强制存档，强烈建议立即重置会话
- **< 60%**：正常，跳过

### 存档动作（告警时自动执行）
1. 更新 `memory/current-task.md`（当前任务状态）
2. 更新 `memory/YYYY-MM-DD.md`（当日工作日志）
3. 更新 `MEMORY.md`（长期记忆，如有需要）
4. 告知 Boss 当前上下文状态 + 建议操作

### 重置命令（Boss 确认后执行）
```bash
bash /Users/yuchuyang/.openclaw/workspace-main/scripts/reset-agent-session.sh miijia2
```
