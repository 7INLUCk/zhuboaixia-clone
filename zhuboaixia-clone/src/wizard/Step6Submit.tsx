// src/wizard/Step6Submit.tsx
import React, { useState, useEffect, useRef } from 'react'
import { C } from '../shared'
import type { WizardState, WizardResult, ReviewStatus } from './types'

type Props = {
  state: WizardState
  onComplete: (result: WizardResult) => void
  onPrev: () => void
  generatingIds: Set<string>
}

function ReviewBadge({ status, generating }: { status: ReviewStatus; generating?: boolean }) {
  if (generating) return (
    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: C.blueLight, color: C.blue, fontWeight: 500 }}>
      生成中…
    </span>
  )
  if (status === 'approved') return (
    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: '#E6F9EF', color: C.green, fontWeight: 500 }}>✓ 已通过</span>
  )
  if (status === 'reviewing') return (
    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: C.blueLight, color: C.blue, fontWeight: 500 }}>⏳ 审核中</span>
  )
  return null
}

export default function Step6Submit({ state, onComplete, onPrev, generatingIds }: Props) {
  const [phase, setPhase] = useState<'summary' | 'submitted'>('summary')
  const [submittedCount, setSubmittedCount] = useState(0)
  const submittedStateRef = useRef<WizardState | null>(null)

  const { avatarConfigs } = state
  const validAvatars = avatarConfigs.filter(c => c.mode === 'ip' || c.portraitStatus === 'confirmed')

  const toSubmit = validAvatars.filter(c =>
    c.reviewStatus === 'unsubmitted' && c.materialsDone && !generatingIds.has(c.id)
  )
  const stillGenerating = validAvatars.filter(c => generatingIds.has(c.id))
  const notReady = validAvatars.filter(c =>
    c.reviewStatus === 'unsubmitted' && !c.materialsDone && !generatingIds.has(c.id)
  )
  const alreadySubmitted = validAvatars.filter(c => c.reviewStatus === 'reviewing' || c.reviewStatus === 'approved')

  const buildUpdatedState = (): WizardState => ({
    ...state,
    avatarConfigs: state.avatarConfigs.map(c =>
      c.reviewStatus === 'unsubmitted' && c.materialsDone && !generatingIds.has(c.id)
        ? { ...c, reviewStatus: 'reviewing' as const }
        : c
    ),
  })

  const submit = () => {
    const updated = buildUpdatedState()
    submittedStateRef.current = updated
    setSubmittedCount(toSubmit.length)
    setPhase('submitted')
  }

  const goToConfig = () => {
    onComplete(submittedStateRef.current ?? state)
  }

  useEffect(() => {
    if (phase !== 'submitted') return
    const t = setTimeout(goToConfig, 2000)
    return () => clearTimeout(t)
  }, [phase]) // eslint-disable-line

  const totalSkills = avatarConfigs.reduce((s, c) => s + c.selectedSkillIds.length, 0)
  const totalClips = avatarConfigs.reduce((s, c) =>
    s + Object.values(c.materials).reduce((n, clips) => n + clips.length, 0), 0
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px 12px', flexShrink: 0 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 6 }}>提交审核</div>
        <div style={{ fontSize: 13, color: C.textSec }}>
          动作素材将提交给数字人系统进行处理，预计 30 分钟内完成，期间可继续完成直播配置。
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 16px' }}>

        {/* 提交成功提示 */}
        {phase === 'submitted' && (
          <div style={{
            padding: '14px 16px', borderRadius: 10, marginBottom: 16,
            background: '#E6F9EF', border: `1px solid ${C.green}40`,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', background: C.green, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#fff',
            }}>✓</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.green }}>提交成功</div>
              <div style={{ fontSize: 12, color: C.textSec, marginTop: 2 }}>
                已提交 {submittedCount} 个形象的素材，预计 30 分钟内完成处理，即将跳转至直播配置页…
              </div>
            </div>
          </div>
        )}

        {/* 配置汇总 */}
        <div style={{
          padding: '14px 16px', borderRadius: 10, border: `1px solid ${C.border}`,
          background: '#FAFBFC', marginBottom: 16,
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 10 }}>配置汇总</div>
          <div style={{ display: 'flex', gap: 28 }}>
            {[
              { label: '伴播形象', value: avatarConfigs.length, unit: '个' },
              { label: '已配技能', value: totalSkills, unit: '个' },
              { label: '动作素材', value: totalClips, unit: '条' },
            ].map(item => (
              <div key={item.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 26, fontWeight: 700, color: C.blue }}>{item.value}</div>
                <div style={{ fontSize: 11, color: C.textSec }}>{item.label}（{item.unit}）</div>
              </div>
            ))}
          </div>
        </div>

        {/* 待提交形象 */}
        {toSubmit.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 8 }}>
              待提交（{toSubmit.length} 个）
            </div>
            {toSubmit.map(c => {
              const clipCount = Object.values(c.materials).reduce((s, clips) => s + clips.length, 0)
              return (
                <div key={c.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                  borderRadius: 8, border: `1px solid ${C.orange}40`, background: '#FFFBF4', marginBottom: 6,
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: C.textSec, marginTop: 2 }}>
                      {c.selectedSkillIds.length} 个技能 · {clipCount} 条动作素材
                    </div>
                  </div>
                  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: '#FFF0DC', color: C.orange, fontWeight: 500 }}>
                    待提交
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* 生成中 */}
        {stillGenerating.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 8 }}>
              素材生成中（{stillGenerating.length} 个）
            </div>
            {stillGenerating.map(c => (
              <div key={c.id} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                borderRadius: 8, border: `1px solid ${C.border}`, background: '#fff', marginBottom: 6,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{c.name}</div>
                </div>
                <ReviewBadge status={c.reviewStatus} generating />
              </div>
            ))}
          </div>
        )}

        {/* 素材未就绪 */}
        {notReady.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.textSec, marginBottom: 8 }}>
              素材未就绪（{notReady.length} 个，无法提交）
            </div>
            {notReady.map(c => (
              <div key={c.id} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                borderRadius: 8, border: `1px solid ${C.border}`, background: '#FAFBFC', marginBottom: 6,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: C.textSec }}>{c.name}</div>
                </div>
                <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: '#F3F4F6', color: C.textTert, fontWeight: 500 }}>素材未就绪</span>
              </div>
            ))}
          </div>
        )}

        {/* 已提交 / 已通过 */}
        {alreadySubmitted.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 8 }}>
              已提交（{alreadySubmitted.length} 个）
            </div>
            {alreadySubmitted.map(c => (
              <div key={c.id} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                borderRadius: 8, border: `1px solid ${C.border}`, background: '#fff', marginBottom: 6,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{c.name}</div>
                </div>
                <ReviewBadge status={c.reviewStatus} />
              </div>
            ))}
          </div>
        )}

      </div>

      {/* 底部按钮 */}
      <div style={{
        padding: '14px 24px', borderTop: `1px solid ${C.border}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0,
      }}>
        <button onClick={onPrev} style={{
          padding: '10px 20px', borderRadius: 8, border: `1px solid ${C.border}`,
          background: '#fff', color: C.text, fontSize: 14, cursor: 'pointer', fontFamily: C.font,
        }}>← 上一步</button>

        {phase === 'summary' ? (
          toSubmit.length > 0 ? (
            <button
              onClick={submit}
              disabled={stillGenerating.length > 0}
              style={{
                padding: '10px 28px', borderRadius: 8, border: 'none',
                background: stillGenerating.length > 0 ? C.border : C.blue,
                color: '#fff', fontSize: 14, fontWeight: 600,
                cursor: stillGenerating.length > 0 ? 'not-allowed' : 'pointer',
                fontFamily: C.font,
              }}
            >
              {stillGenerating.length > 0
                ? `等待生成完成（${stillGenerating.length} 个）`
                : `提交审核（${toSubmit.length} 个形象）`
              }
            </button>
          ) : (
            <button onClick={() => onComplete(state)} style={{
              padding: '10px 28px', borderRadius: 8, border: 'none',
              background: C.green, color: '#fff', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', fontFamily: C.font,
            }}>前往直播配置 →</button>
          )
        ) : (
          <button onClick={goToConfig} style={{
            padding: '10px 28px', borderRadius: 8, border: 'none',
            background: C.green, color: '#fff', fontSize: 14, fontWeight: 600,
            cursor: 'pointer', fontFamily: C.font,
          }}>前往直播配置 →</button>
        )}
      </div>
    </div>
  )
}
