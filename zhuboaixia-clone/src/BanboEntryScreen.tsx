// src/BanboEntryScreen.tsx
import React, { useState, useEffect } from 'react'
import { C } from './shared'

type Props = { onStart: () => void }

const DEMO_PRODUCTS = [
  { id: 1, emoji: '👗', name: '碎花连衣裙', color: '#FFD0E8', avatarEmoji: '🌸', avatarBg: '#FFB3D9' },
  { id: 2, emoji: '👔', name: '纯棉印花T恤', color: '#B3D4FF', avatarEmoji: '⚡', avatarBg: '#91CAFF' },
  { id: 3, emoji: '🧥', name: '防晒衣外套',  color: '#C8F0D0', avatarEmoji: '🍀', avatarBg: '#95DE64' },
]

const STEPS = [
  { num: 1, label: '面容选择' },
  { num: 2, label: '商品搭配' },
  { num: 3, label: '定装照'   },
  { num: 4, label: '技能配置' },
  { num: 5, label: '提交审核' },
]

function PhoneDemo() {
  const [activeIdx, setActiveIdx] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setActiveIdx(i => (i + 1) % DEMO_PRODUCTS.length), 2200)
    return () => clearInterval(timer)
  }, [])

  const active = DEMO_PRODUCTS[activeIdx]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', marginBottom: 24 }}>

      {/* 手机外壳 */}
      <div style={{
        width: 200,
        borderRadius: 36,
        background: '#181818',
        padding: '12px 8px 16px',
        boxShadow: '0 24px 60px rgba(0,0,0,0.28), 0 0 0 1px rgba(255,255,255,0.08)',
        marginBottom: 16,
      }}>
        {/* 刘海 */}
        <div style={{
          width: 56, height: 6, borderRadius: 3,
          background: '#2e2e2e',
          margin: '0 auto 10px',
        }} />

        {/* 屏幕 9:16 */}
        <div style={{
          width: '100%',          /* 184px */
          aspectRatio: '9 / 16',
          borderRadius: 22,
          overflow: 'hidden',
          background: 'linear-gradient(170deg, #1a1a2e 0%, #16213e 100%)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {/* LIVE 角标 */}
          <div style={{
            position: 'absolute', top: 8, left: 8,
            fontSize: 8, padding: '2px 5px', borderRadius: 3,
            background: '#F53F3F', color: '#fff', fontWeight: 700, letterSpacing: 0.3,
          }}>● LIVE</div>

          {/* 观众数 */}
          <div style={{
            position: 'absolute', top: 8, right: 8,
            fontSize: 8, color: 'rgba(255,255,255,0.4)',
          }}>👁 1.2k</div>

          {/* Avatar */}
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: active.avatarBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36,
            boxShadow: '0 0 0 4px rgba(255,255,255,0.1)',
            transition: 'background 0.45s ease',
            marginBottom: 8,
          }}>{active.avatarEmoji}</div>

          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', marginBottom: 8 }}>
            AI 数字人
          </div>

          {/* 当前商品 badge */}
          <div style={{
            fontSize: 9, padding: '3px 10px', borderRadius: 12,
            background: active.color, color: '#333', fontWeight: 600,
            transition: 'background 0.45s ease',
          }}>
            {active.emoji} {active.name}
          </div>

          {/* 底部商品进度点 */}
          <div style={{
            position: 'absolute', bottom: 10,
            display: 'flex', gap: 5,
          }}>
            {DEMO_PRODUCTS.map((_, i) => (
              <div key={i} style={{
                width: i === activeIdx ? 16 : 5,
                height: 5, borderRadius: 3,
                background: i === activeIdx ? '#fff' : 'rgba(255,255,255,0.25)',
                transition: 'all 0.45s ease',
              }} />
            ))}
          </div>
        </div>

        {/* home bar */}
        <div style={{
          width: 48, height: 4, borderRadius: 2,
          background: '#2e2e2e',
          margin: '10px auto 0',
        }} />
      </div>

      {/* 手机下方：商品切换指示 */}
      <div style={{ width: '100%' }}>
        <div style={{ fontSize: 11, color: C.textSec, marginBottom: 8, textAlign: 'center' }}>
          形象随商品自动切换
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {DEMO_PRODUCTS.map((p, i) => (
            <div key={p.id} style={{
              flex: 1, display: 'flex', alignItems: 'center', gap: 7,
              padding: '8px 10px', borderRadius: 10,
              border: `1.5px solid ${i === activeIdx ? C.blue : C.border}`,
              background: i === activeIdx ? C.blueLight : '#FAFBFC',
              transition: 'all 0.45s ease',
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                background: p.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14,
              }}>{p.emoji}</div>
              <div style={{
                flex: 1, fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                color: i === activeIdx ? C.blue : C.text,
                fontWeight: i === activeIdx ? 600 : 400,
                transition: 'color 0.45s ease',
              }}>{p.name}</div>
              {i === activeIdx && (
                <span style={{
                  fontSize: 9, padding: '1px 5px', borderRadius: 4, flexShrink: 0,
                  background: C.blue, color: '#fff', fontWeight: 600,
                }}>▶</span>
              )}
            </div>
          ))}
        </div>
        <div style={{ fontSize: 10, color: C.textTert, textAlign: 'center', marginTop: 8 }}>
          主播讲哪件商品，AI 形象就穿对应搭配出场
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
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '24px 36px 20px',
      fontFamily: C.font, overflowY: 'auto',
    }}>
      {/* 标题 */}
      <div style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 4, textAlign: 'center' }}>
        🦐 伴播形象配置
      </div>
      <div style={{ fontSize: 13, color: C.textSec, textAlign: 'center', marginBottom: 20 }}>
        配置完成后，AI 数字人将在直播间自动跟随商品切换搭配
      </div>

      {/* 手机 demo */}
      <PhoneDemo />

      {/* 5步流程 */}
      <div style={{ width: '100%', display: 'flex', alignItems: 'flex-start', marginBottom: 22 }}>
        {STEPS.map((step, i) => (
          <React.Fragment key={step.num}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, flexShrink: 0 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: C.blueLight, border: `1.5px solid ${C.blue}50`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: C.blue, marginBottom: 5,
              }}>{step.num}</div>
              <div style={{ fontSize: 10, color: C.textSec, textAlign: 'center', whiteSpace: 'nowrap' }}>
                {step.label}
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ height: 1, background: C.border, flex: 1, marginTop: 14, flexShrink: 1 }} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* CTA */}
      <button onClick={onStart} style={{
        width: '100%', padding: '13px 0', borderRadius: 10, border: 'none',
        background: C.blue, color: '#fff', fontSize: 15, fontWeight: 700,
        cursor: 'pointer', fontFamily: C.font,
        boxShadow: '0 4px 16px rgba(51,112,255,0.3)', marginBottom: 10,
      }}>
        开始配置 →
      </button>

      <div style={{ fontSize: 12, color: C.textTert }}>
        预计配置时间约 30 分钟
      </div>
    </div>
  )
}
