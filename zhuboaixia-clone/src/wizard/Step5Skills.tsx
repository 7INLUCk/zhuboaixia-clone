// src/wizard/Step5Skills.tsx
import React, { useState, useRef } from 'react'
import { C } from '../shared'
import { SKILL_DEFS, ACTION_LIBRARY, ACTION_PREVIEW_COLORS, CLIP_COLORS, generateMaterials, FACE_LIBRARY } from './mockData'
import type { WizardState, AvatarConfig, MaterialClip } from './types'

const PORTRAIT_COLORS = ['#FFD0E8', '#B3D4FF', '#C8F0D0', '#FFE0B0', '#D0E0FF', '#FFD4F0']

type Props = {
  state: WizardState
  onUpdate: (patch: Partial<WizardState>) => void
  onNext: () => void
  onPrev: () => void
  generatingIds: Set<string>
  setGeneratingIds: React.Dispatch<React.SetStateAction<Set<string>>>
}

type OpCounts = Record<string, number>

function getOpsLimit(skillId: string): number {
  const skill = SKILL_DEFS.find(s => s.id === skillId)!
  if (skill.fixedClips) return Infinity
  if (skill.clipCount === 'none') return 0
  return (skill.clipCount as number) * 2
}

export default function Step5Skills({ state, onUpdate, onNext, onPrev, generatingIds, setGeneratingIds }: Props) {
  const { avatarConfigs } = state
  const avatarConfigsRef = useRef(avatarConfigs)
  avatarConfigsRef.current = avatarConfigs

  const validAvatarConfigs = avatarConfigs.filter(c => c.mode === 'ip' || c.portraitStatus === 'confirmed')
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [editingSkillsFor, setEditingSkillsFor] = useState<string | null>(null)
  const [showNextConfirm, setShowNextConfirm] = useState(false)
  const [swapPopup, setSwapPopup] = useState<{ avatarId: string; skillId: string; clipIdx: number } | null>(null)
  const [pendingSwapActionId, setPendingSwapActionId] = useState<string | null>(null)
  const [retryingKey, setRetryingKey] = useState<string | null>(null)
  const [opCounts, setOpCounts] = useState<OpCounts>({})

  const current = validAvatarConfigs[selectedIdx] ?? validAvatarConfigs[0]
  const currentGenerating = current && generatingIds.has(current.id)

  const opKey = (avatarId: string, skillId: string) => `${avatarId}__${skillId}`
  const getOpsUsed = (avatarId: string, skillId: string) => opCounts[opKey(avatarId, skillId)] ?? 0
  const canOperate = (avatarId: string, skillId: string) => getOpsUsed(avatarId, skillId) < getOpsLimit(skillId)
  const opsRemaining = (avatarId: string, skillId: string) => {
    const limit = getOpsLimit(skillId)
    if (limit === Infinity) return null
    return Math.max(0, limit - getOpsUsed(avatarId, skillId))
  }

  // 新增了但还没有素材的技能
  const newSkillsToGenerate = current?.materialsDone
    ? SKILL_DEFS
        .filter(s => s.clipCount !== 'none' && current?.selectedSkillIds.includes(s.id))
        .filter(s => !(current?.materials?.[s.id]?.length > 0))
        .map(s => s.id)
    : []
  const showUpdateGenerate = editingSkillsFor === current?.id && newSkillsToGenerate.length > 0

  const skillsExpanded = !current?.materialsDone || editingSkillsFor === current?.id

  const updateAvatar = (id: string, patch: Partial<AvatarConfig>) => {
    onUpdate({
      avatarConfigs: avatarConfigsRef.current.map(c => c.id === id ? { ...c, ...patch } : c)
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

  // 全量生成（3秒 loading）
  const startGenerate = (avatarId: string) => {
    setGeneratingIds(prev => new Set(prev).add(avatarId))
    setEditingSkillsFor(null)
    const avatar = avatarConfigsRef.current.find(c => c.id === avatarId)!
    const skills = avatar.selectedSkillIds
    setTimeout(() => {
      const newMaterials: Record<string, MaterialClip[]> = {}
      skills.forEach(skillId => { newMaterials[skillId] = generateMaterials(skillId) })
      updateAvatar(avatarId, { materials: newMaterials, materialsDone: true, reviewStatus: 'unsubmitted' })
      setGeneratingIds(prev => { const s = new Set(prev); s.delete(avatarId); return s })
    }, 3000)
  }

  // 仅生成新增技能（3秒 loading，保留已有素材）
  const startGenerateNew = (avatarId: string, skillIds: string[]) => {
    setGeneratingIds(prev => new Set(prev).add(avatarId))
    setEditingSkillsFor(null)
    setTimeout(() => {
      const avatar = avatarConfigsRef.current.find(c => c.id === avatarId)!
      const addedMaterials: Record<string, MaterialClip[]> = {}
      skillIds.forEach(skillId => { addedMaterials[skillId] = generateMaterials(skillId) })
      updateAvatar(avatarId, { materials: { ...avatar.materials, ...addedMaterials }, reviewStatus: 'unsubmitted' })
      setGeneratingIds(prev => { const s = new Set(prev); s.delete(avatarId); return s })
    }, 3000)
  }

  const generateAll = () => {
    validAvatarConfigs
      .filter(c => !c.materialsDone && !generatingIds.has(c.id))
      .forEach(c => startGenerate(c.id))
  }

  // 重试：同动作重新渲染，3秒 loading，mock 换色
  const retryClip = (avatarId: string, skillId: string, clipIdx: number) => {
    const key = `${avatarId}__${skillId}__${clipIdx}`
    setRetryingKey(key)
    setTimeout(() => {
      const avatar = avatarConfigsRef.current.find(c => c.id === avatarId)!
      const clip = avatar.materials[skillId][clipIdx]
      const curIdx = CLIP_COLORS.indexOf(clip.color)
      const newColor = CLIP_COLORS[(curIdx + 1 + Math.floor(Math.random() * (CLIP_COLORS.length - 1))) % CLIP_COLORS.length]
      const clips = avatar.materials[skillId].map((c, i) => i === clipIdx ? { ...c, color: newColor } : c)
      const freshAvatar = avatarConfigsRef.current.find(c => c.id === avatarId)!
      updateAvatar(avatarId, { materials: { ...freshAvatar.materials, [skillId]: clips } })
      const skillDef = SKILL_DEFS.find(s => s.id === skillId)!
      if (!skillDef.fixedClips) {
        const ok = opKey(avatarId, skillId)
        setOpCounts(prev => ({ ...prev, [ok]: (prev[ok] ?? 0) + 1 }))
      }
      setRetryingKey(null)
    }, 3000)
  }

  // 换动作（swap）
  const swapClip = (avatarId: string, skillId: string, clipIdx: number, newActionId: string) => {
    const avatar = avatarConfigsRef.current.find(c => c.id === avatarId)!
    const action = ACTION_LIBRARY.find(a => a.id === newActionId)!
    const clips = avatar.materials[skillId].map((clip, i) =>
      i === clipIdx ? { ...clip, actionId: newActionId, actionName: action.name, duration: action.duration } : clip
    )
    updateAvatar(avatarId, { materials: { ...avatar.materials, [skillId]: clips } })
    const ok = opKey(avatarId, skillId)
    setOpCounts(prev => ({ ...prev, [ok]: (prev[ok] ?? 0) + 1 }))
    setSwapPopup(null)
    setPendingSwapActionId(null)
  }

  const closeSwapPopup = () => { setSwapPopup(null); setPendingSwapActionId(null) }

  const allDone = validAvatarConfigs.every(c => c.materialsDone)
  const pendingCount = validAvatarConfigs.filter(c => !c.materialsDone && !generatingIds.has(c.id)).length
  const isGeneratingAny = generatingIds.size > 0
  const notDoneCount = validAvatarConfigs.filter(c => !c.materialsDone).length

  const handleNext = () => {
    if (allDone) { onNext(); return }
    setShowNextConfirm(true)
  }

  const stripState: 'pending' | 'generating' | 'done' | 'editing' =
    currentGenerating ? 'generating'
    : current?.materialsDone && editingSkillsFor === current?.id ? 'editing'
    : current?.materialsDone ? 'done'
    : 'pending'

  // 渲染素材卡（统一 4-col 网格）
  const renderClipSection = (avatarId: string, skillId: string, clips: MaterialClip[], fixedClips: boolean) => {
    const gridCols = 4
    const canOp = canOperate(avatarId, skillId)
    const remaining = opsRemaining(avatarId, skillId)
    return (
      <>
        {remaining !== null && (
          <div style={{ fontSize: 11, color: remaining > 0 ? C.textSec : C.orange, marginBottom: 6 }}>
            {remaining > 0 ? `还剩 ${remaining} 次操作（换动作 + 重试合计）` : '⚠️ 已达操作上限'}
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${gridCols}, 1fr)`, gap: 6 }}>
          {clips.map((clip, ci) => {
            const retKey = `${avatarId}__${skillId}__${ci}`
            const isRetrying = retryingKey === retKey
            const disabledOp = !canOp || isRetrying
            return (
              <div key={clip.id} style={{ borderRadius: 8, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                <div style={{
                  width: '100%', aspectRatio: '1 / 1',
                  background: isRetrying ? '#F0F0F0' : clip.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: isRetrying ? 20 : 11,
                  color: isRetrying ? C.textTert : 'rgba(0,0,0,0.4)', fontWeight: 500,
                  transition: 'background 0.3s',
                }}>{isRetrying ? '⏳' : `🎬 ${clip.duration}s`}</div>
                <div style={{ padding: '4px 6px' }}>
                  <div style={{ fontSize: 11, fontWeight: 500, color: C.text, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {isRetrying ? '重新生成中...' : clip.actionName}
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {!fixedClips && (
                      <button
                        onClick={() => !disabledOp && setSwapPopup({ avatarId, skillId, clipIdx: ci })}
                        disabled={disabledOp}
                        style={{
                          flex: 1, padding: '3px 0', borderRadius: 4,
                          border: `1px solid ${disabledOp ? '#E0E0E0' : C.border}`,
                          background: '#fff', color: disabledOp ? C.textTert : C.blue,
                          fontSize: 10, cursor: disabledOp ? 'not-allowed' : 'pointer', fontFamily: C.font,
                        }}
                      >换动作</button>
                    )}
                    <button
                      onClick={() => !disabledOp && retryClip(avatarId, skillId, ci)}
                      disabled={disabledOp}
                      style={{
                        flex: 1, padding: '3px 0', borderRadius: 4,
                        border: `1px solid ${disabledOp ? '#E0E0E0' : C.border}`,
                        background: '#fff', color: disabledOp ? C.textTert : C.textSec,
                        fontSize: 10, cursor: disabledOp ? 'not-allowed' : 'pointer', fontFamily: C.font,
                      }}
                    >{isRetrying ? '...' : '↺ 重试'}</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px 12px', flexShrink: 0 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 6 }}>技能配置</div>
        <div style={{ fontSize: 13, color: C.textSec, marginBottom: 10 }}>为每个伴播形象选择技能，系统将自动生成对应的动作素材。</div>
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
          width: 172, flexShrink: 0, borderRight: `1px solid ${C.border}`,
          overflowY: 'auto', padding: '8px', background: '#FAFBFC',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.textSec, padding: '4px 6px 8px', letterSpacing: '0.02em' }}>
            伴播形象（{validAvatarConfigs.length}个）
          </div>
          {validAvatarConfigs.map((c, i) => {
            const active = selectedIdx === i
            const face = FACE_LIBRARY.find(f => f.id === c.faceId)
            const faceEmoji = face?.emoji ?? '👤'
            const appliedRound = c.portraitRounds.find(r => r.id === c.portraitAppliedRoundId)
            const portraitBg = PORTRAIT_COLORS[(appliedRound?.colorIdx ?? i) % PORTRAIT_COLORS.length]
            const isGen = generatingIds.has(c.id)
            const statusDotColor = c.materialsDone ? C.green : isGen ? C.blue : '#C0C4CC'
            const statusText = c.materialsDone ? '已完成' : isGen ? '生成中' : '待生成'
            return (
              <div key={c.id} onClick={() => setSelectedIdx(i)} style={{
                padding: '10px 8px', borderRadius: 8, marginBottom: 6, cursor: 'pointer',
                border: `1.5px solid ${active ? C.blue : C.border}`,
                background: active ? C.blueLight : '#fff',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              }}>
                <div style={{
                  width: 44, height: 56, borderRadius: 8,
                  background: `linear-gradient(160deg, ${portraitBg}, ${portraitBg}88)`,
                  border: `1.5px solid ${active ? C.blue : 'rgba(0,0,0,0.08)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                }}>{faceEmoji}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: active ? C.blue : C.text, textAlign: 'center', lineHeight: 1.4, wordBreak: 'break-all' }}>
                  {c.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: statusDotColor, flexShrink: 0 }} />
                  <span style={{ fontSize: 10, color: c.materialsDone ? C.green : isGen ? C.blue : C.textTert, fontWeight: c.materialsDone ? 600 : 400 }}>
                    {statusText}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* 右列 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* action strip */}
          <div style={{
            flexShrink: 0, padding: '10px 16px',
            borderBottom: `1px solid ${C.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: stripState === 'done' ? '#F0FDF4' : stripState === 'generating' ? '#EFF4FF' : '#fff',
          }}>
            <div style={{ fontSize: 13, color: C.textSec }}>
              {stripState === 'generating' && <span style={{ color: C.blue }}>⏳ 正在生成动作素材...</span>}
              {stripState === 'done' && <span style={{ color: C.green, fontWeight: 600 }}>✓ 素材已就绪</span>}
              {(stripState === 'pending' || stripState === 'editing') && (
                <span>已选 <strong style={{ color: C.text }}>{current?.selectedSkillIds.length ?? 0}</strong> 个技能</span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {stripState === 'done' && (
                <button onClick={() => setEditingSkillsFor(current.id)} style={{
                  padding: '5px 10px', borderRadius: 6,
                  border: `1px solid ${C.border}`, background: '#fff',
                  color: C.textSec, fontSize: 12, cursor: 'pointer', fontFamily: C.font,
                }}>编辑技能 ↓</button>
              )}
              {stripState === 'editing' && showUpdateGenerate && (
                <button onClick={() => startGenerateNew(current.id, newSkillsToGenerate)} style={{
                  padding: '6px 16px', borderRadius: 6, border: 'none',
                  background: C.blue, color: '#fff', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', fontFamily: C.font,
                }}>✓ 更新生成（{newSkillsToGenerate.length} 个新技能）</button>
              )}
              {stripState === 'editing' && !showUpdateGenerate && (
                <button onClick={() => setEditingSkillsFor(null)} style={{
                  padding: '5px 12px', borderRadius: 6,
                  border: `1px solid ${C.border}`, background: '#fff',
                  color: C.textSec, fontSize: 12, cursor: 'pointer', fontFamily: C.font,
                }}>收起 ↑</button>
              )}
              {stripState === 'pending' && (
                <button onClick={() => startGenerate(current.id)} style={{
                  padding: '6px 16px', borderRadius: 6, border: 'none',
                  background: C.blue, color: '#fff', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', fontFamily: C.font,
                }}>🎬 开始生成</button>
              )}
            </div>
          </div>

          {/* 滚动内容 */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
            {/* 技能区 */}
            <div style={{ marginBottom: 16 }}>
              {skillsExpanded ? (
                <>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 10 }}>技能列表</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {SKILL_DEFS.map(skill => {
                      const selected = current?.selectedSkillIds.includes(skill.id)
                      return (
                        <div key={skill.id} onClick={() => toggleSkill(skill.id)} style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '8px 12px', borderRadius: 8,
                          cursor: skill.required ? 'default' : 'pointer',
                          border: `1px solid ${selected ? C.blue : C.border}`,
                          background: selected ? C.blueLight : '#fff',
                        }}>
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
                            <span style={{
                              marginLeft: 6, fontSize: 10, padding: '1px 5px', borderRadius: 4,
                              background: skill.required ? '#FFF3E0' : '#F0F4FF',
                              color: skill.required ? C.orange : C.blue,
                            }}>{skill.required ? '必选' : '可选'}</span>
                            <div style={{ fontSize: 11, color: C.textSec, marginTop: 1 }}>{skill.description}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              ) : (
                <div style={{
                  padding: '10px 12px', borderRadius: 8,
                  border: `1px solid ${C.border}`, background: '#FAFBFC',
                  display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
                }}>
                  <span style={{ fontSize: 11, color: C.textSec, flexShrink: 0 }}>已选技能：</span>
                  {SKILL_DEFS.filter(s => current?.selectedSkillIds.includes(s.id)).map(skill => (
                    <span key={skill.id} style={{
                      padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 500,
                      background: C.blueLight, color: C.blue,
                    }}>✓ {skill.name}</span>
                  ))}
                </div>
              )}
            </div>

            {/* 素材区 */}
            {current?.materialsDone && (
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 10 }}>动作素材</div>
                {SKILL_DEFS.map(skill => {
                  if (!current.selectedSkillIds.includes(skill.id)) return null
                  const clips = current.materials[skill.id] ?? []
                  return (
                    <div key={skill.id} style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 8 }}>
                        {skill.name}
                        {skill.clipCount !== 'none' && clips.length > 0 && (
                          <span style={{ fontSize: 11, fontWeight: 400, color: C.textSec, marginLeft: 6 }}>
                            ({clips.length}条)
                          </span>
                        )}
                      </div>
                      {skill.clipCount === 'none' && (
                        <div style={{
                          padding: '10px 14px', borderRadius: 8,
                          background: '#F0FDF4', border: `1px solid ${C.green}40`,
                          display: 'flex', alignItems: 'center', gap: 8,
                        }}>
                          <span style={{ color: C.green, fontSize: 14 }}>✓</span>
                          <span style={{ fontSize: 12, color: C.textSec }}>自动复用进/出场动作，无需额外素材</span>
                        </div>
                      )}
                      {skill.clipCount !== 'none' && clips.length > 0 &&
                        renderClipSection(current.id, skill.id, clips, skill.fixedClips ?? false)}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 未完成素材确认弹窗 */}
      {showNextConfirm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setShowNextConfirm(false)}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
          <div style={{
            position: 'relative', zIndex: 1, width: 360, background: '#fff',
            borderRadius: 12, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 20px 16px' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 8 }}>还有形象素材未完成</div>
              <div style={{ fontSize: 13, color: C.textSec, lineHeight: 1.7 }}>
                还有 <strong style={{ color: C.orange }}>{notDoneCount} 个形象</strong>的素材尚未生成，这些形象在开播时将不会出现。
              </div>
            </div>
            <div style={{ padding: '12px 20px 20px', display: 'flex', gap: 10 }}>
              <button onClick={() => setShowNextConfirm(false)} style={{
                flex: 1, padding: '10px 0', borderRadius: 8,
                border: `1px solid ${C.border}`, background: '#fff',
                color: C.text, fontSize: 14, cursor: 'pointer', fontFamily: C.font,
              }}>返回生成</button>
              <button onClick={() => { setShowNextConfirm(false); onNext() }} style={{
                flex: 1, padding: '10px 0', borderRadius: 8, border: 'none',
                background: C.orange, color: '#fff',
                fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: C.font,
              }}>继续提交</button>
            </div>
          </div>
        </div>
      )}

      {/* 换动作弹窗：全量展示，已选用排前，pending 确认 */}
      {swapPopup && (() => {
        const avatar = avatarConfigsRef.current.find(c => c.id === swapPopup.avatarId)!
        const allUsedIds = (avatar.materials[swapPopup.skillId] ?? []).map(c => c.actionId)
        const currentActionId = allUsedIds[swapPopup.clipIdx]
        const usedByOthers = allUsedIds.filter((_, i) => i !== swapPopup.clipIdx)
        const pendingAction = ACTION_LIBRARY.find(a => a.id === pendingSwapActionId)

        // Sort: current first, used-by-others, available last
        const sortedActions = [
          ...ACTION_LIBRARY.filter(a => a.id === currentActionId),
          ...ACTION_LIBRARY.filter(a => usedByOthers.includes(a.id)),
          ...ACTION_LIBRARY.filter(a => !allUsedIds.includes(a.id)),
        ]
        const usedCount = allUsedIds.length

        return (
          <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={closeSwapPopup}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
            <div style={{
              position: 'relative', zIndex: 1, width: 480, background: '#fff',
              borderRadius: 12, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              maxHeight: '80vh', display: 'flex', flexDirection: 'column',
            }} onClick={e => e.stopPropagation()}>
              {/* 标题 */}
              <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', flexShrink: 0 }}>
                <div>
                  <span style={{ fontWeight: 600, color: C.text }}>选择替换动作</span>
                  <span style={{ fontSize: 11, color: C.textSec, marginLeft: 8 }}>已选用 {usedCount}/20 个</span>
                </div>
                <button onClick={closeSwapPopup} style={{ background: 'none', border: 'none', color: C.textSec, cursor: 'pointer', fontSize: 18 }}>×</button>
              </div>

              {/* 动作网格 */}
              <div style={{ overflowY: 'auto', padding: '12px', flex: 1 }}>
                {/* 已选用区 */}
                <div style={{ fontSize: 11, fontWeight: 600, color: C.textSec, marginBottom: 8 }}>
                  已选用（{usedCount} 个）
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
                  {sortedActions.filter(a => allUsedIds.includes(a.id)).map((action, ai) => {
                    const isCurrent = action.id === currentActionId
                    const previewColor = ACTION_PREVIEW_COLORS[ACTION_LIBRARY.findIndex(a => a.id === action.id) % ACTION_PREVIEW_COLORS.length]
                    return (
                      <div key={action.id} style={{
                        borderRadius: 8, overflow: 'hidden',
                        border: `2px solid ${isCurrent ? C.blue : C.border}`,
                        background: isCurrent ? C.blueLight : '#F8F8F8',
                        opacity: 0.6,
                      }}>
                        <div style={{ width: '100%', aspectRatio: '1 / 1', background: previewColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🎬</div>
                        <div style={{ padding: '5px 7px' }}>
                          <div style={{ fontSize: 11, fontWeight: 500, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{action.name}</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                            <span style={{ fontSize: 10, color: C.textSec }}>{action.duration}s</span>
                            <span style={{ fontSize: 9, padding: '1px 4px', borderRadius: 4, background: isCurrent ? C.blueLight : '#ECECEC', color: isCurrent ? C.blue : C.textTert }}>
                              {isCurrent ? '当前' : '已选用'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* 可替换区 */}
                <div style={{ fontSize: 11, fontWeight: 600, color: C.textSec, marginBottom: 8 }}>
                  可替换（{20 - usedCount} 个）
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {sortedActions.filter(a => !allUsedIds.includes(a.id)).map((action) => {
                    const isPending = pendingSwapActionId === action.id
                    const previewColor = ACTION_PREVIEW_COLORS[ACTION_LIBRARY.findIndex(a => a.id === action.id) % ACTION_PREVIEW_COLORS.length]
                    return (
                      <div key={action.id}
                        onClick={() => setPendingSwapActionId(isPending ? null : action.id)}
                        style={{
                          borderRadius: 8, overflow: 'hidden', cursor: 'pointer',
                          border: `2px solid ${isPending ? C.orange : C.border}`,
                          background: isPending ? '#FFF8F0' : '#fff',
                          transition: 'border-color 0.15s, background 0.15s',
                        }}
                        onMouseEnter={e => { if (!isPending) { e.currentTarget.style.borderColor = C.blue; e.currentTarget.style.background = C.blueLight } }}
                        onMouseLeave={e => { if (!isPending) { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = '#fff' } }}
                      >
                        <div style={{ width: '100%', aspectRatio: '1 / 1', background: previewColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🎬</div>
                        <div style={{ padding: '5px 7px' }}>
                          <div style={{ fontSize: 11, fontWeight: 500, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{action.name}</div>
                          <div style={{ fontSize: 10, color: C.textSec, marginTop: 2 }}>{action.duration}s</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* 确认 bar（选中后出现） */}
              {pendingSwapActionId && (
                <div style={{
                  flexShrink: 0, padding: '12px 16px',
                  borderTop: `1px solid ${C.border}`,
                  background: '#FFF8F0',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <div style={{ flex: 1, fontSize: 13, color: C.text }}>
                    换成 <strong>「{pendingAction?.name}」</strong>（{pendingAction?.duration}s）？
                  </div>
                  <button onClick={() => setPendingSwapActionId(null)} style={{
                    padding: '7px 14px', borderRadius: 7,
                    border: `1px solid ${C.border}`, background: '#fff',
                    color: C.textSec, fontSize: 13, cursor: 'pointer', fontFamily: C.font,
                  }}>取消</button>
                  <button
                    onClick={() => swapClip(swapPopup.avatarId, swapPopup.skillId, swapPopup.clipIdx, pendingSwapActionId)}
                    style={{
                      padding: '7px 20px', borderRadius: 7, border: 'none',
                      background: C.orange, color: '#fff',
                      fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: C.font,
                    }}>确认替换</button>
                </div>
              )}
            </div>
          </div>
        )
      })()}

      {/* 底部 */}
      <div style={{
        padding: '14px 24px', borderTop: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, gap: 12,
      }}>
        <button onClick={onPrev} style={{
          padding: '10px 24px', borderRadius: 8, border: `1px solid ${C.border}`,
          background: '#fff', color: C.text, fontSize: 14, cursor: 'pointer', fontFamily: C.font,
        }}>← 上一步</button>
        {!allDone && (
          <button onClick={generateAll} disabled={isGeneratingAny && pendingCount === 0} style={{
            padding: '10px 20px', borderRadius: 8, border: 'none',
            background: isGeneratingAny ? C.border : C.orange,
            color: '#fff', fontSize: 14, fontWeight: 600,
            cursor: isGeneratingAny ? 'not-allowed' : 'pointer', fontFamily: C.font,
            flex: 1, maxWidth: 260,
          }}>
            {isGeneratingAny ? `⏳ 生成中（${generatingIds.size} 个）...` : `⚡ 全部生成（${pendingCount} 个待生成）`}
          </button>
        )}
        <button onClick={handleNext} style={{
          padding: '10px 32px', borderRadius: 8, border: 'none',
          background: allDone ? C.blue : C.orange,
          color: '#fff', fontSize: 14, fontWeight: 600,
          cursor: 'pointer', fontFamily: C.font,
        }}>{allDone ? '提交审核 →' : `继续（${notDoneCount} 个未生成）→`}</button>
      </div>
    </div>
  )
}
