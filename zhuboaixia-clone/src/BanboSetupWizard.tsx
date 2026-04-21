// src/BanboSetupWizard.tsx
import React, { useState } from 'react'
import { C } from './shared'
import type { WizardState, WizardResult } from './wizard/types'
import { CARGO_PRODUCTS } from './wizard/mockData'
import Step2Face from './wizard/Step2Face'
import Step3AvatarGen from './wizard/Step3AvatarGen'
import Step5Skills from './wizard/Step5Skills'
import Step6Submit from './wizard/Step6Submit'

type Props = { onComplete: (result: WizardResult) => void; initialState?: WizardState; editMode?: boolean }

const STEPS = [
  { num: 1, label: '面容选择' },
  { num: 2, label: '形象生成' },
  { num: 3, label: '技能配置' },
  { num: 4, label: '提交审核' },
]

const initState: WizardState = {
  selectedProductIds: CARGO_PRODUCTS.map(p => p.id),
  selectedFaceIds: [],
  faceTypes: {},
  avatarConfigs: [],
}

export default function BanboSetupWizard({ onComplete, initialState, editMode }: Props) {
  const [step, setStep] = useState(1)
  const [state, setState] = useState<WizardState>(initialState ?? initState)
  const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set())

  const update = (patch: Partial<WizardState>) =>
    setState(prev => ({ ...prev, ...patch }))

  const next = () => setStep(s => Math.min(s + 1, 4))
  const prev = () => setStep(s => Math.max(s - 1, 1))

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: '#fff', fontFamily: C.font,
    }}>
      {/* 顶部步骤条 */}
      <div style={{
        padding: '16px 24px', borderBottom: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', gap: 0, flexShrink: 0,
        background: '#FAFBFC',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 24, flexShrink: 0 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>🦐 伴播形象配置</span>
          {editMode && (
            <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: '#FFF0DC', color: C.orange, fontWeight: 600 }}>编辑模式</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          {STEPS.map((s, i) => {
            const done = step > s.num
            const active = step === s.num
            return (
              <React.Fragment key={s.num}>
                {i > 0 && (
                  <div style={{
                    flex: 1, height: 2,
                    background: done ? C.blue : C.border,
                    transition: 'background 0.3s',
                  }} />
                )}
                <div
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, cursor: editMode ? 'pointer' : 'default' }}
                  onClick={editMode ? () => setStep(s.num) : undefined}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: done ? C.blue : active ? C.blue : '#fff',
                    border: `2px solid ${done || active ? C.blue : C.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700,
                    color: done || active ? '#fff' : C.textTert,
                    transition: 'all 0.3s',
                  }}>
                    {done ? '✓' : s.num}
                  </div>
                  <div style={{
                    fontSize: 11, marginTop: 4, fontWeight: active ? 600 : 400,
                    color: active ? C.blue : done ? C.text : C.textTert,
                    whiteSpace: 'nowrap',
                    textDecoration: editMode && !active ? 'underline dotted' : 'none',
                  }}>{s.label}</div>
                </div>
              </React.Fragment>
            )
          })}
        </div>
      </div>

      {/* 生成状态条（后台有素材在跑时显示） */}
      {generatingIds.size > 0 && (
        <div style={{
          padding: '6px 24px', flexShrink: 0,
          background: '#EFF4FF', borderBottom: `1px solid ${C.blue}20`,
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 12, color: C.blue,
        }}>
          <div style={{
            width: 12, height: 12, borderRadius: '50%', flexShrink: 0,
            border: `2px solid ${C.blue}`, borderTopColor: 'transparent',
            animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          素材生成中 · {generatingIds.size} 个形象处理中，完成前可继续配置其他选项
        </div>
      )}

      {/* 步骤内容 */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {step === 1 && <Step2Face state={state} onUpdate={update} onNext={next} onPrev={prev} />}
        {step === 2 && <Step3AvatarGen state={state} onUpdate={update} onNext={next} onPrev={prev} editMode={editMode} />}
        {step === 3 && <Step5Skills state={state} onUpdate={update} onNext={next} onPrev={prev} generatingIds={generatingIds} setGeneratingIds={setGeneratingIds} />}
        {step === 4 && <Step6Submit state={state} onComplete={onComplete} onPrev={prev} generatingIds={generatingIds} />}
      </div>
    </div>
  )
}
