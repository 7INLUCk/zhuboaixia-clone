# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## MiiMii 项目地址

- **后台（vibe-coding）**：https://dashboard.miimii.ai/vibe-coding
- **预览地址**：https://leo.preview.miimii.ai
- **资源域名**：https://assets.miimii.ai/

> 后续 Boss 说"去 MiiMii 平台改页面"，默认进第一个地址。

## 飞书联系人

- Boss 飞书 open_id：`ou_b079dc56eff2ad5d370290064958e40c`
- 备用飞书账号：`ou_05762d0634b87bc72c0f3f0395cf4591`

## agent-browser（已安装）

- 版本：v0.17.1
- 用途：公开页面自动化、截图验证、复杂等待（替代 sleep）
- 安装命令（备用）：`npm install -g agent-browser --cache /tmp/npm-cache-miijia`
- 注意：agent-browser 是独立 Chromium 实例，无登录态，不能操作 dashboard.miimii.ai
- 验证是否可用：`agent-browser --version`

## 两套 browser 分工

| 工具 | 用途 | 限制 |
|---|---|---|
| 原生 browser (openclaw profile) | dashboard.miimii.ai/vibe-coding（已登录） | tab 空闲会被回收；复杂等待不稳 |
| agent-browser | 公开页面截图/验证，wait 事件 | 无登录态，不能访问 dashboard |

---

Add whatever helps you do your job. This is your cheat sheet.


## 飞书聊天记录爬取（feishu-history skill）
- **脚本**：`python3 /Users/yuchuyang/.openclaw/workspace-main/skills/feishu-history/scripts/fetch_chat_history.py`
- **SKILL.md**：`/Users/yuchuyang/.openclaw/workspace-main/skills/feishu-history/SKILL.md`
- **触发时机**：Boss 说"查聊天记录"/"今天说了什么"/"飞书记录"
- **最简用法**（用当前消息 ID 自动发现 chat）：
  ```bash
  python3 /Users/yuchuyang/.openclaw/workspace-main/skills/feishu-history/scripts/fetch_chat_history.py \
      --anchor-msg-id <当前消息的message_id>
  ```
- **指定 chat_id 或日期**：
  ```bash
  --chat-id oc_3ec6934a25408c9fcb1dfa8bc7de2f02  # 小贾↔Leo主DM
  --date 2026-03-17   # 指定日期
  --hours 3           # 最近N小时
  ```
- **⚠️ 关键坑**：不能用 /im/v1/chats 列表里的 chat_id，必须用消息 ID 反查；API 不支持时间过滤参数，脚本内部处理。

