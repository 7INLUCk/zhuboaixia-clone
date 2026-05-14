import React, { useState, useRef, useEffect } from 'react'
import { tokens } from './tokens'

const T = tokens
const C = T.colors

// ─── Types ────────────────────────────────────────────────────────────────────

type SlotData = { link: string; imageUrl: string | null }
type ActionDef = { id: string; name: string; duration: number }
type ActionCard = {
  id: string; name: string; category: 'daily' | 'enter' | 'exit'
  color: string; generating: boolean; done: boolean
  actionId: string; actionName: string; duration: number
}
type AgeGroup = '1-3' | '4-6' | '7-10' | '11-13' | '14-17'
type Gender = '男' | '女'
type AvatarFace = {
  id: string; name: string; gender: Gender; ageGroup: AgeGroup; ageLabel: string; imageUrl: string
}

type RefImageType = 'white_bg' | 'product_display' | 'multi_product' | 'human_outfit'
type RefImagePart = '上衣' | '裤/裙' | '鞋子'
type RefImagePhase = 'compliance' | 'typing' | 'selecting' | 'confirmed' | 'rejected'
type RefImage = {
  id: string; url: string; phase: RefImagePhase
  rejectReason?: string
  imageType?: RefImageType
  detectedParts?: RefImagePart[]
  selectedParts?: RefImagePart[]
  partsLocked?: boolean  // true when AI detected human_outfit (full-body), auto-selects all parts
  chromaBg?: 'green' | 'blue' | 'yellow'
  chromaOverridden?: boolean
}

const REF_TYPE_LABEL: Record<RefImageType, string> = {
  white_bg: '白底素图', product_display: '纯商品图',
  multi_product: '多商品图', human_outfit: '人物穿搭图',
}
const REF_TYPE_STYLE: Record<RefImageType, { bg: string; color: string }> = {
  white_bg:        { bg: '#F0FDF4', color: '#16A34A' },
  product_display: { bg: '#EFF6FF', color: '#2563EB' },
  multi_product:   { bg: '#FFF7ED', color: '#C2410C' },
  human_outfit:    { bg: '#FDF4FF', color: '#7E22CE' },
}
const MOCK_TYPE_CYCLE: RefImageType[] = ['human_outfit', 'white_bg', 'multi_product']

// ─── Constants ────────────────────────────────────────────────────────────────

const AGE_LABELS: Record<AgeGroup, string> = {
  '1-3':   '婴幼儿 1–3岁',
  '4-6':   '幼儿 4–6岁',
  '7-10':  '儿童 7–10岁',
  '11-13': '小学生 11–13岁',
  '14-17': '青少年 14–17岁',
}

const PUBLIC_FACES: AvatarFace[] = [
  // 婴幼儿 1-3
  { id: 'f01', name: '小豆豆', gender: '男', ageGroup: '1-3', ageLabel: AGE_LABELS['1-3'], imageUrl: '/avatars/avatar-0-3-male.jpg' },
  { id: 'f02', name: '壮壮',   gender: '男', ageGroup: '1-3', ageLabel: AGE_LABELS['1-3'], imageUrl: '/avatars/avatar-0-3-male.jpg' },
  { id: 'f03', name: '小兔兔', gender: '女', ageGroup: '1-3', ageLabel: AGE_LABELS['1-3'], imageUrl: '/avatars/avatar-0-3-female.jpg' },
  { id: 'f04', name: '软软',   gender: '女', ageGroup: '1-3', ageLabel: AGE_LABELS['1-3'], imageUrl: '/avatars/avatar-0-3-female.jpg' },
  // 幼儿 4-6
  { id: 'f05', name: '乐乐', gender: '男', ageGroup: '4-6', ageLabel: AGE_LABELS['4-6'], imageUrl: '/avatars/avatar-4-6-male.jpg' },
  { id: 'f06', name: '嘟嘟', gender: '男', ageGroup: '4-6', ageLabel: AGE_LABELS['4-6'], imageUrl: '/avatars/avatar-4-6-male.jpg' },
  { id: 'f07', name: '甜甜', gender: '女', ageGroup: '4-6', ageLabel: AGE_LABELS['4-6'], imageUrl: '/avatars/avatar-4-6-female.jpg' },
  { id: 'f08', name: '萌萌', gender: '女', ageGroup: '4-6', ageLabel: AGE_LABELS['4-6'], imageUrl: '/avatars/avatar-4-6-female.jpg' },
  // 儿童 7-10
  { id: 'f09', name: '阳阳', gender: '男', ageGroup: '7-10', ageLabel: AGE_LABELS['7-10'], imageUrl: '/avatars/avatar-7-12-male.jpg' },
  { id: 'f10', name: '浩浩', gender: '男', ageGroup: '7-10', ageLabel: AGE_LABELS['7-10'], imageUrl: '/avatars/avatar-7-12-male.jpg' },
  { id: 'f11', name: '晴晴', gender: '女', ageGroup: '7-10', ageLabel: AGE_LABELS['7-10'], imageUrl: '/avatars/avatar-7-12-female.jpg' },
  { id: 'f12', name: '悦悦', gender: '女', ageGroup: '7-10', ageLabel: AGE_LABELS['7-10'], imageUrl: '/avatars/avatar-7-12-female.jpg' },
  // 小学生 11-13
  { id: 'f13', name: '子豪', gender: '男', ageGroup: '11-13', ageLabel: AGE_LABELS['11-13'], imageUrl: '/avatars/avatar-7-12-male.jpg' },
  { id: 'f14', name: '浩宇', gender: '男', ageGroup: '11-13', ageLabel: AGE_LABELS['11-13'], imageUrl: '/avatars/avatar-7-12-male.jpg' },
  { id: 'f15', name: '子涵', gender: '女', ageGroup: '11-13', ageLabel: AGE_LABELS['11-13'], imageUrl: '/avatars/avatar-7-12-female.jpg' },
  { id: 'f16', name: '晓雨', gender: '女', ageGroup: '11-13', ageLabel: AGE_LABELS['11-13'], imageUrl: '/avatars/avatar-7-12-female.jpg' },
  // 青少年 14-17
  { id: 'f17', name: '俊楠', gender: '男', ageGroup: '14-17', ageLabel: AGE_LABELS['14-17'], imageUrl: '/avatars/avatar-13-17-male.jpg' },
  { id: 'f18', name: '宇轩', gender: '男', ageGroup: '14-17', ageLabel: AGE_LABELS['14-17'], imageUrl: '/avatars/avatar-13-17-male.jpg' },
  { id: 'f19', name: '语桐', gender: '女', ageGroup: '14-17', ageLabel: AGE_LABELS['14-17'], imageUrl: '/avatars/avatar-13-17-female.jpg' },
  { id: 'f20', name: '欣妍', gender: '女', ageGroup: '14-17', ageLabel: AGE_LABELS['14-17'], imageUrl: '/avatars/avatar-13-17-female.jpg' },
]

const CARD_COLORS = ['#FFB3D9','#B3D4FF','#C8F0D0','#FFE0B0','#D0E0FF','#FFD4F0','#FFCCE0','#A0C8FF']
const DAILY_OPS_LIMIT = 2

const ACTION_LIBRARY: ActionDef[] = [
  { id: 'a1',  name: '入场走步',   duration: 5  },
  { id: 'a2',  name: 'T台转身',    duration: 8  },
  { id: 'a3',  name: '侧身展示',   duration: 6  },
  { id: 'a4',  name: '指向商品',   duration: 4  },
  { id: 'a5',  name: '点头认可',   duration: 3  },
  { id: 'a6',  name: '鼓掌欢呼',   duration: 5  },
  { id: 'a7',  name: '比心',       duration: 4  },
  { id: 'a8',  name: '鞠躬感谢',   duration: 5  },
  { id: 'a9',  name: '挥手再见',   duration: 4  },
  { id: 'a10', name: '指向小黄车', duration: 6  },
  { id: 'a11', name: '倒数321',    duration: 6  },
  { id: 'a12', name: '操作手机',   duration: 8  },
  { id: 'a13', name: '展示细节',   duration: 7  },
  { id: 'a14', name: '转圈展示',   duration: 8  },
  { id: 'a15', name: '蹦跳欢呼',   duration: 6  },
  { id: 'a16', name: '摇摆展示',   duration: 7  },
  { id: 'a17', name: '拍手节拍',   duration: 5  },
  { id: 'a18', name: '鲨鱼摇',     duration: 12 },
  { id: 'a19', name: '刀马刀马',   duration: 10 },
  { id: 'a20', name: '大舌头',     duration: 8  },
]

const ACTION_PREVIEW_COLORS = [
  '#FFB3D9','#B3D4FF','#C8F0D0','#FFE0B0','#D0E0FF',
  '#FFD4F0','#FFCCE0','#A0C8FF','#F0E8D0','#D8F0E8',
  '#E8D8FF','#FFE8C8','#D0F4FF','#FFD4C0','#C0E8D8',
  '#F4FFD0','#FFE0D8','#D4C8FF','#FFD0C0','#C8F4D8',
]

const DAILY_ACTION_IDS = ['a2','a3','a5','a6','a7','a14','a15','a17']

function makeActionCards(): ActionCard[] {
  const enter = ACTION_LIBRARY.find(a => a.id === 'a1')!
  const exit  = ACTION_LIBRARY.find(a => a.id === 'a9')!
  return [
    { id: 'enter', name: '进场动作', category: 'enter', color: '#E8F3FF',
      actionId: enter.id, actionName: enter.name, duration: enter.duration,
      generating: false, done: false },
    { id: 'exit',  name: '出场动作', category: 'exit',  color: '#FFF0E8',
      actionId: exit.id,  actionName: exit.name,  duration: exit.duration,
      generating: false, done: false },
    ...DAILY_ACTION_IDS.map((actionId, i) => {
      const action = ACTION_LIBRARY.find(a => a.id === actionId)!
      return {
        id: `daily-${i + 1}`, name: action.name, category: 'daily' as const,
        color: CARD_COLORS[i], actionId, actionName: action.name, duration: action.duration,
        generating: false, done: false,
      }
    }),
  ]
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  num, title, locked, done, inactive, children,
}: {
  num: number; title: string; locked: boolean; done: boolean; inactive?: boolean; children: React.ReactNode
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
      <div style={{ padding: '20px', background: '#fff', pointerEvents: inactive ? 'none' : 'auto' }}>
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

const CATEGORY_LABEL: Record<ActionCard['category'], string> = {
  daily: '日常', enter: '进场', exit: '出场',
}

// 有真实视频的卡片 ID → 路径
const CARD_VIDEO_MAP: Record<string, string> = {
  enter:    '/videos/action_enter.mp4',
  exit:     '/videos/action_exit.mp4',
  'daily-1': '/videos/action_daily1.mp4',
  'daily-2': '/videos/action_daily2.mp4',
  'daily-3': '/videos/action_daily1.mp4',
  'daily-4': '/videos/action_daily2.mp4',
  'daily-5': '/videos/action_daily1.mp4',
  'daily-6': '/videos/action_daily2.mp4',
  'daily-7': '/videos/action_daily1.mp4',
  'daily-8': '/videos/action_daily2.mp4',
}

function ActionVideoCard({ card, dailyOpsLeft, onRetry, onSwap }: {
  card: ActionCard
  dailyOpsLeft: number
  onRetry: (id: string) => void
  onSwap: (id: string) => void
}) {
  const isDaily = card.category === 'daily'
  const canOp = dailyOpsLeft > 0
  const disabled = !canOp || card.generating
  const videoSrc = !card.generating ? CARD_VIDEO_MAP[card.id] : undefined

  return (
    <div style={{
      borderRadius: 7, border: `1px solid ${C.border}`,
      overflow: 'hidden', background: '#FAFAFA',
    }}>
      {/* 视频预览区 1:1 */}
      <div style={{ position: 'relative', paddingTop: '100%' }}>
        <div
          style={{
            position: 'absolute', inset: 0,
            background: card.generating ? '#F0F0F0' : card.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'default', overflow: 'hidden',
          }}
        >
          {card.generating ? (
            <div style={{
              width: 20, height: 20, borderRadius: '50%',
              border: `2px solid ${C.border}`, borderTopColor: C.primary,
              animation: 'spin 0.9s linear infinite',
            }} />
          ) : videoSrc ? (
            <video
              src={videoSrc}
              autoPlay
              loop
              muted
              playsInline
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                objectFit: 'cover', objectPosition: 'center top',
              }}
            />
          ) : (
            <div style={{
              width: 26, height: 26, borderRadius: '50%',
              background: 'rgba(255,255,255,0.85)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11,
            }}>▶</div>
          )}
        </div>
        {/* 类别角标 */}
        <div style={{
          position: 'absolute', top: 4, left: 4, zIndex: 2,
          fontSize: 9, padding: '1px 5px', borderRadius: 3,
          background: 'rgba(0,0,0,0.45)', color: '#fff', lineHeight: '14px',
        }}>{CATEGORY_LABEL[card.category]}</div>
      </div>

      {/* 卡片底部 */}
      <div style={{ padding: '5px 6px 6px' }}>
        <div style={{
          fontSize: 10, color: C.textPrimary, fontWeight: 500,
          marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{card.actionName}</div>
        <div style={{ display: 'flex', gap: 3 }}>
          {isDaily && (
            <button
              onClick={() => !disabled && onSwap(card.id)}
              disabled={disabled}
              style={{
                flex: 1, padding: '3px 0', borderRadius: 3, fontSize: 10,
                border: `1px solid ${disabled ? C.border : C.primary}`,
                background: disabled ? '#F2F3F5' : '#F5F4FF',
                color: disabled ? C.textTertiary : C.primary,
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontFamily: T.fonts.family,
              }}
            >换动作</button>
          )}
          <button
            onClick={() => !disabled && onRetry(card.id)}
            disabled={disabled}
            style={{
              flex: 1, padding: '3px 0', borderRadius: 3, fontSize: 10,
              border: `1px solid ${C.border}`,
              background: disabled ? '#F2F3F5' : '#fff',
              color: disabled ? C.textTertiary : C.textSecondary,
              cursor: disabled ? 'not-allowed' : 'pointer',
              fontFamily: T.fonts.family,
            }}
          >↺ 重试</button>
        </div>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export type SubmittedAvatarData = {
  name: string; faceUrl: string; portraitUrl: string
  ageLabel: string; ageGroup: string; gender: string; product: string | null
}

export type DraftFaceData = {
  name: string; faceUrl: string; ageLabel: string; gender: string; ageGroup: string
}

export default function BanboCustomizePage({
  onBack, onSubmitted, onFaceSelected, initialFaceId,
}: {
  onBack?: () => void
  onSubmitted?: (data: SubmittedAvatarData) => void
  onFaceSelected?: (data: DraftFaceData) => void
  initialFaceId?: string
} = {}) {
  const [swapFaceId, setSwapFaceId] = useState<string | null>(null)
  const [selectedFace, setSelectedFace] = useState(initialFaceId ?? '')
  const [genderFilter, setGenderFilter] = useState<'全部' | Gender>('全部')
  const [ageFilter, setAgeFilter] = useState<'全部' | AgeGroup>('全部')

  type Chip = { id: string; value: string; status: 'success' | 'fail'; label?: string }
  type LinkStatus = 'idle' | 'loading' | 'success' | 'fail'
  const [avatarName, setAvatarName] = useState('')
  const [avatarNameError, setAvatarNameError] = useState(false)
  const avatarNameRef = useRef<HTMLInputElement>(null)

  const [chips, setChips] = useState<Chip[]>([])
  const [currentInput, setCurrentInput] = useState('')
  const [currentStatus, setCurrentStatus] = useState<LinkStatus>('idle')
  const [chipError, setChipError] = useState(false)
  const currentTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [refImages, setRefImages] = useState<RefImage[]>([])
  const [chromaOverridePending, setChromaOverridePending] = useState<Set<string>>(new Set())
  const refFileRef = useRef<HTMLInputElement>(null)
  const uploadCount = useRef(0)

  function handleRefUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    const id = Date.now().toString()
    const cycleIdx = uploadCount.current % MOCK_TYPE_CYCLE.length
    uploadCount.current++

    setRefImages(prev => [...prev, { id, url, phase: 'compliance' }])
    e.target.value = ''

    // Phase 1: compliance (~800ms, always pass in mock)
    setTimeout(() => {
      setRefImages(prev => prev.map(img => img.id === id ? { ...img, phase: 'typing' } : img))

      // Phase 2: type recognition (~1s) — all types go to 'selecting', smart defaults differ
      setTimeout(() => {
        const imageType = MOCK_TYPE_CYCLE[cycleIdx]
        const ALL_PARTS: RefImagePart[] = ['上衣', '裤/裙', '鞋子']
        // white_bg: mock-detected as single product (shoe), default only that part
        // human_outfit: full-body, auto-select all + lock parts
        // everything else: default all 3
        const defaultParts: RefImagePart[] = imageType === 'white_bg' ? ['鞋子'] : ALL_PARTS
        const partsLocked = imageType === 'human_outfit'
        setRefImages(prev => prev.map(img =>
          img.id === id
            ? { ...img, phase: 'selecting', imageType, selectedParts: defaultParts, partsLocked, chromaBg: 'blue' }
            : img
        ))
      }, 1000)
    }, 800)
  }

  function toggleRefPart(id: string, part: RefImagePart) {
    setRefImages(prev => prev.map(img => {
      if (img.id !== id) return img
      if (img.partsLocked) return img
      const cur = img.selectedParts ?? []
      const next = cur.includes(part) ? cur.filter(p => p !== part) : [...cur, part]
      return { ...img, selectedParts: next }
    }))
  }

  function unlockRefParts(id: string) {
    setRefImages(prev => prev.map(img =>
      img.id === id ? { ...img, partsLocked: false } : img
    ))
  }

  function confirmRefImage(id: string) {
    setRefImages(prev => {
      const target = prev.find(img => img.id === id)
      const confirmedParts = new Set(target?.selectedParts ?? [])
      return prev.map(img => {
        if (img.id === id) return { ...img, phase: 'confirmed' }
        // 其他 selecting 图：自动剥离刚被占用的部位
        if (img.phase === 'selecting') {
          const stripped = (img.selectedParts ?? []).filter(p => !confirmedParts.has(p))
          return { ...img, selectedParts: stripped }
        }
        return img
      })
    })
  }

  function editRefImage(id: string) {
    setRefImages(prev => prev.map(img =>
      img.id === id ? { ...img, phase: 'selecting' } : img
    ))
  }

  function removeRefImage(id: string) {
    setRefImages(prev => prev.filter(img => img.id !== id))
    setChromaOverridePending(prev => { const s = new Set(prev); s.delete(id); return s })
  }

  function confirmChromaOverride(id: string) {
    setRefImages(prev => prev.map(img => img.id === id ? { ...img, chromaOverridden: true } : img))
    setChromaOverridePending(prev => { const s = new Set(prev); s.delete(id); return s })
  }

  function cancelChromaOverride(id: string) {
    setChromaOverridePending(prev => { const s = new Set(prev); s.delete(id); return s })
  }

  function handleInputChange(value: string) {
    setCurrentInput(value)
    if (!value.trim()) { setCurrentStatus('idle'); return }
    setCurrentStatus('loading')
    if (currentTimer.current) clearTimeout(currentTimer.current)
    currentTimer.current = setTimeout(() => {
      const success = /\d{6,}/.test(value) || value.includes('http') || value.includes('www')
      if (success) {
        const mockNames = [
          '【2026春季新款】男童加绒加厚牛仔裤弹力直筒儿童长裤宝宝休闲裤',
          '女童蕾丝花边连衣裙春秋款洋气公主裙儿童裙子中大童蓬蓬裙',
          '男童运动套装春秋款儿童卫衣卫裤两件套中大童休闲跑步服',
          '婴儿纯棉连体衣秋冬款宝宝爬服哈衣新生儿满月礼盒装',
          '女童针织开衫外套春秋薄款儿童毛衣外搭宝宝洋气上衣',
          '男童牛仔外套春秋款儿童夹克上衣中大童韩版潮流工装外套',
          '儿童防晒衣夏季薄款男女童户外防紫外线透气皮肤衣外套',
          '女童碎花衬衫春季韩版儿童宽松长袖上衣中大童洋气打底衫',
          '男童帆布鞋春秋低帮儿童板鞋百搭休闲学生运动鞋透气',
          '儿童睡衣套装春秋薄款纯棉男女宝宝家居服长袖长裤两件套',
        ]
        const label = mockNames[Math.floor(Math.random() * mockNames.length)]
        setChips(prev => [...prev, { id: Date.now().toString(), value, status: 'success', label }])
        setChipError(false)
        setCurrentInput('')
        setCurrentStatus('idle')
      } else {
        setCurrentStatus('fail')
      }
    }, 800)
  }

  function removeChip(id: string) {
    setChips(prev => prev.filter(c => c.id !== id))
  }

  type PortraitStatus = 'idle' | 'generating' | 'reviewing' | 'confirmed'
  const [portraitStatus, setPortraitStatus] = useState<PortraitStatus>('idle')
  const [portraitUrl, setPortraitUrl] = useState<string | null>(null)
  const [showOriginal, setShowOriginal] = useState(false)
  const [portraitOpsUsed, setPortraitOpsUsed] = useState(0)
  const MAX_PORTRAIT_OPS = 5
  const [showPromptInput, setShowPromptInput] = useState(false)
  const [promptDraft, setPromptDraft] = useState('')

  const chipInputRef = useRef<HTMLInputElement>(null)

  function handleGeneratePortrait() {
    if (!avatarName.trim()) {
      setAvatarNameError(true)
      avatarNameRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      avatarNameRef.current?.focus()
      return
    }
    if (chips.length === 0) {
      setChipError(true)
      chipInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      chipInputRef.current?.focus()
      return
    }
    setAvatarNameError(false)
    setChipError(false)
    setShowOriginal(false)
    setPortraitUrl(null)
    setPortraitStatus('generating')
    setTimeout(() => {
      setPortraitUrl('/avatars/portrait-0-3-male.jpg')
      setPortraitStatus('reviewing')
    }, 2200)
  }

  function handleRegeneratePortrait() {
    if (portraitOpsUsed >= MAX_PORTRAIT_OPS) return
    setPortraitOpsUsed(prev => prev + 1)
    setShowPromptInput(false)
    setShowOriginal(false)
    setPortraitUrl(null)
    setPortraitStatus('generating')
    setTimeout(() => {
      setPortraitUrl('/avatars/portrait-0-3-male.jpg')
      setPortraitStatus('reviewing')
    }, 2200)
  }

  function handlePromptRegenerate() {
    if (!promptDraft.trim() || portraitOpsUsed >= MAX_PORTRAIT_OPS) return
    setPortraitOpsUsed(prev => prev + 1)
    setShowPromptInput(false)
    setPromptDraft('')
    setShowOriginal(false)
    setPortraitUrl(null)
    setPortraitStatus('generating')
    setTimeout(() => {
      setPortraitUrl('/avatars/portrait-0-3-male.jpg')
      setPortraitStatus('reviewing')
    }, 2200)
  }

  function handleConfirmPortrait() {
    setPortraitStatus('confirmed')
    handleGenerateActions()
  }

  const [generatingActions, setGeneratingActions] = useState(false)
  const [actionCards, setActionCards] = useState<ActionCard[]>([])
  const [dailyOpsUsed, setDailyOpsUsed] = useState(0)
  const DAILY_OPS_TOTAL = 10
  const [actionConfirmed, setActionConfirmed] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const sec2Ref = useRef<HTMLDivElement>(null)
  const sec3Ref = useRef<HTMLDivElement>(null)

  const [faceConfirmed, setFaceConfirmed] = useState(!!initialFaceId)
  const [conflictFaceId, setConflictFaceId] = useState<string | null>(null)
  const CONFLICT_DEMO_FACE = 'f10' // 甜甜：演示并发冲突
  const step1Done = faceConfirmed
  const step2Done = chips.length > 0 && refImages.some(img => img.phase === 'confirmed')
  const allPartsCovered = (['上衣', '裤/裙', '鞋子'] as RefImagePart[]).every(p =>
    refImages.some(img => img.phase === 'confirmed' && img.selectedParts?.includes(p))
  )
  const actionsGenerated = actionCards.length > 0

  // 预设形象时通知父级
  useEffect(() => {
    if (initialFaceId) {
      const f = PUBLIC_FACES.find(ff => ff.id === initialFaceId)
      if (f) onFaceSelected?.({ name: f.name, faceUrl: f.imageUrl, ageLabel: f.ageLabel, gender: f.gender, ageGroup: f.ageGroup })
    }
  }, [])

  // 解锁时自动滚动
  useEffect(() => {
    if (faceConfirmed) sec2Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [faceConfirmed])
  useEffect(() => {
    if (actionsGenerated) sec3Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [actionsGenerated])

  function handleGenerateActions() {
    setGeneratingActions(true)
    setDailyOpsUsed(0)
    const cards = makeActionCards()
    setActionCards(cards.map(c => ({ ...c, generating: true })))
    setTimeout(() => {
      setActionCards(cards.map(c => ({ ...c, generating: false, done: true })))
      setGeneratingActions(false)
    }, 2500)
  }

  // 换色 mock：换一个不同的颜色
  function nextColor(current: string) {
    const others = CARD_COLORS.filter(c => c !== current)
    return others[Math.floor(Math.random() * others.length)]
  }

  function retryCard(cardId: string) {
    const card = actionCards.find(c => c.id === cardId)!
    setDailyOpsUsed(v => v + 1)
    setActionCards(prev => prev.map(c => c.id === cardId ? { ...c, generating: true } : c))
    setTimeout(() => {
      setActionCards(prev => prev.map(c =>
        c.id === cardId ? { ...c, generating: false, done: true, color: nextColor(c.color) } : c
      ))
    }, 1500)
  }

  const [swapPopup, setSwapPopup] = useState<{ cardId: string } | null>(null)
  const [pendingActionId, setPendingActionId] = useState<string | null>(null)

  function resetStep2() {
    setChips([])
    setCurrentInput('')
    setCurrentStatus('idle')
    setRefImages([])
    uploadCount.current = 0
    setPortraitStatus('idle')
    setPortraitUrl(null)
    setShowOriginal(false)
    setPortraitOpsUsed(0)
  }

  function confirmSwapFace() {
    if (!swapFaceId) return
    if (swapFaceId === '__reselect__') {
      // 点"更换形象"按钮触发：不换脸，只回到选择态
      setFaceConfirmed(false)
      resetStep2()
      setSwapFaceId(null)
    } else {
      const f = PUBLIC_FACES.find(ff => ff.id === swapFaceId)!
      setSelectedFace(swapFaceId)
      setFaceConfirmed(false)
      resetStep2()
      setSwapFaceId(null)
      onFaceSelected?.({ name: f.name, faceUrl: f.imageUrl, ageLabel: f.ageLabel, gender: f.gender, ageGroup: f.ageGroup })
    }
  }

  function openSwap(cardId: string) { setSwapPopup({ cardId }); setPendingActionId(null) }
  function closeSwap() { setSwapPopup(null); setPendingActionId(null) }

  function confirmSwap() {
    if (!swapPopup || !pendingActionId) return
    const action = ACTION_LIBRARY.find(a => a.id === pendingActionId)!
    const targetId = swapPopup.cardId
    setDailyOpsUsed(v => v + 1)
    setActionCards(prev => prev.map(c =>
      c.id === targetId
        ? { ...c, generating: true, actionId: action.id, actionName: action.name, duration: action.duration }
        : c
    ))
    closeSwap()
    setTimeout(() => {
      setActionCards(prev => prev.map(c =>
        c.id === targetId ? { ...c, generating: false, done: true, color: nextColor(c.color) } : c
      ))
    }, 1500)
  }

  function handleSubmit() {
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setSubmitted(true)
      const f = PUBLIC_FACES.find(ff => ff.id === selectedFace)
      const successChip = chips.find(c => c.status === 'success')
      onSubmitted?.({
        name: avatarName.trim() || '未命名形象',
        faceUrl: f?.imageUrl ?? '',
        portraitUrl: portraitUrl ?? f?.imageUrl ?? '',
        ageLabel: f?.ageLabel ?? '',
        ageGroup: f?.ageGroup ?? '',
        gender: f?.gender ?? '',
        product: successChip?.label ?? null,
      })
    }, 1200)
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
          onClick={() => { setSubmitted(false); setSelectedFace(''); setFaceConfirmed(false); setChips([]); setCurrentInput(''); setCurrentStatus('idle'); setRefImages([]); uploadCount.current = 0; setPortraitStatus('idle'); setPortraitOpsUsed(0); setActionCards([]); setActionConfirmed(false) }}
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
      {/* 返回栏：始终显示 */}
      {onBack && (
        <div style={{
          padding: '0 20px', height: 44, display: 'flex', alignItems: 'center',
          borderBottom: `1px solid ${C.border}`, background: '#fff', flexShrink: 0,
        }}>
          <button
            onClick={onBack}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: C.textSecondary, fontSize: 13, padding: 0,
            }}
          >
            <span style={{ fontSize: 16 }}>←</span>
            返回管理页
          </button>
        </div>
      )}

      {/* 换脸确认弹窗 */}
      {swapFaceId && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff', borderRadius: 12, padding: '24px 28px',
            width: 340, boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          }}>
            <div style={{ fontWeight: 600, fontSize: 15, color: C.textPrimary, marginBottom: 8 }}>
              更换形象？
            </div>
            <div style={{ fontSize: 13, color: C.textSecondary, marginBottom: 20, lineHeight: 1.6 }}>
              更换后，当前穿搭参考图和商品绑定将清空，需要重新配置。
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSwapFaceId(null)}
                style={{
                  padding: '7px 18px', borderRadius: 8,
                  border: `1px solid ${C.border}`, background: '#fff',
                  color: C.textSecondary, fontSize: 13, cursor: 'pointer',
                }}
              >取消</button>
              <button
                onClick={confirmSwapFace}
                style={{
                  padding: '7px 18px', borderRadius: 8,
                  border: 'none', background: C.primary,
                  color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}
              >确认更换</button>
            </div>
          </div>
        </div>
      )}
      {/* 滚动内容区 */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}>

        {/* ── 区块1：选择形象 ── */}
        <Section num={1} title="选择形象" locked={false} done={faceConfirmed} inactive={actionsGenerated}>
          {faceConfirmed ? (
            /* 锁定态：只展示已选形象 */
            (() => {
              const f = PUBLIC_FACES.find(ff => ff.id === selectedFace)!
              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  {/* 已选形象卡 */}
                  <div style={{
                    flexShrink: 0, width: 80, borderRadius: 8,
                    border: `2px solid ${C.primary}`, overflow: 'hidden',
                    position: 'relative',
                  }}>
                    <div style={{ width: '100%', paddingTop: '125%', position: 'relative', background: '#F5F5F5' }}>
                      <img src={f.imageUrl} alt={f.name} style={{
                        position: 'absolute', inset: 0, width: '100%', height: '100%',
                        objectFit: 'cover', objectPosition: 'top',
                      }} />
                    </div>
                  </div>
                  {/* 说明文字 + 更换按钮 */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: C.textSecondary, lineHeight: 1.6, marginBottom: 10 }}>
                      已锁定为专属形象，其他用户无法选用这张脸。
                    </div>
                  </div>
                </div>
              )
            })()
          ) : (
            /* 选择态：筛选器 + 完整网格 */
            <>
              {/* 筛选栏 */}
              <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: C.textSecondary, width: 28, flexShrink: 0 }}>性别</span>
                  {(['全部', '男', '女'] as const).map(g => (
                    <button key={g} onClick={() => setGenderFilter(g)} style={{
                      padding: '3px 12px', borderRadius: 12, cursor: 'pointer',
                      border: `1px solid ${genderFilter === g ? C.primary : C.border}`,
                      background: genderFilter === g ? '#F5F4FF' : '#fff',
                      color: genderFilter === g ? C.primary : C.textSecondary,
                      fontSize: 12, fontFamily: T.fonts.family,
                    }}>{g}</button>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, color: C.textSecondary, width: 28, flexShrink: 0 }}>年龄</span>
                  {(['全部', '1-3', '4-6', '7-10', '11-13', '14-17'] as const).map(a => (
                    <button key={a} onClick={() => setAgeFilter(a)} style={{
                      padding: '3px 12px', borderRadius: 12, cursor: 'pointer',
                      border: `1px solid ${ageFilter === a ? C.primary : C.border}`,
                      background: ageFilter === a ? '#F5F4FF' : '#fff',
                      color: ageFilter === a ? C.primary : C.textSecondary,
                      fontSize: 12, fontFamily: T.fonts.family,
                    }}>
                      {a === '全部' ? '全部' : `${a}岁`}
                    </button>
                  ))}
                </div>
              </div>

              {/* 形象横向滚动条 */}
              {(() => {
                const filtered = PUBLIC_FACES.filter(f =>
                  (genderFilter === '全部' || f.gender === genderFilter) &&
                  (ageFilter === '全部' || f.ageGroup === ageFilter)
                )
                return (
                  <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6 }}>
                    {filtered.map(f => {
                      const selected = selectedFace === f.id
                      const isTaken = conflictFaceId === f.id
                      return (
                        <div key={f.id} onClick={() => {
                          if (f.id === selectedFace || isTaken) return
                          setSelectedFace(f.id)
                          onFaceSelected?.({ name: f.name, faceUrl: f.imageUrl, ageLabel: f.ageLabel, gender: f.gender, ageGroup: f.ageGroup })
                        }} style={{
                          flexShrink: 0, width: 144,
                          borderRadius: 10, border: `2px solid ${isTaken ? C.border : selected ? C.primary : C.border}`,
                          background: selected ? '#F5F4FF' : '#fff',
                          cursor: isTaken ? 'not-allowed' : 'pointer',
                          overflow: 'hidden', transition: 'border-color 0.15s',
                          opacity: isTaken ? 0.6 : 1,
                        }}>
                          <div style={{ width: '100%', height: 180, position: 'relative', background: '#F5F5F5' }}>
                            <img src={f.imageUrl} alt={f.name} style={{
                              width: '100%', height: '100%',
                              objectFit: 'cover', objectPosition: 'top',
                            }} />
                            {selected && !isTaken && (
                              <div style={{
                                position: 'absolute', top: 4, right: 4,
                                width: 16, height: 16, borderRadius: '50%',
                                background: C.primary, color: '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 9, fontWeight: 700,
                              }}>✓</div>
                            )}
                            {isTaken && (
                              <div style={{
                                position: 'absolute', inset: 0,
                                background: 'rgba(0,0,0,0.45)',
                                display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center', gap: 4,
                              }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                  <rect x="5" y="11" width="14" height="10" rx="2" fill="rgba(255,255,255,0.9)"/>
                                  <path d="M8 11V7a4 4 0 018 0v4" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                                <span style={{ fontSize: 10, color: '#fff', fontWeight: 600 }}>已选走</span>
                              </div>
                            )}
                          </div>
                          <div style={{ padding: '5px 6px 6px' }}>
                            <div style={{ display: 'flex', gap: 3 }}>
                              <span style={{
                                fontSize: 9, padding: '1px 4px', borderRadius: 4,
                                background: f.gender === '女' ? '#FFF0F6' : '#EEF0FF',
                                color: f.gender === '女' ? '#C91C7A' : C.primary,
                              }}>{f.gender}</span>
                              <span style={{
                                fontSize: 9, padding: '1px 4px', borderRadius: 4,
                                background: '#F3F4F6', color: C.textSecondary,
                              }}>{f.ageGroup}岁</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })()}

              {/* 确认条：选中但未确认时显示 */}
              {selectedFace && (() => {
                const f = PUBLIC_FACES.find(ff => ff.id === selectedFace)!
                const isConflict = conflictFaceId === selectedFace
                if (isConflict) {
                  return (
                    <div style={{
                      marginTop: 14, padding: '10px 14px', borderRadius: 8,
                      background: '#FFF7ED', border: `1px solid #FED7AA`,
                      display: 'flex', alignItems: 'center', gap: 10,
                    }}>
                      <span style={{ flex: 1, fontSize: 12, color: '#92400E', lineHeight: 1.5 }}>
                        这张形象刚被其他用户选走，请重新选择。
                      </span>
                      <button
                        onClick={() => {
                          setSelectedFace('')
                          setConflictFaceId(null)
                        }}
                        style={{
                          flexShrink: 0, padding: '6px 16px', borderRadius: 7,
                          border: 'none', background: '#F97316', color: '#fff',
                          fontSize: 13, fontWeight: 600, cursor: 'pointer',
                          fontFamily: T.fonts.family,
                        }}
                      >换一批 →</button>
                    </div>
                  )
                }
                return (
                  <div style={{
                    marginTop: 14, padding: '10px 14px', borderRadius: 8,
                    background: '#F5F4FF', border: `1px solid #DDD9FF`,
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <span style={{ flex: 1, fontSize: 12, color: C.textPrimary, lineHeight: 1.5 }}>
                      这个形象将成为你的专属，其他用户无法选用这张脸。
                    </span>
                    <button
                      onClick={() => {
                        if (f.id === CONFLICT_DEMO_FACE) {
                          setConflictFaceId(f.id)
                          return
                        }
                        setFaceConfirmed(true)
                        onFaceSelected?.({ name: f.name, faceUrl: f.imageUrl, ageLabel: f.ageLabel, gender: f.gender, ageGroup: f.ageGroup })
                      }}
                      style={{
                        flexShrink: 0, padding: '6px 16px', borderRadius: 7,
                        border: 'none', background: C.primary, color: '#fff',
                        fontSize: 13, fontWeight: 600, cursor: 'pointer',
                        fontFamily: T.fonts.family,
                      }}
                    >确认选用 →</button>
                  </div>
                )
              })()}
            </>
          )}
        </Section>

        {/* ── 区块2：配置穿搭 ── */}
        <div ref={sec2Ref}>
          <Section num={2} title="配置穿搭" locked={!step1Done} done={portraitStatus === 'confirmed' && actionsGenerated} inactive={actionsGenerated}>
            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

              {/* 左栏：原始形象 / 定装照（动态切换） */}
              {face && (
                <div style={{ flexShrink: 0, width: 148 }}>
                  {/* 图片区 */}
                  <div style={{
                    borderRadius: 10, overflow: 'hidden', position: 'relative',
                    border: `1px solid ${portraitStatus === 'confirmed' ? '#86EFAC' : portraitStatus === 'reviewing' ? C.primary : C.border}`,
                  }}>
                    {/* 主图 */}
                    {(() => {
                      const inPortrait = portraitStatus === 'reviewing' || portraitStatus === 'confirmed'
                      const showPortrait = inPortrait && !showOriginal && portraitUrl
                      return (
                        <img
                          src={showPortrait ? portraitUrl! : face.imageUrl}
                          alt={showPortrait ? '定装照' : face.name}
                          style={{
                            width: '100%', height: 196, objectFit: 'cover', objectPosition: 'top', display: 'block',
                            opacity: portraitStatus === 'generating' ? 0.2 : 1,
                            transition: 'opacity 0.3s',
                          }}
                        />
                      )
                    })()}
                    {/* 生成中遮罩 */}
                    {portraitStatus === 'generating' && (
                      <div style={{
                        position: 'absolute', inset: 0, display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(245,244,255,0.7)',
                      }}>
                        <span style={{ fontSize: 12, color: C.primary }}>生成中…</span>
                      </div>
                    )}
                    {/* 右上角缩略图（可点击切换） */}
                    {(portraitStatus === 'reviewing' || portraitStatus === 'confirmed') && (
                      <div
                        onClick={() => setShowOriginal(v => !v)}
                        title={showOriginal ? '点击查看定装照' : '点击查看原始图'}
                        style={{
                          position: 'absolute', top: 6, right: 6,
                          width: 36, borderRadius: 5, overflow: 'hidden',
                          border: '1.5px solid rgba(255,255,255,0.9)',
                          boxShadow: '0 1px 6px rgba(0,0,0,0.3)',
                          cursor: 'pointer',
                        }}
                      >
                        <img
                          src={showOriginal ? (portraitUrl ?? face.imageUrl) : face.imageUrl}
                          alt={showOriginal ? '定装照' : '原始'}
                          style={{
                            width: '100%', height: 46, objectFit: 'cover', objectPosition: 'top', display: 'block',
                          }}
                        />
                        <div style={{
                          background: 'rgba(0,0,0,0.6)', color: '#fff',
                          fontSize: 8, textAlign: 'center', padding: '1px 0',
                        }}>{showOriginal ? '定装照' : '原始'}</div>
                      </div>
                    )}
                    {/* 底部状态条 */}
                    {(portraitStatus === 'reviewing' || portraitStatus === 'confirmed') && (
                      <div style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        padding: '4px 0', textAlign: 'center', fontSize: 10, color: '#fff',
                        background: portraitStatus === 'confirmed' ? 'rgba(22,163,74,0.85)' : `rgba(99,91,255,0.85)`,
                      }}>
                        {showOriginal ? '原始形象' : (portraitStatus === 'confirmed' ? '✓ 定装照已确认' : '定装照预览')}
                      </div>
                    )}
                  </div>
                  {/* 性别/年龄标签 */}
                  <div style={{ marginTop: 8, textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                      <span style={{
                        fontSize: 10, padding: '1px 6px', borderRadius: 6,
                        background: face.gender === '女' ? '#FFF0F6' : '#EEF0FF',
                        color: face.gender === '女' ? '#C91C7A' : C.primary,
                      }}>{face.gender}</span>
                      <span style={{
                        fontSize: 10, padding: '1px 6px', borderRadius: 6,
                        background: '#F3F4F6', color: C.textSecondary,
                      }}>{face.ageGroup}岁</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 右栏 */}
              <div style={{ flex: 1, minWidth: 0 }}>

            {/* 形象名称 */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 3 }}>
                形象名称
                <span style={{ color: '#EF4444', marginLeft: 3 }}>*</span>
              </div>
              <div style={{ fontSize: 11, color: avatarNameError ? '#EF4444' : C.textTertiary, marginBottom: 6 }}>
                {avatarNameError ? '请给这个形象起个名字' : '用于在管理页和直播配置中识别此形象'}
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  ref={avatarNameRef}
                  value={avatarName}
                  maxLength={10}
                  placeholder="例如：宝宝春款、主推款模特、618主力形象…"
                  onChange={e => { setAvatarName(e.target.value); if (avatarNameError) setAvatarNameError(false) }}
                  style={{
                    width: '100%', padding: '7px 36px 7px 10px', borderRadius: 6,
                    border: `1px solid ${avatarNameError ? '#EF4444' : C.border}`,
                    fontSize: 12, color: C.textPrimary, fontFamily: T.fonts.family,
                    outline: 'none', boxSizing: 'border-box' as const,
                    background: avatarNameError ? '#FFF5F5' : undefined,
                  }}
                  onFocus={e => { if (!avatarNameError) e.target.style.borderColor = C.primary }}
                  onBlur={e => { if (!avatarNameError) e.target.style.borderColor = C.border }}
                />
                <span style={{
                  position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                  fontSize: 10, color: avatarName.length >= 10 ? '#EF4444' : C.textTertiary,
                  pointerEvents: 'none',
                }}>{avatarName.length} / 10</span>
              </div>
            </div>

            {/* 商品绑定 */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 3 }}>
                商品绑定
                <span style={{ color: '#EF4444', marginLeft: 3 }}>*</span>
              </div>
              <div style={{ fontSize: 11, color: chipError ? '#EF4444' : C.textTertiary, marginBottom: 10 }}>
                {chipError ? '请至少绑定 1 件商品，才能生成定装照' : '绑定后，直播时系统将自动关联此形象（必填，至少 1 件）'}
              </div>
              {chips.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
                  {chips.map(chip => (
                    <div key={chip.id} style={{
                      display: 'flex', alignItems: 'center', gap: 3,
                      padding: '3px 6px 3px 8px', borderRadius: 12,
                      background: chip.status === 'success' ? '#F0FDF4' : '#FEF2F2',
                      border: `1px solid ${chip.status === 'success' ? '#86EFAC' : '#FECACA'}`,
                      fontSize: 11, color: chip.status === 'success' ? '#16A34A' : '#DC2626',
                      maxWidth: 220,
                    }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>
                        {chip.status === 'success' ? '✓ ' : '✗ '}{chip.label ?? chip.value}
                      </span>
                      <button onClick={() => removeChip(chip.id)} style={{
                        background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px',
                        color: chip.status === 'success' ? '#16A34A' : '#DC2626',
                        fontSize: 14, lineHeight: 1, flexShrink: 0,
                      }}>×</button>
                    </div>
                  ))}
                </div>
              )}
              <input
                ref={chipInputRef}
                value={currentInput}
                onChange={e => { handleInputChange(e.target.value); if (chipError) setChipError(false) }}
                placeholder={chips.length === 0 ? '粘贴抖店商品链接或商品 ID' : '继续添加…'}
                style={{
                  width: '100%', padding: '7px 10px', borderRadius: 6,
                  border: `1px solid ${currentStatus === 'fail' ? '#F87171' : chipError ? '#EF4444' : C.border}`,
                  fontSize: 12, color: C.textPrimary, fontFamily: T.fonts.family,
                  outline: 'none', boxSizing: 'border-box' as const,
                  background: chipError ? '#FFF5F5' : undefined,
                }}
                onFocus={e => { if (currentStatus !== 'fail' && !chipError) e.target.style.borderColor = C.primary }}
                onBlur={e => { if (currentStatus !== 'fail' && !chipError) e.target.style.borderColor = C.border }}
              />
              {currentStatus === 'loading' && (
                <div style={{ fontSize: 11, color: C.textTertiary, marginTop: 3 }}>识别中…</div>
              )}
              {currentStatus === 'fail' && (
                <div style={{ fontSize: 11, color: '#DC2626', marginTop: 3 }}>✗ 识别失败，请检查链接或 ID 是否正确</div>
              )}
            </div>

            {/* 穿搭参考图 */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 3 }}>穿搭参考图</div>
              <div style={{ fontSize: 11, color: C.textTertiary, marginBottom: 6 }}>
                上传商品图或模特图，选择需要参考的部位（最多 3 张）
              </div>
              <div style={{ fontSize: 11, color: '#92400E', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 6, padding: '5px 9px', marginBottom: 10, lineHeight: 1.5 }}>
                优先上传服装上身图，并确保服饰关键细节、logo、图案等未被遮挡。{' '}
                <a href="#" style={{ color: '#92400E', textDecoration: 'underline' }}>最佳实践</a>
              </div>

              {refImages.map(img => {
                const ALL_PARTS: RefImagePart[] = ['上衣', '裤/裙', '鞋子']
                const claimedByOthers = new Set(
                  refImages
                    .filter(o => o.id !== img.id && o.phase === 'confirmed')
                    .flatMap(o => o.selectedParts ?? [])
                )
                const isLoading = img.phase === 'compliance' || img.phase === 'typing'
                return (
                  <div key={img.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 0', borderBottom: `1px solid ${C.border}`,
                  }}>
                    {/* 缩略图 */}
                    <div style={{
                      width: 40, height: 50, borderRadius: 5, overflow: 'hidden',
                      flexShrink: 0, background: '#F3F4F6',
                    }}>
                      <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>

                    {/* 内容区：单行 */}
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      {isLoading && (
                        <span style={{ fontSize: 11, color: C.textTertiary }}>
                          {img.phase === 'compliance' ? '检测中…' : '识别中…'}
                        </span>
                      )}
                      {img.phase === 'rejected' && (
                        <>
                          <span style={{ fontSize: 11, color: '#DC2626' }}>✗ 不合规</span>
                          <button onClick={() => removeRefImage(img.id)} style={{
                            fontSize: 11, color: C.primary, background: 'none',
                            border: 'none', cursor: 'pointer', padding: 0, fontFamily: T.fonts.family,
                          }}>重新上传</button>
                        </>
                      )}
                      {img.phase === 'selecting' && (
                        <>
                          {img.chromaBg && img.chromaBg !== 'green' && !img.chromaOverridden ? (
                            // 绿色服饰：软拦截，可强制覆盖
                            <>
                              <span style={{ fontSize: 11, color: '#DC2626', fontWeight: 600, flexShrink: 0 }}>✗ 含绿色服饰</span>
                              {ALL_PARTS.map(part => (
                                <span key={part} style={{
                                  padding: '2px 9px', borderRadius: 10, fontSize: 11,
                                  border: `1px solid ${C.border}`,
                                  background: '#F9FAFB', color: C.textTertiary,
                                  flexShrink: 0, userSelect: 'none' as const,
                                }}>{part}</span>
                              ))}
                              <span style={{
                                padding: '2px 12px', borderRadius: 6, fontSize: 11,
                                background: '#E5E7EB', color: C.textTertiary,
                                flexShrink: 0, userSelect: 'none' as const,
                              }}>确认</span>
                              <div style={{
                                flexBasis: '100%', marginTop: 4,
                                padding: '5px 9px', borderRadius: 6,
                                background: '#FEF2F2', border: `1px solid #FECACA`,
                                fontSize: 11, color: '#DC2626', lineHeight: 1.5,
                              }}>
                                此图含绿色服饰，无法用于定装照生成，请点右侧 × 删除后重新上传。
                                {chromaOverridePending.has(img.id) ? (
                                  <>
                                    <span style={{ color: '#7F1D1D' }}>确定强制使用？</span>
                                    <span
                                      onClick={() => confirmChromaOverride(img.id)}
                                      style={{ marginLeft: 4, color: '#B91C1C', textDecoration: 'underline', cursor: 'pointer', fontWeight: 600 }}
                                    >确定</span>
                                    <span
                                      onClick={() => cancelChromaOverride(img.id)}
                                      style={{ marginLeft: 4, color: '#6B7280', textDecoration: 'underline', cursor: 'pointer' }}
                                    >取消</span>
                                  </>
                                ) : (
                                  <span
                                    onClick={() => setChromaOverridePending(prev => new Set(prev).add(img.id))}
                                    style={{ marginLeft: 4, color: '#6B7280', textDecoration: 'underline', cursor: 'pointer' }}
                                  >误识别？强制使用</span>
                                )}
                              </div>
                            </>
                          ) : (
                            // 正常流程
                            <>
                              <span style={{ fontSize: 11, color: C.textSecondary, flexShrink: 0 }}>参考部位</span>
                              {ALL_PARTS.map(part => {
                                const checked = img.selectedParts?.includes(part) ?? false
                                const claimed = claimedByOthers.has(part)
                                const locked = img.partsLocked
                                if (claimed) return (
                                  <span key={part} style={{
                                    padding: '2px 9px', borderRadius: 10, fontSize: 11,
                                    border: `1px solid ${C.border}`,
                                    background: '#F9FAFB', color: C.textTertiary,
                                    flexShrink: 0, userSelect: 'none' as const,
                                  }}>
                                    {part}<span style={{ fontSize: 9, marginLeft: 3 }}>已占用</span>
                                  </span>
                                )
                                if (locked) return (
                                  <span key={part} style={{
                                    padding: '2px 9px', borderRadius: 10, fontSize: 11,
                                    border: `1px solid ${C.primary}`,
                                    background: '#F5F4FF', color: C.primary,
                                    flexShrink: 0, userSelect: 'none' as const,
                                    cursor: 'default',
                                  }}>✓ {part}</span>
                                )
                                return (
                                  <button key={part} onClick={() => toggleRefPart(img.id, part)} style={{
                                    padding: '2px 9px', borderRadius: 10, fontSize: 11, cursor: 'pointer',
                                    border: `1px solid ${checked ? C.primary : C.border}`,
                                    background: checked ? '#F5F4FF' : '#fff',
                                    color: checked ? C.primary : C.textSecondary,
                                    fontFamily: T.fonts.family, flexShrink: 0,
                                  }}>{checked ? '✓ ' : ''}{part}</button>
                                )
                              })}
                              <button
                                onClick={() => confirmRefImage(img.id)}
                                disabled={!(img.selectedParts ?? []).length}
                                style={{
                                  padding: '2px 12px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
                                  border: 'none', fontFamily: T.fonts.family, flexShrink: 0,
                                  background: (img.selectedParts ?? []).length ? C.primary : '#E5E7EB',
                                  color: (img.selectedParts ?? []).length ? '#fff' : C.textTertiary,
                                }}
                              >确认</button>
                              {img.partsLocked && (
                                <div style={{
                                  flexBasis: '100%', marginTop: 4,
                                  padding: '5px 9px', borderRadius: 6,
                                  background: '#F5F4FF', border: `1px solid #DDD9FF`,
                                  fontSize: 11, color: '#5850EC', lineHeight: 1.5,
                                }}>
                                  已识别为全身穿搭图，将参考全部部位。
                                  <span
                                    onClick={() => unlockRefParts(img.id)}
                                    style={{ color: C.primary, cursor: 'pointer', marginLeft: 4, textDecoration: 'underline' }}
                                  >识别有误？</span>
                                </div>
                              )}
                              {(img.selectedParts ?? []).length === 0 && (
                                <span style={{ fontSize: 10, color: C.textTertiary, flexBasis: '100%' }}>
                                  所有部位已被其他图占用，可删除此图
                                </span>
                              )}
                            </>
                          )}
                        </>
                      )}
                      {img.phase === 'confirmed' && (
                        <>
                          {img.chromaBg && img.chromaBg !== 'green' && !img.chromaOverridden ? (
                            <span style={{ fontSize: 11, color: '#B45309', flexShrink: 0, fontWeight: 600 }}>⚠ 含绿色元素</span>
                          ) : img.chromaOverridden ? (
                            <span style={{ fontSize: 11, color: '#B45309', flexShrink: 0, fontWeight: 600 }}>⚠ 强制使用</span>
                          ) : (
                            <span style={{ fontSize: 11, color: '#16A34A', flexShrink: 0 }}>✓ 已确认</span>
                          )}
                          {(img.selectedParts ?? []).map(part => {
                            const warn = (img.chromaBg && img.chromaBg !== 'green' && !img.chromaOverridden) || img.chromaOverridden
                            return (
                              <span key={part} style={{
                                fontSize: 10, padding: '1px 7px', borderRadius: 10,
                                background: warn ? '#FFF7ED' : '#F5F4FF',
                                color: warn ? '#B45309' : C.primary,
                                border: `1px solid ${warn ? '#FECF8A' : '#DDD9FF'}`,
                              }}>{part}</span>
                            )
                          })}
                          <button onClick={() => editRefImage(img.id)} style={{
                            fontSize: 11, color: C.textTertiary, background: 'none',
                            border: 'none', cursor: 'pointer', padding: 0,
                            fontFamily: T.fonts.family, marginLeft: 2,
                          }}>编辑</button>
                        </>
                      )}
                    </div>

                    {/* 删除 */}
                    <button onClick={() => removeRefImage(img.id)} style={{
                      width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                      border: `1px solid ${C.border}`, background: '#fff',
                      color: C.textTertiary, cursor: 'pointer', fontSize: 12,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>×</button>
                  </div>
                )
              })}

              {(() => {
                const confirmedParts = new Set(
                  refImages.filter(img => img.phase === 'confirmed').flatMap(img => img.selectedParts ?? [])
                )
                const allClaimed = (['上衣', '裤/裙', '鞋子'] as RefImagePart[]).every(p => confirmedParts.has(p))
                if (allClaimed) return (
                  <div style={{
                    marginTop: 10, fontSize: 11, color: '#16A34A',
                    padding: '6px 10px', borderRadius: 6,
                    background: '#F0FDF4', border: '1px solid #86EFAC',
                  }}>
                    ✓ 上衣、裤/裙、鞋子均已设置参考，无需继续上传
                  </div>
                )
                if (refImages.length < 3) {
                  const hasPending = refImages.some(img => img.phase === 'selecting')
                  return (
                    <>
                      <button
                        onClick={() => { if (!hasPending) refFileRef.current?.click() }}
                        style={{
                          marginTop: refImages.length > 0 ? 10 : 0,
                          fontSize: 12, background: 'none', border: 'none', padding: 0,
                          fontFamily: T.fonts.family,
                          color: hasPending ? C.textTertiary : C.primary,
                          cursor: hasPending ? 'not-allowed' : 'pointer',
                        }}
                      >＋ 上传参考图</button>
                      {hasPending && (
                        <div style={{ fontSize: 10, color: '#DC2626', marginTop: 3 }}>
                          请先确认上方图片，再上传下一张
                        </div>
                      )}
                    </>
                  )
                }
                return null
              })()}
              <input ref={refFileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleRefUpload} />
            </div>

              </div>{/* 右栏 end */}
            </div>{/* flex row end */}

            {/* ── 定装照区域 ── */}
            {face && (portraitStatus !== 'idle' || allPartsCovered || refImages.some(img => img.phase === 'confirmed')) && (
              <div style={{ marginTop: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.textPrimary }}>定装照</span>
                  {portraitStatus === 'confirmed' && (
                    <span style={{ fontSize: 11, color: '#16A34A' }}>✓ 已确认</span>
                  )}
                </div>

                {/* 未满足条件时的提示 */}
                {portraitStatus === 'idle' && !allPartsCovered && (
                  <div style={{
                    fontSize: 11, color: C.textTertiary,
                    padding: '7px 10px', borderRadius: 6,
                    background: '#FAFAFA', border: `1px dashed ${C.border}`,
                  }}>
                    请先在上方上传穿搭参考图，将上衣、裤/裙、鞋子三个部位都覆盖后，即可生成定装照
                  </div>
                )}

                {/* 满足条件，待生成 */}
                {portraitStatus === 'idle' && allPartsCovered && (() => {
                  const hasSelecting = refImages.some(img => img.phase === 'selecting')
                  return (
                    <>
                      <button
                        onClick={() => { if (!hasSelecting) handleGeneratePortrait() }}
                        style={{
                          width: '100%', padding: '9px 0', borderRadius: 8,
                          fontSize: 13, fontWeight: 500,
                          border: `1px dashed ${hasSelecting ? C.border : C.primary}`,
                          background: hasSelecting ? '#F9FAFB' : '#F5F4FF',
                          color: hasSelecting ? C.textTertiary : C.primary,
                          cursor: hasSelecting ? 'not-allowed' : 'pointer',
                          fontFamily: T.fonts.family,
                        }}
                      >生成定装照</button>
                      {hasSelecting && (
                        <div style={{ fontSize: 10, color: '#DC2626', marginTop: 4, textAlign: 'center' }}>
                          请先确认所有参考图的部位设置
                        </div>
                      )}
                    </>
                  )
                })()}

                {/* 生成中 */}
                {portraitStatus === 'generating' && (
                  <div style={{
                    fontSize: 12, color: C.primary, textAlign: 'center',
                    padding: '10px 0',
                  }}>AI 正在生成定装照，请稍候…</div>
                )}

                {/* 审核中：操作按钮 */}
                {portraitStatus === 'reviewing' && (
                  <div>
                    {/* 提示词输入区（展开态） */}
                    {showPromptInput && (
                      <div style={{ marginBottom: 8 }}>
                        <textarea
                          value={promptDraft}
                          onChange={e => setPromptDraft(e.target.value)}
                          placeholder="描述需要调整的地方，例如：换成红色条纹、袖子改短款、颜色更鲜亮…"
                          rows={2}
                          style={{
                            width: '100%', padding: '8px 10px', borderRadius: 7, resize: 'none',
                            border: `1px solid ${C.primary}`, fontSize: 11, color: C.textPrimary,
                            fontFamily: T.fonts.family, outline: 'none', boxSizing: 'border-box' as const,
                            lineHeight: 1.5,
                          }}
                        />
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      {/* 重新生成 */}
                      <button
                        onClick={handleRegeneratePortrait}
                        disabled={portraitOpsUsed >= MAX_PORTRAIT_OPS}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 5,
                          padding: '8px 12px', borderRadius: 7, fontSize: 12,
                          border: `1px solid ${C.border}`,
                          cursor: portraitOpsUsed >= MAX_PORTRAIT_OPS ? 'not-allowed' : 'pointer',
                          background: portraitOpsUsed >= MAX_PORTRAIT_OPS ? '#F9FAFB' : '#fff',
                          color: portraitOpsUsed >= MAX_PORTRAIT_OPS ? C.textTertiary : C.textSecondary,
                          fontFamily: T.fonts.family, whiteSpace: 'nowrap' as const,
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" />
                        </svg>
                        重新生成
                      </button>
                      {/* 提示词修改 */}
                      {!showPromptInput ? (
                        <button
                          onClick={() => setShowPromptInput(true)}
                          disabled={portraitOpsUsed >= MAX_PORTRAIT_OPS}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 5,
                            padding: '8px 12px', borderRadius: 7, fontSize: 12,
                            border: `1px solid ${C.border}`,
                            cursor: portraitOpsUsed >= MAX_PORTRAIT_OPS ? 'not-allowed' : 'pointer',
                            background: portraitOpsUsed >= MAX_PORTRAIT_OPS ? '#F9FAFB' : '#fff',
                            color: portraitOpsUsed >= MAX_PORTRAIT_OPS ? C.textTertiary : C.textSecondary,
                            fontFamily: T.fonts.family, whiteSpace: 'nowrap' as const,
                          }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                          描述调整
                        </button>
                      ) : (
                        <button
                          onClick={handlePromptRegenerate}
                          disabled={!promptDraft.trim()}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 5,
                            padding: '8px 12px', borderRadius: 7, fontSize: 12,
                            border: 'none',
                            cursor: promptDraft.trim() ? 'pointer' : 'not-allowed',
                            background: promptDraft.trim() ? C.primary : '#E5E7EB',
                            color: promptDraft.trim() ? '#fff' : C.textTertiary,
                            fontFamily: T.fonts.family, whiteSpace: 'nowrap' as const,
                          }}
                        >按描述进行修改</button>
                      )}
                      {/* 取消（展开态） */}
                      {showPromptInput && (
                        <button onClick={() => { setShowPromptInput(false); setPromptDraft('') }} style={{ padding: '8px 10px', borderRadius: 7, fontSize: 12, border: `1px solid ${C.border}`, background: '#fff', color: C.textSecondary, cursor: 'pointer', fontFamily: T.fonts.family, whiteSpace: 'nowrap' as const }}>取消</button>
                      )}
                      {/* 剩余次数（紧跟操作按钮） */}
                      <span style={{ fontSize: 10, color: portraitOpsUsed >= MAX_PORTRAIT_OPS ? '#EF4444' : C.textTertiary, whiteSpace: 'nowrap' as const }}>
                        共剩 {MAX_PORTRAIT_OPS - portraitOpsUsed} / {MAX_PORTRAIT_OPS} 次
                      </span>
                      {/* 确认按钮（推到最右） */}
                      <button
                        onClick={handleConfirmPortrait}
                        style={{
                          marginLeft: 'auto',
                          padding: '8px 14px', borderRadius: 7, fontSize: 12, fontWeight: 500,
                          border: 'none', background: C.primary, color: '#fff',
                          cursor: 'pointer', fontFamily: T.fonts.family, whiteSpace: 'nowrap' as const,
                        }}
                      >用这张，生成动作 →</button>
                    </div>
                  </div>
                )}
              </div>
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
          <Section num={3} title="动作预览" locked={!actionsGenerated && !generatingActions} done={actionConfirmed}>
            {generatingActions ? (
              /* ── 整体 Loading 状态 ── */
              <div style={{
                padding: '32px 0', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 14,
              }}>
                {/* 转圈动画：用两层 border 模拟 */}
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  border: `3px solid ${C.border}`,
                  borderTopColor: C.primary,
                  animation: 'spin 0.9s linear infinite',
                }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: C.textPrimary, marginBottom: 6 }}>
                    动作视频生成中…
                  </div>
                  <div style={{ fontSize: 12, color: C.textTertiary, lineHeight: 1.6 }}>
                    通常需要 1–2 分钟，请耐心等待<br />
                    完成后将自动展示预览，请勿关闭页面
                  </div>
                </div>
              </div>
            ) : actionsGenerated ? (
              <>
                {/* 全局操作次数条 */}
                {(() => {
                  const opsLeft = DAILY_OPS_TOTAL - dailyOpsUsed
                  const pct = (opsLeft / DAILY_OPS_TOTAL) * 100
                  const barColor = opsLeft === 0 ? '#EF4444' : opsLeft <= 2 ? '#F59E0B' : C.primary
                  return (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                        <span style={{ fontSize: 11, color: C.textTertiary }}>动作调整次数</span>
                        <span style={{ fontSize: 11, fontWeight: 600, color: opsLeft === 0 ? '#EF4444' : C.textPrimary }}>
                          {opsLeft === 0 ? '调整次数已用完' : `剩 ${opsLeft} / ${DAILY_OPS_TOTAL} 次`}
                        </span>
                      </div>
                      <div style={{ height: 4, borderRadius: 2, background: '#E5E7EB', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 2, transition: 'width 0.3s, background 0.3s' }} />
                      </div>
                    </div>
                  )
                })()}

                {/* 统一 5 列网格 */}
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 16,
                }}>
                  {actionCards.map(card => (
                    <ActionVideoCard key={card.id} card={card}
                      dailyOpsLeft={DAILY_OPS_TOTAL - dailyOpsUsed}
                      onRetry={retryCard} onSwap={openSwap} />
                  ))}
                </div>

                {!actionConfirmed && (() => {
                  const anyGenerating = actionCards.some(c => c.generating)
                  return (
                    <button
                      onClick={() => {
                        if (anyGenerating) return
                        setActionConfirmed(true)
                        handleSubmit()
                      }}
                      disabled={anyGenerating}
                      style={{
                        width: '100%', padding: '10px 0', borderRadius: 8,
                        fontSize: 13, fontWeight: 500, border: 'none',
                        background: anyGenerating ? '#A5B4FC' : C.primary,
                        color: '#fff', cursor: anyGenerating ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {anyGenerating ? '动作生成中，请稍候…' : '确认动作并提交制作 →'}
                    </button>
                  )
                })()}
                {actionConfirmed && (
                  <div style={{
                    padding: '12px 14px', borderRadius: 8,
                    background: submitting ? '#EFF6FF' : '#F0FDF4',
                    border: `1px solid ${submitting ? '#BFDBFE' : '#86EFAC'}`,
                    fontSize: 12, lineHeight: 1.7,
                    color: submitting ? '#1D4ED8' : '#16A34A',
                  }}>
                    {submitting ? (
                      '提交中，请稍候…'
                    ) : (
                      <>
                        <div style={{ fontWeight: 600, marginBottom: 2 }}>✓ 已提交！</div>
                        AI 正在训练你的伴播形象，预计 30 分钟内完成。<br />
                        完成后状态自动更新为「可使用」，可在直播间调用。
                      </>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div style={{ fontSize: 13, color: C.textTertiary, textAlign: 'center', padding: '20px 0' }}>
                完成穿搭配置后，在此预览效果
              </div>
            )}
          </Section>
        </div>

        {/* ── 换动作弹窗 ── */}
        {swapPopup && (() => {
          const card = actionCards.find(c => c.id === swapPopup.cardId)!
          const usedIds = actionCards.filter(c => c.category === 'daily').map(c => c.actionId)
          const pendingAction = ACTION_LIBRARY.find(a => a.id === pendingActionId)
          const available = ACTION_LIBRARY.filter(a => !usedIds.includes(a.id))
          const inUse    = ACTION_LIBRARY.filter(a => usedIds.includes(a.id))
          return (
            <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={closeSwap}>
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
              <div style={{
                position: 'relative', zIndex: 1, width: 440, background: '#fff',
                borderRadius: 12, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                maxHeight: '80vh', display: 'flex', flexDirection: 'column',
              }} onClick={e => e.stopPropagation()}>
                {/* 标题 */}
                <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                  <div>
                    <span style={{ fontWeight: 600, color: C.textPrimary, fontSize: 14 }}>选择替换动作</span>
                    <span style={{ fontSize: 11, color: C.textTertiary, marginLeft: 8 }}>当前：{card.actionName}</span>
                  </div>
                  <button onClick={closeSwap} style={{ background: 'none', border: 'none', color: C.textTertiary, cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
                </div>

                <div style={{ overflowY: 'auto', padding: '12px', flex: 1 }}>
                  {/* 已选用 */}
                  <div style={{ fontSize: 11, fontWeight: 600, color: C.textTertiary, marginBottom: 8 }}>
                    已选用（{inUse.length} 个，不可选）
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
                    {inUse.map(action => {
                      const isCurrent = action.id === card.actionId
                      const previewColor = ACTION_PREVIEW_COLORS[ACTION_LIBRARY.findIndex(a => a.id === action.id) % ACTION_PREVIEW_COLORS.length]
                      return (
                        <div key={action.id} style={{
                          borderRadius: 7, overflow: 'hidden', opacity: 0.55,
                          border: `2px solid ${isCurrent ? C.primary : C.border}`,
                          background: isCurrent ? '#F5F4FF' : '#F8F8F8',
                        }}>
                          <div style={{ width: '100%', aspectRatio: '1/1', background: previewColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🎬</div>
                          <div style={{ padding: '4px 6px' }}>
                            <div style={{ fontSize: 10, fontWeight: 500, color: C.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{action.name}</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                              <span style={{ fontSize: 9, color: C.textTertiary }}>{action.duration}s</span>
                              <span style={{ fontSize: 9, padding: '1px 4px', borderRadius: 3, background: isCurrent ? '#F5F4FF' : '#ECECEC', color: isCurrent ? C.primary : C.textTertiary }}>{isCurrent ? '当前' : '已用'}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* 可选 */}
                  <div style={{ fontSize: 11, fontWeight: 600, color: C.textTertiary, marginBottom: 8 }}>
                    可替换（{available.length} 个）
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                    {available.map(action => {
                      const isPending = pendingActionId === action.id
                      const previewColor = ACTION_PREVIEW_COLORS[ACTION_LIBRARY.findIndex(a => a.id === action.id) % ACTION_PREVIEW_COLORS.length]
                      return (
                        <div key={action.id}
                          onClick={() => setPendingActionId(isPending ? null : action.id)}
                          style={{
                            borderRadius: 7, overflow: 'hidden', cursor: 'pointer',
                            border: `2px solid ${isPending ? C.primary : C.border}`,
                            background: isPending ? '#F5F4FF' : '#fff',
                            transition: 'border-color 0.15s, background 0.15s',
                          }}
                        >
                          <div style={{ width: '100%', aspectRatio: '1/1', background: previewColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🎬</div>
                          <div style={{ padding: '4px 6px' }}>
                            <div style={{ fontSize: 10, fontWeight: 500, color: C.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{action.name}</div>
                            <div style={{ fontSize: 9, color: C.textTertiary, marginTop: 2 }}>{action.duration}s</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* 确认 bar */}
                {pendingActionId && (
                  <div style={{
                    flexShrink: 0, padding: '10px 16px',
                    borderTop: `1px solid ${C.border}`,
                    background: '#F5F4FF',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <div style={{ flex: 1, fontSize: 13, color: C.textPrimary }}>
                      换成 <strong>「{pendingAction?.name}」</strong>（{pendingAction?.duration}s）？
                    </div>
                    <button onClick={closeSwap} style={{
                      padding: '6px 14px', borderRadius: 7,
                      border: `1px solid ${C.border}`, background: '#fff',
                      color: C.textSecondary, fontSize: 13, cursor: 'pointer', fontFamily: T.fonts.family,
                    }}>取消</button>
                    <button onClick={confirmSwap} style={{
                      padding: '6px 20px', borderRadius: 7, border: 'none',
                      background: C.primary, color: '#fff',
                      fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: T.fonts.family,
                    }}>确认替换</button>
                  </div>
                )}
              </div>
            </div>
          )
        })()}

        {/* 底部留白 */}
        <div style={{ height: 40 }} />
      </div>

    </div>
  )
}

