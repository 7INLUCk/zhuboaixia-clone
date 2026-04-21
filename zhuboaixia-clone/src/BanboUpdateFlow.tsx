// src/BanboUpdateFlow.tsx
// 货盘更新轻量向导：Step1（仅新增/变更商品）→ Step2（形象生成）→ Step3（素材生成）→ 完成
import React, { useState } from 'react'
import { C } from './shared'
import { CARGO_PRODUCTS } from './wizard/mockData'
import Step1Cargo from './wizard/Step1Cargo'
import Step3AvatarGen from './wizard/Step3AvatarGen'
import Step5Skills from './wizard/Step5Skills'
import type { WizardState, WizardResult } from './wizard/types'

type Props = {
  wizardResult: WizardResult
  onComplete: (result: WizardResult) => void
  onCancel: () => void
}

type UpdateStep = 1 | 2 | 3

const STEPS: { step: UpdateStep; label: string }[] = [
  { step: 1, label: '货盘变更' },
  { step: 2, label: '形象生成' },
  { step: 3, label: '素材生成' },
]

// mock：模拟新增了2个商品（p5, p6 是"新品"）
const MOCK_NEW_PRODUCT_IDS = ['p5', 'p6']

export default function BanboUpdateFlow({ wizardResult, onComplete, onCancel }: Props) {
  const [currentStep, setCurrentStep] = useState<UpdateStep>(1)
  const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set())
  const [state, setState] = useState<WizardState>({
    ...wizardResult,
    // 预选已有商品 + 新品
    selectedProductIds: wizardResult.selectedProductIds,
  })

  const updateState = (patch: Partial<WizardState>) => {
    setState(prev => ({ ...prev, ...patch }))
  }

  const goTo = (step: UpdateStep) => setCurrentStep(step)


  const stepIndex = STEPS.findIndex(s => s.step === currentStep)

  return (
    <div style={{
      width: '100%', height: '100%', background: '#fff',
      display: 'flex', flexDirection: 'column', fontFamily: C.font,
    }}>
      {/* 顶栏 */}
      <div style={{
        flexShrink: 0,
        padding: '12px 20px',
        borderBottom: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>货盘更新</div>
          <div style={{ fontSize: 11, color: C.textSec, marginTop: 2 }}>检测到货盘变更，请更新形象搭配</div>
        </div>
        <button
          onClick={onCancel}
          style={{
            padding: '5px 12px', borderRadius: 6, border: `1px solid ${C.border}`,
            background: '#fff', color: C.textSec, fontSize: 12, cursor: 'pointer', fontFamily: C.font,
          }}
        >暂不更新</button>
      </div>

      {/* 步骤条（精简4步） */}
      <div style={{
        flexShrink: 0, padding: '10px 20px',
        display: 'flex', alignItems: 'center', gap: 0,
        borderBottom: `1px solid ${C.border}`,
        background: '#FAFBFC',
      }}>
        {STEPS.map((s, i) => {
          const done = i < stepIndex
          const active = s.step === currentStep
          return (
            <React.Fragment key={s.step}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', fontSize: 11, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: done ? C.green : active ? C.blue : C.border,
                  color: (done || active) ? '#fff' : C.textSec,
                  marginBottom: 4,
                }}>
                  {done ? '✓' : i + 1}
                </div>
                <div style={{ fontSize: 10, color: active ? C.blue : done ? C.green : C.textSec, fontWeight: active ? 600 : 400 }}>
                  {s.label}
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: 1, background: i < stepIndex ? C.green : C.border, marginBottom: 18 }} />
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* 内容区 */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {currentStep === 1 && (
          <Step1CargoUpdate
            state={state}
            onUpdate={updateState}
            onNext={() => goTo(2)}
            onCancel={onCancel}
            newProductIds={MOCK_NEW_PRODUCT_IDS}
          />
        )}
        {currentStep === 2 && (
          <Step3AvatarGen
            state={state}
            onUpdate={updateState}
            onNext={() => goTo(3)}
            onPrev={() => goTo(1)}
          />
        )}
        {currentStep === 3 && (
          <Step5Skills
            state={state}
            onUpdate={updateState}
            onNext={() => onComplete(state)}
            onPrev={() => goTo(2)}
            generatingIds={generatingIds}
            setGeneratingIds={setGeneratingIds}
          />
        )}
      </div>
    </div>
  )
}

// 货盘更新版 Step1：高亮新品，允许调整选择
function Step1CargoUpdate({
  state, onUpdate, onNext, onCancel, newProductIds,
}: {
  state: WizardState
  onUpdate: (patch: Partial<WizardState>) => void
  onNext: () => void
  onCancel: () => void
  newProductIds: string[]
}) {
  const toggle = (id: string) => {
    const has = state.selectedProductIds.includes(id)
    onUpdate({
      selectedProductIds: has
        ? state.selectedProductIds.filter(p => p !== id)
        : [...state.selectedProductIds, id],
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px 8px', flexShrink: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 4 }}>确认货盘变更</div>
        <div style={{
          padding: '8px 12px', borderRadius: 8, background: '#FFFBE6',
          border: '1px solid #FFD666', fontSize: 12, color: '#875800',
        }}>
          🆕 以下商品为本次新增，请确认是否参与伴播配置
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.textSec, marginBottom: 8 }}>全部商品（{CARGO_PRODUCTS.length}件）</div>
        {CARGO_PRODUCTS.map(p => {
          const selected = state.selectedProductIds.includes(p.id)
          const isNew = newProductIds.includes(p.id)
          return (
            <div
              key={p.id}
              onClick={() => toggle(p.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                borderRadius: 8, cursor: 'pointer', marginBottom: 6,
                border: `1.5px solid ${selected ? C.blue : C.border}`,
                background: selected ? C.blueLight : '#fff',
              }}
            >
              {/* 勾选框 */}
              <div style={{
                width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                border: `2px solid ${selected ? C.blue : C.border}`,
                background: selected ? C.blue : '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {selected && <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>✓</span>}
              </div>
              {/* 图标 */}
              <div style={{
                width: 36, height: 36, borderRadius: 6, flexShrink: 0,
                background: p.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
              }}>{p.emoji}</div>
              {/* 信息 */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>
                  {p.linkNum}号 {p.name}
                </div>
                <div style={{ fontSize: 11, color: C.textSec }}>¥{p.price}</div>
              </div>
              {/* 新品标签 */}
              {isNew && (
                <div style={{
                  padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600,
                  background: '#FFF1F0', color: '#F53F3F', border: '1px solid #FFCCC7',
                }}>NEW</div>
              )}
            </div>
          )
        })}
      </div>

      <div style={{
        padding: '12px 20px', borderTop: `1px solid ${C.border}`,
        display: 'flex', justifyContent: 'space-between', flexShrink: 0,
      }}>
        <button onClick={onCancel} style={{
          padding: '9px 20px', borderRadius: 8, border: `1px solid ${C.border}`,
          background: '#fff', color: C.text, fontSize: 13, cursor: 'pointer', fontFamily: C.font,
        }}>取消</button>
        <button
          onClick={onNext}
          disabled={state.selectedProductIds.length === 0}
          style={{
            padding: '9px 28px', borderRadius: 8, border: 'none',
            background: state.selectedProductIds.length > 0 ? C.blue : C.border,
            color: '#fff', fontSize: 13, fontWeight: 600,
            cursor: state.selectedProductIds.length > 0 ? 'pointer' : 'not-allowed',
            fontFamily: C.font,
          }}
        >下一步 → 调整搭配</button>
      </div>
    </div>
  )
}
