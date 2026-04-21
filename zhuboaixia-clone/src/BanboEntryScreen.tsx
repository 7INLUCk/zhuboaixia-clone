// src/BanboEntryScreen.tsx
import React, { useState } from 'react'
import { C } from './shared'

type Props = {
  onStart: () => void
}

const DEMO_PRODUCTS = [
  { id: 1, emoji: '👗', name: '碎花连衣裙', color: '#FFD0E8', avatarEmoji: '🌸', avatarBg: '#FFB3D9' },
  { id: 2, emoji: '👔', name: '纯棉印花T恤', color: '#B3D4FF', avatarEmoji: '⚡', avatarBg: '#91CAFF' },
  { id: 3, emoji: '🧥', name: '防晒衣外套', color: '#C8F0D0', avatarEmoji: '🍀', avatarBg: '#95DE64' },
]

function LiveDemo() {
  const [activeIdx, setActiveIdx] = useState(0)
  const active = DEMO_PRODUCTS[activeIdx]

  return (
    <div style={{
      width: '100%', maxWidth: 440, marginBottom: 28,
      borderRadius: 12, border: `1px solid ${C.border}`,
      overflow: 'hidden', background: '#FAFBFC',
    }}>
      {/* 标题栏 */}
      <div style={{
        padding: '8px 14px', background: '#fff',
        borderBottom: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>直播间效果预览</span>
        <span style={{
          fontSize: 10, padding: '2px 8px', borderRadius: 10,
          background: '#FFF1F0', color: '#F53F3F', fontWeight: 600,
        }}>● 演示</span>
      </div>

      {/* 直播间主体 */}
      <div style={{ display: 'flex', gap: 0 }}>
        {/* 左：直播画面 */}
        <div style={{
          flex: 1, padding: '16px 12px',
          background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 100%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: 160, position: 'relative',
        }}>
          {/* 直播状态 */}
          <div style={{
            position: 'absolute', top: 8, left: 8,
            fontSize: 9, padding: '2px 6px', borderRadius: 4,
            background: '#F53F3F', color: '#fff', fontWeight: 700,
          }}>● LIVE</div>

          {/* AI 形象 */}
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: active.avatarBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, marginBottom: 6,
            boxShadow: `0 0 0 3px rgba(255,255,255,0.15)`,
            transition: 'background 0.35s ease',
          }}>{active.avatarEmoji}</div>

          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', marginBottom: 2 }}>AI 数字人</div>

          {/* 当前商品标签 */}
          <div style={{
            fontSize: 10, padding: '3px 8px', borderRadius: 10,
            background: active.color, color: '#333', fontWeight: 500,
            transition: 'background 0.35s ease',
          }}>{active.emoji} {active.name}</div>
        </div>

        {/* 右：操作说明 + 商品切换 */}
        <div style={{
          width: 160, padding: '12px', background: '#fff',
          borderLeft: `1px solid ${C.border}`,
          display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6,
        }}>
          <div style={{ fontSize: 11, color: C.textSec, marginBottom: 4 }}>
            👇 点商品，看形象切换
          </div>
          {DEMO_PRODUCTS.map((p, i) => (
            <div
              key={p.id}
              onClick={() => setActiveIdx(i)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '7px 10px', borderRadius: 8, cursor: 'pointer',
                border: `1.5px solid ${i === activeIdx ? C.blue : C.border}`,
                background: i === activeIdx ? C.blueLight : '#FAFBFC',
                transition: 'all 0.2s',
              }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: 6,
                background: p.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, flexShrink: 0,
              }}>{p.emoji}</div>
              <div style={{ fontSize: 11, color: i === activeIdx ? C.blue : C.text, fontWeight: i === activeIdx ? 600 : 400 }}>
                {p.name}
              </div>
            </div>
          ))}
          <div style={{ fontSize: 10, color: C.textTert, marginTop: 4, lineHeight: 1.5 }}>
            主播讲哪件商品，形象自动切换搭配
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BanboEntryScreen({ onStart }: Props) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: '#fff',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center',
      padding: '24px 40px 20px',
      fontFamily: C.font,
      overflowY: 'auto',
    }}>
      {/* 标题 */}
      <div style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 4, textAlign: 'center' }}>
        🦐 伴播形象配置
      </div>
      <div style={{ fontSize: 13, color: C.textSec, textAlign: 'center', marginBottom: 20 }}>
        配置完成后，AI 数字人将在直播间自动跟随商品切换搭配
      </div>

      {/* 效果预览 */}
      <LiveDemo />

      {/* 5步概览 */}
      <div style={{
        width: '100%', maxWidth: 440,
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
        marginBottom: 20,
      }}>
        {[
          { icon: '🎭', label: '面容选择', desc: 'AI 形象的外貌基础' },
          { icon: '👗', label: '商品搭配', desc: '每件商品配一套造型' },
          { icon: '📸', label: '定装照生成', desc: '生成形象效果图' },
          { icon: '🎬', label: '技能配置', desc: '形象会做哪些动作' },
          { icon: '✅', label: '提交审核', desc: '审核通过即可开播' },
        ].map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px', borderRadius: 8,
            border: `1px solid ${C.border}`, background: '#FAFBFC',
          }}>
            <span style={{ fontSize: 18 }}>{item.icon}</span>
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
          width: '100%', maxWidth: 440,
          padding: '13px 0', borderRadius: 10, border: 'none',
          background: C.blue, color: '#fff',
          fontSize: 15, fontWeight: 700,
          cursor: 'pointer', fontFamily: C.font,
          boxShadow: '0 4px 16px rgba(51,112,255,0.3)',
        }}
      >
        开始配置 →
      </button>

      <div style={{ fontSize: 12, color: C.textTert, marginTop: 10 }}>
        预计配置时间约 30 分钟
      </div>
    </div>
  )
}
