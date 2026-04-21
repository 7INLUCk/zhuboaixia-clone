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

  const filtered = FACE_LIBRARY.filter(f => {
    if (genderFilter !== 'all' && f.gender !== genderFilter) return false
    return true
  })

  const toggle = (id: string) => {
    const face = FACE_LIBRARY.find(f => f.id === id)!
    if (selectedFaceIds.includes(id)) {
      // 取消选中
      onUpdate({ selectedFaceIds: selectedFaceIds.filter(x => x !== id) })
    } else {
      // 同性别已有选中：替换，不允许两个同性别
      const sameGenderId = selectedFaceIds.find(sid =>
        FACE_LIBRARY.find(f => f.id === sid)?.gender === face.gender
      )
      if (sameGenderId) {
        onUpdate({ selectedFaceIds: selectedFaceIds.map(sid => sid === sameGenderId ? id : sid) })
      } else {
        onUpdate({ selectedFaceIds: [...selectedFaceIds, id] })
      }
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
          从面容库中最多选 2 个面容，后续所有伴播形象均基于所选面容生成。
        </div>
        <div style={{
          padding: '8px 12px', borderRadius: 8,
          background: '#EFF4FF', border: `1px solid ${C.blue}20`,
          fontSize: 12, color: '#1D4ED8', lineHeight: 1.6,
        }}>
          💡 <strong>建议各选一个男性和女性面容。</strong>主播讲男款商品时出男形象，讲女款时出女形象——一男一女覆盖所有品类受众，配置一次长期生效。
        </div>
      </div>

      {/* 筛选栏 */}
      <div style={{
        padding: '8px 24px 12px', flexShrink: 0,
        display: 'flex', gap: 8, alignItems: 'center',
        borderBottom: `1px solid ${C.border}`,
      }}>
        <FilterBtn label="全部" active={genderFilter === 'all'} onClick={() => setGenderFilter('all')} />
        <FilterBtn label="女性" active={genderFilter === 'female'} onClick={() => setGenderFilter('female')} />
        <FilterBtn label="男性" active={genderFilter === 'male'} onClick={() => setGenderFilter('male')} />
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

        {/* 其他来源入口 */}
        <div style={{
          marginTop: 16, paddingTop: 14,
          borderTop: `1px dashed ${C.border}`,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{ fontSize: 11, color: C.textTert }}>没有合适的？</span>
          <button
            onClick={() => alert('功能开发中，敬请期待')}
            style={{
              background: 'none', border: 'none', padding: '2px 8px',
              borderRadius: 6, fontSize: 11, color: C.blue,
              cursor: 'pointer', fontFamily: C.font,
            }}
          >📁 上传参考图</button>
          <span style={{ fontSize: 11, color: C.border }}>·</span>
          <button
            onClick={() => alert('功能开发中，敬请期待')}
            style={{
              background: 'none', border: 'none', padding: '2px 8px',
              borderRadius: 6, fontSize: 11, color: C.textTert,
              cursor: 'pointer', fontFamily: C.font,
            }}
          >✨ AI 定制（即将开放）</button>
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
            const genderLabel = f.gender === 'female' ? '女性形象' : '男性形象'
            const genderColor = f.gender === 'female' ? '#FF4D8D' : '#3370FF'
            return (
              <div key={id} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '4px 10px', borderRadius: 20, background: f.color + '40',
                border: `1px solid ${f.color}`,
              }}>
                <span style={{ fontSize: 16 }}>{f.emoji}</span>
                <span style={{ fontSize: 12, fontWeight: 500, color: C.text }}>{f.name}</span>
                <span style={{ fontSize: 10, color: genderColor, fontWeight: 600 }}>· {genderLabel}</span>
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
