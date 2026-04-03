import React, { useState, useRef, useEffect, useCallback } from 'react'
import { C, Toggle } from './shared'

type Props = { onClose: () => void; onContinueConfig?: () => void }
type ViewState = 'empty' | 'configured' | 'live'
type BanboTab = 'avatar' | 'voice' | 'autoChat' | 'voiceSwitch'

// ============ 4 Tab 定义 ============
const BANBO_TABS: { key: BanboTab; label: string }[] = [
  { key: 'avatar', label: '🎭 形象库' },
  { key: 'voice', label: '🔊 音色' },
  { key: 'autoChat', label: '💬 智能对话' },
  { key: 'voiceSwitch', label: '🎙 声控切屏' },
]

// ============ Chroma Key 抠绿组件（从 AvatarLibraryPanel 复用） ============
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

  return <canvas ref={canvasRef} style={{ ...style, imageRendering: 'auto' }} draggable={draggable} />
}

// ============ 形象数据（从 AvatarLibraryPanel 复用） ============
type ActionItem = { id: string; name: string; icon: string; duration: string }
type OutfitItem = {
  id: string; name: string; preview?: string;
  defaultStates: { id: string; label: string; selected: boolean }[];
  actions: ActionItem[]
}
type AvatarItem = {
  id: string; name: string; category: 'public' | 'custom'; type: string;
  preview: string; outfits: OutfitItem[];
  selectedOutfit: string; selectedDefault: string; bgColor?: string
}

const AVATARS: AvatarItem[] = [
  {
    id: 'a1', name: '小小', category: 'public', type: '3D 卡通',
    preview: '/avatars/xiaoxiao-dress.jpg', bgColor: '#f0e6d6',
    outfits: [
      { id: 'o1', name: '春日裙装', preview: '/avatars/xiaoxiao-dress.jpg',
        defaultStates: [{ id: 'd1', label: '微晃眨眼', selected: true }, { id: 'd2', label: '微笑摆手', selected: false }],
        actions: [{ id: 'act1', name: '跳舞', icon: '💃', duration: '8s' }, { id: 'act2', name: '作揖', icon: '🙇', duration: '3s' }, { id: 'act3', name: '欢迎', icon: '👋', duration: '4s' }]
      },
      { id: 'o2', name: '休闲衬衫', preview: '/avatars/xiaoxiao-shirt.jpg',
        defaultStates: [{ id: 'd3', label: '站立思考', selected: true }],
        actions: [{ id: 'act4', name: '转身', icon: '🔄', duration: '3s' }, { id: 'act5', name: '鼓掌', icon: '👏', duration: '5s' }]
      },
    ],
    selectedOutfit: 'o1', selectedDefault: 'd1',
  },
  {
    id: 'a2', name: '榴莲宝贝', category: 'public', type: '3D 卡通',
    preview: '/avatars/durian-3d.jpg', bgColor: '#fdf6e3',
    outfits: [
      { id: 'o3', name: '经典造型', preview: '/avatars/durian-3d.jpg',
        defaultStates: [{ id: 'd4', label: '可爱站立', selected: true }, { id: 'd5', label: '轻轻摇晃', selected: false }],
        actions: [{ id: 'act6', name: '转圈', icon: '🌀', duration: '4s' }, { id: 'act7', name: 'wink', icon: '😉', duration: '2s' }]
      },
    ],
    selectedOutfit: 'o3', selectedDefault: 'd4',
  },
  {
    id: 'a3', name: '篮球小子', category: 'public', type: '3D 卡通',
    preview: '/avatars/basketball-boy.jpg', bgColor: '#e8f0fe',
    outfits: [
      { id: 'o4', name: '球衣', preview: '/avatars/basketball-boy.jpg',
        defaultStates: [{ id: 'd6', label: '运球站立', selected: true }],
        actions: [{ id: 'act8', name: '投篮', icon: '⛹️', duration: '5s' }, { id: 'act9', name: '庆祝', icon: '🎉', duration: '4s' }]
      },
    ],
    selectedOutfit: 'o4', selectedDefault: 'd6',
  },
]

// ============ 音色数据（从 VoiceLibraryPanel 复用） ============
type VoiceItem = {
  id: string; name: string; gender: 'male' | 'female'; age: 'child' | 'adult';
  style: string; tags: string[]; color: string
}

const VOICES: VoiceItem[] = [
  { id: 'v1', name: '甜心小姐姐', gender: 'female', age: 'adult', style: '甜美亲切', tags: ['甜美', '亲切'], color: '#FF6B9D' },
  { id: 'v2', name: '知性女主播', gender: 'female', age: 'adult', style: '专业沉稳', tags: ['商务', '专业'], color: '#C084FC' },
  { id: 'v3', name: '元气小女孩', gender: 'female', age: 'child', style: '活泼可爱', tags: ['活泼', '可爱'], color: '#F472B6' },
  { id: 'v4', name: '阳光大男孩', gender: 'male', age: 'adult', style: '热情爽朗', tags: ['阳光', '爽朗'], color: '#60A5FA' },
  { id: 'v5', name: '磁性男声', gender: 'male', age: 'adult', style: '低沉有魅力', tags: ['磁性', '成熟'], color: '#818CF8' },
  { id: 'v6', name: '活力小男孩', gender: 'male', age: 'child', style: '调皮有趣', tags: ['活力', '有趣'], color: '#34D399' },
]
const LOCKED_VOICE_ID = 'v1'

// ============ 播放按钮 ============
function PlayButton({ playing, onClick, color, size }: { playing: boolean; onClick: () => void; color: string; size?: number }) {
  const s = size || 36
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

// ============ 商品数据（从 VoiceSwitchPanel 复用） ============
const LIVE_PRODUCTS = [
  { id: 'p1', name: '助播虾落地手机直播支架', price: '¥999', linkNum: 1 },
  { id: 'p2', name: '助播虾磁吸直播挂脖支架', price: '¥999', linkNum: 2 },
  { id: 'p3', name: '补光灯套装', price: '¥299', linkNum: 3 },
  { id: 'p4', name: '声卡直播设备', price: '¥1599', linkNum: 4 },
]

const AVATAR_OUTFITS = [
  { id: 'o1', name: '春日裙装', actions: [{ id: 'a1', name: '跳舞', icon: '💃' }, { id: 'a2', name: '作揖', icon: '🙇' }, { id: 'a3', name: '欢迎', icon: '👋' }] },
  { id: 'o2', name: '休闲衬衫', actions: [{ id: 'a4', name: '转身', icon: '🔄' }, { id: 'a5', name: '鼓掌', icon: '👏' }] },
]

// ============ 固定搭话类型 ============
type FixedChat = { id: string; trigger: string; response: string; outfitId: string | null; actionId: string | null }

export default function BuyinControlPanel({ onClose, onContinueConfig }: Props) {
  const [viewState, setViewState] = useState<ViewState>('empty')
  const [elapsed, setElapsed] = useState(0)
  const [liveTimer, setLiveTimer] = useState<any>(null)

  // 伴播开关 + Tab 状态
  const [banboEnabled, setBanboEnabled] = useState(false)
  const [activeTab, setActiveTab] = useState<BanboTab>('avatar')

  // 形象库状态
  const [avatars] = useState(AVATARS)
  const [selectedAvatarId, setSelectedAvatarId] = useState('a1')
  const [avatarFilter, setAvatarFilter] = useState<'all' | 'public' | 'custom'>('all')
  const [outfitMap, setOutfitMap] = useState<Record<string, string>>(() => {
    const m: Record<string, string> = {}
    avatars.forEach(a => { m[a.id] = a.selectedOutfit })
    return m
  })

  // 音色状态
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null)
  const [voiceFilter, setVoiceFilter] = useState<'all' | 'female' | 'male'>('all')
  const voiceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 智能搭话状态
  const [autoChatEnabled, setAutoChatEnabled] = useState(true)
  const [specialNote, setSpecialNote] = useState('')
  const [chatFrequency, setChatFrequency] = useState<'high' | 'mid' | 'low'>('high')
  const [fixedChatEnabled, setFixedChatEnabled] = useState(false)
  const [fixedChats, setFixedChats] = useState<FixedChat[]>([
    { id: 'f1', trigger: '库存没有了', response: '没有了哦', outfitId: null, actionId: null },
    { id: 'f2', trigger: '全场保价，退换货，倒数54321', response: '主播身上这件黑色羽绒服，白鹅绒填充！', outfitId: 'o1', actionId: 'a3' },
  ])
  const [editingChatId, setEditingChatId] = useState<string | null>(null)

  // 声控切屏状态
  const [voiceSwitchEnabled, setVoiceSwitchEnabled] = useState(true)
  const [popupFreq, setPopupFreq] = useState<'always' | 'interval' | 'cycle'>('always')
  const [intervalSec, setIntervalSec] = useState(13)
  const [cyclePop, setCyclePop] = useState(11)
  const [cycleGone, setCycleGone] = useState(15)
  const [popupCount, setPopupCount] = useState<'unlimited' | 'limited'>('unlimited')
  const [popupTimes, setPopupTimes] = useState(1)
  const [outfitSwitch, setOutfitSwitch] = useState(false)
  const [productBindings, setProductBindings] = useState<Record<string, { outfitId: string | null; actionId: string | null }>>({
    p1: { outfitId: 'o1', actionId: 'a1' }, p2: { outfitId: null, actionId: null },
    p3: { outfitId: 'o2', actionId: null }, p4: { outfitId: null, actionId: null },
  })
  const [showKeywords, setShowKeywords] = useState(false)
  const triggerKeywords = ['一起看', '置顶', '弹', '切', '看下', '咱看下', '我们看下']

  // 直播计时
  const startLive = () => {
    setViewState('live')
    const t = setInterval(() => setElapsed(prev => prev + 1), 1000)
    setLiveTimer(t)
  }
  const stopLive = () => {
    setViewState('configured')
    setElapsed(0)
    if (liveTimer) clearInterval(liveTimer)
  }
  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600).toString().padStart(2, '0')
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0')
    const sec = (s % 60).toString().padStart(2, '0')
    return `${h}:${m}:${sec}`
  }

  // 音色试听
  const handleVoicePlay = (id: string) => {
    if (playingVoiceId === id) {
      setPlayingVoiceId(null)
      if (voiceTimerRef.current) clearTimeout(voiceTimerRef.current)
      return
    }
    setPlayingVoiceId(id)
    if (voiceTimerRef.current) clearTimeout(voiceTimerRef.current)
    voiceTimerRef.current = setTimeout(() => setPlayingVoiceId(null), 3000)
  }

  useEffect(() => {
    return () => { if (voiceTimerRef.current) clearTimeout(voiceTimerRef.current) }
  }, [])

  // 当前选中形象
  const selectedAvatar = avatars.find(a => a.id === selectedAvatarId) || avatars[0]
  const currentOutfitId = outfitMap[selectedAvatar.id] || selectedAvatar.selectedOutfit
  const currentOutfit = selectedAvatar.outfits.find(o => o.id === currentOutfitId) || selectedAvatar.outfits[0]
  const currentAvatarPreview = currentOutfit.preview || selectedAvatar.preview

  // 筛选
  const filteredAvatars = avatars.filter(a => avatarFilter === 'all' || a.category === avatarFilter)
  const filteredVoices = VOICES.filter(v => voiceFilter === 'all' || v.gender === voiceFilter)
  const lockedVoice = VOICES.find(v => v.id === LOCKED_VOICE_ID) || VOICES[0]

  // 固定搭话操作
  const addFixedChat = () => {
    const newId = `f${Date.now()}`
    setFixedChats(prev => [...prev, { id: newId, trigger: '', response: '', outfitId: null, actionId: null }])
    setEditingChatId(newId)
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
  const canSaveChat = (chat: FixedChat) => chat.trigger.trim() !== '' && chat.response.trim() !== ''
  const getOutfitActions = (outfitId: string | null) => outfitId ? AVATAR_OUTFITS.find(o => o.id === outfitId)?.actions || [] : []
  const getOutfitName = (id: string | null) => id ? AVATAR_OUTFITS.find(o => o.id === id)?.name || '' : ''
  const getActionInfo = (outfitId: string | null, actionId: string | null) => {
    if (!outfitId || !actionId) return null
    return getOutfitActions(outfitId).find(a => a.id === actionId)
  }

  const f = C.font

  // ====== Tab 内容渲染 ======
  const renderTabContent = () => {
    switch (activeTab) {
      case 'avatar':
        return (
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* 左侧：形象网格 */}
            <div style={{ width: 180, borderRight: `1px solid ${C.border}`, overflowY: 'auto', padding: '10px', flexShrink: 0 }}>
              {filteredAvatars.map(avatar => (
                <div key={avatar.id} onClick={() => setSelectedAvatarId(avatar.id)} style={{
                  padding: '10px', borderRadius: 8, marginBottom: 6, cursor: 'pointer',
                  background: selectedAvatarId === avatar.id ? C.blueLight : 'transparent',
                  border: selectedAvatarId === avatar.id ? `1.5px solid ${C.blue}` : '1.5px solid transparent',
                  transition: 'all 0.15s', position: 'relative',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', background: '#FFFFFF', flexShrink: 0 }}>
                      <ChromaKeyImage src={avatar.preview} alt={avatar.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable={false} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{avatar.name}</div>
                      <div style={{ fontSize: 11, color: C.textSec }}>{avatar.type}</div>
                    </div>
                  </div>
                  {selectedAvatarId === avatar.id && (
                    <div style={{ position: 'absolute', top: 6, right: 6, width: 16, height: 16, borderRadius: '50%', background: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 700 }}>✓</div>
                  )}
                </div>
              ))}
              <div style={{ padding: '12px 10px', borderRadius: 8, border: `1.5px dashed ${C.border}`, textAlign: 'center', cursor: 'pointer', marginTop: 4 }}>
                <span style={{ fontSize: 18, color: C.textTert }}>+</span>
                <div style={{ fontSize: 11, color: C.textTert, marginTop: 2 }}>添加定制形象</div>
              </div>
            </div>
            {/* 右侧：详情 */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>
              <div style={{ width: '100%', aspectRatio: '9/16', maxHeight: 200, background: '#FFFFFF', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, position: 'relative', overflow: 'hidden', border: `1px solid ${C.border}` }}>
                <ChromaKeyImage src={currentAvatarPreview} alt={selectedAvatar.name} style={{ maxHeight: '92%', maxWidth: '92%', objectFit: 'contain' }} draggable={false} />
                <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.6)', borderRadius: 4, padding: '3px 8px', fontSize: 10, color: 'rgba(255,255,255,0.8)' }}>🔁 {currentOutfit.name}</div>
                <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.6)', borderRadius: 4, padding: '3px 8px', fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>{selectedAvatar.name}</div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8 }}>造型</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {selectedAvatar.outfits.map(outfit => (
                    <button key={outfit.id} onClick={() => setOutfitMap(prev => ({ ...prev, [selectedAvatar.id]: outfit.id }))} style={{
                      padding: '6px 14px', borderRadius: 6,
                      border: outfit.id === currentOutfitId ? `1.5px solid ${C.blue}` : `1px solid ${C.border}`,
                      background: outfit.id === currentOutfitId ? C.blueLight : C.card,
                      color: outfit.id === currentOutfitId ? C.blue : C.text, fontSize: 12,
                      fontWeight: outfit.id === currentOutfitId ? 500 : 400, cursor: 'pointer', fontFamily: f,
                    }}>{outfit.name}</button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8 }}>默认状态<span style={{ fontSize: 11, fontWeight: 400, color: C.textSec, marginLeft: 6 }}>（10-15秒循环素材）</span></div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {currentOutfit.defaultStates.map(state => (
                    <button key={state.id} style={{
                      padding: '5px 12px', borderRadius: 6,
                      border: state.selected ? `1.5px solid ${C.green}` : `1px solid ${C.border}`,
                      background: state.selected ? C.greenLight : C.card,
                      color: state.selected ? C.green : C.text, fontSize: 12, cursor: 'pointer', fontFamily: f,
                    }}>{state.selected && '🟢 '}{state.label}</button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8 }}>动作分支<span style={{ fontSize: 11, fontWeight: 400, color: C.textSec, marginLeft: 6 }}>（触发后短暂播放）</span></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {currentOutfit.actions.map(action => (
                    <div key={action.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: C.card, border: `1px solid ${C.border}`, borderRadius: 8 }}>
                      <span style={{ fontSize: 20 }}>{action.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{action.name}</div>
                        <div style={{ fontSize: 11, color: C.textSec }}>时长 {action.duration}</div>
                      </div>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.green, boxShadow: '0 0 6px rgba(0,180,42,0.4)' }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 'voice':
        return (
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>
            {/* 当前锁定音色 */}
            <div style={{ padding: '14px', background: `linear-gradient(135deg, ${lockedVoice.color}10 0%, ${lockedVoice.color}04 100%)`, borderRadius: 12, border: `1.5px solid ${lockedVoice.color}30`, marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 52, height: 52, borderRadius: 12, background: `${lockedVoice.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0, position: 'relative' }}>
                  🎤
                  <div style={{ position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: '50%', background: C.orange, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>🔒</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{lockedVoice.name}</span>
                    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: C.orangeLight, color: C.orange, fontWeight: 600 }}>已锁定</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                    {lockedVoice.tags.map(tag => <span key={tag} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: `${lockedVoice.color}12`, color: lockedVoice.color }}>{tag}</span>)}
                  </div>
                  <div style={{ fontSize: 11, color: C.textSec }}>当前动作素材使用「甜心小姐姐」录制，音色已锁定</div>
                </div>
                <PlayButton playing={playingVoiceId === lockedVoice.id} onClick={() => handleVoicePlay(lockedVoice.id)} color={lockedVoice.color} size={40} />
              </div>
            </div>
            {/* 筛选 */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
              {[{ key: 'all', label: '全部', count: VOICES.length }, { key: 'female', label: '女声', count: VOICES.filter(v => v.gender === 'female').length }, { key: 'male', label: '男声', count: VOICES.filter(v => v.gender === 'male').length }].map(tab => (
                <button key={tab.key} onClick={() => setVoiceFilter(tab.key as typeof voiceFilter)} style={{
                  padding: '4px 12px', borderRadius: 14, border: 'none', fontSize: 12,
                  fontWeight: voiceFilter === tab.key ? 500 : 400,
                  background: voiceFilter === tab.key ? C.blueLight : 'transparent',
                  color: voiceFilter === tab.key ? C.blue : C.textSec, cursor: 'pointer', fontFamily: f,
                }}>{tab.label} ({tab.count})</button>
              ))}
            </div>
            {/* 音色列表 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {filteredVoices.map(voice => {
                const isLocked = voice.id === LOCKED_VOICE_ID
                return (
                  <div key={voice.id} style={{ padding: '10px 12px', borderRadius: 10, background: isLocked ? `${voice.color}06` : C.card, border: isLocked ? `1px solid ${voice.color}25` : `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 10, opacity: isLocked ? 1 : 0.5, cursor: 'default' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: `${voice.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{voice.gender === 'female' ? '🎤' : '🎙'}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{voice.name}</span>
                        {isLocked && <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 3, background: C.orangeLight, color: C.orange, fontWeight: 600 }}>当前使用</span>}
                      </div>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {voice.tags.map(tag => <span key={tag} style={{ fontSize: 10, padding: '1px 6px', borderRadius: 3, background: `${voice.color}10`, color: isLocked ? voice.color : C.textTert }}>{tag}</span>)}
                      </div>
                    </div>
                    <PlayButton playing={playingVoiceId === voice.id} onClick={() => handleVoicePlay(voice.id)} color={isLocked ? voice.color : C.textTert} size={32} />
                    {!isLocked && <span style={{ fontSize: 14, color: C.textTert, flexShrink: 0 }}>🔒</span>}
                  </div>
                )
              })}
            </div>
          </div>
        )

      case 'autoChat':
        return (
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>
            {/* 功能开关 */}
            <div style={{ padding: '12px 14px', background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 2 }}>💬 智能搭话</div>
                <div style={{ fontSize: 12, color: C.textSec }}>AI 自动识别主播话术，实时搭话互动</div>
              </div>
              <Toggle checked={autoChatEnabled} onChange={setAutoChatEnabled} />
            </div>
            {autoChatEnabled && (
              <>
                {/* 覆盖场景 */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8 }}>覆盖场景<span style={{ fontSize: 11, fontWeight: 400, color: C.textSec, marginLeft: 6 }}>（自动生效）</span></div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: `1.5px solid ${C.blue}`, background: C.blueLight }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: 14 }}>🛍</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: C.blue }}>带货场景</span>
                        <span style={{ marginLeft: 'auto', fontSize: 10, padding: '2px 6px', borderRadius: 4, background: `${C.blue}15`, color: C.blue }}>始终开启</span>
                      </div>
                      <div style={{ fontSize: 11, color: C.textSec }}>主播说「版型显瘦」→ 伴播「对的！」</div>
                    </div>
                    <div style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: `1.5px solid ${C.green}`, background: C.greenLight }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: 14 }}>🎮</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: C.green }}>互动场景</span>
                        <span style={{ marginLeft: 'auto', fontSize: 10, padding: '2px 6px', borderRadius: 4, background: `${C.green}15`, color: C.green }}>始终开启</span>
                      </div>
                      <div style={{ fontSize: 11, color: C.textSec }}>主播问「好不好看？」→ 伴播「好看！」</div>
                    </div>
                  </div>
                </div>
                {/* 搭话频率 */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8 }}>搭话频率</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[{ key: 'high', label: '高频', desc: '节奏快' }, { key: 'mid', label: '中频', desc: '适中' }, { key: 'low', label: '低频', desc: '节奏慢' }].map(item => (
                      <button key={item.key} onClick={() => setChatFrequency(item.key as typeof chatFrequency)} style={{
                        flex: 1, padding: '10px 8px', borderRadius: 8,
                        border: chatFrequency === item.key ? `1.5px solid ${C.blue}` : `1px solid ${C.border}`,
                        background: chatFrequency === item.key ? C.blueLight : C.card, cursor: 'pointer', fontFamily: f, textAlign: 'center',
                      }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: chatFrequency === item.key ? C.blue : C.text, marginBottom: 2 }}>{item.label}</div>
                        <div style={{ fontSize: 10, color: C.textSec }}>{item.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
                {/* 固定搭话 */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ padding: '12px 14px', background: C.card, borderRadius: 10, border: `1px solid ${C.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: fixedChatEnabled ? 10 : 0 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>🎯 固定搭话<span style={{ fontSize: 10, fontWeight: 400, color: C.textTert, marginLeft: 4 }}>可选</span></div>
                        <div style={{ fontSize: 11, color: C.textSec, marginTop: 2 }}>关键词 → 回复话术 + 造型切换</div>
                      </div>
                      <Toggle checked={fixedChatEnabled} onChange={setFixedChatEnabled} />
                    </div>
                    {fixedChatEnabled && (
                      <>
                        <button onClick={addFixedChat} style={{ width: '100%', padding: '8px', borderRadius: 8, border: `1.5px dashed ${C.border}`, background: 'transparent', color: C.blue, fontSize: 12, cursor: 'pointer', fontFamily: f, marginBottom: 8 }}>+ 新增固定搭话</button>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {fixedChats.map(chat => {
                            const actions = getOutfitActions(chat.outfitId)
                            return (
                              <div key={chat.id} style={{ padding: '10px 12px', borderRadius: 8, border: `1px solid ${C.border}`, background: '#FAFAFA' }}>
                                {editingChatId === chat.id ? (
                                  <>
                                    <div style={{ fontSize: 10, color: C.textTert, marginBottom: 4 }}>触发词</div>
                                    <input value={chat.trigger} onChange={e => updateFixedChat(chat.id, 'trigger', e.target.value)} placeholder="例：库存没有了" style={{ width: '100%', height: 28, padding: '0 8px', borderRadius: 6, border: `1px solid ${chat.trigger.trim() ? C.border : C.red}`, fontSize: 12, fontFamily: f, outline: 'none', boxSizing: 'border-box', marginBottom: 6 }} />
                                    <div style={{ fontSize: 10, color: C.textTert, marginBottom: 4 }}>回复内容</div>
                                    <input value={chat.response} onChange={e => updateFixedChat(chat.id, 'response', e.target.value)} placeholder="例：没有了哦" style={{ width: '100%', height: 28, padding: '0 8px', borderRadius: 6, border: `1px solid ${chat.response.trim() ? C.border : C.red}`, fontSize: 12, fontFamily: f, outline: 'none', boxSizing: 'border-box', marginBottom: 6 }} />
                                    <div style={{ fontSize: 10, color: C.textTert, marginBottom: 4 }}>切换造型</div>
                                    <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                                      <button onClick={() => updateFixedChat(chat.id, 'outfitId', null)} style={{ padding: '4px 10px', borderRadius: 6, border: chat.outfitId === null ? `1px solid ${C.blue}` : `1px solid ${C.border}`, background: chat.outfitId === null ? C.blueLight : C.card, color: chat.outfitId === null ? C.blue : C.textSec, fontSize: 11, cursor: 'pointer', fontFamily: f }}>不切换</button>
                                      {AVATAR_OUTFITS.map(o => (
                                        <button key={o.id} onClick={() => updateFixedChat(chat.id, 'outfitId', o.id)} style={{ padding: '4px 10px', borderRadius: 6, border: chat.outfitId === o.id ? `1px solid ${C.orange}` : `1px solid ${C.border}`, background: chat.outfitId === o.id ? C.orangeLight : C.card, color: chat.outfitId === o.id ? C.orange : C.textSec, fontSize: 11, cursor: 'pointer', fontFamily: f }}>{o.name}</button>
                                      ))}
                                    </div>
                                    {chat.outfitId && (
                                      <>
                                        <div style={{ fontSize: 10, color: C.textTert, marginBottom: 4 }}>配合动作</div>
                                        <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                                          <button onClick={() => updateFixedChat(chat.id, 'actionId', null)} style={{ padding: '4px 10px', borderRadius: 6, border: chat.actionId === null ? `1px solid ${C.blue}` : `1px solid ${C.border}`, background: chat.actionId === null ? C.blueLight : C.card, color: chat.actionId === null ? C.blue : C.textSec, fontSize: 11, cursor: 'pointer', fontFamily: f }}>默认姿态</button>
                                          {actions.map(a => (
                                            <button key={a.id} onClick={() => updateFixedChat(chat.id, 'actionId', a.id)} style={{ padding: '4px 10px', borderRadius: 6, border: chat.actionId === a.id ? `1px solid ${C.green}` : `1px solid ${C.border}`, background: chat.actionId === a.id ? C.greenLight : C.card, color: chat.actionId === a.id ? C.green : C.textSec, fontSize: 11, cursor: 'pointer', fontFamily: f }}>{a.icon} {a.name}</button>
                                          ))}
                                        </div>
                                      </>
                                    )}
                                    {!canSaveChat(chat) && <div style={{ fontSize: 10, color: C.red, marginBottom: 4 }}>⚠️ 触发词和回复内容不能为空</div>}
                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                      <button onClick={() => { if (canSaveChat(chat)) setEditingChatId(null) }} style={{ padding: '3px 12px', borderRadius: 4, border: 'none', background: canSaveChat(chat) ? C.blue : '#E5E6EB', color: canSaveChat(chat) ? '#fff' : C.textTert, fontSize: 11, cursor: canSaveChat(chat) ? 'pointer' : 'not-allowed', fontFamily: f }}>完成</button>
                                    </div>
                                  </>
                                ) : (
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
                                          <span style={{ fontSize: 11, color: C.textSec }}>{getOutfitName(chat.outfitId)}{chat.actionId && (() => { const act = getActionInfo(chat.outfitId, chat.actionId); return act ? <span> · {act.icon} {act.name}</span> : null })()}{!chat.actionId && <span style={{ color: C.textTert }}> · 默认姿态</span>}</span>
                                        </div>
                                      )}
                                    </div>
                                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                                      <button onClick={() => setEditingChatId(chat.id)} style={{ padding: '2px 8px', borderRadius: 4, border: `1px solid ${C.border}`, background: C.card, color: C.blue, fontSize: 10, cursor: 'pointer', fontFamily: f }}>编辑</button>
                                      <button onClick={() => removeFixedChat(chat.id)} style={{ padding: '2px 8px', borderRadius: 4, border: `1px solid ${C.border}`, background: C.card, color: C.red, fontSize: 10, cursor: 'pointer', fontFamily: f }}>删除</button>
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
              </>
            )}
          </div>
        )

      case 'voiceSwitch':
        return (
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>
            {/* 功能开关 */}
            <div style={{ padding: '12px 14px', background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 2 }}>🎙 声控互动</div>
                <div style={{ fontSize: 12, color: C.textSec }}>AI 识别主播话术，自动触发商品弹窗</div>
              </div>
              <Toggle checked={voiceSwitchEnabled} onChange={setVoiceSwitchEnabled} />
            </div>
            {voiceSwitchEnabled && (
              <>
                {/* 触发模式 */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8 }}>触发模式<span style={{ fontSize: 11, fontWeight: 400, color: C.textSec, marginLeft: 6 }}>（内置逻辑）</span></div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ flex: 1, padding: '12px 14px', borderRadius: 10, border: `1.5px solid ${C.blue}`, background: C.blueLight }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <span style={{ fontSize: 16 }}>🎯</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: C.blue }}>精准指令</span>
                        <span style={{ marginLeft: 'auto', fontSize: 10, padding: '2px 6px', borderRadius: 4, background: `${C.blue}15`, color: C.blue }}>始终开启</span>
                      </div>
                      <div style={{ fontSize: 11, color: C.textSec, lineHeight: 1.5 }}>主播说「切3号链接」「置顶5号」时触发</div>
                    </div>
                    <div style={{ flex: 1, padding: '12px 14px', borderRadius: 10, border: `1.5px solid ${C.green}`, background: C.greenLight }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <span style={{ fontSize: 16 }}>🧠</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: C.green }}>意图识别</span>
                        <span style={{ marginLeft: 'auto', fontSize: 10, padding: '2px 6px', borderRadius: 4, background: `${C.green}15`, color: C.green }}>始终开启</span>
                      </div>
                      <div style={{ fontSize: 11, color: C.textSec, lineHeight: 1.5 }}>AI 理解主播正在讲解某商品的意图</div>
                    </div>
                  </div>
                </div>
                {/* 商品-造型绑定 */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ padding: '12px 14px', background: C.card, borderRadius: 10, border: `1px solid ${C.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>👗 商品↔造型绑定</div>
                        <div style={{ fontSize: 11, color: C.textSec, marginTop: 2 }}>主播讲解某商品时，伴播自动切换造型</div>
                      </div>
                      <Toggle checked={outfitSwitch} onChange={setOutfitSwitch} />
                    </div>
                    {outfitSwitch && (
                      <div style={{ marginTop: 10 }}>
                        <div style={{ padding: '6px 10px', marginBottom: 10, borderRadius: 6, background: '#F0F5FF', border: '1px solid #D4E0FF', fontSize: 11, color: C.blue }}>当前形象：小小（2 个可用造型）</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px', fontSize: 10, color: C.textTert }}>
                            <span style={{ flex: 1 }}>直播商品</span>
                            <span style={{ width: 90, textAlign: 'center' }}>切换造型</span>
                            <span style={{ width: 90, textAlign: 'center' }}>配合动作</span>
                          </div>
                          {LIVE_PRODUCTS.map(prod => {
                            const binding = productBindings[prod.id] ?? { outfitId: null, actionId: null }
                            const boundOutfit = binding.outfitId
                            const boundAction = binding.actionId
                            const outfitActions = boundOutfit ? (AVATAR_OUTFITS.find(o => o.id === boundOutfit)?.actions || []) : []
                            const hasBinding = boundOutfit || boundAction
                            return (
                              <div key={prod.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, background: hasBinding ? '#FFFBF0' : '#FAFAFA', border: hasBinding ? '1px solid #FFE58F' : `1px solid ${C.border}` }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 3, background: '#F0F0F0', color: C.textSec, flexShrink: 0 }}>{prod.linkNum}号</span>
                                    <span style={{ fontSize: 12, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prod.name}</span>
                                  </div>
                                  <div style={{ fontSize: 10, color: C.textTert, marginTop: 1 }}>{prod.price}</div>
                                </div>
                                <select value={boundOutfit ?? ''} onChange={e => setProductBindings(prev => ({ ...prev, [prod.id]: { outfitId: e.target.value || null, actionId: null } }))} onClick={e => e.stopPropagation()} style={{ width: 90, height: 28, borderRadius: 6, border: boundOutfit ? `1px solid ${C.orange}` : `1px solid ${C.border}`, background: boundOutfit ? C.orangeLight : C.card, color: boundOutfit ? C.orange : C.textSec, fontSize: 11, fontFamily: f, padding: '0 6px', outline: 'none', cursor: 'pointer', flexShrink: 0 }}>
                                  <option value="">不切换</option>
                                  {AVATAR_OUTFITS.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                                </select>
                                <select value={boundAction ?? ''} onChange={e => setProductBindings(prev => ({ ...prev, [prod.id]: { ...(prev[prod.id] || { outfitId: null, actionId: null }), actionId: e.target.value || null } }))} onClick={e => e.stopPropagation()} disabled={!boundOutfit} style={{ width: 90, height: 28, borderRadius: 6, border: boundAction ? `1px solid ${C.green}` : `1px solid ${C.border}`, background: boundAction ? C.greenLight : C.card, color: boundAction ? C.green : (boundOutfit ? C.textSec : C.textTert), fontSize: 11, fontFamily: f, padding: '0 6px', outline: 'none', cursor: boundOutfit ? 'pointer' : 'not-allowed', flexShrink: 0 }}>
                                  <option value="">默认姿态</option>
                                  {outfitActions.map(a => <option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
                                </select>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {/* 弹品模式 */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8 }}>弹品模式</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => setPopupFreq('always')} style={{ flex: 1, padding: '10px 8px', borderRadius: 8, border: popupFreq === 'always' ? `1.5px solid ${C.blue}` : `1px solid ${C.border}`, background: popupFreq === 'always' ? C.blueLight : C.card, cursor: 'pointer', fontFamily: f, textAlign: 'center' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: popupFreq === 'always' ? C.blue : C.text }}>一直弹</div>
                      <div style={{ fontSize: 10, color: C.textSec, marginTop: 2 }}>持续显示</div>
                    </button>
                    <div style={{ flex: 1, padding: '10px 8px', borderRadius: 8, border: popupFreq === 'interval' ? `1.5px solid ${C.blue}` : `1px solid ${C.border}`, background: popupFreq === 'interval' ? C.blueLight : C.card, cursor: 'pointer', textAlign: 'center' }} onClick={() => setPopupFreq('interval')}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: popupFreq === 'interval' ? C.blue : C.text, marginBottom: 4 }}>间隔弹</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, fontSize: 11, color: C.textSec }}>
                        每隔<input type="number" value={intervalSec} min={1} onClick={e => e.stopPropagation()} onChange={e => setIntervalSec(Math.max(1, parseInt(e.target.value) || 1))} style={{ width: 40, height: 24, padding: '0 2px', borderRadius: 4, border: `1px solid ${C.border}`, fontSize: 12, textAlign: 'center', outline: 'none', fontFamily: f }} />秒
                      </div>
                    </div>
                    <div style={{ flex: 1.2, padding: '10px 8px', borderRadius: 8, border: popupFreq === 'cycle' ? `1.5px solid ${C.blue}` : `1px solid ${C.border}`, background: popupFreq === 'cycle' ? C.blueLight : C.card, cursor: 'pointer', textAlign: 'center' }} onClick={() => setPopupFreq('cycle')}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: popupFreq === 'cycle' ? C.blue : C.text, marginBottom: 4 }}>循环弹</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, fontSize: 11, color: C.textSec, flexWrap: 'wrap' }}>
                        弹<input type="number" value={cyclePop} min={1} onClick={e => e.stopPropagation()} onChange={e => setCyclePop(Math.max(1, parseInt(e.target.value) || 1))} style={{ width: 36, height: 24, padding: '0 2px', borderRadius: 4, border: `1px solid ${C.border}`, fontSize: 12, textAlign: 'center', outline: 'none', fontFamily: f }} />秒 消失<input type="number" value={cycleGone} min={1} onClick={e => e.stopPropagation()} onChange={e => setCycleGone(Math.max(1, parseInt(e.target.value) || 1))} style={{ width: 36, height: 24, padding: '0 2px', borderRadius: 4, border: `1px solid ${C.border}`, fontSize: 12, textAlign: 'center', outline: 'none', fontFamily: f }} />秒
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )
    }
  }

  return (
    <div style={{
      position: 'absolute', top: 36, right: 0, bottom: 0, width: 520,
      zIndex: 102, overflow: 'hidden', borderRadius: '8px 0 0 0',
      boxShadow: '-2px 0 16px rgba(0,0,0,0.08)', fontFamily: f,
      display: 'flex', flexDirection: 'column',
      background: '#fff',
    }}>
      {/* ===== 顶部标题栏 ===== */}
      <div style={{
        padding: '10px 16px', background: C.card, display: 'flex',
        alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
        borderBottom: `1px solid ${C.border}`,
      }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: C.text }}>
          {banboEnabled ? 'AI伴播配置' : '助播虾配置面板'}
        </span>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', fontSize: 18, color: C.textSec,
          cursor: 'pointer', padding: 4,
        }}>×</button>
      </div>

      {/* ===== 伴播开关 + TabBar ===== */}
      {viewState === 'empty' && (
        <>
          {/* 伴播总开关 */}
          <div style={{
            padding: '14px 16px', background: C.card, borderBottom: `1px solid ${C.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>🐟</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>启用AI伴播</div>
                <div style={{ fontSize: 12, color: C.textSec }}>开启后可配置形象、音色、智能对话、声控切屏</div>
              </div>
            </div>
            <Toggle checked={banboEnabled} onChange={setBanboEnabled} />
          </div>

          {/* 4 Tab Bar */}
          {banboEnabled && (
            <div style={{
              padding: '8px 16px', background: C.card, borderBottom: `1px solid ${C.border}`,
              display: 'flex', gap: 4, overflowX: 'auto', flexShrink: 0,
            }}>
              {BANBO_TABS.map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                  padding: '6px 12px', borderRadius: 6, border: 'none', fontSize: 13, whiteSpace: 'nowrap',
                  fontWeight: activeTab === tab.key ? 600 : 400,
                  background: activeTab === tab.key ? C.blueLight : 'transparent',
                  color: activeTab === tab.key ? C.blue : C.textSec,
                  cursor: 'pointer', fontFamily: f, transition: 'all 0.15s',
                }}>{tab.label}</button>
              ))}
            </div>
          )}
        </>
      )}

      {/* ===== 内容区 ===== */}
      {viewState === 'empty' && !banboEnabled && (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', padding: '20px',
          background: C.bg,
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🐟</div>
          <div style={{ fontSize: 14, color: C.textSec, textAlign: 'center', maxWidth: 280 }}>
            开启 AI 伴播后，可配置形象库、音色、智能对话、声控切屏等功能
          </div>
        </div>
      )}

      {viewState === 'empty' && banboEnabled && (
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: C.bg }}>
          {renderTabContent()}
        </div>
      )}

      {viewState === 'configured' && (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 14,
          background: C.bg,
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, #E8ECFF, #D4DEFF)',
            border: '2px solid #BEDAFF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 30,
          }}>🐟</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>场景已就绪</div>
          <div style={{ fontSize: 12, color: C.textSec }}>伴播形象已配置完成</div>
          <button onClick={onContinueConfig} style={{
            padding: '6px 16px', borderRadius: 6,
            border: '1px solid #E5E6EB', background: '#fff',
            color: '#3370FF', fontSize: 12, cursor: 'pointer', fontFamily: f,
          }}>编辑场景</button>
        </div>
      )}

      {viewState === 'live' && (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 12,
          background: 'linear-gradient(170deg, #FFF8F0 0%, #FFECD2 50%, #FCE4EC 100%)',
        }}>
          <div style={{
            position: 'absolute', top: 14, left: 14,
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '4px 12px', borderRadius: 14,
            background: 'rgba(255,77,79,0.1)', border: '1px solid rgba(255,77,79,0.2)',
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%', background: '#FF4D4F',
              boxShadow: '0 0 6px rgba(255,77,79,0.5)',
              animation: 'blink 1.5s ease-in-out infinite',
            }} />
            <span style={{ fontSize: 12, color: '#F53F3F', fontWeight: 600 }}>直播中</span>
          </div>
          <div style={{
            position: 'absolute', top: 14, right: 14,
            fontSize: 13, color: '#1D2129', fontWeight: 600,
            fontVariantNumeric: 'tabular-nums', fontFamily: 'monospace',
          }}>{formatTime(elapsed)}</div>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, #E8ECFF, #D4DEFF)',
            border: '2px solid #BEDAFF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 30,
          }}>🐟</div>
        </div>
      )}

      {/* ===== 底部控制 ===== */}
      <div style={{ padding: '14px 16px 18px', flexShrink: 0, borderTop: `1px solid ${C.border}`, background: C.card }}>
        {viewState === 'empty' && !banboEnabled && (
          <button disabled style={{
            width: '100%', height: 46, borderRadius: 12,
            border: '1px solid #E5E6EB', background: '#F7F8FA',
            color: '#C9CDD4', fontSize: 14, fontWeight: 600,
            cursor: 'not-allowed', fontFamily: f,
          }}>启动伴播</button>
        )}
        {viewState === 'empty' && banboEnabled && (
          <button onClick={() => setViewState('configured')} style={{
            width: '100%', height: 46, borderRadius: 12,
            border: 'none', background: 'linear-gradient(135deg, #3370FF 0%, #5B8DEF 100%)',
            color: '#fff', fontSize: 14, fontWeight: 600,
            cursor: 'pointer', fontFamily: f,
            boxShadow: '0 4px 16px rgba(51,112,255,0.3)',
          }}>确认配置</button>
        )}
        {viewState === 'configured' && (
          <button onClick={startLive} style={{
            width: '100%', height: 46, borderRadius: 12,
            border: 'none', background: 'linear-gradient(135deg, #00B42A, #2FC25B)',
            color: '#fff', fontSize: 14, fontWeight: 600,
            cursor: 'pointer', fontFamily: f,
            boxShadow: '0 4px 12px rgba(0,180,42,0.2)',
          }}>启动伴播</button>
        )}
        {viewState === 'live' && (
          <button onClick={stopLive} style={{
            width: '100%', height: 46, borderRadius: 12,
            border: 'none', background: 'linear-gradient(135deg, #F53F3F, #FF7875)',
            color: '#fff', fontSize: 14, fontWeight: 600,
            cursor: 'pointer', fontFamily: f,
            boxShadow: '0 4px 12px rgba(245,63,63,0.2)',
          }}>停止伴播</button>
        )}
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}