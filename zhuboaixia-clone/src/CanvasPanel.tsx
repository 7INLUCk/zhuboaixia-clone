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

// ============ 视频片段预览弹窗（单视频版） ============
function VideoPreviewPopup({ videoUrl, title, avatarName, onClose }: {
  videoUrl: string; title: string; avatarName: string; onClose: () => void
}) {
  const [outputting, setOutputting] = useState(false)
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
      <div style={{ position: 'relative', zIndex: 1, width: 360, maxHeight: '85vh', background: '#fff', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
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
            <ChromaKeyVideo src={videoUrl} autoPlay loop
              style={{ maxHeight: 380, borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} />
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.3 }}>🎬</div>
              <div style={{ color: '#86909C', fontSize: 14 }}>暂无视频素材</div>
            </div>
          )}
        </div>
        {/* 底部操作栏 */}
        <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F0F0F0' }}>
          <button onClick={onClose} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid #E5E6EB', background: '#fff', color: '#86909C', fontSize: 13, cursor: 'pointer' }}>关闭</button>
          <button onClick={() => setOutputting(!outputting)} style={{
            padding: '8px 20px', borderRadius: 8, border: 'none',
            background: outputting ? '#F53F3F' : '#3370FF',
            color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            transition: 'all 0.2s',
          }}>
            {outputting ? '⏹ 停止输出' : '🚀 输出到直播伴侣'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ============ 批量配置弹窗 ============
function BatchConfigPopup({ selectedCount, onClose, onApply }: {
  selectedCount: number; onClose: () => void; onApply: (avatarId: string, cmds: GlobalCommands) => void
}) {
  const [avatarId, setAvatarId] = useState('')
  const [cmds, setCmds] = useState<GlobalCommands>({ entrance: '有请模特上场', exit: '请模特先下场', switch: '看看{N}号链接的模特上身效果' })
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
      <div style={{ position: 'relative', zIndex: 1, width: 420, background: '#fff', borderRadius: 16, overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #F0F0F0' }}>
          <div style={{ color: '#1D2129', fontWeight: 600, fontSize: 15 }}>批量配置伴播</div>
          <div style={{ color: '#86909C', fontSize: 12, marginTop: 4 }}>将为 {selectedCount} 个商品统一配置</div>
        </div>
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* 选形象 */}
          <div>
            <div style={{ color: '#1D2129', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>选择伴播形象</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {AVATAR_LIBRARY.map(av => (
                <div key={av.id} onClick={() => setAvatarId(av.id)} style={{
                  padding: 8, borderRadius: 8, cursor: 'pointer', textAlign: 'center',
                  border: avatarId === av.id ? '2px solid #3370FF' : '1px solid #E5E6EB',
                  background: avatarId === av.id ? '#E8F0FE' : '#fff',
                  transition: 'all 0.15s',
                }}>
                  <div style={{ width: 60, height: 80, margin: '0 auto 6px', borderRadius: 6, overflow: 'hidden', background: '#F0F0F0' }}>
                    {av.preview.endsWith('.mp4') ? (
                      <ChromaKeyVideo src={av.preview} autoPlay loop muted style={{ width: '100%', height: '100%' }} />
                    ) : (
                      <ChromaKeyImage src={av.preview} alt={av.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: '#1D2129', fontWeight: 500 }}>{av.name}</div>
                  <div style={{ fontSize: 9, color: av.voiceTier === 'premium' ? '#69B1FF' : '#34D399', marginTop: 2 }}>{av.voiceTier === 'premium' ? '🔵可搭话' : '🟢标准'}</div>
                </div>
              ))}
            </div>
          </div>
          {/* 口令配置 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { key: 'entrance' as const, label: '入场口令', placeholder: '有请模特上场' },
              { key: 'exit' as const, label: '退场口令', placeholder: '请模特先下场' },
              { key: 'switch' as const, label: '直切口令', placeholder: '看看{N}号链接的模特上身效果' },
            ].map(item => (
              <div key={item.key}>
                <div style={{ color: '#86909C', fontSize: 12, marginBottom: 4 }}>{item.label}</div>
                <input value={cmds[item.key]} onChange={e => setCmds(prev => ({ ...prev, [item.key]: e.target.value }))}
                  placeholder={item.placeholder}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #E5E6EB', background: '#FAFAFA', color: '#1D2129', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'flex-end', gap: 8, borderTop: '1px solid #F0F0F0' }}>
          <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #E5E6EB', background: 'transparent', color: '#86909C', fontSize: 13, cursor: 'pointer' }}>取消</button>
          <button onClick={() => { if (avatarId) onApply(avatarId, cmds) }} style={{
            padding: '8px 20px', borderRadius: 8, border: 'none',
            background: avatarId ? '#3370FF' : '#555', color: '#fff', fontSize: 13, fontWeight: 600, cursor: avatarId ? 'pointer' : 'not-allowed',
          }}>一键应用</button>
        </div>
      </div>
    </div>
  )
}

// ============ 形象选择弹窗 ============
function AvatarSwitchPopup({ currentAvatarId, onSelect, onClose }: {
  currentAvatarId: string | null; onSelect: (id: string) => void; onClose: () => void
}) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
      <div style={{ position: 'relative', zIndex: 1, width: 520, background: '#fff', borderRadius: 16, overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #F0F0F0' }}>
          <div style={{ color: '#1D2129', fontWeight: 600, fontSize: 15 }}>选择伴播形象</div>
          {currentAvatarId && <div style={{ color: '#FF7D00', fontSize: 12, marginTop: 4 }}>⚠️ 切换形象后，当前形象的特殊动作和搭话规则将被替换</div>}
        </div>
        <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, maxHeight: 400, overflowY: 'auto' }}>
          {AVATAR_LIBRARY.map(av => (
            <div key={av.id} onClick={() => { onSelect(av.id); onClose() }} style={{
              padding: 12, borderRadius: 12, cursor: 'pointer',
              border: currentAvatarId === av.id ? '2px solid #3370FF' : '1px solid rgba(255,255,255,0.1)',
              background: currentAvatarId === av.id ? 'rgba(51,112,255,0.15)' : '#FAFAFA',
              textAlign: 'center', transition: 'all 0.2s',
            }}>
              <div style={{ width: 80, height: 120, margin: '0 auto 8px', borderRadius: 8, overflow: 'hidden', background: '#2a2a3e' }}>
                {av.preview.endsWith('.mp4') ? (
                  <ChromaKeyVideo src={av.preview} autoPlay loop muted style={{ width: '100%', height: '100%' }} />
                ) : (
                  <ChromaKeyImage src={av.preview} alt={av.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </div>
              <div style={{ color: '#1D2129', fontSize: 12, fontWeight: 500 }}>{av.name}</div>
              <div style={{ marginTop: 4 }}>
                <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4,
                  background: av.voiceTier === 'premium' ? 'rgba(51,112,255,0.15)' : 'rgba(0,180,42,0.15)',
                  color: av.voiceTier === 'premium' ? '#69B1FF' : '#34D399',
                }}>{av.voiceTier === 'premium' ? '🔵可搭话' : '🟢标准'}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: '12px 20px', textAlign: 'right', borderTop: '1px solid #F0F0F0' }}>
          <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #E5E6EB', background: 'transparent', color: '#86909C', fontSize: 13, cursor: 'pointer' }}>取消</button>
        </div>
      </div>
    </div>
  )
}



// ============ 主组件 ============
export default function CanvasPanel({ onClose }: Props) {
  const [products, setProducts] = useState<ProductItem[]>(PRODUCTS_INIT)
  const [selectedProductId, setSelectedProductId] = useState<string | null>('p2')
  const [globalCommands, setGlobalCommands] = useState<GlobalCommands>({
    entrance: '有请模特上场',
    exit: '请模特先下场',
    switch: '看看{N}号链接的模特上身效果',
  })

  // 批量选择
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set())
  const [showBatchConfig, setShowBatchConfig] = useState(false)

  // 弹窗
  const [showAvatarSwitch, setShowAvatarSwitch] = useState(false)
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

  // 批量选择处理
  const toggleProductSelect = (id: string) => {
    setSelectedProductIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  const toggleSelectAll = () => {
    if (selectedProductIds.size === products.length) {
      setSelectedProductIds(new Set())
    } else {
      setSelectedProductIds(new Set(products.map(p => p.id)))
    }
  }

  // 批量配置应用
  const handleBatchApply = (avatarId: string, cmds: GlobalCommands) => {
    setProducts(prev => prev.map(p =>
      selectedProductIds.has(p.id) ? { ...p, boundAvatarId: avatarId } : p
    ))
    setGlobalCommands(cmds)
    setSelectedProductIds(new Set())
    setShowBatchConfig(false)
  }

  // 绑定/切换形象
  const handleSelectAvatar = (avatarId: string) => {
    if (!selectedProductId) return
    setProducts(prev => prev.map(p =>
      p.id === selectedProductId ? { ...p, boundAvatarId: avatarId } : p
    ))
  }

  // 打开预览弹窗
  const openPreview = (type: 'entrance' | 'exit') => {
    if (!selectedAvatar) return
    const eaList = EVENT_ACTIONS[selectedAvatar.id] || []
    const ea = eaList.find(a => a.id === (type === 'entrance' ? 'ea_entrance' : 'ea_exit'))
    setPreviewPopup({
      title: type === 'entrance' ? '入场动画预览' : '退场动画预览',
      videoUrl: ea?.videoUrl || '',
      avatarName: selectedAvatar.name,
    })
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
      display: 'flex', height: '100%', fontFamily: C.font,
      background: '#FFFFFF', borderRadius: 12, overflow: 'hidden',
    }}>
      {/* ==================== 左列：直播商品列表（约300px） ==================== */}
      <div style={{
        width: 300, flexShrink: 0,
        background: '#FAFAFA', display: 'flex', flexDirection: 'column',
        position: 'relative', overflow: 'hidden',
        boxShadow: '1px 0 0 #F0F0F0',
      }}>
        {/* 顶部标题 */}
        <div style={{ padding: '12px 16px', background: '#F7F8FA', borderBottom: '1px solid #F0F0F0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#1D2129' }}>直播商品</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" checked={selectedProductIds.size === products.length && products.length > 0}
                onChange={toggleSelectAll}
                style={{ accentColor: '#3370FF', cursor: 'pointer' }} />
              <span style={{ fontSize: 11, color: '#86909C' }}>全选</span>
            </div>
          </div>
          <div style={{ fontSize: 10, color: '#86909C' }}>
            {products.length} 个商品 · {products.filter(p => p.boundAvatarId).length} 个已绑定
          </div>
        </div>

        {/* 商品列表 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
          {products.map(p => {
            const isSelected = selectedProductId === p.id
            const isBatchChecked = selectedProductIds.has(p.id)
            const hasAvatar = !!p.boundAvatarId
            return (
              <div key={p.id} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '10px 12px', marginBottom: 4, borderRadius: 10, cursor: 'pointer',
                background: isSelected ? 'rgba(51,112,255,0.12)' : '#FAFAFA',
                border: isSelected ? '1px solid rgba(51,112,255,0.3)' : '1px solid transparent',
                transition: 'all 0.15s',
              }}>
                {/* 复选框 */}
                <input type="checkbox" checked={isBatchChecked}
                  onChange={() => toggleProductSelect(p.id)}
                  onClick={e => e.stopPropagation()}
                  style={{ marginTop: 4, accentColor: '#3370FF', cursor: 'pointer', flexShrink: 0 }} />
                {/* 缩略图 */}
                <div style={{
                  width: 56, height: 56, borderRadius: 8, flexShrink: 0,
                  background: 'linear-gradient(135deg, #fce7f3 0%, #ede9fe 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                }}>👕</div>
                {/* 信息 */}
                <div style={{ flex: 1, minWidth: 0 }} onClick={() => handleSelectProductAndScroll(p.id)}>
                  <div style={{ fontSize: 13, color: '#1D2129', fontWeight: 500, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: '#F53F3F', fontWeight: 600, marginTop: 4 }}>{p.price}</div>
                  <div style={{ marginTop: 6 }}>
                    <span style={{
                      fontSize: 10, padding: '2px 8px', borderRadius: 4,
                      background: hasAvatar ? 'rgba(0,180,42,0.15)' : 'rgba(134,144,156,0.15)',
                      color: hasAvatar ? '#34D399' : '#86909C',
                    }}>{hasAvatar ? '已绑定' : '未绑'}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* 批量操作栏 */}
        {selectedProductIds.size > 0 ? (
          <div style={{
            padding: '12px 16px', background: 'rgba(51,112,255,0.1)',
            borderTop: '1px solid rgba(51,112,255,0.2)', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 12, color: '#69B1FF' }}>已选 {selectedProductIds.size} 个商品</span>
            <button onClick={() => setShowBatchConfig(true)} style={{
              padding: '6px 14px', borderRadius: 6, border: 'none',
              background: '#3370FF', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}>批量配置伴播</button>
          </div>
        ) : (
          <div style={{
            padding: '10px 16px', flexShrink: 0,
            borderTop: '1px solid #F0F0F0',
            fontSize: 11, color: '#86909C', textAlign: 'center',
          }}>
            💡 勾选左侧商品 → 可批量配置伴播形象
          </div>
        )}
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
              <button onClick={() => setShowAvatarSwitch(true)} style={{
                padding: '6px 14px', borderRadius: 6,
                border: '1px solid rgba(51,112,255,0.3)', background: 'transparent',
                color: '#69B1FF', fontSize: 12, cursor: 'pointer',
              }}>{selectedAvatar ? '更换伴播' : '选择伴播'}</button>
            </div>

            {/* ---- 视频预览窗口 ---- */}
            <div style={{
              width: '100%', maxWidth: 240, margin: '0 auto 12px',
              aspectRatio: '9/16', borderRadius: 12, overflow: 'hidden',
              background: '#F7F8FA', position: 'relative',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            }}>
              {selectedAvatar ? (
                <>
                  {/* 视频预览区域 */}
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ChromaKeyImage src={selectedAvatar.preview} alt={selectedAvatar.name}
                      style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                  </div>
                  {/* 状态标签 */}
                  <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 4 }}>
                    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: 'rgba(0,0,0,0.5)', color: '#F53F3F', fontWeight: 600 }}>LIVE</span>
                  </div>
                  {/* 形象名称 */}
                  <div style={{ position: 'absolute', bottom: 8, right: 8, fontSize: 10, color: '#86909C' }}>{selectedAvatar.name}</div>
                </>
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <div style={{ width: 80, height: 80, borderRadius: '50%', border: '2px dashed #E5E6EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>🎭</div>
                  <span style={{ color: '#86909C', fontSize: 12 }}>点击「选择伴播」选择形象</span>
                </div>
              )}
            </div>

            {/* ---- 预览按钮行 ---- */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, justifyContent: 'center' }}>
              <button onClick={() => openPreview('entrance')} disabled={!selectedAvatar} style={{
                padding: '6px 14px', borderRadius: 8,
                border: '1px solid rgba(51,112,255,0.3)', background: 'transparent',
                color: selectedAvatar ? '#69B1FF' : '#C9CDD4', fontSize: 12, cursor: selectedAvatar ? 'pointer' : 'not-allowed',
              }}>🎬 入场动画 预览</button>
              <button onClick={() => openPreview('exit')} disabled={!selectedAvatar} style={{
                padding: '6px 14px', borderRadius: 8,
                border: '1px solid rgba(255,125,0,0.3)', background: 'transparent',
                color: selectedAvatar ? '#FF9A4D' : '#C9CDD4', fontSize: 12, cursor: selectedAvatar ? 'pointer' : 'not-allowed',
              }}>🚪 退场动画 预览</button>
            </div>

            {/* ---- 技能点 ---- */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ color: '#1D2129', fontWeight: 600, fontSize: 14, marginBottom: 12 }}>技能点 <span style={{ fontSize: 11, fontWeight: 400, color: '#86909C' }}>（所有形象 & 商品 通用）</span></div>
              {/* 入场 */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: '#69B1FF', fontWeight: 500 }}>入场</span>
                </div>
                <input value={globalCommands.entrance}
                  onChange={e => setGlobalCommands(prev => ({ ...prev, entrance: e.target.value }))}
                  placeholder="有请模特上场"
                  style={{
                    width: '100%', padding: '8px 12px', borderRadius: 8,
                    border: '1px solid #E5E6EB', background: '#FAFAFA',
                    color: '#1D2129', fontSize: 13, outline: 'none', boxSizing: 'border-box',
                  }} />
                <div style={{ fontSize: 11, color: '#86909C', marginTop: 4, fontStyle: 'italic' }}>
                  系统找「讲解中商品」→ 找到绑定的形象 → 播放入场动画
                </div>
              </div>
              {/* 退场 */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: '#FF9A4D', fontWeight: 500 }}>退场</span>
                </div>
                <input value={globalCommands.exit}
                  onChange={e => setGlobalCommands(prev => ({ ...prev, exit: e.target.value }))}
                  placeholder="请模特先下场"
                  style={{
                    width: '100%', padding: '8px 12px', borderRadius: 8,
                    border: '1px solid #E5E6EB', background: '#FAFAFA',
                    color: '#1D2129', fontSize: 13, outline: 'none', boxSizing: 'border-box',
                  }} />
                <div style={{ fontSize: 11, color: '#86909C', marginTop: 4, fontStyle: 'italic' }}>
                  屏幕上的形象 → 播放退场动画 → 离场
                </div>
              </div>
              {/* 直切 */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: '#FBBF24', fontWeight: 500 }}>直切</span>
                </div>
                <input value={globalCommands.switch}
                  onChange={e => setGlobalCommands(prev => ({ ...prev, switch: e.target.value }))}
                  placeholder="看看{N}号链接的模特上身效果"
                  style={{
                    width: '100%', padding: '8px 12px', borderRadius: 8,
                    border: '1px solid #E5E6EB', background: '#FAFAFA',
                    color: '#1D2129', fontSize: 13, outline: 'none', boxSizing: 'border-box',
                  }} />
                <div style={{ fontSize: 11, color: '#86909C', marginTop: 4, fontStyle: 'italic' }}>
                  口令含链接号 → 直接切到该链接形象，同时自动把讲解中状态挪到该商品
                </div>
              </div>
              {/* 展示（只读） */}
              <div style={{
                padding: '10px 14px', borderRadius: 8, marginBottom: 14,
                background: '#FAFAFA', border: '1px solid #F0F0F0',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: '#86909C', fontWeight: 500 }}>展示</span>
                  <span style={{ fontSize: 12, color: '#86909C', fontStyle: 'italic' }}>自动触发</span>
                </div>
                <div style={{ fontSize: 11, color: '#C9CDD4', marginTop: 4, fontStyle: 'italic' }}>
                  讲解中商品切换时，系统自动退旧形象+入场新形象
                </div>
              </div>

              {/* ---- 默认展示态 ---- */}
              {selectedAvatar && normalStates.length > 0 && (
                <div style={{
                  padding: '12px 14px', borderRadius: 10, marginBottom: 14,
                  background: '#F7F8FA', border: '1px solid #F0F0F0',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: '#1D2129', fontWeight: 500 }}>🔄 默认展示态</span>
                    <span style={{ fontSize: 11, color: '#86909C' }}>共 {normalStates.length} 个动作轮播</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#86909C', marginBottom: 8, lineHeight: 1.5 }}>
                    形象在无指令时，从以下动作中随机抽取轮播展示，保持直播间生动感。
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {normalStates.map(ns => (
                      <div key={ns.id} style={{
                        padding: '4px 10px', borderRadius: 6, fontSize: 11,
                        background: '#fff', border: '1px solid #E5E6EB',
                        color: '#4E5969',
                      }}>
                        {ns.icon} {ns.label} <span style={{ color: '#C9CDD4', fontSize: 10 }}>{ns.duration}s</span>
                      </div>
                    ))}
                  </div>
                  {normalStates[0]?.videoUrl && (
                    <div style={{ marginTop: 8 }}>
                      <button onClick={() => setPreviewPopup({ title: '默认展示态预览', videoUrl: normalStates[0].videoUrl || '', avatarName: selectedAvatar.name })} style={{
                        padding: '5px 12px', borderRadius: 6, border: '1px solid #E5E6EB',
                        background: '#fff', color: '#86909C', fontSize: 11, cursor: 'pointer',
                      }}>预览</button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ---- 形象专属能力 ---- */}
            {selectedAvatar && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ color: '#1D2129', fontWeight: 600, fontSize: 14, marginBottom: 12 }}>形象专属能力</div>
                {/* 特殊动作 */}
                {eventActions.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ color: '#ccc', fontSize: 12, marginBottom: 8 }}>🎬 特殊动作</div>
                    {eventActions.map(ea => (
                      <div key={ea.id} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '8px 12px', marginBottom: 4, borderRadius: 8,
                        background: '#FAFAFA',
                      }}>
                        <Toggle checked={selectedAvatar && enabledActionIds[selectedAvatar.id]?.has(ea.id)} onChange={() => selectedAvatar && toggleActionEnabled(selectedAvatar.id, ea.id)} />
                        <button onClick={() => openActionPreview(ea)} style={{
                          padding: '4px 10px', borderRadius: 6, border: '1px solid #E5E6EB',
                          background: '#fff', color: '#86909C', fontSize: 11, cursor: 'pointer',
                        }}>预览</button>
                        <div style={{ flex: 1 }}>
                          <span style={{ color: '#1D2129', fontSize: 12 }}>{ea.label}</span>
                          <span style={{ color: '#666', fontSize: 11, marginLeft: 6 }}>{ea.duration}s</span>
                        </div>
                        <input placeholder="触发口令" style={{
                          width: 120, padding: '4px 8px', borderRadius: 6,
                          border: '1px solid #E5E6EB', background: '#FAFAFA',
                          color: '#1D2129', fontSize: 11, outline: 'none',
                        }} />
                      </div>
                    ))}
                  </div>
                )}
                {/* 搭话能力 */}
                {isPremium ? (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ color: '#ccc', fontSize: 12 }}>💬 搭话能力</span>
                      <Toggle checked={selectedProduct.chatEnabled} onChange={v => {
                        setProducts(prev => prev.map(p => p.id === selectedProductId ? { ...p, chatEnabled: v } : p))
                      }} />
                    </div>
                    {selectedProduct.chatEnabled && (
                      <div style={{ paddingLeft: 8 }}>
                        {selectedProduct.chatRules.map(rule => (
                          <div key={rule.id} style={{
                            display: 'flex', gap: 8, marginBottom: 6, padding: '6px 10px',
                            borderRadius: 6, background: '#FAFAFA',
                          }}>
                            <span style={{ color: '#FBBF24', fontSize: 11, flexShrink: 0 }}>触发：</span>
                            <span style={{ color: '#1D2129', fontSize: 11, flex: 1 }}>{rule.trigger}</span>
                            <span style={{ color: '#86909C', fontSize: 11 }}>→</span>
                            <span style={{ color: '#ccc', fontSize: 11, flex: 1.5 }}>{rule.response}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ padding: '10px 14px', borderRadius: 8, background: '#FAFAFA', color: '#86909C', fontSize: 12, fontStyle: 'italic' }}>
                    🔇 该形象不支持搭话，如需请升级
                  </div>
                )}
              </div>
            )}

            </>
        )}
      </div>

      {/* ==================== 弹窗 ==================== */}
      {showBatchConfig && (
        <BatchConfigPopup selectedCount={selectedProductIds.size}
          onClose={() => setShowBatchConfig(false)}
          onApply={handleBatchApply} />
      )}
      {showAvatarSwitch && (
        <AvatarSwitchPopup currentAvatarId={selectedProduct?.boundAvatarId || null}
          onSelect={handleSelectAvatar}
          onClose={() => setShowAvatarSwitch(false)} />
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
