# 当前任务状态

## 任务：绿幕抠图全面修复 — 已部署，待 Boss 验收

### 已完成
1. ✅ 3 张静态图预抠图（av1/av2/av6 PNG，Qwen Vision 验证通过）
   - av1 篮球小子-蓝：HSV 形态学 → ✅
   - av2 篮球小子-红：HSV + despill 去溢色 → ✅
   - av6 榴莲宝贝3D：HSV 形态学 → ✅
2. ✅ ChromaKeyVideo 组件（浏览器端 requestAnimationFrame 逐帧 canvas 抠绿幕）
3. ✅ 5 个视频使用 ChromaKeyVideo 组件展示（av1_idle, av5_idle, av5_event, av6_idle, av6_event）
4. ✅ av1/av2/av6 预览图切换到预抠图 PNG
5. ✅ 部署 miaobo-b.pages.dev (commit d5f31e0)
6. ✅ 飞书卡片汇报

### 技术要点
- Coze 生成的绿幕偏黄绿，需要更宽泛的 HSV 范围（H:35-85, S:40+, V:40+）
- ffmpeg libvpx-vp9 虽然列出 yuva420p 为 supported pixel formats，但实际编码输出 yuv420p（丢弃 alpha）
- 所以改用浏览器端 canvas 逐帧处理视频绿幕
- despill：边缘区域 G 通道钳制到 min(R,B)*1.02+3

### 待 Boss 确认
- 静态图抠图效果
- 视频绿幕实时处理效果
- 如有问题请截图反馈
