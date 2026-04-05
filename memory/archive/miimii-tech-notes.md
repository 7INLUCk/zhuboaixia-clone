## 2026-03-17 广场详情页文字颜色修复（项目记录）
- 底部信息区文字从 gray-900/500 改为白色系 + drop-shadow
- 原因：深色渐变遮罩上灰色文字不可见


## 2026-03-11 PerformanceCard 三状态样式（项目记录）
- In Progress：橙色圆点badge + 模糊背景 + Loader2 spinner + 底部进度%
- Not Completed：居中文字 + 橙色 Regenerate 按钮
- Completed：只保留 Completed badge，无 Public badge
- (main)/layout.tsx 的 main 元素曾有 overflow-hidden 锁死滚动，已改为 overflow-auto


