# 当前任务

## 任务名称
v2 改造落地（伴播面板引导 + 入场退场按钮选中态 + 四步文案）

## 当前状态
- ✅ 已全部完成，Boss 验收通过
- ✅ 引导面板：React 条件渲染替换整个伴播区域（覆盖 Timeline + 配置面板）
- ✅ 入场/退场按钮选中态：播放中实心高亮 + "⏹ 停止播放" + 另一按钮灰掉
- ✅ 四步文案：🎉🎤💥🚀 居中白底展示
- ✅ localStorage `banbo_guide_dismissed` 一次性展示
- ✅ 部署到 https://9c4091db.miaobo-b.pages.dev
- ✅ Git push b 分支

## 本次会话关键结论
- CSS 定位（absolute/fixed）在 flex 布局中无法覆盖 sibling 元素 → 最终用 React 条件渲染替代
- 条件渲染是 React 中"全区域遮罩"的首选方案，比 CSS overlay 可靠

## 待办
- 无（本轮任务完成）
