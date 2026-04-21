// src/BanboSetupWizard.tsx
import React, { useState } from 'react'
import { C } from './shared'
import type { WizardState, WizardResult } from './wizard/types'
import { CARGO_PRODUCTS } from './wizard/mockData'
import Step2Face from './wizard/Step2Face'
import Step3Outfit from './wizard/Step3Outfit'
import Step4Portrait from './wizard/Step4Portrait'
import Step5Skills from './wizard/Step5Skills'
import Step6Submit from './wizard/Step6Submit'

type Props = { onComplete: (result: WizardResult) => void }

const STEPS = [
  { num: 1, label: '面容选择' },
  { num: 2, label: '商品搭配' },
  { num: 3, label: '定装照' },
  { num: 4, label: '技能配置' },
  { num: 5, label: '提交开播' },
]

const initState: WizardState = {
  selectedProductIds: CARGO_PRODUCTS.map(p => p.id),
  selectedFaceIds: [],
  avatarConfigs: [],
}

export default function BanboSetupWizard({ onComplete }: Props) {
  const [step, setStep] = useState(1)
  const [state, setState] = useState<WizardState>(initState)

  const update = (patch: Partial<WizardState>) =>
    setState(prev => ({ ...prev, ...patch }))

  const next = () => setStep(s => Math.min(s + 1, 5))
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
        <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginRight: 24, flexShrink: 0 }}>
          🦐 伴播形象配置
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
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
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
                  }}>{s.label}</div>
                </div>
              </React.Fragment>
            )
          })}
        </div>
      </div>

      {/* 步骤内容 */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {step === 1 && <Step2Face state={state} onUpdate={update} onNext={next} onPrev={prev} />}
        {step === 2 && <Step3Outfit state={state} onUpdate={update} onNext={next} onPrev={prev} />}
        {step === 3 && <Step4Portrait state={state} onUpdate={update} onNext={next} onPrev={prev} />}
        {step === 4 && <Step5Skills state={state} onUpdate={update} onNext={next} onPrev={prev} />}
        {step === 5 && <Step6Submit state={state} onComplete={onComplete} onPrev={prev} />}
      </div>
    </div>
  )
}
