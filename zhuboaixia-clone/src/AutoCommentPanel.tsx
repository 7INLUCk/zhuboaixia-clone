import React, { useState } from 'react'
import { TabBar, C, Toggle, PanelKey } from './shared'

type Props = { onClose: () => void; onSwitchPanel?: (p: PanelKey) => void; onConfirmConfig?: () => void }

// ============ 定时发评规则 ============
type TimedRule = {
  id: string
  enabled: boolean
  interval: number
  content: string
}

// ============ 回评规则 ============
type ReplyRule = {
  id: string
  group: string
  keywords: string[]
  replies: string[]
  replyInterval: number
  delayReply: number
}

// ============ 默认数据 ============
const DEFAULT_TIMED_RULES: TimedRule[] = [
  {
    id: 't1', enabled: false, interval: 120,
    content: '质量您放心，都是严格质检，用料扎实，性价比很高。\n我们主打品质，做工精细，耐用性很好，放心入手。\n性价比超高，回购率很高，老客户都说好！',
  },
]

const DEFAULT_REPLY_RULES: ReplyRule[] = [
  {
    id: 'r1', group: '门店地址',
    keywords: ['门店', '地址', '在哪'],
    replies: ['北京、上海、深圳都有门店，您在哪个城市？'],
    replyInterval: 10, delayReply: 0,
  },
]

export default function AutoCommentPanel({ onClose, onSwitchPanel, onConfirmConfig }: Props) {
  // 定时发评
  const [timedRules, setTimedRules] = useState<TimedRule[]>(DEFAULT_TIMED_RULES)
  // 自动回评
  const [replyEnabled, setReplyEnabled] = useState(false)
  const [replyRules, setReplyRules] = useState<ReplyRule[]>(DEFAULT_REPLY_RULES)
  // 回评弹窗
  const [showReplyModal, setShowReplyModal] = useState(false)
  const [editingReply, setEditingReply] = useState<ReplyRule | null>(null)

  // ===== 定时发评 =====
  const addTimedRule = () => {
    const id = `t${Date.now()}`
    setTimedRules(prev => [...prev, { id, enabled: true, interval: 60, content: '' }])
  }

  const updateTimedRule = (id: string, field: string, value: any) => {
    setTimedRules(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r))
  }

  const removeTimedRule = (id: string) => {
    setTimedRules(prev => prev.filter(r => r.id !== id))
  }

  // ===== 回评 =====
  const openNewReply = () => {
    setEditingReply({
      id: `r${Date.now()}`, group: '', keywords: [], replies: [''],
      replyInterval: 10, delayReply: 0,
    })
    setShowReplyModal(true)
  }

  const openEditReply = (rule: ReplyRule) => {
    setEditingReply({ ...rule, keywords: [...rule.keywords], replies: [...rule.replies] })
    setShowReplyModal(true)
  }

  const saveReplyRule = () => {
    if (!editingReply) return
    setReplyRules(prev => {
      const idx = prev.findIndex(r => r.id === editingReply.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = editingReply
        return next
      }
      return [...prev, editingReply]
    })
    setShowReplyModal(false)
    setEditingReply(null)
  }

  const removeReplyRule = (id: string) => {
    setReplyRules(prev => prev.filter(r => r.id !== id))
  }

  // 关键词管理
  const [kwInput, setKwInput] = useState('')
  const addKeyword = () => {
    const kw = kwInput.trim()
    if (!kw || !editingReply) return
    if (editingReply.keywords.includes(kw)) return
    setEditingReply({ ...editingReply, keywords: [...editingReply.keywords, kw] })
    setKwInput('')
  }

  const removeKeyword = (kw: string) => {
    if (!editingReply) return
    setEditingReply({ ...editingReply, keywords: editingReply.keywords.filter(k => k !== kw) })
  }

  // 回评内容管理
  const addReplyContent = () => {
    if (!editingReply) return
    setEditingReply({ ...editingReply, replies: [...editingReply.replies, ''] })
  }

  const updateReplyContent = (idx: number, value: string) => {
    if (!editingReply) return
    const next = [...editingReply.replies]
    next[idx] = value
    setEditingReply({ ...editingReply, replies: next })
  }

  const removeReplyContent = (idx: number) => {
    if (!editingReply || editingReply.replies.length <= 1) return
    setEditingReply({ ...editingReply, replies: editingReply.replies.filter((_, i) => i !== idx) })
  }

  return (
    <div style={{
      position: 'absolute', top: 36, right: 0, bottom: 0, width: 520,
      zIndex: 102, overflow: 'hidden', borderRadius: '8px 0 0 0',
      boxShadow: '-2px 0 16px rgba(0,0,0,0.15)', fontFamily: C.font,
      display: 'flex', flexDirection: 'column', background: C.bg,
    }}>
      {/* 顶栏 */}
      <div style={{
        padding: '10px 16px', background: C.card, display: 'flex',
        alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
      }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: C.text }}>💬 发评 / 回评</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 18, color: C.textSec, cursor: 'pointer', padding: 4 }}>✕</button>
      </div>
      {onSwitchPanel && <TabBar active="autoComment" onSwitch={onSwitchPanel} />}

      {/* 内容区 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>

        {/* ====== 定时自动发评 ====== */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>📝 定时自动发评</div>
              <div style={{ fontSize: 11, color: C.textSec, marginTop: 2 }}>系统按间隔随机发送公屏好评，营造热销氛围</div>
            </div>
            <button onClick={addTimedRule} style={{
              padding: '5px 12px', borderRadius: 6, border: 'none',
              background: C.blue, color: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: C.font,
            }}>+ 新增定时发评</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {timedRules.map(rule => (
              <div key={rule.id} style={{
                padding: '12px 14px', background: C.card, borderRadius: 10,
                border: `1px solid ${C.border}`,
              }}>
                {/* 间隔 + 开关 + 删除 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, fontSize: 12, color: C.textSec }}>
                  每隔
                  <input type="number" value={rule.interval} min={5}
                    onChange={e => updateTimedRule(rule.id, 'interval', Math.max(5, parseInt(e.target.value) || 5))}
                    style={{
                      width: 50, height: 28, padding: '0 4px', borderRadius: 6,
                      border: `1px solid ${C.border}`, fontSize: 12, textAlign: 'center',
                      outline: 'none', fontFamily: C.font,
                    }} />
                  秒，随机发送一条
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button onClick={() => removeTimedRule(rule.id)} style={{
                      background: 'none', border: 'none', fontSize: 16, color: C.textTert,
                      cursor: 'pointer', padding: 2,
                    }}>🗑</button>
                    <Toggle checked={rule.enabled} onChange={v => updateTimedRule(rule.id, 'enabled', v)} />
                  </div>
                </div>
                {/* 话术 */}
                <textarea value={rule.content}
                  onChange={e => {
                    const val = e.target.value
                    if (val.length <= 1000) updateTimedRule(rule.id, 'content', val)
                  }}
                  placeholder="一行一条弹幕，系统将随机发送，每条最多50字"
                  style={{
                    width: '100%', height: 72, padding: '10px 12px', borderRadius: 8,
                    border: `1px solid ${C.border}`, fontSize: 12, fontFamily: C.font,
                    resize: 'none', outline: 'none', boxSizing: 'border-box', lineHeight: 1.6,
                  }} />
                <div style={{
                  display: 'flex', justifyContent: 'flex-end',
                  fontSize: 10, color: rule.content.length > 900 ? '#F53F3F' : C.textTert, marginTop: 4,
                }}>
                  {rule.content.length}/1000
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ====== 自动回评 ====== */}
        <div style={{ padding: '14px', background: C.card, borderRadius: 10, border: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: replyEnabled ? 10 : 0 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>🔄 自动回评</div>
              <div style={{ fontSize: 11, color: C.textSec, marginTop: 2 }}>识别观众评论关键词，自动触发回复话术</div>
            </div>
            <Toggle checked={replyEnabled} onChange={setReplyEnabled} />
          </div>
          {replyEnabled && (
            <>
              <button onClick={openNewReply} style={{
                width: '100%', padding: '8px', borderRadius: 8,
                border: `1.5px dashed ${C.border}`, background: 'transparent',
                color: C.blue, fontSize: 12, cursor: 'pointer', fontFamily: C.font, marginBottom: 8,
              }}>+ 新增回评</button>

              {/* 回评规则列表 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {replyRules.map(rule => (
                  <div key={rule.id} style={{
                    padding: '10px 12px', borderRadius: 8,
                    border: `1px solid ${C.border}`, background: '#FAFAFA',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 3 }}>{rule.group || '(未命名)'}</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 4 }}>
                          {rule.keywords.map(kw => (
                            <span key={kw} style={{
                              fontSize: 10, padding: '1px 6px', borderRadius: 3,
                              background: '#E8F3FF', color: C.blue,
                            }}>{kw}</span>
                          ))}
                        </div>
                        <div style={{ fontSize: 11, color: C.textSec }}>
                          回复：{rule.replies.length > 1 ? `${rule.replies.length}条随机` : (rule.replies[0] || '—')}
                        </div>
                        <div style={{ fontSize: 10, color: C.textTert, marginTop: 2 }}>
                          间隔{rule.replyInterval}s · 延迟{rule.delayReply}s
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                        <button onClick={() => openEditReply(rule)} style={{
                          padding: '2px 8px', borderRadius: 4, border: `1px solid ${C.border}`,
                          background: C.card, color: C.blue, fontSize: 10, cursor: 'pointer', fontFamily: C.font,
                        }}>编辑</button>
                        <button onClick={() => removeReplyRule(rule.id)} style={{
                          padding: '2px 8px', borderRadius: 4, border: `1px solid ${C.border}`,
                          background: C.card, color: '#F53F3F', fontSize: 10, cursor: 'pointer', fontFamily: C.font,
                        }}>删除</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* 注意事项 */}
        <div style={{
          marginTop: 14, padding: '12px 14px', borderRadius: 8,
          background: '#F7F8FA', border: `1px solid ${C.border}`,
          fontSize: 11, color: C.textSec, lineHeight: 1.8,
        }}>
          <div style={{ fontWeight: 600, color: C.text, marginBottom: 4 }}>💡 注意事项</div>
          <div>1. 定时发评：内容越多，随机多样性越好，避免重复。</div>
          <div>2. 自动回评：关键词越精准，触发越准确；建议配置多组不同场景回复。</div>
          <div>3. 双功能兼容：可同时开启，互不影响，开播后系统自动运行。</div>
        </div>
      </div>

      {/* 底部 */}
      <div style={{ padding: '12px 16px', background: C.card, borderTop: `1px solid ${C.border}`, display: 'flex', gap: 10, flexShrink: 0 }}>
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

      {/* ====== 回评编辑弹窗 ====== */}
      {showReplyModal && editingReply && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={() => { setShowReplyModal(false); setEditingReply(null) }}>
          <div style={{
            width: 420, maxHeight: '85%', background: '#fff', borderRadius: 12,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
          }} onClick={e => e.stopPropagation()}>
            {/* 弹窗头部 */}
            <div style={{
              padding: '14px 16px', display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', borderBottom: `1px solid ${C.border}`, flexShrink: 0,
            }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>
                {replyRules.find(r => r.id === editingReply.id) ? '编辑回评' : '新增回评'}
              </span>
              <button onClick={() => { setShowReplyModal(false); setEditingReply(null) }} style={{
                background: 'none', border: 'none', fontSize: 18, color: C.textSec, cursor: 'pointer',
              }}>✕</button>
            </div>

            {/* 弹窗内容 */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
              {/* 回评组名 */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 6 }}>
                  回评组名
                </div>
                <input value={editingReply.group}
                  onChange={e => setEditingReply({ ...editingReply, group: e.target.value.slice(0, 10) })}
                  placeholder="请输入回评组名，不超过10个字"
                  style={{
                    width: '100%', height: 32, padding: '0 10px', borderRadius: 6,
                    border: `1px solid ${C.border}`, fontSize: 12, fontFamily: C.font, outline: 'none', boxSizing: 'border-box',
                  }} />
              </div>

              {/* 间隔 + 延迟 */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 6 }}>相似评论回复间隔</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <input type="number" value={editingReply.replyInterval} min={0}
                      onChange={e => setEditingReply({ ...editingReply, replyInterval: Math.max(0, parseInt(e.target.value) || 0) })}
                      style={{
                        width: 60, height: 32, padding: '0 6px', borderRadius: 6,
                        border: `1px solid ${C.border}`, fontSize: 12, textAlign: 'center',
                        outline: 'none', fontFamily: C.font,
                      }} />
                    <span style={{ fontSize: 12, color: C.textSec }}>秒</span>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 6 }}>延迟回评</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <input type="number" value={editingReply.delayReply} min={0}
                      onChange={e => setEditingReply({ ...editingReply, delayReply: Math.max(0, parseInt(e.target.value) || 0) })}
                      style={{
                        width: 60, height: 32, padding: '0 6px', borderRadius: 6,
                        border: `1px solid ${C.border}`, fontSize: 12, textAlign: 'center',
                        outline: 'none', fontFamily: C.font,
                      }} />
                    <span style={{ fontSize: 12, color: C.textSec }}>秒</span>
                  </div>
                </div>
              </div>

              {/* 评论关键词 */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 6 }}>评论关键词</div>
                <div style={{
                  display: 'flex', flexWrap: 'wrap', gap: 6, padding: '8px 10px',
                  borderRadius: 6, border: `1px solid ${C.border}`, minHeight: 36, marginBottom: 6,
                }}>
                  {editingReply.keywords.map(kw => (
                    <span key={kw} style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      padding: '2px 8px', borderRadius: 4, background: '#E8F3FF', color: C.blue, fontSize: 12,
                    }}>
                      {kw}
                      <span onClick={() => removeKeyword(kw)} style={{ cursor: 'pointer', fontWeight: 700, fontSize: 14, lineHeight: 1 }}>×</span>
                    </span>
                  ))}
                  <input value={kwInput}
                    onChange={e => setKwInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addKeyword() } }}
                    placeholder={editingReply.keywords.length === 0 ? '输入关键词后按回车添加' : ''}
                    style={{
                      flex: 1, minWidth: 80, border: 'none', outline: 'none',
                      fontSize: 12, fontFamily: C.font, background: 'transparent',
                    }} />
                </div>
              </div>

              {/* 回评内容 */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 6 }}>回评内容</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {editingReply.replies.map((reply, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <input value={reply}
                        onChange={e => updateReplyContent(idx, e.target.value)}
                        placeholder={`请输入回评内容 ${idx + 1}`}
                        style={{
                          flex: 1, height: 32, padding: '0 10px', borderRadius: 6,
                          border: `1px solid ${C.border}`, fontSize: 12, fontFamily: C.font, outline: 'none',
                        }} />
                      {editingReply.replies.length > 1 && (
                        <button onClick={() => removeReplyContent(idx)} style={{
                          width: 28, height: 28, borderRadius: 6, border: `1px solid ${C.border}`,
                          background: '#fff', color: C.textTert, fontSize: 14, cursor: 'pointer',
                        }}>×</button>
                      )}
                    </div>
                  ))}
                </div>
                <button onClick={addReplyContent} style={{
                  width: '100%', padding: '6px', borderRadius: 6,
                  border: `1px dashed ${C.border}`, background: 'transparent',
                  color: C.blue, fontSize: 12, cursor: 'pointer', fontFamily: C.font, marginTop: 8,
                }}>+ 添加回评内容</button>
              </div>
            </div>

            {/* 弹窗底部 */}
            <div style={{
              padding: '12px 16px', borderTop: `1px solid ${C.border}`,
              display: 'flex', gap: 10, justifyContent: 'flex-end', flexShrink: 0,
            }}>
              <button onClick={() => { setShowReplyModal(false); setEditingReply(null) }} style={{
                padding: '8px 20px', borderRadius: 6, border: `1px solid ${C.border}`,
                background: '#fff', color: C.textSec, fontSize: 13, cursor: 'pointer', fontFamily: C.font,
              }}>取消</button>
              <button onClick={saveReplyRule} style={{
                padding: '8px 20px', borderRadius: 6, border: 'none',
                background: C.blue, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: C.font,
              }}>保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
