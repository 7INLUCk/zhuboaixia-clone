import React, { useState } from 'react'
import { tokens } from './tokens'

const T = tokens
const C = T.colors

// ─── Types ───────────────────────────────────────────────────────────────────

type AvatarStatus = 'pending' | 'ready' | 'training' | 'done'

interface AvatarCard {
  id: string
  name: string
  emoji: string
  status: AvatarStatus
  faceId: string
  products: string[]
}

type WizardStep = 1 | 2 | 3 | 4

// ─── Mock data ────────────────────────────────────────────────────────────────

const PUBLIC_FACES = [
  { id: 'f1', name: '暖暖', emoji: '🌸', gender: '女', tag: '温柔知性' },
  { id: 'f2', name: '晴天', emoji: '☀️', gender: '女', tag: '活泼阳光' },
  { id: 'f3', name: '冷冷', emoji: '❄️', gender: '女', tag: '冷淡高冷' },
  { id: 'f4', name: '专业帝', emoji: '🎯', gender: '男', tag: '专业沉稳' },
  { id: 'f5', name: '乐乐', emoji: '😄', gender: '男', tag: '亲切热情' },
  { id: 'f6', name: '酷哥', emoji: '😎', gender: '男', tag: '时尚潮流' },
]

const REQUIRED_SKILLS = [
  { id: 'sp-daily', name: '日常动作', desc: '形象日常站场动作，全程自然呈现' },
  { id: 'sp-enter', name: '进场动作', desc: '讲解商品时形象出现的入场效果' },
  { id: 'sp-exit', name: '出场动作', desc: '形象退出画面的过渡效果' },
  { id: 'sp-auto-outfit', name: '自动换装', desc: '随讲解商品切换，无需手动操作' },
  { id: 'sp-showcase', name: '穿版展示', desc: '全身展示穿搭效果，适合服装类目' },
]

const STATUS_CONFIG: Record<AvatarStatus, { label: string; bg: string; color: string }> = {
  pending: { label: '未完成', bg: '#F2F3F5', color: '#86909C' },
  ready:   { label: '待制作', bg: '#FFF7E8', color: '#FF7D00' },
  training:{ label: '制作中', bg: '#E8F3FF', color: '#165DFF' },
  done:    { label: '可使用', bg: '#E8FFEA', color: '#00B42A' },
}

// ─── Wizard ───────────────────────────────────────────────────────────────────

function Wizard({ onDone, onCancel }: { onDone: (card: Omit<AvatarCard, 'id'>) => void; onCancel: () => void }) {
  const [step, setStep] = useState<WizardStep>(1)
  const [selectedFace, setSelectedFace] = useState<string>('')
  const [productInput, setProductInput] = useState('')
  const [parsedProducts, setParsedProducts] = useState<string[]>([])
  const [generating, setGenerating] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const face = PUBLIC_FACES.find(f => f.id === selectedFace)

  function parseProducts(raw: string) {
    const lines = raw.split('\n').map(l => l.trim()).filter(Boolean)
    setParsedProducts(lines)
  }

  function handleProductChange(val: string) {
    setProductInput(val)
    parseProducts(val)
  }

  function handleGenerate() {
    setGenerating(true)
    setTimeout(() => { setGenerating(false); setStep(4) }, 1800)
  }

  function handleSubmit() {
    setSubmitting(true)
    setTimeout(() => {
      onDone({
        name: face?.name || '新形象',
        emoji: face?.emoji || '🎭',
        status: 'training',
        faceId: selectedFace,
        products: parsedProducts,
      })
    }, 1200)
  }

  const STEPS = ['选择形象', '配置穿搭', '动作预览', '提交制作']

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      {/* 顶栏 */}
      <div style={{
        padding: '16px 24px',
        borderBottom: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <button
          onClick={onCancel}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: C.textSecondary, fontSize: 20, lineHeight: 1, padding: '0 4px',
          }}
        >←</button>
        <span style={{ fontSize: 15, fontWeight: 600, color: C.textPrimary }}>新建伴播形象</span>
      </div>

      {/* 步骤条 */}
      <div style={{
        padding: '20px 24px 0',
        display: 'flex', alignItems: 'center', gap: 0,
      }}>
        {STEPS.map((label, i) => {
          const idx = (i + 1) as WizardStep
          const active = step === idx
          const done = step > idx
          return (
            <React.Fragment key={idx}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 600,
                  background: done ? C.primary : active ? C.primary : '#F2F3F5',
                  color: done || active ? '#fff' : C.textTertiary,
                }}>
                  {done ? '✓' : idx}
                </div>
                <span style={{
                  fontSize: 11, whiteSpace: 'nowrap',
                  color: active ? C.primary : done ? C.textSecondary : C.textTertiary,
                  fontWeight: active ? 500 : 400,
                }}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{
                  flex: 1, height: 1, margin: '0 8px', marginBottom: 18,
                  background: done ? C.primary : C.border,
                }}/>
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* 内容区 */}
      <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>

        {/* Step 1: 选择面容 */}
        {step === 1 && (
          <div>
            <div style={{ fontSize: 14, color: C.textSecondary, marginBottom: 16 }}>
              从公共库中选择一位伴播形象，后续可配置穿搭与动作
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 12,
            }}>
              {PUBLIC_FACES.map(f => {
                const selected = selectedFace === f.id
                return (
                  <div
                    key={f.id}
                    onClick={() => setSelectedFace(f.id)}
                    style={{
                      borderRadius: 10, border: `2px solid ${selected ? C.primary : C.border}`,
                      background: selected ? '#F5F4FF' : '#FAFAFA',
                      padding: '16px 12px', cursor: 'pointer', textAlign: 'center',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ fontSize: 36, marginBottom: 8 }}>{f.emoji}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary, marginBottom: 3 }}>{f.name}</div>
                    <div style={{
                      display: 'inline-block', fontSize: 11,
                      padding: '2px 7px', borderRadius: 10,
                      background: f.gender === '女' ? '#FFF0F6' : '#EEF0FF',
                      color: f.gender === '女' ? '#C91C7A' : C.primary,
                      marginBottom: 4,
                    }}>{f.gender}</div>
                    <div style={{ fontSize: 11, color: C.textTertiary }}>{f.tag}</div>
                    {selected && (
                      <div style={{
                        marginTop: 8, fontSize: 11, color: C.primary, fontWeight: 500,
                      }}>✓ 已选中</div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 2: 关联商品 */}
        {step === 2 && (
          <div>
            <div style={{ fontSize: 14, color: C.textSecondary, marginBottom: 4 }}>
              粘贴商品链接或商品 ID，多个商品换行分隔
            </div>
            <div style={{ fontSize: 12, color: C.textTertiary, marginBottom: 16 }}>
              伴播将根据商品自动生成对应穿搭，讲哪件穿哪件
            </div>
            <textarea
              value={productInput}
              onChange={e => handleProductChange(e.target.value)}
              placeholder={'示例：\nhttps://v.douyin.com/xxxxx\n7388291054321\nhttps://v.douyin.com/yyyyy'}
              style={{
                width: '100%', minHeight: 140, padding: '12px',
                borderRadius: 8, border: `1px solid ${C.border}`,
                fontSize: 13, color: C.textPrimary, resize: 'vertical',
                fontFamily: T.fonts.family, outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={e => (e.target.style.borderColor = C.primary)}
              onBlur={e => (e.target.style.borderColor = C.border)}
            />
            {parsedProducts.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 12, color: C.textSecondary, marginBottom: 8 }}>
                  已识别 {parsedProducts.length} 个商品：
                </div>
                {parsedProducts.map((p, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '7px 10px', borderRadius: 6,
                    background: '#F7F8FA', marginBottom: 6, fontSize: 12,
                    color: C.textPrimary,
                  }}>
                    <span style={{ color: '#00B42A', fontWeight: 600 }}>✓</span>
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div style={{
              marginTop: 12, fontSize: 12, color: C.textTertiary,
              padding: '8px 12px', background: '#FFFBE6', borderRadius: 6,
              border: '1px solid #FFE58F',
            }}>
              识别失败的链接不影响继续配置，可跳过
            </div>
          </div>
        )}

        {/* Step 3: 技能预览 */}
        {step === 3 && (
          <div>
            <div style={{ fontSize: 14, color: C.textSecondary, marginBottom: 4 }}>
              系统已为你配置以下 5 个必备动作，制作时自动生成
            </div>
            <div style={{ fontSize: 12, color: C.textTertiary, marginBottom: 20 }}>
              更多可选动作将在后续版本开放
            </div>
            {REQUIRED_SKILLS.map((skill, i) => (
              <div key={skill.id} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 16px', borderRadius: 8,
                border: `1px solid ${C.border}`, marginBottom: 10,
                background: '#FAFAFA',
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: C.primary, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 600, flexShrink: 0,
                }}>{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary, marginBottom: 2 }}>
                    {skill.name}
                  </div>
                  <div style={{ fontSize: 12, color: C.textSecondary }}>{skill.desc}</div>
                </div>
                <span style={{
                  fontSize: 11, padding: '2px 8px', borderRadius: 10,
                  background: '#E8FFEA', color: '#00B42A', fontWeight: 500,
                }}>必选</span>
              </div>
            ))}
          </div>
        )}

        {/* Step 4: 提交训练 */}
        {step === 4 && (
          <div>
            <div style={{
              padding: '20px', borderRadius: 10, border: `1px solid ${C.border}`,
              background: '#FAFAFA', marginBottom: 20,
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary, marginBottom: 12 }}>
                配置确认
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Row label="面容" value={face ? `${face.emoji} ${face.name}（${face.gender} · ${face.tag}）` : '—'} />
                <Row label="商品数量" value={parsedProducts.length > 0 ? `${parsedProducts.length} 件` : '未关联（可跳过）'} />
                <Row label="动作" value="5 个必备动作" />
              </div>
            </div>
            <div style={{
              padding: '12px 14px', borderRadius: 8,
              background: '#E8F3FF', border: '1px solid #BEDAFF',
              fontSize: 12, color: '#165DFF', lineHeight: 1.6,
            }}>
              提交后进入制作队列，预计 30–60 分钟完成。制作期间你可以继续使用其他功能，完成后状态自动更新为「可使用」。
            </div>
          </div>
        )}
      </div>

      {/* 底部操作 */}
      <div style={{
        padding: '16px 24px',
        borderTop: `1px solid ${C.border}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <button
          onClick={() => step === 1 ? onCancel() : setStep((step - 1) as WizardStep)}
          style={{
            padding: '8px 20px', borderRadius: 6, fontSize: 13,
            border: `1px solid ${C.border}`, background: '#fff',
            color: C.textSecondary, cursor: 'pointer',
          }}
        >
          {step === 1 ? '取消' : '上一步'}
        </button>

        {step < 3 && (
          <button
            onClick={() => setStep((step + 1) as WizardStep)}
            disabled={step === 1 && !selectedFace}
            style={{
              padding: '8px 24px', borderRadius: 6, fontSize: 13, fontWeight: 500,
              border: 'none',
              background: step === 1 && !selectedFace ? C.border : C.primary,
              color: step === 1 && !selectedFace ? C.textTertiary : '#fff',
              cursor: step === 1 && !selectedFace ? 'not-allowed' : 'pointer',
            }}
          >
            下一步
          </button>
        )}

        {step === 3 && (
          <button
            onClick={handleGenerate}
            disabled={generating}
            style={{
              padding: '8px 24px', borderRadius: 6, fontSize: 13, fontWeight: 500,
              border: 'none', background: C.primary, color: '#fff',
              cursor: generating ? 'not-allowed' : 'pointer', opacity: generating ? 0.7 : 1,
            }}
          >
            {generating ? '生成中…' : '确认并生成动作'}
          </button>
        )}

        {step === 4 && (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              padding: '8px 24px', borderRadius: 6, fontSize: 13, fontWeight: 500,
              border: 'none', background: '#00B42A', color: '#fff',
              cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? '提交中…' : '提交制作'}
          </button>
        )}
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
      <span style={{ color: C.textTertiary, flexShrink: 0, width: 56 }}>{label}</span>
      <span style={{ color: C.textPrimary }}>{value}</span>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function BanboCustomizePage() {
  const [avatars, setAvatars] = useState<AvatarCard[]>([])
  const [view, setView] = useState<'list' | 'wizard'>('list')

  function handleWizardDone(card: Omit<AvatarCard, 'id'>) {
    setAvatars(prev => [...prev, { ...card, id: `av-${Date.now()}` }])
    setView('list')
  }

  if (view === 'wizard') {
    return <Wizard onDone={handleWizardDone} onCancel={() => setView('list')} />
  }

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: '#fff', fontFamily: T.fonts.family,
    }}>
      {/* 顶栏 */}
      <div style={{
        padding: '18px 24px',
        borderBottom: `1px solid ${C.border}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: C.textPrimary }}>我的伴播</div>
          <div style={{ fontSize: 12, color: C.textTertiary, marginTop: 2 }}>
            管理你的伴播形象，制作完成后可用于直播
          </div>
        </div>
        <button
          onClick={() => setView('wizard')}
          style={{
            padding: '8px 18px', borderRadius: 6, fontSize: 13, fontWeight: 500,
            border: 'none', background: C.primary, color: '#fff', cursor: 'pointer',
          }}
        >
          + 新建形象
        </button>
      </div>

      {/* 内容 */}
      <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
        {avatars.length === 0 ? (
          /* 空态 */
          <div style={{
            height: '100%', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            color: C.textTertiary, gap: 12, textAlign: 'center',
          }}>
            <div style={{ fontSize: 40 }}>🎭</div>
            <div style={{ fontSize: 14, color: C.textSecondary, fontWeight: 500 }}>
              还没有伴播形象
            </div>
            <div style={{ fontSize: 12, color: C.textTertiary, lineHeight: 1.7, maxWidth: 240 }}>
              点击「新建形象」，选择面容、关联商品<br />完成训练后即可在直播间使用
            </div>
            <button
              onClick={() => setView('wizard')}
              style={{
                marginTop: 8, padding: '9px 24px', borderRadius: 6,
                fontSize: 13, fontWeight: 500, border: `1px dashed ${C.border}`,
                background: '#FAFAFA', color: C.textSecondary, cursor: 'pointer',
              }}
            >
              + 新建第一个形象
            </button>
          </div>
        ) : (
          /* 形象卡片网格 */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: 14,
          }}>
            {avatars.map(av => {
              const st = STATUS_CONFIG[av.status]
              return (
                <div key={av.id} style={{
                  borderRadius: 10, border: `1px solid ${C.border}`,
                  background: '#FAFAFA', overflow: 'hidden',
                  cursor: 'pointer', transition: 'box-shadow 0.15s',
                }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = 'none'}
                >
                  {/* 头像区 */}
                  <div style={{
                    height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'linear-gradient(135deg, #EEF0FF 0%, #F5F4FF 100%)',
                    fontSize: 48,
                  }}>
                    {av.emoji}
                  </div>
                  {/* 信息区 */}
                  <div style={{ padding: '10px 12px' }}>
                    <div style={{
                      fontSize: 13, fontWeight: 600, color: C.textPrimary,
                      marginBottom: 6,
                    }}>{av.name}</div>
                    <span style={{
                      fontSize: 11, padding: '2px 8px', borderRadius: 10,
                      background: st.bg, color: st.color, fontWeight: 500,
                    }}>{st.label}</span>
                    {av.products.length > 0 && (
                      <div style={{ fontSize: 11, color: C.textTertiary, marginTop: 6 }}>
                        {av.products.length} 件商品
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
