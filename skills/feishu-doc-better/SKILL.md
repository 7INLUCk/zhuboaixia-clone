# 飞书 DOC Better

> 双模型协作写飞书文档：Kimi K2.5 负责中文写作，当前 Agent 负责排版和统筹。

## 适用场景
用户需要撰写飞书文档（PRD/技术方案/产品文档/项目报告/会议纪要）时触发。

## 核心理念

### 模型分工
| 阶段 | 模型 | 职责 |
|:---|:---|:---|
| 中文写作 | Kimi K2.5 | 写内容、场景化描述、Q&A、设计决策 |
| 排版 + 统筹 | 当前 Agent | 选 Block、配颜色、插截图、定结构、写入飞书 |

### 三原则
1. **图文并茂**：每个关键章节预留 `[此处插入：XXX截图]` 位置
2. **聚焦业务**：不写技术栈，只写功能、逻辑、交互
3. **通俗全面**：开发一看就懂，覆盖所有边缘情况

## 执行流程

### Step 1：截图采集
如果是产品文档，先截取页面关键状态：
- 主界面全貌（agent-browser screenshot）
- 交互状态（点击前/后、弹窗、hover）
- 边缘情况（空状态、错误状态）

### Step 2：调 Kimi 写内容
用 Python 脚本直接调 Moonshot API，不用 sub-agent：

```python
import json, urllib.request

API_KEY = "sk-QQhimUcQf4rdmZ9vRCyFLDP5jRmlW4OXnDJBOXa6dLhaBGG2"
API_URL = "https://api.moonshot.cn/v1/chat/completions"

data = json.dumps({
    "model": "kimi-k2.5",
    "messages": [{"role": "user", "content": PROMPT}],
    "max_tokens": 16000,
    "temperature": 1  # 必须是1，其他值报错
}).encode()

req = urllib.request.Request(API_URL, data=data, method='POST')
req.add_header("Authorization", f"Bearer {API_KEY}")
req.add_header("Content-Type", "application/json")
resp = urllib.request.urlopen(req, timeout=180)
result = json.loads(resp.read())
content = result["choices"][0]["message"].get("content", "")
```

**关键注意**：
- `temperature` 必须为 `1`，其他值会报 400
- Kimi 的回复可能在 `content` 或 `reasoning_content` 字段
- 如果 `content` 为空，fallback 到 `reasoning_content`
- `max_tokens` 设大一些（16000），长文档需要

### Step 3：给 Kimi 的提示词规范
提示词必须包含：
1. **写作要求**：图文并茂、聚焦业务、通俗易懂、全面覆盖、生动具体
2. **产品背景**：2-3句话说清是什么产品
3. **面板结构**：列出所有模块和交互
4. **输出格式**：Markdown，指定章节结构
5. **截图标记**：要求在每个关键章节用 `[此处插入：XXX截图]` 标记

Kimi 写作的特点：
- 善用场景化描述（"运营点击...主播说..."）
- 会自动补充 Q&A 和设计决策
- 输出维度比直接写更丰富（有滚动行为、防抖、异常状态等）

### Step 4：排版落地（你来做）
读取 Kimi 的 Markdown 输出，用 feishu_doc write 写入飞书。

**排版增强策略**：
1. **引言用 Quote Block**：每个章节开头用 `>` 引言说清本章目标
2. **对比用 Table**：状态对比、点击行为、边缘情况都用表格
3. **布局用 Code Block**：用 ASCII art 画界面布局图
4. **列表用 Bullet + 加粗关键词**：元素名称加粗，描述平铺
5. **流程用 Ordered List**：步骤说明用有序列表
6. **章节用 Divider**：分割线分隔大章节
7. **标题用 Heading 2/3**：可折叠，层级清晰

### Step 5：飞书写入
```python
feishu_doc(action="create", title="文档标题")
feishu_doc(action="write", doc_token="xxx", content=enhanced_markdown)
```

### Step 6：质量自检
- [ ] 有截图/图片位置标记？
- [ ] 用了 Table 对比数据？
- [ ] 有 Quote 引言？
- [ ] 章节用 Divider 分隔？
- [ ] 语言通俗不文绉绉？
- [ ] 没有技术栈内容？

## Kimi 调用脚本
完整脚本路径：`/tmp/kimi_write.py`（workspace 内也保存一份备用）

## 排版上限参考
- `references/best-practices.md`：Block 类型、颜色系统、排版模式完整列表
- Callout 高亮块（14种背景色 + 7种边框色 + 7种字体色）
- Table 支持合并单元格和自定义列宽
- Code Block 支持语法高亮

## 与 Alex V2 Pipeline 的区别

| 维度 | Alex Pipeline | 飞书 DOC Better |
|:---|:---|:---|
| 阶段数 | 3（Writer→Formatter→Orchestrator） | 2（Kimi写→Agent排版） |
| 模型 | Kimi + MiniMax | Kimi + 当前 Agent |
| 调用方式 | sub-agent | 直接 API 脚本 |
| 格式保真 | Markdown→JSON→API 易丢失 | Agent 直接写飞书，保留格式 |
| 复杂度 | 高（Orchestrator 单点故障） | 低（脚本调 Kimi + feishu_doc 写入） |
| 内容质量 | 中（Formatter 做结构转换） | 高（Kimi 直出 + Agent 增强排版） |

## 模板目录
- `templates/product-prd.md` — 产品 PRD 模板
