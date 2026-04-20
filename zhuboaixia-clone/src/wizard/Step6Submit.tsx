// src/wizard/Step6Submit.tsx
import React, { useState } from 'react'
import { C } from '../shared'
import { CARGO_PRODUCTS } from './mockData'
import type { WizardState, WizardResult } from './types'

type Props = {
  state: WizardState
  onComplete: (result: WizardResult) => void
  onPrev: () => void
}

type Phase = 'summary' | 'reviewing' | 'passed' | 'checking'

export default function Step6Submit({ state, onComplete, onPrev }: Props) {
  const [phase, setPhase] = useState<Phase>('summary')
  const { avatarConfigs, selectedProductIds } = state

  const totalSkills = avatarConfigs.reduce((sum, c) => sum + c.selectedSkillIds.length, 0)
  const totalClips = avatarConfigs.reduce((sum, c) =>
    sum + Object.values(c.materials).reduce((s, clips) => s + clips.length, 0), 0
  )

  const submit = () => {
    setPhase('reviewing')
    setTimeout(() => setPhase('passed'), 2200)
  }

  // 配置检测：哪些商品有绑定
  const productBindings = selectedProductIds.map(pid => {
    const prod = CARGO_PRODUCTS.find(p => p.id === pid)!
    const bound = avatarConfigs.filter(c =>
      c.outfitSlots.some(s => s.productId === pid)
    )
    return { prod, bound }
  })

  const brandIpAvatars = avatarConfigs.filter(c => c.type === 'brand-ip')
  const unboundProducts = productBindings.filter(pb => pb.bound.length === 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px 12px', flexShrink: 0 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 6 }}>提交审核</div>
        <div style={{ fontSize: 13, color: C.textSec }}>确认配置信息，提交后系统将进行素材处理与审核。</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>

        {/* 汇总卡片 */}
        {(phase === 'summary') && (
          <>
            <div style={{
              padding: '16px', borderRadius: 10, border: `1px solid ${C.border}`,
              background: '#FAFBFC', marginBottom: 16,
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 12 }}>配置汇总</div>
              <div style={{ display: 'flex', gap: 24 }}>
                {[
                  { label: '伴播形象', value: avatarConfigs.length, unit: '个' },
                  { label: '已配技能', value: totalSkills, unit: '个' },
                  { label: '动作素材', value: totalClips, unit: '条' },
                ].map(item => (
                  <div key={item.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: C.blue }}>{item.value}</div>
                    <div style={{ fontSize: 11, color: C.textSec }}>{item.label}（{item.unit}）</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 形象列表 */}
            {avatarConfigs.map(c => (
              <div key={c.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                borderRadius: 8, border: `1px solid ${C.border}`, marginBottom: 8, background: '#fff',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: C.textSec, marginTop: 2 }}>
                    {c.type === 'brand-ip' ? '品牌IP · 整场' : `商品绑定 · ${c.outfitSlots.length}件`} · {c.selectedSkillIds.length}个技能
                  </div>
                </div>
                <div style={{
                  padding: '2px 8px', borderRadius: 6, fontSize: 11,
                  background: C.greenLight, color: C.green, fontWeight: 500,
                }}>✓ 已完成</div>
              </div>
            ))}
          </>
        )}

        {/* 审核中 */}
        {phase === 'reviewing' && (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{
              width: 60, height: 60, borderRadius: '50%',
              border: `4px solid ${C.blue}`, borderTopColor: 'transparent',
              margin: '0 auto 20px', animation: 'spin 0.8s linear infinite',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <div style={{ fontSize: 18, fontWeight: 600, color: C.text, marginBottom: 8 }}>审核中...</div>
            <div style={{ fontSize: 13, color: C.textSec }}>系统正在处理素材，预计 1-3 分钟</div>
          </div>
        )}

        {/* 审核通过 + 配置检测 */}
        {(phase === 'passed' || phase === 'checking') && (
          <>
            <div style={{
              padding: '16px', borderRadius: 10, border: `1px solid ${C.green}30`,
              background: C.greenLight, marginBottom: 16,
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%', background: C.green,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0,
              }}>✓</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.green }}>审核通过</div>
                <div style={{ fontSize: 12, color: C.textSec, marginTop: 2 }}>所有素材已处理完成，可以开播</div>
              </div>
            </div>

            {/* 配置检测 */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 10 }}>开播前配置检测</div>

              {/* 整场形象 */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                borderRadius: 8, border: `1px solid ${C.border}`, marginBottom: 6, background: '#fff',
              }}>
                <span style={{ fontSize: 12, color: C.textSec, flexShrink: 0, width: 80 }}>整场形象</span>
                {brandIpAvatars.length > 0
                  ? brandIpAvatars.map(a => (
                    <span key={a.id} style={{ fontSize: 12, padding: '2px 8px', borderRadius: 10, background: C.blueLight, color: C.blue }}>{a.name}</span>
                  ))
                  : <span style={{ fontSize: 12, color: C.textTert }}>未配置（可选）</span>
                }
              </div>

              {/* 商品绑定检测 */}
              {productBindings.map(({ prod, bound }) => (
                <div key={prod.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                  borderRadius: 8, border: `1px solid ${bound.length > 0 ? C.border : C.orange + '60'}`,
                  marginBottom: 6,
                  background: bound.length > 0 ? '#fff' : '#FFFBF0',
                }}>
                  <span style={{ fontSize: 12, color: C.textSec, flexShrink: 0 }}>{prod.linkNum}号 {prod.name}</span>
                  <div style={{ flex: 1 }}>
                    {bound.length > 0
                      ? bound.map(a => (
                        <span key={a.id} style={{ fontSize: 12, padding: '2px 8px', borderRadius: 10, background: C.blueLight, color: C.blue, marginRight: 4 }}>{a.name}</span>
                      ))
                      : <span style={{ fontSize: 12, color: C.orange }}>⚠️ 未绑定形象</span>
                    }
                  </div>
                </div>
              ))}

              {unboundProducts.length > 0 && (
                <div style={{ fontSize: 12, color: C.textSec, marginTop: 6 }}>
                  {unboundProducts.length} 个商品未绑定形象，这些商品在直播时将不会显示伴播。
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* 底部按钮 */}
      <div style={{
        padding: '16px 24px', borderTop: `1px solid ${C.border}`,
        display: 'flex', justifyContent: 'space-between', flexShrink: 0,
      }}>
        {phase === 'summary' && (
          <>
            <button onClick={onPrev} style={{
              padding: '10px 24px', borderRadius: 8, border: `1px solid ${C.border}`,
              background: '#fff', color: C.text, fontSize: 14, cursor: 'pointer', fontFamily: C.font,
            }}>← 上一步</button>
            <button onClick={submit} style={{
              padding: '10px 32px', borderRadius: 8, border: 'none',
              background: C.blue, color: '#fff', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', fontFamily: C.font,
            }}>提交审核</button>
          </>
        )}

        {phase === 'reviewing' && (
          <div style={{ flex: 1, textAlign: 'center', color: C.textSec, fontSize: 13 }}>处理中，请勿关闭页面...</div>
        )}

        {(phase === 'passed' || phase === 'checking') && (
          <>
            <button onClick={onPrev} style={{
              padding: '10px 24px', borderRadius: 8, border: `1px solid ${C.border}`,
              background: '#fff', color: C.text, fontSize: 14, cursor: 'pointer', fontFamily: C.font,
            }}>返回修改</button>
            <button onClick={() => onComplete(state)} style={{
              padding: '10px 32px', borderRadius: 8, border: 'none',
              background: C.green, color: '#fff', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', fontFamily: C.font,
            }}>🚀 开始直播</button>
          </>
        )}
      </div>
    </div>
  )
}
