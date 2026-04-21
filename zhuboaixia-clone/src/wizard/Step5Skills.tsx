// src/wizard/Step5Skills.tsx
import React, { useState } from 'react'
import { C } from '../shared'
import { SKILL_DEFS, ACTION_LIBRARY, generateMaterials } from './mockData'
import type { WizardState, AvatarConfig, MaterialClip } from './types'

type Props = {
  state: WizardState
  onUpdate: (patch: Partial<WizardState>) => void
  onNext: () => void
  onPrev: () => void
}

export default function Step5Skills({ state, onUpdate, onNext, onPrev }: Props) {
  const { avatarConfigs } = state
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [generating, setGenerating] = useState<string | null>(null) // avatarId
  const [swapPopup, setSwapPopup] = useState<{ avatarId: string; skillId: string; clipIdx: number } | null>(null)

  const current = avatarConfigs[selectedIdx] ?? avatarConfigs[0]

  const updateAvatar = (id: string, patch: Partial<AvatarConfig>) => {
    onUpdate({
      avatarConfigs: avatarConfigs.map(c => c.id === id ? { ...c, ...patch } : c)
    })
  }

  const toggleSkill = (skillId: string) => {
    const def = SKILL_DEFS.find(s => s.id === skillId)!
    if (def.required) return
    const has = current.selectedSkillIds.includes(skillId)
    updateAvatar(current.id, {
      selectedSkillIds: has
        ? current.selectedSkillIds.filter(s => s !== skillId)
        : [...current.selectedSkillIds, skillId]
    })
  }

  const startGenerate = (avatarId: string) => {
    setGenerating(avatarId)
    const avatar = avatarConfigs.find(c => c.id === avatarId)!
    const skills = avatar.selectedSkillIds

    // 逐技能模拟生成，每个间隔 600ms
    let delay = 400
    const newMaterials: Record<string, MaterialClip[]> = {}

    skills.forEach(skillId => {
      setTimeout(() => {
        newMaterials[skillId] = generateMaterials(skillId)
        if (Object.keys(newMaterials).length === skills.length) {
          updateAvatar(avatarId, { materials: newMaterials, materialsDone: true })
          setGenerating(null)
        }
      }, delay)
      delay += 600
    })
  }

  const swapClip = (avatarId: string, skillId: string, clipIdx: number, newActionId: string) => {
    const avatar = avatarConfigs.find(c => c.id === avatarId)!
    const action = ACTION_LIBRARY.find(a => a.id === newActionId)!
    const clips = avatar.materials[skillId].map((clip, i) =>
      i === clipIdx ? { ...clip, actionId: newActionId, actionName: action.name, duration: action.duration } : clip
    )
    updateAvatar(avatarId, { materials: { ...avatar.materials, [skillId]: clips } })
    setSwapPopup(null)
  }

  const allDone = avatarConfigs.every(c => c.materialsDone)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px 12px', flexShrink: 0 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 6 }}>技能配置 & 素材生成</div>
        <div style={{ fontSize: 13, color: C.textSec, marginBottom: 10 }}>为每个形象选择技能，并批量生成对应的动作素材。</div>
        <div style={{
          padding: '8px 12px', borderRadius: 8,
          background: '#EFF4FF', border: `1px solid ${C.blue}20`,
          fontSize: 12, color: '#1D4ED8', lineHeight: 1.6,
        }}>
          💡 <strong>这步的作用：</strong>技能决定形象在直播中会做什么——进场亮相、跟随商品换装、展示商品细节。选的技能越多，形象越生动。
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', borderTop: `1px solid ${C.border}` }}>
        {/* 左列：形象列表 */}
        <div style={{
          width: 160, flexShrink: 0, borderRight: `1px solid ${C.border}`,
          overflowY: 'auto', padding: '8px', background: '#FAFBFC',
        }}>
          {avatarConfigs.map((c, i) => (
            <div
              key={c.id}
              onClick={() => setSelectedIdx(i)}
              style={{
                padding: '10px 10px', borderRadius: 8, marginBottom: 6, cursor: 'pointer',
                border: `1.5px solid ${selectedIdx === i ? C.blue : C.border}`,
                background: selectedIdx === i ? C.blueLight : '#fff',
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 500, color: selectedIdx === i ? C.blue : C.text }}>{c.name}</div>
              <div style={{ fontSize: 10, color: C.textSec, marginTop: 2 }}>
                {c.materialsDone ? '✅ 已完成' : generating === c.id ? '⏳ 生成中' : '待生成'}
              </div>
            </div>
          ))}
        </div>

        {/* 右列 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {/* 技能选择 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 10 }}>选择技能</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {SKILL_DEFS.map(skill => {
                const selected = current.selectedSkillIds.includes(skill.id)
                return (
                  <div
                    key={skill.id}
                    onClick={() => toggleSkill(skill.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 12px', borderRadius: 8, cursor: skill.required ? 'default' : 'pointer',
                      border: `1px solid ${selected ? C.blue : C.border}`,
                      background: selected ? C.blueLight : '#fff',
                    }}
                  >
                    <div style={{
                      width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                      border: `2px solid ${selected ? C.blue : C.border}`,
                      background: selected ? C.blue : '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {selected && <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>✓</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{skill.name}</span>
                      {skill.required && (
                        <span style={{
                          marginLeft: 6, fontSize: 10, padding: '1px 5px', borderRadius: 4,
                          background: '#FFF3E0', color: C.orange,
                        }}>必选</span>
                      )}
                      <div style={{ fontSize: 11, color: C.textSec, marginTop: 1 }}>{skill.description}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 生成素材 */}
          {!current.materialsDone && generating !== current.id && (
            <button
              onClick={() => startGenerate(current.id)}
              style={{
                width: '100%', padding: '12px', borderRadius: 8, border: 'none',
                background: C.blue, color: '#fff', fontSize: 14, fontWeight: 600,
                cursor: 'pointer', fontFamily: C.font, marginBottom: 16,
              }}
            >🎬 开始生成素材</button>
          )}

          {generating === current.id && (
            <div style={{
              padding: '12px 16px', borderRadius: 8, background: '#EFF4FF',
              border: `1px solid ${C.blue}20`, marginBottom: 16, textAlign: 'center',
              fontSize: 13, color: C.blue,
            }}>⏳ 正在批量生成动作素材，请稍候...</div>
          )}

          {/* 素材列表 */}
          {current.materialsDone && Object.entries(current.materials).map(([skillId, clips]) => {
            const skillDef = SKILL_DEFS.find(s => s.id === skillId)!
            return (
              <div key={skillId} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 8 }}>
                  {skillDef.name}
                  <span style={{ fontSize: 11, fontWeight: 400, color: C.textSec, marginLeft: 6 }}>
                    ({clips.length}条素材)
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                  {clips.map((clip, ci) => (
                    <div key={clip.id} style={{
                      borderRadius: 8, border: `1px solid ${C.border}`, overflow: 'hidden',
                    }}>
                      {/* 视频 mock */}
                      <div style={{
                        height: 60, background: clip.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, color: 'rgba(0,0,0,0.4)', fontWeight: 500,
                      }}>🎬 {clip.duration}s</div>
                      <div style={{ padding: '4px 6px' }}>
                        <div style={{ fontSize: 11, fontWeight: 500, color: C.text, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{clip.actionName}</div>
                        <button
                          onClick={() => setSwapPopup({ avatarId: current.id, skillId, clipIdx: ci })}
                          style={{
                            width: '100%', padding: '3px 0', borderRadius: 4,
                            border: `1px solid ${C.border}`, background: '#fff',
                            color: C.blue, fontSize: 10, cursor: 'pointer', fontFamily: C.font,
                          }}
                        >换动作</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 换动作弹窗 */}
      {swapPopup && (() => {
        const avatar = avatarConfigs.find(c => c.id === swapPopup.avatarId)!
        const usedActionIds = avatar.materials[swapPopup.skillId]?.map(c => c.actionId) ?? []
        const available = ACTION_LIBRARY.filter(a => !usedActionIds.includes(a.id))
        return (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 500,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }} onClick={() => setSwapPopup(null)}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
            <div style={{
              position: 'relative', zIndex: 1, width: 360, background: '#fff',
              borderRadius: 12, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            }} onClick={e => e.stopPropagation()}>
              <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, color: C.text }}>选择替换动作</span>
                <button onClick={() => setSwapPopup(null)} style={{ background: 'none', border: 'none', color: C.textSec, cursor: 'pointer', fontSize: 18 }}>×</button>
              </div>
              <div style={{ maxHeight: 320, overflowY: 'auto', padding: '8px' }}>
                {available.map(action => (
                  <div
                    key={action.id}
                    onClick={() => swapClip(swapPopup.avatarId, swapPopup.skillId, swapPopup.clipIdx, action.id)}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                      border: `1px solid transparent`, marginBottom: 4,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = C.blueLight)}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span style={{ fontSize: 13, color: C.text }}>{action.name}</span>
                    <span style={{ fontSize: 11, color: C.textSec }}>{action.duration}s</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      })()}

      {/* 底部 */}
      <div style={{
        padding: '16px 24px', borderTop: `1px solid ${C.border}`,
        display: 'flex', justifyContent: 'space-between', flexShrink: 0,
      }}>
        <button onClick={onPrev} style={{
          padding: '10px 24px', borderRadius: 8, border: `1px solid ${C.border}`,
          background: '#fff', color: C.text, fontSize: 14, cursor: 'pointer', fontFamily: C.font,
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
        >提交审核 →</button>
      </div>
    </div>
  )
}
