import { TabBar, PanelKey } from './shared'
import React, { useState } from 'react'

type Props = { onClose: () => void; onSwitchPanel?: (p: PanelKey) => void; onConfirmConfig?: () => void }

const C = {
  blue: '#3370FF', blueLight: 'rgba(51,112,255,0.08)',
  orange: '#FF7D00', orangeLight: 'rgba(255,125,0,0.08)',
  green: '#00B42A', greenLight: 'rgba(0,180,42,0.08)',
  red: '#F53F3F',
  bg: '#F7F8FA', card: '#FFFFFF',
  text: '#1D2129', textSec: '#86909C', textTert: '#C9CDD4',
  border: '#E5E6EB',
  font: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif',
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div onClick={() => onChange(!checked)} style={{
      width: 40, height: 22, borderRadius: 11, background: checked ? C.blue : '#C9CDD4',
      padding: 2, cursor: 'pointer', transition: 'background 0.2s',
      display: 'flex', alignItems: 'center', justifyContent: checked ? 'flex-end' : 'flex-start',
    }}>
      <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }} />
    </div>
  )
}

// 模拟：当前形象（假设选了"小小"）及其造型+动作（实际从上游读取）
const CURRENT_AVATAR = '小小'
const AVATAR_OUTFITS = [
  {
    id: 'o1', name: '春日裙装',
    actions: [
      { id: 'a1', name: '跳舞', icon: '💃' },
      { id: 'a2', name: '作揖', icon: '🙇' },
      { id: 'a3', name: '欢迎', icon: '👋' },
    ],
  },
  {
    id: 'o2', name: '休闲衬衫',
    actions: [
      { id: 'a4', name: '转身', icon: '🔄' },
      { id: 'a5', name: '鼓掌', icon: '👏' },
    ],
  },
]

type FixedChat = {
  id: string
  trigger: string
  response: string
  outfitId: string | null
  actionId: string | null
}

const TABS = [
  { key: 'avatar' as const, label: '🎭 伴播形象' },
  { key: 'voice' as const, label: '🔊 伴播音色' },
  { key: 'voiceSwitch' as const, label: '🎙 声控互动' },
  { key: 'autoChat' as const, label: '💬 智能搭话' },
            { key: 'sceneLayout' as const, label: '🎬 画面布局' },]

export default function AutoChatPanel({ onClose, onSwitchPanel, onConfirmConfig }: Props) {
  const [enabled, setEnabled] = useState(true)
  const [specialNote, setSpecialNote] = useState('')
  const [frequency, setFrequency] = useState<'high' | 'mid' | 'low'>('high')
  // 固定搭话
  const [fixedChatEnabled, setFixedChatEnabled] = useState(false)
  const [fixedChats, setFixedChats] = useState<FixedChat[]>([
    { id: 'f1', trigger: '库存没有了', response: '没有了哦', outfitId: null, actionId: null },
    { id: 'f2', trigger: '全场保价，退换货，倒数54321', response: '主播身上这件黑色羽绒服，白鹅绒填充！', outfitId: 'o1', actionId: 'a3' },
  ])
  const [editingId, setEditingId] = useState<string | null>(null)

  const addFixedChat = () => {
    const newId = `f${Date.now()}`
    setFixedChats(prev => [...prev, { id: newId, trigger: '', response: '', outfitId: null, actionId: null }])
    setEditingId(newId)
  }

  const removeFixedChat = (id: string) => setFixedChats(prev => prev.filter(c => c.id !== id))

  const updateFixedChat = (id: string, field: string, value: any) => {
    setFixedChats(prev => prev.map(c => {
      if (c.id !== id) return c
      const updated = { ...c, [field]: value }
      if (field === 'outfitId') updated.actionId = null
      return updated
    }))
  }

  const canSave = (chat: FixedChat) => chat.trigger.trim() !== '' && chat.response.trim() !== ''

  const getOutfitActions = (outfitId: string | null) => {
    if (!outfitId) return []
    return AVATAR_OUTFITS.find(o => o.id === outfitId)?.actions || []
  }

  const getOutfitName = (id: string | null) => id ? AVATAR_OUTFITS.find(o => o.id === id)?.name || '' : ''
  const getActionInfo = (outfitId: string | null, actionId: string | null) => {
    if (!outfitId || !actionId) return null
    return getOutfitActions(outfitId).find(a => a.id === actionId)
  }

  const freqConfig: Record<string, { label: string; desc: string }> = {
    high: { label: '高频搭话', desc: '节奏快、互动强（默认）' },
    mid: { label: '中频搭话', desc: '讲解为主，互动适中' },
    low: { label: '低频搭话', desc: '种草型，节奏慢' },
  }

  return (
    <div style={{
      position: 'absolute', top: 36, right: 0, bottom: 0, width: 520,
      zIndex: 102, overflow: 'hidden', borderRadius: '8px 0 0 0',
      boxShadow: '-2px 0 16px rgba(0,0,0,0.15)', fontFamily: C.font,
      display: 'flex', flexDirection: 'column', background: C.bg,
    }}>
      {/* ===== 顶栏标题 + 关闭 ===== */}
      <div style={{
        padding: '10px 16px', background: C.card, display: 'flex',
        alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
      }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: C.text }}>💬 智能搭话</span>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', fontSize: 18, color: C.textSec,
          cursor: 'pointer', padding: 4,
        }}>x</button>
      </div>
      {onSwitchPanel && <TabBar active="autoChat" onSwitch={onSwitchPanel} />}



      {/* ===== 内容区 ===== */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>

        {/* ---- 功能开关 ---- */}
        <div style={{
          padding: '14px 16px', background: C.card, borderRadius: 10,
          border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: 14,
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 2 }}>💬 智能搭话</div>
            <div style={{ fontSize: 12, color: C.textSec }}>伴播 AI 自动识别主播话术，实时搭话互动，提升直播间氛围</div>
          </div>
          <Toggle checked={enabled} onChange={setEnabled} />
        </div>

        {enabled && (
          <>
            {/* ---- 覆盖场景（内置） ---- */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8 }}>
                覆盖场景<span style={{ fontSize: 11, fontWeight: 400, color: C.textSec, marginLeft: 6 }}>（自动生效）</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{
                  flex: 1, padding: '10px 14px', borderRadius: 8,
                  border: `1.5px solid ${C.blue}`, background: C.blueLight,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 14 }}>🛍</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.blue }}>带货场景</span>
                    <span style={{ marginLeft: 'auto', fontSize: 10, padding: '2px 6px', borderRadius: 4, background: `${C.blue}15`, color: C.blue }}>始终开启</span>
                  </div>
                  <div style={{ fontSize: 11, color: C.textSec }}>主播说「版型显瘦」→ 伴播「对的！」</div>
                </div>
                <div style={{
                  flex: 1, padding: '10px 14px', borderRadius: 8,
                  border: `1.5px solid ${C.green}`, background: C.greenLight,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 14 }}>🎮</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.green }}>互动场景</span>
                    <span style={{ marginLeft: 'auto', fontSize: 10, padding: '2px 6px', borderRadius: 4, background: `${C.green}15`, color: C.green }}>始终开启</span>
                  </div>
                  <div style={{ fontSize: 11, color: C.textSec }}>主播问「好不好看？」→ 伴播「好看！」</div>
                </div>
              </div>
            </div>

            {/* ---- 特别交代 ---- */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>
                特别交代<span style={{ fontSize: 11, fontWeight: 400, color: C.textSec, marginLeft: 6 }}>（AI 自学习）</span>
              </div>
              <textarea value={specialNote} onChange={e => setSpecialNote(e.target.value)}
                placeholder="例：主播强调面料用的是定制棉，凉感透气，伴播要顺着回应…"
                style={{
                  width: '100%', height: 56, padding: '10px 12px', borderRadius: 8,
                  border: `1px solid ${C.border}`, fontSize: 12, fontFamily: C.font,
                  resize: 'none', outline: 'none', boxSizing: 'border-box', lineHeight: 1.5,
                }} />
            </div>

            {/* ---- 搭话频率 ---- */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8 }}>搭话频率</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {Object.entries(freqConfig).map(([key, cfg]) => (
                  <button key={key} onClick={() => setFrequency(key as typeof frequency)} style={{
                    flex: 1, padding: '10px 8px', borderRadius: 8,
                    border: frequency === key ? `1.5px solid ${C.blue}` : `1px solid ${C.border}`,
                    background: frequency === key ? C.blueLight : C.card,
                    cursor: 'pointer', fontFamily: C.font, textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: frequency === key ? C.blue : C.text, marginBottom: 2 }}>{cfg.label}</div>
                    <div style={{ fontSize: 10, color: C.textSec }}>{cfg.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* ---- 输出通道 ---- */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8 }}>输出方式</div>
              <div style={{
                padding: '10px 14px', borderRadius: 8,
                border: `1.5px solid ${C.green}`, background: C.greenLight,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 16 }}>🔊</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.green }}>TTS 语音</span>
                  <span style={{ marginLeft: 'auto', fontSize: 10, padding: '2px 6px', borderRadius: 4, background: `${C.green}15`, color: C.green }}>默认开启</span>
                </div>
                <div style={{ fontSize: 11, color: C.textSec, marginTop: 4 }}>伴播用音色库的声音说出搭话内容</div>
              </div>
            </div>

            {/* ---- 固定搭话 ---- */}
            <div style={{ marginBottom: 14 }}>
              <div style={{
                padding: '12px 14px', background: C.card, borderRadius: 10,
                border: `1px solid ${C.border}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: fixedChatEnabled ? 10 : 0 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>
                      🎯 固定搭话<span style={{ fontSize: 10, fontWeight: 400, color: C.textTert, marginLeft: 4 }}>可选</span>
                    </div>
                    <div style={{ fontSize: 11, color: C.textSec, marginTop: 2 }}>
                      关键词 → 回复话术 + 造型切换（上限30组）
                    </div>
                  </div>
                  <Toggle checked={fixedChatEnabled} onChange={setFixedChatEnabled} />
                </div>

                {fixedChatEnabled && (
                  <>
                    <button onClick={addFixedChat} style={{
                      width: '100%', padding: '8px', borderRadius: 8,
                      border: `1.5px dashed ${C.border}`, background: 'transparent',
                      color: C.blue, fontSize: 12, cursor: 'pointer', fontFamily: C.font,
                      marginBottom: 8,
                    }}>+ 新增固定搭话</button>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {fixedChats.map(chat => {
                        const actions = getOutfitActions(chat.outfitId)
                        return (
                          <div key={chat.id} style={{
                            padding: '10px 12px', borderRadius: 8,
                            border: `1px solid ${C.border}`, background: '#FAFAFA',
                          }}>
                            {editingId === chat.id ? (
                              <>
                                {/* 触发词 */}
                                <div style={{ fontSize: 10, color: C.textTert, marginBottom: 4 }}>触发词</div>
                                <input value={chat.trigger} onChange={e => updateFixedChat(chat.id, 'trigger', e.target.value)}
                                  placeholder="例：库存没有了"
                                  style={{
                                    width: '100%', height: 28, padding: '0 8px', borderRadius: 6,
                                    border: `1px solid ${chat.trigger.trim() ? C.border : C.red}`,
                                    fontSize: 12, fontFamily: C.font, outline: 'none', boxSizing: 'border-box', marginBottom: 6,
                                  }} />
                                {/* 回复内容 */}
                                <div style={{ fontSize: 10, color: C.textTert, marginBottom: 4 }}>回复内容</div>
                                <input value={chat.response} onChange={e => updateFixedChat(chat.id, 'response', e.target.value)}
                                  placeholder="例：没有了哦"
                                  style={{
                                    width: '100%', height: 28, padding: '0 8px', borderRadius: 6,
                                    border: `1px solid ${chat.response.trim() ? C.border : C.red}`,
                                    fontSize: 12, fontFamily: C.font, outline: 'none', boxSizing: 'border-box', marginBottom: 6,
                                  }} />

                                {/* 造型选择 */}
                                <div style={{ fontSize: 10, color: C.textTert, marginBottom: 4 }}>切换造型</div>
                                <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                                  <button onClick={() => updateFixedChat(chat.id, 'outfitId', null)} style={{
                                    padding: '4px 10px', borderRadius: 6,
                                    border: chat.outfitId === null ? `1px solid ${C.blue}` : `1px solid ${C.border}`,
                                    background: chat.outfitId === null ? C.blueLight : C.card,
                                    color: chat.outfitId === null ? C.blue : C.textSec,
                                    fontSize: 11, cursor: 'pointer', fontFamily: C.font,
                                  }}>不切换</button>
                                  {AVATAR_OUTFITS.map(o => (
                                    <button key={o.id} onClick={() => updateFixedChat(chat.id, 'outfitId', o.id)} style={{
                                      padding: '4px 10px', borderRadius: 6,
                                      border: chat.outfitId === o.id ? `1px solid ${C.orange}` : `1px solid ${C.border}`,
                                      background: chat.outfitId === o.id ? C.orangeLight : C.card,
                                      color: chat.outfitId === o.id ? C.orange : C.textSec,
                                      fontSize: 11, cursor: 'pointer', fontFamily: C.font,
                                    }}>{o.name}</button>
                                  ))}
                                </div>

                                {/* 动作选择（选造型后显示） */}
                                {chat.outfitId && (
                                  <>
                                    <div style={{ fontSize: 10, color: C.textTert, marginBottom: 4 }}>
                                      配合动作（不选 = 默认姿态）
                                    </div>
                                    <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                                      <button onClick={() => updateFixedChat(chat.id, 'actionId', null)} style={{
                                        padding: '4px 10px', borderRadius: 6,
                                        border: chat.actionId === null ? `1px solid ${C.blue}` : `1px solid ${C.border}`,
                                        background: chat.actionId === null ? C.blueLight : C.card,
                                        color: chat.actionId === null ? C.blue : C.textSec,
                                        fontSize: 11, cursor: 'pointer', fontFamily: C.font,
                                      }}>默认姿态</button>
                                      {actions.map(a => (
                                        <button key={a.id} onClick={() => updateFixedChat(chat.id, 'actionId', a.id)} style={{
                                          padding: '4px 10px', borderRadius: 6,
                                          border: chat.actionId === a.id ? `1px solid ${C.green}` : `1px solid ${C.border}`,
                                          background: chat.actionId === a.id ? C.greenLight : C.card,
                                          color: chat.actionId === a.id ? C.green : C.textSec,
                                          fontSize: 11, cursor: 'pointer', fontFamily: C.font,
                                        }}>{a.icon} {a.name}</button>
                                      ))}
                                    </div>
                                  </>
                                )}

                                {/* 校验 */}
                                {!canSave(chat) && (
                                  <div style={{ fontSize: 10, color: C.red, marginBottom: 4 }}>⚠️ 触发词和回复内容不能为空</div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                  <button onClick={() => { if (canSave(chat)) setEditingId(null) }} style={{
                                    padding: '3px 12px', borderRadius: 4, border: 'none',
                                    background: canSave(chat) ? C.blue : '#E5E6EB',
                                    color: canSave(chat) ? '#fff' : C.textTert,
                                    fontSize: 11, cursor: canSave(chat) ? 'pointer' : 'not-allowed', fontFamily: C.font,
                                  }}>完成</button>
                                </div>
                              </>
                            ) : (
                              /* 展示态 */
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                                    <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, background: '#FFF3E0', color: C.orange, flexShrink: 0 }}>触发</span>
                                    <span style={{ fontSize: 12, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chat.trigger}</span>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: chat.outfitId ? 3 : 0 }}>
                                    <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, background: '#E8F5E9', color: C.green, flexShrink: 0 }}>回复</span>
                                    <span style={{ fontSize: 12, color: C.textSec, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chat.response}</span>
                                  </div>
                                  {chat.outfitId && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                      <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, background: C.orangeLight, color: C.orange, flexShrink: 0 }}>造型</span>
                                      <span style={{ fontSize: 11, color: C.textSec }}>
                                        {getOutfitName(chat.outfitId)}
                                        {chat.actionId && (() => {
                                          const act = getActionInfo(chat.outfitId, chat.actionId)
                                          return act ? <span> · {act.icon} {act.name}</span> : null
                                        })()}
                                        {!chat.actionId && <span style={{ color: C.textTert }}> · 默认姿态</span>}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                                  <button onClick={() => setEditingId(chat.id)} style={{
                                    padding: '2px 8px', borderRadius: 4, border: `1px solid ${C.border}`,
                                    background: C.card, color: C.blue, fontSize: 10, cursor: 'pointer', fontFamily: C.font,
                                  }}>编辑</button>
                                  <button onClick={() => removeFixedChat(chat.id)} style={{
                                    padding: '2px 8px', borderRadius: 4, border: `1px solid ${C.border}`,
                                    background: C.card, color: C.red, fontSize: 10, cursor: 'pointer', fontFamily: C.font,
                                  }}>删除</button>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* ---- 工作流程 ---- */}
            <div style={{
              padding: '14px', borderRadius: 10,
              background: 'linear-gradient(135deg, #F0F5FF 0%, #F7F8FA 100%)',
              border: `1px solid ${C.border}`,
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 8 }}>🔗 搭话流程</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: C.textSec, flexWrap: 'wrap' }}>
                <span style={{ padding: '4px 8px', background: '#fff', borderRadius: 6, border: `1px solid ${C.border}` }}>🎤 主播说话</span>
                <span style={{ color: C.textTert }}>→</span>
                <span style={{ padding: '4px 8px', background: '#fff', borderRadius: 6, border: `1px solid ${C.border}` }}>🧠 AI 理解</span>
                <span style={{ color: C.textTert }}>→</span>
                <span style={{ padding: '4px 8px', background: '#E8F5E9', borderRadius: 6, border: `1px solid #A5D6A7`, color: C.green }}>🔊 TTS 说话</span>
                {(fixedChats.some(c => c.outfitId) && fixedChatEnabled) && (<>
                  <span style={{ color: C.textTert }}>+</span>
                  <span style={{ padding: '4px 8px', background: '#FFF3E0', borderRadius: 6, border: `1px solid #FFCC80`, color: C.orange }}>👗 切造型</span>
                </>)}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ===== 底部 ===== */}
      <div style={{
        padding: '12px 16px', background: C.card, borderTop: `1px solid ${C.border}`,
        display: 'flex', gap: 10, flexShrink: 0,
      }}>
        <button onClick={onClose} style={{
          flex: 1, height: 42, borderRadius: 8, background: 'transparent',
          border: `1px solid ${C.border}`, color: C.textSec, fontSize: 14, cursor: 'pointer', fontFamily: C.font,
        }}>取消</button>
        <button onClick={onConfirmConfig} style={{
          flex: 2, height: 42, borderRadius: 8, background: C.blue, border: 'none',
          color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: C.font,
          boxShadow: '0 2px 8px rgba(51,112,255,0.3)',
        }}>确认配置</button>
      </div>
    </div>
  )
}
