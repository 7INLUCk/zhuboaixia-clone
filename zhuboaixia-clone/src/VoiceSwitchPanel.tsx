import { TabBar, PanelKey } from './shared'
import React, { useState } from 'react'

type Props = { onClose: () => void; onSwitchPanel?: (p: PanelKey) => void }

const C = {
  blue: '#3370FF', blueLight: 'rgba(51,112,255,0.08)',
  orange: '#FF7D00', orangeLight: 'rgba(255,125,0,0.08)',
  green: '#00B42A', greenLight: 'rgba(0,180,42,0.08)',
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

// 模拟：当前用户选中的伴播形象（实际从上游读取，这里假设选了"小小"）
const CURRENT_AVATAR = '小小'
const CURRENT_AVATAR_OUTFITS = [
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

// 模拟：直播间商品列表（实际从抖音中控台读取）
const LIVE_PRODUCTS = [
  { id: 'p1', name: '助播虾落地手机直播支架', price: '¥999', linkNum: 1 },
  { id: 'p2', name: '助播虾磁吸直播挂脖支架', price: '¥999', linkNum: 2 },
  { id: 'p3', name: '补光灯套装', price: '¥299', linkNum: 3 },
  { id: 'p4', name: '声卡直播设备', price: '¥1599', linkNum: 4 },
]

// 商品-造型绑定类型
type ProductOutfitBinding = { productId: string; outfitId: string | null }

export default function VoiceSwitchPanel({ onClose, onSwitchPanel }: Props) {
  const [enabled, setEnabled] = useState(true)
  // 弹品频率
  const [popupFreq, setPopupFreq] = useState<'always' | 'interval' | 'cycle'>('always')
  const [intervalSec, setIntervalSec] = useState(13)
  const [cyclePop, setCyclePop] = useState(11)
  const [cycleGone, setCycleGone] = useState(15)
  // 弹出次数
  const [popupCount, setPopupCount] = useState<'unlimited' | 'limited'>('unlimited')
  const [popupTimes, setPopupTimes] = useState(1)
  // 伴播造型切换
  const [outfitSwitch, setOutfitSwitch] = useState(false)
  // 商品-造型/动作绑定表：productId → { outfitId, actionId }
  const [bindings, setBindings] = useState<Record<string, { outfitId: string | null; actionId: string | null }>>({
    p1: { outfitId: 'o1', actionId: 'a1' }, p2: { outfitId: null, actionId: null },
    p3: { outfitId: 'o2', actionId: null }, p4: { outfitId: null, actionId: null },
  })
  const [showKeywords, setShowKeywords] = useState(false)
  const triggerKeywords = ['一起看', '置顶', '弹', '切', '看下', '咱看下', '我们看下']

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
        <span style={{ fontSize: 16, fontWeight: 600, color: C.text }}>🎙 声控互动</span>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', fontSize: 18, color: C.textSec,
          cursor: 'pointer', padding: 4,
        }}>x</button>
      </div>
      {onSwitchPanel && <TabBar active="voiceSwitch" onSwitch={onSwitchPanel} />}



      {/* ===== 内容区 ===== */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>

        {/* ---- 功能开关 ---- */}
        <div style={{
          padding: '14px 16px', background: C.card, borderRadius: 10,
          border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: 14,
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 2 }}>🎙 声控互动</div>
            <div style={{ fontSize: 12, color: C.textSec }}>AI 识别主播话术，自动触发商品弹窗与伴播联动</div>
          </div>
          <Toggle checked={enabled} onChange={setEnabled} />
        </div>

        {enabled && (
          <>
            {/* ---- 触发模式（内置，不可关闭） ---- */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8 }}>
                触发模式
                <span style={{ fontSize: 11, fontWeight: 400, color: C.textSec, marginLeft: 6 }}>
                  （内置逻辑，开启声控互动后自动生效）
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{
                  flex: 1, padding: '12px 14px', borderRadius: 10,
                  border: `1.5px solid ${C.blue}`, background: C.blueLight,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <span style={{ fontSize: 16 }}>🎯</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.blue }}>精准指令</span>
                    <span style={{ marginLeft: 'auto', fontSize: 10, padding: '2px 6px', borderRadius: 4, background: `${C.blue}15`, color: C.blue }}>始终开启</span>
                  </div>
                  <div style={{ fontSize: 11, color: C.textSec, lineHeight: 1.5 }}>
                    主播说「切3号链接」「置顶5号」等指令词时触发
                  </div>
                </div>
                <div style={{
                  flex: 1, padding: '12px 14px', borderRadius: 10,
                  border: `1.5px solid ${C.green}`, background: C.greenLight,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <span style={{ fontSize: 16 }}>🧠</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.green }}>意图识别</span>
                    <span style={{ marginLeft: 'auto', fontSize: 10, padding: '2px 6px', borderRadius: 4, background: `${C.green}15`, color: C.green }}>始终开启</span>
                  </div>
                  <div style={{ fontSize: 11, color: C.textSec, lineHeight: 1.5 }}>
                    AI 理解主播正在讲解某商品的意图，智能触发
                  </div>
                </div>
              </div>

              {/* 关键词展示 */}
              <div onClick={() => setShowKeywords(!showKeywords)} style={{
                marginTop: 8, padding: '8px 12px', background: '#F7F8FA', borderRadius: 6,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span style={{ fontSize: 11, color: C.textSec }}>
                  {showKeywords ? '▼' : '▶'} 触发关键词
                </span>
                {!showKeywords && (
                  <span style={{ fontSize: 11, color: C.textTert }}>
                    {triggerKeywords.slice(0, 3).join('、')}… 等 {triggerKeywords.length} 个
                  </span>
                )}
              </div>
              {showKeywords && (
                <div style={{
                  marginTop: 4, padding: '10px 12px', background: '#F7F8FA', borderRadius: 6,
                  display: 'flex', flexWrap: 'wrap', gap: 6,
                }}>
                  {triggerKeywords.map(kw => (
                    <span key={kw} style={{
                      padding: '3px 10px', borderRadius: 4,
                      background: '#E8F3FF', color: C.blue, fontSize: 12,
                    }}>{kw}</span>
                  ))}
                </div>
              )}
            </div>

            {/* ---- 伴播造型切换（可选） ---- */}
            <div style={{ marginBottom: 14 }}>
              <div style={{
                padding: '12px 14px', background: C.card, borderRadius: 10,
                border: `1px solid ${C.border}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>
                      👗 商品↔造型/动作绑定
                    </div>
                    <div style={{ fontSize: 11, color: C.textSec, marginTop: 2 }}>
                      主播讲解某商品时，伴播自动切换到对应造型和动作
                    </div>
                  </div>
                  <Toggle checked={outfitSwitch} onChange={setOutfitSwitch} />
                </div>
                {outfitSwitch && (
                  <div style={{ marginTop: 10 }}>
                    {/* 当前形象提示 */}
                    <div style={{
                      padding: '6px 10px', marginBottom: 10, borderRadius: 6,
                      background: '#F0F5FF', border: '1px solid #D4E0FF',
                      fontSize: 11, color: C.blue,
                    }}>
                      当前形象：{CURRENT_AVATAR}（{CURRENT_AVATAR_OUTFITS.length} 个可用造型）
                    </div>

                    {/* 商品绑定表 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {/* 表头 */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '4px 10px', fontSize: 10, color: C.textTert,
                        textTransform: 'uppercase', letterSpacing: 0.5,
                      }}>
                        <span style={{ flex: 1 }}>直播商品</span>
                        <span style={{ width: 100, textAlign: 'center' }}>切换造型</span>
                        <span style={{ width: 100, textAlign: 'center' }}>配合动作</span>
                      </div>

                      {LIVE_PRODUCTS.map(prod => {
                        const binding = bindings[prod.id] ?? { outfitId: null, actionId: null }
                        const boundOutfit = binding.outfitId
                        const boundAction = binding.actionId
                        const outfitActions = boundOutfit
                          ? (CURRENT_AVATAR_OUTFITS.find(o => o.id === boundOutfit)?.actions || [])
                          : []
                        const hasBinding = boundOutfit || boundAction
                        return (
                          <div key={prod.id} style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '8px 10px', borderRadius: 8,
                            background: hasBinding ? '#FFFBF0' : '#FAFAFA',
                            border: hasBinding ? '1px solid #FFE58F' : `1px solid ${C.border}`,
                          }}>
                            {/* 商品信息 */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span style={{
                                  fontSize: 10, padding: '1px 5px', borderRadius: 3,
                                  background: '#F0F0F0', color: C.textSec, flexShrink: 0,
                                }}>{prod.linkNum}号</span>
                                <span style={{
                                  fontSize: 12, color: C.text,
                                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                }}>{prod.name}</span>
                              </div>
                              <div style={{ fontSize: 10, color: C.textTert, marginTop: 1 }}>{prod.price}</div>
                            </div>

                            {/* 造型选择器 */}
                            <select
                              value={boundOutfit ?? ''}
                              onChange={e => {
                                const newOutfit = e.target.value || null
                                setBindings(prev => ({
                                  ...prev,
                                  [prod.id]: { outfitId: newOutfit, actionId: null },
                                }))
                              }}
                              onClick={e => e.stopPropagation()}
                              style={{
                                width: 100, height: 28, borderRadius: 6,
                                border: boundOutfit ? `1px solid ${C.orange}` : `1px solid ${C.border}`,
                                background: boundOutfit ? C.orangeLight : C.card,
                                color: boundOutfit ? C.orange : C.textSec,
                                fontSize: 11, fontFamily: C.font,
                                padding: '0 6px', outline: 'none',
                                cursor: 'pointer', flexShrink: 0,
                                appearance: 'auto',
                              }}
                            >
                              <option value="">不切换</option>
                              {CURRENT_AVATAR_OUTFITS.map(o => (
                                <option key={o.id} value={o.id}>{o.name}</option>
                              ))}
                            </select>

                            {/* 动作选择器（选造型后显示） */}
                            <select
                              value={boundAction ?? ''}
                              onChange={e => {
                                const newAction = e.target.value || null
                                setBindings(prev => ({
                                  ...prev,
                                  [prod.id]: { ...(prev[prod.id] || { outfitId: null, actionId: null }), actionId: newAction },
                                }))
                              }}
                              onClick={e => e.stopPropagation()}
                              disabled={!boundOutfit}
                              style={{
                                width: 100, height: 28, borderRadius: 6,
                                border: boundAction ? `1px solid ${C.green}` : `1px solid ${C.border}`,
                                background: boundAction ? C.greenLight : C.card,
                                color: boundAction ? C.green : (boundOutfit ? C.textSec : C.textTert),
                                fontSize: 11, fontFamily: C.font,
                                padding: '0 6px', outline: 'none',
                                cursor: boundOutfit ? 'pointer' : 'not-allowed', flexShrink: 0,
                                appearance: 'auto',
                              }}
                            >
                              <option value="">默认姿态</option>
                              {outfitActions.map(a => (
                                <option key={a.id} value={a.id}>{a.icon} {a.name}</option>
                              ))}
                            </select>
                          </div>
                        )
                      })}
                    </div>

                    {/* 绑定说明 */}
                    <div style={{
                      marginTop: 8, padding: '6px 10px', borderRadius: 6,
                      background: '#FFF7E6', border: '1px solid #FFE58F',
                      fontSize: 10, color: '#B8860B', lineHeight: 1.6,
                    }}>
                      💡 灵活绑定规则：<br/>
                      • 选造型后可进一步指定动作，不选则走默认姿态<br/>
                      • 未绑定的商品 → 保持当前造型和动作不变<br/>
                      • 绑定关系仅对当前「{CURRENT_AVATAR}」生效
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ---- 弹品模式 ---- */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8 }}>
                弹品模式
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {/* 一直弹 */}
                <button onClick={() => setPopupFreq('always')} style={{
                  flex: 1, padding: '10px 8px', borderRadius: 8,
                  border: popupFreq === 'always' ? `1.5px solid ${C.blue}` : `1px solid ${C.border}`,
                  background: popupFreq === 'always' ? C.blueLight : C.card,
                  cursor: 'pointer', fontFamily: C.font, textAlign: 'center',
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: popupFreq === 'always' ? C.blue : C.text }}>一直弹</div>
                  <div style={{ fontSize: 10, color: C.textSec, marginTop: 2 }}>持续显示</div>
                </button>
                {/* 间隔弹 */}
                <div style={{
                  flex: 1, padding: '10px 8px', borderRadius: 8,
                  border: popupFreq === 'interval' ? `1.5px solid ${C.blue}` : `1px solid ${C.border}`,
                  background: popupFreq === 'interval' ? C.blueLight : C.card,
                  cursor: 'pointer', textAlign: 'center',
                }} onClick={() => setPopupFreq('interval')}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: popupFreq === 'interval' ? C.blue : C.text, marginBottom: 4 }}>间隔弹</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, fontSize: 11, color: C.textSec }}>
                    每隔
                    <input type="number" value={intervalSec} min={1} onClick={e => e.stopPropagation()}
                      onChange={e => setIntervalSec(Math.max(1, parseInt(e.target.value) || 1))}
                      style={{ width: 40, height: 24, padding: '0 2px', borderRadius: 4, border: `1px solid ${C.border}`,
                        fontSize: 12, textAlign: 'center', outline: 'none', fontFamily: C.font }} />
                    秒
                  </div>
                </div>
                {/* 循环弹 */}
                <div style={{
                  flex: 1.2, padding: '10px 8px', borderRadius: 8,
                  border: popupFreq === 'cycle' ? `1.5px solid ${C.blue}` : `1px solid ${C.border}`,
                  background: popupFreq === 'cycle' ? C.blueLight : C.card,
                  cursor: 'pointer', textAlign: 'center',
                }} onClick={() => setPopupFreq('cycle')}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: popupFreq === 'cycle' ? C.blue : C.text, marginBottom: 4 }}>循环弹</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, fontSize: 11, color: C.textSec, flexWrap: 'wrap' }}>
                    弹
                    <input type="number" value={cyclePop} min={1} onClick={e => e.stopPropagation()}
                      onChange={e => setCyclePop(Math.max(1, parseInt(e.target.value) || 1))}
                      style={{ width: 36, height: 24, padding: '0 2px', borderRadius: 4, border: `1px solid ${C.border}`,
                        fontSize: 12, textAlign: 'center', outline: 'none', fontFamily: C.font }} />
                    秒 消失
                    <input type="number" value={cycleGone} min={1} onClick={e => e.stopPropagation()}
                      onChange={e => setCycleGone(Math.max(1, parseInt(e.target.value) || 1))}
                      style={{ width: 36, height: 24, padding: '0 2px', borderRadius: 4, border: `1px solid ${C.border}`,
                        fontSize: 12, textAlign: 'center', outline: 'none', fontFamily: C.font }} />
                    秒
                  </div>
                </div>
              </div>
            </div>

            {/* ---- 弹出次数 ---- */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8 }}>
                弹出次数
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => setPopupCount('unlimited')} style={{
                  flex: 1, padding: '10px 14px', borderRadius: 8,
                  border: popupCount === 'unlimited' ? `1.5px solid ${C.blue}` : `1px solid ${C.border}`,
                  background: popupCount === 'unlimited' ? C.blueLight : C.card,
                  cursor: 'pointer', fontFamily: C.font, textAlign: 'center',
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: popupCount === 'unlimited' ? C.blue : C.text }}>不限次数</div>
                  <div style={{ fontSize: 10, color: C.textSec, marginTop: 2 }}>按频率规则无限循环</div>
                </button>
                <div style={{
                  flex: 1, padding: '10px 14px', borderRadius: 8,
                  border: popupCount === 'limited' ? `1.5px solid ${C.blue}` : `1px solid ${C.border}`,
                  background: popupCount === 'limited' ? C.blueLight : C.card,
                  cursor: 'pointer', textAlign: 'center',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                }} onClick={() => setPopupCount('limited')}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: popupCount === 'limited' ? C.blue : C.text, marginBottom: 4 }}>限定次数</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 11, color: C.textSec }}>
                    弹出
                    <input type="number" value={popupTimes} min={1} onClick={e => e.stopPropagation()}
                      onChange={e => setPopupTimes(Math.max(1, parseInt(e.target.value) || 1))}
                      style={{ width: 40, height: 24, padding: '0 2px', borderRadius: 4, border: `1px solid ${C.border}`,
                        fontSize: 12, textAlign: 'center', outline: 'none', fontFamily: C.font }} />
                    次
                  </div>
                </div>
              </div>
            </div>

            {/* ---- 工作流程 ---- */}
            <div style={{
              padding: '14px', borderRadius: 10,
              background: 'linear-gradient(135deg, #F0F5FF 0%, #F7F8FA 100%)',
              border: `1px solid ${C.border}`,
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 8 }}>🔗 工作流程</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: C.textSec, flexWrap: 'wrap' }}>
                <span style={{ padding: '4px 8px', background: '#fff', borderRadius: 6, border: `1px solid ${C.border}` }}>🎤 主播说话</span>
                <span style={{ color: C.textTert }}>→</span>
                <span style={{ padding: '4px 8px', background: '#fff', borderRadius: 6, border: `1px solid ${C.border}` }}>🧠 AI 识别</span>
                <span style={{ color: C.textTert }}>→</span>
                <span style={{ padding: '4px 8px', background: '#E8F3FF', borderRadius: 6, border: `1px solid #B8D4FF`, color: C.blue }}>📦 弹商品</span>
                {outfitSwitch && (<>
                  <span style={{ color: C.textTert }}>+</span>
                  <span style={{ padding: '4px 8px', background: '#E8F3FF', borderRadius: 6, border: `1px solid #B8D4FF`, color: C.blue }}>👗 切造型</span>
                  <span style={{ color: C.textTert }}>+</span>
                  <span style={{ padding: '4px 8px', background: '#E8F3FF', borderRadius: 6, border: `1px solid #B8D4FF`, color: C.blue }}>🎭 切动作</span>
                </>)}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ===== 底部操作栏 ===== */}
      <div style={{
        padding: '12px 16px', background: C.card, borderTop: `1px solid ${C.border}`,
        display: 'flex', gap: 10, flexShrink: 0,
      }}>
        <button onClick={onClose} style={{
          flex: 1, height: 42, borderRadius: 8, background: 'transparent',
          border: `1px solid ${C.border}`, color: C.textSec, fontSize: 14,
          cursor: 'pointer', fontFamily: C.font,
        }}>取消</button>
        <button style={{
          flex: 2, height: 42, borderRadius: 8, background: C.blue, border: 'none',
          color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
          fontFamily: C.font, boxShadow: '0 2px 8px rgba(51,112,255,0.3)',
        }}>确认配置</button>
      </div>
    </div>
  )
}
