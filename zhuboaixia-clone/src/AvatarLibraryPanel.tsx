import { TabBar, PanelKey } from './shared'
import React, { useState, useRef, useEffect, useCallback } from 'react'

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
      // 多规则抠绿：覆盖纯绿 + 偏暗/偏亮绿 + 绿幕反射
      if ((g > 90 && g > r * 1.25 && g > b * 1.25) ||
          (g > 120 && g > r + 25 && g > b + 25) ||
          (g > 70 && r < 100 && b < 100 && g > r * 1.4)) {
        // 边缘平滑：根据绿色强度设半透明
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

type Props = { onClose: () => void; onSwitchPanel?: (p: PanelKey) => void; onConfirmConfig?: () => void }

// ============ 数据模型 ============
type ActionItem = {
  id: string
  name: string
  icon: string
  duration: string
}

type OutfitItem = {
  id: string
  name: string
  preview?: string
  defaultStates: { id: string; label: string; selected: boolean }[]
  actions: ActionItem[]
}

type AvatarItem = {
  id: string
  name: string
  category: 'public' | 'custom'
  type: string
  preview: string
  outfits: OutfitItem[]
  selectedOutfit: string
  selectedDefault: string
  // 用于兼容 9:16 / 16:9 的背景色（与原图边缘融合）
  bgColor?: string
}

// ============ 模拟数据（已删直播达人，猫猫公主→榴莲宝贝）============
const AVATARS: AvatarItem[] = [
  {
    id: 'a1', name: '小小', category: 'public', type: '3D 卡通',
    preview: '/avatars/xiaoxiao-dress.jpg',
    bgColor: '#f0e6d6',
    outfits: [
      {
        id: 'o1', name: '春日裙装',
        preview: '/avatars/xiaoxiao-dress.jpg',
        defaultStates: [{ id: 'd1', label: '微晃眨眼', selected: true }, { id: 'd2', label: '微笑摆手', selected: false }],
        actions: [
          { id: 'act1', name: '跳舞', icon: '💃', duration: '8s' },
          { id: 'act2', name: '作揖', icon: '🙇', duration: '3s' },
          { id: 'act3', name: '欢迎', icon: '👋', duration: '4s' },
        ],
      },
      {
        id: 'o2', name: '休闲衬衫',
        preview: '/avatars/xiaoxiao-shirt.jpg',
        defaultStates: [{ id: 'd3', label: '站立思考', selected: true }],
        actions: [
          { id: 'act4', name: '转身', icon: '🔄', duration: '3s' },
          { id: 'act5', name: '鼓掌', icon: '👏', duration: '5s' },
        ],
      },
    ],
    selectedOutfit: 'o1', selectedDefault: 'd1',
  },
  {
    id: 'a2', name: '榴莲宝贝', category: 'public', type: '3D 卡通',
    preview: '/avatars/durian-3d.jpg',
    bgColor: '#fdf6e3',
    outfits: [
      {
        id: 'o3', name: '经典造型',
        preview: '/avatars/durian-3d.jpg',
        defaultStates: [{ id: 'd4', label: '可爱站立', selected: true }, { id: 'd5', label: '轻轻摇晃', selected: false }],
        actions: [
          { id: 'act6', name: '转圈', icon: '🌀', duration: '4s' },
          { id: 'act7', name: 'wink', icon: '😉', duration: '2s' },
        ],
      },
    ],
    selectedOutfit: 'o3', selectedDefault: 'd4',
  },
  {
    id: 'a3', name: '篮球小子', category: 'public', type: '3D 卡通',
    preview: '/avatars/basketball-boy.jpg',
    bgColor: '#e8f0fe',
    outfits: [
      {
        id: 'o4', name: '球衣',
        preview: '/avatars/basketball-boy.jpg',
        defaultStates: [{ id: 'd6', label: '运球站立', selected: true }],
        actions: [
          { id: 'act8', name: '投篮', icon: '⛹️', duration: '5s' },
          { id: 'act9', name: '庆祝', icon: '🎉', duration: '4s' },
        ],
      },
    ],
    selectedOutfit: 'o4', selectedDefault: 'd6',
  },
]

// ============ 颜色系统 ============
const C = {
  blue: '#3370FF',
  blueLight: 'rgba(51,112,255,0.08)',
  orange: '#FF7D00',
  orangeLight: 'rgba(255,125,0,0.08)',
  green: '#00B42A',
  greenLight: 'rgba(0,180,42,0.08)',
  bg: '#F7F8FA',
  card: '#FFFFFF',
  text: '#1D2129',
  textSec: '#86909C',
  textTert: '#C9CDD4',
  border: '#E5E6EB',
  font: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif',
}

// ============ 客服二维码弹窗 ============
function CSModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 320,
          background: '#fff',
          borderRadius: 16,
          padding: '32px 24px 24px',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          fontFamily: C.font,
          position: 'relative',
        }}
      >
        {/* 关闭按钮 */}
        <button onClick={onClose} style={{
          position: 'absolute', top: 12, right: 14,
          background: 'none', border: 'none',
          fontSize: 18, color: C.textSec, cursor: 'pointer',
        }}>✕</button>

        {/* 图标 */}
        <div style={{ fontSize: 40, marginBottom: 12 }}>🎨</div>

        {/* 标题 */}
        <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 8 }}>
          定制专属伴播形象
        </div>

        {/* 描述 */}
        <div style={{ fontSize: 13, color: C.textSec, lineHeight: 1.6, marginBottom: 20 }}>
          我们可以根据您的品牌和直播风格，<br/>
          量身定制独特的伴播形象。扫码联系<br/>
          我们的顾问，了解更多定制方案！
        </div>

        {/* 二维码占位 */}
        <div style={{
          width: 160, height: 160,
          margin: '0 auto 16px',
          borderRadius: 12,
          background: '#F7F8FA',
          border: `1px solid ${C.border}`,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 8,
        }}>
          <div style={{ fontSize: 36 }}>💬</div>
          <div style={{ fontSize: 11, color: C.textSec }}>扫码添加客服微信</div>
          <div style={{
            fontSize: 10, color: C.textTert,
            padding: '2px 8px', background: '#f0f0f0', borderRadius: 4,
          }}>
            WeChat QR Code
          </div>
        </div>


      </div>
    </div>
  )
}

export default function AvatarLibraryPanel({ onClose, onSwitchPanel, onConfirmConfig }: Props) {
  const [avatars] = useState(AVATARS)
  const [selectedId, setSelectedId] = useState('a1')
  const [filter, setFilter] = useState<'all' | 'public' | 'custom'>('all')
  // 造型切换（每个形象独立记忆）
  const [outfitMap, setOutfitMap] = useState<Record<string, string>>(() => {
    const m: Record<string, string> = {}
    avatars.forEach(a => { m[a.id] = a.selectedOutfit })
    return m
  })
  const [showCS, setShowCS] = useState(false)
  // 切换形象前的关联提醒
  const [pendingAvatarId, setPendingAvatarId] = useState<string | null>(null)

  // 模拟：当前已有的绑定配置（实际从全局状态读取）
  const MOCK_BINDINGS = {
    voiceSwitch: { outfitBindings: 2, label: '声控互动：2 条商品造型绑定' },
    autoChat: { fixedChatBindings: 1, label: '智能搭话：1 条固定搭话的造型/动作' },
  }
  const hasBindings = MOCK_BINDINGS.voiceSwitch.outfitBindings > 0 || MOCK_BINDINGS.autoChat.fixedChatBindings > 0

  const selected = avatars.find(a => a.id === selectedId) || avatars[0]
  const currentOutfitId = outfitMap[selected.id] || selected.selectedOutfit
  const currentOutfit = selected.outfits.find(o => o.id === currentOutfitId) || selected.outfits[0]

  // 当前预览图：按选中造型决定
  const currentPreview = currentOutfit.preview || selected.preview

  const filteredAvatars = avatars.filter(a => filter === 'all' || a.category === filter)

  const handleAvatarClick = (avatarId: string) => {
    if (avatarId === selectedId) return
    // 有绑定配置 + 切到不同形象 → 弹提醒
    if (hasBindings) {
      setPendingAvatarId(avatarId)
    } else {
      setSelectedId(avatarId)
    }
  }

  const confirmSwitch = () => {
    if (pendingAvatarId) {
      setSelectedId(pendingAvatarId)
      setPendingAvatarId(null)
      // TODO: 实际清空声控互动的造型绑定 + 智能搭话的造型/动作绑定
    }
  }

  const handleSelectOutfit = (outfitId: string) => {
    setOutfitMap(prev => ({ ...prev, [selected.id]: outfitId }))
  }

  return (
    <div style={{
      position: 'absolute',
      top: 36,
      right: 0,
      bottom: 0,
      width: 520,
      zIndex: 102,
      overflow: 'hidden',
      borderRadius: '8px 0 0 0',
      boxShadow: '-2px 0 16px rgba(0,0,0,0.15)',
      fontFamily: C.font,
      display: 'flex',
      flexDirection: 'column',
      background: C.bg,
    }}>
      {/* ===== 顶栏标题 + 关闭 ===== */}
      <div style={{
        padding: '10px 16px', background: C.card, display: 'flex',
        alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
      }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: C.text }}>🎭 伴播形象</span>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', fontSize: 18, color: C.textSec,
          cursor: 'pointer', padding: 4,
        }}>x</button>
      </div>
      {onSwitchPanel && <TabBar active="avatar" onSwitch={onSwitchPanel} />}



      {/* ===== 分类标签 ===== */}
      <div style={{
        padding: '10px 16px',
        background: C.card,
        borderBottom: `1px solid ${C.border}`,
        display: 'flex',
        gap: 8,
        flexShrink: 0,
      }}>
        {[
          { key: 'all' as const, label: '全部', count: avatars.length },
          { key: 'public' as const, label: '公共可用', count: avatars.filter(a => a.category === 'public').length },
          { key: 'custom' as const, label: '私人定制', count: avatars.filter(a => a.category === 'custom').length },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              padding: '5px 14px',
              borderRadius: 16,
              border: 'none',
              fontSize: 13,
              fontWeight: filter === tab.key ? 500 : 400,
              background: filter === tab.key ? C.blueLight : 'transparent',
              color: filter === tab.key ? C.blue : C.textSec,
              cursor: 'pointer',
              fontFamily: C.font,
            }}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* ===== 主体：左侧网格 + 右侧详情 ===== */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* 左侧：形象网格 */}
        <div style={{
          width: 180,
          borderRight: `1px solid ${C.border}`,
          overflowY: 'auto',
          padding: '10px',
          flexShrink: 0,
        }}>
          {filteredAvatars.map(avatar => (
            <div
              key={avatar.id}
              onClick={() => handleAvatarClick(avatar.id)}
              style={{
                padding: '10px',
                borderRadius: 8,
                marginBottom: 6,
                cursor: 'pointer',
                background: selectedId === avatar.id ? C.blueLight : 'transparent',
                border: selectedId === avatar.id ? `1.5px solid ${C.blue}` : '1.5px solid transparent',
                transition: 'all 0.15s',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 8,
                  overflow: 'hidden',
                  background: '#FFFFFF',
                  flexShrink: 0,
                }}>
                  <ChromaKeyImage
                    src={avatar.preview}
                    alt={avatar.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    draggable={false}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{avatar.name}</div>
                  <div style={{ fontSize: 11, color: C.textSec }}>{avatar.type}</div>
                </div>
              </div>
              {selectedId === avatar.id && (
                <div style={{
                  position: 'absolute', top: 6, right: 6,
                  width: 16, height: 16, borderRadius: '50%',
                  background: C.blue, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 10, fontWeight: 700,
                }}>✓</div>
              )}
            </div>
          ))}

          {/* 添加定制形象按钮 → 打开客服弹窗 */}
          <div
            onClick={() => setShowCS(true)}
            style={{
              padding: '12px 10px',
              borderRadius: 8,
              border: `1.5px dashed ${C.border}`,
              textAlign: 'center',
              cursor: 'pointer',
              marginTop: 4,
              transition: 'border-color 0.15s',
            }}
          >
            <span style={{ fontSize: 18, color: C.textTert }}>+</span>
            <div style={{ fontSize: 11, color: C.textTert, marginTop: 2 }}>添加定制形象</div>
          </div>
        </div>

        {/* 右侧：详情面板 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>
          {/* 形象预览区 — 白色背景，兼容 9:16 / 16:9 */}
          <div style={{
            width: '100%',
            aspectRatio: '9/16',
            maxHeight: 240,
            background: '#FFFFFF',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 14,
            position: 'relative',
            overflow: 'hidden',
            border: `1px solid ${C.border}`,
          }}>
            <ChromaKeyImage
              src={currentPreview}
              alt={selected.name}
              style={{
                // 兼容不同比例：统一用 contain，max-height + max-width 双约束
                maxHeight: '92%',
                maxWidth: '92%',
                objectFit: 'contain',
              }}
              draggable={false}
            />
            {/* 循环播放标记 */}
            <div style={{
              position: 'absolute', bottom: 8, right: 8,
              background: 'rgba(0,0,0,0.6)', borderRadius: 4,
              padding: '3px 8px', fontSize: 10, color: 'rgba(255,255,255,0.8)',
            }}>
              🔁 {currentOutfit.name}
            </div>
            {/* 形象名称 */}
            <div style={{
              position: 'absolute', top: 8, left: 8,
              background: 'rgba(0,0,0,0.6)', borderRadius: 4,
              padding: '3px 8px', fontSize: 11, color: 'rgba(255,255,255,0.8)',
              fontWeight: 500,
            }}>
              {selected.name}
            </div>
          </div>

          {/* 第二层：造型选择（点击切换预览图） */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8 }}>
              造型
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {selected.outfits.map(outfit => (
                <button
                  key={outfit.id}
                  onClick={() => handleSelectOutfit(outfit.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 6,
                    border: outfit.id === currentOutfitId
                      ? `1.5px solid ${C.blue}` : `1px solid ${C.border}`,
                    background: outfit.id === currentOutfitId
                      ? C.blueLight : C.card,
                    color: outfit.id === currentOutfitId ? C.blue : C.text,
                    fontSize: 12,
                    fontWeight: outfit.id === currentOutfitId ? 500 : 400,
                    cursor: 'pointer',
                    fontFamily: C.font,
                    transition: 'all 0.15s',
                  }}
                >
                  {outfit.name}
                </button>
              ))}
            </div>
          </div>

          {/* 第三层之一：默认状态 */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8 }}>
              默认状态
              <span style={{ fontSize: 11, fontWeight: 400, color: C.textSec, marginLeft: 6 }}>
                （10-15秒循环素材，形象无动作时的自然状态）
              </span>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {currentOutfit.defaultStates.map(state => (
                <button
                  key={state.id}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 6,
                    border: state.selected
                      ? `1.5px solid ${C.green}` : `1px solid ${C.border}`,
                    background: state.selected
                      ? C.greenLight : C.card,
                    color: state.selected ? C.green : C.text,
                    fontSize: 12,
                    cursor: 'pointer',
                    fontFamily: C.font,
                  }}
                >
                  {state.selected && '🟢 '}{state.label}
                </button>
              ))}
            </div>
          </div>

          {/* 第三层之二：动作分支 */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8 }}>
              动作分支
              <span style={{ fontSize: 11, fontWeight: 400, color: C.textSec, marginLeft: 6 }}>
                （触发后短暂播放，完成后自动切回默认状态）
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {currentOutfit.actions.map(action => (
                <div
                  key={action.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    background: C.card,
                    border: `1px solid ${C.border}`,
                    borderRadius: 8,
                  }}
                >
                  <span style={{ fontSize: 20 }}>{action.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{action.name}</div>
                    <div style={{ fontSize: 11, color: C.textSec }}>时长 {action.duration}</div>
                  </div>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: C.green, boxShadow: '0 0 6px rgba(0,180,42,0.4)',
                  }}/>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===== 底部操作栏 ===== */}
      <div style={{
        padding: '12px 16px',
        background: C.card,
        borderTop: `1px solid ${C.border}`,
        display: 'flex',
        gap: 10,
        flexShrink: 0,
      }}>
        <button style={{
          flex: 1, height: 42, borderRadius: 8,
          background: 'transparent', border: `1px solid ${C.border}`,
          color: C.textSec, fontSize: 14, cursor: 'pointer',
          fontFamily: C.font,
        }}>
          取消
        </button>
        <button onClick={onConfirmConfig} style={{
          flex: 2, height: 42, borderRadius: 8,
          background: C.blue, border: 'none',
          color: '#fff', fontSize: 14, fontWeight: 600,
          cursor: 'pointer', fontFamily: C.font,
          boxShadow: '0 2px 8px rgba(51,112,255,0.3)',
        }}>
          确认配置
        </button>
      </div>

      {/* 客服弹窗 */}
      {showCS && <CSModal onClose={() => setShowCS(false)} />}

      {/* ===== 切换形象关联提醒弹窗 ===== */}
      {pendingAvatarId && (() => {
        const targetAvatar = avatars.find(a => a.id === pendingAvatarId)
        if (!targetAvatar) return null
        return (
          <div
            onClick={() => setPendingAvatarId(null)}
            style={{
              position: 'absolute', inset: 0, zIndex: 200,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                width: 340, background: '#fff', borderRadius: 14,
                padding: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                fontFamily: C.font,
              }}
            >
              {/* 图标 + 标题 */}
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>⚠️</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 4 }}>
                  切换形象确认
                </div>
                <div style={{ fontSize: 12, color: C.textSec, lineHeight: 1.5 }}>
                  切换到「{targetAvatar.name}」后，以下配置将<span style={{ color: '#FF7D00', fontWeight: 600 }}>失效</span>：
                </div>
              </div>

              {/* 失效清单 */}
              <div style={{
                padding: '10px 14px', borderRadius: 8,
                background: '#FFF7E6', border: '1px solid #FFE58F',
                marginBottom: 14,
              }}>
                {MOCK_BINDINGS.voiceSwitch.outfitBindings > 0 && (
                  <div style={{ fontSize: 12, color: '#B8860B', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 3, background: '#FFE58F' }}>声控互动</span>
                    {MOCK_BINDINGS.voiceSwitch.outfitBindings} 条商品造型绑定
                  </div>
                )}
                {MOCK_BINDINGS.autoChat.fixedChatBindings > 0 && (
                  <div style={{ fontSize: 12, color: '#B8860B', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 3, background: '#FFE58F' }}>智能搭话</span>
                    {MOCK_BINDINGS.autoChat.fixedChatBindings} 条固定搭话的造型/动作
                  </div>
                )}
              </div>

              {/* 不受影响 */}
              <div style={{
                padding: '8px 14px', borderRadius: 8,
                background: '#F0FAF0', border: '1px solid #A5D6A7',
                marginBottom: 18,
              }}>
                <div style={{ fontSize: 11, color: '#2E7D32', lineHeight: 1.6 }}>
                  ✅ 不受影响：频率、话术模板、场景装修素材
                </div>
              </div>

              {/* 按钮 */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setPendingAvatarId(null)} style={{
                  flex: 1, height: 40, borderRadius: 8,
                  background: 'transparent', border: `1px solid ${C.border}`,
                  color: C.textSec, fontSize: 13, cursor: 'pointer', fontFamily: C.font,
                }}>取消</button>
                <button onClick={confirmSwitch} style={{
                  flex: 2, height: 40, borderRadius: 8,
                  background: '#FF7D00', border: 'none',
                  color: '#fff', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', fontFamily: C.font,
                  boxShadow: '0 2px 8px rgba(255,125,0,0.3)',
                }}>确认切换并清空绑定</button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
