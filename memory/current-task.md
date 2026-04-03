# 当前任务

## 任务名
伴播能力整合到助播虾配置面板

## 开始时间
2026-04-03 17:10

## 进度
- [x] 理解需求：摒弃方案B独立面板，把伴播能力合并到助播虾原生面板
- [x] 复习代码：所有 Panel 组件 + 路由 + 布局
- [x] 输出改动方案 v1（5 张卡片已发给 Boss）
- [x] Boss 反馈：改成交互式开关 + 独立配置面板（v2）
- [x] 输出改动方案 v2（4 张卡片已发给 Boss）
- [x] Boss 确认：形象/配音→伴播总开关、右侧滑出、截图存参考
- [x] 保存参考截图到 public/screenshots/15-config-smart-dialog.jpg
- [x] 已 spawn 子 agent 执行编码（BuyinControlPanel.tsx 改造）
- [x] 编码完成，编译通过，已部署
- [x] 浏览器验证 4 个 Tab 全部正常
- [x] 已发卡片汇报 Boss

## 状态：返工中 ⚠️

### 返工原因
- 上一轮子 agent 没有复刻 8 Tab 配置面板，只在 9:16 画布上加了个开关
- Boss 纠正：应该先复刻截图里的面板 UI，再加伴播功能
- 新方案：新建 ConfigPanel.tsx 复刻截图 → 加伴播开关 → 接 4 Tab 面板

## 关键上下文
- 助播虾配置面板顶部有「形象」「配音」两个入口按钮 → 用来打开伴播面板
- 保留 4 个伴播模块：形象库、音色、智能对话、声控切屏
- 丢弃：场景装修、管理广场、创建向导、Banbo 相关页面
- 8 个原生 Tab 保持不变
- 需修改：BuyinControlPanel.tsx、App.tsx、ShellLayout.tsx
- 可删除：BanboHomePage/CreatePage/DashboardPage/PanelPage、SetupWizard、SceneEditorPanel、SceneLayoutPanel、BuyinLivePreviewPanel
