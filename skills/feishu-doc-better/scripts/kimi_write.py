#!/usr/bin/env python3
import json, urllib.request, urllib.error, sys

API_KEY = "sk-QQhimUcQf4rdmZ9vRCyFLDP5jRmlW4OXnDJBOXa6dLhaBGG2"
API_URL = "https://api.moonshot.cn/v1/chat/completions"

PROMPT = """你是一个顶级的产品文档写手。请为"伴播面板"写一篇完整的产品设计文档。

## 写作要求
1. 在每个关键章节用 [此处插入：XXX截图] 标记预留图片位置
2. 不写任何技术栈/代码/API/框架，只写功能、业务逻辑、交互方式
3. 写给开发看，语言简洁直白，像在给同事讲需求
4. 包括所有界面元素、状态切换、边缘情况
5. 用场景化描述，不要抽象概括

## 产品背景
伴播面板是直播间运营工具，嵌入桌面客户端。运营人员通过面板配置虚拟伴播形象在直播间的出场、展示、退场。

## 面板结构

整体布局：顶栏(标题+关闭) / 左列(约300px商品列表) / 右列(伴播配置区) / 弹窗层

### 左列：直播商品列表
顶部：标题"直播间商品" + 统计行"N个商品 M个已绑定" + "全部商品"+"去绑定"按钮
商品行：缩略图(48x48圆角) + 商品名称(单行省略) + 商品ID + 操作按钮(去绑定/已绑定)
选中态：浅蓝背景+左侧蓝色竖线
点击行→右列切换 / 点击行"去绑定"→单商品弹窗 / 点击顶部"去绑定"→全量弹窗

### 右列：伴播配置区
1. 形象信息栏：已绑定(缩略图+名称+音色等级+更换按钮) / 未绑定(灰色提示+选择按钮)
2. 视频预览窗口：240px宽,9:16竖版,三种展示态(默认展示态/入场展示态/退场展示态),左上角半透明标签,无形象时虚线圆圈+emoji
3. 输出到直播伴侣：预览下方居中,默认关闭,开启后浅蓝底+✓,hover显示NDI说明弹层
4. 技能点配置：
  入场：蓝色标签+红色❗+说明+预览按钮+口令框(默认"有请模特上场")
  退场：橙色标签+红色❗+说明+预览按钮+口令框(默认"请模特先下场")
  直切：黄色标签+说明+口令框(默认"看看{N}号链接的模特上身效果")
  展示：灰色标签+"自动触发"(只读)
  ❗感叹号：红色圆形底+白色!,hover显示说明弹层

### 形象选择弹窗
标题栏+关闭 / 4列网格(图片3:4+名称+Radio选中态) / 取消+保存按钮
两种模式：单商品/全量 / 点击只选中,保存才生效

### 预览状态切换
默认↔入场(点击预览/取消) / 默认↔退场(点击预览/取消) / 同一时刻只有一个态 / 切换商品重置默认

## 输出格式
标准Markdown，章节：
1. 这个面板是什么
2. 整体布局
3. 左列详解
4. 右列详解
5. 形象选择弹窗
6. 交互状态机
7. 常见问题
8. 设计决策记录

请直接输出完整Markdown文档。"""

data = json.dumps({
    "model": "kimi-k2.5",
    "messages": [{"role": "user", "content": PROMPT}],
    "max_tokens": 16000,
    "temperature": 1
}).encode()

req = urllib.request.Request(API_URL, data=data, method='POST')
req.add_header("Authorization", f"Bearer {API_KEY}")
req.add_header("Content-Type", "application/json")

print("正在调用 Kimi K2.5...", file=sys.stderr)
try:
    resp = urllib.request.urlopen(req, timeout=180)
    result = json.loads(resp.read())
    msg = result["choices"][0]["message"]
    content = msg.get("content", "") or ""
    reasoning = msg.get("reasoning_content", "") or ""
    if not content.strip() and reasoning.strip():
        content = reasoning
    
    out = "/Users/yuchuyang/.openclaw/workspace-miijia2/banbo-panel-prd.md"
    with open(out, "w") as f:
        f.write(content)
    print(f"Done: {len(content)} chars", file=sys.stderr)
except urllib.error.HTTPError as e:
    print(f"HTTP Error {e.code}: {e.read().decode()[:500]}", file=sys.stderr)
    sys.exit(1)
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
    sys.exit(1)
