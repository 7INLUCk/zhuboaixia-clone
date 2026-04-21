// src/wizard/Step3Outfit.tsx
import React, { useState } from 'react'
import { C } from '../shared'
import { CARGO_PRODUCTS, FACE_LIBRARY } from './mockData'
import type { WizardState, AvatarConfig, OutfitSlot } from './types'

type Props = {
  state: WizardState
  onUpdate: (patch: Partial<WizardState>) => void
  onNext: () => void
  onPrev: () => void
}

function newAvatar(idx: number): AvatarConfig {
  return {
    id: `avatar-${Date.now()}-${idx}`,
    name: `形象${idx + 1}`,
    type: 'product',
    faceId: '',
    outfitSlots: [],
    selectedSkillIds: ['sp-enter', 'sp-exit', 'sp-auto-outfit', 'sp-showcase'],
    materials: {},
    portraitDone: false,
    materialsDone: false,
  }
}

export default function Step3Outfit({ state, onUpdate, onNext, onPrev }: Props) {
  const { avatarConfigs, selectedProductIds, selectedFaceIds } = state
  const [selectedIdx, setSelectedIdx] = useState(0)

  const availableProducts = CARGO_PRODUCTS
  const faces = FACE_LIBRARY.filter(f => selectedFaceIds.includes(f.id))

  const configs = avatarConfigs.length > 0 ? avatarConfigs : [newAvatar(0)]

  const setConfigs = (next: AvatarConfig[]) => onUpdate({ avatarConfigs: next })

  const current = configs[selectedIdx] ?? configs[0]

  const updateCurrent = (patch: Partial<AvatarConfig>) => {
    setConfigs(configs.map((c, i) => i === selectedIdx ? { ...c, ...patch } : c))
  }

  const addAvatar = () => {
    const next = [...configs, newAvatar(configs.length)]
    setConfigs(next)
    setSelectedIdx(next.length - 1)
  }

  const removeAvatar = (idx: number) => {
    if (configs.length <= 1) return
    const next = configs.filter((_, i) => i !== idx)
    setConfigs(next)
    setSelectedIdx(Math.min(selectedIdx, next.length - 1))
  }

  const addSlot = () => {
    updateCurrent({ outfitSlots: [...current.outfitSlots, { productId: '', selectedImageIndex: 0 }] })
  }

  const updateSlot = (slotIdx: number, patch: Partial<OutfitSlot>) => {
    const slots = current.outfitSlots.map((s, i) => i === slotIdx ? { ...s, ...patch } : s)
    updateCurrent({ outfitSlots: slots })
  }

  const removeSlot = (slotIdx: number) => {
    updateCurrent({ outfitSlots: current.outfitSlots.filter((_, i) => i !== slotIdx) })
  }

  const canNext = configs.every(c => c.faceId !== '' && (c.type === 'brand-ip' || c.outfitSlots.length > 0))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* 说明 */}
      <div style={{ padding: '20px 24px 12px', flexShrink: 0 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 6 }}>商品搭配</div>
        <div style={{ fontSize: 13, color: C.textSec }}>本场共 {CARGO_PRODUCTS.length} 件商品，为需要伴播形象的商品创建搭配。未配形象的商品直播时不展示伴播。</div>
      </div>

      {/* 主体：左列形象列表 + 右列配置 */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', borderTop: `1px solid ${C.border}` }}>
        {/* 左列 */}
        <div style={{
          width: 180, flexShrink: 0, borderRight: `1px solid ${C.border}`,
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          background: '#FAFBFC',
        }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
            {configs.map((c, i) => (
              <div
                key={c.id}
                onClick={() => setSelectedIdx(i)}
                style={{
                  padding: '10px 12px', borderRadius: 8, marginBottom: 6,
                  border: `1.5px solid ${selectedIdx === i ? C.blue : C.border}`,
                  background: selectedIdx === i ? C.blueLight : '#fff',
                  cursor: 'pointer', position: 'relative',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 500, color: selectedIdx === i ? C.blue : C.text, marginBottom: 2 }}>{c.name}</div>
                <div style={{ fontSize: 11, color: C.textSec }}>
                  {c.type === 'brand-ip' ? '品牌IP' : `${c.outfitSlots.length}件商品`}
                </div>
                {configs.length > 1 && (
                  <button
                    onClick={e => { e.stopPropagation(); removeAvatar(i) }}
                    style={{
                      position: 'absolute', top: 4, right: 4,
                      background: 'none', border: 'none', color: C.textTert,
                      cursor: 'pointer', fontSize: 14, padding: 2,
                    }}
                  >×</button>
                )}
              </div>
            ))}
          </div>
          <div style={{ padding: '8px', flexShrink: 0 }}>
            <button
              onClick={addAvatar}
              style={{
                width: '100%', padding: '8px', borderRadius: 8,
                border: `1.5px dashed ${C.blue}`, background: 'transparent',
                color: C.blue, fontSize: 12, cursor: 'pointer', fontFamily: C.font,
              }}
            >+ 新增形象</button>
          </div>
        </div>

        {/* 右列 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {/* 形象名 */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: C.textSec, display: 'block', marginBottom: 4 }}>形象名称</label>
            <input
              value={current.name}
              onChange={e => updateCurrent({ name: e.target.value })}
              style={{
                width: '100%', height: 36, padding: '0 10px', borderRadius: 8,
                border: `1px solid ${C.border}`, fontSize: 13,
                fontFamily: C.font, outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          {/* 形象类型 */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: C.textSec, display: 'block', marginBottom: 8 }}>形象类型</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {([['product', '商品绑定形象', '绑定到具体商品，主播讲解时切换'],
                 ['brand-ip', '品牌IP形象', '无商品绑定，展示在整场直播']] as const).map(([val, label, desc]) => (
                <div
                  key={val}
                  onClick={() => updateCurrent({ type: val })}
                  style={{
                    flex: 1, padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                    border: `1.5px solid ${current.type === val ? C.blue : C.border}`,
                    background: current.type === val ? C.blueLight : '#fff',
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: current.type === val ? C.blue : C.text, marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 11, color: C.textSec }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 面容选择 */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: C.textSec, display: 'block', marginBottom: 8 }}>选择面容</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {faces.map(f => (
                <div
                  key={f.id}
                  onClick={() => updateCurrent({ faceId: f.id })}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 12px', borderRadius: 20, cursor: 'pointer',
                    border: `1.5px solid ${current.faceId === f.id ? C.blue : C.border}`,
                    background: current.faceId === f.id ? C.blueLight : '#fff',
                  }}
                >
                  <span style={{ fontSize: 18 }}>{f.emoji}</span>
                  <span style={{ fontSize: 12, fontWeight: current.faceId === f.id ? 600 : 400, color: current.faceId === f.id ? C.blue : C.text }}>{f.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 商品组合（仅商品绑定类型） */}
          {current.type === 'product' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontSize: 12, color: C.textSec }}>商品组合</label>
                <button
                  onClick={addSlot}
                  style={{
                    padding: '4px 12px', borderRadius: 6, border: `1px solid ${C.blue}`,
                    background: C.blueLight, color: C.blue, fontSize: 12, cursor: 'pointer', fontFamily: C.font,
                  }}
                >+ 添加商品</button>
              </div>

              {current.outfitSlots.length === 0 && (
                <div style={{
                  padding: '20px', borderRadius: 8, border: `1.5px dashed ${C.border}`,
                  textAlign: 'center', color: C.textTert, fontSize: 13,
                }}>点击"添加商品"关联商品</div>
              )}

              {current.outfitSlots.map((slot, si) => {
                const prod = availableProducts.find(p => p.id === slot.productId)
                return (
                  <div key={si} style={{
                    padding: '12px', borderRadius: 8, border: `1px solid ${C.border}`,
                    marginBottom: 8, background: '#FAFBFC',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <select
                        value={slot.productId}
                        onChange={e => updateSlot(si, { productId: e.target.value, selectedImageIndex: 0 })}
                        style={{
                          flex: 1, height: 34, padding: '0 8px', borderRadius: 6,
                          border: `1px solid ${C.border}`, fontSize: 12, fontFamily: C.font, outline: 'none',
                          marginRight: 8,
                        }}
                      >
                        <option value="">请选择商品</option>
                        {availableProducts.map(p => (
                          <option key={p.id} value={p.id}>{p.linkNum}号 {p.name}</option>
                        ))}
                      </select>
                      <button onClick={() => removeSlot(si)} style={{
                        background: 'none', border: 'none', color: C.textTert, cursor: 'pointer', fontSize: 16,
                      }}>×</button>
                    </div>

                    {prod && (
                      <div>
                        <div style={{ fontSize: 11, color: C.textSec, marginBottom: 6 }}>参考图选择：</div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {prod.images.map((imgName, ii) => (
                            <div
                              key={ii}
                              onClick={() => updateSlot(si, { selectedImageIndex: ii })}
                              style={{
                                padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
                                border: `1.5px solid ${slot.selectedImageIndex === ii ? C.blue : C.border}`,
                                background: slot.selectedImageIndex === ii ? C.blueLight : '#fff',
                                fontSize: 11,
                                color: slot.selectedImageIndex === ii ? C.blue : C.text,
                              }}
                            >
                              {ii === 0 ? `⭐ ${imgName}` : imgName}
                            </div>
                          ))}
                          <div
                            onClick={() => alert('演示模式：本地上传功能不可用')}
                            style={{
                              padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
                              border: `1px dashed ${C.border}`,
                              fontSize: 11, color: C.textTert,
                            }}
                          >📁 本地上传</div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* 底部 */}
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
          onClick={() => { onUpdate({ avatarConfigs: configs }); onNext() }}
          disabled={!canNext}
          style={{
            padding: '10px 32px', borderRadius: 8, border: 'none',
            background: canNext ? C.blue : C.border,
            color: '#fff', fontSize: 14, fontWeight: 600,
            cursor: canNext ? 'pointer' : 'not-allowed', fontFamily: C.font,
          }}
        >确认搭配，下一步 →</button>
      </div>
    </div>
  )
}
