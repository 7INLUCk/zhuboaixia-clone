import React, { useState, useRef, useEffect, useCallback } from 'react'
import { C, Toggle } from './shared'

type Props = { onClose: () => void }
type Mode = 'assist' | 'banbo'
type BanboTab = 'avatar' | 'voice' | 'autoChat' | 'voiceSwitch'
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

const BANBO_TABS: { key: BanboTab; label: string }[] = [
  { key: 'avatar', label: '🎭 形象库' },
  { key: 'voice', label: '🔊 音色' },
  { key: 'autoChat', label: '💬 智能对话' },
  { key: 'voiceSwitch', label: '🎙 声控切屏' },
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
  const [banboTab, setBanboTab] = useState<BanboTab>('avatar')
  const [banboEnabled, setBanboEnabled] = useState(false)

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
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
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
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* 左侧：9:16 预览画布 */}
          <div style={{
            width: 280, flexShrink: 0,
            background: '#1a1a2e',
            position: 'relative', overflow: 'hidden',
          }}>
            <img src="/bg_studio.jpg" alt="直播间背景"
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                objectFit: 'cover',
              }}
            />
            {/* 形象占位 */}
            <div style={{
              position: 'absolute',
              top: '12%', left: '12%', right: '22%', bottom: '32%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px dashed rgba(255,255,255,0.3)',
              borderRadius: 8,
            }}>
              <div style={{
                color: 'rgba(255,255,255,0.6)',
                fontSize: 12, textAlign: 'center',
              }}>
                上传伴播形象
                <div style={{ fontSize: 10, marginTop: 3, color: 'rgba(255,255,255,0.4)' }}>支持视频/图片</div>
              </div>
            </div>

            {/* 右侧 4 按钮 */}
            <div style={{
              position: 'absolute',
              right: 8, top: '12%',
              display: 'flex', flexDirection: 'column', gap: 8,
              zIndex: 10,
            }}>
              {SIDEBAR_BUTTONS.map(btn => {
                const isBanbo = btn.key === 'banbo'
                return (
                  <div key={btn.key} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                  }}>
                    <button
                      onClick={() => { if (isBanbo) setBanboEnabled(!banboEnabled) }}
                      style={{
                        width: 36, height: 36, borderRadius: '50%',
                        border: 'none',
                        background: isBanbo && banboEnabled ? C.blue : 'rgba(0,0,0,0.5)',
                        color: '#fff', fontSize: 16,
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backdropFilter: 'blur(8px)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                      }}
                    >{btn.icon}</button>
                    <span style={{
                      fontSize: 9, color: 'rgba(255,255,255,0.85)',
                      textShadow: '0 1px 3px rgba(0,0,0,0.8)', fontWeight: 500,
                    }}>{btn.label}</span>
                  </div>
                )
              })}
            </div>

            {/* 底部：开启伴播 + 说明 */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              padding: '14px 12px 12px',
              background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
              display: 'flex', flexDirection: 'column', gap: 8,
              zIndex: 10,
            }}>
              <button onClick={() => setBanboEnabled(!banboEnabled)} style={{
                width: '100%', padding: '10px',
                borderRadius: 8, border: 'none',
                background: banboEnabled
                  ? 'linear-gradient(135deg, #34D399, #10B981)'
                  : 'linear-gradient(135deg, #60A5FA, #3B82F6)',
                color: '#fff', fontSize: 14, fontWeight: 700,
                cursor: 'pointer', fontFamily: f,
              }}>
                {banboEnabled ? '✅ 伴播已开启' : '开启伴播'}
              </button>
              <div style={{
                fontSize: 10, color: 'rgba(255,255,255,0.65)',
                lineHeight: 1.6, textAlign: 'center', padding: '0 4px',
              }}>
                输出 Alpha 通道透明底视频，可导入抖音直播伴侣作为「媒体源」图层使用。
                实际场景效果请在直播伴侣中预览。
              </div>
            </div>
          </div>

          {/* 右侧：4 Tab 配置区 */}
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            borderLeft: `1px solid ${C.border}`,
          }}>
            {/* 4 Tab Bar */}
            <div style={{
              padding: '6px 6px', background: C.card,
              borderBottom: `1px solid ${C.border}`,
              display: 'flex', gap: 2, flexShrink: 0,
            }}>
              {BANBO_TABS.map(tab => (
                <button key={tab.key} onClick={() => setBanboTab(tab.key)} style={{
                  flex: 1, padding: '8px 0', borderRadius: 0, border: 'none',
                  fontSize: 12, whiteSpace: 'nowrap', textAlign: 'center',
                  fontWeight: banboTab === tab.key ? 600 : 400,
                  background: 'transparent',
                  color: banboTab === tab.key ? C.blue : C.textSec,
                  cursor: 'pointer', fontFamily: f,
                  borderBottom: banboTab === tab.key ? `2.5px solid ${C.blue}` : '2.5px solid transparent',
                }}>{tab.label}</button>
              ))}
            </div>

            {/* Tab 内容（渲染对应子组件） */}
            <div style={{
              flex: 1, overflow: 'hidden',
              position: 'relative',
            }}>
              {banboTab === 'avatar' && <AvatarContent />}
              {banboTab === 'voice' && <VoiceContent />}
              {banboTab === 'autoChat' && <AutoChatContent />}
              {banboTab === 'voiceSwitch' && <VoiceSwitchContent />}
            </div>

            {/* 底部操作 */}
            <div style={{
              padding: '10px 12px', borderTop: `1px solid ${C.border}`,
              background: C.card, flexShrink: 0,
              display: 'flex', gap: 8,
            }}>
              <button style={{
                flex: 1, padding: '10px',
                borderRadius: 8, border: `1px solid ${C.border}`,
                background: '#fff', color: C.textSec,
                fontSize: 14, cursor: 'pointer', fontFamily: f,
              }}>取消</button>
              <button style={{
                flex: 1, padding: '10px',
                borderRadius: 8, border: 'none',
                background: C.blue, color: '#fff',
                fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: f,
              }}>确认配置</button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  )
}