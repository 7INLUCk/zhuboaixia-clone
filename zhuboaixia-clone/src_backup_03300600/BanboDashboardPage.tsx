import React, { useState } from 'react'
import { tokens } from './tokens'

type Props = { onNavigate: (page: any) => void }

const T = tokens

export default function BanboDashboardPage({ onNavigate }: Props) {
  const [isLive, setIsLive] = useState(false)
  const [aiMode, setAiMode] = useState(true)

  return (
    <div style={{ padding: 32, fontFamily: T.fonts.family }}>
      {/* 顶部：伴播形象+状态 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 24,
          background: 'linear-gradient(180deg, #FF6B9D 0%, #FF8C42 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
        }}>🐟</div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: T.colors.textPrimary }}>伴播 · 小鱼</div>
          <div style={{ fontSize: 12, color: T.colors.textSecondary }}>
            {isLive ? '🟢 直播中 · AI模式运行中' : '⚪ 待开播'}
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button onClick={() => setIsLive(!isLive)} style={{
            padding: '8px 20px', borderRadius: 6, border: 'none',
            background: isLive ? '#F53F3F' : '#00B42A', color: '#fff',
            fontSize: 13, fontWeight: 500, cursor: 'pointer',
          }}>
            {isLive ? '停止伴播' : '开始伴播'}
          </button>
        </div>
      </div>

      {/* 功能网格 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { icon: '🎤', label: '声控切品', desc: '语音切换商品', active: true },
          { icon: '💬', label: '伴播搭话', desc: 'AI自动互动', active: aiMode },
          { icon: '🎬', label: '导播台', desc: '场景/贴片', active: true },
          { icon: '💬', label: '发评回评', desc: '自动好评', active: false },
          { icon: '💰', label: '声控开价', desc: '语音开价', active: false },
          { icon: '👋', label: '欢迎感谢', desc: '自动欢迎', active: true },
          { icon: '🎫', label: '发优惠券', desc: '自动弹券', active: false },
          { icon: '🎁', label: '发福袋', desc: '自动发福袋', active: false },
        ].map((f, i) => (
          <div key={i} style={{
            border: `1px solid ${T.colors.border}`, borderRadius: 8, padding: 12,
            background: f.active ? '#F5F3FF' : '#fff', cursor: 'pointer',
          }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>{f.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: T.colors.textPrimary }}>{f.label}</div>
            <div style={{ fontSize: 11, color: T.colors.textSecondary }}>{f.desc}</div>
            <div style={{
              marginTop: 6, fontSize: 10, padding: '2px 6px', borderRadius: 4, display: 'inline-block',
              background: f.active ? '#E8F5E9' : '#FFF3E0', color: f.active ? '#2E7D32' : '#E65100',
            }}>
              {f.active ? '已开启' : '未开启'}
            </div>
          </div>
        ))}
      </div>

      {/* 伴播实时日志 */}
      <div style={{
        background: '#1a1a2e', borderRadius: 8, padding: 16, color: '#aaa', fontSize: 12,
        fontFamily: 'monospace', height: 160, overflow: 'auto',
      }}>
        <div style={{ color: '#4ECDC4' }}>▸ [伴播系统] 已就绪，等待开播...</div>
        <div style={{ color: '#888' }}>▸ [配置] 形象: 小鱼 | 台词: 5条 | 动作: 6个</div>
        <div style={{ color: '#888' }}>▸ [配置] AI模式: {aiMode ? '开启' : '关闭'}</div>
        {isLive && <>
          <div style={{ color: '#4ECDC4' }}>▸ [开播] 伴播已启动</div>
          <div style={{ color: '#FFD93D' }}>▸ [ASR] 监听中...</div>
          <div style={{ color: '#00B42A' }}>▸ [事件] 新观众进入 → 伴播: "欢迎来到直播间！"</div>
          <div style={{ color: '#00B42A' }}>▸ [事件] 主播说"一起看3号链接" → 切品: 3号</div>
          <div style={{ color: '#FF6B9D' }}>▸ [TTS] 语音合成完成 → 伴播动作: 说话</div>
        </>}
      </div>
    </div>
  )
}
