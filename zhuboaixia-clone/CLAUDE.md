# 助播虾 / 伴播虾 项目说明

## 项目概况

AI 虚拟形象直播助播服务，服务抖店达人商家，提供数字人形象制作 + 直播间伴播软件。

- **线上地址**：https://zhuboaixia-clone.vercel.app
- **Feishu PRD**：https://vqz9o07xyt.feishu.cn/docx/ScyQdONt3oVxktx1ioXctNznnHg

## 技术栈

React + TypeScript + Vite + Tailwind CSS + Canvas chroma key（绿幕抠图）

## 已完成功能

- 合规贴片（AiLabelSticker）：竖向毛玻璃 pill，固定在人物右侧中部
- Canvas 绿幕实时抠图 + 绑定形象叠加
- 多形象切换（直播形象 / 商品形象）
- NDI 输出到直播伴侣（模拟按钮）

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
npm run build
vercel deploy --prod --token $VERCEL_TOKEN --yes
```

Token 在 Claude Code memory（project_zhuboaixia.md）里，不进代码/git。
