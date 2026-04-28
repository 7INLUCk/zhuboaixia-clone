import React, { useState, useRef, useEffect, useCallback } from 'react'
import { C, Toggle } from './shared'
import type { WizardResult } from './wizard/types'

type Props = { onClose: () => void; wizardResult?: WizardResult; onGoToManage?: () => void; isLive?: boolean }

// ============ 数据类型 ============
type NormalState = { id: string; label: string; icon: string; duration: number; videoUrl?: string }
type EventAction = { id: string; label: string; command: string; duration: number; videoUrl?: string; isTransition?: boolean; enabled?: boolean }
type AvatarLibItem = { id: string; name: string; preview: string; category: 'public' | 'custom'; voiceTier: 'standard' | 'premium'; configuredProductLabels?: string[] }
type ChatRule = { id: string; trigger: string; response: string }
type BoundAvatar = {
  avatarId: string
  tag: string
  skills: Record<string, string[]>  // 形象级技能点（sp3-sp8）
  aiLabel?: boolean
}
type ProductItem = {
  id: string; linkNum: number; name: string; price: string;
  boundAvatars: BoundAvatar[]
  chatRules: ChatRule[]
  chatEnabled: boolean
}

// 全局技能点ID
const GLOBAL_SKILL_IDS = ['sp1', 'sp2', 'sp9']
const AVATAR_SKILL_IDS = ['sp3', 'sp4', 'sp5', 'sp6', 'sp7', 'sp8']

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

// ============ 合规贴片（右侧竖版，随形象输出） ============
function ComplianceSticker() {
  return (
    <div style={{
      position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
      padding: '8px 5px',
      borderRadius: 10,
      background: 'rgba(0,0,0,0.52)',
      backdropFilter: 'blur(6px)',
      border: '1px solid rgba(255,255,255,0.15)',
      pointerEvents: 'none', zIndex: 5,
    }}>
      <div style={{
        width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
        background: 'linear-gradient(135deg, #4F8EF7 0%, #A259FF 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 6, fontWeight: 800, color: '#fff', letterSpacing: -0.3,
      }}>AI</div>
      <div style={{
        writingMode: 'vertical-rl', textOrientation: 'mixed',
        fontSize: 9, color: '#fff', fontWeight: 500, letterSpacing: 1,
        lineHeight: 1.2, whiteSpace: 'nowrap',
      }}>AI 虚拟形象</div>
    </div>
  )
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
  { id: 'av1', name: '小蓝', preview: '/avatars/chroma-keyed/av1.png', category: 'public', voiceTier: 'standard', configuredProductLabels: ['男童纯棉印花T恤'] },
  { id: 'av2', name: '小红', preview: '/avatars/chroma-keyed/av2.png', category: 'public', voiceTier: 'standard', configuredProductLabels: ['儿童防晒衣外套'] },
  { id: 'av3', name: '小黑', preview: '/avatars/generated/av3.jpg', category: 'public', voiceTier: 'premium', configuredProductLabels: ['男童运动裤'] },
  { id: 'av4', name: '小白', preview: '/avatars/generated/av4.jpg', category: 'public', voiceTier: 'standard', configuredProductLabels: ['儿童防晒衣外套', '男童运动裤', '男童纯棉印花T恤'] },
  { id: 'av5', name: '花花', preview: '/avatars/generated/av5.jpg', category: 'public', voiceTier: 'premium', configuredProductLabels: ['女童春款碎花连衣裙', '女童蕾丝上衣'] },
  { id: 'av6', name: '榴莲', preview: '/avatars/chroma-keyed/av6.png', category: 'custom', voiceTier: 'premium', configuredProductLabels: ['女童百褶半身裙'] },
  { id: 'av7', name: '猫猫', preview: '/avatars/generated/av7.jpg', category: 'public', voiceTier: 'standard', configuredProductLabels: ['女童春款碎花连衣裙'] },
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

const mkSkills = (): Record<string, string[]> => ({ sp3: [], sp4: [], sp5: [], sp6: [], sp7: [], sp8: [] })
const PRODUCTS_INIT: ProductItem[] = [
  { id: 'p1', linkNum: 1, name: '女童春款碎花连衣裙', price: '¥129', boundAvatars: [], chatRules: [], chatEnabled: false },
  { id: 'p2', linkNum: 2, name: '男童纯棉印花T恤', price: '¥89', boundAvatars: [{ avatarId: 'av1', tag: '小蓝', skills: mkSkills() }], chatRules: [], chatEnabled: false },
  { id: 'p3', linkNum: 3, name: '儿童防晒衣外套', price: '¥159', boundAvatars: [], chatRules: [], chatEnabled: false },
  { id: 'p4', linkNum: 4, name: '女童百褶半身裙', price: '¥99', boundAvatars: [{ avatarId: 'av6', tag: '榴莲', skills: mkSkills() }], chatRules: [{ id: 'cr2', trigger: '有优惠吗', response: '现在下单立减20元！' }, { id: 'cr3', trigger: '质量怎么样', response: '纯棉面料，亲肤透气，宝宝穿很舒服~' }], chatEnabled: true },
  { id: 'p5', linkNum: 5, name: '男童运动裤', price: '¥79', boundAvatars: [], chatRules: [], chatEnabled: false },
  { id: 'p6', linkNum: 6, name: '女童蕾丝上衣', price: '¥109', boundAvatars: [], chatRules: [], chatEnabled: false },
]

// ============ 技能点数据（9 个，按 Figma 设计稿） ============
const SKILL_POINTS: SkillPoint[] = [
  { id: 'sp1', name: '伴播进入直播间', triggerType: 'command', description: '主播说出以下口令时即可触发，支持模糊匹配', defaultValue: '有请模特入场', hasPreview: true },
  { id: 'sp2', name: '伴播退出直播间', triggerType: 'command', description: '主播说出以下口令时即可触发，支持模糊匹配', defaultValue: '请模特先下场', hasPreview: true },
  { id: 'sp3', name: '伴播换装', triggerType: 'command', description: '说出链接号口令，自动切换对应商品形象', defaultValue: '看看 [N] 号链接的模特上身效果', hasPreview: false },
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
function AvatarSwitchPopup({ currentAvatarId, onSelect, onClose, mode, boundId, currentProductName, onSave, onGoToManage }: {
  currentAvatarId: string | null
  onSelect: (id: string) => void
  onClose: () => void
  mode?: 'single' | 'all'
  // 商品绑定模式（传入时启用两分区，单选）
  boundId?: string | null
  currentProductName?: string
  onSave?: (id: string | null) => void
  onGoToManage?: () => void
}) {
  const isProductMode = boundId !== undefined

  // 相关形象：在向导里配过当前商品的形象
  const relatedAvatars = currentProductName
    ? AVATAR_LIBRARY.filter(av => av.configuredProductLabels?.includes(currentProductName))
    : []
  const relatedIds = new Set(relatedAvatars.map(av => av.id))
  const otherAvatars = AVATAR_LIBRARY.filter(av => !relatedIds.has(av.id))

  // 单选：优先用已绑定的，否则预选第一个相关形象
  const [selectedId, setSelectedId] = useState<string | null>(
    boundId ?? (relatedAvatars[0]?.id ?? null)
  )
  const [selected, setSelected] = useState(currentAvatarId || '')

  const handleCardClick = (id: string) => {
    setSelectedId(prev => prev === id ? null : id)
  }

  const renderProductCard = (av: AvatarLibItem) => {
    const isSelected = selectedId === av.id
    const labels = av.configuredProductLabels ?? []
    return (
      <div key={av.id} onClick={() => handleCardClick(av.id)} style={{
        borderRadius: 8, cursor: 'pointer', textAlign: 'center',
        border: isSelected ? '2px solid #3370FF' : '1px solid #E5E6EB',
        overflow: 'hidden', transition: 'all 0.15s', position: 'relative',
        display: 'flex', flexDirection: 'column',
      }}>
        {isSelected && (
          <div style={{ position: 'absolute', top: 5, right: 5, width: 18, height: 18, borderRadius: '50%', background: '#3370FF', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, fontSize: 10, color: '#fff', fontWeight: 700 }}>✓</div>
        )}
        {/* 固定像素高度，避免图片未加载时塌缩 */}
        <div style={{ width: '100%', height: 110, background: '#F7F8FA', flexShrink: 0, overflow: 'hidden' }}>
          <img src={av.preview} alt={av.name} style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center' }} />
        </div>
        {/* 底部区：固定 76px，内容始终放得下，无需 overflow:hidden */}
        <div style={{ padding: '6px 5px', display: 'flex', flexDirection: 'column', gap: 4, height: 76, boxSizing: 'border-box' }}>
          <div style={{ fontSize: 12, color: '#1D2129', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: '20px' }}>
            {av.name}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* 最多2行：≥3条时只展示第1条 + "+N件" */}
            <span style={{ fontSize: 10, color: '#86909C', background: '#F2F3F5', borderRadius: 3, padding: '1px 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', textAlign: 'left', lineHeight: '16px' }}>
              {labels[0] ?? ''}
            </span>
            {labels.length === 2 && (
              <span style={{ fontSize: 10, color: '#86909C', background: '#F2F3F5', borderRadius: 3, padding: '1px 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', textAlign: 'left', lineHeight: '16px' }}>
                {labels[1]}
              </span>
            )}
            {labels.length > 2 && (
              <span style={{ fontSize: 10, color: '#86909C', textAlign: 'left', lineHeight: '16px' }}>+{labels.length - 1} 件商品</span>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
      <div style={{ position: 'relative', zIndex: 1, width: 480, background: '#fff', borderRadius: 12, overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}>
        {/* 标题栏 */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: '#1D2129', fontWeight: 600, fontSize: 15 }}>
            {isProductMode ? '绑定伴播形象' : (mode === 'all' ? '全部商品绑定形象' : '选择伴播形象')}
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 18, color: '#86909C', cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>

        {isProductMode ? (
          <>
            <div style={{ maxHeight: 440, overflowY: 'auto', padding: '12px 20px' }}>
              {/* 相关形象分区 */}
              {relatedAvatars.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, color: '#86909C', marginBottom: 8 }}>相关形象</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                    {relatedAvatars.map(av => renderProductCard(av))}
                  </div>
                </div>
              )}
              {/* 其他形象分区 */}
              {otherAvatars.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, color: '#86909C', marginBottom: 8 }}>
                    {relatedAvatars.length > 0 ? '其他形象' : '选择形象'}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                    {otherAvatars.map(av => renderProductCard(av))}
                  </div>
                </div>
              )}
            </div>

            {/* 底部：跳转链接 + 取消/保存 */}
            <div style={{ padding: '12px 20px', borderTop: '1px solid #F0F0F0', display: 'flex', alignItems: 'center' }}>
              <button onClick={onGoToManage} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3370FF', fontSize: 13, padding: 0 }}>
                去管理我的伴播 →
              </button>
              <div style={{ flex: 1 }} />
              <button onClick={onClose} style={{ padding: '7px 20px', borderRadius: 6, border: '1px solid #E5E6EB', background: '#fff', color: '#4E5969', fontSize: 13, cursor: 'pointer', marginRight: 8 }}>取消</button>
              <button onClick={() => { onSave?.(selectedId); onClose() }} style={{ padding: '7px 20px', borderRadius: 6, border: 'none', background: '#3370FF', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>保存</button>
            </div>
          </>
        ) : (
          <>
            {/* 原单选模式（整场直播形象用） */}
            <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, maxHeight: 400, overflowY: 'auto' }}>
              {AVATAR_LIBRARY.map(av => {
                const isSelected = selected === av.id
                return (
                  <div key={av.id} onClick={() => setSelected(av.id)} style={{
                    borderRadius: 8, cursor: 'pointer', textAlign: 'center',
                    border: isSelected ? '2px solid #3370FF' : '1px solid #E5E6EB',
                    overflow: 'hidden', transition: 'all 0.15s',
                  }}>
                    <div style={{ position: 'relative', width: '100%', aspectRatio: '3/4', background: '#F7F8FA' }}>
                      {av.preview.endsWith('.mp4') ? (
                        <ChromaKeyVideo src={av.preview} autoPlay loop muted style={{ width: '100%', height: '100%' }} />
                      ) : (
                        <ChromaKeyImage src={av.preview} alt={av.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}
                      <div style={{
                        position: 'absolute', bottom: 6, right: 6, width: 18, height: 18, borderRadius: '50%',
                        border: isSelected ? 'none' : '2px solid #C9CDD4',
                        background: isSelected ? '#3370FF' : 'rgba(255,255,255,0.85)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
                      }}>
                        {isSelected && <span style={{ color: '#fff', fontSize: 11, fontWeight: 700, lineHeight: 1 }}>✓</span>}
                      </div>
                    </div>
                    <div style={{ padding: '6px 4px', fontSize: 12, color: '#1D2129', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {av.name}
                    </div>
                  </div>
                )
              })}
            </div>
            <div style={{ padding: '12px 20px', borderTop: '1px solid #F0F0F0', display: 'flex', alignItems: 'center' }}>
              {onGoToManage && (
                <button onClick={onGoToManage} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3370FF', fontSize: 13, padding: 0 }}>去管理我的伴播 →</button>
              )}
              <div style={{ flex: 1 }} />
              <button onClick={onClose} style={{ padding: '7px 20px', borderRadius: 6, border: '1px solid #E5E6EB', background: '#fff', color: '#4E5969', fontSize: 13, cursor: 'pointer', marginRight: 8 }}>取消</button>
              <button onClick={() => { if (selected) { onSelect(selected); onClose() } }} style={{ padding: '7px 20px', borderRadius: 6, border: 'none', background: '#3370FF', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>保存</button>
            </div>
          </>
        )}
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

export default function CanvasPanel({ onClose, wizardResult, onGoToManage, isLive }: Props) {
  // ===== 选中状态（替代 mode：null=未选，live=整场形象，product=商品） =====
  const [activeSection, setActiveSection] = useState<'live' | 'product' | null>('live')
  const [liveAvatarCollapsed, setLiveAvatarCollapsed] = useState(false) // 整场直播区块默认展开
  const [products, setProducts] = useState<ProductItem[]>(PRODUCTS_INIT)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [selectedLiveAvatarIdx, setSelectedLiveAvatarIdx] = useState(0)
  const [selectedProductAvatarIdx, setSelectedProductAvatarIdx] = useState(0)
  const [liveAvatars, setLiveAvatars] = useState<BoundAvatar[]>([
    { avatarId: 'av1', tag: '小蓝', skills: mkSkills() },
    { avatarId: 'av2', tag: '小红', skills: mkSkills() },
  ])
  const [globalCommands, setGlobalCommands] = useState<GlobalCommands>({
    entrance: '有请模特上场',
    exit: '请模特先下场',
    switch: '看看{N}号链接的模特上身效果',
  })

  // 批量选择


  // 弹窗
  const [showAvatarSwitch, setShowAvatarSwitch] = useState(false)
  const [addingToLiveSection, setAddingToLiveSection] = useState(false) // true=从直播形象区打开弹窗
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

  // 当前选中的形象（根据模式不同来源不同）
  const selectedProduct = products.find(p => p.id === selectedProductId)
  const currentBoundAvatars = activeSection === 'live' ? liveAvatars : (selectedProduct?.boundAvatars || [])
  const currentAvatarIdx = activeSection === 'live' ? selectedLiveAvatarIdx : selectedProductAvatarIdx
  const currentBoundAvatar = currentBoundAvatars[currentAvatarIdx] || null
  const selectedAvatar = currentBoundAvatar ? AVATAR_LIBRARY.find(a => a.id === currentBoundAvatar.avatarId) : null
  const normalStates = selectedAvatar ? (NORMAL_STATES[selectedAvatar.id] || DEFAULT_STATES) : []
  const eventActions = selectedAvatar ? (EVENT_ACTIONS[selectedAvatar.id] || DEFAULT_EVENT_ACTIONS).filter(a => !a.isTransition) : []
  const isPremium = selectedAvatar?.voiceTier === 'premium'

  // 绑定/切换形象
  const handleSelectAvatar = (avatarId: string) => {
    if (addingToLiveSection) {
      if (!liveAvatars.find(ba => ba.avatarId === avatarId)) {
        const av = AVATAR_LIBRARY.find(a => a.id === avatarId)
        setLiveAvatars(prev => [...prev, { avatarId, tag: av?.name || '', skills: mkSkills() }])
      }
      setAddingToLiveSection(false)
    } else if (bindMode === 'all') {
      const av = AVATAR_LIBRARY.find(a => a.id === avatarId)
      setProducts(prev => prev.map(p => ({ ...p, boundAvatars: [{ avatarId, tag: av?.name || '', skills: mkSkills() }] })))
    } else {
      if (!selectedProductId) return
      const av = AVATAR_LIBRARY.find(a => a.id === avatarId)
      setProducts(prev => prev.map(p =>
        p.id === selectedProductId ? { ...p, boundAvatars: [...p.boundAvatars, { avatarId, tag: av?.name || '', skills: mkSkills() }] } : p
      ))
    }
  }

  // 商品绑定单个形象保存
  function handleSaveProductBindings(newId: string | null) {
    if (!selectedProductId) return
    setProducts(prev => prev.map(p => {
      if (p.id !== selectedProductId) return p
      if (newId === null) return { ...p, boundAvatars: [] }
      const existing = p.boundAvatars.find(ba => ba.avatarId === newId)
      const newBoundAvatar = existing ?? { avatarId: newId, tag: AVATAR_LIBRARY.find(a => a.id === newId)?.name || '', skills: mkSkills() }
      return { ...p, boundAvatars: [newBoundAvatar] }
    }))
  }

  // 预览框内联预览状态
  const [inlinePreview, setInlinePreview] = useState<{ type: 'default' | 'entrance' | 'exit' | 'skill'; videoUrl: string; skillGroupName?: string } | null>(null)
  const [ndiEnabled, setNdiEnabled] = useState(false)
  const [ndiHover, setNdiHover] = useState(false)
  const [complianceEnabled, setComplianceEnabled] = useState(false)

  // 技能点输入值状态（智能触发类）—— 支持多条话术（逗号分隔）
  const [skillPointValues, setSkillPointValues] = useState<Record<string, string[]>>(() => {
    const init: Record<string, string[]> = {}
    SKILL_POINTS.filter(p => p.triggerType === 'auto' && p.placeholder).forEach(p => init[p.id] = [])
    init['sp5'] = ['效果真的很好', '质量超棒', '穿上太好看了']
    init['sp7'] = ['大家看这里', '给大家展示一下', '仔细看这个细节']
    return init
  })

  // 技能点编辑态管理（哪些技能点正在编辑）
  const [editingSkill, setEditingSkill] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState('')

  // 添加标签状态（智能触发类：点击+弹出的输入框）
  const [addingSkill, setAddingSkill] = useState<string | null>(null)
  const [addDraft, setAddDraft] = useState('')

  // 手动触发反馈状态
  const [triggeredSkill, setTriggeredSkill] = useState<string | null>(null)
  const triggerSkill = (skillId: string) => {
    setTriggeredSkill(skillId)
    setTimeout(() => setTriggeredSkill(null), 1500)
  }

  // 删除单条话术
  const removeSkillPhrase = (pointId: string, index: number) => {
    setSkillPointValues(prev => {
      const current = prev[pointId] || []
      const next = [...current]
      next.splice(index, 1)
      return { ...prev, [pointId]: next }
    })
  }

  // 添加单条话术
  const addSkillPhrase = (pointId: string) => {
    const trimmed = addDraft.trim()
    if (!trimmed) return
    setSkillPointValues(prev => {
      const current = prev[pointId] || []
      if (current.includes(trimmed)) return prev // 防重复
      return { ...prev, [pointId]: [...current, trimmed] }
    })
    setAddDraft('')
    setAddingSkill(null)
  }

  // 判断是否是新样式技能点（sp5/sp6/sp7/sp8）
  const isNewStyleSkill = (id: string) => ['sp5', 'sp6', 'sp7', 'sp8'].includes(id)

  // 更新当前选中形象的技能点
  const updateAvatarSkill = (skillId: string, value: string[]) => {
    if (activeSection === 'live') {
      setLiveAvatars(prev => {
        const n = [...prev]
        if (n[selectedLiveAvatarIdx]) {
          n[selectedLiveAvatarIdx] = { ...n[selectedLiveAvatarIdx], skills: { ...n[selectedLiveAvatarIdx].skills, [skillId]: value } }
        }
        return n
      })
    } else if (selectedProductId) {
      setProducts(prev => prev.map(p => {
        if (p.id !== selectedProductId) return p
        const next = [...p.boundAvatars]
        if (next[selectedProductAvatarIdx]) {
          next[selectedProductAvatarIdx] = { ...next[selectedProductAvatarIdx], skills: { ...next[selectedProductAvatarIdx].skills, [skillId]: value } }
        }
        return { ...p, boundAvatars: next }
      }))
    }
  }

  // 给当前形象添加一条话术
  const addAvatarSkillPhrase = (skillId: string) => {
    const trimmed = addDraft.trim()
    if (!trimmed) return
    const current = currentBoundAvatar?.skills?.[skillId] || []
    if (current.includes(trimmed)) { setAddDraft(''); setAddingSkill(null); return }
    updateAvatarSkill(skillId, [...current, trimmed])
    setAddDraft('')
    setAddingSkill(null)
  }

  // 获取技能点的当前值（智能触发类返回数组，口令类返回字符串）
  const getSkillValue = (id: string): string | string[] => {
    if (id === 'sp1') return globalCommands.entrance
    if (id === 'sp2') return globalCommands.exit
    if (id === 'sp3') return globalCommands.switch
    const point = SKILL_POINTS.find(p => p.id === id)
    // command 类型返回字符串，auto 类型返回数组
    if (point?.triggerType === 'command') return (skillPointValues[id] as unknown as string) || point.defaultValue || ''
    return (skillPointValues[id] as unknown as string[]) || []
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

  // 向导配置同步总览
  const [syncExpanded, setSyncExpanded] = useState(false)

  // 配置区域滚动引用
  const configRef = useRef<HTMLDivElement>(null)

  // 商品卡片点击后右列滚动到顶部
  const handleSelectProductAndScroll = (id: string) => {
    setSelectedProductId(id)
    setSelectedProductAvatarIdx(0)
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
      {/* 向导配置同步总览（有 wizardResult 时展示） */}
      {wizardResult && (() => {
        const avatars = wizardResult.avatarConfigs
        const totalSkills = avatars.reduce((s, c) => s + c.selectedSkillIds.length, 0)
        const skillMap: Record<string, string> = {
          'sp-daily': '日常动作', 'sp-enter': '进场', 'sp-exit': '出场',
          'sp-auto-outfit': '自动换装', 'sp-showcase': '穿版展示',
          'sp-urge': '逼单助攻', 'sp-affirm': '效果肯定',
          'sp-thanks': '感谢下单', 'sp-demo': '产品演示', 'sp-perform': '整活表演',
        }
        return (
          <div style={{ flexShrink: 0, borderBottom: '1px solid #F0F0F0', fontFamily: C.font }}>
            <div
              onClick={() => setSyncExpanded(v => !v)}
              style={{
                padding: '7px 14px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
                background: '#F0FFF6',
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 600, color: C.green }}>✓ 向导配置已同步</span>
              <span style={{ fontSize: 11, color: C.textSec, flex: 1 }}>
                {avatars.length} 个形象 · {totalSkills} 种技能 · 商品绑定已自动应用
              </span>
              <span style={{ fontSize: 10, color: C.textSec }}>{syncExpanded ? '▲ 收起' : '▼ 查看详情'}</span>
            </div>
            {syncExpanded && (
              <div style={{ padding: '8px 14px 10px', background: '#FAFDFB', borderTop: '1px solid #E6F9EF' }}>
                {avatars.map(c => {
                  const isFullSession = c.mode === 'ip' || c.mode === 'universal'
                  const boundProducts = wizardResult.selectedProductIds.filter(pid =>
                    c.outfitSlots.some(s => s.productId === pid)
                  )
                  const skillNames = c.selectedSkillIds.map(id => skillMap[id] ?? id).join('、')
                  return (
                    <div key={c.id} style={{
                      padding: '6px 8px', borderRadius: 6,
                      background: '#fff', border: '1px solid #E6F9EF',
                      marginBottom: 5, fontSize: 11,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                        <span style={{ fontWeight: 600, color: C.text }}>{c.name}</span>
                        {isFullSession
                          ? <span style={{ padding: '1px 5px', borderRadius: 3, background: C.blueLight, color: C.blue, fontSize: 10 }}>全场生效</span>
                          : boundProducts.length > 0
                            ? <span style={{ padding: '1px 5px', borderRadius: 3, background: '#FFF0DC', color: C.orange, fontSize: 10 }}>绑定 {boundProducts.length} 件商品</span>
                            : <span style={{ padding: '1px 5px', borderRadius: 3, background: '#F3F4F6', color: C.textTert, fontSize: 10 }}>未绑定商品</span>
                        }
                        <span style={{ padding: '1px 5px', borderRadius: 3, background: '#F3F4F6', color: C.textSec, fontSize: 10, marginLeft: 'auto', flexShrink: 0 }}>
                          {c.reviewStatus === 'approved' ? '✓ 已通过' : c.reviewStatus === 'reviewing' ? '⏳ 审核中' : '待提交'}
                        </span>
                      </div>
                      <div style={{ color: C.textSec, lineHeight: 1.5 }}>技能：{skillNames || '—'}</div>
                    </div>
                  )
                })}
                <div style={{ fontSize: 10, color: C.textTert, marginTop: 4 }}>
                  以上为向导默认配置，可在下方手动修改覆盖
                </div>
              </div>
            )}
          </div>
        )
      })()}

      {/* 主内容区：左列+右列 */}
      <div style={{
        display: 'flex', flex: 1, minHeight: 0,
      }}>
      {/* ==================== 左列（约300px） ==================== */}
      <div style={{
        width: 300, flexShrink: 0,
        background: '#FFFFFF', display: 'flex', flexDirection: 'column',
        position: 'relative', overflow: 'hidden',
        boxShadow: '1px 0 0 #F0F0F0',
      }}>
        {/* ===== 上半部分：整场直播（点击进入右侧配置） ===== */}
        <div style={{ flexShrink: 0, borderBottom: '1px solid #F0F0F0' }}>
          <div
            onClick={() => setActiveSection('live')}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 16px',
              background: activeSection === 'live' ? '#E8F3FF' : '#F7F8FA',
              cursor: 'pointer', userSelect: 'none', transition: 'background 0.15s',
            }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: activeSection === 'live' ? '#3370FF' : '#1D2129' }}>整场直播形象</div>
              <div style={{ fontSize: 11, color: '#86909C', marginTop: 1 }}>
                {liveAvatars.length > 0 ? `${liveAvatars.length}个形象` : '暂无形象'} · 通过指定词切换
              </div>
            </div>
            <span style={{ fontSize: 14, color: activeSection === 'live' ? '#3370FF' : '#86909C' }}>›</span>
          </div>
        </div>
        {/* ===== 下半部分：直播间商品 ===== */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ padding: '10px 16px', background: '#F7F8FA', flexShrink: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1D2129' }}>直播间商品</div>
            <div style={{ fontSize: 11, color: '#86909C', marginTop: 1 }}>
              {products.length}个商品 · {products.filter(p => p.boundAvatars.length > 0).length}个已绑定
            </div>

          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
            {products.map(p => {
              const isSelected = activeSection === 'product' && selectedProductId === p.id
              const hasAvatar = p.boundAvatars.length > 0
              return (
                <div key={p.id}
                  onClick={() => { handleSelectProductAndScroll(p.id); setActiveSection('product') }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 16px', cursor: 'pointer',
                    background: isSelected ? '#E8F3FF' : 'transparent',
                    transition: 'all 0.15s',
                  }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 8, flexShrink: 0,
                    background: '#F2F3F5',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                  }}>👗</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: '#1D2129', fontWeight: 500, lineHeight: 1.3,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: 11, color: '#86909C', marginTop: 2 }}>ID: {p.linkNum * 100000 + 653473}</div>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); handleSelectProductAndScroll(p.id); setActiveSection('product'); setBindMode('single'); setShowAvatarSwitch(true) }}
                    style={{
                      padding: '4px 12px', borderRadius: 6, flexShrink: 0,
                      border: 'none',
                      background: hasAvatar ? '#F2F3F5' : '#3370FF',
                      color: hasAvatar ? '#86909C' : '#FFFFFF',
                      fontSize: 12, fontWeight: 500, cursor: 'pointer',
                    }}>
                    {hasAvatar ? `${p.boundAvatars.length}个形象 +` : '去绑定'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ==================== 右列：伴播配置 ==================== */}
      <div ref={configRef} style={{
        flex: 1, overflowY: 'auto', padding: '16px 20px',
        background: '#FFFFFF',
      }}>
        {activeSection === null ? (
          <div style={{ textAlign: 'center', color: '#86909C', paddingTop: 100, fontSize: 14 }}>← 请在左侧选择形象或商品进行配置</div>
        ) : activeSection === 'live' ? (
          <>
            {/* ---- 形象切换条（顶部 chips，与商品模式一致） ---- */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: '#86909C', marginBottom: 6 }}>整场形象 · 点击切换配置</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                {liveAvatars.map((ba, idx) => {
                  const av = AVATAR_LIBRARY.find(a => a.id === ba.avatarId)
                  const isSelected = selectedLiveAvatarIdx === idx
                  return (
                    <div key={idx} onClick={() => setSelectedLiveAvatarIdx(idx)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 8, cursor: 'pointer', flexShrink: 0, background: isSelected ? '#E8F3FF' : '#F7F8FA', border: isSelected ? '1px solid #3370FF' : '1px solid #E5E6EB', transition: 'all 0.15s' }}>
                      <div style={{ width: 22, height: 22, borderRadius: 4, overflow: 'hidden', background: '#F0F0F0', flexShrink: 0 }}>
                        {av && <ChromaKeyImage src={av.preview} alt={av.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                      </div>
                      <span style={{ fontSize: 12, color: isSelected ? '#3370FF' : '#1D2129', fontWeight: isSelected ? 500 : 400 }}>{av?.name || '未知'}</span>
                      <span onClick={e => {
                        e.stopPropagation()
                        setLiveAvatars(prev => prev.filter((_, i) => i !== idx))
                        if (selectedLiveAvatarIdx >= liveAvatars.length - 1) setSelectedLiveAvatarIdx(Math.max(0, liveAvatars.length - 2))
                      }} style={{ fontSize: 11, color: '#C9CDD4', cursor: 'pointer', marginLeft: 2, lineHeight: 1 }}>✕</span>
                    </div>
                  )
                })}
                <button onClick={() => { setAddingToLiveSection(true); setShowAvatarSwitch(true) }} style={{ padding: '6px 10px', borderRadius: 8, border: '1px dashed #3370FF', background: 'transparent', color: '#3370FF', fontSize: 12, cursor: 'pointer', flexShrink: 0 }}>+ 添加形象</button>
              </div>
            </div>

            <>
                {/* ---- 视频预览窗口 ---- */}
                <div style={{ width: '100%', maxWidth: 240, margin: '0 auto', aspectRatio: '9/16', borderRadius: 12, overflow: 'hidden', background: '#F7F8FA', position: 'relative', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
                  {selectedAvatar ? (
                  <>
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {inlinePreview?.videoUrl ? (
                      <video key={inlinePreview.videoUrl} src={inlinePreview.videoUrl} autoPlay loop muted style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                      <img src={selectedAvatar.preview} alt={selectedAvatar.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                    )}
                  </div>
                  <div style={{ position: 'absolute', top: 8, left: 8, padding: '2px 8px', borderRadius: 4, background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: 10, fontWeight: 500 }}>
                    {inlinePreview?.type === 'entrance' ? '入场展示态' : inlinePreview?.type === 'exit' ? '退场展示态' : inlinePreview?.type === 'skill' ? inlinePreview.skillGroupName || '技能预览' : '默认展示态'}
                  </div>
                  {complianceEnabled && <ComplianceSticker />}
                  </>
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <div style={{ width: 80, height: 80, borderRadius: '50%', border: '2px dashed #E5E6EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>🎭</div>
                      <span style={{ color: '#86909C', fontSize: 12 }}>点击上方「+ 添加形象」开始配置</span>
                    </div>
                  )}
                </div>

                {/* ---- 输出到直播伴侣按钮 ---- */}
                {selectedAvatar && <div style={{ position: 'relative', maxWidth: 240, margin: '10px auto 0', textAlign: 'center' }}
                  onMouseEnter={() => setNdiHover(true)} onMouseLeave={() => setNdiHover(false)}>
                  <button onClick={() => setNdiEnabled(prev => !prev)} style={{ padding: '5px 14px', borderRadius: 6, border: ndiEnabled ? '1px solid rgba(51,112,255,0.4)' : '1px solid #E5E6EB', background: ndiEnabled ? '#F0F5FF' : '#fff', color: ndiEnabled ? '#3370FF' : '#86909C', fontSize: 12, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {ndiEnabled && <span style={{ color: '#3370FF', fontSize: 13 }}>✓</span>}
                    输出到直播伴侣预览
                  </button>
                  {ndiHover && (
                    <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 6, padding: '8px 12px', borderRadius: 8, background: '#1D2129', color: '#fff', fontSize: 11, lineHeight: 1.6, whiteSpace: 'normal', width: 220, textAlign: 'left', zIndex: 10 }}>
                      开启后，预览画面会以 <b>NDI 格式</b>实时输出到本地网络。<br/>
                      在「抖音直播伴侣」→ 添加素材 → 选中 NDI 通道 → 即可同步查看效果。
                    </div>
                  )}
                {/* ---- 合规贴片 ---- */}
                <div style={{ maxWidth: 280, margin: '8px auto 0', borderRadius: 8, background: complianceEnabled ? '#F0F5FF' : '#F7F8FA', border: `1px solid ${complianceEnabled ? '#AAC4FF' : '#E5E6EB'}`, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px' }}>
                    <div>
                      <div style={{ fontSize: 12, color: '#1D2129', fontWeight: 500 }}>合规贴片</div>
                      <div style={{ fontSize: 10, color: '#86909C', marginTop: 1 }}>叠加在伴播形象右侧，显示「AI 虚拟形象」标识，随形象一同输出</div>
                    </div>
                    <Toggle checked={complianceEnabled} onChange={setComplianceEnabled} />
                  </div>
                </div>

                </div>}

                {/* ---- 形象指定词 ---- */}
                {currentBoundAvatar && (
                  <div style={{ marginTop: 16, marginBottom: 12, padding: '10px 14px', borderRadius: 10, background: '#F7FBFF', border: '1px solid #C2D8FF' }}>
                    <div style={{ marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: '#1D2129', fontWeight: 600 }}>形象指定词</span>
                    </div>
                    <input
                      value={currentBoundAvatar.tag || ''}
                      onChange={e => setLiveAvatars(prev => { const n = [...prev]; n[selectedLiveAvatarIdx] = { ...n[selectedLiveAvatarIdx], tag: e.target.value }; return n })}
                      placeholder={selectedAvatar?.name || '输入指定词'}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #BAD7FF', fontSize: 13, outline: 'none', color: '#1D2129', background: '#FFFFFF', boxSizing: 'border-box' }}
                    />
                    {currentBoundAvatar.tag && (() => {
                      const conflict = liveAvatars.some((ba, i) => i !== selectedLiveAvatarIdx && ba.tag === currentBoundAvatar.tag)
                      return conflict ? (
                        <div style={{ fontSize: 10, color: '#F53F3F', marginTop: 4 }}>⚠ 指定词与其他形象重复，主播说此词时可能触发错误</div>
                      ) : (
                        <div style={{ fontSize: 10, color: '#86909C', marginTop: 4 }}>
                          主播说出此词时，自动切换到该形象
                        </div>
                      )
                    })()}
                  </div>
                )}

                {/* ---- 技能点 ---- */}
                <div style={{ marginBottom: 20, marginTop: currentBoundAvatar ? 0 : 16 }}>
                  <div style={{ color: '#1D2129', fontWeight: 600, fontSize: 14, marginBottom: 12, borderLeft: '3px solid #3370FF', paddingLeft: 8 }}>技能点</div>
                  {SKILL_POINTS.map(point => {
                    const isCommand = point.triggerType === 'command'
                    const isEditing = editingSkill === point.id
                    const currentValue = getSkillValue(point.id)
                    const isAutoType = point.triggerType === 'auto' && !!point.placeholder
                    const phrases = isAutoType ? (currentValue as string[]) : (currentBoundAvatar?.skills?.[point.id] || [])
                    const hasValue = isAutoType ? phrases.length > 0 : !!(currentValue && typeof currentValue === 'string' && currentValue.trim())
                    const isReadOnly = point.id === 'sp4'

                    const renderLivePreviewButton = () => {
                      if (!point.hasPreview) return null
                      const isTriggered = triggeredSkill === point.id
                      if (isLive) {
                        return <button
                          onClick={() => triggerSkill(point.id)}
                          disabled={isTriggered}
                          style={{
                            padding: '4px 12px', borderRadius: 6, fontSize: 12, cursor: isTriggered ? 'default' : 'pointer',
                            border: 'none',
                            background: isTriggered ? '#E6F9EF' : '#FF6A00',
                            color: isTriggered ? '#00B42A' : '#fff',
                            fontWeight: 500,
                            transition: 'all 0.2s',
                          }}
                        >{isTriggered ? '✓ 已触发' : '▶ 触发'}</button>
                      }
                      if (point.id === 'sp1') return inlinePreview?.type === 'entrance' ? (
                        <button onClick={() => switchInlinePreview('default')} style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(51,112,255,0.3)', background: 'transparent', color: '#3370FF', fontSize: 12, cursor: 'pointer' }}>取消</button>
                      ) : (
                        <button onClick={() => openPreview('entrance')} style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(51,112,255,0.3)', background: 'transparent', color: '#3370FF', fontSize: 12, cursor: 'pointer' }}>预览效果</button>
                      )
                      if (point.id === 'sp2') return inlinePreview?.type === 'exit' ? (
                        <button onClick={() => switchInlinePreview('default')} style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(51,112,255,0.3)', background: 'transparent', color: '#3370FF', fontSize: 12, cursor: 'pointer' }}>取消</button>
                      ) : (
                        <button onClick={() => openPreview('exit')} style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(51,112,255,0.3)', background: 'transparent', color: '#3370FF', fontSize: 12, cursor: 'pointer' }}>预览效果</button>
                      )
                      const videoMap: Record<string, { url: string; label: string }> = { 'sp5': { url: 'https://assets.miimii.ai/b/avatar-effect-positive.mp4', label: '效果肯定' }, 'sp6': { url: 'https://assets.miimii.ai/b/avatar-effect-push.mp4', label: '逼单助攻' }, 'sp7': { url: 'https://assets.miimii.ai/b/avatar-effect-demo.mp4', label: '产品演示' }, 'sp8': { url: 'https://assets.miimii.ai/b/avatar-effect-thanks.mp4', label: '感谢下单' }, 'sp9': { url: 'https://assets.miimii.ai/b/avatar-effect-fun.mp4', label: '整活表演' } }
                      const v = videoMap[point.id]
                      return v ? <button onClick={() => setPreviewPopup({ videoUrl: v.url, title: `${v.label} 预览`, avatarName: selectedAvatar?.name || '' })} style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(51,112,255,0.3)', background: 'transparent', color: '#3370FF', fontSize: 12, cursor: 'pointer' }}>预览效果</button> : null
                    }

                    const renderLiveValueArea = () => {
                      if (isReadOnly) return null
                      // sp3 特殊：全局口令模板 + 本形象换装指定词
                      if (point.id === 'sp3') {
                        return (
                          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div>

                              {isEditing ? (
                                <input value={editDraft} onChange={e => setEditDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') saveEditing(); if (e.key === 'Escape') cancelEditing() }} onBlur={saveEditing} autoFocus placeholder={point.defaultValue || ''} style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #3370FF', background: '#FAFAFA', color: '#1D2129', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                              ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <span style={{ fontSize: 13, color: '#1D2129', padding: '7px 10px', background: '#FAFAFA', borderRadius: 6, flex: 1 }}>{getSkillDisplayText('sp3')}</span>
                                  <button onClick={() => startEditing('sp3')} style={{ background: 'none', border: 'none', color: '#86909C', fontSize: 14, cursor: 'pointer', padding: '0 4px' }}>✏️</button>
                                </div>
                              )}
                            </div>
                            <div style={{ fontSize: 10, color: '#86909C', marginTop: 4 }}>
                              绑定多个形象时，加说指定词可精准切换
                            </div>
                          </div>
                        )
                      }
                      if (isNewStyleSkill(point.id)) {
                        const avatarPhrases = currentBoundAvatar?.skills?.[point.id] || []
                        const isAdding = addingSkill === point.id
                        return (
                          <div style={{ marginTop: 8 }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                              {avatarPhrases.map((phrase: string, idx: number) => (
                                <span key={idx} style={{ padding: '6px 12px', borderRadius: 6, background: '#F2F3F5', border: '1px solid #E5E6EB', fontSize: 13, color: '#1D2129', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                  {phrase}
                                  <span onClick={() => { const next = [...avatarPhrases]; next.splice(idx, 1); updateAvatarSkill(point.id, next) }} style={{ cursor: 'pointer', opacity: 0.6, fontSize: 12 }}>🗑</span>
                                </span>
                              ))}
                              {!isAdding && <span onClick={() => setAddingSkill(point.id)} style={{ padding: '6px 12px', borderRadius: 6, background: 'transparent', border: '1px solid #E5E6EB', fontSize: 13, color: '#86909C', cursor: 'pointer' }}>+</span>}
                            </div>
                            {isAdding && <input value={addDraft} onChange={e => setAddDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addAvatarSkillPhrase(point.id); if (e.key === 'Escape') { setAddDraft(''); setAddingSkill(null) } }} onBlur={() => { if (addDraft.trim()) addAvatarSkillPhrase(point.id); else { setAddDraft(''); setAddingSkill(null) } }} autoFocus placeholder="输入话术后按 Enter 添加" style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #3370FF', background: '#FAFAFA', color: '#1D2129', fontSize: 13, outline: 'none', boxSizing: 'border-box', marginTop: 6 }} />}
                            {avatarPhrases.length > 0 && !isAdding && <div style={{ fontSize: 11, color: '#C9CDD4', marginTop: 6 }}>共{avatarPhrases.length}条话术</div>}
                          </div>
                        )
                      }
                      if (isEditing) return (
                        <div style={{ marginTop: 8 }}>
                          <input value={editDraft} onChange={e => setEditDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') saveEditing(); if (e.key === 'Escape') cancelEditing() }} onBlur={saveEditing} autoFocus placeholder={point.defaultValue || ''} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #3370FF', background: '#FAFAFA', color: '#1D2129', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                      )
                      const displayValue = hasValue ? (currentValue as string) : (point.defaultValue || '')
                      return (
                        <div style={{ marginTop: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 13, color: '#1D2129', padding: '8px 12px', background: '#FAFAFA', borderRadius: 8, flex: 1 }}>{displayValue}</span>
                            {!isReadOnly && <button onClick={() => startEditing(point.id)} style={{ background: 'none', border: 'none', color: '#86909C', fontSize: 14, cursor: 'pointer', padding: '0 4px' }}>✏️</button>}
                          </div>
                          {point.id === 'sp1' && currentBoundAvatar?.tag && (
                            <div style={{ fontSize: 10, color: '#86909C', marginTop: 4 }}>
                              主播说出此词时，自动切换到该形象
                            </div>
                          )}
                        </div>
                      )
                    }

                    return (
                      <div key={point.id} style={{ marginBottom: 16, padding: '12px 14px', borderRadius: 12, background: '#FFFFFF', border: '1px solid #E5E6EB' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span style={{ fontSize: 13, color: '#1D2129', fontWeight: 600 }}>{point.name}</span>
                          {renderLivePreviewButton()}
                        </div>
                        <div style={{ fontSize: 11, color: '#86909C', marginBottom: 6, fontStyle: 'italic' }}>{point.description}</div>
                        {renderLiveValueArea()}
                      </div>
                    )
                  })}
                </div>
            </>
          </>
        ) : !selectedProduct ? (
          <div style={{ textAlign: 'center', color: '#86909C', paddingTop: 100, fontSize: 14 }}>
            ← 请在左侧选择一个商品进行配置
          </div>
        ) : (
          <>
            {/* ---- 形象切换条（有绑定时显示） ---- */}
            {selectedProduct && selectedProduct.boundAvatars.length > 0 ? (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: '#86909C', marginBottom: 6 }}>已绑形象 · 点击切换配置</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  {selectedProduct.boundAvatars.map((ba, idx) => {
                    const av = AVATAR_LIBRARY.find(a => a.id === ba.avatarId)
                    const isSelected = selectedProductAvatarIdx === idx
                    return (
                      <div key={idx} onClick={() => setSelectedProductAvatarIdx(idx)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 8, cursor: 'pointer', flexShrink: 0, background: isSelected ? '#E8F3FF' : '#F7F8FA', border: isSelected ? '1px solid #3370FF' : '1px solid #E5E6EB', transition: 'all 0.15s' }}>
                        <div style={{ width: 22, height: 22, borderRadius: 4, overflow: 'hidden', background: '#F0F0F0', flexShrink: 0 }}>
                          {av && <ChromaKeyImage src={av.preview} alt={av.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                        </div>
                        <span style={{ fontSize: 12, color: isSelected ? '#3370FF' : '#1D2129', fontWeight: isSelected ? 500 : 400 }}>{av?.name || '未知'}</span>
                        <span onClick={e => {
                          e.stopPropagation()
                          setProducts(prev => prev.map(p => p.id === selectedProductId ? { ...p, boundAvatars: p.boundAvatars.filter((_, i) => i !== idx) } : p))
                          if (selectedProductAvatarIdx >= selectedProduct.boundAvatars.length - 1) setSelectedProductAvatarIdx(Math.max(0, selectedProduct.boundAvatars.length - 2))
                        }} style={{ fontSize: 11, color: '#C9CDD4', cursor: 'pointer', marginLeft: 2, lineHeight: 1 }}>✕</span>
                      </div>
                    )
                  })}
                  <button onClick={() => { setBindMode('single'); setShowAvatarSwitch(true) }} style={{ padding: '6px 10px', borderRadius: 8, border: '1px dashed #3370FF', background: 'transparent', color: '#3370FF', fontSize: 12, cursor: 'pointer', flexShrink: 0 }}>+ 再绑一个</button>
                </div>
              </div>
            ) : null}

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
                      <img src={selectedAvatar.preview} alt={selectedAvatar.name}
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
                  {complianceEnabled && <ComplianceSticker />}
                </>
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <div style={{ width: 80, height: 80, borderRadius: '50%', border: '2px dashed #E5E6EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>🎭</div>
                  <span style={{ color: '#86909C', fontSize: 12 }}>点击「选择伴播」选择形象</span>
                </div>
              )}
            </div>

            {/* ---- 合规贴片 ---- */}
            <div style={{ maxWidth: 280, margin: '8px auto 0', borderRadius: 8, background: complianceEnabled ? '#F0F5FF' : '#F7F8FA', border: `1px solid ${complianceEnabled ? '#AAC4FF' : '#E5E6EB'}`, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px' }}>
                <div>
                  <div style={{ fontSize: 12, color: '#1D2129', fontWeight: 500 }}>合规贴片</div>
                  <div style={{ fontSize: 10, color: '#86909C', marginTop: 1 }}>在直播间左下角显示「直播画面中含有 AI 生成」</div>
                </div>
                <Toggle checked={complianceEnabled} onChange={setComplianceEnabled} />
              </div>
            </div>

            {/* ---- 输出到直播伴侣按钮（合规贴片正下方，hover提示） ---- */}
            {selectedAvatar && (
              <div style={{ position: 'relative', maxWidth: 240, margin: '8px auto 0', textAlign: 'center' }}
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

            {/* ---- 形象指定词 ---- */}
            {currentBoundAvatar && (
              <div style={{ marginTop: 16, marginBottom: 12, padding: '10px 14px', borderRadius: 10, background: '#F7FBFF', border: '1px solid #C2D8FF' }}>
                <div style={{ marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: '#1D2129', fontWeight: 600 }}>形象指定词</span>
                </div>
                <input
                  value={currentBoundAvatar.tag || ''}
                  onChange={e => {
                    const val = e.target.value
                    setProducts(prev => prev.map(p => {
                      if (p.id !== selectedProductId) return p
                      const next = [...p.boundAvatars]
                      if (next[selectedProductAvatarIdx]) next[selectedProductAvatarIdx] = { ...next[selectedProductAvatarIdx], tag: val }
                      return { ...p, boundAvatars: next }
                    }))
                  }}
                  placeholder={selectedAvatar?.name || '输入指定词'}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #BAD7FF', fontSize: 13, outline: 'none', color: '#1D2129', background: '#FFFFFF', boxSizing: 'border-box' }}
                />
                {currentBoundAvatar.tag && (() => {
                  const conflict = selectedProduct!.boundAvatars.some((ba, i) => i !== selectedProductAvatarIdx && ba.tag === currentBoundAvatar.tag)
                  return conflict ? (
                    <div style={{ fontSize: 10, color: '#F53F3F', marginTop: 4 }}>⚠ 指定词与其他形象重复，主播说此词时可能触发错误</div>
                  ) : (
                    <div style={{ fontSize: 10, color: '#86909C', marginTop: 4 }}>
                      主播说出此词时，自动切换到该形象
                    </div>
                  )
                })()}
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
                const hasValue = isAutoType ? phrases.length > 0 : !!(currentValue && typeof currentValue === 'string' && currentValue.trim())
                const isReadOnly = point.id === 'sp4' // 伴播展示穿版效果永远只读
                const hasPreview = point.hasPreview

                // 渲染预览/触发按钮
                const renderPreviewButton = () => {
                  if (!hasPreview) return null
                  const isTriggered = triggeredSkill === point.id
                  if (isLive) {
                    return <button
                      onClick={() => triggerSkill(point.id)}
                      disabled={isTriggered}
                      style={{
                        padding: '4px 12px', borderRadius: 6, fontSize: 12, cursor: isTriggered ? 'default' : 'pointer',
                        border: 'none',
                        background: isTriggered ? '#E6F9EF' : '#FF6A00',
                        color: isTriggered ? '#00B42A' : '#fff',
                        fontWeight: 500,
                        transition: 'all 0.2s',
                      }}
                    >{isTriggered ? '✓ 已触发' : '▶ 触发'}</button>
                  }
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

                  // sp3 特殊：全局口令模板 + 本形象换装指定词
                  if (point.id === 'sp3') {
                    return (
                      <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div>

                          {isEditing ? (
                            <input value={editDraft} onChange={e => setEditDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') saveEditing(); if (e.key === 'Escape') cancelEditing() }} onBlur={saveEditing} autoFocus placeholder={point.defaultValue || ''} style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #3370FF', background: '#FAFAFA', color: '#1D2129', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: 13, color: '#1D2129', padding: '7px 10px', background: '#FAFAFA', borderRadius: 6, flex: 1 }}>{getSkillDisplayText('sp3')}</span>
                              <button onClick={() => startEditing('sp3')} style={{ background: 'none', border: 'none', color: '#86909C', fontSize: 14, cursor: 'pointer', padding: '0 4px' }}>✏️</button>
                            </div>
                          )}
                        </div>
                        <div style={{ fontSize: 10, color: '#86909C', marginTop: 4 }}>
                          绑定多个形象时，加说指定词可精准切换
                        </div>
                      </div>
                    )
                  }

                  // 新样式：sp5/sp6/sp7/sp8 标签网格模式
                  if (isNewStyleSkill(point.id)) {
                    const isAdding = addingSkill === point.id
                    return (
                      <div style={{ marginTop: 8 }}>
                        {/* 标签网格 */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                          {phrases.map((phrase: string, idx: number) => (
                            <span key={idx} style={{
                              padding: '6px 12px', borderRadius: 6,
                              background: '#F2F3F5', border: '1px solid #E5E6EB',
                              fontSize: 13, color: '#1D2129', fontWeight: 400,
                              display: 'inline-flex', alignItems: 'center', gap: 6,
                            }}>
                              {phrase}
                              {/* 垃圾桶删除 */}
                              <span
                                onClick={() => removeSkillPhrase(point.id, idx)}
                                style={{ cursor: 'pointer', opacity: 0.6, fontSize: 12 }}
                              >🗑</span>
                            </span>
                          ))}
                          {/* + 添加按钮 */}
                          {!isAdding && (
                            <span
                              onClick={() => setAddingSkill(point.id)}
                              style={{
                                padding: '6px 12px', borderRadius: 6,
                                background: 'transparent', border: '1px solid #E5E6EB',
                                fontSize: 13, color: '#86909C', fontWeight: 400,
                                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4,
                              }}
                            >+</span>
                          )}
                        </div>
                        {/* 添加输入框 */}
                        {isAdding && (
                          <div style={{ marginTop: 6 }}>
                            <input
                              value={addDraft}
                              onChange={e => setAddDraft(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') addSkillPhrase(point.id)
                                if (e.key === 'Escape') { setAddDraft(''); setAddingSkill(null) }
                              }}
                              onBlur={() => { if (addDraft.trim()) addSkillPhrase(point.id); else { setAddDraft(''); setAddingSkill(null) } }}
                              autoFocus
                              placeholder="输入话术后按 Enter 添加"
                              style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #3370FF', background: '#FAFAFA', color: '#1D2129', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                            />
                          </div>
                        )}
                        {/* 话术数量提示 */}
                        {phrases.length > 0 && !isAdding && (
                          <div style={{ fontSize: 11, color: '#C9CDD4', marginTop: 6 }}>共{phrases.length}条话术</div>
                        )}
                      </div>
                    )
                  }

                  // 原样式：其他技能点
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
                        <div style={{ marginTop: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 13, color: '#1D2129', padding: '8px 12px', background: '#FAFAFA', borderRadius: 8, flex: 1 }}>{displayValue}</span>
                            {renderEditButton()}
                          </div>
                          {point.id === 'sp1' && currentBoundAvatar?.tag && (
                            <div style={{ fontSize: 10, color: '#86909C', marginTop: 4 }}>
                              主播说出此词时，自动切换到该形象
                            </div>
                          )}
                        </div>
                      )
                    } else {
                      // 其他智能触发类（非新样式）
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
        addingToLiveSection ? (
          <AvatarSwitchPopup
            currentAvatarId={null}
            onSelect={avatarId => { handleSelectAvatar(avatarId); setShowAvatarSwitch(false); setAddingToLiveSection(false) }}
            onClose={() => { setShowAvatarSwitch(false); setAddingToLiveSection(false) }}
            onGoToManage={() => { setShowAvatarSwitch(false); setAddingToLiveSection(false); onGoToManage?.() }}
          />
        ) : (
          <AvatarSwitchPopup
            currentAvatarId={null}
            onSelect={() => {}}
            onClose={() => setShowAvatarSwitch(false)}
            boundId={selectedProduct?.boundAvatars[0]?.avatarId ?? null}
            currentProductName={selectedProduct?.name}
            onSave={handleSaveProductBindings}
            onGoToManage={() => { setShowAvatarSwitch(false); onGoToManage?.() }}
          />
        )
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
