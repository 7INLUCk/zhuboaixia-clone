// src/wizard/Step4Portrait.tsx
import React, { useState, useEffect } from 'react'
import { C } from '../shared'
import { FACE_LIBRARY } from './mockData'
import type { WizardState } from './types'

type Props = {
  state: WizardState
  onUpdate: (patch: Partial<WizardState>) => void
  onNext: () => void
  onPrev: () => void
}

const PORTRAIT_COLORS = ['#FFD0E8','#B3D4FF','#C8F0D0','#FFE0B0','#D0E0FF','#FFD4F0']

export default function Step4Portrait({ state, onUpdate, onNext, onPrev }: Props) {
  const { avatarConfigs } = state
  const [generating, setGenerating] = useState<Record<string, boolean>>({})

  // 初始化：未生成的自动开始
  useEffect(() => {
    const notDone = avatarConfigs.filter(c => !c.portraitDone)
    if (notDone.length === 0) return

    notDone.forEach((c, i) => {
      setGenerating(prev => ({ ...prev, [c.id]: true }))
      setTimeout(() => {
        setGenerating(prev => ({ ...prev, [c.id]: false }))
        onUpdate({
          avatarConfigs: avatarConfigs.map(ac =>
            ac.id === c.id ? { ...ac, portraitDone: true } : ac
          )
        })
      }, 1500 + i * 600)
    })
  }, []) // eslint-disable-line

  const regenerate = (avatarId: string) => {
    setGenerating(prev => ({ ...prev, [avatarId]: true }))
    onUpdate({
      avatarConfigs: avatarConfigs.map(c =>
        c.id === avatarId ? { ...c, portraitDone: false } : c
      )
    })
    setTimeout(() => {
      setGenerating(prev => ({ ...prev, [avatarId]: false }))
      onUpdate({
        avatarConfigs: avatarConfigs.map(c =>
          c.id === avatarId ? { ...c, portraitDone: true } : c
        )
      })
    }, 1800)
  }

  const allDone = avatarConfigs.every(c => c.portraitDone && !generating[c.id])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px 12px', flexShrink: 0 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 6 }}>生成定妆照</div>
        <div style={{ fontSize: 13, color: C.textSec }}>基于所选面容与商品参考图，AI 自动生成每套形象的定妆照。</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {avatarConfigs.map((config, ci) => {
            const face = FACE_LIBRARY.find(f => f.id === config.faceId)
            const isGenerating = generating[config.id] || (!config.portraitDone)
            const portraitColor = PORTRAIT_COLORS[ci % PORTRAIT_COLORS.length]

            return (
              <div key={config.id} style={{
                borderRadius: 12, border: `1px solid ${C.border}`,
                overflow: 'hidden', background: '#fff',
              }}>
                {/* 定妆照区域 */}
                <div style={{
                  height: 200, background: isGenerating ? '#F2F3F5' : portraitColor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative', flexDirection: 'column', gap: 8,
                }}>
                  {isGenerating ? (
                    <>
                      <div style={{
                        width: 40, height: 40, borderRadius: '50%',
                        border: `3px solid ${C.blue}`, borderTopColor: 'transparent',
                        animation: 'spin 0.8s linear infinite',
                      }} />
                      <div style={{ fontSize: 12, color: C.textSec }}>AI 生成中...</div>
                      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: 48 }}>{face?.emoji ?? '👤'}</div>
                      <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)', fontWeight: 500 }}>
                        {config.name} · {face?.name}
                      </div>
                      {/* 重新生成按钮 */}
                      <button
                        onClick={() => regenerate(config.id)}
                        style={{
                          position: 'absolute', bottom: 8, right: 8,
                          padding: '4px 10px', borderRadius: 6, border: 'none',
                          background: 'rgba(255,255,255,0.85)', color: C.text,
                          fontSize: 11, cursor: 'pointer', fontFamily: C.font,
                        }}
                      >🔄 重新生成</button>
                      {/* 完成角标 */}
                      <div style={{
                        position: 'absolute', top: 8, right: 8,
                        width: 24, height: 24, borderRadius: '50%',
                        background: C.green, color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 700,
                      }}>✓</div>
                    </>
                  )}
                </div>

                {/* 形象信息 */}
                <div style={{ padding: '10px 12px' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 2 }}>{config.name}</div>
                  <div style={{ fontSize: 11, color: C.textSec }}>
                    {config.type === 'brand-ip' ? '品牌IP · 整场展示' :
                      `商品绑定 · ${config.outfitSlots.length}件搭配`}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{
        padding: '16px 24px', borderTop: `1px solid ${C.border}`,
        display: 'flex', justifyContent: 'space-between', flexShrink: 0,
      }}>
        <button onClick={onPrev} style={{
          padding: '10px 24px', borderRadius: 8,
          border: `1px solid ${C.border}`, background: '#fff',
          color: C.text, fontSize: 14, cursor: 'pointer', fontFamily: C.font,
        }}>← 上一步</button>
        <button
          onClick={onNext}
          disabled={!allDone}
          style={{
            padding: '10px 32px', borderRadius: 8, border: 'none',
            background: allDone ? C.blue : C.border,
            color: '#fff', fontSize: 14, fontWeight: 600,
            cursor: allDone ? 'pointer' : 'not-allowed', fontFamily: C.font,
          }}
        >{allDone ? '确认定妆照，下一步 →' : '生成中...'}</button>
      </div>
    </div>
  )
}
