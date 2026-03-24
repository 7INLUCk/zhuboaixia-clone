# MEMORY.md

## 2026-03-24 给网页 AI 的改码提示词默认用“前后代码片段替换版”（长期，Boss二次纠正）
- 适用场景：Boss 让我给 vibe-coding / Kimi / 网页 AI 生成改码提示词，且我已经知道具体改哪几段代码
- 默认结构：每个文件只贴**发生变化的片段**，并严格分成两块：`原代码` / `改成`；最后补一句 `只替换这些片段，其他代码不要动`
- 禁止事项：不要只写抽象要求，不要只描述目标效果，不要重复贴未变化的大段源码
- 预期效果：Boss 复制即用，网页 AI 可按 old → new 做精确替换，误改概率最低

## 2026-03-24 读取 vibe-coding / 网页 AI 回复时，优先用 browser snapshot 直接读文本（长期，Boss纠正）
- 适用场景：Boss 让我“读一下他回复的内容”“看能否读到源码/逻辑”等需要从网页 AI 对话区读取文字内容的任务
- 默认路径：先用 `browser snapshot` / 结构化页面读取直接抓文本，不要默认走 screenshot
- screenshot 仅作补充取证：只有在 snapshot 读不到、内容被截断或需要视觉证据时再用
- 对外汇报口径：如果主要结论来自 snapshot，就直接说明“我已直接读到文字内容”，不要给人感觉是在靠截图 OCR 猜

## 2026-03-23 飞书聊天记录优先用 feishu-bot-history skill（长期，Boss通知）
- **Skill 路径**：`/Users/yuchuyang/.agents/skills/feishu-bot-history`
- **触发场景**：查飞书记录 / 上周说了什么 / 定位某条消息 / 查 bot 聊天历史 / message_id / chat_id / open_id
- **优先路径**：有当前消息 `message_id` 时，优先用 `fetch_chat_history.py --anchor-msg-id om_xxx --hours N --app-id <当前bot> --app-secret <当前bot>`
- **open_id 场景**：只有 `open_id` 时先查缓存；无缓存则加 `--bootstrap-p2p`
- **已知 chat_id**：直接 `--chat-id oc_xxx`
- **关键坑**：必须用**当前这个 bot 自己**的 `app_id/app_secret`，否则会报 `cross-app` 或查不到消息
- **执行原则**：后续凡是涉及飞书 Bot 历史消息，优先读这个 skill，不靠记忆硬猜

## 2026-03-20 飞书发视频用 feishu-send-video skill（长期，Alex通知）
- message 工具发视频有 Bug，必须用此脚本
- **脚本路径**：`/Users/yuchuyang/.openclaw/workspace-alex/skills/feishu-send-video/scripts/send_video.py`
- **最简用法**：
  ```bash
  python3 /Users/yuchuyang/.openclaw/workspace-alex/skills/feishu-send-video/scripts/send_video.py \
    --video /tmp/your_video.mp4 \
    --chat-id "user:ou_xxx" \
    --app-id "cli_a92d04f7fe781cd5" \
    --app-secret "aDkHKtAmtia6LYQWiFVNQh7f2dLLqRhv"
  ```
- **米迦凭证**：appId=`cli_a92d04f7fe781cd5`，appSecret=`aDkHKtAmtia6LYQWiFVNQh7f2dLLqRhv`
- **两个关键坑（已踩过）**：
  1. `duration` 字段单位是**毫秒**（脚本已自动处理）
  2. 必须同时传封面 `image_key`，否则缩略图永远灰色（脚本已自动提取第1帧）
- **触发场景**：任何往飞书发 MP4 视频的任务

## 2026-03-17 飞书发图用 feishu-send-image skill（长期）
- OpenClaw `message` 工具发图有 Bug（#25200），filePath/media/path 只发文字不发图
- **正确方式**：`python3 /Users/yuchuyang/.openclaw/workspace-miijia2/skills/feishu-send-image/scripts/send_image.py --image 图片路径或URL --chat-id "user:ou_xxx"`
- 以后发图一律用这个脚本，不要再用 message 工具发图

## 2026-03-18 首页一屏布局核心规则（长期，覆盖 03-17 旧方案）
- **正常设备一屏展示，矮屏（iPhone SE）允许滚动**
- **卡片高度驱动方案**（已验证）：
  - 滚动容器用 `items-stretch`（flex 默认值），**不要用 items-start**
  - 卡片只用 `aspect-[9/16] shrink-0`，**不要用 h-full**（在多层 flex 嵌套中 h-full 百分比解析失败，flexbugs #197）
  - stretch 给卡片确定的 cross-size → aspect-ratio 从确定高度反推宽度
- **卡片区域高度**：用 CSS max() 函数 `height: max(280px, calc(100dvh - 530px))`
  - 530px ≈ Header(56) + Hero(260) + 趋势标题+Chips(104) + BottomNav(84) + buffer
  - 大屏自动填满，矮屏保底 280px
- **滚动容器**：用 `h-full`，**不要用 `absolute inset-0`**（absolute 子元素不撑开父容器，无法触发滚动）
- **Section**：用 `shrink-0`，**不要用 `flex-1 min-h-0`**（flex-1 会压缩卡片区域）
- **外层页面 div**：`overflow-y-auto hide-scrollbar`（允许矮屏滚动，隐藏滚动条）

## 2026-03-18 Kimi K2.5 提示词最佳实践（长期，Boss确认）
- **锁死文件范围**：每次只改一个文件，明确禁止动其他文件
- **精确到行级**：给出"找到这段 → 替换为这段"的精确代码
- **禁止项明确**：每条末尾加 ⚠️ 禁止列表
- **改完贴确认行**：要求贴出修改后的关键行
- **一次少量改动**：不塞太多改动，逐轮验收
- **给成品代码**：米迦先改好代码，再让 K2.5 替换，不让它自由发挥（米迦改码能力更强）

## 2026-03-17 全站响应式适配已完成（项目记录）
- 根 layout：max-w-[430px] md:max-w-[768px] lg:max-w-[1200px]
- 列表页网格：grid-cols-2 md:grid-cols-3 lg:grid-cols-4（plaza、works、similar）
- 作品详情视频：max-w-[500px] mx-auto 居中
- BottomNav：内容区跟随响应式 max-w 居中
- 趋势页：保持不变（边栏+单列）
- Settings：未改（低优先级）

## 2026-03-17 广场详情页文字颜色修复（项目记录）
- 底部信息区文字从 gray-900/500 改为白色系 + drop-shadow
- 原因：深色渐变遮罩上灰色文字不可见

## 2026-03-13 源码读取硬性规则（Boss明确要求，永久执行）
- **禁止**：直接用 Read 工具读取本地项目文件（src/、components/ 等 MiiMii 项目代码）
- **原因**：本地代码版本可能落后于云端，基于本地代码的判断不可信
- **正确方式**：需要看源码时 → 生成提示词给 Boss → Boss copy 到 vibe-coding → AI 贴出云端代码 → 再分析
- **附加规则**：我不自己在浏览器里操控 vibe-coding 发消息，只负责生成提示词
- **触发场景**：任何"我来读一下源码"的念头出现时，必须先问自己：是本地读还是请Boss中转？

## 2026-03-16 视频黑边终极修复方案（覆盖 03-12 旧方案）
- **症状**：主视频两侧出现黑色/暗色竖线（模糊背景填充区域边界）
- **根因**：GPU compositing 合成层边界 artifact，不是 blur 暗边问题
- **所有失败方案**：负 inset、clip-path:inset(0)、scale(1.4)、overflow:hidden wrapper → 全部无效
- **正确解法**：在主视频 wrapper div 加 `mask-image` 渐变：
  ```jsx
  maskImage: 'linear-gradient(to right, transparent 0px, black 8px, black calc(100% - 8px), transparent 100%)',
  WebkitMaskImage: 'linear-gradient(to right, transparent 0px, black 8px, black calc(100% - 8px), transparent 100%)',
  ```
- **原理**：左右各 8px 渐变把 compositing artifact 溶解掉，与背景自然融合
- **教训**：视频/图片边缘黑线 → 直接用 mask-image，不要试其他方法

## 2026-03-12 广场详情页文件路径（长期）
- **正确文件**：`src/app/[locale]/(main)/plaza/[id]/page.tsx`（main 路由组，不是 fullscreen）
- **坑**：`(fullscreen)/works/[id]/page.tsx` 是"Your Stage Moment"自己的作品页，不是广场刷视频页
- ShowcaseContent 组件：包含 currentIndex/translateY/swipe 手势逻辑 + 视频渲染

## 2026-03-12 全局响应式策略升级（长期）
- **原策略（路B）**：所有页面 430px 居中列（已实现 R1+R2）
- **升级方向**：列表/浏览页去掉 430px 限制，iPad 上自动变 2 列，桌面 3 列
  - 根 layout：`max-w-[430px] md:max-w-full` 或完全去掉
  - 卡片网格：加 `sm:grid-cols-2 lg:grid-cols-3`
- **广场详情页（全屏视频）**：YouTube Shorts 模糊背景，独立于 layout 改动

## 2026-03-12 多 Agent 共享 Chrome tab 防干扰规则（长期）
- **问题**：Alex Agent 用 `browser open` 开新 tab 时会替换/关闭米迦的 tab
- **解法**：每次 browser 操作都传 `targetId` 参数，钉死到自己的 tab
- **查当前 targetId**：`browser tabs` 或上次 `browser open` 的返回值
- **提醒 Alex**：他的 browser 操作也应传自己的 targetId，避免覆盖其他 Agent 的 tab

## 2026-03-10 新协作链路 SOP（最新口径，覆盖旧版）

### 新协作循环（Boss手动发送版）
1. 米迦读页面 → browser 截图/snapshot 读取 vibe-coding AI 最新回复
2. 米迦汇报分析 → 当前状态 + 建议改法
3. Boss 确认 → 拍板方向
4. 米迦发提示词 → 给出可直接粘贴的提示词文本
5. Boss 手动粘贴发送 → 复制到输入框丢给 AI
6. AI 处理完成后 Boss 通知米迦
7. 米迦读最新回复 → 回到第 1 步

**核心原则：米迦不再自己操控输入框，只负责读页面+生成提示词，Boss 负责发送。**
**原因：browser 自动输入延迟高、不稳定，手动粘贴更快更可靠。**

---

## 2026-03-10 Vibe-Coding AI 助手操作工作流（长期）

### A. 源码查询 → 修改工作流（标准流程）
1. **查源码**：在 vibe-coding 聊天框发送"请找到 [组件名] 的完整源码文件，把完整代码贴出来"
2. **分析**：拿到源码后，我先做分析（问题定位、改动点、预期效果）再给出提示词
3. **下达指令**：提示词格式固定为：文件路径 + 只改哪几处 + 具体改法 + 不动什么 + 改完展示完整文件
4. **等待完成**：轮询截图（不用 sleep），判据："AI 正在思考"消失 + 修改 summary 出现
5. **验收**：启动 dev server 看预览，或用 agent-browser 截图验证

### B. 两套浏览器工具分工（长期）
- **原生 browser（OpenClaw 内置）**：控制已登录的 dashboard.miimii.ai/vibe-coding，发送 AI 助手指令，不适合复杂动态等待
- **agent-browser（已安装 v0.17.1）**：控制公开页面（leo.preview.miimii.ai 等），截图验证，等待动态内容加载，不需要登录的场景
- **原则**：authenticated 操作用原生 browser；公开页面验证、复杂等待用 agent-browser

### C. agent-browser 常用命令速查
```bash
agent-browser open <url>          # 打开页面
agent-browser snapshot -i         # 获取可交互元素列表（必须先 snapshot 再用 ref）
agent-browser click @e1           # 点击
agent-browser fill @e1 "text"     # 填写输入框（先清空再输入）
agent-browser type @e1 "text"     # 输入（不清空）
agent-browser press Enter         # 按键
agent-browser wait --text "完成"  # 等待文本出现（代替 sleep）
agent-browser wait --load networkidle  # 等网络空闲
agent-browser screenshot path.png # 截图
agent-browser state save auth.json # 保存 session
agent-browser state load auth.json # 加载 session
agent-browser close               # 关闭
```

### D. vibe-coding 聊天框新会话提示词模板（零上下文版）
当聊天框为空时，必须用零上下文版提示词，包含：
- 项目名（MiiMii）+ 分支（vibe/leo/workspace）
- 目标文件路径（如 src/components/layout/BottomNav.tsx）
- 问题背景 + 具体操作 + 验收标准
- 禁止假设 Agent 知道"之前讨论的方案"

### E. vibe-coding tab 保活
- 已设置 cron（ID: 40e13169）每 2 分钟截图保活
- 注意：如果主会话空闲，cron 可能无法触发执行；tab 仍可能被关闭
- 重新打开命令：browser(action=open, targetUrl="https://dashboard.miimii.ai/vibe-coding", profile="openclaw")

---

## 2026-03-04 执行汇报时效规则（长期）
- 当 Boss 明确要求“实时监控并在完成后通报”时，必须在任务完成后主动第一时间回报，不能等 Boss 再追问。
- 统一汇报节奏：
  1) 已发送并监控中；
  2) 已完成 + 关键结论 + 下一步建议。
- 若是浏览器/Agent 长任务，必须持续轮询状态并在达成完成判据时立即通知。

## 2026-03-04 监控判据固定化（长期）
- 发送给网页 Agent 后，必须进入固定轮询（8-12秒）。
- 完成判据固定为：`AI 正在思考`消失 + 目标章节出现（如“执行结果报告/功能级合并决策表”）。
- 命中判据后 30 秒内必须主动回报。
- 监控执行SOP：优先读取页面尾部窗口，减少历史大文本导致的状态误判。
- 发送后执行优先级：监控轮询 > 其他回复，未命中完成判据前不得中断轮询。
- 监控启动判据：发送后必须在 T+0 产生首张截图；无截图证据视为“监控未启动”。

## 2026-03-04 指令颗粒度规则（长期）
- 给网页 Agent 下达模块执行指令时，禁止笼统描述，必须给出“功能项清单 + 决策分类（LOCAL_ONLY/MAIN_IN/HYBRID）+ 文件级范围 + 验收点”。

## 2026-03-04 监控参数最终版（长期）
- 轮询固定为每 8 秒截图一次。
- 完成确认采用单轮判定：一轮截图命中“已完成态”即可回报。
- 回报顺序固定：先短报完成，再补详细结论。
- 最新口径（2026-03-04 18:38）：关闭“每8秒发截图”机制；改为按代理最优监控策略执行（结构化轮询为主，关键节点截图为辅）。
- 审计要求：监控轮询必须保留“每轮截图证据链（时间戳+文件路径）”，无法出示即视为未执行。

## 2026-03-04 Stitch设计稿任务执行法（长期）
- 当 Boss 提供 Stitch/设计稿代码时：
  1) 不直接把原始HTML整段转发给网页Agent；
  2) 先做 Phase1 数据映射盘点（字段、路由、缺口）；
  3) 再做 Phase2 页面落地（先前端样式与交互，再最小数据层补齐）。
- 详情页改造优先级：先修“路由进入正确模板”，再做样式对齐与字段上屏。

## 2026-03-04 协作节奏偏好（长期）
- 当 Boss 明确说“先讨论，不要发新指令”时，必须切到评审模式：
  1) 先做现状分析与下一步方案对齐；
  2) 不得提前给GLM下发新任务；
  3) 仅在Boss明确拍板后再执行。

## 2026-03-05 线上报错修复验收规则（长期）
- 任何“修复已完成”的回报，必须附带最小可验证证据，不可只报口头自检通过。
- 页面级崩溃（白屏/Runtime error）修复后，至少验证并回传：
  1) 从真实入口链路进入目标页（如从广场点进详情页）；
  2) 页面可打开且无错误覆盖层；
  3) 控制台无新的致命错误；
  4) 核心交互回归结果（本案为自动播放/循环/点按暂停）。
- React 页面新增/移动 hooks 时，必须确保 hooks 在组件顶层稳定顺序调用，禁止放在条件分支后导致“Rendered more hooks than during the previous render”。

## 2026-03-05 验收职责边界（长期）
- 给网页 Agent 的“验收标准”要区分：
  1) Agent 负责：改动范围、自检项、风险说明；
  2) Boss 负责：真实页面效果的人类验收。
- 禁止要求 Agent 承担“人类侧最终体验验收动作”（尤其是跨设备主观效果判定），避免职责错位。

## 2026-03-09 浏览器控制通道异常应对（长期）
- 若 browser 工具报错 `Can't reach the OpenClaw browser control service ... Do NOT retry`：
  1) 立即停止重复调用 browser，避免无效重试；
  2) 第一时间向 Boss 报告“通道故障 + 当前阻塞点”；
  3) 同步提供可手动粘贴的指令文本，确保任务不中断；
  4) 再询问是否允许执行 `openclaw gateway restart` 以恢复自动化。
- 对外口径：先讲影响，再给替代路径，再给恢复动作。
- 新增（2026-03-09 15:44）：即使调用时传入 `timeoutMs: 40000`，该报错分支仍可能返回固定 `timed out after 20000ms`；当出现此现象，不要继续尝试参数层重试，直接切手动粘贴链路并汇报。
- 新增（2026-03-09 15:55）：browser 可能出现“snapshot 成功但后续 act 失败”的抖动状态；此时不要误判为完全恢复，应把“只读可用 / 交互不可用”分级汇报给 Boss。
- 新增（2026-03-09 17:20）：即使短时验证过 `act` 成功，后续仍可能回退到 20000ms 超时；“恢复成功”只能按阶段性表述，不能承诺持续稳定。

## 2026-03-09 browser.act 正确操控三步流程（长期）
- 向网页 textarea 发送文本的唯一稳定方式：
  1) `browser snapshot(refs="aria")` → 找 textbox 的 ref（如 `e156`）
  2) `browser act(kind="click", ref="e156")` → 聚焦输入框
  3) `browser act(kind="type", ref="e156", text="内容")` → 输入（type 必须带 ref，否则报"ref is required"）
  4) `browser act(kind="press", key="Enter", ref="e156")` → 提交
- 注意：fill 动作需要额外 fields 参数，不如直接用 type。

## 2026-03-09 vibe-coding tab 上下文保护规则（长期）
- MiiMii vibe-coding AI 助手的聊天历史存在当前 tab 的前端 session 中。
- 关闭 tab 或 browser open(新URL) = 上下文完全清零，无法恢复。
- 禁止用 `browser open` 测试浏览器连通性；正确方式是 `browser screenshot`（只读，不破坏 tab）。
- browser stop→start 后必须 open 原URL 拿新 targetId，旧 targetId 全部失效。

## 2026-03-09 无上下文 Agent 提示词写法（长期）
- 每次给 vibe-coding Agent 发提示词前，先截图确认聊天框是否有历史。
- 若聊天框为空（"发送一条消息开始对话"），必须用零上下文版提示词。
- 零上下文版必须包含：项目名+分支+问题背景+目标文件路径+具体操作+验收标准。
- 禁止假设 Agent 知道"之前讨论的方案"等任何历史内容。

## 2026-03-09 广场详情页修复结论（项目记录）
- 修复内容：plaza 详情页作者名/头像/日期/作品标题字段全部对齐，头像破图 fallback 修复。
- 根因：5个后端接口（showcase.getById, getByTemplate, plaza.list, search, getRecommendations）的 Prisma user select 结构不一致，缺少 stageUsername 和 avatarUrl。
- 方案A（已执行）：统一所有接口 user select 为 {id, name, stageUsername, image, avatarUrl}。
- 前端映射：author = stageUsername ?? name ?? "Anonymous"，authorAvatar = avatarUrl ?? image ?? ""。
- 分支：vibe/leo/workspace，待 PR。
- 额外修复：头像 src 为空时浏览器渲染破损图标 → 增加 onError fallback 处理。

## 2026-03-10 Same Dance Style 页面架构（项目记录）
- 入口：广场详情页 "See how others dance [模板名]" 链接
- 路由：`/works/[showcaseId]/similar`（已存在，fullscreen 下）
- 后端：`api.showcase.getByTemplate` 按 templateId 查同款作品
- 关键 bug 记录：`getById` 的 Prisma select 需包含 `templateId: true`，否则 similar 页查不到作品
- 样式参考：Stitch 设计稿（已存档在 Boss 消息里）

## 2026-03-10 广场数据架构澄清（长期）
- **首页热门趋势标签**：来自 Category 表，API = `api.trend.getCategories`
- **广场 CategoryTabs**：已修改为同样用 Category 表（与首页同源）
- **Tag 表**：单独存在但实际为空，不用于标签筛选
- **HOT 标签**：由 `buildFilterChips(hasHot, categories)` 动态生成，hasHot = 是否有 isHot 模板
- **UserShowcase.tags 字段**：目前全为空数组，继承代码已补（创建时从 template.categories 复制）

## 2026-03-10 Next.js Image 缓存绕过方案（长期）
- 问题：`next/image` 会缓存优化后的图片，文件替换后旧缓存仍被 serve
- 临时绕过：改用原生 `<img>` 标签（去掉 `import Image from 'next/image'`）
- 彻底修复：`rm -rf .next/cache/images` 清缓存后再用 next/image
- 适用场景：logo、封面图等静态资源替换后不生效时

## 2026-03-11 全局响应式适配方案（长期）
- **策略**：路B（手机视口居中），参考 TikTok/Instagram Reels 网页版
- 根 layout 加 `max-w-[430px] mx-auto` + 渐变背景填充两侧
- 全局 `100vh` → `100dvh`（dynamic viewport，解决 iOS Safari 地址栏问题）
- safe-area-inset-bottom 加在 BottomNav（原已有）
- Toaster 需在 max-width 容器**外层**，否则被裁断
- fullscreen fixed 页面（广场详情等）不受 max-width 影响，属正常行为

## 2026-03-11 邀请系统完整链路（项目记录）
- 邀请链接格式：`${origin}/${locale}/invite?code=${user.referralCode}&showcase=${showcase.id}`
- `/invite` 中转页：Client Component，存 cookie `miimii_referral_code`（30天），跳转至 `/plaza/${showcaseId}`
- Referral 状态流：注册→PENDING，完成首个作品→CONVERTED，每3个CONVERTED→REWARDED+发券
- 关键文件：`task-poller.ts`（触发convertReferral）、`referral.ts`（checkAndRewardReferrer）
- Server Component + redirect() + cookies() 在 Next.js 15 有兼容问题 → 用 Client Component

## 2026-03-11 前端分享按钮实现模式（长期可复用）
- 分享链接 = `${window.location.origin}/plaza/${showcaseId}`（路由已存在，无需额外开发）
- 复制：`navigator.clipboard.writeText(url)` + `document.execCommand('copy')` fallback
- 提示：`isNavigating` state + `setTimeout` 2.5秒自动消失 toast（`fixed top-16 left-1/2 z-[300]`）
- 消除跳转闪现：点击即刻设 `isNavigating=true` 渲染全屏黑色遮罩，比 loading.tsx 更及时

## 2026-03-11 广场详情页抖音滑动架构（长期）
- 不使用路由跳转，同页面内维护 currentIndex state + transform: translateY 动画
- sessionStorage.plaza_showcase_ids 存 ID 列表，Same Dance Style 页进入时需重写此列表为 [同款+推荐] 合并顺序
- 外层容器 position: fixed; inset: 0; z-50 彻底遮住底部 Tab
- Pointer Events 同时支持触屏和鼠标（不用 TouchEvent）
- URL 用 window.history.replaceState 静默更新
- Next.js 路由跳转期间主布局可见：在目标路由目录新建 loading.tsx 全屏黑色遮罩解决

## 2026-03-11 PerformanceCard 三状态样式（项目记录）
- In Progress：橙色圆点badge + 模糊背景 + Loader2 spinner + 底部进度%
- Not Completed：居中文字 + 橙色 Regenerate 按钮
- Completed：只保留 Completed badge，无 Public badge
- (main)/layout.tsx 的 main 元素曾有 overflow-hidden 锁死滚动，已改为 overflow-auto

## 2026-03-11 我的作品→广场/同款 路由（项目记录）
- "View in community" → `/plaza/${showcase.id}`
- "View original stage" → `/works/${showcase.id}/similar`
- 作品详情页视频自动播放：加 `autoPlay` 不加 `muted`（用户点击进来有手势，浏览器允许有声自动播放）

## 2026-03-11 趋势页 -my-4 布局 bug 根因（长期）
- **症状**：趋势页卡片滚动时穿入搜索框区域，视觉重叠
- **根因**：外层容器用了 `-my-4`，但父级 `<main>` 只有 `px-4`（无 `py-4`），负 margin 把 flex 列错误上移 16px，内容区顶部侵入 sticky 搜索框区域
- **正确修法**：删掉 `-my-4 sm:-my-6`，只保留 `-mx-4 sm:-mx-6`
- **错误路径（已踩坑）**：加背景色（bg-white/bg-[#FAFAF8]/backdrop-blur）或大 pt 值（pt-8/pt-14）均为治标，不解决根因
- **原则**：`-my-N` 只有在父级有对应 `py-N` 时才正确；sticky + flex column 存在负 margin 时会导致视觉位置和布局位置不一致

## 2026-03-11 CSS transform scale 对齐技巧（长期）
- `scale-[0.80] origin-top`：从中心顶部缩放，左右各产生 10% 额外空白，无法通过 padding 精确对齐左边缘
- `scale-[0.80] origin-top-left`：从左上角缩放，左边缘固定在 padding 位置，适合需要左对齐的卡片缩放场景
- padding 差距 < 8px 在手机屏上视觉不可见，需至少 12px+ 差距才能被感知
- **不对称 padding** 影响容器内所有子元素；**translate-x** 只影响单个元素视觉位置，是卡片单独右移的正确方案

## 2026-03-11 消除 React 状态切换闪现（长期）
- **症状**：页面导航后，先显示默认态（一帧），再更新到正确态
- **原因**：`useEffect` 在浏览器绘制后才执行，用户会看到默认态的那一帧
- **正确修法**：改用 `useLayoutEffect`，在 DOM 渲染后、浏览器绘制前同步执行，无闪现
- **错误路径**：lazy initializer 读取 URL 参数（Next.js 客户端导航时 URL 更新时机不确定，会读到旧值）

## 2026-03-09 Internal Server Error 分层诊断法（长期）
- 当出现“本轮改动后页面500”时，禁止直接把因果归到功能改动，必须按层排查：
  1) 代码层：先看 `git status/diff/log`，确认是否真回滚、真一致；
  2) 路由层：对同一路由做连续压测（例如 10~30 次 `/api/trpc/plaza.list`）；
  3) 数据库层：做 Prisma 直连（connect + 简单查询 + 业务查询）；
  4) 运行态：若“DB直连正常但 API 全500”，优先判定 Next.js/TRPC 进程态异常（缓存/残留进程）。
- 本案有效恢复动作：清理 `.next`、终止残留 dev server 进程、重新生成 Prisma client、重启 dev 编译。
- 判责规则：
  - 回滚前后都500，优先看环境；
  - 回滚后消失，才继续二分功能改动。

## 🎨 图片生成标准脚本（2026-03-16 全员统一，Boss强制）

> **所有 Agent 生图必须走此脚本，禁止走 Gemini API（省钱，走公司扣子平台不计费）**

- **脚本路径**：`/Users/yuchuyang/.openclaw/workspace/coze_image.py`
- **基础调用**：
```
python3 /Users/yuchuyang/.openclaw/workspace/coze_image.py \
    --prompt "图片描述" \
    --output /tmp/output.jpg \
    --ratio 9:16
```
- **ratio 选项**：`9:16`（竖图/小红书封面）/ `16:9`（横图）/ `1:1`（方图）
- **捕获 URL 方式**：最后一行输出 `URL:https://...`，用 grep "^URL:" | cut -c5- 提取
- **速度**：约 10 秒，电影级画质，走公司扣子平台，完全不计费
- **统一视觉风格**（Boss确认）：电影级画质，暖色调，写实风格；图片上要带中文文字标注（核心观点）



## 🎨 图片生成标准脚本（2026-03-16 全员统一，Boss强制）

> **所有 Agent 生图必须走此脚本，禁止走 Gemini API（省钱，走公司扣子平台不计费）**

- **脚本路径**：`/Users/yuchuyang/.openclaw/workspace/coze_image.py`
- **基础调用**：
```
python3 /Users/yuchuyang/.openclaw/workspace/coze_image.py \
    --prompt "图片描述" \
    --output /tmp/output.jpg \
    --ratio 9:16
```
- **ratio 选项**：`9:16`（竖图/小红书封面）/ `16:9`（横图）/ `1:1`（方图）
- **捕获 URL 方式**：最后一行输出 `URL:https://...`，用 grep "^URL:" | cut -c5- 提取
- **速度**：约 10 秒，电影级画质，走公司扣子平台，完全不计费
- **统一视觉风格**（Boss确认）：电影级画质，暖色调，写实风格；图片上要带中文文字标注（核心观点）

