// src/wizard/Step2Face.tsx
import React, { useState } from 'react'
import { C } from '../shared'
import { FACE_LIBRARY } from './mockData'
import type { WizardState } from './types'

type Props = {
  state: WizardState
  onUpdate: (patch: Partial<WizardState>) => void
  onNext: () => void
  onPrev: () => void
}

export default function Step2Face({ state, onUpdate, onNext, onPrev }: Props) {
  const { selectedFaceIds } = state
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all')
  const [ageFilter, setAgeFilter] = useState<'all' | '3-6' | '7-12'>('all')

  const filtered = FACE_LIBRARY.filter(f => {
    if (genderFilter !== 'all' && f.gender !== genderFilter) return false
    if (ageFilter !== 'all' && f.ageGroup !== ageFilter) return false
    return true
  })

  const toggle = (id: string) => {
    if (selectedFaceIds.includes(id)) {
      onUpdate({ selectedFaceIds: selectedFaceIds.filter(x => x !== id) })
    } else if (selectedFaceIds.length < 2) {
      onUpdate({ selectedFaceIds: [...selectedFaceIds, id] })
    } else {
      // 超过2个：替换最早选的
      onUpdate({ selectedFaceIds: [selectedFaceIds[1], id] })
    }
  }

  const FilterBtn = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      style={{
        padding: '5px 14px', borderRadius: 16, border: 'none', fontSize: 12,
        fontWeight: active ? 600 : 400,
        background: active ? C.blue : '#F2F3F5',
        color: active ? '#fff' : C.textSec,
        cursor: 'pointer', fontFamily: C.font,
      }}
    >{label}</button>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* 说明 */}
      <div style={{ padding: '20px 24px 12px', flexShrink: 0 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 6 }}>选择面容</div>
        <div style={{ fontSize: 13, color: C.textSec, marginBottom: 10 }}>
          从公共面容库中选择 1-2 个面容，后续所有伴播形象均基于所选面容生成。
        </div>
        <div style={{
          padding: '8px 12px', borderRadius: 8,
          background: '#EFF4FF', border: `1px solid ${C.blue}20`,
          fontSize: 12, color: '#1D4ED8', lineHeight: 1.6,
        }}>
          💡 <strong>这步的作用：</strong>选好之后，AI 数字人将以这个外形出现在你的直播间——观众看到的就是她。
        </div>
      </div>

      {/* 筛选栏 */}
      <div style={{
        padding: '8px 24px 12px', flexShrink: 0,
        display: 'flex', gap: 16, alignItems: 'center',
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <FilterBtn label="全部" active={genderFilter === 'all'} onClick={() => setGenderFilter('all')} />
          <FilterBtn label="女" active={genderFilter === 'female'} onClick={() => setGenderFilter('female')} />
          <FilterBtn label="男" active={genderFilter === 'male'} onClick={() => setGenderFilter('male')} />
        </div>
        <div style={{ width: 1, height: 20, background: C.border }} />
        <div style={{ display: 'flex', gap: 6 }}>
          <FilterBtn label="全部年龄" active={ageFilter === 'all'} onClick={() => setAgeFilter('all')} />
          <FilterBtn label="3-6岁" active={ageFilter === '3-6'} onClick={() => setAgeFilter('3-6')} />
          <FilterBtn label="7-12岁" active={ageFilter === '7-12'} onClick={() => setAgeFilter('7-12')} />
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 12, color: C.textSec }}>
          已选 {selectedFaceIds.length}/2
        </div>
      </div>

      {/* 面容网格 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12,
        }}>
          {filtered.map(face => {
            const selected = selectedFaceIds.includes(face.id)
            const idx = selectedFaceIds.indexOf(face.id)
            return (
              <div
                key={face.id}
                onClick={() => toggle(face.id)}
                style={{
                  borderRadius: 12, border: `2px solid ${selected ? C.blue : C.border}`,
                  background: selected ? C.blueLight : '#fff',
                  padding: '14px 8px', textAlign: 'center', cursor: 'pointer',
                  position: 'relative', transition: 'all 0.15s',
                }}
              >
                {/* 选中序号角标 */}
                {selected && (
                  <div style={{
                    position: 'absolute', top: 6, right: 6,
                    width: 20, height: 20, borderRadius: '50%',
                    background: C.blue, color: '#fff', fontSize: 11, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{idx + 1}</div>
                )}
                {/* 面容图 mock */}
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: face.color, margin: '0 auto 8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 32, border: `2px solid rgba(0,0,0,0.06)`,
                }}>{face.emoji}</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 4 }}>{face.name}</div>
                <div style={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: 10, padding: '1px 6px', borderRadius: 8,
                    background: face.gender === 'female' ? '#FFE8F0' : '#E8F0FF',
                    color: face.gender === 'female' ? '#FF4D8D' : '#3370FF',
                  }}>{face.gender === 'female' ? '女' : '男'}</span>
                  <span style={{
                    fontSize: 10, padding: '1px 6px', borderRadius: 8,
                    background: '#F2F3F5', color: C.textSec,
                  }}>{face.ageGroup}岁</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 已选面容预览 */}
      {selectedFaceIds.length > 0 && (
        <div style={{
          padding: '10px 24px', borderTop: `1px solid ${C.border}`,
          background: '#FAFBFC', display: 'flex', gap: 12, alignItems: 'center', flexShrink: 0,
        }}>
          <span style={{ fontSize: 12, color: C.textSec }}>已选：</span>
          {selectedFaceIds.map(id => {
            const f = FACE_LIBRARY.find(x => x.id === id)!
            return (
              <div key={id} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '4px 10px', borderRadius: 20, background: f.color + '40',
                border: `1px solid ${f.color}`,
              }}>
                <span style={{ fontSize: 16 }}>{f.emoji}</span>
                <span style={{ fontSize: 12, fontWeight: 500, color: C.text }}>{f.name}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* 底部按钮 */}
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
          disabled={selectedFaceIds.length === 0}
          style={{
            padding: '10px 32px', borderRadius: 8, border: 'none',
            background: selectedFaceIds.length > 0 ? C.blue : C.border,
            color: '#fff', fontSize: 14, fontWeight: 600,
            cursor: selectedFaceIds.length > 0 ? 'pointer' : 'not-allowed', fontFamily: C.font,
          }}
        >确认面容，下一步 →</button>
      </div>
    </div>
  )
}
