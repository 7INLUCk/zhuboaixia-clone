// src/BanboEntryScreen.tsx
import React, { useState, useEffect } from 'react'
import { C } from './shared'

type Props = {
  onStart: () => void
}

const DEMO_PRODUCTS = [
  { id: 1, emoji: '👗', name: '碎花连衣裙', color: '#FFD0E8', avatarEmoji: '🌸', avatarBg: '#FFB3D9' },
  { id: 2, emoji: '👔', name: '纯棉印花T恤', color: '#B3D4FF', avatarEmoji: '⚡', avatarBg: '#91CAFF' },
  { id: 3, emoji: '🧥', name: '防晒衣外套', color: '#C8F0D0', avatarEmoji: '🍀', avatarBg: '#95DE64' },
]

const STEPS = [
  { num: 1, label: '面容选择' },
  { num: 2, label: '商品搭配' },
  { num: 3, label: '定装照' },
  { num: 4, label: '技能配置' },
  { num: 5, label: '提交审核' },
]

function LiveDemo() {
  const [activeIdx, setActiveIdx] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx(i => (i + 1) % DEMO_PRODUCTS.length)
    }, 2200)
    return () => clearInterval(timer)
  }, [])

  const active = DEMO_PRODUCTS[activeIdx]

  return (
    <div style={{
      width: '100%', borderRadius: 14, overflow: 'hidden',
      border: `1px solid ${C.border}`, marginBottom: 20,
    }}>
      {/* 顶栏 */}
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

      {/* 主体：深色沉浸式直播间 */}
      <div style={{
        background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 100%)',
        padding: '28px 24px 20px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        position: 'relative',
      }}>
        {/* LIVE + 观看人数 */}
        <div style={{
          position: 'absolute', top: 12, left: 14,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{
            fontSize: 10, padding: '2px 7px', borderRadius: 4,
            background: '#F53F3F', color: '#fff', fontWeight: 700, letterSpacing: 0.5,
          }}>● LIVE</span>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>👁 1,283</span>
        </div>

        {/* Avatar */}
        <div style={{
          width: 96, height: 96, borderRadius: '50%',
          background: active.avatarBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 48, marginBottom: 10,
          boxShadow: '0 0 0 5px rgba(255,255,255,0.08)',
          transition: 'background 0.45s ease',
        }}>{active.avatarEmoji}</div>

        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>
          AI 数字人
        </div>

        {/* 当前商品名 */}
        <div style={{
          fontSize: 13, padding: '5px 16px', borderRadius: 20,
          background: active.color, color: '#333', fontWeight: 600,
          transition: 'background 0.45s ease',
          marginBottom: 24,
        }}>
          {active.emoji} {active.name}
        </div>

        {/* 商品横排 */}
        <div style={{
          width: '100%', borderTop: '1px solid rgba(255,255,255,0.07)',
          paddingTop: 16,
          display: 'flex', gap: 8,
        }}>
          {DEMO_PRODUCTS.map((p, i) => (
            <div key={p.id} style={{
              flex: 1, display: 'flex', alignItems: 'center', gap: 7,
              padding: '8px 10px', borderRadius: 10,
              border: `1.5px solid ${i === activeIdx ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.08)'}`,
              background: i === activeIdx ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
              transition: 'all 0.45s ease',
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                background: p.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14,
              }}>{p.emoji}</div>
              <div style={{
                flex: 1, fontSize: 11,
                color: i === activeIdx ? '#fff' : 'rgba(255,255,255,0.4)',
                fontWeight: i === activeIdx ? 600 : 400,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                transition: 'color 0.45s ease',
              }}>{p.name}</div>
              {i === activeIdx && (
                <span style={{
                  fontSize: 9, padding: '1px 5px', borderRadius: 4, flexShrink: 0,
                  background: '#F53F3F', color: '#fff', fontWeight: 700,
                }}>▶</span>
              )}
            </div>
          ))}
        </div>

        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', marginTop: 10 }}>
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
      display: 'flex', flexDirection: 'column',
      alignItems: 'center',
      padding: '28px 40px 24px',
      fontFamily: C.font,
      overflowY: 'auto',
    }}>
      {/* 标题 */}
      <div style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 4, textAlign: 'center' }}>
        🦐 伴播形象配置
      </div>
      <div style={{ fontSize: 13, color: C.textSec, textAlign: 'center', marginBottom: 22 }}>
        配置完成后，AI 数字人将在直播间自动跟随商品切换搭配
      </div>

      {/* 效果预览 */}
      <LiveDemo />

      {/* 5步流程 */}
      <div style={{
        width: '100%', display: 'flex', alignItems: 'flex-start',
        marginBottom: 24,
      }}>
        {STEPS.map((step, i) => (
          <React.Fragment key={step.num}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, flex: 1 }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: C.blueLight,
                border: `1.5px solid ${C.blue}50`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: C.blue,
                marginBottom: 6,
              }}>{step.num}</div>
              <div style={{ fontSize: 11, color: C.textSec, textAlign: 'center', whiteSpace: 'nowrap' }}>
                {step.label}
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                height: 1, background: C.border,
                flex: 1, marginTop: 15, flexShrink: 1,
              }} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* 开始按钮 */}
      <button
        onClick={onStart}
        style={{
          width: '100%', padding: '14px 0', borderRadius: 10, border: 'none',
          background: C.blue, color: '#fff',
          fontSize: 15, fontWeight: 700,
          cursor: 'pointer', fontFamily: C.font,
          boxShadow: '0 4px 16px rgba(51,112,255,0.3)',
          marginBottom: 10,
        }}
      >
        开始配置 →
      </button>

      <div style={{ fontSize: 12, color: C.textTert }}>
        预计配置时间约 30 分钟
      </div>
    </div>
  )
}
