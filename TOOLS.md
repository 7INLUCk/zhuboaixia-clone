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


## 飞书聊天记录（feishu-bot-history skill，优先）
- **Skill**：`/Users/yuchuyang/.agents/skills/feishu-bot-history/SKILL.md`
- **脚本**：`python3 /Users/yuchuyang/.agents/skills/feishu-bot-history/scripts/fetch_chat_history.py`
- **触发时机**：Boss 说“查飞书记录”/“上周说了什么”/“定位某条消息”/“查 bot 聊天历史”
- **优先用法（有当前 message_id）**：
  ```bash
  python3 /Users/yuchuyang/.agents/skills/feishu-bot-history/scripts/fetch_chat_history.py \
      --anchor-msg-id om_xxx \
      --hours 24 \
      --app-id <当前bot app_id> \
      --app-secret <当前bot app_secret>
  ```
- **只有 open_id 时**：先 `--open-id ou_xxx`；无缓存时加 `--bootstrap-p2p`
- **已知 chat_id 时**：直接 `--chat-id oc_xxx`
- **⚠️ 关键坑**：必须用**当前这个 bot 自己**的 app_id/app_secret，否则会报 `open_id cross app` / message 查不到

## 飞书聊天记录爬取（feishu-history skill，旧）
- **脚本**：`python3 /Users/yuchuyang/.openclaw/workspace-main/skills/feishu-history/scripts/fetch_chat_history.py`
- **SKILL.md**：`/Users/yuchuyang/.openclaw/workspace-main/skills/feishu-history/SKILL.md`
- **备注**：后续优先用上面的 feishu-bot-history，旧 skill 仅作兼容参考

