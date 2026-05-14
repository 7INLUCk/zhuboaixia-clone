# 助播虾 / 伴播虾 项目说明

## 项目概况

AI 虚拟形象直播助播服务，服务抖店达人商家，提供数字人形象制作 + 直播间伴播软件。

- **线上地址**：http://101.42.25.233/zhuboaixia/（ECS，2026-05-12起；Vercel token 已过期）
- **Feishu PRD**：https://vqz9o07xyt.feishu.cn/docx/ScyQdONt3oVxktx1ioXctNznnHg

## 技术栈

React + TypeScript + Vite + Tailwind CSS + Canvas chroma key（绿幕抠图）

## 已完成功能

- 合规贴片（AiLabelSticker）：竖向毛玻璃 pill，固定在人物右侧中部
- Canvas 绿幕实时抠图 + 绑定形象叠加
- 多形象切换（直播形象 / 商品形象）
- NDI 输出到直播伴侣（模拟按钮）
- 搭话暂停开关（技能卡标题栏 mic/mic-off 图标，进出场/表演默认暂停搭话）
- 穿搭参考图上传校验（JPG/PNG/WebP ≤7MB，单边≤3072px，像素≥196，同时满足火山引擎+NanoBanana Pro）
- 绿色服饰检测软拦截（BanboCustomizePage + Step3AvatarGen，2026-05-11）：上传分析后 `chromaBg !== 'green' && !chromaOverridden` 时软拦截，按钮禁用但警告条末尾追加"误识别？强制使用"灰色链接；点击后二次确认，确认后设 `chromaOverridden: true` 解锁按钮，confirmed 阶段保留 ⚠ 琥珀色标记；`getConfigFinalChroma` 跳过已覆盖槽位；过渡版 mock 固定返回 `'blue'`，生产版接 `clothing_analysis_v1` 的 `chroma_bg` 字段
- 商品形象绑定（CanvasPanel，2026-05-08）：过渡版单选限制（每商品仅1个伴播）；右侧快速绑定卡片（`configuredProductLabels` 关联候选，当前绑定标"当前"，其余可一键切换）；商品列表头部「一键绑定」弹窗（单选 radio，无绑定时默认选 AVATAR_LIBRARY 最新 index 候选）
- 口令场景化优化（CanvasPanel SKILL_POINTS，2026-05-11）：默认口令从晚会语气改为直播讲品话术；进入直播间 `看下上身效果`（2026-05-13精简，原`给大家看下上身效果`）、退出直播间 `模特先下场`、换装 `来看[N]号链接的上身效果`
- 技能名称优化（CanvasPanel SKILL_POINTS，2026-05-13）：sp4 `自动换装` → `立即换装`；sp10 `暖场` → `穿版展示`，描述改为"伴播多种动作展示服饰的穿版上身效果"
- 穿搭参考图 tip 文案（BanboCustomizePage，2026-05-13）：改为"优先上传服装上身图，并确保服饰关键细节、logo、图案等未被遮挡。最佳实践"（链接 href="#" 待沈豪填充）
- 动作视频生成卡片（BanboCustomizePage Step3，2026-05-09）：定装照确认后自动触发 `handleGenerateActions()`，生成进场×1 + 出场×1 + 暖场×8 共10张卡片，默认选中6个暖场；进场/出场固定不可替换，暖场每张可单独「换动作」重新生成；动作库按5年龄段×2性别=10组合各有独立模板

## 规模化方案

完整方案见 Claude Code memory（project_zhuboaixia_scale.md）和飞书文档。

**方向（2026-04-17已定）：产品自助化**，所有功能在产品内实现，不依赖飞书/MIS外部工具。

四大模块：形象创建（Nanobanana Pro）→ 内容生成（Wan 2.2 动作 + EchoMimicV3 唇动）→ 伴播配置（向导化）→ 直播间接入

## 飞书 API 关键信息

- 用 `tenant_access_token` 操作（应用身份，无需用户授权）
- 文档创建：先从模板 Copy，再用 Block API 写内容（两步，Copy 是异步的）
- 权限设置：`external_access: false` + 内部 `edit` + 外部邮箱 `comment`
- 事件订阅：推荐 WebSocket 长连接（内网友好）
- Bitable 表单链接无 API 获取，预制固定模板，手动记录链接存 MIS 配置

所需 Scope：`docx:document` / `drive:drive` / `docs:document.event:read` / `im:message:send_as_bot` / `bitable:app`

## 飞书 Docx API 已验证踩坑（2026-04-17）

feishu-prd skill 的文档有多处与实际 API 行为不符，以下是实测结论：

| 操作 | skill 文档说 | 实际正确写法 |
|------|------------|------------|
| 向 Callout 写子 Block | `/descendant` | `/children` |
| 向 Grid 列写内容 | `/descendant` | `/children` |
| 向 Table 单元格写内容 | `/descendant` | `/children` |
| 获取 Table 单元格 ID | `GET /descendant` | `GET /children` |
| Table 创建参数 | `{"rows": N, "columns": M, "merge_info": []}` | `{"property": {"row_size": N, "column_size": M}}` |
| 权限 PATCH `type` 字段 | 放在 body | 必须作为 query param：`?type=docx` |

**批量删除 Block：**
```
DELETE /docx/v1/documents/{doc_id}/blocks/{parent_id}/children/batch_delete
Body: {"start_index": N, "end_index": M}  # end 是 exclusive
```

**防重写提示：** 脚本中途失败后重跑会产生重复 Block。建议每个脚本运行前先检查文档末尾是否已有目标内容，或用 batch_delete 清理再重跑。

## 部署

```bash
cd /Users/yuchuyang/.openclaw/workspace-miijia2/zhuboaixia-clone
npm run build
rsync -avz --delete -e "ssh -p 65323" dist/ root@101.42.25.233:/var/www/miaofaai/zhuboaixia/
ssh -p 65323 root@101.42.25.233 "chmod -R 755 /var/www/miaofaai/zhuboaixia/"
```

ECS: `101.42.25.233`，SSH port `65323`，root 账户。rsync 后必须 chmod，否则 nginx 返回 403。
Vercel token 已过期（2026-05-12），不再用 Vercel。
