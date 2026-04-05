# MEMORY.md

> 完整历史归档：`memory/archive/MEMORY-full-2026-04-05.md`

---

## 🔴 当前活跃项目

### 助播虾复刻原型（zhuboaixia-clone）— 持续更新
- **项目路径**：`/Users/yuchuyang/.openclaw/workspace-miijia2/zhuboaixia-clone/`
- **技术栈**：React 18 + TypeScript + TailwindCSS + Vite
- **GitHub**：https://github.com/7INLUCk/zhuboaixia-clone
- **一键部署**：`cd zhuboaixia-clone && ./deploy-b.sh`（方案B）
- **Cloudflare**：406658769@qq.com，Account ID `427d5435008bb748a730f457175eeb9b`
- **方案 A 地址**：https://miaobo-prototype.pages.dev（锁定 backup/snapshot-2026-04-02 分支）
- **方案 B 地址**：https://miaobo-b.pages.dev（锁定 b 分支）
- **PRD**：https://vqz9o07xyt.feishu.cn/docx/LYJgdNgxFoFVITxDaqOc1gw9nNb

### 伴播面板 UX 改造（UX v3 已部署，持续优化中）
- **当前状态**：UX v3 已部署到 miaobo-b.pages.dev，待 Boss 验收
- **核心设计**：三步引导向导（选模特→确认口令→选动作）
- **关键决策**：每步必须有用户操作，不能系统自动完成
- **分支**：b 分支直接提交，最新 commit 0ab2430
- **Issue #7** 已完成，PR #8 已合并
- 详情见 memory/current-task.md

### 直播间合成系统（stream-compositor）
- **路径**：`/Users/yuchuyang/.openclaw/workspace-miijia2/stream-compositor/`
- P0 已完成（前端上传/画布/拖拽 + 后端API），待P1视频逐帧处理

---

## 🔴 关键凭证

### 飞书 Bot（miijia）
- App ID：`cli_a92d04f7fe781cd5`
- App Secret：`aDkHKtAmtia6LYQWiFVNQh7f2dLLqRhv`

### Cloudflare
- API Token：`cfut_kGpVAxSgkSLZ9AZOcV5IayKEnZ66HxNnf06GbQAQ70b1407b`

### AutoDL SSH
- 命令：`sshpass IB8YdRELgKzN ssh -p 18411 root@connect.nmb1.seetacloud.com`
- 代理：mihomo (127.0.0.1:7890)

---

## 🔴 产品方向（2026-03-30 Boss确认）

- 当前阶段：2-3家种子客户能正常播起来，素材手工制作
- 场景：真人儿童（仅限儿童）/ 3D卡通形象（待展开）
- 三层架构：形象主体 → 造型 → 动作
- 动作 = 录播（预制姿态+声音+嘴型+BGM），默认姿态例外（唇形驱动实时合成）
- 音色锁定：动作素材配置后自动锁定音色库，不允许用户改

---

## 🔴 硬性规则（长期）

### 搜索
- 每次任务第一步：Tavily 搜索 + 至少一个补充源，禁止只搜一个源

### 飞书发图/视频
- **发图**：用 feishu-send-image skill（`send_image.py`），message 工具发图有 bug
- **发视频**：用 feishu-send-video skill（`send_video.py`），duration 单位是毫秒

### 飞书聊天记录
- 用 feishu-bot-history skill，必须用**当前 bot 自己**的 app_id/app_secret

### 回复前自检
- 超过2句 → 强制走飞书卡片（send_card.py）
- 有结构内容（列表/多段/数据）→ 不管几句都走卡片
- 搜索任务 → Tavily + 补充源

### 读大文件
- CanvasPanel.tsx (~2000行)：用 `offset/limit` 分段读，不要一次全读
- MEMORY.md：如需特定条目用 memory_search + memory_get，不要全量读

### MiiMii 平台源码（2026-03-13 Boss要求，永久执行）
- **禁止**：直接用 Read 工具读取本地项目文件（可能版本落后于云端）
- **正确**：生成提示词给 Boss → Boss 粘贴到 vibe-coding → AI 贴出云端代码 → 再分析

### 浏览器操控 vibe-coding
- 原生 browser：dashboard.miimii.ai/vibe-coding（已登录）
- agent-browser：公开页面截图/验证，无登录态
- 每次操作传 targetId，防止多 Agent 互相干扰 tab
- **禁止**用 `browser open` 测试连通性（会清空 tab 上下文），用 `browser screenshot`

### 动态等待
- agent-browser `wait --text/load` 代替 sleep
- 完成判据：目标文本出现 / networkidle

---

## 🔴 踩坑记录（长期）

### 2026-04-05 MiiMii 卡死根因（已修复）
- **根因**：MEMORY.md 45KB + AGENTS.md 20KB → workspace 注入上下文 ~80KB（Alex 只有 ~43KB）
- 读大文件（CanvasPanel 2000行）时 mimo API 请求 payload 过大，连接断开
- **已修复**：MEMORY.md 45KB→6KB，删除 BOOTSTRAP.md，总注入 79KB→33KB
- **预防**：MEMORY.md 保持 <20KB，读大文件用 offset/limit 分段
- mimo 的 maxTokens 只有 5000（其他模型是 8192），也是限制因素之一

### 2026-04-05 Vite 构建 hash 不变
- 源码改动但 build 产出 hash 不变 → Cloudflare 不上传新文件
- **根因**：Vite 内容哈希确定性，相同大小的输出产生相同 hash
- **解法**：修改 CSS（如 `letter-spacing: 0.01px`）或改 UI 文本（如加 "V2"）→ 改变输出大小 → hash 变化 → Cloudflare 上传

### 2026-03-31
- PIL 字体路径：用 `/System/Library/Fonts/STHeiti Light.ttc`，不要用 PingFang.ttc（不存在）

### 2026-03-18
- flex bugs：`h-full` 在多层嵌套中解析失败 → 用 `aspect-[9/16] shrink-0`
- `-my-N` 只有在父级有对应 `py-N` 时才正确
- `useLayoutEffect` 代替 `useEffect` 消除状态切换闪现

### 2026-03-16
- 视频边缘黑线（GPU compositing artifact）→ `mask-image` 渐变修复，不要试其他方法

### 2026-03-11
- Next.js Image 缓存问题 → `rm -rf .next/cache/images` 或临时用 `<img>` 标签

---

## 🔴 直播间合成/抠像技术（长期）

### Coze Media Generation
- 位置：`~/.agents/skills/coze-media-generation`
- Token：`pat_S9JEK3AHHUfllNAupHRVNuxw4ZBkqUziZOeGpaUR5meX50Q5iSKZPzHc7b4xBVXk`
- 文生图 workflow: 7613291266000240674 / 图生图: 7542895543548657704
- 文生视频: 7530928627820068910 / 图生视频: 7589158640256614436

### 绿幕打光要点
- 人物距绿幕 ≥1.5米，轮廓光（背后高处，俯角60-70度）分离人物与背景
- 色温 5500K-5600K，绿幕专用灯分区照明

### GPU 部署（AutoDL）
- RTX 4090 24GB，PortraitRelighting（32fps）是唯一可行的实时重照明方案
- IC-Light/Lumen 不适合直播（diffusion模型，每帧几秒）

---

## 🔴 协作 SOP

### 与 Boss 协作（vibe-coding 场景）
- 米迦读页面 + 生成提示词 → Boss 手动粘贴到 vibe-coding → AI 处理后 Boss 通知 → 米迦读结果
- **米迦不自己操控输入框**，只负责读页面 + 生成提示词

### 给网页 AI 的改码提示词
- 默认用"前后代码片段替换版"：每个文件只贴变化片段，分 `原代码` / `改成` 两块
- 最后补一句"只替换这些片段，其他代码不要动"

### 汇报格式
```
✅ 本轮完成：
🧪 验收方式：
⚠️ 风险/待确认：
➡️ 建议下一步：
```
