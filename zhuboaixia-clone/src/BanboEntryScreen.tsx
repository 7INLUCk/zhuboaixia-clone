// src/BanboEntryScreen.tsx
import React from 'react'
import { C } from './shared'

type Props = {
  onStart: () => void
}

export default function BanboEntryScreen({ onStart }: Props) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: '#fff',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '0 48px',
      fontFamily: C.font,
    }}>
      {/* 图标 */}
      <div style={{ fontSize: 64, marginBottom: 24, lineHeight: 1 }}>🦐</div>

      {/* 标题 */}
      <div style={{ fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 12, textAlign: 'center' }}>
        伴播形象配置
      </div>

      {/* 描述 */}
      <div style={{ fontSize: 14, color: C.textSec, textAlign: 'center', lineHeight: 1.8, marginBottom: 40, maxWidth: 360 }}>
        通过 6 步向导，完成货盘确认、形象选择、商品搭配、定装照生成和技能配置，即可开启 AI 虚拟形象伴播。
      </div>

      {/* 功能概览 */}
      <div style={{
        width: '100%', maxWidth: 400,
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
        marginBottom: 40,
      }}>
        {[
          { icon: '📦', label: '货盘确认', desc: '选择本场直播商品' },
          { icon: '🎭', label: '面容选择', desc: '挑选形象脸型' },
          { icon: '👗', label: '商品搭配', desc: '形象绑定对应商品' },
          { icon: '📸', label: '定装照生成', desc: 'AI 生成形象效果图' },
          { icon: '🎬', label: '技能配置', desc: '选技能并生成素材' },
          { icon: '✅', label: '提交审核', desc: '系统处理后开播' },
        ].map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px', borderRadius: 8,
            border: `1px solid ${C.border}`, background: '#FAFBFC',
          }}>
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{item.label}</div>
              <div style={{ fontSize: 11, color: C.textSec }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 开始按钮 */}
      <button
        onClick={onStart}
        style={{
          width: '100%', maxWidth: 400,
          padding: '14px 0', borderRadius: 10, border: 'none',
          background: C.blue, color: '#fff',
          fontSize: 16, fontWeight: 700,
          cursor: 'pointer', fontFamily: C.font,
          boxShadow: '0 4px 16px rgba(51,112,255,0.3)',
        }}
      >
        开始配置 →
      </button>

      <div style={{ fontSize: 12, color: C.textTert, marginTop: 14 }}>
        预计配置时间 3～5 分钟
      </div>
    </div>
  )
}
