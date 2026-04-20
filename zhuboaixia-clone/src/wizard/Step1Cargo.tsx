// src/wizard/Step1Cargo.tsx
import React from 'react'
import { C } from '../shared'
import { CARGO_PRODUCTS } from './mockData'
import type { WizardState } from './types'

type Props = {
  state: WizardState
  onUpdate: (patch: Partial<WizardState>) => void
  onNext: () => void
}

export default function Step1Cargo({ state, onUpdate, onNext }: Props) {
  const { selectedProductIds } = state
  const allSelected = selectedProductIds.length === CARGO_PRODUCTS.length

  const toggle = (id: string) => {
    if (selectedProductIds.includes(id)) {
      onUpdate({ selectedProductIds: selectedProductIds.filter(x => x !== id) })
    } else {
      onUpdate({ selectedProductIds: [...selectedProductIds, id] })
    }
  }

  const toggleAll = () => {
    if (allSelected) {
      onUpdate({ selectedProductIds: [] })
    } else {
      onUpdate({ selectedProductIds: CARGO_PRODUCTS.map(p => p.id) })
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* 说明区 */}
      <div style={{ padding: '20px 24px 12px', flexShrink: 0 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 6 }}>确认本场货盘</div>
        <div style={{ fontSize: 13, color: C.textSec }}>
          已从直播计划自动同步 {CARGO_PRODUCTS.length} 个商品，请选择哪些商品需要配置伴播形象。
        </div>
      </div>

      {/* 全选行 */}
      <div style={{
        padding: '8px 24px', borderBottom: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
        background: '#FAFBFC',
      }}>
        <div
          onClick={toggleAll}
          style={{
            width: 18, height: 18, borderRadius: 4,
            border: `2px solid ${allSelected ? C.blue : C.border}`,
            background: allSelected ? C.blue : '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0,
          }}
        >
          {allSelected && <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>✓</span>}
        </div>
        <span style={{ fontSize: 13, color: C.text }}>
          全选（已选 {selectedProductIds.length}/{CARGO_PRODUCTS.length}）
        </span>
      </div>

      {/* 商品列表 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 24px' }}>
        {CARGO_PRODUCTS.map(p => {
          const checked = selectedProductIds.includes(p.id)
          return (
            <div
              key={p.id}
              onClick={() => toggle(p.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 14px', borderRadius: 10, marginBottom: 8,
                border: `1.5px solid ${checked ? C.blue : C.border}`,
                background: checked ? C.blueLight : '#fff',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {/* Checkbox */}
              <div style={{
                width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                border: `2px solid ${checked ? C.blue : C.border}`,
                background: checked ? C.blue : '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {checked && <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>✓</span>}
              </div>
              {/* 商品图 */}
              <div style={{
                width: 48, height: 48, borderRadius: 8, flexShrink: 0,
                background: p.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24,
              }}>{p.emoji}</div>
              {/* 信息 */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: C.text, marginBottom: 2 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: C.textSec }}>
                  {p.linkNum}号链接 · {p.price} · {p.images.length}张商品图
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 底部按钮 */}
      <div style={{
        padding: '16px 24px', borderTop: `1px solid ${C.border}`,
        display: 'flex', justifyContent: 'flex-end', flexShrink: 0,
        background: '#fff',
      }}>
        <button
          onClick={onNext}
          disabled={selectedProductIds.length === 0}
          style={{
            padding: '10px 32px', borderRadius: 8, border: 'none',
            background: selectedProductIds.length > 0 ? C.blue : C.border,
            color: '#fff', fontSize: 14, fontWeight: 600,
            cursor: selectedProductIds.length > 0 ? 'pointer' : 'not-allowed',
            fontFamily: C.font,
          }}
        >
          确认货盘，下一步 →
        </button>
      </div>
    </div>
  )
}
