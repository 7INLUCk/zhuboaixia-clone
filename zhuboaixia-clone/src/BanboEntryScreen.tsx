// src/BanboEntryScreen.tsx
import React from 'react'
import { C } from './shared'

type Props = { onStart: () => void }

const CAPABILITIES = [
  {
    emoji: '👗',
    title: '随商品自动换装',
    desc: '主播讲哪件，形象穿哪件，无需手动切换',
    color: '#FFD0E8',
  },
  {
    emoji: '🎯',
    title: '关键场景精准配合',
    desc: '逼单、感谢下单、才艺演出，在正确时机出对应动作',
    color: '#B3D4FF',
  },
  {
    emoji: '🤖',
    title: '与真人主播同台伴播',
    desc: 'AI 数字人进驻直播间，全程陪跑助播',
    color: '#C8F0D0',
  },
]

const STEPS = [
  { num: 1, label: '面容选择' },
  { num: 2, label: '商品搭配' },
  { num: 3, label: '定装照'   },
  { num: 4, label: '技能配置' },
  { num: 5, label: '提交审核' },
]

export default function BanboEntryScreen({ onStart }: Props) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: '#fff',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'space-between',
      padding: '24px 36px 20px',
      fontFamily: C.font, boxSizing: 'border-box',
    }}>

      {/* ① 标题区 */}
      <div style={{ textAlign: 'center', flexShrink: 0, marginBottom: 16 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 6 }}>
          🦐 为直播间引入一位 AI 伴播形象
        </div>
        <div style={{ fontSize: 12, color: C.textSec, lineHeight: 1.7 }}>
          走完 5 步完成形象创建，配置一次，直播全程自动运行
        </div>
      </div>

      {/* ② 演示区：固定 padding，内容整体居中 */}
      <div style={{
        width: '100%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 16,
        background: '#F6F7FA',
        padding: '28px 32px',
        boxSizing: 'border-box',
        marginBottom: 0,
      }}>

        {/* 手机 + 能力列：作为整体居中 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>

        {/* 左：手机框 160px */}
        <div style={{
          width: 160, flexShrink: 0,
          borderRadius: 28,
          background: '#181818',
          padding: '10px 7px 12px',
          boxShadow: '0 16px 40px rgba(0,0,0,0.22), 0 0 0 1px rgba(255,255,255,0.07)',
        }}>
          <div style={{
            width: 42, height: 4, borderRadius: 3,
            background: '#2e2e2e', margin: '0 auto 8px',
          }} />
          <div style={{
            width: '100%', aspectRatio: '9 / 16',
            borderRadius: 18, overflow: 'hidden',
            background: 'linear-gradient(170deg, #1a1a2e 0%, #16213e 100%)',
            position: 'relative',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              position: 'absolute', top: 8, left: 8,
              fontSize: 8, padding: '2px 5px', borderRadius: 3,
              background: '#F53F3F', color: '#fff', fontWeight: 700,
            }}>● LIVE</div>
            <div style={{ fontSize: 28, marginBottom: 6, opacity: 0.45 }}>📺</div>
            <div style={{
              fontSize: 9, color: 'rgba(255,255,255,0.4)',
              textAlign: 'center', lineHeight: 1.7, padding: '0 10px',
            }}>
              演示视频<br />将展示于此
            </div>
          </div>
          <div style={{
            width: 38, height: 3, borderRadius: 2,
            background: '#2e2e2e', margin: '8px auto 0',
          }} />
        </div>

        {/* 右：3条能力，固定宽度，自然堆叠 */}
        <div style={{
          width: 240,
          display: 'flex', flexDirection: 'column',
          gap: 20,
        }}>
          {CAPABILITIES.map(cap => (
            <div key={cap.title} style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: cap.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18,
              }}>{cap.emoji}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 3 }}>
                  {cap.title}
                </div>
                <div style={{ fontSize: 11, color: C.textSec, lineHeight: 1.6 }}>
                  {cap.desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        </div>{/* end 内层居中容器 */}
      </div>

      {/* ③ 过渡文字 */}
      <div style={{ flexShrink: 0, textAlign: 'center' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>
          ↓ 现在，创建你的专属伴播形象
        </div>
      </div>

      {/* ④ 5步流程 */}
      <div style={{ width: '100%', display: 'flex', alignItems: 'flex-start', flexShrink: 0, marginBottom: 16 }}>
        {STEPS.map((step, i) => (
          <React.Fragment key={step.num}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: C.blue,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 5,
                boxShadow: '0 2px 8px rgba(51,112,255,0.3)',
              }}>{step.num}</div>
              <div style={{ fontSize: 11, color: C.textSec, textAlign: 'center', whiteSpace: 'nowrap' }}>
                {step.label}
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ height: 1, background: C.border, flex: 1, marginTop: 16 }} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* ⑤ CTA */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <button onClick={onStart} style={{
          width: 480, maxWidth: '100%',
          padding: '14px 0', borderRadius: 14, border: 'none',
          background: C.blue, color: '#fff', fontSize: 15, fontWeight: 700,
          cursor: 'pointer', fontFamily: C.font,
          boxShadow: '0 4px 20px rgba(51,112,255,0.35)', marginBottom: 10,
        }}>
          开始配置 →
        </button>
        <div style={{ fontSize: 12, color: C.textTert }}>
          配置完成即可上线 · 约 30 分钟
        </div>
      </div>

    </div>
  )
}
