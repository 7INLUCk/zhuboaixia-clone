import React, { useState, useRef, useEffect } from 'react'
import { tokens } from './tokens'
import type { SubmittedAvatarData, DraftFaceData } from './BanboCustomizePage'

const T = tokens
const C = T.colors

// ─── Types ────────────────────────────────────────────────────────────────────

type AvatarStatus = 'customizing' | 'making' | 'ready' | 'disabled' | 'expired'
type QuotaSource = 'membership' | 'purchased'

type ActionItem = { id: string; name: string; videoSrc: string }

type ProductChip = { id: string; value: string; status: 'success' | 'fail'; label?: string }

type BanboAvatar = {
  id: string
  name: string
  portraitUrl: string | null
  faceUrl: string | null
  status: AvatarStatus
  ageLabel: string
  ageGroup: string
  gender: string
  chips: ProductChip[]
  actions: ActionItem[]
  createdAt: string
  expiresAt: string        // 形象到期日 YYYY-MM-DD
  quotaSource: QuotaSource // 来自会员赠送还是单独购买
  draftFaceId?: string
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const ACTIONS_SAMPLE: ActionItem[] = [
  { id: 'enter',   name: '进场动作', videoSrc: '/videos/action_enter.mp4'  },
  { id: 'exit',    name: '出场动作', videoSrc: '/videos/action_exit.mp4'   },
  { id: 'daily-1', name: 'T台转身',  videoSrc: '/videos/action_daily1.mp4' },
  { id: 'daily-2', name: '侧身展示', videoSrc: '/videos/action_daily2.mp4' },
  { id: 'daily-3', name: '点头认可', videoSrc: '/videos/action_daily1.mp4' },
  { id: 'daily-4', name: '鼓掌欢呼', videoSrc: '/videos/action_daily2.mp4' },
  { id: 'daily-5', name: '比心',     videoSrc: '/videos/action_daily1.mp4' },
  { id: 'daily-6', name: '转圈展示', videoSrc: '/videos/action_daily2.mp4' },
  { id: 'daily-7', name: '蹦跳欢呼', videoSrc: '/videos/action_daily1.mp4' },
  { id: 'daily-8', name: '拍手节拍', videoSrc: '/videos/action_daily2.mp4' },
]

const INITIAL_AVATARS: BanboAvatar[] = [
  {
    id: 'av1',
    name: '小豆豆',
    portraitUrl: '/avatars/portrait-0-3-male.jpg',
    faceUrl: '/avatars/avatar-0-3-male.jpg',
    status: 'ready',
    ageLabel: '婴幼儿 0–3岁',
    ageGroup: '1-3',
    gender: '男',
    chips: [{ id: 'c1', value: 'https://item.taobao.com/item1', status: 'success', label: '儿童蓝条纹棉质套装' }],
    actions: ACTIONS_SAMPLE,
    createdAt: '2026-04-18',
    expiresAt: '2027-04-18',
    quotaSource: 'membership',
  },
  {
    id: 'av2',
    name: '小米米',
    portraitUrl: '/avatars/portrait-0-3-male.jpg',
    faceUrl: '/avatars/avatar-0-3-male.jpg',
    status: 'making',
    ageLabel: '婴幼儿 0–3岁',
    ageGroup: '1-3',
    gender: '男',
    chips: [],
    actions: ACTIONS_SAMPLE,
    createdAt: '2026-04-22',
    expiresAt: '2027-04-22',
    quotaSource: 'purchased',
  },
  {
    id: 'av3',
    name: '软软',
    portraitUrl: '/avatars/avatar-0-3-female.jpg',
    faceUrl: '/avatars/avatar-0-3-female.jpg',
    status: 'ready',
    ageLabel: '婴幼儿 0–3岁',
    ageGroup: '1-3',
    gender: '女',
    chips: [{ id: 'c2', value: 'https://item.taobao.com/item2', status: 'success', label: '婴儿蕾丝连衣裙' }],
    actions: ACTIONS_SAMPLE,
    createdAt: '2026-04-20',
    expiresAt: '2026-05-12', // 即将到期（演示橙色警告）
    quotaSource: 'purchased',
  },
  // 固定写死的"正在定制中"演示卡
  {
    id: 'av-demo-draft',
    name: '甜甜',
    portraitUrl: '/avatars/avatar-4-6-female.jpg',
    faceUrl: '/avatars/avatar-4-6-female.jpg',
    status: 'customizing',
    ageLabel: '幼儿 4–6岁',
    ageGroup: '4-6',
    gender: '女',
    chips: [],
    actions: [],
    createdAt: '2026-04-22',
    expiresAt: '',
    quotaSource: 'membership',
    draftFaceId: 'f10',
  },
]

const QUOTA_TOTAL = 10

// 配额来源 mock
const QUOTA_MEMBERSHIP = { total: 2, used: 1, expiresAt: '2026-05-23' }
// 多批次购买，各自有不同到期时间
const QUOTA_PURCHASED_BATCHES = [
  { total: 3, used: 2, expiresAt: '2026-12-01' },
  { total: 5, used: 1, expiresAt: '2027-06-15' },
]
const QUOTA_PURCHASED = {
  total: QUOTA_PURCHASED_BATCHES.reduce((s, b) => s + b.total, 0),
  used:  QUOTA_PURCHASED_BATCHES.reduce((s, b) => s + b.used,  0),
  earliestExpiresAt: QUOTA_PURCHASED_BATCHES
    .map(b => b.expiresAt).sort()[0],
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<AvatarStatus, { label: string; bg: string; color: string; dot: string }> = {
  customizing: { label: '草稿',   bg: '#F5F4FF', color: '#5850EC', dot: '#5850EC' },
  making:      { label: '制作中', bg: '#FFF7ED', color: '#C2410C', dot: '#F97316' },
  ready:       { label: '可使用', bg: '#F0FDF4', color: '#16A34A', dot: '#22C55E' },
  disabled:    { label: '已停用', bg: '#F9FAFB', color: '#6B7280', dot: '#D1D5DB' },
  expired:     { label: '已过期', bg: '#FEF2F2', color: '#DC2626', dot: '#EF4444' },
}

// 计算距今天数（正数=未来，负数=已过期）
function daysUntil(dateStr: string): number {
  if (!dateStr) return 999
  const diff = new Date(dateStr).getTime() - new Date('2026-04-23').getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// ─── Draft Card（真实挂钩）────────────────────────────────────────────────────

function DraftCard({ faceData, onClick }: { faceData: DraftFaceData | null; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: '#fff', borderRadius: 12,
        border: `2px dashed ${C.primary}`, overflow: 'hidden',
        cursor: 'pointer', transition: 'box-shadow 0.15s',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 3px ${C.primary}22` }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)' }}
    >
      <div style={{
        position: 'relative', paddingTop: '100%',
        background: faceData ? '#F0F1F5' : 'linear-gradient(135deg, #EEF0FF 0%, #F5F4FF 100%)',
      }}>
        {faceData ? (
          <img
            src={faceData.faceUrl}
            alt={faceData.name}
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: 'center top',
            }}
          />
        ) : (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 6,
          }}>
            <div style={{ fontSize: 32, opacity: 0.4 }}>🐟</div>
            <div style={{ fontSize: 11, color: C.primary, fontWeight: 500, opacity: 0.7 }}>继续定制 →</div>
          </div>
        )}
        <div style={{
          position: 'absolute', top: 8, right: 8,
          display: 'flex', alignItems: 'center', gap: 4,
          background: '#F5F4FF', color: C.primary,
          fontSize: 11, fontWeight: 500,
          padding: '3px 7px', borderRadius: 20, border: `1px solid ${C.primary}44`,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.primary, display: 'inline-block' }} />
          草稿
        </div>
      </div>
      <div style={{ padding: '12px 14px 14px' }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: C.textPrimary, marginBottom: 4 }}>
          {faceData ? faceData.name : '进行中的形象'}
        </div>
        {faceData ? (
          <>
            <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
              {[faceData.gender, `${faceData.ageGroup}岁`].map(tag => (
                <span key={tag} style={{ fontSize: 10, color: C.textSecondary, background: '#F3F4F6', borderRadius: 4, padding: '1px 5px' }}>{tag}</span>
              ))}
            </div>
            <div style={{ fontSize: 11, color: C.textTertiary }}>未绑定商品</div>
          </>
        ) : (
          <div style={{ fontSize: 11, color: C.textSecondary }}>点击继续定制</div>
        )}
      </div>
    </div>
  )
}

// ─── Avatar Card ──────────────────────────────────────────────────────────────

function AvatarCard({
  avatar, selected, onClick,
}: {
  avatar: BanboAvatar; selected: boolean; onClick: () => void
}) {
  const st = STATUS_CONFIG[avatar.status]
  const isDraft = avatar.status === 'customizing'

  return (
    <div
      onClick={onClick}
      style={{
        background: '#fff',
        borderRadius: 12,
        border: `2px solid ${selected ? C.primary : isDraft ? `${C.primary}66` : C.border}`,
        borderStyle: isDraft ? 'dashed' : 'solid',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        boxShadow: selected ? `0 0 0 3px ${C.primary}22` : '0 1px 4px rgba(0,0,0,0.06)',
      }}
      onMouseEnter={e => {
        if (!selected) (e.currentTarget as HTMLElement).style.borderColor = '#C7C4FA'
      }}
      onMouseLeave={e => {
        if (!selected) (e.currentTarget as HTMLElement).style.borderColor = isDraft ? `${C.primary}66` : C.border
      }}
    >
      {/* Portrait */}
      <div style={{
        position: 'relative', paddingTop: '100%',
        background: isDraft ? 'linear-gradient(135deg, #EEF0FF, #F5F4FF)' : '#F0F1F5',
      }}>
        {avatar.portraitUrl ? (
          <img
            src={avatar.portraitUrl}
            alt={avatar.name}
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: 'center top',
            }}
          />
        ) : (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, opacity: 0.35,
          }}>🐟</div>
        )}
        {/* Status badge */}
        <div style={{
          position: 'absolute', top: 8, right: 8,
          display: 'flex', alignItems: 'center', gap: 4,
          background: st.bg, color: st.color,
          fontSize: 11, fontWeight: 500,
          padding: '3px 7px', borderRadius: 20,
          border: `1px solid ${st.color}33`,
        }}>
          {avatar.status === 'making' ? (
            <span style={{
              display: 'inline-block', width: 7, height: 7, borderRadius: '50%',
              border: `2px solid ${st.dot}`, borderTopColor: 'transparent',
              animation: 'spin 0.8s linear infinite',
            }} />
          ) : (
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: st.dot, display: 'inline-block' }} />
          )}
          {st.label}
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '12px 14px 14px' }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4,
          color: avatar.name ? C.textPrimary : C.textTertiary,
          fontStyle: avatar.name ? 'normal' : 'italic',
        }}>
          {avatar.name || '未命名形象'}
        </div>
        <div style={{ display: 'flex', gap: 4, marginBottom: 6, flexWrap: 'wrap' }}>
          {[avatar.gender, `${avatar.ageGroup}岁`].map(tag => (
            <span key={tag} style={{ fontSize: 10, color: C.textSecondary, background: '#F3F4F6', borderRadius: 4, padding: '1px 5px' }}>{tag}</span>
          ))}
        </div>
        {(() => {
          const firstChip = avatar.chips.find(c => c.status === 'success')
          return (
            <div style={{
              fontSize: 11, color: firstChip ? C.textSecondary : C.textTertiary,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {firstChip ? `${firstChip.label ?? firstChip.value}` : '未绑定商品'}
            </div>
          )
        })()}
      </div>
    </div>
  )
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

const MOCK_PRODUCT_NAMES = [
  '【2026春季新款】男童加绒加厚牛仔裤弹力直筒儿童长裤宝宝休闲裤',
  '女童蕾丝花边连衣裙春秋款洋气公主裙儿童裙子中大童蓬蓬裙',
  '男童运动套装春秋款儿童卫衣卫裤两件套中大童休闲跑步服',
  '婴儿纯棉连体衣秋冬款宝宝爬服哈衣新生儿满月礼盒装',
  '女童针织开衫外套春秋薄款儿童毛衣外搭宝宝洋气上衣',
  '男童牛仔外套春秋款儿童夹克上衣中大童韩版潮流工装外套',
  '儿童防晒衣夏季薄款男女童户外防紫外线透气皮肤衣外套',
  '女童碎花衬衫春季韩版儿童宽松长袖上衣中大童洋气打底衫',
]

function DetailPanel({
  avatar, onClose, onUpdateChips, onUpdateStatus, onRename,
}: {
  avatar: BanboAvatar
  onClose: () => void
  onUpdateChips: (id: string, chips: ProductChip[]) => void
  onUpdateStatus: (id: string, status: AvatarStatus) => void
  onRename: (id: string, name: string) => void
}) {
  const [confirmDisable, setConfirmDisable] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(avatar.name)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const st = STATUS_CONFIG[avatar.status]

  useEffect(() => { setNameInput(avatar.name) }, [avatar.name])
  useEffect(() => { if (editingName) nameInputRef.current?.select() }, [editingName])

  function commitRename() {
    const trimmed = nameInput.trim()
    if (trimmed && trimmed !== avatar.name) onRename(avatar.id, trimmed)
    else setNameInput(avatar.name)
    setEditingName(false)
  }
  const [chips, setChips] = useState<ProductChip[]>(avatar.chips)
  const [currentInput, setCurrentInput] = useState('')
  const [currentStatus, setCurrentStatus] = useState<'idle' | 'loading' | 'fail'>('idle')
  const [chipDeleteError, setChipDeleteError] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const deleteErrorTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleInputChange(value: string) {
    setCurrentInput(value)
    if (!value.trim()) { setCurrentStatus('idle'); return }
    setCurrentStatus('loading')
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      const success = /\d{6,}/.test(value) || value.includes('http') || value.includes('www')
      if (success) {
        const label = MOCK_PRODUCT_NAMES[Math.floor(Math.random() * MOCK_PRODUCT_NAMES.length)]
        const newChip: ProductChip = { id: Date.now().toString(), value, status: 'success', label }
        setChips(prev => {
          const next = [...prev, newChip]
          onUpdateChips(avatar.id, next)
          return next
        })
        setCurrentInput('')
        setCurrentStatus('idle')
      } else {
        setCurrentStatus('fail')
      }
    }, 800)
  }

  function removeChip(chipId: string) {
    if (chips.length <= 1) {
      setChipDeleteError(true)
      if (deleteErrorTimer.current) clearTimeout(deleteErrorTimer.current)
      deleteErrorTimer.current = setTimeout(() => setChipDeleteError(false), 2500)
      return
    }
    setChips(prev => {
      const next = prev.filter(c => c.id !== chipId)
      onUpdateChips(avatar.id, next)
      return next
    })
  }

  return (
    <div style={{
      position: 'absolute', top: 0, right: 0, bottom: 0,
      width: 380,
      background: '#fff',
      borderLeft: `1px solid ${C.border}`,
      display: 'flex', flexDirection: 'column',
      zIndex: 10,
      boxShadow: '-4px 0 20px rgba(0,0,0,0.08)',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {avatar.faceUrl ? (
            <img
              src={avatar.faceUrl}
              alt=""
              style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', objectPosition: 'center top' }}
            />
          ) : (
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: '#EEF0FF', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18,
            }}>🐟</div>
          )}
          <div>
            {editingName ? (
              <input
                ref={nameInputRef}
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onBlur={commitRename}
                onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') { setNameInput(avatar.name); setEditingName(false) } }}
                style={{
                  fontWeight: 600, fontSize: 15, color: C.textPrimary,
                  border: `1px solid ${C.primary}`, borderRadius: 4,
                  padding: '1px 6px', outline: 'none', width: 160,
                }}
              />
            ) : (
              <div
                onClick={() => setEditingName(true)}
                title="点击改名"
                style={{
                  fontWeight: 600, fontSize: 15, cursor: 'text',
                  display: 'flex', alignItems: 'center', gap: 5,
                  color: avatar.name ? C.textPrimary : C.textTertiary,
                  fontStyle: avatar.name ? 'normal' : 'italic',
                }}
              >
                {avatar.name || '未命名形象'}
                <span style={{ fontSize: 11, color: C.textTertiary, fontWeight: 400 }}>✏️</span>
              </div>
            )}
            <div style={{ display: 'flex', gap: 4, marginTop: 3 }}>
              {[avatar.gender, `${avatar.ageGroup}岁`].map(tag => (
                <span key={tag} style={{ fontSize: 10, color: C.textSecondary, background: '#F3F4F6', borderRadius: 4, padding: '1px 5px' }}>{tag}</span>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: st.bg, color: st.color, fontSize: 11, fontWeight: 500,
            padding: '3px 8px', borderRadius: 20, border: `1px solid ${st.color}33`,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: st.dot, display: 'inline-block' }} />
            {st.label}
          </span>
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28, borderRadius: 6, border: `1px solid ${C.border}`,
              background: 'transparent', cursor: 'pointer', color: C.textSecondary,
              fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >×</button>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>

        {/* Portrait */}
        {avatar.portraitUrl && (
          <div style={{ borderRadius: 10, overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ position: 'relative', paddingTop: '75%', background: '#F0F1F5' }}>
              <img
                src={avatar.portraitUrl}
                alt="定装照"
                style={{
                  position: 'absolute', inset: 0, width: '100%', height: '100%',
                  objectFit: 'cover', objectPosition: 'center top',
                }}
              />
              <span style={{
                position: 'absolute', bottom: 8, left: 8,
                background: 'rgba(0,0,0,0.45)', color: '#fff',
                fontSize: 11, padding: '2px 8px', borderRadius: 10,
              }}>定装照</span>
            </div>
          </div>
        )}

        {/* Product — chip 识别流 */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: C.textSecondary, fontWeight: 500, marginBottom: 6 }}>
            绑定商品
          </div>
          {chips.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: chipDeleteError ? 4 : 8 }}>
              {chips.map(chip => (
                <div key={chip.id} style={{
                  display: 'flex', alignItems: 'center', gap: 3,
                  padding: '3px 6px 3px 8px', borderRadius: 12,
                  background: chipDeleteError && chips.length === 1 ? '#FEF2F2' : chip.status === 'success' ? '#F0FDF4' : '#FEF2F2',
                  border: `1px solid ${chipDeleteError && chips.length === 1 ? '#FECACA' : chip.status === 'success' ? '#86EFAC' : '#FECACA'}`,
                  fontSize: 11, color: chipDeleteError && chips.length === 1 ? '#DC2626' : chip.status === 'success' ? '#16A34A' : '#DC2626',
                  maxWidth: 300,
                  transition: 'all 0.2s',
                }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 240 }}>
                    {chip.status === 'success' ? '✓ ' : '✗ '}{chip.label ?? chip.value}
                  </span>
                  <button onClick={() => removeChip(chip.id)} style={{
                    background: 'none', border: 'none', cursor: chips.length <= 1 ? 'not-allowed' : 'pointer', padding: '0 2px',
                    color: chipDeleteError && chips.length === 1 ? '#DC2626' : chip.status === 'success' ? '#16A34A' : '#DC2626',
                    fontSize: 14, lineHeight: 1, flexShrink: 0,
                    opacity: chips.length <= 1 ? 0.4 : 1,
                  }}>×</button>
                </div>
              ))}
            </div>
          )}
          {chipDeleteError && (
            <div style={{ fontSize: 11, color: '#DC2626', marginBottom: 6 }}>
              至少需保留 1 件绑定商品，不可删除
            </div>
          )}
          <input
            value={currentInput}
            onChange={e => handleInputChange(e.target.value)}
            placeholder={chips.length === 0 ? '粘贴抖店商品链接或商品 ID' : '继续添加…'}
            style={{
              width: '100%', padding: '7px 10px', borderRadius: 6, boxSizing: 'border-box',
              border: `1px solid ${currentStatus === 'fail' ? '#F87171' : C.border}`,
              fontSize: 12, color: C.textPrimary, outline: 'none',
            }}
            onFocus={e => { if (currentStatus !== 'fail') e.target.style.borderColor = C.primary }}
            onBlur={e => { if (currentStatus !== 'fail') e.target.style.borderColor = C.border }}
          />
          {currentStatus === 'loading' && (
            <div style={{ fontSize: 11, color: C.textTertiary, marginTop: 3 }}>识别中…</div>
          )}
          {currentStatus === 'fail' && (
            <div style={{ fontSize: 11, color: '#DC2626', marginTop: 3 }}>✗ 识别失败，请检查链接或 ID 是否正确</div>
          )}
        </div>

        {/* Actions */}
        {avatar.actions.length > 0 && (
          <div>
            <div style={{ fontSize: 12, color: C.textSecondary, fontWeight: 500, marginBottom: 10 }}>
              动作素材（{avatar.actions.length} 个）
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
              {avatar.actions.map(action => (
                <div key={action.id} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{
                    position: 'relative', paddingTop: '100%',
                    borderRadius: 6, overflow: 'hidden', background: '#F0F1F5',
                  }}>
                    <video
                      src={action.videoSrc}
                      autoPlay loop muted playsInline
                      style={{
                        position: 'absolute', inset: 0, width: '100%', height: '100%',
                        objectFit: 'cover', objectPosition: 'center top',
                      }}
                    />
                  </div>
                  <div style={{
                    fontSize: 10, color: C.textSecondary, textAlign: 'center',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {action.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ height: 8 }} />
      </div>

      {/* Footer */}
      <div style={{
        padding: '12px 20px',
        borderTop: `1px solid ${C.border}`,
        display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0,
      }}>
        {/* 停用确认提示 */}
        {confirmDisable && (
          <div style={{
            background: '#FEF2F2', border: '1px solid #FECACA',
            borderRadius: 8, padding: '10px 14px',
            fontSize: 12, color: '#DC2626',
          }}>
            <div style={{ fontWeight: 500, marginBottom: 6 }}>确认停用该形象？</div>
            <div style={{ color: '#991B1B', marginBottom: 10, lineHeight: 1.5 }}>
              停用后该形象将不再参与直播伴播，已完成的制作不会丢失，可随时重新启用。
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setConfirmDisable(false)}
                style={{
                  flex: 1, height: 30, borderRadius: 6,
                  border: `1px solid #FECACA`, background: '#fff',
                  color: '#DC2626', fontSize: 12, cursor: 'pointer',
                }}
              >取消</button>
              <button
                onClick={() => { onUpdateStatus(avatar.id, 'disabled'); setConfirmDisable(false) }}
                style={{
                  flex: 1, height: 30, borderRadius: 6,
                  border: 'none', background: '#DC2626',
                  color: '#fff', fontSize: 12, fontWeight: 500, cursor: 'pointer',
                }}
              >确认停用</button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          {avatar.status === 'making' && (
            <div style={{
              flex: 1, height: 36, borderRadius: 8,
              background: '#FFF7ED', color: '#C2410C',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 500,
            }}>
              训练中，预计 30 分钟内完成
            </div>
          )}
          {avatar.status === 'ready' && !confirmDisable && (
            <button
              onClick={() => setConfirmDisable(true)}
              style={{
                flex: 1, height: 36, borderRadius: 8,
                border: `1px solid ${C.border}`, background: '#fff',
                color: C.textSecondary, fontSize: 13, cursor: 'pointer',
              }}
            >
              停用
            </button>
          )}
          {avatar.status === 'disabled' && (
            <button
              onClick={() => onUpdateStatus(avatar.id, 'ready')}
              style={{
                flex: 1, height: 36, borderRadius: 8,
                border: `1px solid ${C.primary}`, background: '#fff',
                color: C.primary, fontWeight: 600, fontSize: 13, cursor: 'pointer',
              }}
            >
              重新启用
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BanboManagePage({
  onNewAvatar,
  draftInProgress,
  draftFaceData,
  onContinueDraft,
  submittedAvatars = [],
  onPurchaseMore,
}: {
  onNewAvatar: () => void
  draftInProgress?: boolean
  draftFaceData?: DraftFaceData | null
  onContinueDraft?: (faceId?: string) => void
  submittedAvatars?: SubmittedAvatarData[]
  onPurchaseMore?: () => void
}) {
  const [avatars, setAvatars] = useState<BanboAvatar[]>(INITIAL_AVATARS)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const processedCountRef = useRef(0)

  useEffect(() => {
    const newOnes = submittedAvatars.slice(processedCountRef.current)
    if (newOnes.length === 0) return
    const startIdx = processedCountRef.current
    processedCountRef.current = submittedAvatars.length
    setAvatars(prev => {
      const added = newOnes.map((s, offset) => {
        const baseName = s.name
        const sameCount = prev.filter(a =>
          a.name === baseName || new RegExp(`^${baseName} \\d+$`).test(a.name)
        ).length
        const seq = sameCount + offset + 1
        return {
          id: `submitted-${startIdx + offset}`,
          name: `${baseName} ${seq}`,
          portraitUrl: s.portraitUrl || null,
          faceUrl: s.faceUrl || null,
          status: 'making' as AvatarStatus,
          ageLabel: s.ageLabel,
          ageGroup: s.ageGroup ?? '',
          gender: s.gender,
          chips: s.product ? [{ id: `sub-c-${startIdx + offset}`, value: '', status: 'success' as const, label: s.product }] : [],
          actions: ACTIONS_SAMPLE,
          createdAt: new Date().toISOString().slice(0, 10),
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          quotaSource: 'purchased' as QuotaSource,
        }
      })
      return [...added, ...prev]
    })
  }, [submittedAvatars])

  const [statusFilter, setStatusFilter] = useState<'all' | AvatarStatus | 'customizing'>('all')

  const nonDraftAvatars = avatars.filter(a => a.status !== 'customizing')
  const quotaUsed = nonDraftAvatars.length + (draftInProgress ? 1 : 0)
  const quotaLeft = QUOTA_TOTAL - quotaUsed
  const selectedAvatar = avatars.find(a => a.id === selectedId) ?? null

  // 筛选计数
  const countAll = avatars.length + (draftInProgress ? 1 : 0)
  const countReady = avatars.filter(a => a.status === 'ready').length
  const countDraft = avatars.filter(a => a.status === 'customizing').length + (draftInProgress ? 1 : 0)
  const countMaking = avatars.filter(a => a.status === 'making').length
  const countDisabled = avatars.filter(a => a.status === 'disabled').length
  const countExpired = avatars.filter(a => a.status === 'expired').length

  const STATUS_TABS = [
    { key: 'all',        label: '全部',   count: countAll },
    { key: 'ready',      label: '可使用', count: countReady },
    { key: 'customizing',label: '草稿',   count: countDraft },
    { key: 'making',     label: '制作中', count: countMaking },
    { key: 'disabled',   label: '已停用', count: countDisabled },
    { key: 'expired',    label: '已过期', count: countExpired },
  ] as const

  function handleAvatarClick(avatar: BanboAvatar) {
    if (avatar.status === 'customizing') {
      onContinueDraft?.(avatar.draftFaceId)
    } else {
      setSelectedId(selectedId === avatar.id ? null : avatar.id)
    }
  }

  function updateChips(id: string, chips: ProductChip[]) {
    setAvatars(prev => prev.map(a => a.id === id ? { ...a, chips } : a))
  }

  function updateStatus(id: string, status: AvatarStatus) {
    setAvatars(prev => prev.map(a => a.id === id ? { ...a, status } : a))
  }

  function updateName(id: string, name: string) {
    setAvatars(prev => prev.map(a => a.id === id ? { ...a, name } : a))
  }

  const membershipDaysLeft = daysUntil(QUOTA_MEMBERSHIP.expiresAt)
  const membershipAvail = QUOTA_MEMBERSHIP.total - QUOTA_MEMBERSHIP.used
  const purchasedAvail = QUOTA_PURCHASED.total - QUOTA_PURCHASED.used
  const membershipUrgent = membershipAvail > 0 && membershipDaysLeft <= 7

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: '#F0F1F5', position: 'relative', overflow: 'hidden',
    }}>
      {/* Top bar：配额 chip + 新建按钮 + underline Tab 一体化 */}
      <div style={{
        padding: '0 24px',
        background: '#fff',
        borderBottom: `1px solid ${C.border}`,
        flexShrink: 0,
      }}>
        {/* 操作行 */}
        <div style={{
          height: 52, display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 12,
        }}>
          {/* 左：统一配额 chip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '4px 14px', borderRadius: 20,
              background: '#fff', border: `1px solid #E5E6EB`,
            }}>
              <span style={{ fontSize: 12, color: C.textSecondary }}>已定制</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.textPrimary }}>{quotaUsed} / {QUOTA_TOTAL}</span>
              <span style={{ fontSize: 12, color: C.textSecondary }}>个伴播形象</span>
            </div>
            {/* 购买更多链接 */}
            <span
              onClick={onPurchaseMore}
              style={{ fontSize: 12, color: C.primary, cursor: 'pointer' }}
            >
              购买更多 →
            </span>
          </div>
          {/* 右：新建按钮 */}
          <button
            onClick={onNewAvatar}
            disabled={quotaLeft === 0}
            style={{
              height: 34, padding: '0 16px', borderRadius: 8, border: 'none',
              background: quotaLeft === 0 ? '#E5E6EB' : C.primary,
              color: quotaLeft === 0 ? C.textTertiary : '#fff',
              fontWeight: 600, fontSize: 13, flexShrink: 0,
              cursor: quotaLeft === 0 ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 5,
            }}
          >
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>
            新建伴播
          </button>
        </div>

        {/* Underline Tab 行 */}
        <div style={{ display: 'flex', gap: 0 }}>
          {STATUS_TABS.map(tab => {
            const active = statusFilter === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key as typeof statusFilter)}
                style={{
                  padding: '8px 14px', border: 'none', background: 'transparent',
                  cursor: 'pointer', fontFamily: T.fonts.family,
                  display: 'flex', alignItems: 'center', gap: 5,
                  borderBottom: active ? `2px solid ${C.primary}` : '2px solid transparent',
                  marginBottom: -1,
                  color: active ? C.primary : C.textSecondary,
                  fontSize: 13, fontWeight: active ? 600 : 400,
                  transition: 'color 0.15s',
                }}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span style={{
                    fontSize: 11, minWidth: 16, height: 16, borderRadius: 8,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    background: active ? `${C.primary}18` : '#F0F1F5',
                    color: active ? C.primary : C.textTertiary,
                    padding: '0 4px',
                  }}>{tab.count}</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Card grid */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '20px 24px',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 220px))',
          gap: 16,
        }}>
          {/* 真实挂钩的"定制中"卡片 */}
          {draftInProgress && (statusFilter === 'all' || statusFilter === 'customizing') && (
            <DraftCard faceData={draftFaceData ?? null} onClick={() => onContinueDraft?.()} />
          )}

          {/* 所有形象卡片（含固定写死的那张 customizing） */}
          {avatars
            .filter(a => statusFilter === 'all' || a.status === statusFilter)
            .map(avatar => (
              <AvatarCard
                key={avatar.id}
                avatar={avatar}
                selected={selectedId === avatar.id}
                onClick={() => handleAvatarClick(avatar)}
              />
            ))
          }

          {/* 新建占位卡（筛选全部或可使用时才显示） */}
          {quotaLeft > 0 && !draftInProgress && (statusFilter === 'all' || statusFilter === 'ready') && (
            <div
              onClick={onNewAvatar}
              style={{
                borderRadius: 12,
                border: `2px dashed ${C.border}`,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                minHeight: 240, cursor: 'pointer', gap: 8,
                color: C.textTertiary, fontSize: 12,
                transition: 'border-color 0.15s, color 0.15s',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = C.primary
                el.style.color = C.primary
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = C.border
                el.style.color = C.textTertiary
              }}
            >
              <div style={{ fontSize: 28 }}>+</div>
              <div>新建形象</div>
            </div>
          )}
        </div>
      </div>

      {/* Detail panel */}
      {selectedAvatar && (
        <DetailPanel
          avatar={selectedAvatar}
          onClose={() => setSelectedId(null)}
          onUpdateChips={updateChips}
          onUpdateStatus={updateStatus}
          onRename={updateName}
        />
      )}
    </div>
  )
}
