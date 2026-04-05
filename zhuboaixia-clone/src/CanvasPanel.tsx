
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { C, Toggle } from './shared'

type Props = { onClose: () => void }
type Mode = 'assist' | 'banbo'
type BanboTab = 'productAvatar' | 'command' | 'sysSettings'
type AssistTab = 'voiceProduct' | 'chatAssist' | 'director' | 'comment' | 'voicePrice' | 'welcome' | 'coupons' | 'luckyBag' | 'sysSettings'

const ASSIST_TABS: { key: AssistTab; label: string }[] = [
  { key: 'voiceProduct', label: '声控切品' },
  { key: 'chatAssist', label: '搭话助播' },
  { key: 'director', label: '导播台' },
  { key: 'comment', label: '发评/回评' },
  { key: 'voicePrice', label: '声控开价/预热' },
  { key: 'welcome', label: '欢迎/感谢' },
  { key: 'coupons', label: '发优惠券' },
  { key: 'luckyBag', label: '发福袋' },
  { key: 'sysSettings', label: '系统设置' },
]

const BANBO_TABS: { key: BanboTab; label: string; desc: string }[] = [
  { key: 'productAvatar', label: '形象配置', desc: '为商品绑定伴播形象' },
  { key: 'command', label: '动作设置', desc: '配置直播中触发的动作' },
  { key: 'sysSettings', label: '高级设置', desc: '版本分级·NDI·设备' },
]

const SIDEBAR_BUTTONS = [
  { key: 'banbo' as const, label: '伴播', icon: '🐟' },
  { key: 'kt' as const, label: 'KT板', icon: '📋' },
  { key: 'settings' as const, label: '设置', icon: '⚙️' },
  { key: 'device' as const, label: '设备', icon: '📱' },
]

const FUNC_BUTTONS = [
  { icon: '🎙', label: '声控切品' },
  { icon: '💬', label: '搭话助播' },
  { icon: '🛒', label: '商品弹窗' },
  { icon: '🧑‍💼', label: '出镜助播' },
  { icon: '📺', label: '发屏回屏' },
  { icon: '🎁', label: '发福袋' },
  { icon: '🎟', label: '发优惠券' },
  { icon: '👋', label: '欢迎感谢' },
]

// ============ Chroma Key 抠绿组件 ============
function ChromaKeyImage({ src, alt, style, draggable }: {
  src: string; alt: string; style?: React.CSSProperties; draggable?: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)

  const processImage = useCallback(() => {
    const canvas = canvasRef.current
    const img = imgRef.current
    if (!canvas || !img || !img.naturalWidth) return
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    ctx.drawImage(img, 0, 0)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const d = imageData.data
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], g = d[i + 1], b = d[i + 2]
      if ((g > 90 && g > r * 1.25 && g > b * 1.25) ||
          (g > 120 && g > r + 25 && g > b + 25) ||
          (g > 70 && r < 100 && b < 100 && g > r * 1.4)) {
        const greenness = Math.min(1, (g - Math.max(r, b)) / (g + 1))
        d[i + 3] = greenness > 0.6 ? 0 : Math.round((1 - greenness * 1.5) * 255)
      }
    }
    ctx.putImageData(imageData, 0, 0)
  }, [])

  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => { imgRef.current = img; processImage() }
    img.src = src
  }, [src, processImage])

  return (
    <canvas
      ref={canvasRef}
      style={{ ...style, imageRendering: 'auto' }}
      draggable={draggable}
    />
  )
}

// ============ 播放按钮 ============
function PlayButton({ playing, onClick, color, size }: { playing: boolean; onClick: () => void; color: string; size?: number }) {
  const s = size || 32
  return (
    <button onClick={onClick} style={{
      width: s, height: s, borderRadius: '50%',
      background: playing ? color : `${color}12`,
      border: `1.5px solid ${color}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0,
    }}>
      {playing ? (
        <svg width={s * 0.4} height={s * 0.4} viewBox="0 0 16 16" fill={color}>
          <rect x="3" y="2" width="4" height="12" rx="1" />
          <rect x="9" y="2" width="4" height="12" rx="1" />
        </svg>
      ) : (
        <svg width={s * 0.4} height={s * 0.4} viewBox="0 0 16 16" fill={color}>
          <path d="M4 2.5v11l10-5.5z" />
        </svg>
      )}
    </button>
  )
}

// ============ 形象库数据 ============
type ActionItem = { id: string; name: string; icon: string; duration: string }
type OutfitItem = { id: string; name: string; preview?: string; defaultStates: { id: string; label: string; selected: boolean }[]; actions: ActionItem[] }
type AvatarItem = { id: string; name: string; category: 'public' | 'custom'; type: string; preview: string; bgColor?: string; outfits: OutfitItem[]; selectedOutfit: string; selectedDefault: string }

const AVATARS: AvatarItem[] = [
  {
    id: 'a1', name: '小小', category: 'public', type: '3D 卡通',
    preview: '/avatars/xiaoxiao-dress.jpg', bgColor: '#f0e6d6',
    outfits: [
      {
        id: 'o1', name: '春日裙装', preview: '/avatars/xiaoxiao-dress.jpg',
        defaultStates: [{ id: 'd1', label: '微晃眨眼', selected: true }, { id: 'd2', label: '微笑摆手', selected: false }],
        actions: [{ id: 'act1', name: '跳舞', icon: '💃', duration: '8s' }, { id: 'act2', name: '作揖', icon: '🙇', duration: '3s' }, { id: 'act3', name: '欢迎', icon: '👋', duration: '4s' }],
      },
      {
        id: 'o2', name: '休闲衬衫', preview: '/avatars/xiaoxiao-shirt.jpg',
        defaultStates: [{ id: 'd3', label: '站立思考', selected: true }],
        actions: [{ id: 'act4', name: '转身', icon: '🔄', duration: '3s' }, { id: 'act5', name: '鼓掌', icon: '👏', duration: '5s' }],
      },
    ],
    selectedOutfit: 'o1', selectedDefault: 'd1',
  },
  {
    id: 'a2', name: '榴莲宝贝', category: 'public', type: '3D 卡通',
    preview: '/avatars/durian-3d.jpg', bgColor: '#fdf6e3',
    outfits: [
      {
        id: 'o3', name: '经典造型', preview: '/avatars/durian-3d.jpg',
        defaultStates: [{ id: 'd4', label: '可爱站立', selected: true }, { id: 'd5', label: '轻轻摇晃', selected: false }],
        actions: [{ id: 'act6', name: '转圈', icon: '🌀', duration: '4s' }, { id: 'act7', name: 'wink', icon: '😉', duration: '2s' }],
      },
    ],
    selectedOutfit: 'o3', selectedDefault: 'd4',
  },
  {
    id: 'a3', name: '篮球小子', category: 'public', type: '3D 卡通',
    preview: '/avatars/basketball-boy.jpg', bgColor: '#e8f0fe',
    outfits: [
      {
        id: 'o4', name: '球衣', preview: '/avatars/basketball-boy.jpg',
        defaultStates: [{ id: 'd6', label: '运球站立', selected: true }],
        actions: [{ id: 'act8', name: '投篮', icon: '⛹️', duration: '5s' }, { id: 'act9', name: '庆祝', icon: '🎉', duration: '4s' }],
      },
    ],
    selectedOutfit: 'o4', selectedDefault: 'd6',
  },
]

// ============ 音色数据 ============
type VoiceItem = { id: string; name: string; gender: 'male' | 'female'; age: 'child' | 'adult'; style: string; tags: string[]; color: string }
const VOICES: VoiceItem[] = [
  { id: 'v1', name: '甜心小姐姐', gender: 'female', age: 'adult', style: '甜美亲切', tags: ['甜美', '亲切'], color: '#FF6B9D' },
  { id: 'v2', name: '知性女主播', gender: 'female', age: 'adult', style: '专业沉稳', tags: ['商务', '专业'], color: '#C084FC' },
  { id: 'v3', name: '元气小女孩', gender: 'female', age: 'child', style: '活泼可爱', tags: ['活泼', '可爱'], color: '#F472B6' },
  { id: 'v4', name: '阳光大男孩', gender: 'male', age: 'adult', style: '热情爽朗', tags: ['阳光', '爽朗'], color: '#60A5FA' },
  { id: 'v5', name: '磁性男声', gender: 'male', age: 'adult', style: '低沉有魅力', tags: ['磁性', '成熟'], color: '#818CF8' },
  { id: 'v6', name: '活力小男孩', gender: 'male', age: 'child', style: '调皮有趣', tags: ['活力', '有趣'], color: '#34D399' },
]
const LOCKED_VOICE_ID = 'v1'
const LOCKED_REASON = '当前动作素材使用「甜心小姐姐」录制'

// ============ 智能搭话数据 ============
const AVATAR_OUTFITS = [
  {
    id: 'o1', name: '春日裙装',
    actions: [{ id: 'a1', name: '跳舞', icon: '💃' }, { id: 'a2', name: '作揖', icon: '🙇' }, { id: 'a3', name: '欢迎', icon: '👋' }],
  },
  {
    id: 'o2', name: '休闲衬衫',
    actions: [{ id: 'a4', name: '转身', icon: '🔄' }, { id: 'a5', name: '鼓掌', icon: '👏' }],
  },
]
type FixedChat = { id: string; trigger: string; response: string; outfitId: string | null; actionId: string | null }

// ============ 声控切屏数据 ============
const CURRENT_AVATAR = '小小'
const CURRENT_AVATAR_OUTFITS_VS = [
  {
    id: 'o1', name: '春日裙装',
    actions: [{ id: 'a1', name: '跳舞', icon: '💃' }, { id: 'a2', name: '作揖', icon: '🙇' }, { id: 'a3', name: '欢迎', icon: '👋' }],
  },
  {
    id: 'o2', name: '休闲衬衫',
    actions: [{ id: 'a4', name: '转身', icon: '🔄' }, { id: 'a5', name: '鼓掌', icon: '👏' }],
  },
]
const LIVE_PRODUCTS = [
  { id: 'p1', name: '助播虾落地手机直播支架', price: '¥999', linkNum: 1 },
  { id: 'p2', name: '助播虾磁吸直播挂脖支架', price: '¥999', linkNum: 2 },
  { id: 'p3', name: '补光灯套装', price: '¥299', linkNum: 3 },
  { id: 'p4', name: '声卡直播设备', price: '¥1599', linkNum: 4 },
]

// ============ 商品伴播管理数据（三级结构） ============
type NormalState = { id: string; label: string; icon: string; duration: number }
type EventAction = { id: string; label: string; command: string; duration: number }
type AvatarLibItem = { id: string; name: string; preview: string; category: 'public' | 'custom' }
type ProductItem = {
  id: string; linkNum: number; name: string; price: string;
  boundAvatarId: string | null  // 每个商品只能绑定一个形象
}

// 形象库（用户从中选择绑定）
const AVATAR_LIBRARY: AvatarLibItem[] = [
  { id: 'av1', name: '篮球小子-蓝', preview: '/avatars/basketball-boy-blue.jpg', category: 'public' },
  { id: 'av2', name: '篮球小子-红', preview: '/avatars/basketball-boy-red.jpg', category: 'public' },
  { id: 'av3', name: '篮球小子-黑', preview: '/avatars/basketball-boy-black.jpg', category: 'public' },
  { id: 'av4', name: '篮球小子-白', preview: '/avatars/basketball-boy-white.jpg', category: 'public' },
  { id: 'av5', name: '小小碎花裙', preview: '/avatars/xiaoxiao-dress.jpg', category: 'public' },
  { id: 'av6', name: '榴莲宝贝3D', preview: '/avatars/durian-3d.jpg', category: 'custom' },
  { id: 'av7', name: '卡通小猫', preview: '/avatars/cartoon-cat.jpg', category: 'public' },
]

// 每个形象的常规态（6个基底动作，直播时随机轮播）
const NORMAL_STATES: Record<string, NormalState[]> = {
  av1: [
    { id: 'ns1', label: '挠挠头', icon: '🤕', duration: 6 },
    { id: 'ns2', label: '摇摇身子', icon: '💃', duration: 8 },
    { id: 'ns3', label: '拍拍球', icon: '🏀', duration: 7 },
    { id: 'ns4', label: '擦擦汗', icon: '😅', duration: 5 },
    { id: 'ns5', label: '伸伸腰', icon: '🙆', duration: 6 },
    { id: 'ns6', label: '转转头', icon: '🔄', duration: 5 },
  ],
  av2: [
    { id: 'ns1', label: '挠挠头', icon: '🤕', duration: 6 },
    { id: 'ns2', label: '摇摇身子', icon: '💃', duration: 8 },
    { id: 'ns3', label: '运球', icon: '🏀', duration: 7 },
    { id: 'ns4', label: '擦汗', icon: '😅', duration: 5 },
    { id: 'ns5', label: '原地跳', icon: '⬆️', duration: 6 },
    { id: 'ns6', label: '喝水', icon: '🥤', duration: 5 },
  ],
  av5: [
    { id: 'ns1', label: '转圈圈', icon: '🌀', duration: 8 },
    { id: 'ns2', label: '摆裙摆', icon: '👗', duration: 7 },
    { id: 'ns3', label: '挥挥手', icon: '👋', duration: 6 },
    { id: 'ns4', label: '蹦蹦跳', icon: '🐰', duration: 5 },
    { id: 'ns5', label: '比心', icon: '💕', duration: 6 },
    { id: 'ns6', label: '歪头', icon: '🤔', duration: 5 },
  ],
}
// 其他形象复用默认6态
const DEFAULT_STATES: NormalState[] = [
  { id: 'ns1', label: '挠挠头', icon: '🤕', duration: 6 },
  { id: 'ns2', label: '摇摇身子', icon: '💃', duration: 8 },
  { id: 'ns3', label: '拍拍手', icon: '👏', duration: 7 },
  { id: 'ns4', label: '擦擦汗', icon: '😅', duration: 5 },
  { id: 'ns5', label: '伸伸腰', icon: '🙆', duration: 6 },
  { id: 'ns6', label: '转转头', icon: '🔄', duration: 5 },
]

// 每个形象的事件态动作（口令触发）
const EVENT_ACTIONS: Record<string, EventAction[]> = {
  av1: [
    { id: 'ea1', label: '灌篮表演', command: '来一个灌篮', duration: 12 },
    { id: 'ea2', label: '运球秀', command: '展示运球', duration: 10 },
  ],
  av2: [
    { id: 'ea1', label: '三分投篮', command: '投一个三分', duration: 12 },
    { id: 'ea2', label: '胯下运球', command: '胯下运球', duration: 10 },
  ],
  av5: [
    { id: 'ea1', label: 'T台走秀', command: '走个秀', duration: 15 },
  ],
  av6: [
    { id: 'ea1', label: '旋转展示', command: '转一圈', duration: 20 },
    { id: 'ea2', label: '跳跃', command: '跳一个', duration: 10 },
  ],
}
const DEFAULT_EVENT_ACTIONS: EventAction[] = [
  { id: 'ea1', label: '打招呼', command: '打个招呼', duration: 8 },
  { id: 'ea2', label: '展示', command: '展示一下', duration: 10 },
]

const PRODUCTS: ProductItem[] = [
  { id: 'p1', linkNum: 1, name: '女童春款碎花连衣裙', price: '¥129', boundAvatarId: 'av5' },
  { id: 'p2', linkNum: 2, name: '男童纯棉印花T恤', price: '¥89', boundAvatarId: 'av1' },
  { id: 'p3', linkNum: 3, name: '儿童防晒衣外套', price: '¥159', boundAvatarId: null },
  { id: 'p4', linkNum: 4, name: '女童百褶半身裙', price: '¥99', boundAvatarId: 'av6' },
  { id: 'p5', linkNum: 5, name: '男童运动裤', price: '¥79', boundAvatarId: null },
  { id: 'p6', linkNum: 6, name: '女童蕾丝上衣', price: '¥109', boundAvatarId: null },
]

// 步骤完成度计算
function getStepCompletion(products: ProductItem[], selectedProductId: string | null) {
  const product = products.find(p => p.id === selectedProductId)
  if (!product) return { step1: false, step2: false, step3: false, status: 'none' as const }
  const hasAvatar = !!product.boundAvatarId
  const hasCommands = hasAvatar // Step 2 默认口令即完成
  const eventActions = hasAvatar ? (EVENT_ACTIONS[product.boundAvatarId!] || DEFAULT_EVENT_ACTIONS) : []
  const hasEvents = eventActions.length > 0 // Step 3 可选
  if (hasAvatar && hasCommands) return { step1: true, step2: true, step3: hasEvents, status: 'ready' as const }
  if (hasAvatar) return { step1: true, step2: false, step3: false, status: 'partial' as const }
  return { step1: false, step2: false, step3: false, status: 'new' as const }
}

// ============ Timeline 左栏组件（深色风格） ============
function TimelineLeftBar({
  products, selectedProductId, onSelectProduct, banboEnabled, onToggleBanbo,
}: {
  products: ProductItem[]; selectedProductId: string | null;
  onSelectProduct: (id: string) => void; banboEnabled: boolean; onToggleBanbo: () => void;
}) {
  const totalDuration = 60 // 60秒时间轴
  const productItemRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const previewCardRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const productListRef = useRef<HTMLDivElement>(null)
  const previewAreaRef = useRef<HTMLDivElement>(null)

  // 点击商品 → 滚动对应预览卡片到可见区域 + 选中项滚动到可见
  const handleSelectProduct = (id: string) => {
    onSelectProduct(id)
    // 滚动商品列表中选中项到可见
    setTimeout(() => {
      productItemRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      // 滚动预览区对应卡片到可见
      previewCardRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 50)
  }

  // 收集所有已绑定的形象
  const boundAvatars = products
    .filter(p => p.boundAvatarId)
    .map(p => ({
      product: p,
      avatar: AVATAR_LIBRARY.find(a => a.id === p.boundAvatarId)!,
      normalStates: NORMAL_STATES[p.boundAvatarId!] || DEFAULT_STATES,
      eventActions: EVENT_ACTIONS[p.boundAvatarId!] || DEFAULT_EVENT_ACTIONS,
    }))

  return (
    <div style={{
      width: 280, flexShrink: 0,
      background: '#111827',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
      boxShadow: '20px 0 30px -10px rgba(0,0,0,0.25)',
      minHeight: 0,
    }}>
      {/* 顶部标题 */}
      <div style={{
        padding: '10px 12px',
        background: 'rgba(0,0,0,0.3)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        flexShrink: 0,
      }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', marginBottom: 2 }}>📹 伴播预览</div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>
          {products.length} 个商品 · {boundAvatars.length} 个已配置
        </div>
      </div>

      {/* 商品完成度列表 */}
      <div ref={productListRef} style={{
        padding: '6px 8px', flexShrink: 0,
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(0,0,0,0.15)',
        maxHeight: 100, overflowY: 'auto',
      }}>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginBottom: 4, padding: '0 4px' }}>商品配置</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {products.map(p => {
            const isSelected = selectedProductId === p.id
            const comp = getStepCompletion(products, p.id)
            const statusLabel = comp.status === 'ready' ? '🟢'
              : comp.status === 'partial' ? '🟡' : '🔴'
            return (
              <div key={p.id} ref={el => { productItemRefs.current[p.id] = el }} onClick={() => handleSelectProduct(p.id)} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '4px 8px', borderRadius: 4,
                background: isSelected ? 'rgba(96,165,250,0.15)' : 'transparent',
                border: isSelected ? '1px solid rgba(96,165,250,0.3)' : '1px solid transparent',
                cursor: 'pointer', transition: 'all 0.15s',
              }}>
                <span style={{
                  fontSize: 8, padding: '1px 4px', borderRadius: 2,
                  background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)',
                  flexShrink: 0,
                }}>{p.linkNum}号</span>
                <span style={{
                  fontSize: 10, color: isSelected ? '#fff' : 'rgba(255,255,255,0.7)',
                  flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{p.name}</span>
                <span style={{ fontSize: 10, flexShrink: 0 }}>{statusLabel}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* 形象视频预览区 */}
      <div ref={previewAreaRef} style={{ flex: 1, overflowY: 'auto', padding: '8px 10px', minHeight: 0 }}>
        {boundAvatars.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {boundAvatars.map(({ product, avatar, normalStates, eventActions }) => {
              const isSelected = selectedProductId === product.id
              const normalDuration = normalStates.reduce((sum, s) => sum + s.duration, 0)
              const eventDuration = eventActions.length > 0 ? eventActions[0].duration : 0
              return (
                <div key={avatar.id} ref={el => { previewCardRefs.current[product.id] = el }} onClick={() => handleSelectProduct(product.id)} style={{
                  background: isSelected ? 'rgba(96,165,250,0.12)' : 'rgba(255,255,255,0.05)',
                  borderRadius: 8,
                  padding: 8,
                  border: isSelected ? '1px solid rgba(96,165,250,0.4)' : '1px solid rgba(255,255,255,0.08)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}>
                  {/* 形象名 + 商品 */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6,
                  }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%', overflow: 'hidden',
                      border: '1.5px solid rgba(255,255,255,0.2)', flexShrink: 0,
                      background: '#333',
                    }}>
                      <ChromaKeyImage src={avatar.preview} alt={avatar.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable={false} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 11, fontWeight: 600, color: '#fff',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>{avatar.name}</div>
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)' }}>
                        {product.linkNum}号 · {product.name}
                      </div>
                    </div>
                  </div>

                  {/* 常规态视频预览 */}
                  <div style={{
                    width: '100%', aspectRatio: '9/16', maxHeight: 180,
                    borderRadius: 6, overflow: 'hidden',
                    background: '#1a1a2e', marginBottom: 4,
                    position: 'relative',
                  }}>
                    <div style={{
                      width: '100%', height: '100%',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', gap: 4,
                    }}>
                      <span style={{ fontSize: 28 }}>🎬</span>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>等待上传视频</span>
                    </div>
                    {/* 状态标签 */}
                    <div style={{
                      position: 'absolute', top: 6, left: 6,
                      display: 'flex', gap: 4,
                    }}>
                      <span style={{
                        fontSize: 9, padding: '2px 6px', borderRadius: 3,
                        background: banboEnabled ? 'rgba(16,185,129,0.8)' : 'rgba(255,255,255,0.15)',
                        color: '#fff', fontWeight: 600,
                      }}>{banboEnabled ? 'LIVE' : '待开启'}</span>
                    </div>
                  </div>

                  {/* 时间轴条 */}
                  <div style={{ marginTop: 4 }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3,
                    }}>
                      <span style={{ fontSize: 9, color: '#60A5FA', fontWeight: 500 }}>🔵 常规</span>
                      <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>{normalDuration}s 循环</span>
                    </div>
                    <div style={{
                      height: 8, borderRadius: 4,
                      background: 'rgba(255,255,255,0.08)',
                      overflow: 'hidden', position: 'relative',
                    }}>
                      {Array.from({ length: Math.ceil(totalDuration / normalDuration) }).map((_, i) => (
                        <div key={i} style={{
                          position: 'absolute',
                          left: `${(i * normalDuration / totalDuration) * 100}%`,
                          width: `${(normalDuration / totalDuration) * 100}%`,
                          height: '100%',
                          background: i % 2 === 0 ? 'rgba(96,165,250,0.6)' : 'rgba(96,165,250,0.3)',
                          borderRadius: 2,
                        }} />
                      ))}
                    </div>

                    {eventActions.length > 0 && (
                      <>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 4, marginTop: 4,
                        }}>
                          <span style={{ fontSize: 9, color: '#F59E0B', fontWeight: 500 }}>🟠 事件</span>
                          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>{eventDuration}s 触发</span>
                        </div>
                        <div style={{
                          height: 8, borderRadius: 4,
                          background: 'rgba(255,255,255,0.08)',
                          overflow: 'hidden', position: 'relative',
                          marginTop: 2,
                        }}>
                          <div style={{
                            position: 'absolute',
                            left: '10%', width: `${(eventDuration / totalDuration) * 100}%`,
                            height: '100%',
                            background: 'rgba(245,158,11,0.6)',
                            borderRadius: 2,
                          }} />
                          <span style={{
                            position: 'absolute', left: '3%', top: -1,
                            fontSize: 7, color: 'rgba(255,255,255,0.5)',
                          }}>触发点 ▸</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{
            padding: '32px 16px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>🎭</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', marginBottom: 6 }}>
              暂无伴播形象
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
              在右侧「形象配置」中<br />为商品添加伴播形象
            </div>
          </div>
        )}
      </div>

      {/* 底部：开启伴播按钮 */}
      <div style={{
        padding: '10px 12px',
        background: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
        flexShrink: 0,
      }}>
        <button onClick={onToggleBanbo} style={{
          width: '100%', padding: '10px',
          borderRadius: 8, border: 'none',
          background: banboEnabled
            ? 'linear-gradient(135deg, #34D399, #10B981)'
            : 'linear-gradient(135deg, #60A5FA, #3B82F6)',
          color: '#fff', fontSize: 14, fontWeight: 700,
          cursor: 'pointer', fontFamily: C.font,
        }}>
          {banboEnabled ? '✅ 伴播已开启' : '▶ 开启伴播'}
        </button>
      </div>
    </div>
  )
}

// ============ 形象配置内容（右侧 Tab，不含商品列表） ============
function ProductAvatarContent({
  selectedProductId, products, setProducts, previewStateId, setPreviewStateId,
  previewEventId, setPreviewEventId,
}: {
  selectedProductId: string | null
  products: ProductItem[]
  setProducts: React.Dispatch<React.SetStateAction<ProductItem[]>>
  previewStateId: string | null
  setPreviewStateId: (id: string | null) => void
  previewEventId: string | null
  setPreviewEventId: (id: string | null) => void
}) {
  const selectedProduct = products.find(p => p.id === selectedProductId)
  const boundAvatar = selectedProduct?.boundAvatarId
    ? AVATAR_LIBRARY.find(a => a.id === selectedProduct.boundAvatarId)
    : null
  const normalStates = selectedProduct?.boundAvatarId
    ? (NORMAL_STATES[selectedProduct.boundAvatarId] || DEFAULT_STATES)
    : []
  const eventActions = selectedProduct?.boundAvatarId
    ? (EVENT_ACTIONS[selectedProduct.boundAvatarId] || DEFAULT_EVENT_ACTIONS)
    : []

  // 多对多绑定：无锁定，所有形象可选
  const handleBind = (avatarId: string) => {
    if (!selectedProductId) return
    setProducts(prev => prev.map(p =>
      p.id === selectedProductId ? { ...p, boundAvatarId: avatarId } : p
    ))
    setPreviewStateId(null)
    setPreviewEventId(null)
  }

  const handleUnbind = () => {
    if (!selectedProductId) return
    setProducts(prev => prev.map(p =>
      p.id === selectedProductId ? { ...p, boundAvatarId: null } : p
    ))
    setPreviewStateId(null)
    setPreviewEventId(null)
  }

  return (
    <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', overflowX: 'hidden', padding: '10px 12px' }}>
      {selectedProduct ? (
        <>
          {/* 商品信息头 */}
          <div style={{
            padding: '8px 12px', margin: '10px 12px 0',
            borderRadius: 8, background: C.card, border: `1px solid ${C.border}`,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{
              fontSize: 10, padding: '2px 6px', borderRadius: 3,
              background: '#E8F3FF', color: C.blue, fontWeight: 600,
            }}>{selectedProduct.linkNum}号链接</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{selectedProduct.name}</span>
            <span style={{ fontSize: 12, color: C.textSec, marginLeft: 'auto' }}>{selectedProduct.price}</span>
          </div>

          {boundAvatar ? (
            <>
              {/* 形象绑定状态 */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                margin: '8px 12px 0', padding: '6px 10px', borderRadius: 6,
                background: '#E8F5E9', border: `1px solid ${C.green}30`,
              }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', overflow: 'hidden',
                  background: '#fff', flexShrink: 0,
                }}>
                  <ChromaKeyImage src={boundAvatar.preview} alt={boundAvatar.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable={false} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{boundAvatar.name}</span>
                <span style={{
                  fontSize: 9, padding: '2px 6px', borderRadius: 3,
                  background: '#C8E6C9', color: '#2E7D32', fontWeight: 600,
                }}>已绑定</span>
                <button onClick={handleUnbind} style={{
                  marginLeft: 'auto', padding: '2px 8px', borderRadius: 4,
                  border: `1px solid ${C.border}`, background: C.card,
                  color: C.textSec, fontSize: 10, cursor: 'pointer', fontFamily: C.font,
                }}>解绑</button>
              </div>

              {/* 常规状态（3×2 网格） */}
              <div style={{ padding: '10px 12px 0' }}>
                <div style={{
                  fontSize: 11, fontWeight: 600, color: C.blue, marginBottom: 6,
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  🔵 常规状态
                  <span style={{ fontSize: 10, fontWeight: 400, color: C.textSec }}>
                    ({normalStates.length}个 · 直播时随机轮播)
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                  {normalStates.map(st => {
                    const isActive = previewStateId === st.id
                    return (
                      <div key={st.id} onClick={() => {
                        setPreviewStateId(st.id)
                        setPreviewEventId(null)
                      }} style={{
                        padding: '8px 6px', borderRadius: 6, cursor: 'pointer',
                        background: isActive ? '#DDE3F0' : '#F5F6FA',
                        border: isActive ? `1.5px solid ${C.blue}` : `1px solid ${C.border}`,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                        transition: 'all 0.15s',
                      }}>
                        <span style={{ fontSize: 16 }}>{st.icon}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, color: C.text }}>{st.label}</span>
                        <span style={{ fontSize: 8, color: C.textSec }}>{st.duration}s</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* 形象库（底部网格）— 多对多：无锁定 */}
              <div style={{
                padding: '10px 12px', marginTop: 12, borderTop: `1px solid ${C.border}`,
                background: '#FAFAFA',
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.text, marginBottom: 8 }}>
                  🎭 形象库 <span style={{ fontSize: 10, fontWeight: 400, color: C.textSec }}>(点击可更换绑定)</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 6 }}>
                  {AVATAR_LIBRARY.map(av => {
                    const isCurrent = selectedProduct?.boundAvatarId === av.id
                    const boundCount = products.filter(p => p.boundAvatarId === av.id).length
                    return (
                      <div key={av.id} onClick={() => handleBind(av.id)} style={{
                        padding: '6px', borderRadius: 6, cursor: 'pointer',
                        background: isCurrent ? '#E8F5E9' : C.card,
                        border: isCurrent ? `1.5px solid ${C.green}` : `1px solid ${C.border}`,
                        textAlign: 'center', transition: 'all 0.15s',
                      }}>
                        <div style={{
                          width: '100%', aspectRatio: '1', borderRadius: 4, overflow: 'hidden',
                          background: '#f0f0f0', marginBottom: 4,
                        }}>
                          <ChromaKeyImage src={av.preview} alt={av.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable={false} />
                        </div>
                        <div style={{ fontSize: 9, fontWeight: 600, color: C.text }}>{av.name}</div>
                        {isCurrent && <div style={{ fontSize: 8, color: C.green, marginTop: 1 }}>✅ 当前</div>}
                        {!isCurrent && boundCount > 0 && (
                          <div style={{ fontSize: 8, color: C.textSec, marginTop: 1 }}>绑定{boundCount}个</div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          ) : (
            /* 未绑定状态 */
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', padding: 24,
            }}>
              <div style={{
                width: '100%', maxWidth: 320,
                background: '#FFF8F0', borderRadius: 10,
                padding: '16px', border: `1px solid ${C.orange}20`,
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 10, textAlign: 'center' }}>
                  🎭 未绑定伴播形象
                </div>
                <div style={{ fontSize: 11, color: C.textSec, textAlign: 'center', marginBottom: 12, lineHeight: 1.6 }}>
                  该商品还没有绑定伴播形象<br />请从下方形象库中选择
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 8 }}>
                  {AVATAR_LIBRARY.map(av => (
                    <div key={av.id} onClick={() => handleBind(av.id)} style={{
                      padding: '6px', borderRadius: 6,
                      cursor: 'pointer',
                      background: C.card,
                      border: `1px solid ${C.border}`,
                      textAlign: 'center',
                    }}>
                      <div style={{
                        width: '100%', aspectRatio: '1', borderRadius: 4, overflow: 'hidden',
                        background: '#f0f0f0', marginBottom: 3,
                      }}>
                        <ChromaKeyImage src={av.preview} alt={av.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable={false} />
                      </div>
                      <div style={{ fontSize: 9, fontWeight: 600, color: C.text }}>{av.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        /* 未选择商品 */
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', padding: 24,
        }}>
          <div style={{
            width: '100%', maxWidth: 320,
            background: '#F0F4FF', borderRadius: 10,
            padding: '16px', border: `1px solid ${C.blue}20`,
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 10, textAlign: 'center' }}>
              🚀 快速开始
            </div>
            {[
              { step: 1, text: '在左侧 Timeline 选择一个商品' },
              { step: 2, text: '从形象库绑定伴播形象' },
              { step: 3, text: '配置常规态和事件态' },
            ].map(item => (
              <div key={item.step} style={{
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8,
                padding: '8px 10px', borderRadius: 6, background: '#fff',
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: C.blue, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, flexShrink: 0,
                }}>{item.step}</div>
                <span style={{ fontSize: 12, color: C.text }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ============ 进退场指令组件 ============
type CommandType = 'show' | 'exit'
type CommandItem = { id: string; type: CommandType; label: string; desc: string; defaultPhrase: string; customPhrase: string }

const DEFAULT_COMMANDS: CommandItem[] = [
  { id: 'c1', type: 'show', label: '展示口令', desc: '伴播不在场 → 播放入场动画，穿着对应商品登场\n伴播已在场 → 原地换装（无进出动画）', defaultPhrase: '看看{N}号链接的模特上身效果', customPhrase: '' },
  { id: 'c2', type: 'exit', label: '退场口令', desc: '伴播播放退场动画离场。需要再次展示时，用展示口令重新登场', defaultPhrase: '请模特先下场', customPhrase: '' },
]

function CommandContent() {
  const [commands, setCommands] = useState(DEFAULT_COMMANDS)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const startEdit = (cmd: CommandItem) => {
    setEditingId(cmd.id)
    setEditValue(cmd.customPhrase || cmd.defaultPhrase)
  }

  const saveEdit = (id: string) => {
    setCommands(prev => prev.map(c => c.id === id ? { ...c, customPhrase: editValue } : c))
    setEditingId(null)
  }

  const resetToDefault = (id: string) => {
    setCommands(prev => prev.map(c => c.id === id ? { ...c, customPhrase: '' } : c))
  }

  const typeConfig: Record<CommandType, { icon: string; color: string; bg: string }> = {
    show: { icon: '🎭', color: C.green, bg: '#E8F5E9' },
    exit: { icon: '🚪', color: C.orange, bg: '#FFF3E0' },
  }

  return (
    <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', padding: '10px 12px' }}>
      {/* 顶部说明 */}
      <div style={{
        padding: '10px 12px', borderRadius: 8,
        background: C.blueLight, border: `1px solid #D4E0FF`, marginBottom: 12,
      }}>
        <div style={{ fontSize: 11, color: C.textSec, lineHeight: 1.7 }}>
          主播说出下方口令，AI 伴播会自动配合动作。<br />
          口令可自定义，<b style={{ color: C.orange }}>必须包含商品链接号</b>（{`{N}`} 会替换成实际链接号）。
        </div>
      </div>

      {/* 指令列表 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {commands.map(cmd => {
          const cfg = typeConfig[cmd.type]
          const displayPhrase = cmd.customPhrase || cmd.defaultPhrase
          const isEditing = editingId === cmd.id

          return (
            <div key={cmd.id} style={{
              padding: '12px', borderRadius: 8,
              border: `1px solid ${C.border}`, background: C.card,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <span style={{ fontSize: 16 }}>{cfg.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{cmd.label}</span>
                {cmd.customPhrase && (
                  <span style={{
                    fontSize: 8, padding: '1px 4px', borderRadius: 3,
                    background: 'rgba(255,125,0,0.08)', color: '#FF7D00', fontWeight: 600,
                  }}>已自定义</span>
                )}
              </div>
              {/* 内联行为说明 */}
              <div style={{
                fontSize: 10, color: C.textSec, lineHeight: 1.6, marginBottom: 8, paddingLeft: 2,
                whiteSpace: 'pre-line',
              }}>
                {cmd.desc}
              </div>

              {isEditing ? (
                <>
                  <input value={editValue} onChange={e => setEditValue(e.target.value)}
                    placeholder={cmd.defaultPhrase}
                    style={{
                      width: '100%', height: 32, padding: '0 10px', borderRadius: 6,
                      border: `1px solid ${C.blue}`, fontSize: 12, fontFamily: C.font,
                      outline: 'none', boxSizing: 'border-box', marginBottom: 6,
                    }} />
                  <div style={{ fontSize: 9, color: C.textTert, marginBottom: 6 }}>
                    默认：{cmd.defaultPhrase}
                  </div>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <button onClick={() => setEditingId(null)} style={{
                      padding: '3px 10px', borderRadius: 4, border: `1px solid ${C.border}`,
                      background: C.card, color: C.textSec, fontSize: 10, cursor: 'pointer', fontFamily: C.font,
                    }}>取消</button>
                    <button onClick={() => saveEdit(cmd.id)} style={{
                      padding: '3px 10px', borderRadius: 4, border: 'none',
                      background: C.blue, color: '#fff', fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: C.font,
                    }}>保存</button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{
                    padding: '8px 10px', borderRadius: 6,
                    background: cfg.bg, border: `1px solid ${cfg.color}30`,
                    fontSize: 12, color: C.text, marginBottom: 6,
                    lineHeight: 1.5,
                  }}>
                    「{displayPhrase}」
                  </div>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <button onClick={() => startEdit(cmd)} style={{
                      padding: '3px 10px', borderRadius: 4, border: `1px solid ${C.border}`,
                      background: C.card, color: C.blue, fontSize: 10, cursor: 'pointer', fontFamily: C.font,
                    }}>自定义</button>
                    {cmd.customPhrase && (
                      <button onClick={() => resetToDefault(cmd.id)} style={{
                        padding: '3px 10px', borderRadius: 4, border: `1px solid ${C.border}`,
                        background: C.card, color: C.textSec, fontSize: 10, cursor: 'pointer', fontFamily: C.font,
                      }}>恢复默认</button>
                    )}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* 异常提示区域 */}
      <div style={{
        marginTop: 12, padding: '10px 12px', borderRadius: 8,
        background: '#FFF7E6', border: '1px solid #FFE58F',
      }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#B8860B', marginBottom: 6 }}>⚠️ 异常提示规则</div>
        <div style={{ fontSize: 10, color: '#8B6914', lineHeight: 1.8 }}>
          • 展示口令无对应链接形象 → 画面不变 + 提示「无N号链接服饰的伴播模特」<br />
          • 退场口令但伴播不在场 → 画面不变 + 提示「无需退场」<br />
          • 统一原则：无匹配时画面不变化，仅工作台提示，不阻断直播流程
        </div>
      </div>

      {/* 事件态口令配置 */}
      <div style={{
        marginTop: 12, padding: '12px', borderRadius: 8,
        background: C.card, border: `1px solid ${C.border}`,
      }}>
        <div style={{
          fontSize: 12, fontWeight: 600, color: C.orange, marginBottom: 4,
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          🟠 事件态口令配置
        </div>
        <div style={{ fontSize: 10, color: C.textSec, marginBottom: 10, lineHeight: 1.6 }}>
          以下口令由形象自带，绑定商品后自动生效。主播说出对应口令 → 触发事件态动作。
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {AVATAR_LIBRARY.filter(av => EVENT_ACTIONS[av.id]).map(av => {
            const events = EVENT_ACTIONS[av.id] || DEFAULT_EVENT_ACTIONS
            return (
              <div key={av.id} style={{
                padding: '10px', borderRadius: 8,
                background: '#FFFAF5', border: `1px solid ${C.border}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%', overflow: 'hidden',
                    background: '#f0f0f0', flexShrink: 0,
                  }}>
                    <ChromaKeyImage src={av.preview} alt={av.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable={false} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{av.name}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingLeft: 4 }}>
                  {events.map(ev => (
                    <div key={ev.id} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '6px 8px', borderRadius: 6, background: '#fff',
                    }}>
                      <span style={{ fontSize: 12 }}>🎬</span>
                      <span style={{ fontSize: 11, fontWeight: 500, color: C.text, flex: 1 }}>{ev.label}</span>
                      <span style={{
                        fontSize: 10, color: C.orange, fontWeight: 500,
                        padding: '1px 6px', borderRadius: 3, background: '#FFF7E6',
                      }}>「{ev.command}」</span>
                      <span style={{ fontSize: 9, color: C.textSec }}>{ev.duration}s</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ============ 统一面板（v5：三步走引导向导） ============

function UnifiedBanboPanel({
  selectedProductId, products, setProducts,
  previewStateId, setPreviewStateId,
  previewEventId, setPreviewEventId,
}: {
  selectedProductId: string | null
  products: ProductItem[]
  setProducts: React.Dispatch<React.SetStateAction<ProductItem[]>>
  previewStateId: string | null
  setPreviewStateId: (id: string | null) => void
  previewEventId: string | null
  setPreviewEventId: (id: string | null) => void
}) {
  const selectedProduct = products.find(p => p.id === selectedProductId)
  const boundAvatar = selectedProduct?.boundAvatarId
    ? AVATAR_LIBRARY.find(a => a.id === selectedProduct.boundAvatarId)
    : null
  const normalStates = selectedProduct?.boundAvatarId
    ? (NORMAL_STATES[selectedProduct.boundAvatarId] || DEFAULT_STATES)
    : []
  const eventActions = selectedProduct?.boundAvatarId
    ? (EVENT_ACTIONS[selectedProduct.boundAvatarId] || DEFAULT_EVENT_ACTIONS)
    : []

  // 展开状态：绑定后自动展开下一步
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({ 1: true })
  useEffect(() => {
    if (!selectedProduct) { setExpandedSteps({ 1: true }); return }
    const s = getStepCompletion(products, selectedProductId)
    const next: Record<number, boolean> = {}
    if (!s.step1) { next[1] = true }
    else { next[1] = true; next[2] = true }
    if (s.step1 && s.step2) next[3] = expandedSteps[3] ?? false
    setExpandedSteps(next)
  }, [selectedProduct?.boundAvatarId, selectedProductId])

  const toggleStep = (n: number) => setExpandedSteps(prev => ({ ...prev, [n]: !prev[n] }))

  // 全局口令
  const [commands, setCommands] = useState(DEFAULT_COMMANDS)
  const [editingCmdId, setEditingCmdId] = useState<string | null>(null)
  const [cmdEditValue, setCmdEditValue] = useState('')

  // 事件态口令编辑
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const [eventEditValue, setEventEditValue] = useState('')
  const [localEventActions, setLocalEventActions] = useState<EventAction[]>([])
  useEffect(() => {
    setLocalEventActions(eventActions)
    setEditingEventId(null)
  }, [selectedProduct?.boundAvatarId])

  // 绑定/解绑
  const handleBind = (avatarId: string) => {
    if (!selectedProductId) return
    setProducts(prev => prev.map(p =>
      p.id === selectedProductId ? { ...p, boundAvatarId: avatarId } : p
    ))
    setPreviewStateId(null)
    setPreviewEventId(null)
  }
  const handleUnbind = () => {
    if (!selectedProductId) return
    setProducts(prev => prev.map(p =>
      p.id === selectedProductId ? { ...p, boundAvatarId: null } : p
    ))
    setPreviewStateId(null)
    setPreviewEventId(null)
  }

  // 事件态编辑
  const startEditEvent = (ev: EventAction) => { setEditingEventId(ev.id); setEventEditValue(ev.command) }
  const saveEditEvent = (id: string) => {
    setLocalEventActions(prev => prev.map(ev => ev.id === id ? { ...ev, command: eventEditValue } : ev))
    setEditingEventId(null)
  }

  // 步骤完成度
  const completion = getStepCompletion(products, selectedProductId)

  // 步骤组件
  const StepHeader = ({ step, title, desc, done }: { step: number; title: string; desc: string; done: boolean }) => {
    const isOpen = expandedSteps[step]
    return (
      <div onClick={() => toggleStep(step)} style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
        cursor: 'pointer', userSelect: 'none',
        background: isOpen ? '#F0F4FF' : C.card,
        borderBottom: isOpen ? `1px solid ${C.border}` : 'none',
        borderRadius: isOpen ? '8px 8px 0 0' : 8,
        margin: step > 1 ? '8px 12px 0' : '10px 12px 0',
        border: `1px solid ${C.border}`,
        borderBottomWidth: isOpen ? 0 : 1,
        transition: 'all 0.15s',
      }}>
        <div style={{
          width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
          background: done ? C.green : C.blue,
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700,
        }}>{done ? '✓' : step}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{title}</div>
          <div style={{ fontSize: 10, color: C.textSec, marginTop: 1 }}>{desc}</div>
        </div>
        <span style={{ fontSize: 14, color: C.textSec, transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }}>▾</span>
      </div>
    )
  }

  return (
    <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', overflowX: 'hidden' }}>
      {selectedProduct ? (
        <>
          {/* 商品信息条 */}
          <div style={{
            padding: '10px 12px', margin: '10px 12px 0',
            borderRadius: 8, background: C.card, border: `1px solid ${C.border}`,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{
              fontSize: 10, padding: '2px 6px', borderRadius: 3,
              background: '#E8F3FF', color: C.blue, fontWeight: 600,
            }}>{selectedProduct.linkNum}号链接</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{selectedProduct.name}</span>
            <span style={{ fontSize: 12, color: C.textSec, marginLeft: 'auto' }}>{selectedProduct.price}</span>
            {completion.status === 'ready' && (
              <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, background: '#E8F5E9', color: C.green, fontWeight: 600 }}>🟢 就绪</span>
            )}
            {completion.status === 'partial' && (
              <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, background: '#FFF7E6', color: '#E65100', fontWeight: 600 }}>🟡 待配置</span>
            )}
            {completion.status === 'new' && (
              <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, background: '#FFE8E8', color: '#D32F2F', fontWeight: 600 }}>🔴 未开始</span>
            )}
          </div>

          {/* ===== Step 1：选个伴播模特 ===== */}
          <StepHeader step={1} title="选个伴播模特" desc="给商品配一个虚拟模特，主播说口令时模特就出场" done={completion.step1} />
          {expandedSteps[1] && (
            <div style={{
              margin: '0 12px', padding: '12px',
              border: `1px solid ${C.border}`, borderTop: 'none',
              borderRadius: '0 0 8px 8px', background: '#fff',
            }}>
              {boundAvatar ? (
                <div>
                  {/* 已绑定展示 */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 10px', borderRadius: 8,
                    background: '#E8F5E9', border: `1px solid ${C.green}30`,
                    marginBottom: 10,
                  }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', background: '#fff', flexShrink: 0 }}>
                      <ChromaKeyImage src={boundAvatar.preview} alt={boundAvatar.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable={false} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{boundAvatar.name}</div>
                      <div style={{ fontSize: 10, color: C.green, marginTop: 1 }}>✅ 已绑定，主播喊口令即可出场</div>
                    </div>
                    <button onClick={handleUnbind} style={{
                      padding: '4px 10px', borderRadius: 6, border: `1px solid ${C.border}`,
                      background: C.card, color: C.textSec, fontSize: 11, cursor: 'pointer', fontFamily: C.font,
                    }}>换一个</button>
                  </div>
                  {/* 常态预览 */}
                  <div style={{ fontSize: 10, color: C.textSec, marginBottom: 6 }}>🎬 默认展示（直播时随机播放）</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                    {normalStates.map(st => {
                      const isActive = previewStateId === st.id
                      return (
                        <div key={st.id} onClick={() => { setPreviewStateId(st.id); setPreviewEventId(null) }}
                          style={{
                            padding: '8px 6px', borderRadius: 6, cursor: 'pointer',
                            background: isActive ? '#DDE3F0' : '#F5F6FA',
                            border: isActive ? `1.5px solid ${C.blue}` : `1px solid ${C.border}`,
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                            transition: 'all 0.15s',
                          }}>
                          <span style={{ fontSize: 16 }}>{st.icon}</span>
                          <span style={{ fontSize: 10, fontWeight: 600, color: C.text }}>{st.label}</span>
                          <span style={{ fontSize: 8, color: C.textSec }}>{st.duration}s</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 11, color: C.textSec, marginBottom: 10, textAlign: 'center', lineHeight: 1.6 }}>
                    👇 点击一个模特即可绑定
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                    {AVATAR_LIBRARY.map(av => (
                      <div key={av.id} onClick={() => handleBind(av.id)} style={{
                        padding: '6px', borderRadius: 8, cursor: 'pointer',
                        background: C.card, border: `1px solid ${C.border}`,
                        textAlign: 'center', transition: 'all 0.15s',
                      }}>
                        <div style={{ width: '100%', aspectRatio: '1', borderRadius: 6, overflow: 'hidden', background: '#f0f0f0', marginBottom: 4 }}>
                          <ChromaKeyImage src={av.preview} alt={av.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable={false} />
                        </div>
                        <div style={{ fontSize: 10, fontWeight: 600, color: C.text }}>{av.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===== Step 2：设定出场和退场 ===== */}
          <StepHeader step={2} title="设定出场和退场" desc="主播说什么模特就出来 / 退场，口令可以改" done={completion.step2} />
          {expandedSteps[2] && (
            <div style={{
              margin: '0 12px', padding: '12px',
              border: `1px solid ${C.border}`, borderTop: 'none',
              borderRadius: '0 0 8px 8px', background: '#fff',
            }}>
              <div style={{ fontSize: 10, color: C.textSec, marginBottom: 8, lineHeight: 1.5 }}>
                💡 口令就是主播说的话，默认值已填好，你可以改成更适合直播间的说法
              </div>
              {commands.map(cmd => {
                const cfg = cmd.type === 'show'
                  ? { icon: '🎭', label: '出场口令', desc: '主播说这个 → 模特登场展示', bg: '#E8F5E9' }
                  : { icon: '🚪', label: '退场口令', desc: '主播说这个 → 模特下场', bg: '#FFF3E0' }
                const displayPhrase = cmd.customPhrase || cmd.defaultPhrase
                const isEditing = editingCmdId === cmd.id
                return (
                  <div key={cmd.id} style={{
                    padding: '10px', borderRadius: 8, background: cfg.bg,
                    border: `1px solid ${C.border}`, marginBottom: 6,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span style={{ fontSize: 16 }}>{cfg.icon}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{cfg.label}</span>
                    </div>
                    <div style={{ fontSize: 10, color: C.textSec, marginBottom: 8 }}>{cfg.desc}</div>
                    {isEditing ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <input value={cmdEditValue} onChange={e => setCmdEditValue(e.target.value)}
                          style={{
                            flex: 1, height: 30, padding: '0 10px', borderRadius: 6,
                            border: `1px solid ${C.blue}`, fontSize: 12, fontFamily: C.font,
                            outline: 'none',
                          }} autoFocus />
                        <button onClick={() => {
                          setCommands(prev => prev.map(c => c.id === cmd.id ? { ...c, customPhrase: cmdEditValue } : c))
                          setEditingCmdId(null)
                        }} style={{
                          padding: '4px 12px', borderRadius: 6, border: 'none',
                          background: C.blue, color: '#fff', fontSize: 11, fontWeight: 600,
                          cursor: 'pointer', fontFamily: C.font,
                        }}>保存</button>
                        <button onClick={() => setEditingCmdId(null)} style={{
                          padding: '4px 12px', borderRadius: 6, border: `1px solid ${C.border}`,
                          background: '#fff', color: C.textSec, fontSize: 11,
                          cursor: 'pointer', fontFamily: C.font,
                        }}>取消</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          fontSize: 13, fontWeight: 600, color: C.text,
                          padding: '4px 10px', borderRadius: 6, background: '#fff',
                          border: `1px solid ${C.border}`,
                        }}>「{displayPhrase}」</span>
                        <button onClick={() => {
                          setEditingCmdId(cmd.id)
                          setCmdEditValue(cmd.customPhrase || cmd.defaultPhrase)
                        }} style={{
                          padding: '4px 10px', borderRadius: 6, border: `1px solid ${C.border}`,
                          background: '#fff', color: C.blue, fontSize: 11,
                          cursor: 'pointer', fontFamily: C.font,
                        }}>改口令</button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* ===== Step 3：加特殊动作（可选） ===== */}
          <StepHeader step={3} title="加特殊动作（可选）" desc="给模特加特殊动作，主播说对应口令就触发" done={completion.step3} />
          {expandedSteps[3] && (
            <div style={{
              margin: '0 12px 12px', padding: '12px',
              border: `1px solid ${C.border}`, borderTop: 'none',
              borderRadius: '0 0 8px 8px', background: '#fff',
            }}>
              <div style={{ fontSize: 10, color: C.textSec, marginBottom: 8, lineHeight: 1.5 }}>
                ⚡ 特殊动作是额外的互动效果，可以不配。配了之后主播说对应口令就会触发。
              </div>
              {localEventActions.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {localEventActions.map(ev => {
                    const isEditing = editingEventId === ev.id
                    return (
                      <div key={ev.id} style={{
                        padding: '8px 10px', borderRadius: 8,
                        background: '#FFFAF5', border: `1px solid ${C.border}`,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <span style={{ fontSize: 14 }}>🎬</span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{ev.label}</span>
                          <span style={{ fontSize: 9, color: C.textSec }}>{ev.duration}s</span>
                        </div>
                        {isEditing ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 10, color: C.textSec }}>口令：</span>
                            <input value={eventEditValue} onChange={e => setEventEditValue(e.target.value)}
                              style={{
                                flex: 1, height: 28, padding: '0 8px', borderRadius: 6,
                                border: `1px solid ${C.blue}`, fontSize: 11, fontFamily: C.font,
                                outline: 'none',
                              }} autoFocus />
                            <button onClick={() => saveEditEvent(ev.id)} style={{
                              padding: '3px 10px', borderRadius: 6, border: 'none',
                              background: C.blue, color: '#fff', fontSize: 10, fontWeight: 600,
                              cursor: 'pointer', fontFamily: C.font,
                            }}>保存</button>
                            <button onClick={() => setEditingEventId(null)} style={{
                              padding: '3px 10px', borderRadius: 6, border: `1px solid ${C.border}`,
                              background: '#fff', color: C.textSec, fontSize: 10,
                              cursor: 'pointer', fontFamily: C.font,
                            }}>取消</button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{
                              fontSize: 11, color: C.orange, fontWeight: 500,
                              padding: '3px 8px', borderRadius: 4, background: '#FFF7E6',
                            }}>「{ev.command}」</span>
                            <button onClick={() => startEditEvent(ev)} style={{
                              padding: '3px 8px', borderRadius: 4, border: `1px solid ${C.border}`,
                              background: '#fff', color: C.blue, fontSize: 10,
                              cursor: 'pointer', fontFamily: C.font,
                            }}>改口令</button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '16px 0', color: C.textSec, fontSize: 11 }}>
                  该模特暂无特殊动作，可以跳过这步
                </div>
              )}
            </div>
          )}

          {/* 形象库（折叠在底部，方便更换） */}
          {boundAvatar && (
            <div style={{
              margin: '4px 12px 12px', padding: '10px 12px', borderRadius: 8,
              background: '#FAFAFA', border: `1px solid ${C.border}`,
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.text, marginBottom: 8 }}>
                🎭 换个模特？
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: 6 }}>
                {AVATAR_LIBRARY.map(av => {
                  const isCurrent = selectedProduct?.boundAvatarId === av.id
                  return (
                    <div key={av.id} onClick={() => !isCurrent && handleBind(av.id)} style={{
                      padding: 4, borderRadius: 6, cursor: isCurrent ? 'default' : 'pointer',
                      background: isCurrent ? '#E8F5E9' : C.card,
                      border: isCurrent ? `1.5px solid ${C.green}` : `1px solid ${C.border}`,
                      textAlign: 'center', transition: 'all 0.15s', opacity: isCurrent ? 0.7 : 1,
                    }}>
                      <div style={{ width: '100%', aspectRatio: '1', borderRadius: 4, overflow: 'hidden', background: '#f0f0f0', marginBottom: 2 }}>
                        <ChromaKeyImage src={av.preview} alt={av.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable={false} />
                      </div>
                      <div style={{ fontSize: 8, fontWeight: 600, color: C.text }}>{av.name}</div>
                      {isCurrent && <div style={{ fontSize: 7, color: C.green }}>当前</div>}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      ) : (
        /* 未选择商品 */
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', padding: 24, height: '100%',
        }}>
          <div style={{
            width: '100%', maxWidth: 320,
            background: '#F0F4FF', borderRadius: 10,
            padding: '16px', border: `1px solid ${C.blue}20`,
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 10, textAlign: 'center' }}>
              🚀 配置向导
            </div>
            {[
              { step: 1, text: '在左侧选择一个商品', icon: '📦' },
              { step: 2, text: '给它选一个伴播模特', icon: '🎭' },
              { step: 3, text: '设定出场退场口令', icon: '🎤' },
            ].map(item => (
              <div key={item.step} style={{
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8,
                padding: '8px 10px', borderRadius: 6, background: '#fff',
              }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <span style={{ fontSize: 12, color: C.text }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ============ 系统设置内容组件（占位） ============
function SystemSettingsContent() {
  return (
    <div style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', padding: 32,
    }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>⚙️</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>系统设置</div>
      <div style={{ fontSize: 11, color: C.textSec, textAlign: 'center' }}>
        版本分级 · NDI · 设备状态
      </div>
    </div>
  )
}

// ============ 形象库内容组件（适配 360px） ============
function AvatarContent() {
  const [avatars] = useState(AVATARS)
  const [selectedId, setSelectedId] = useState('a1')
  const [filter, setFilter] = useState<'all' | 'public' | 'custom'>('all')
  const [outfitMap, setOutfitMap] = useState<Record<string, string>>(() => {
    const m: Record<string, string> = {}
    avatars.forEach(a => { m[a.id] = a.selectedOutfit })
    return m
  })
  const [showCS, setShowCS] = useState(false)
  const [pendingAvatarId, setPendingAvatarId] = useState<string | null>(null)

  const MOCK_BINDINGS = {
    voiceSwitch: { outfitBindings: 2 },
    autoChat: { fixedChatBindings: 1 },
  }
  const hasBindings = MOCK_BINDINGS.voiceSwitch.outfitBindings > 0 || MOCK_BINDINGS.autoChat.fixedChatBindings > 0

  const selected = avatars.find(a => a.id === selectedId) || avatars[0]
  const currentOutfitId = outfitMap[selected.id] || selected.selectedOutfit
  const currentOutfit = selected.outfits.find(o => o.id === currentOutfitId) || selected.outfits[0]
  const currentPreview = currentOutfit.preview || selected.preview

  const filteredAvatars = avatars.filter(a => filter === 'all' || a.category === filter)

  const handleAvatarClick = (avatarId: string) => {
    if (avatarId === selectedId) return
    if (hasBindings) setPendingAvatarId(avatarId)
    else setSelectedId(avatarId)
  }

  const confirmSwitch = () => {
    if (pendingAvatarId) {
      setSelectedId(pendingAvatarId)
      setPendingAvatarId(null)
    }
  }

  const handleSelectOutfit = (outfitId: string) => {
    setOutfitMap(prev => ({ ...prev, [selected.id]: outfitId }))
  }

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      {/* 左侧：形象网格（压缩到 130px） */}
      <div style={{
        width: 130, borderRight: `1px solid ${C.border}`,
        overflowY: 'auto', padding: '8px', flexShrink: 0,
      }}>
        {/* 分类标签（紧凑） */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 8, flexWrap: 'wrap' }}>
          {[
            { key: 'all' as const, label: '全部', count: avatars.length },
            { key: 'public' as const, label: '公共', count: avatars.filter(a => a.category === 'public').length },
            { key: 'custom' as const, label: '定制', count: avatars.filter(a => a.category === 'custom').length },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              style={{
                padding: '3px 8px', borderRadius: 12, border: 'none',
                fontSize: 11, fontWeight: filter === tab.key ? 500 : 400,
                background: filter === tab.key ? C.blueLight : 'transparent',
                color: filter === tab.key ? C.blue : C.textSec,
                cursor: 'pointer', fontFamily: C.font,
              }}
            >{tab.label}({tab.count})</button>
          ))}
        </div>

        {/* 形象列表 */}
        {filteredAvatars.map(avatar => (
          <div
            key={avatar.id}
            onClick={() => handleAvatarClick(avatar.id)}
            style={{
              padding: '8px', borderRadius: 6, marginBottom: 4,
              cursor: 'pointer',
              background: selectedId === avatar.id ? C.blueLight : 'transparent',
              border: selectedId === avatar.id ? `1.5px solid ${C.blue}` : '1.5px solid transparent',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 6, overflow: 'hidden',
                background: '#FFFFFF', flexShrink: 0,
              }}>
                <ChromaKeyImage src={avatar.preview} alt={avatar.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable={false} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{avatar.name}</div>
                <div style={{ fontSize: 10, color: C.textSec }}>{avatar.type}</div>
              </div>
            </div>
            {selectedId === avatar.id && (
              <div style={{
                position: 'absolute', top: 4, right: 4,
                width: 14, height: 14, borderRadius: '50%',
                background: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 9, fontWeight: 700,
              }}>✓</div>
            )}
          </div>
        ))}

        {/* 添加定制形象 */}
        <div onClick={() => setShowCS(true)} style={{
          padding: '10px 8px', borderRadius: 6,
          border: `1.5px dashed ${C.border}`, textAlign: 'center',
          cursor: 'pointer', marginTop: 4,
        }}>
          <span style={{ fontSize: 16, color: C.textTert }}>+</span>
          <div style={{ fontSize: 10, color: C.textTert, marginTop: 2 }}>添加定制</div>
        </div>
      </div>

      {/* 右侧：详情（适配剩余宽度 ~230px） */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>
        {/* 形象预览（9:16，缩小） */}
        <div style={{
          width: '100%', aspectRatio: '9/16', maxHeight: 180,
          background: '#FFFFFF', borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 10, position: 'relative', overflow: 'hidden',
          border: `1px solid ${C.border}`,
        }}>
          <ChromaKeyImage src={currentPreview} alt={selected.name}
            style={{ maxHeight: '90%', maxWidth: '90%', objectFit: 'contain' }} draggable={false} />
          <div style={{
            position: 'absolute', bottom: 6, right: 6,
            background: 'rgba(0,0,0,0.6)', borderRadius: 4,
            padding: '2px 6px', fontSize: 9, color: 'rgba(255,255,255,0.8)',
          }}>🔁 {currentOutfit.name}</div>
          <div style={{
            position: 'absolute', top: 6, left: 6,
            background: 'rgba(0,0,0,0.6)', borderRadius: 4,
            padding: '2px 6px', fontSize: 10, color: 'rgba(255,255,255,0.8)', fontWeight: 500,
          }}>{selected.name}</div>
        </div>

        {/* 造型选择 */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 6 }}>造型</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {selected.outfits.map(outfit => (
              <button key={outfit.id} onClick={() => handleSelectOutfit(outfit.id)} style={{
                padding: '4px 10px', borderRadius: 5,
                border: outfit.id === currentOutfitId ? `1.5px solid ${C.blue}` : `1px solid ${C.border}`,
                background: outfit.id === currentOutfitId ? C.blueLight : C.card,
                color: outfit.id === currentOutfitId ? C.blue : C.text,
                fontSize: 11, fontWeight: outfit.id === currentOutfitId ? 500 : 400,
                cursor: 'pointer', fontFamily: C.font,
              }}>{outfit.name}</button>
            ))}
          </div>
        </div>

        {/* 默认状态 */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 6 }}>
            默认状态
            <span style={{ fontSize: 10, fontWeight: 400, color: C.textSec, marginLeft: 4 }}>（无动作时的自然状态）</span>
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {currentOutfit.defaultStates.map(state => (
              <button key={state.id} style={{
                padding: '3px 8px', borderRadius: 5,
                border: state.selected ? `1.5px solid ${C.green}` : `1px solid ${C.border}`,
                background: state.selected ? C.greenLight : C.card,
                color: state.selected ? C.green : C.text,
                fontSize: 11, cursor: 'pointer', fontFamily: C.font,
              }}>{state.selected && '🟢 '}{state.label}</button>
            ))}
          </div>
        </div>

        {/* 动作分支 */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 6 }}>
            动作分支
            <span style={{ fontSize: 10, fontWeight: 400, color: C.textSec, marginLeft: 4 }}>（触发后短暂播放）</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {currentOutfit.actions.map(action => (
              <div key={action.id} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 10px', background: C.card,
                border: `1px solid ${C.border}`, borderRadius: 6,
              }}>
                <span style={{ fontSize: 16 }}>{action.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: C.text, fontWeight: 500 }}>{action.name}</div>
                  <div style={{ fontSize: 10, color: C.textSec }}>{action.duration}</div>
                </div>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: C.green, boxShadow: '0 0 4px rgba(0,180,42,0.4)',
                }}/>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 客服弹窗 */}
      {showCS && (
        <div onClick={() => setShowCS(false)} style={{
          position: 'absolute', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            width: 280, background: '#fff', borderRadius: 12,
            padding: '24px 20px', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            fontFamily: C.font,
          }}>
            <button onClick={() => setShowCS(false)} style={{
              position: 'absolute', top: 10, right: 12,
              background: 'none', border: 'none', fontSize: 16, color: C.textSec, cursor: 'pointer',
            }}>✕</button>
            <div style={{ fontSize: 32, marginBottom: 10 }}>🎨</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 6 }}>定制专属伴播形象</div>
            <div style={{ fontSize: 12, color: C.textSec, lineHeight: 1.5, marginBottom: 16 }}>
              扫码联系顾问，了解更多定制方案！
            </div>
            <div style={{
              width: 120, height: 120, margin: '0 auto',
              borderRadius: 10, background: '#F7F8FA', border: `1px solid ${C.border}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <div style={{ fontSize: 28 }}>💬</div>
              <div style={{ fontSize: 10, color: C.textSec }}>扫码添加客服微信</div>
            </div>
          </div>
        </div>
      )}

      {/* 切换形象提醒弹窗 */}
      {pendingAvatarId && (() => {
        const targetAvatar = avatars.find(a => a.id === pendingAvatarId)
        if (!targetAvatar) return null
        return (
          <div onClick={() => setPendingAvatarId(null)} style={{
            position: 'absolute', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div onClick={e => e.stopPropagation()} style={{
              width: 280, background: '#fff', borderRadius: 12,
              padding: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              fontFamily: C.font,
            }}>
              <div style={{ textAlign: 'center', marginBottom: 12 }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>⚠️</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>切换形象确认</div>
                <div style={{ fontSize: 11, color: C.textSec, lineHeight: 1.5 }}>
                  切换到「{targetAvatar.name}」后，以下配置将<span style={{ color: '#FF7D00', fontWeight: 600 }}>失效</span>：
                </div>
              </div>
              <div style={{
                padding: '8px 12px', borderRadius: 6,
                background: '#FFF7E6', border: '1px solid #FFE58F', marginBottom: 10,
              }}>
                {MOCK_BINDINGS.voiceSwitch.outfitBindings > 0 && (
                  <div style={{ fontSize: 11, color: '#B8860B', marginBottom: 3 }}>
                    <span style={{ fontSize: 9, padding: '1px 4px', borderRadius: 3, background: '#FFE58F' }}>声控互动</span>
                    {' '}2 条商品造型绑定
                  </div>
                )}
                {MOCK_BINDINGS.autoChat.fixedChatBindings > 0 && (
                  <div style={{ fontSize: 11, color: '#B8860B' }}>
                    <span style={{ fontSize: 9, padding: '1px 4px', borderRadius: 3, background: '#FFE58F' }}>智能搭话</span>
                    {' '}1 条固定搭话的造型/动作
                  </div>
                )}
              </div>
              <div style={{
                padding: '6px 12px', borderRadius: 6,
                background: '#F0FAF0', border: '1px solid #A5D6A7', marginBottom: 14,
              }}>
                <div style={{ fontSize: 10, color: '#2E7D32' }}>✅ 不受影响：频率、话术模板、场景装修素材</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setPendingAvatarId(null)} style={{
                  flex: 1, height: 36, borderRadius: 6,
                  background: 'transparent', border: `1px solid ${C.border}`,
                  color: C.textSec, fontSize: 12, cursor: 'pointer', fontFamily: C.font,
                }}>取消</button>
                <button onClick={confirmSwitch} style={{
                  flex: 2, height: 36, borderRadius: 6,
                  background: '#FF7D00', border: 'none',
                  color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: C.font,
                }}>确认切换</button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

// ============ 音色内容组件（适配 360px） ============
function VoiceContent() {
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'female' | 'male'>('all')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const lockedVoice = VOICES.find(v => v.id === LOCKED_VOICE_ID) || VOICES[0]

  const handlePlay = (id: string) => {
    if (playingId === id) {
      setPlayingId(null)
      if (timerRef.current) clearTimeout(timerRef.current)
      return
    }
    setPlayingId(id)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setPlayingId(null), 3000)
  }

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  const filteredVoices = VOICES.filter(v => filter === 'all' || v.gender === filter)

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>
      {/* 当前锁定音色（紧凑） */}
      <div style={{
        padding: '12px',
        background: `linear-gradient(135deg, ${lockedVoice.color}10 0%, ${lockedVoice.color}04 100%)`,
        borderRadius: 10, border: `1.5px solid ${lockedVoice.color}30`,
        marginBottom: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10,
            background: `${lockedVoice.color}18`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, flexShrink: 0, position: 'relative',
          }}>
            🎤
            <div style={{
              position: 'absolute', top: -3, right: -3,
              width: 16, height: 16, borderRadius: '50%',
              background: '#FF7D00', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
            }}>🔒</div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{lockedVoice.name}</span>
              <span style={{
                fontSize: 9, padding: '2px 6px', borderRadius: 4,
                background: 'rgba(255,125,0,0.08)', color: '#FF7D00', fontWeight: 600,
              }}>已锁定</span>
            </div>
            <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
              {lockedVoice.tags.map(tag => (
                <span key={tag} style={{
                  fontSize: 10, padding: '1px 6px', borderRadius: 4,
                  background: `${lockedVoice.color}12`, color: lockedVoice.color,
                }}>{tag}</span>
              ))}
            </div>
            <div style={{ fontSize: 10, color: C.textSec, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{LOCKED_REASON}</div>
          </div>
          <PlayButton
            playing={playingId === lockedVoice.id}
            onClick={() => handlePlay(lockedVoice.id)}
            color={lockedVoice.color}
            size={36}
          />
        </div>
      </div>

      {/* 音色列表 */}
      <div style={{
        fontSize: 11, fontWeight: 600, color: C.text, marginBottom: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span>全部音色</span>
        <span style={{ fontSize: 10, fontWeight: 400, color: C.textTert }}>音色由动作素材决定</span>
      </div>

      {/* 筛选标签 */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
        {[
          { key: 'all' as const, label: '全部', count: VOICES.length },
          { key: 'female' as const, label: '女声', count: VOICES.filter(v => v.gender === 'female').length },
          { key: 'male' as const, label: '男声', count: VOICES.filter(v => v.gender === 'male').length },
        ].map(tab => (
          <button key={tab.key} onClick={() => setFilter(tab.key)} style={{
            padding: '3px 10px', borderRadius: 12, border: 'none', fontSize: 11,
            fontWeight: filter === tab.key ? 500 : 400,
            background: filter === tab.key ? C.blueLight : 'transparent',
            color: filter === tab.key ? C.blue : C.textSec,
            cursor: 'pointer', fontFamily: C.font,
          }}>{tab.label}({tab.count})</button>
        ))}
      </div>

      {/* 音色列表（紧凑） */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {filteredVoices.map(voice => {
          const isLocked = voice.id === LOCKED_VOICE_ID
          return (
            <div key={voice.id} style={{
              padding: '8px 10px', borderRadius: 8,
              background: isLocked ? `${voice.color}06` : C.card,
              border: isLocked ? `1px solid ${voice.color}25` : `1px solid ${C.border}`,
              display: 'flex', alignItems: 'center', gap: 8,
              opacity: isLocked ? 1 : 0.5, cursor: 'default',
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 6,
                background: `${voice.color}12`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, flexShrink: 0,
              }}>{voice.gender === 'female' ? '🎤' : '🎙'}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{voice.name}</span>
                  {isLocked && (
                    <span style={{
                      fontSize: 8, padding: '1px 4px', borderRadius: 3,
                      background: 'rgba(255,125,0,0.08)', color: '#FF7D00', fontWeight: 600,
                    }}>当前</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 3 }}>
                  {voice.tags.map(tag => (
                    <span key={tag} style={{
                      fontSize: 9, padding: '1px 4px', borderRadius: 3,
                      background: `${voice.color}10`, color: isLocked ? voice.color : C.textTert,
                    }}>{tag}</span>
                  ))}
                </div>
              </div>
              <PlayButton
                playing={playingId === voice.id}
                onClick={() => handlePlay(voice.id)}
                color={isLocked ? voice.color : C.textTert}
                size={28}
              />
              {!isLocked && <span style={{ fontSize: 12, color: C.textTert, flexShrink: 0 }}>🔒</span>}
            </div>
          )
        })}
      </div>

      {/* 自定义声音 */}
      <div style={{
        marginTop: 12, padding: '12px', borderRadius: 8,
        border: `1.5px dashed ${C.border}`, textAlign: 'center',
      }}>
        <div style={{ fontSize: 18, marginBottom: 4 }}>🎤</div>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 3 }}>自定义声音</div>
        <div style={{ fontSize: 10, color: C.textSec, marginBottom: 10 }}>快速克隆专属音色，只需15秒</div>
        <button style={{
          width: '100%', padding: '8px', borderRadius: 6,
          background: C.blue, border: 'none', color: '#fff',
          fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: C.font,
        }}>训练声音</button>
      </div>
    </div>
  )
}

// ============ 智能搭话内容组件（适配 360px） ============
function AutoChatContent() {
  const [enabled, setEnabled] = useState(true)
  const [specialNote, setSpecialNote] = useState('')
  const [frequency, setFrequency] = useState<'high' | 'mid' | 'low'>('high')
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
    high: { label: '高频', desc: '节奏快' },
    mid: { label: '中频', desc: '适中' },
    low: { label: '低频', desc: '节奏慢' },
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>
      {/* 功能开关 */}
      <div style={{
        padding: '10px 12px', background: C.card, borderRadius: 8,
        border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 10,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 2 }}>💬 智能搭话</div>
          <div style={{ fontSize: 11, color: C.textSec, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>AI 自动识别主播话术，实时搭话互动</div>
        </div>
        <Toggle checked={enabled} onChange={setEnabled} />
      </div>

      {enabled && (
        <>
          {/* 覆盖场景（上下堆叠，适配 360px） */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 6 }}>
              覆盖场景<span style={{ fontSize: 10, fontWeight: 400, color: C.textSec, marginLeft: 4 }}>（自动生效）</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{
                padding: '10px 12px', borderRadius: 8,
                border: `1.5px solid ${C.blue}`, background: C.blueLight,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 13 }}>🛍</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.blue }}>带货场景</span>
                  <span style={{ marginLeft: 'auto', fontSize: 9, padding: '2px 5px', borderRadius: 4, background: `${C.blue}15`, color: C.blue }}>始终开启</span>
                </div>
                <div style={{ fontSize: 10, color: C.textSec }}>主播说「版型显瘦」→ 伴播「对的！」</div>
              </div>
              <div style={{
                padding: '10px 12px', borderRadius: 8,
                border: `1.5px solid ${C.green}`, background: C.greenLight,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 13 }}>🎮</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.green }}>互动场景</span>
                  <span style={{ marginLeft: 'auto', fontSize: 9, padding: '2px 5px', borderRadius: 4, background: `${C.green}15`, color: C.green }}>始终开启</span>
                </div>
                <div style={{ fontSize: 10, color: C.textSec }}>主播问「好不好看？」→ 伴播「好看！」</div>
              </div>
            </div>
          </div>

          {/* 特别交代 */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 4 }}>
              特别交代<span style={{ fontSize: 10, fontWeight: 400, color: C.textSec, marginLeft: 4 }}>（AI 自学习）</span>
            </div>
            <textarea value={specialNote} onChange={e => setSpecialNote(e.target.value)}
              placeholder="例：主播强调面料用的是定制棉，凉感透气，伴播要顺着回应…"
              style={{
                width: '100%', height: 48, padding: '8px 10px', borderRadius: 6,
                border: `1px solid ${C.border}`, fontSize: 11, fontFamily: C.font,
                resize: 'none', outline: 'none', boxSizing: 'border-box', lineHeight: 1.5,
              }} />
          </div>

          {/* 搭话频率 */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 6 }}>搭话频率</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {Object.entries(freqConfig).map(([key, cfg]) => (
                <button key={key} onClick={() => setFrequency(key as typeof frequency)} style={{
                  flex: 1, padding: '8px 6px', borderRadius: 6,
                  border: frequency === key ? `1.5px solid ${C.blue}` : `1px solid ${C.border}`,
                  background: frequency === key ? C.blueLight : C.card,
                  cursor: 'pointer', fontFamily: C.font, textAlign: 'center',
                }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: frequency === key ? C.blue : C.text }}>{cfg.label}</div>
                  <div style={{ fontSize: 9, color: C.textSec }}>{cfg.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 输出方式 */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 6 }}>输出方式</div>
            <div style={{
              padding: '8px 10px', borderRadius: 6,
              border: `1.5px solid ${C.green}`, background: C.greenLight,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 14 }}>🔊</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.green }}>TTS 语音</span>
                <span style={{ marginLeft: 'auto', fontSize: 9, padding: '2px 5px', borderRadius: 4, background: `${C.green}15`, color: C.green }}>默认</span>
              </div>
              <div style={{ fontSize: 10, color: C.textSec, marginTop: 3 }}>伴播用音色库的声音说出搭话内容</div>
            </div>
          </div>

          {/* 固定搭话 */}
          <div style={{ marginBottom: 10 }}>
            <div style={{
              padding: '10px 12px', background: C.card, borderRadius: 8,
              border: `1px solid ${C.border}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: fixedChatEnabled ? 8 : 0 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>
                    🎯 固定搭话<span style={{ fontSize: 9, fontWeight: 400, color: C.textTert, marginLeft: 3 }}>可选</span>
                  </div>
                  <div style={{ fontSize: 10, color: C.textSec, marginTop: 2 }}>
                    关键词 → 回复话术 + 造型切换（上限30组）
                  </div>
                </div>
                <Toggle checked={fixedChatEnabled} onChange={setFixedChatEnabled} />
              </div>

              {fixedChatEnabled && (
                <>
                  <button onClick={addFixedChat} style={{
                    width: '100%', padding: '6px', borderRadius: 6,
                    border: `1.5px dashed ${C.border}`, background: 'transparent',
                    color: C.blue, fontSize: 11, cursor: 'pointer', fontFamily: C.font,
                    marginBottom: 6,
                  }}>+ 新增固定搭话</button>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {fixedChats.map(chat => {
                      const actions = getOutfitActions(chat.outfitId)
                      return (
                        <div key={chat.id} style={{
                          padding: '8px 10px', borderRadius: 6,
                          border: `1px solid ${C.border}`, background: '#FAFAFA',
                        }}>
                          {editingId === chat.id ? (
                            <>
                              <div style={{ fontSize: 9, color: C.textTert, marginBottom: 3 }}>触发词</div>
                              <input value={chat.trigger} onChange={e => updateFixedChat(chat.id, 'trigger', e.target.value)}
                                placeholder="例：库存没有了"
                                style={{
                                  width: '100%', height: 24, padding: '0 6px', borderRadius: 4,
                                  border: `1px solid ${chat.trigger.trim() ? C.border : C.red}`,
                                  fontSize: 11, fontFamily: C.font, outline: 'none', boxSizing: 'border-box', marginBottom: 4,
                                }} />
                              <div style={{ fontSize: 9, color: C.textTert, marginBottom: 3 }}>回复内容</div>
                              <input value={chat.response} onChange={e => updateFixedChat(chat.id, 'response', e.target.value)}
                                placeholder="例：没有了哦"
                                style={{
                                  width: '100%', height: 24, padding: '0 6px', borderRadius: 4,
                                  border: `1px solid ${chat.response.trim() ? C.border : C.red}`,
                                  fontSize: 11, fontFamily: C.font, outline: 'none', boxSizing: 'border-box', marginBottom: 4,
                                }} />
                              <div style={{ fontSize: 9, color: C.textTert, marginBottom: 3 }}>切换造型</div>
                              <div style={{ display: 'flex', gap: 3, marginBottom: 6 }}>
                                <button onClick={() => updateFixedChat(chat.id, 'outfitId', null)} style={{
                                  padding: '3px 8px', borderRadius: 4,
                                  border: chat.outfitId === null ? `1px solid ${C.blue}` : `1px solid ${C.border}`,
                                  background: chat.outfitId === null ? C.blueLight : C.card,
                                  color: chat.outfitId === null ? C.blue : C.textSec,
                                  fontSize: 10, cursor: 'pointer', fontFamily: C.font,
                                }}>不切换</button>
                                {AVATAR_OUTFITS.map(o => (
                                  <button key={o.id} onClick={() => updateFixedChat(chat.id, 'outfitId', o.id)} style={{
                                    padding: '3px 8px', borderRadius: 4,
                                    border: chat.outfitId === o.id ? `1px solid ${C.orange}` : `1px solid ${C.border}`,
                                    background: chat.outfitId === o.id ? 'rgba(255,125,0,0.08)' : C.card,
                                    color: chat.outfitId === o.id ? C.orange : C.textSec,
                                    fontSize: 10, cursor: 'pointer', fontFamily: C.font,
                                  }}>{o.name}</button>
                                ))}
                              </div>
                              {chat.outfitId && (
                                <>
                                  <div style={{ fontSize: 9, color: C.textTert, marginBottom: 3 }}>配合动作</div>
                                  <div style={{ display: 'flex', gap: 3, marginBottom: 6 }}>
                                    <button onClick={() => updateFixedChat(chat.id, 'actionId', null)} style={{
                                      padding: '3px 8px', borderRadius: 4,
                                      border: chat.actionId === null ? `1px solid ${C.blue}` : `1px solid ${C.border}`,
                                      background: chat.actionId === null ? C.blueLight : C.card,
                                      color: chat.actionId === null ? C.blue : C.textSec,
                                      fontSize: 10, cursor: 'pointer', fontFamily: C.font,
                                    }}>默认</button>
                                    {actions.map(a => (
                                      <button key={a.id} onClick={() => updateFixedChat(chat.id, 'actionId', a.id)} style={{
                                        padding: '3px 8px', borderRadius: 4,
                                        border: chat.actionId === a.id ? `1px solid ${C.green}` : `1px solid ${C.border}`,
                                        background: chat.actionId === a.id ? C.greenLight : C.card,
                                        color: chat.actionId === a.id ? C.green : C.textSec,
                                        fontSize: 10, cursor: 'pointer', fontFamily: C.font,
                                      }}>{a.icon} {a.name}</button>
                                    ))}
                                  </div>
                                </>
                              )}
                              {!canSave(chat) && (
                                <div style={{ fontSize: 9, color: C.red, marginBottom: 3 }}>⚠️ 触发词和回复不能为空</div>
                              )}
                              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button onClick={() => { if (canSave(chat)) setEditingId(null) }} style={{
                                  padding: '2px 10px', borderRadius: 4, border: 'none',
                                  background: canSave(chat) ? C.blue : '#E5E6EB',
                                  color: canSave(chat) ? '#fff' : C.textTert,
                                  fontSize: 10, cursor: canSave(chat) ? 'pointer' : 'not-allowed', fontFamily: C.font,
                                }}>完成</button>
                              </div>
                            </>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 2 }}>
                                  <span style={{ fontSize: 8, padding: '1px 4px', borderRadius: 3, background: '#FFF3E0', color: C.orange, flexShrink: 0 }}>触发</span>
                                  <span style={{ fontSize: 11, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chat.trigger}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: chat.outfitId ? 2 : 0 }}>
                                  <span style={{ fontSize: 8, padding: '1px 4px', borderRadius: 3, background: '#E8F5E9', color: C.green, flexShrink: 0 }}>回复</span>
                                  <span style={{ fontSize: 11, color: C.textSec, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chat.response}</span>
                                </div>
                                {chat.outfitId && (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                    <span style={{ fontSize: 8, padding: '1px 4px', borderRadius: 3, background: 'rgba(255,125,0,0.08)', color: C.orange, flexShrink: 0 }}>造型</span>
                                    <span style={{ fontSize: 10, color: C.textSec }}>
                                      {getOutfitName(chat.outfitId)}
                                      {chat.actionId && (() => {
                                        const act = getActionInfo(chat.outfitId, chat.actionId)
                                        return act ? <span> · {act.icon} {act.name}</span> : null
                                      })()}
                                      {!chat.actionId && <span style={{ color: C.textTert }}> · 默认</span>}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                                <button onClick={() => setEditingId(chat.id)} style={{
                                  padding: '2px 6px', borderRadius: 3, border: `1px solid ${C.border}`,
                                  background: C.card, color: C.blue, fontSize: 9, cursor: 'pointer', fontFamily: C.font,
                                }}>编辑</button>
                                <button onClick={() => removeFixedChat(chat.id)} style={{
                                  padding: '2px 6px', borderRadius: 3, border: `1px solid ${C.border}`,
                                  background: C.card, color: C.red, fontSize: 9, cursor: 'pointer', fontFamily: C.font,
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

          {/* 工作流程 */}
          <div style={{
            padding: '10px', borderRadius: 8,
            background: 'linear-gradient(135deg, #F0F5FF 0%, #F7F8FA 100%)',
            border: `1px solid ${C.border}`,
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.text, marginBottom: 6 }}>🔗 搭话流程</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: C.textSec, flexWrap: 'wrap' }}>
              <span style={{ padding: '3px 6px', background: '#fff', borderRadius: 4, border: `1px solid ${C.border}` }}>🎤 主播说话</span>
              <span style={{ color: C.textTert }}>→</span>
              <span style={{ padding: '3px 6px', background: '#fff', borderRadius: 4, border: `1px solid ${C.border}` }}>🧠 AI 理解</span>
              <span style={{ color: C.textTert }}>→</span>
              <span style={{ padding: '3px 6px', background: '#E8F5E9', borderRadius: 4, border: `1px solid #A5D6A7`, color: C.green }}>🔊 TTS</span>
              {(fixedChats.some(c => c.outfitId) && fixedChatEnabled) && (
                <>
                  <span style={{ color: C.textTert }}>+</span>
                  <span style={{ padding: '3px 6px', background: '#FFF3E0', borderRadius: 4, border: `1px solid #FFCC80`, color: C.orange }}>👗 切造型</span>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ============ 声控切屏内容组件（适配 360px） ============
function VoiceSwitchContent() {
  const [enabled, setEnabled] = useState(true)
  const [popupFreq, setPopupFreq] = useState<'always' | 'interval' | 'cycle'>('always')
  const [intervalSec, setIntervalSec] = useState(13)
  const [cyclePop, setCyclePop] = useState(11)
  const [cycleGone, setCycleGone] = useState(15)
  const [popupCount, setPopupCount] = useState<'unlimited' | 'limited'>('unlimited')
  const [popupTimes, setPopupTimes] = useState(1)
  const [outfitSwitch, setOutfitSwitch] = useState(false)
  const [bindings, setBindings] = useState<Record<string, { outfitId: string | null; actionId: string | null }>>({
    p1: { outfitId: 'o1', actionId: 'a1' }, p2: { outfitId: null, actionId: null },
    p3: { outfitId: 'o2', actionId: null }, p4: { outfitId: null, actionId: null },
  })
  const [showKeywords, setShowKeywords] = useState(false)
  const triggerKeywords = ['一起看', '置顶', '弹', '切', '看下', '咱看下', '我们看下']

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>
      {/* 功能开关 */}
      <div style={{
        padding: '10px 12px', background: C.card, borderRadius: 8,
        border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 10,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 2 }}>🎙 声控互动</div>
          <div style={{ fontSize: 11, color: C.textSec, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>AI 识别主播话术，自动触发商品弹窗与伴播联动</div>
        </div>
        <Toggle checked={enabled} onChange={setEnabled} />
      </div>

      {enabled && (
        <>
          {/* 触发模式（上下堆叠，适配 360px） */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 6 }}>
              触发模式<span style={{ fontSize: 10, fontWeight: 400, color: C.textSec, marginLeft: 4 }}>（内置逻辑）</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{
                padding: '10px 12px', borderRadius: 8,
                border: `1.5px solid ${C.blue}`, background: C.blueLight,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 14 }}>🎯</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.blue }}>精准指令</span>
                  <span style={{ marginLeft: 'auto', fontSize: 9, padding: '2px 5px', borderRadius: 4, background: `${C.blue}15`, color: C.blue }}>始终开启</span>
                </div>
                <div style={{ fontSize: 10, color: C.textSec }}>主播说「切3号链接」「置顶5号」等指令词时触发</div>
              </div>
              <div style={{
                padding: '10px 12px', borderRadius: 8,
                border: `1.5px solid ${C.green}`, background: C.greenLight,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 14 }}>🧠</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.green }}>意图识别</span>
                  <span style={{ marginLeft: 'auto', fontSize: 9, padding: '2px 5px', borderRadius: 4, background: `${C.green}15`, color: C.green }}>始终开启</span>
                </div>
                <div style={{ fontSize: 10, color: C.textSec }}>AI 理解主播正在讲解某商品的意图，智能触发</div>
              </div>
            </div>

            {/* 关键词展示 */}
            <div onClick={() => setShowKeywords(!showKeywords)} style={{
              marginTop: 6, padding: '6px 10px', background: '#F7F8FA', borderRadius: 4,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <span style={{ fontSize: 10, color: C.textSec }}>{showKeywords ? '▼' : '▶'} 触发关键词</span>
              {!showKeywords && (
                <span style={{ fontSize: 10, color: C.textTert }}>
                  {triggerKeywords.slice(0, 3).join('、')}… 等 {triggerKeywords.length} 个
                </span>
              )}
            </div>
            {showKeywords && (
              <div style={{
                marginTop: 4, padding: '8px 10px', background: '#F7F8FA', borderRadius: 4,
                display: 'flex', flexWrap: 'wrap', gap: 4,
              }}>
                {triggerKeywords.map(kw => (
                  <span key={kw} style={{
                    padding: '2px 8px', borderRadius: 4,
                    background: '#E8F3FF', color: C.blue, fontSize: 11,
                  }}>{kw}</span>
                ))}
              </div>
            )}
          </div>

          {/* 商品↔造型/动作绑定 */}
          <div style={{ marginBottom: 10 }}>
            <div style={{
              padding: '10px 12px', background: C.card, borderRadius: 8,
              border: `1px solid ${C.border}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>👗 商品↔造型/动作绑定</div>
                  <div style={{ fontSize: 10, color: C.textSec, marginTop: 2 }}>主播讲解商品时，伴播自动切换造型和动作</div>
                </div>
                <Toggle checked={outfitSwitch} onChange={setOutfitSwitch} />
              </div>
              {outfitSwitch && (
                <div style={{ marginTop: 8 }}>
                  <div style={{
                    padding: '4px 8px', marginBottom: 8, borderRadius: 4,
                    background: '#F0F5FF', border: '1px solid #D4E0FF',
                    fontSize: 10, color: C.blue,
                  }}>
                    当前形象：{CURRENT_AVATAR}（{CURRENT_AVATAR_OUTFITS_VS.length} 个可用造型）
                  </div>

                  {/* 商品绑定表（紧凑） */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      padding: '2px 6px', fontSize: 9, color: C.textTert,
                      textTransform: 'uppercase', letterSpacing: 0.3,
                    }}>
                      <span style={{ flex: 1 }}>商品</span>
                      <span style={{ width: 80, textAlign: 'center' }}>造型</span>
                      <span style={{ width: 80, textAlign: 'center' }}>动作</span>
                    </div>

                    {LIVE_PRODUCTS.map(prod => {
                      const binding = bindings[prod.id] ?? { outfitId: null, actionId: null }
                      const boundOutfit = binding.outfitId
                      const boundAction = binding.actionId
                      const outfitActions = boundOutfit
                        ? (CURRENT_AVATAR_OUTFITS_VS.find(o => o.id === boundOutfit)?.actions || [])
                        : []
                      const hasBinding = boundOutfit || boundAction
                      return (
                        <div key={prod.id} style={{
                          display: 'flex', alignItems: 'center', gap: 4,
                          padding: '6px 8px', borderRadius: 6,
                          background: hasBinding ? '#FFFBF0' : '#FAFAFA',
                          border: hasBinding ? '1px solid #FFE58F' : `1px solid ${C.border}`,
                        }}>
                          {/* 商品信息 */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                              <span style={{
                                fontSize: 9, padding: '1px 4px', borderRadius: 2,
                                background: '#F0F0F0', color: C.textSec, flexShrink: 0,
                              }}>{prod.linkNum}号</span>
                              <span style={{
                                fontSize: 11, color: C.text,
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                              }}>{prod.name}</span>
                            </div>
                            <div style={{ fontSize: 9, color: C.textTert }}>{prod.price}</div>
                          </div>

                          {/* 造型选择器（紧凑） */}
                          <select
                            value={boundOutfit ?? ''}
                            onChange={e => {
                              const newOutfit = e.target.value || null
                              setBindings(prev => ({
                                ...prev,
                                [prod.id]: { outfitId: newOutfit, actionId: null },
                              }))
                            }}
                            style={{
                              width: 80, height: 24, borderRadius: 4,
                              border: boundOutfit ? `1px solid ${C.orange}` : `1px solid ${C.border}`,
                              background: boundOutfit ? 'rgba(255,125,0,0.08)' : C.card,
                              color: boundOutfit ? C.orange : C.textSec,
                              fontSize: 10, fontFamily: C.font,
                              padding: '0 4px', outline: 'none',
                              cursor: 'pointer', flexShrink: 0,
                            }}
                          >
                            <option value="">不切换</option>
                            {CURRENT_AVATAR_OUTFITS_VS.map(o => (
                              <option key={o.id} value={o.id}>{o.name}</option>
                            ))}
                          </select>

                          {/* 动作选择器（紧凑） */}
                          <select
                            value={boundAction ?? ''}
                            onChange={e => {
                              const newAction = e.target.value || null
                              setBindings(prev => ({
                                ...prev,
                                [prod.id]: { ...(prev[prod.id] || { outfitId: null, actionId: null }), actionId: newAction },
                              }))
                            }}
                            disabled={!boundOutfit}
                            style={{
                              width: 80, height: 24, borderRadius: 4,
                              border: boundAction ? `1px solid ${C.green}` : `1px solid ${C.border}`,
                              background: boundAction ? C.greenLight : C.card,
                              color: boundAction ? C.green : (boundOutfit ? C.textSec : C.textTert),
                              fontSize: 10, fontFamily: C.font,
                              padding: '0 4px', outline: 'none',
                              cursor: boundOutfit ? 'pointer' : 'not-allowed', flexShrink: 0,
                            }}
                          >
                            <option value="">默认</option>
                            {outfitActions.map(a => (
                              <option key={a.id} value={a.id}>{a.icon} {a.name}</option>
                            ))}
                          </select>
                        </div>
                      )
                    })}
                  </div>

                  <div style={{
                    marginTop: 6, padding: '4px 8px', borderRadius: 4,
                    background: '#FFF7E6', border: '1px solid #FFE58F',
                    fontSize: 9, color: '#B8860B', lineHeight: 1.5,
                  }}>
                    💡 选造型后可指定动作，不选则走默认姿态。绑定仅对当前「{CURRENT_AVATAR}」生效。
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 弹品模式（紧凑三选一） */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 6 }}>弹品模式</div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={() => setPopupFreq('always')} style={{
                flex: 1, padding: '8px 4px', borderRadius: 6,
                border: popupFreq === 'always' ? `1.5px solid ${C.blue}` : `1px solid ${C.border}`,
                background: popupFreq === 'always' ? C.blueLight : C.card,
                cursor: 'pointer', fontFamily: C.font, textAlign: 'center',
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: popupFreq === 'always' ? C.blue : C.text }}>一直弹</div>
                <div style={{ fontSize: 9, color: C.textSec }}>持续显示</div>
              </button>
              <div style={{
                flex: 1, padding: '8px 4px', borderRadius: 6,
                border: popupFreq === 'interval' ? `1.5px solid ${C.blue}` : `1px solid ${C.border}`,
                background: popupFreq === 'interval' ? C.blueLight : C.card,
                cursor: 'pointer', textAlign: 'center',
              }} onClick={() => setPopupFreq('interval')}>
                <div style={{ fontSize: 11, fontWeight: 600, color: popupFreq === 'interval' ? C.blue : C.text, marginBottom: 3 }}>间隔弹</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, fontSize: 10, color: C.textSec }}>
                  每
                  <input type="number" value={intervalSec} min={1} onClick={e => e.stopPropagation()}
                    onChange={e => setIntervalSec(Math.max(1, parseInt(e.target.value) || 1))}
                    style={{ width: 32, height: 20, padding: '0 2px', borderRadius: 3, border: `1px solid ${C.border}`,
                      fontSize: 10, textAlign: 'center', outline: 'none', fontFamily: C.font }} />
                  秒
                </div>
              </div>
              <div style={{
                flex: 1.3, padding: '8px 4px', borderRadius: 6,
                border: popupFreq === 'cycle' ? `1.5px solid ${C.blue}` : `1px solid ${C.border}`,
                background: popupFreq === 'cycle' ? C.blueLight : C.card,
                cursor: 'pointer', textAlign: 'center',
              }} onClick={() => setPopupFreq('cycle')}>
                <div style={{ fontSize: 11, fontWeight: 600, color: popupFreq === 'cycle' ? C.blue : C.text, marginBottom: 3 }}>循环弹</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, fontSize: 10, color: C.textSec, flexWrap: 'wrap' }}>
                  弹
                  <input type="number" value={cyclePop} min={1} onClick={e => e.stopPropagation()}
                    onChange={e => setCyclePop(Math.max(1, parseInt(e.target.value) || 1))}
                    style={{ width: 28, height: 20, padding: '0 2px', borderRadius: 3, border: `1px solid ${C.border}`,
                      fontSize: 10, textAlign: 'center', outline: 'none', fontFamily: C.font }} />
                  秒 消失
                  <input type="number" value={cycleGone} min={1} onClick={e => e.stopPropagation()}
                    onChange={e => setCycleGone(Math.max(1, parseInt(e.target.value) || 1))}
                    style={{ width: 28, height: 20, padding: '0 2px', borderRadius: 3, border: `1px solid ${C.border}`,
                      fontSize: 10, textAlign: 'center', outline: 'none', fontFamily: C.font }} />
                  秒
                </div>
              </div>
            </div>
          </div>

          {/* 弹出次数 */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 6 }}>弹出次数</div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={() => setPopupCount('unlimited')} style={{
                flex: 1, padding: '8px 10px', borderRadius: 6,
                border: popupCount === 'unlimited' ? `1.5px solid ${C.blue}` : `1px solid ${C.border}`,
                background: popupCount === 'unlimited' ? C.blueLight : C.card,
                cursor: 'pointer', fontFamily: C.font, textAlign: 'center',
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: popupCount === 'unlimited' ? C.blue : C.text }}>不限次数</div>
                <div style={{ fontSize: 9, color: C.textSec }}>按频率循环</div>
              </button>
              <div style={{
                flex: 1, padding: '8px 10px', borderRadius: 6,
                border: popupCount === 'limited' ? `1.5px solid ${C.blue}` : `1px solid ${C.border}`,
                background: popupCount === 'limited' ? C.blueLight : C.card,
                cursor: 'pointer', textAlign: 'center',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
              }} onClick={() => setPopupCount('limited')}>
                <div style={{ fontSize: 11, fontWeight: 600, color: popupCount === 'limited' ? C.blue : C.text, marginBottom: 3 }}>限定次数</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 10, color: C.textSec }}>
                  弹出
                  <input type="number" value={popupTimes} min={1} onClick={e => e.stopPropagation()}
                    onChange={e => setPopupTimes(Math.max(1, parseInt(e.target.value) || 1))}
                    style={{ width: 32, height: 20, padding: '0 2px', borderRadius: 3, border: `1px solid ${C.border}`,
                      fontSize: 10, textAlign: 'center', outline: 'none', fontFamily: C.font }} />
                  次
                </div>
              </div>
            </div>
          </div>

          {/* 工作流程 */}
          <div style={{
            padding: '10px', borderRadius: 8,
            background: 'linear-gradient(135deg, #F0F5FF 0%, #F7F8FA 100%)',
            border: `1px solid ${C.border}`,
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.text, marginBottom: 6 }}>🔗 工作流程</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: C.textSec, flexWrap: 'wrap' }}>
              <span style={{ padding: '3px 6px', background: '#fff', borderRadius: 4, border: `1px solid ${C.border}` }}>🎤 主播说话</span>
              <span style={{ color: C.textTert }}>→</span>
              <span style={{ padding: '3px 6px', background: '#fff', borderRadius: 4, border: `1px solid ${C.border}` }}>🧠 AI 识别</span>
              <span style={{ color: C.textTert }}>→</span>
              <span style={{ padding: '3px 6px', background: '#E8F3FF', borderRadius: 4, border: `1px solid #B8D4FF`, color: C.blue }}>📦 弹商品</span>
              {outfitSwitch && (
                <>
                  <span style={{ color: C.textTert }}>+</span>
                  <span style={{ padding: '3px 6px', background: '#E8F3FF', borderRadius: 4, border: `1px solid #B8D4FF`, color: C.blue }}>👗 切造型</span>
                  <span style={{ color: C.textTert }}>+</span>
                  <span style={{ padding: '3px 6px', background: '#E8F3FF', borderRadius: 4, border: `1px solid #B8D4FF`, color: C.blue }}>🎭 切动作</span>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ============ 主面板 ============
export default function CanvasPanel({ onClose }: Props) {
  const f = C.font
  const [activeMode, setActiveMode] = useState<Mode>('assist')
  const [assistTab, setAssistTab] = useState<AssistTab>('voiceProduct')
  // banbo mode
  const [banboEnabled, setBanboEnabled] = useState(false)
  const [products, setProducts] = useState(PRODUCTS)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [previewStateId, setPreviewStateId] = useState<string | null>(null)
  const [previewEventId, setPreviewEventId] = useState<string | null>(null)

  return (
    <>
    <style>{`@keyframes slideFromLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }`}</style>
    <div style={{
      position: 'absolute', top: 36, right: 0, bottom: 0, width: 710,
      zIndex: 102, overflow: 'hidden',
      fontFamily: f, display: 'flex', flexDirection: 'column',
      background: '#fff', borderRadius: '8px 0 0 0',
      boxShadow: '-2px 0 16px rgba(0,0,0,0.08)',
    }}>

      {/* ===== 顶部大 Tab 切换 ===== */}
      <div style={{
        display: 'flex', flexShrink: 0,
        borderBottom: `1px solid ${C.border}`,
      }}>
        {([
          { key: 'assist' as Mode, label: '🎤 助播' },
          { key: 'banbo' as Mode, label: '🐟 伴播' },
        ]).map(tab => (
          <button key={tab.key} onClick={() => setActiveMode(tab.key)} style={{
            flex: 1, padding: '12px 0',
            border: 'none', fontSize: 15, fontWeight: activeMode === tab.key ? 600 : 400,
            background: activeMode === tab.key ? '#fff' : C.bg,
            color: activeMode === tab.key ? C.blue : C.textSec,
            cursor: 'pointer', fontFamily: f,
            borderBottom: activeMode === tab.key ? `2px solid ${C.blue}` : '2px solid transparent',
            transition: 'all 0.15s',
          }}>{tab.label}</button>
        ))}
        <button onClick={onClose} style={{
          position: 'absolute', top: 10, right: 12,
          background: 'none', border: 'none',
          fontSize: 18, color: C.textSec, cursor: 'pointer', padding: 4, zIndex: 5,
        }}>×</button>
      </div>

      {/* ===== 助播模式 ===== */}
      {activeMode === 'assist' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
          {/* 8 子 Tab */}
          <div style={{
            padding: '0 4px', background: C.card,
            borderBottom: `1px solid ${C.border}`,
            display: 'flex', overflowX: 'auto', flexShrink: 0,
          }}>
            {ASSIST_TABS.map(tab => (
              <button key={tab.key} onClick={() => setAssistTab(tab.key)} style={{
                flex: '0 0 auto', padding: '11px 10px', border: 'none', fontSize: 13, whiteSpace: 'nowrap',
                fontWeight: assistTab === tab.key ? 600 : 400,
                background: 'transparent',
                color: assistTab === tab.key ? C.blue : C.textSec,
                cursor: 'pointer', fontFamily: f,
                borderBottom: assistTab === tab.key ? `2.5px solid ${C.blue}` : '2.5px solid transparent',
                transition: 'all 0.15s',
              }}>{tab.label}</button>
            ))}
          </div>

          {/* 内容区（占位） */}
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 32, background: C.bg,
          }}>
            <div style={{ textAlign: 'center', maxWidth: 320 }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>🔧</div>
              <div style={{ fontSize: 15, color: C.text, fontWeight: 600, marginBottom: 8 }}>
                {ASSIST_TABS.find(t => t.key === assistTab)?.label}
              </div>
              <div style={{ fontSize: 13, color: C.textSec, lineHeight: 1.7 }}>
                该区域功能配置跟原先的助播面板一致，当前为占位展示。
              </div>
            </div>
          </div>

          {/* 底部：开始直播按钮 */}
          <div style={{
            padding: '14px 16px', borderTop: `1px solid ${C.border}`,
            background: C.card, flexShrink: 0,
          }}>
            <button style={{
              width: '100%', padding: '13px',
              borderRadius: 8, border: 'none',
              background: 'linear-gradient(135deg, #34D399, #10B981)',
              color: '#fff', fontSize: 16, fontWeight: 700,
              cursor: 'pointer', fontFamily: f,
              boxShadow: '0 4px 12px rgba(16,185,129,0.4)',
            }}>
              启动助播虾
            </button>
          </div>
        </div>
      )}

      {/* ===== 伴播模式 ===== */}
      {activeMode === 'banbo' && (
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minWidth: 0, minHeight: 0 }}>
          {/* Timeline 左栏（固定 280px，永远可见） */}
          <TimelineLeftBar
            products={products}
            selectedProductId={selectedProductId}
            onSelectProduct={(id) => {
              setSelectedProductId(id)
              setPreviewStateId(null)
              setPreviewEventId(null)
            }}
            banboEnabled={banboEnabled}
            onToggleBanbo={() => setBanboEnabled(!banboEnabled)}
          />

          {/* 右侧：统一配置面板 */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, minHeight: 0, boxShadow: 'inset 8px 0 16px -8px rgba(0,0,0,0.06)' }}>
            {/* 内容 */}
            <div style={{ flex: 1, overflow: 'hidden', position: 'relative', minHeight: 0 }}>
              <UnifiedBanboPanel
                selectedProductId={selectedProductId}
                products={products}
                setProducts={setProducts}
                previewStateId={previewStateId}
                setPreviewStateId={setPreviewStateId}
                previewEventId={previewEventId}
                setPreviewEventId={setPreviewEventId}
              />
            </div>

            {/* 底部操作 */}
            <div style={{
              padding: '10px 12px', borderTop: `1px solid ${C.border}`,
              background: C.card, flexShrink: 0,
              display: 'flex', gap: 8, justifyContent: 'center',
            }}>
              <button style={{
                padding: '10px 24px',
                borderRadius: 8, border: `1px solid ${C.border}`,
                background: '#fff', color: C.textSec,
                fontSize: 13, cursor: 'pointer', fontFamily: f,
              }}>重置</button>
              <button style={{
                padding: '10px 32px',
                borderRadius: 8, border: 'none',
                background: 'linear-gradient(135deg, #60A5FA, #3B82F6)', color: '#fff',
                fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: f,
                boxShadow: '0 2px 8px rgba(59,130,246,0.3)',
              }}>💾 保存配置</button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  )
}
