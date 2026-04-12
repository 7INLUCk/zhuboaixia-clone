import React, { useState, useRef, useEffect, useCallback } from 'react'
import { C, Toggle } from './shared'

type Props = { onClose: () => void }

// ============ 数据类型 ============
type NormalState = { id: string; label: string; icon: string; duration: number; videoUrl?: string }
type EventAction = { id: string; label: string; command: string; duration: number; videoUrl?: string; isTransition?: boolean; enabled?: boolean }
type AvatarLibItem = { id: string; name: string; preview: string; category: 'public' | 'custom'; voiceTier: 'standard' | 'premium' }
type ChatRule = { id: string; trigger: string; response: string }
type ProductItem = {
  id: string; linkNum: number; name: string; price: string;
  boundAvatarId: string | null
  chatRules: ChatRule[]
  chatEnabled: boolean
}

// 全局口令配置
type GlobalCommands = {
  entrance: string
  exit: string
  switch: string
}

// 技能点类型（按 Figma 设计稿）
type SkillPoint = {
  id: string
  name: string
  triggerType: 'command' | 'auto'
  description: string
  placeholder?: string
  defaultValue?: string
  hasPreview?: boolean
}

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
      if ((g > 80 && g > r * 1.1 && g > b * 1.1) ||
          (g > 100 && g > r + 15 && g > b + 15) ||
          (g > 60 && r < 120 && b < 120 && g > r * 1.3)) {
        const greenness = Math.min(1, (g - Math.max(r, b)) / (g + 1))
        d[i + 3] = greenness > 0.5 ? 0 : Math.round((1 - greenness * 1.5) * 255)
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

function ChromaKeyVideo({ src, style, autoPlay, loop, muted, playsInline, onEnded }: {
  src: string; style?: React.CSSProperties; autoPlay?: boolean; loop?: boolean; muted?: boolean; playsInline?: boolean; onEnded?: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const rafRef = useRef<number>(0)
  const processFrame = useCallback(() => {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video || video.paused || video.ended || !video.videoWidth) {
      rafRef.current = requestAnimationFrame(processFrame)
      return
    }
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const d = imageData.data
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], g = d[i + 1], b = d[i + 2]
      if ((g > 80 && g > r * 1.1 && g > b * 1.1) ||
          (g > 100 && g > r + 15 && g > b + 15) ||
          (g > 60 && r < 120 && b < 120 && g > r * 1.3)) {
        const greenness = Math.min(1, (g - Math.max(r, b)) / (g + 1))
        d[i + 3] = greenness > 0.5 ? 0 : Math.round((1 - greenness * 1.5) * 255)
      }
    }
    ctx.putImageData(imageData, 0, 0)
    rafRef.current = requestAnimationFrame(processFrame)
  }, [])
  useEffect(() => {
    rafRef.current = requestAnimationFrame(processFrame)
    return () => cancelAnimationFrame(rafRef.current)
  }, [processFrame])
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', ...style }}>
      <video ref={videoRef} src={src} autoPlay={autoPlay} loop={loop} muted={muted ?? true}
        playsInline={playsInline} onEnded={onEnded}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: style?.objectFit || 'contain', opacity: 0 }} />
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', objectFit: style?.objectFit || 'contain' }} />
    </div>
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
const AVATAR_LIBRARY: AvatarLibItem[] = [
  { id: 'av1', name: '篮球小子-蓝', preview: '/avatars/chroma-keyed/av1.png', category: 'public', voiceTier: 'standard' },
  { id: 'av2', name: '篮球小子-红', preview: '/avatars/chroma-keyed/av2.png', category: 'public', voiceTier: 'standard' },
  { id: 'av3', name: '篮球小子-黑', preview: '/avatars/generated/av3.jpg', category: 'public', voiceTier: 'premium' },
  { id: 'av4', name: '篮球小子-白', preview: '/avatars/generated/av4.jpg', category: 'public', voiceTier: 'standard' },
  { id: 'av5', name: '小小碎花裙', preview: '/avatars/generated/av5.jpg', category: 'public', voiceTier: 'premium' },
  { id: 'av6', name: '榴莲宝贝3D', preview: '/avatars/chroma-keyed/av6.png', category: 'custom', voiceTier: 'premium' },
  { id: 'av7', name: '卡通小猫', preview: '/avatars/generated/av7.jpg', category: 'public', voiceTier: 'standard' },
]

const NORMAL_STATES: Record<string, NormalState[]> = {
  av1: [
    { id: 'ns1', label: '挠挠头', icon: '🤕', duration: 6 },
    { id: 'ns2', label: '摇摇身子', icon: '💃', duration: 8, videoUrl: '/avatars/generated/av1_idle.mp4' },
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
    { id: 'ns1', label: '转圈圈', icon: '🌀', duration: 8, videoUrl: '/avatars/generated/av5_idle.mp4' },
    { id: 'ns2', label: '摆裙摆', icon: '👗', duration: 7, videoUrl: '/avatars/generated/av5_ns2.mp4' },
    { id: 'ns3', label: '挥挥手', icon: '👋', duration: 6, videoUrl: '/avatars/generated/av5_ns3.mp4' },
    { id: 'ns4', label: '蹦蹦跳', icon: '🐰', duration: 5, videoUrl: '/avatars/generated/av5_ns4.mp4' },
    { id: 'ns5', label: '比心', icon: '💕', duration: 6, videoUrl: '/avatars/generated/av5_ns5.mp4' },
    { id: 'ns6', label: '歪头', icon: '🤔', duration: 5, videoUrl: '/avatars/generated/av5_ns6.mp4' },
  ],
  av6: [
    { id: 'ns1', label: '摇晃身体', icon: '💃', duration: 6, videoUrl: '/avatars/generated/av6_idle.mp4' },
    { id: 'ns2', label: '眨眨眼', icon: '😉', duration: 5 },
    { id: 'ns3', label: '拍拍手', icon: '👏', duration: 7 },
    { id: 'ns4', label: '转转头', icon: '🔄', duration: 5 },
    { id: 'ns5', label: '伸伸腰', icon: '🙆', duration: 6 },
    { id: 'ns6', label: '蹦蹦跳', icon: '🐰', duration: 5 },
  ],
}
const DEFAULT_STATES: NormalState[] = [
  { id: 'ns1', label: '挠挠头', icon: '🤕', duration: 6 },
  { id: 'ns2', label: '摇摇身子', icon: '💃', duration: 8 },
  { id: 'ns3', label: '拍拍手', icon: '👏', duration: 7 },
  { id: 'ns4', label: '擦擦汗', icon: '😅', duration: 5 },
  { id: 'ns5', label: '伸伸腰', icon: '🙆', duration: 6 },
  { id: 'ns6', label: '转转头', icon: '🔄', duration: 5 },
]

const EVENT_ACTIONS: Record<string, EventAction[]> = {
  av1: [
    { id: 'ea1', label: '灌篮表演', command: '', duration: 12 },
    { id: 'ea2', label: '运球秀', command: '', duration: 10 },
  ],
  av2: [
    { id: 'ea1', label: '三分投篮', command: '', duration: 12 },
    { id: 'ea2', label: '胯下运球', command: '', duration: 10 },
  ],
  av5: [
    { id: 'ea_entrance', label: '入场', command: '', duration: 5, videoUrl: '/avatars/generated/av5_entrance.mp4', isTransition: true },
    { id: 'ea_exit', label: '退场', command: '', duration: 5, videoUrl: '/avatars/generated/av5_exit.mp4', isTransition: true },
    { id: 'ea1', label: 'T台走秀', command: '', duration: 15, videoUrl: '/avatars/generated/av5_event.mp4' },
    { id: 'ea2', label: '旋转展示', command: '', duration: 10, videoUrl: '/avatars/generated/av5_ea2.mp4' },
    { id: 'ea3', label: '欢呼跳跃', command: '', duration: 10, videoUrl: '/avatars/generated/av5_ea3.mp4' },
  ],
  av6: [
    { id: 'ea1', label: '旋转展示', command: '', duration: 20, videoUrl: '/avatars/generated/av6_event.mp4' },
    { id: 'ea2', label: '跳跃', command: '', duration: 10 },
  ],
}
const DEFAULT_EVENT_ACTIONS: EventAction[] = [
  { id: 'ea1', label: '打招呼', command: '', duration: 8 },
  { id: 'ea2', label: '展示', command: '', duration: 10 },
]

const PRODUCTS_INIT: ProductItem[] = [
  { id: 'p1', linkNum: 1, name: '女童春款碎花连衣裙', price: '¥129', boundAvatarId: null, chatRules: [], chatEnabled: false },
  { id: 'p2', linkNum: 2, name: '男童纯棉印花T恤', price: '¥89', boundAvatarId: 'av1', chatRules: [], chatEnabled: false },
  { id: 'p3', linkNum: 3, name: '儿童防晒衣外套', price: '¥159', boundAvatarId: null, chatRules: [], chatEnabled: false },
  { id: 'p4', linkNum: 4, name: '女童百褶半身裙', price: '¥99', boundAvatarId: 'av6', chatRules: [{ id: 'cr2', trigger: '有优惠吗', response: '现在下单立减20元！' }, { id: 'cr3', trigger: '质量怎么样', response: '纯棉面料，亲肤透气，宝宝穿很舒服~' }], chatEnabled: true },
  { id: 'p5', linkNum: 5, name: '男童运动裤', price: '¥79', boundAvatarId: null, chatRules: [], chatEnabled: false },
  { id: 'p6', linkNum: 6, name: '女童蕾丝上衣', price: '¥109', boundAvatarId: null, chatRules: [], chatEnabled: false },
]

// ============ 技能点数据（9 个，按 Figma 设计稿） ============
const SKILL_POINTS: SkillPoint[] = [
  { id: 'sp1', name: '伴播进入直播间', triggerType: 'command', description: '主播说出以下口令时即可触发，支持模糊匹配', defaultValue: '有请模特入场', hasPreview: true },
  { id: 'sp2', name: '伴播退出直播间', triggerType: 'command', description: '主播说出以下口令时即可触发，支持模糊匹配', defaultValue: '请模特先下场', hasPreview: true },
  { id: 'sp3', name: '伴播换装', triggerType: 'command', description: '主播说出以下口令时即可触发，支持模糊匹配', defaultValue: '看看 [N] 号链接的模特上身效果', hasPreview: false },
  { id: 'sp4', name: '伴播展示穿版效果', triggerType: 'auto', description: '智能触发，根据讲解商品自动切换伴播形象', hasPreview: false },
  { id: 'sp5', name: '效果肯定', triggerType: 'auto', description: '智能触发，主播塑品时，AI 自动识别对应话术并触发伴播动作', placeholder: '多条话术可用逗号分隔，如：效果很好，质量不错，值得买', hasPreview: true },
  { id: 'sp6', name: '逼单助攻', triggerType: 'auto', description: '智能触发，主播逼单时，AI 自动识别对应话术并触发伴播动作', placeholder: '多条话术可用逗号分隔，如：现在下单，优惠有限，抓紧抢', hasPreview: true },
  { id: 'sp7', name: '产品演示', triggerType: 'auto', description: '智能触发，主播演示产品时，AI 自动识别对应话术并触发伴播动作', placeholder: '多条话术可用逗号分隔，如：看看这个，展示一下，细节在这', hasPreview: true },
  { id: 'sp8', name: '感谢下单', triggerType: 'auto', description: '智能触发，主播感谢用户下单时，AI 自动识别对应话术并触发伴播动作', placeholder: '多条话术可用逗号分隔，如：感谢支持，谢谢宝宝，下单了', hasPreview: true },
  { id: 'sp9', name: '整活表演', triggerType: 'command', description: '主播说出以下口令时即可触发，支持模糊匹配', defaultValue: '给大家表演一下才艺', hasPreview: true },
]

// 形象 × 技能组 动作映射（演示用：部分形象部分技能组无动作）
const AVATAR_SKILL_ACTIONS: Record<string, Record<string, any[]>> = {
  av1: { // 篮球小子-蓝（标准）：无整活表演
    sk1: [{ id: 'ska1', label: '点头认可', duration: 5 }, { id: 'ska2', label: '指向脸部', duration: 5 }],
    sk2: [{ id: 'ska1', label: '指向小黄车', duration: 10 }, { id: 'ska2', label: '操作手机下单', duration: 14 }, { id: 'ska3', label: '倒数321', duration: 6 }],
    sk3: [{ id: 'ska1', label: '轻拍脸颊', duration: 10 }, { id: 'ska2', label: 'OK手势', duration: 8 }],
    sk4: [{ id: 'ska1', label: '鞠躬', duration: 5 }, { id: 'ska2', label: '双手合十感谢', duration: 6 }],
    // sk5 无动作
  },
  av2: { // 篮球小子-红（标准）：无使用演示、无整活表演
    sk1: [{ id: 'ska1', label: '点头认可', duration: 5 }],
    sk2: [{ id: 'ska1', label: '指向小黄车', duration: 10 }, { id: 'ska2', label: '倒数321', duration: 6 }],
    sk4: [{ id: 'ska1', label: '鞠躬', duration: 5 }],
  },
  av3: { // 篮球小子-黑（高级）：全技能
    sk1: [{ id: 'ska1', label: '点头认可', duration: 5 }, { id: 'ska2', label: '指向脸部', duration: 5 }],
    sk2: [{ id: 'ska1', label: '指向小黄车', duration: 10 }, { id: 'ska2', label: '操作手机下单', duration: 14 }, { id: 'ska3', label: '倒数321', duration: 6 }],
    sk3: [{ id: 'ska1', label: '轻拍脸颊', duration: 10 }],
    sk4: [{ id: 'ska1', label: '鞠躬', duration: 5 }, { id: 'ska2', label: '双手合十感谢', duration: 6 }],
    sk5: [{ id: 'ska1', label: '鲨鱼摇', duration: 22 }, { id: 'ska2', label: '刀马刀马', duration: 17 }],
  },
  av4: { // 篮球小子-白（标准）：无整活表演
    sk1: [{ id: 'ska1', label: '点头认可', duration: 5 }],
    sk2: [{ id: 'ska1', label: '指向小黄车', duration: 10 }],
    sk3: [{ id: 'ska1', label: '轻拍脸颊', duration: 10 }, { id: 'ska2', label: 'OK手势', duration: 8 }],
    sk4: [{ id: 'ska1', label: '双手合十感谢', duration: 6 }],
  },
  av5: { // 小小碎花裙（高级）：全技能
    sk1: [{ id: 'ska1', label: '点头认可', duration: 5 }, { id: 'ska2', label: '指向脸部', duration: 5 }],
    sk2: [{ id: 'ska1', label: '指向小黄车', duration: 10 }, { id: 'ska2', label: '操作手机下单', duration: 14 }],
    sk3: [{ id: 'ska1', label: '轻拍脸颊', duration: 10 }],
    sk4: [{ id: 'ska1', label: '鞠躬', duration: 5 }],
    sk5: [{ id: 'ska1', label: '鲨鱼摇', duration: 22 }, { id: 'ska2', label: '大舌头', duration: 12 }],
  },
  av6: { // 榴莲宝贝3D（高级）：全技能
    sk1: [{ id: 'ska1', label: '点头认可', duration: 5 }],
    sk2: [{ id: 'ska1', label: '倒数321', duration: 6 }],
    sk3: [{ id: 'ska1', label: 'OK手势', duration: 8 }],
    sk4: [{ id: 'ska1', label: '双手合十感谢', duration: 6 }],
    sk5: [{ id: 'ska1', label: '刀马刀马', duration: 17 }],
  },
  av7: { // 卡通小猫（标准）：最少
    sk1: [{ id: 'ska1', label: '点头认可', duration: 5 }],
    sk4: [{ id: 'ska1', label: '鞠躬', duration: 5 }],
  },
}

// ============ 视频片段预览弹窗（单视频版，带音量控制） ============
function VideoPreviewPopup({ videoUrl, title, avatarName, onClose }: {
  videoUrl: string; title: string; avatarName: string; onClose: () => void
}) {
  const [outputting, setOutputting] = useState(false)
  const [playing, setPlaying] = useState(true)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const videoRef = useRef<HTMLVideoElement>(null)
  
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume
      videoRef.current.muted = muted
    }
  }, [volume, muted])
  
  const togglePlay = () => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setPlaying(!playing)
    }
  }
  
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
      <div style={{ position: 'relative', zIndex: 1, width: 400, maxHeight: '90vh', background: '#fff', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
        onClick={e => e.stopPropagation()}>
        {/* 标题栏 */}
        <div style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F0F0F0' }}>
          <div>
            <div style={{ color: '#1D2129', fontWeight: 600, fontSize: 15 }}>{title}</div>
            {avatarName && <div style={{ color: '#86909C', fontSize: 12, marginTop: 2 }}>形象：{avatarName}</div>}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#999', fontSize: 18, cursor: 'pointer' }}>✕</button>
        </div>
        {/* 视频播放区 */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, minHeight: 300, background: '#F7F8FA' }}>
          {videoUrl ? (
            <video ref={videoRef} src={videoUrl} autoPlay loop
              style={{ maxHeight: 420, borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} />
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.3 }}>🎬</div>
              <div style={{ color: '#86909C', fontSize: 14 }}>暂无视频素材</div>
            </div>
          )}
        </div>
        {/* 底部控制栏 */}
        <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12, borderTop: '1px solid #F0F0F0' }}>
          {/* 播放/暂停 */}
          <button onClick={togglePlay} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>
            {playing ? '⏸' : '▶️'}
          </button>
          {/* 音量 */}
          <button onClick={() => setMuted(!muted)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>
            {muted ? '🔇' : '🔊'}
          </button>
          <input type="range" min="0" max="1" step="0.1" value={volume}
            onChange={e => setVolume(parseFloat(e.target.value))}
            style={{ width: 80, cursor: 'pointer' }} />
          {/* 占位 */}
          <div style={{ flex: 1 }} />
          {/* 关闭按钮 */}
          <button onClick={onClose} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid #E5E6EB', background: '#fff', color: '#86909C', fontSize: 13, cursor: 'pointer' }}>关闭</button>
          <button onClick={() => setOutputting(!outputting)} style={{
            padding: '8px 20px', borderRadius: 8, border: 'none',
            background: outputting ? '#F53F3F' : '#3370FF',
            color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            transition: 'all 0.2s',
          }}>
            {outputting ? '⏹ 停止' : '🚀 输出'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ============ 形象选择弹窗 ============
function AvatarSwitchPopup({ currentAvatarId, onSelect, onClose, mode }: {
  currentAvatarId: string | null; onSelect: (id: string) => void; onClose: () => void; mode?: 'single' | 'all'
}) {
  const [selected, setSelected] = useState(currentAvatarId || '')
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
      <div style={{ position: 'relative', zIndex: 1, width: 480, background: '#fff', borderRadius: 12, overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}>
        {/* 标题栏 */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: '#1D2129', fontWeight: 600, fontSize: 15 }}>{mode === 'all' ? '全部商品绑定形象' : '选择伴播形象'}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 18, color: '#86909C', cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>
        {/* 形象网格 — 4列 */}
        <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, maxHeight: 400, overflowY: 'auto' }}>
          {AVATAR_LIBRARY.map(av => {
            const isSelected = selected === av.id
            return (
              <div key={av.id} onClick={() => setSelected(av.id)} style={{
                borderRadius: 8, cursor: 'pointer', textAlign: 'center',
                border: isSelected ? '2px solid #3370FF' : '1px solid #E5E6EB',
                overflow: 'hidden', transition: 'all 0.15s',
              }}>
                {/* 形象图片 */}
                <div style={{ position: 'relative', width: '100%', aspectRatio: '3/4', background: '#F7F8FA' }}>
                  {av.preview.endsWith('.mp4') ? (
                    <ChromaKeyVideo src={av.preview} autoPlay loop muted style={{ width: '100%', height: '100%' }} />
                  ) : (
                    <ChromaKeyImage src={av.preview} alt={av.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                  {/* Radio 选中标识 */}
                  <div style={{
                    position: 'absolute', bottom: 6, right: 6,
                    width: 18, height: 18, borderRadius: '50%',
                    border: isSelected ? 'none' : '2px solid #C9CDD4',
                    background: isSelected ? '#3370FF' : 'rgba(255,255,255,0.85)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s',
                  }}>
                    {isSelected && <span style={{ color: '#fff', fontSize: 11, fontWeight: 700, lineHeight: 1 }}>✓</span>}
                  </div>
                </div>
                {/* 名称 */}
                <div style={{ padding: '6px 4px', fontSize: 12, color: '#1D2129', fontWeight: 500,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {av.name}
                </div>
              </div>
            )
          })}
        </div>
        {/* 底部按钮 */}
        <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onClose} style={{
            padding: '7px 20px', borderRadius: 6,
            border: '1px solid #E5E6EB', background: '#fff',
            color: '#4E5969', fontSize: 13, cursor: 'pointer',
          }}>取消</button>
          <button onClick={() => { if (selected) { onSelect(selected); onClose() } }} style={{
            padding: '7px 20px', borderRadius: 6,
            border: 'none', background: '#3370FF',
            color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer',
          }}>保存</button>
        </div>
      </div>
    </div>
  )
}



// ============ 主组件 ============
// ============ Hover 提示组件 ============
function SkillTip() {
  const [show, setShow] = useState(false)
  return (
    <span style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <span style={{
        width: 14, height: 14, borderRadius: '50%',
        background: '#F53F3F', color: '#fff', fontSize: 9, fontWeight: 700,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'default', flexShrink: 0,
      }}>!</span>
      {show && (
        <span style={{
          position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
          marginBottom: 6, padding: '8px 12px', borderRadius: 8,
          background: '#1D2129', color: '#fff', fontSize: 11, lineHeight: 1.6,
          whiteSpace: 'normal', width: 200, zIndex: 999,
        }}>
          伴播形象在无指令时会以该默认状态进行展示，<br/>保持直播间生动感。
        </span>
      )}
    </span>
  )
}

export default function CanvasPanel({ onClose }: Props) {
  const [products, setProducts] = useState<ProductItem[]>(PRODUCTS_INIT)
  const [selectedProductId, setSelectedProductId] = useState<string | null>('p2')
  const [globalCommands, setGlobalCommands] = useState<GlobalCommands>({
    entrance: '有请模特上场',
    exit: '请模特先下场',
    switch: '看看{N}号链接的模特上身效果',
  })

  // 批量选择


  // 弹窗
  const [showAvatarSwitch, setShowAvatarSwitch] = useState(false)
  const [bindMode, setBindMode] = useState<'single' | 'all'>('single')
  const [previewPopup, setPreviewPopup] = useState<{ title: string; videoUrl: string; avatarName: string } | null>(null)

  // 特殊动作启用状态（每个形象各自记录）
  const [enabledActionIds, setEnabledActionIds] = useState<Record<string, Set<string>>>({})
  const toggleActionEnabled = (avatarId: string, actionId: string) => {
    setEnabledActionIds(prev => {
      const currentSet = prev[avatarId] || new Set()
      const nextSet = new Set(currentSet)
      if (nextSet.has(actionId)) nextSet.delete(actionId)
      else nextSet.add(actionId)
      return { ...prev, [avatarId]: nextSet }
    })
  }

  // 预览播放状态
  const [playingNormal, setPlayingNormal] = useState(false)
  const [playingEntrance, setPlayingEntrance] = useState(false)
  const [playingExit, setPlayingExit] = useState(false)

  const selectedProduct = products.find(p => p.id === selectedProductId)
  const selectedAvatar = selectedProduct?.boundAvatarId ? AVATAR_LIBRARY.find(a => a.id === selectedProduct.boundAvatarId) : null
  const normalStates = selectedAvatar ? (NORMAL_STATES[selectedAvatar.id] || DEFAULT_STATES) : []
  const eventActions = selectedAvatar ? (EVENT_ACTIONS[selectedAvatar.id] || DEFAULT_EVENT_ACTIONS).filter(a => !a.isTransition) : []
  const isPremium = selectedAvatar?.voiceTier === 'premium'

  // 绑定/切换形象
  const handleSelectAvatar = (avatarId: string) => {
    if (bindMode === 'all') {
      setProducts(prev => prev.map(p => ({ ...p, boundAvatarId: avatarId })))
    } else {
      if (!selectedProductId) return
      setProducts(prev => prev.map(p =>
        p.id === selectedProductId ? { ...p, boundAvatarId: avatarId } : p
      ))
    }
  }

  // 预览框内联预览状态
  const [inlinePreview, setInlinePreview] = useState<{ type: 'default' | 'entrance' | 'exit' | 'skill'; videoUrl: string; skillGroupName?: string } | null>(null)
  const [ndiEnabled, setNdiEnabled] = useState(false)
  const [ndiHover, setNdiHover] = useState(false)

  // 技能点输入值状态（智能触发类）—— 支持多条话术（逗号分隔）
  const [skillPointValues, setSkillPointValues] = useState<Record<string, string[]>>(() => {
    const init: Record<string, string[]> = {}
    SKILL_POINTS.filter(p => p.triggerType === 'auto' && p.placeholder).forEach(p => init[p.id] = [])
    return init
  })

  // 技能点编辑态管理（哪些技能点正在编辑）
  const [editingSkill, setEditingSkill] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState('')

  // 获取技能点的当前值（智能触发类返回数组，口令类返回字符串）
  const getSkillValue = (id: string): string | string[] => {
    if (id === 'sp1') return globalCommands.entrance
    if (id === 'sp2') return globalCommands.exit
    if (id === 'sp3') return globalCommands.switch
    return skillPointValues[id] || []
  }

  // 获取技能点的显示文本（智能触发类：数组拼接成逗号分隔字符串）
  const getSkillDisplayText = (id: string): string => {
    const val = getSkillValue(id)
    if (typeof val === 'string') return val
    return (val as string[]).join(', ')
  }

  // 设置技能点的值
  const setSkillValue = (id: string, val: string | string[]) => {
    if (id === 'sp1') setGlobalCommands(prev => ({ ...prev, entrance: val as string }))
    else if (id === 'sp2') setGlobalCommands(prev => ({ ...prev, exit: val as string }))
    else if (id === 'sp3') setGlobalCommands(prev => ({ ...prev, switch: val as string }))
    else setSkillPointValues(prev => ({ ...prev, [id]: val as string[] }))
  }

  // 进入编辑态
  const startEditing = (id: string) => {
    const point = SKILL_POINTS.find(p => p.id === id)!
    const val = getSkillValue(id)
    // 智能触发类：数组转成逗号分隔字符串
    const displayText = typeof val === 'string' ? val : (val as string[]).join(', ')
    setEditDraft(displayText || point.defaultValue || '')
    setEditingSkill(id)
  }

  // 保存编辑（智能触发类：逗号分隔字符串转数组）
  const saveEditing = () => {
    if (editingSkill) {
      const point = SKILL_POINTS.find(p => p.id === editingSkill)!
      // 口令触发类：空值时恢复默认
      if (point.triggerType === 'command' && !editDraft.trim()) {
        setSkillValue(editingSkill, point.defaultValue || '')
      } else {
        // 智能触发类：按中英文逗号拆分成数组
        if (point.triggerType === 'auto' && point.placeholder) {
          const phrases = editDraft.split(/[,，]/).map(s => s.trim()).filter(s => s.length > 0)
          setSkillValue(editingSkill, phrases)
        } else {
          setSkillValue(editingSkill, editDraft)
        }
      }
      setEditingSkill(null)
      setEditDraft('')
    }
  }

  // 取消编辑
  const cancelEditing = () => {
    setEditingSkill(null)
    setEditDraft('')
  }


  // 切换预览框内容
  const switchInlinePreview = (type: 'default' | 'entrance' | 'exit') => {
    if (!selectedAvatar) return
    if (type === 'default') {
      const ns = normalStates.find(s => s.videoUrl)
      setInlinePreview({ type: 'default', videoUrl: ns?.videoUrl || '' })
    } else {
      const eaList = EVENT_ACTIONS[selectedAvatar.id] || []
      const ea = eaList.find(a => a.id === (type === 'entrance' ? 'ea_entrance' : 'ea_exit'))
      setInlinePreview({ type, videoUrl: ea?.videoUrl || '' })
    }
  }

  // 选中形象时自动切到默认展示态
  useEffect(() => {
    if (selectedAvatar) {
      switchInlinePreview('default')
    } else {
      setInlinePreview(null)
    }
  }, [selectedAvatar?.id])

  // 打开预览弹窗（入场/退场按钮用）
  const openPreview = (type: 'entrance' | 'exit') => {
    if (!selectedAvatar) return
    switchInlinePreview(type)
  }

const openActionPreview = (ea: EventAction) => {
    if (!selectedAvatar) return
    setPreviewPopup({
      title: `${ea.label} 预览`,
      videoUrl: ea.videoUrl || '',
      avatarName: selectedAvatar.name,
    })
  }

  // 配置区域滚动引用
  const configRef = useRef<HTMLDivElement>(null)

  // 商品卡片点击后右列滚动到顶部
  const handleSelectProductAndScroll = (id: string) => {
    setSelectedProductId(id)
    configRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%', fontFamily: C.font,
      background: '#FFFFFF', borderRadius: 12, overflow: 'hidden',
    }}>
      {/* 顶栏 */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px', borderBottom: '1px solid #F0F0F0', flexShrink: 0,
        background: '#FFFFFF',
      }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#1D2129' }}>助播虾伴播</span>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', fontSize: 18, color: '#86909C',
          cursor: 'pointer', lineHeight: 1, padding: '0 4px',
        }}>×</button>
      </div>
      {/* 主内容区：左列+右列 */}
      <div style={{
        display: 'flex', flex: 1, minHeight: 0,
      }}>
      {/* ==================== 左列：直播商品列表（约300px） ==================== */}
      <div style={{
        width: 300, flexShrink: 0,
        background: '#FFFFFF', display: 'flex', flexDirection: 'column',
        position: 'relative', overflow: 'hidden',
        boxShadow: '1px 0 0 #F0F0F0',
      }}>
        {/* 顶部标题 */}
        <div style={{ padding: '12px 16px', background: '#F7F8FA', borderBottom: '1px solid #F0F0F0', flexShrink: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1D2129', marginBottom: 4 }}>直播间商品</div>
          <div style={{ fontSize: 11, color: '#86909C', marginBottom: 10 }}>
            {products.length}个商品 {products.filter(p => p.boundAvatarId).length}个已绑定
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#1D2129' }}>全部商品</span>
            <button onClick={() => { setBindMode('all'); setShowAvatarSwitch(true) }} style={{
              padding: '4px 12px', borderRadius: 6,
              background: '#E8F3FF', border: 'none',
              color: '#3370FF', fontSize: 12, fontWeight: 500, cursor: 'pointer',
            }}>去绑定</button>
          </div>
        </div>

        {/* 商品列表 — 紧凑横向行 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
          {products.map(p => {
            const isSelected = selectedProductId === p.id
            const hasAvatar = !!p.boundAvatarId
            return (
              <div key={p.id}
                onClick={() => handleSelectProductAndScroll(p.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 16px', cursor: 'pointer',
                  background: isSelected ? '#E8F3FF' : 'transparent',
                  borderLeft: isSelected ? '3px solid #3370FF' : '3px solid transparent',
                  transition: 'all 0.15s',
                }}>
                {/* 缩略图 */}
                <div style={{
                  width: 48, height: 48, borderRadius: 8, flexShrink: 0,
                  background: '#F2F3F5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                }}>👗</div>
                {/* 信息 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: '#1D2129', fontWeight: 500, lineHeight: 1.3,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: 11, color: '#86909C', marginTop: 2 }}>ID: {p.linkNum * 100000 + 653473}</div>
                </div>
                {/* 操作按钮 */}
                <button
                  onClick={e => { e.stopPropagation(); handleSelectProductAndScroll(p.id); setBindMode('single'); setShowAvatarSwitch(true) }}
                  style={{
                    padding: '4px 12px', borderRadius: 6, flexShrink: 0,
                    border: 'none',
                    background: hasAvatar ? '#F2F3F5' : '#3370FF',
                    color: hasAvatar ? '#86909C' : '#FFFFFF',
                    fontSize: 12, fontWeight: 500, cursor: 'pointer',
                  }}>
                  {hasAvatar ? '已绑定' : '去绑定'}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* ==================== 右列：伴播配置 ==================== */}
      <div ref={configRef} style={{
        flex: 1, overflowY: 'auto', padding: '16px 20px',
        background: '#FFFFFF',
      }}>
        {!selectedProduct ? (
          <div style={{ textAlign: 'center', color: '#86909C', paddingTop: 100, fontSize: 14 }}>
            ← 请在左侧选择一个商品进行配置
          </div>
        ) : (
          <>
            {/* ---- 形象信息栏 ---- */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 14px', borderRadius: 10,
              background: '#F7F8FA', marginBottom: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {selectedAvatar ? (
                  <>
                    <div style={{ width: 36, height: 36, borderRadius: 8, overflow: 'hidden', background: '#F0F0F0' }}>
                      <ChromaKeyImage src={selectedAvatar.preview} alt={selectedAvatar.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                      <div style={{ color: '#1D2129', fontSize: 13, fontWeight: 500 }}>{selectedAvatar.name}</div>
                      <span style={{
                        fontSize: 10, padding: '1px 6px', borderRadius: 4,
                        background: isPremium ? 'rgba(51,112,255,0.15)' : 'rgba(0,180,42,0.15)',
                        color: isPremium ? '#69B1FF' : '#34D399',
                      }}>{isPremium ? '🔵可搭话' : '🟢标准'}</span>
                    </div>
                  </>
                ) : (
                  <span style={{ color: '#86909C', fontSize: 13 }}>未配置伴播形象</span>
                )}
              </div>
              <button onClick={() => { setBindMode('single'); setShowAvatarSwitch(true) }} style={{
                padding: '6px 14px', borderRadius: 6,
                border: '1px solid rgba(51,112,255,0.3)', background: 'transparent',
                color: '#69B1FF', fontSize: 12, cursor: 'pointer',
              }}>{selectedAvatar ? '更换伴播' : '选择伴播'}</button>
            </div>

            {/* ---- 视频预览窗口 ---- */}
            <div style={{
              width: '100%', maxWidth: 240, margin: '0 auto',
              aspectRatio: '9/16', borderRadius: 12, overflow: 'hidden',
              background: '#F7F8FA', position: 'relative',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            }}>
              {selectedAvatar ? (
                <>
                  {/* 视频预览区域 */}
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {inlinePreview?.videoUrl ? (
                      <video
                        key={inlinePreview.videoUrl}
                        src={inlinePreview.videoUrl}
                        autoPlay loop muted
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    ) : (
                      <ChromaKeyImage src={selectedAvatar.preview} alt={selectedAvatar.name}
                        style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                    )}
                  </div>
                  {/* 状态标签 */}
                  <div style={{
                    position: 'absolute', top: 8, left: 8,
                    padding: '2px 8px', borderRadius: 4,
                    background: 'rgba(0,0,0,0.5)', color: '#fff',
                    fontSize: 10, fontWeight: 500,
                  }}>
                    {inlinePreview?.type === 'entrance' ? '入场展示态' :
                     inlinePreview?.type === 'exit' ? '退场展示态' :
                     inlinePreview?.type === 'skill' ? inlinePreview.skillGroupName || '技能预览' :
                     '默认展示态'}
                  </div>
                </>
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <div style={{ width: 80, height: 80, borderRadius: '50%', border: '2px dashed #E5E6EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>🎭</div>
                  <span style={{ color: '#86909C', fontSize: 12 }}>点击「选择伴播」选择形象</span>
                </div>
              )}
            </div>

            {/* ---- 输出到直播伴侣按钮（预览区正下方，hover提示） ---- */}
            {selectedAvatar && (
              <div style={{ position: 'relative', maxWidth: 240, margin: '10px auto 0', textAlign: 'center' }}
                onMouseEnter={() => setNdiHover(true)} onMouseLeave={() => setNdiHover(false)}>
                <button
                  onClick={() => setNdiEnabled(prev => !prev)}
                  style={{
                    padding: '5px 14px', borderRadius: 6,
                    border: ndiEnabled ? '1px solid rgba(51,112,255,0.4)' : '1px solid #E5E6EB',
                    background: ndiEnabled ? '#F0F5FF' : '#fff',
                    color: ndiEnabled ? '#3370FF' : '#86909C',
                    fontSize: 12, cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                  }}>
                  {ndiEnabled && <span style={{ color: '#3370FF', fontSize: 13 }}>✓</span>}
                  输出到直播伴侣预览
                </button>
                {/* Hover 弹层 */}
                {ndiHover && (
                  <div style={{
                    position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
                    marginBottom: 6, padding: '8px 12px', borderRadius: 8,
                    background: '#1D2129', color: '#fff', fontSize: 11, lineHeight: 1.6,
                    whiteSpace: 'normal', width: 220, textAlign: 'left',
                    zIndex: 10,
                  }}>
                    开启后，预览画面会以 <b>NDI 格式</b>实时输出到本地网络。<br/>
                    在「抖音直播伴侣」→ 添加素材 → 选中 NDI 通道 → 即可同步查看效果。
                  </div>
                )}
              </div>
            )}

            {/* ---- 技能点（9 个，按 Figma 设计稿） ---- */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ color: '#1D2129', fontWeight: 600, fontSize: 14, marginBottom: 12, borderLeft: '3px solid #3370FF', paddingLeft: 8 }}>技能点</div>
              {SKILL_POINTS.map(point => {
                const isCommand = point.triggerType === 'command'
                const isEditing = editingSkill === point.id
                const currentValue = getSkillValue(point.id)
                // 智能触发类值是数组，口令类值是字符串
                const isAutoType = point.triggerType === 'auto' && !!point.placeholder
                const phrases = isAutoType ? (currentValue as string[]) : []
                const hasValue = isAutoType ? phrases.length > 0 : !!(currentValue && (currentValue as string).trim())
                const isReadOnly = point.id === 'sp4' // 伴播展示穿版效果永远只读
                const hasPreview = point.hasPreview

                // 渲染预览按钮
                const renderPreviewButton = () => {
                  if (!hasPreview) return null
                  if (point.id === 'sp1') {
                    return inlinePreview?.type === 'entrance' ? (
                      <button onClick={() => switchInlinePreview('default')} style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(51,112,255,0.3)', background: 'transparent', color: '#3370FF', fontSize: 12, cursor: 'pointer' }}>取消</button>
                    ) : (
                      <button onClick={() => openPreview('entrance')} disabled={!selectedAvatar} style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(51,112,255,0.3)', background: 'transparent', color: selectedAvatar ? '#3370FF' : '#C9CDD4', fontSize: 12, cursor: selectedAvatar ? 'pointer' : 'not-allowed' }}>预览效果</button>
                    )
                  }
                  if (point.id === 'sp2') {
                    return inlinePreview?.type === 'exit' ? (
                      <button onClick={() => switchInlinePreview('default')} style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(51,112,255,0.3)', background: 'transparent', color: '#3370FF', fontSize: 12, cursor: 'pointer' }}>取消</button>
                    ) : (
                      <button onClick={() => openPreview('exit')} disabled={!selectedAvatar} style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(51,112,255,0.3)', background: 'transparent', color: selectedAvatar ? '#3370FF' : '#C9CDD4', fontSize: 12, cursor: selectedAvatar ? 'pointer' : 'not-allowed' }}>预览效果</button>
                    )
                  }
                  // 其他有预览的技能点
                  return (
                    <button onClick={() => {
                      const videoMap: Record<string, { url: string, label: string }> = {
                        'sp5': { url: 'https://assets.miimii.ai/b/avatar-effect-positive.mp4', label: '效果肯定' },
                        'sp6': { url: 'https://assets.miimii.ai/b/avatar-effect-push.mp4', label: '逼单助攻' },
                        'sp7': { url: 'https://assets.miimii.ai/b/avatar-effect-demo.mp4', label: '产品演示' },
                        'sp8': { url: 'https://assets.miimii.ai/b/avatar-effect-thanks.mp4', label: '感谢下单' },
                        'sp9': { url: 'https://assets.miimii.ai/b/avatar-effect-fun.mp4', label: '整活表演' },
                      }
                      const v = videoMap[point.id]
                      if (v && selectedAvatar) {
                        const avatarName = AVATAR_LIBRARY.find(a => a.id === selectedAvatar.id)?.name || ''
                        setPreviewPopup({ videoUrl: v.url, title: `${v.label} 预览`, avatarName })
                      }
                    }} disabled={!selectedAvatar} style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(51,112,255,0.3)', background: 'transparent', color: selectedAvatar ? '#3370FF' : '#C9CDD4', fontSize: 12, cursor: selectedAvatar ? 'pointer' : 'not-allowed' }}>预览效果</button>
                  )
                }

                // 渲染编辑按钮（显示态时）
                const renderEditButton = () => {
                  if (isReadOnly) return null
                  if (isCommand) {
                    // 口令触发类：总有值，显示✏️
                    return (
                      <button onClick={() => startEditing(point.id)} style={{ background: 'none', border: 'none', color: '#86909C', fontSize: 14, cursor: 'pointer', padding: '0 4px' }}>✏️</button>
                    )
                  } else {
                    // 智能触发类：有值显示✏️，无值显示+补充
                    return hasValue ? (
                      <button onClick={() => startEditing(point.id)} style={{ background: 'none', border: 'none', color: '#86909C', fontSize: 14, cursor: 'pointer', padding: '0 4px' }}>✏️</button>
                    ) : (
                      <button onClick={() => startEditing(point.id)} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(51,112,255,0.3)', background: 'transparent', color: '#3370FF', fontSize: 12, cursor: 'pointer' }}>+ 补充</button>
                    )
                  }
                }

                // 渲染值区域（显示态/编辑态）
                const renderValueArea = () => {
                  if (isReadOnly) return null
                  if (isEditing) {
                    // 编辑态：输入框
                    return (
                      <div style={{ marginTop: 8 }}>
                        <input
                          value={editDraft}
                          onChange={e => setEditDraft(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') saveEditing()
                            if (e.key === 'Escape') cancelEditing()
                          }}
                          onBlur={saveEditing}
                          autoFocus
                          placeholder={point.defaultValue || point.placeholder || ''}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #3370FF', background: '#FAFAFA', color: '#1D2129', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                        />
                        {isAutoType && (
                          <div style={{ fontSize: 11, color: '#C9CDD4', marginTop: 4, paddingLeft: 4 }}>💡 支持中英文逗号分隔，多条话术将自动拆分</div>
                        )}
                      </div>
                    )
                  } else {
                    // 显示态
                    if (isCommand) {
                      // 口令触发类：显示当前值（纯文本）
                      const displayValue = hasValue ? currentValue : (point.defaultValue || '')
                      return (
                        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: 13, color: '#1D2129', padding: '8px 12px', background: '#FAFAFA', borderRadius: 8, flex: 1 }}>{displayValue}</span>
                          {renderEditButton()}
                        </div>
                      )
                    } else {
                      // 智能触发类
                      if (hasValue) {
                        return (
                          <div style={{ marginTop: 8 }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', marginBottom: 6 }}>
                              {phrases.map((phrase: string, idx: number) => (
                                <span key={idx} style={{
                                  padding: '4px 10px', borderRadius: 6,
                                  background: '#F2F3F5', color: '#1D2129',
                                  fontSize: 12, fontWeight: 400,
                                }}>{phrase}</span>
                              ))}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: 11, color: '#C9CDD4' }}>共{phrases.length}条话术</span>
                              {renderEditButton()}
                            </div>
                          </div>
                        )
                      } else {
                        // 未补充：显示提示+补充按钮
                        return (
                          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 12, color: '#C9CDD4', fontStyle: 'italic' }}>点击补充直播高频话术...</span>
                            {renderEditButton()}
                          </div>
                        )
                      }
                    }
                  }
                }

                return (
                  <div key={point.id} style={{ marginBottom: 16, padding: '12px 14px', borderRadius: 12, background: '#FFFFFF', border: '1px solid #E5E6EB' }}>
                    {/* 标题行 */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, color: '#1D2129', fontWeight: 600 }}>{point.name}</span>
                      {renderPreviewButton()}
                    </div>
                    {/* 说明文字 */}
                    <div style={{ fontSize: 11, color: '#86909C', marginBottom: 6, fontStyle: 'italic' }}>{point.description}</div>
                    {/* 值区域（显示态/编辑态） */}
                    {renderValueArea()}
                  </div>
                )
              })}
            </div>



            </>
        )}
      </div>
      </div> {/* 主内容区 */}

      {/* ==================== 弹窗 ==================== */}
      {showAvatarSwitch && (
        <AvatarSwitchPopup currentAvatarId={selectedProduct?.boundAvatarId || null}
          onSelect={handleSelectAvatar}
          onClose={() => setShowAvatarSwitch(false)}
          mode={bindMode} />
      )}
      {previewPopup && (
        <VideoPreviewPopup videoUrl={previewPopup.videoUrl}
          title={previewPopup.title}
          avatarName={previewPopup.avatarName}
          onClose={() => setPreviewPopup(null)} />
      )}
    </div>
  )
}
