import React, { useState, useRef, useEffect } from 'react'
import { tokens } from './tokens'

const T = tokens
const C = T.colors

// ─── Types ────────────────────────────────────────────────────────────────────

type SlotData = { link: string; imageUrl: string | null }
type ActionCard = {
  id: string; name: string; category: 'daily' | 'enter' | 'exit'
  color: string; retries: number; generating: boolean; done: boolean
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PUBLIC_FACES = [
  { id: 'f1', name: '暖暖', emoji: '🌸', gender: '女', tag: '温柔知性' },
  { id: 'f2', name: '晴天', emoji: '☀️', gender: '女', tag: '活泼阳光' },
  { id: 'f3', name: '冷冷', emoji: '❄️', gender: '女', tag: '冷淡高冷' },
  { id: 'f4', name: '专业帝', emoji: '🎯', gender: '男', tag: '专业沉稳' },
  { id: 'f5', name: '乐乐', emoji: '😄', gender: '男', tag: '亲切热情' },
  { id: 'f6', name: '酷哥', emoji: '😎', gender: '男', tag: '时尚潮流' },
]

const CARD_COLORS = ['#FFB3D9','#B3D4FF','#C8F0D0','#FFE0B0','#D0E0FF','#FFD4F0','#FFCCE0','#A0C8FF']
const DAILY_MAX_RETRIES = 2

function makeActionCards(): ActionCard[] {
  return [
    ...Array.from({ length: 8 }, (_, i) => ({
      id: `daily-${i + 1}`, name: `日常动作 ${i + 1}`, category: 'daily' as const,
      color: CARD_COLORS[i], retries: 0, generating: false, done: false,
    })),
    { id: 'enter', name: '进场动作', category: 'enter', color: '#E8F3FF', retries: 0, generating: false, done: false },
    { id: 'exit',  name: '出场动作', category: 'exit',  color: '#FFF0E8', retries: 0, generating: false, done: false },
  ]
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  num, title, locked, done, children,
}: {
  num: number; title: string; locked: boolean; done: boolean; children: React.ReactNode
}) {
  return (
    <div style={{
      marginBottom: 24, borderRadius: 12,
      border: `1px solid ${locked ? C.border : done ? '#86EFAC' : C.primary}`,
      overflow: 'hidden', opacity: locked ? 0.45 : 1,
      transition: 'opacity 0.2s, border-color 0.2s',
      pointerEvents: locked ? 'none' : 'auto',
    }}>
      {/* 区块标题 */}
      <div style={{
        padding: '14px 20px',
        background: locked ? '#FAFAFA' : done ? '#F0FDF4' : '#F5F4FF',
        display: 'flex', alignItems: 'center', gap: 10,
        borderBottom: `1px solid ${locked ? C.border : done ? '#86EFAC' : '#DDD9FF'}`,
      }}>
        <div style={{
          width: 24, height: 24, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 700,
          background: done ? '#22C55E' : locked ? C.border : C.primary,
          color: '#fff', flexShrink: 0,
        }}>
          {done ? '✓' : num}
        </div>
        <span style={{
          fontSize: 14, fontWeight: 600,
          color: locked ? C.textTertiary : C.textPrimary,
        }}>{title}</span>
        {locked && (
          <span style={{ fontSize: 11, color: C.textTertiary, marginLeft: 4 }}>
            完成上一步后解锁
          </span>
        )}
        {done && !locked && (
          <span style={{ fontSize: 11, color: '#16A34A', marginLeft: 4 }}>已完成</span>
        )}
      </div>
      {/* 区块内容 */}
      <div style={{ padding: '20px', background: '#fff' }}>
        {children}
      </div>
    </div>
  )
}

// ─── Image upload slot ────────────────────────────────────────────────────────

function ImageSlot({ label, required, value, onChange }: {
  label: string; required?: boolean
  value: SlotData; onChange: (v: SlotData) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    onChange({ ...value, imageUrl: url })
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      padding: '12px 0', borderBottom: `1px solid ${C.border}`,
    }}>
      {/* 标签 */}
      <div style={{
        width: 48, flexShrink: 0, paddingTop: 9,
        fontSize: 13, color: C.textPrimary, fontWeight: 500,
      }}>
        {label}
        {required && <span style={{ color: '#F53F3F', marginLeft: 2 }}>*</span>}
      </div>

      {/* 商品图上传 */}
      <div
        onClick={() => fileRef.current?.click()}
        style={{
          width: 56, height: 56, borderRadius: 8, flexShrink: 0,
          border: `1px dashed ${value.imageUrl ? C.primary : C.border}`,
          background: value.imageUrl ? 'transparent' : '#FAFAFA',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', overflow: 'hidden',
        }}
      >
        {value.imageUrl
          ? <img src={value.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: 20, color: C.textTertiary }}>+</span>
        }
      </div>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />

      {/* 链接/ID输入 */}
      <div style={{ flex: 1 }}>
        <input
          value={value.link}
          onChange={e => onChange({ ...value, link: e.target.value })}
          placeholder="粘贴商品链接或商品 ID"
          style={{
            width: '100%', padding: '8px 10px', borderRadius: 6,
            border: `1px solid ${C.border}`, fontSize: 13, color: C.textPrimary,
            fontFamily: T.fonts.family, outline: 'none', boxSizing: 'border-box',
          }}
          onFocus={e => (e.target.style.borderColor = C.primary)}
          onBlur={e => (e.target.style.borderColor = C.border)}
        />
        <div style={{ fontSize: 11, color: C.textTertiary, marginTop: 4 }}>
          上传商品图后，系统将生成对应穿搭效果
        </div>
      </div>
    </div>
  )
}

// ─── Action video card ────────────────────────────────────────────────────────

function ActionVideoCard({ card, onRegenerate }: {
  card: ActionCard; onRegenerate: (id: string) => void
}) {
  const [playing, setPlaying] = useState(false)
  const isDaily = card.category === 'daily'
  const retriesLeft = isDaily ? DAILY_MAX_RETRIES - card.retries : null
  const canRetry = retriesLeft === null || retriesLeft > 0

  return (
    <div style={{
      borderRadius: 8, border: `1px solid ${C.border}`,
      overflow: 'hidden', background: '#FAFAFA',
    }}>
      {/* 视频预览区 */}
      <div
        onClick={() => !card.generating && setPlaying(!playing)}
        style={{
          height: 100, background: card.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: card.generating ? 'default' : 'pointer',
          position: 'relative',
        }}
      >
        {card.generating ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 24, height: 24, borderRadius: '50%',
              border: '3px solid rgba(0,0,0,0.15)', borderTopColor: '#5850EC',
              animation: 'spin 0.8s linear infinite', margin: '0 auto 6px',
            }} />
            <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.4)' }}>生成中…</span>
          </div>
        ) : (
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(255,255,255,0.8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14,
          }}>
            {playing ? '⏸' : '▶'}
          </div>
        )}
      </div>

      {/* 卡片底部 */}
      <div style={{ padding: '8px 10px' }}>
        <div style={{
          fontSize: 12, fontWeight: 500, color: C.textPrimary,
          marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{card.name}</div>
        <button
          onClick={() => canRetry && !card.generating && onRegenerate(card.id)}
          disabled={!canRetry || card.generating}
          style={{
            width: '100%', padding: '4px 0', borderRadius: 4, fontSize: 11,
            border: `1px solid ${canRetry ? C.border : C.border}`,
            background: canRetry ? '#fff' : '#F2F3F5',
            color: canRetry ? C.textSecondary : C.textTertiary,
            cursor: canRetry && !card.generating ? 'pointer' : 'not-allowed',
          }}
        >
          {retriesLeft !== null ? `重新生成（剩${retriesLeft}次）` : '重新生成'}
        </button>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function BanboCustomizePage() {
  const [selectedFace, setSelectedFace] = useState('')

  const emptySlot = (): SlotData => ({ link: '', imageUrl: null })
  const [top, setTop]       = useState<SlotData>(emptySlot())
  const [bottom, setBottom] = useState<SlotData>(emptySlot())
  const [shoes, setShoes]   = useState<SlotData>(emptySlot())

  const [generatingActions, setGeneratingActions] = useState(false)
  const [actionCards, setActionCards] = useState<ActionCard[]>([])
  const [actionConfirmed, setActionConfirmed] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const sec2Ref = useRef<HTMLDivElement>(null)
  const sec3Ref = useRef<HTMLDivElement>(null)
  const sec4Ref = useRef<HTMLDivElement>(null)

  const step1Done = !!selectedFace
  const step2Done = top.link.trim() !== '' || top.imageUrl !== null
  const step3Done = actionConfirmed
  const actionsGenerated = actionCards.length > 0

  // 解锁时自动滚动
  useEffect(() => {
    if (step1Done) sec2Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [step1Done])
  useEffect(() => {
    if (actionsGenerated) sec3Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [actionsGenerated])
  useEffect(() => {
    if (actionConfirmed) sec4Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [actionConfirmed])

  function handleGenerateActions() {
    setGeneratingActions(true)
    const cards = makeActionCards()
    // 先显示loading状态的卡片
    setActionCards(cards.map(c => ({ ...c, generating: true })))
    setTimeout(() => {
      setActionCards(cards.map(c => ({ ...c, generating: false, done: true })))
      setGeneratingActions(false)
    }, 2500)
  }

  function handleRegenerate(cardId: string) {
    setActionCards(prev => prev.map(c => c.id === cardId ? { ...c, generating: true } : c))
    setTimeout(() => {
      setActionCards(prev => prev.map(c =>
        c.id === cardId
          ? { ...c, generating: false, done: true, retries: c.retries + 1, color: CARD_COLORS[Math.floor(Math.random() * CARD_COLORS.length)] }
          : c
      ))
    }, 1500)
  }

  function handleSubmit() {
    setSubmitting(true)
    setTimeout(() => { setSubmitting(false); setSubmitted(true) }, 1200)
  }

  const face = PUBLIC_FACES.find(f => f.id === selectedFace)

  if (submitted) {
    return (
      <div style={{
        height: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#fff', fontFamily: T.fonts.family, gap: 16, textAlign: 'center',
      }}>
        <div style={{ fontSize: 48 }}>🎉</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: C.textPrimary }}>制作任务已提交</div>
        <div style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.7 }}>
          预计 30–60 分钟完成<br />完成后状态将自动更新为「可使用」
        </div>
        <button
          onClick={() => { setSubmitted(false); setSelectedFace(''); setTop(emptySlot()); setBottom(emptySlot()); setShoes(emptySlot()); setActionCards([]); setActionConfirmed(false) }}
          style={{
            marginTop: 8, padding: '9px 24px', borderRadius: 6,
            fontSize: 13, fontWeight: 500, border: 'none',
            background: C.primary, color: '#fff', cursor: 'pointer',
          }}
        >
          再新建一个
        </button>
      </div>
    )
  }

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: '#F7F8FA', fontFamily: T.fonts.family,
    }}>
      {/* 顶栏 */}
      <div style={{
        padding: '16px 24px', background: '#fff',
        borderBottom: `1px solid ${C.border}`, flexShrink: 0,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: C.textPrimary }}>新建伴播形象</div>
          <div style={{ fontSize: 12, color: C.textTertiary, marginTop: 2 }}>
            完成以下配置后提交制作，约 30–60 分钟可用于直播
          </div>
        </div>
      </div>

      {/* 滚动内容区 */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}>

        {/* ── 区块1：选择形象 ── */}
        <Section num={1} title="选择形象" locked={false} done={step1Done}>
          <div style={{ fontSize: 13, color: C.textSecondary, marginBottom: 16 }}>
            从公共库选择一位伴播形象，选中后解锁后续配置
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {PUBLIC_FACES.map(f => {
              const selected = selectedFace === f.id
              return (
                <div
                  key={f.id}
                  onClick={() => setSelectedFace(f.id)}
                  style={{
                    borderRadius: 10, padding: '14px 10px', cursor: 'pointer',
                    textAlign: 'center', transition: 'all 0.15s',
                    border: `2px solid ${selected ? C.primary : C.border}`,
                    background: selected ? '#F5F4FF' : '#FAFAFA',
                  }}
                >
                  <div style={{ fontSize: 32, marginBottom: 6 }}>{f.emoji}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary, marginBottom: 4 }}>{f.name}</div>
                  <div style={{
                    display: 'inline-block', fontSize: 10, padding: '2px 6px', borderRadius: 8,
                    background: f.gender === '女' ? '#FFF0F6' : '#EEF0FF',
                    color: f.gender === '女' ? '#C91C7A' : C.primary,
                    marginBottom: 3,
                  }}>{f.gender}</div>
                  <div style={{ fontSize: 11, color: C.textTertiary }}>{f.tag}</div>
                  {selected && (
                    <div style={{ marginTop: 6, fontSize: 11, color: C.primary, fontWeight: 600 }}>✓ 已选中</div>
                  )}
                </div>
              )
            })}
          </div>
        </Section>

        {/* ── 区块2：配置穿搭 ── */}
        <div ref={sec2Ref}>
          <Section num={2} title="配置穿搭" locked={!step1Done} done={step2Done && actionsGenerated}>
            <div style={{ fontSize: 13, color: C.textSecondary, marginBottom: 4 }}>
              为每个部位上传商品图并填写商品链接或 ID
            </div>
            <div style={{ fontSize: 12, color: C.textTertiary, marginBottom: 16 }}>
              伴播将根据商品自动匹配穿搭，讲哪件穿哪件
            </div>

            <ImageSlot label="上身" required value={top} onChange={setTop} />
            <ImageSlot label="下身" value={bottom} onChange={setBottom} />
            <ImageSlot label="鞋子" value={shoes} onChange={setShoes} />

            {step2Done && !actionsGenerated && (
              <button
                onClick={handleGenerateActions}
                disabled={generatingActions}
                style={{
                  marginTop: 20, width: '100%', padding: '10px 0', borderRadius: 8,
                  fontSize: 13, fontWeight: 500, border: 'none',
                  background: generatingActions ? '#A5B4FC' : C.primary,
                  color: '#fff', cursor: generatingActions ? 'not-allowed' : 'pointer',
                }}
              >
                {generatingActions ? '生成中，请稍候…' : '生成动作 →'}
              </button>
            )}
            {actionsGenerated && (
              <div style={{
                marginTop: 16, padding: '8px 12px', borderRadius: 6,
                background: '#F0FDF4', border: '1px solid #86EFAC',
                fontSize: 12, color: '#16A34A',
              }}>
                ✓ 动作已生成，请在下方预览确认
              </div>
            )}
          </Section>
        </div>

        {/* ── 区块3：动作预览 ── */}
        <div ref={sec3Ref}>
          <Section num={3} title="动作预览" locked={!actionsGenerated} done={step3Done}>
            {actionsGenerated ? (
              <>
                <div style={{ fontSize: 13, color: C.textSecondary, marginBottom: 16 }}>
                  共 10 个动作视频，点击可预览。不满意可单独重新生成。
                </div>

                {/* 日常动作 */}
                <div style={{ fontSize: 12, fontWeight: 600, color: C.textTertiary, marginBottom: 10, letterSpacing: 1 }}>
                  日常动作（8个）
                </div>
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16,
                }}>
                  {actionCards.filter(c => c.category === 'daily').map(card => (
                    <ActionVideoCard key={card.id} card={card} onRegenerate={handleRegenerate} />
                  ))}
                </div>

                {/* 进出场 */}
                <div style={{ fontSize: 12, fontWeight: 600, color: C.textTertiary, marginBottom: 10, letterSpacing: 1 }}>
                  进 / 出场动作（各 1 个，可无限次重新生成）
                </div>
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 20,
                }}>
                  {actionCards.filter(c => c.category !== 'daily').map(card => (
                    <ActionVideoCard key={card.id} card={card} onRegenerate={handleRegenerate} />
                  ))}
                </div>

                {!actionConfirmed && (
                  <button
                    onClick={() => setActionConfirmed(true)}
                    style={{
                      width: '100%', padding: '10px 0', borderRadius: 8,
                      fontSize: 13, fontWeight: 500, border: 'none',
                      background: C.primary, color: '#fff', cursor: 'pointer',
                    }}
                  >
                    确认动作，去提交
                  </button>
                )}
                {actionConfirmed && (
                  <div style={{
                    padding: '8px 12px', borderRadius: 6,
                    background: '#F0FDF4', border: '1px solid #86EFAC',
                    fontSize: 12, color: '#16A34A',
                  }}>
                    ✓ 动作已确认
                  </div>
                )}
              </>
            ) : (
              <div style={{ fontSize: 13, color: C.textTertiary, textAlign: 'center', padding: '20px 0' }}>
                完成穿搭配置并点击「生成动作」后，在此预览效果
              </div>
            )}
          </Section>
        </div>

        {/* ── 区块4：提交制作 ── */}
        <div ref={sec4Ref}>
          <Section num={4} title="提交制作" locked={!step3Done} done={false}>
            {step3Done ? (
              <>
                {/* 配置汇总 */}
                <div style={{
                  padding: '16px', borderRadius: 8, background: '#FAFAFA',
                  border: `1px solid ${C.border}`, marginBottom: 16,
                }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary, marginBottom: 12 }}>
                    配置确认
                  </div>
                  <SummaryRow label="伴播形象" value={face ? `${face.emoji} ${face.name}（${face.gender} · ${face.tag}）` : '—'} />
                  <SummaryRow label="穿搭商品"
                    value={[top.link, bottom.link, shoes.link].filter(Boolean).length > 0
                      ? `${[top.link, bottom.link, shoes.link].filter(Boolean).length} 件已关联`
                      : '未填写链接（已上传商品图）'}
                  />
                  <SummaryRow label="动作" value="10 个（8 日常 + 1 进场 + 1 出场）" />
                </div>

                <div style={{
                  padding: '10px 14px', borderRadius: 6, marginBottom: 16,
                  background: '#EFF6FF', border: '1px solid #BFDBFE',
                  fontSize: 12, color: '#1D4ED8', lineHeight: 1.7,
                }}>
                  提交后进入制作队列，预计 30–60 分钟完成。<br />
                  完成后状态自动更新为「可使用」，可在直播间调用。
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  style={{
                    width: '100%', padding: '12px 0', borderRadius: 8,
                    fontSize: 14, fontWeight: 600, border: 'none',
                    background: submitting ? '#86EFAC' : '#16A34A',
                    color: '#fff', cursor: submitting ? 'not-allowed' : 'pointer',
                    transition: 'background 0.15s',
                  }}
                >
                  {submitting ? '提交中…' : '提交制作'}
                </button>
              </>
            ) : (
              <div style={{ fontSize: 13, color: C.textTertiary, textAlign: 'center', padding: '20px 0' }}>
                完成前三步配置后即可提交制作
              </div>
            )}
          </Section>
        </div>

        {/* 底部留白 */}
        <div style={{ height: 40 }} />
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 12, fontSize: 12, marginBottom: 8 }}>
      <span style={{ color: C.textTertiary, flexShrink: 0, width: 56 }}>{label}</span>
      <span style={{ color: C.textPrimary }}>{value}</span>
    </div>
  )
}
