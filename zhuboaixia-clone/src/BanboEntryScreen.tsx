// src/BanboEntryScreen.tsx
import React, { useState, useEffect } from 'react'
import { C } from './shared'

type Props = { onStart: () => void }

const DEMO_PRODUCTS = [
  { id: 1, emoji: '👗', name: '碎花连衣裙', color: '#FFD0E8' },
  { id: 2, emoji: '👔', name: '纯棉印花T恤', color: '#B3D4FF' },
  { id: 3, emoji: '🧥', name: '防晒衣外套',  color: '#C8F0D0' },
]

const STEPS = [
  { num: 1, label: '面容选择' },
  { num: 2, label: '商品搭配' },
  { num: 3, label: '定装照'   },
  { num: 4, label: '技能配置' },
  { num: 5, label: '提交审核' },
]

export default function BanboEntryScreen({ onStart }: Props) {
  const [activeIdx, setActiveIdx] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setActiveIdx(i => (i + 1) % DEMO_PRODUCTS.length), 2200)
    return () => clearInterval(timer)
  }, [])

  return (
    <div style={{
      width: '100%', height: '100%',
      background: '#fff',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '20px 36px 16px',
      fontFamily: C.font, overflowY: 'auto',
    }}>

      {/* 标题 */}
      <div style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 4, textAlign: 'center' }}>
        🦐 伴播形象定制
      </div>
      <div style={{ fontSize: 12, color: C.textSec, textAlign: 'center', marginBottom: 20, lineHeight: 1.6 }}>
        选好外形与搭配，AI 自动生成定装照和直播动作素材——走完 5 步，形象即可上线
      </div>

      {/* 主演示区：手机左 + 商品右，整体居中 */}
      <div style={{
        display: 'flex', gap: 24, alignItems: 'center', marginBottom: 20,
      }}>

        {/* 左：手机框，缩窄至 160px */}
        <div style={{
          width: 160, flexShrink: 0,
          borderRadius: 28,
          background: '#181818',
          padding: '10px 7px 12px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.07)',
        }}>
          {/* 刘海 */}
          <div style={{
            width: 44, height: 4, borderRadius: 3,
            background: '#2e2e2e', margin: '0 auto 8px',
          }} />

          {/* 屏幕 9:16 */}
          <div style={{
            width: '100%',
            aspectRatio: '9 / 16',
            borderRadius: 18,
            overflow: 'hidden',
            background: 'linear-gradient(170deg, #1a1a2e 0%, #16213e 100%)',
            position: 'relative',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
          }}>
            {/* LIVE 角标 */}
            <div style={{
              position: 'absolute', top: 7, left: 7,
              fontSize: 7, padding: '2px 4px', borderRadius: 3,
              background: '#F53F3F', color: '#fff', fontWeight: 700,
            }}>● LIVE</div>

            {/* 占位内容 */}
            <div style={{ fontSize: 28, marginBottom: 6, opacity: 0.6 }}>📱</div>
            <div style={{
              fontSize: 8, color: 'rgba(255,255,255,0.45)',
              textAlign: 'center', lineHeight: 1.6, padding: '0 8px',
            }}>
              品牌录播视频<br />将展示于此
            </div>
          </div>

          {/* Home bar */}
          <div style={{
            width: 38, height: 3, borderRadius: 2,
            background: '#2e2e2e', margin: '8px auto 0',
          }} />
        </div>

        {/* 右：商品切换说明，固定宽度 220px */}
        <div style={{ width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 8 }}>
            形象随商品自动切换
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
            {DEMO_PRODUCTS.map((p, i) => (
              <div key={p.id} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '7px 10px', borderRadius: 8,
                border: `1.5px solid ${i === activeIdx ? C.blue : C.border}`,
                background: i === activeIdx ? C.blueLight : '#FAFBFC',
                transition: 'all 0.45s ease',
              }}>
                <div style={{
                  width: 26, height: 26, borderRadius: 6, flexShrink: 0,
                  background: p.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14,
                }}>{p.emoji}</div>
                <div style={{
                  flex: 1, fontSize: 12,
                  color: i === activeIdx ? C.blue : C.text,
                  fontWeight: i === activeIdx ? 600 : 400,
                  transition: 'color 0.45s ease',
                }}>{p.name}</div>
                {i === activeIdx && (
                  <span style={{
                    fontSize: 9, padding: '2px 6px', borderRadius: 5,
                    background: C.blue, color: '#fff', fontWeight: 600, flexShrink: 0,
                  }}>讲解中</span>
                )}
              </div>
            ))}
          </div>

          <div style={{ fontSize: 11, color: C.textTert, lineHeight: 1.6 }}>
            主播讲哪件商品，AI 形象就穿对应搭配出场。配置完成后自动生效，无需手动操作。
          </div>
        </div>
      </div>

      {/* 5步流程 */}
      <div style={{ width: '100%', display: 'flex', alignItems: 'flex-start', marginBottom: 20 }}>
        {STEPS.map((step, i) => (
          <React.Fragment key={step.num}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: C.blueLight, border: `1.5px solid ${C.blue}50`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: C.blue, marginBottom: 4,
              }}>{step.num}</div>
              <div style={{ fontSize: 10, color: C.textSec, textAlign: 'center', whiteSpace: 'nowrap' }}>
                {step.label}
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ height: 1, background: C.border, flex: 1, marginTop: 13 }} />
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
