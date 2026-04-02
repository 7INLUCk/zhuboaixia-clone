import React, { useState, useRef, useCallback, useEffect } from 'react'
import { TabBar, C, Toggle, PanelKey } from './shared'

type Props = { onClose: () => void; onSwitchPanel?: (p: PanelKey) => void; onConfirmConfig?: () => void }
type SubTab = 'scene' | 'voiceSwitch'

// ============ 声控切镜数据模型 ============
type SwitchTag = {
  id: string
  label: string
  imageSrc?: string   // 绿幕素材图片
  isDefault?: boolean // 默认不可删除的标签
}

const DEFAULT_TAGS: SwitchTag[] = [
  { id: 't1', label: '站立', imageSrc: undefined, isDefault: true },
  { id: 't2', label: '坐着', imageSrc: undefined, isDefault: true },
  { id: 't3', label: '跳舞', imageSrc: undefined, isDefault: true },
  { id: 't4', label: '讲话', imageSrc: undefined, isDefault: true },
  { id: 't5', label: '挥手', imageSrc: undefined, isDefault: true },
  { id: 't6', label: '吃东西', imageSrc: undefined, isDefault: true },
]

const MAX_TAGS = 6

// ============ Chroma Key 组件 ============
function ChromaKeyImg({ src, style }: { src: string; style?: React.CSSProperties }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) return
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      ctx.drawImage(img, 0, 0)
      const d = ctx.getImageData(0, 0, canvas.width, canvas.height).data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const dd = imageData.data
      for (let i = 0; i < dd.length; i += 4) {
        const r = dd[i], g = dd[i + 1], b = dd[i + 2]
        // 宽松抠绿：覆盖所有绿色变体
        if ((g > 60 && g > r * 1.15 && g > b * 1.15) ||
            (g > 100 && g > r + 20 && g > b + 20) ||
            (g > 50 && r < 90 && b < 90)) {
          dd[i + 3] = 0
        }
        // 边缘半透明处理
        if (dd[i + 3] > 0 && g > 50 && g > r * 1.05 && g > b * 1.05) {
          const edge = Math.min(1, (g - Math.max(r, b)) / 60)
          dd[i + 3] = Math.round(dd[i + 3] * (1 - edge * 0.8))
        }
      }
      ctx.putImageData(imageData, 0, 0)
    }
    img.src = src
  }, [src])
  return <canvas ref={canvasRef} style={style} />
}

// ============ 数据模型 ============
type Material = {
  id: string
  name: string
  type: 'image' | 'video' | 'camera' | 'avatar' | 'host'
  src?: string
  x: number  // 0-100 百分比
  y: number
  w: number
  h: number
  zIndex: number
  productScope: 'all' | 'specific'
  productIds: string[]
  locked?: boolean  // 伴播形象/主播站位不可删除
  note?: string     // 提示文字
}

type Scene = {
  id: string
  name: string
  materials: Material[]
}

const PRODUCTS = [
  { id: 'p1', label: '1号 助播虾落地支架' },
  { id: 'p2', label: '2号 磁吸挂脖支架' },
  { id: 'p3', label: '3号 补光灯套装' },
]

const DEFAULT_MATERIALS: Material[] = [
  { id: 'host-pos', name: '主播站位', type: 'host', src: '/person-greenscreen.jpg', x: 0, y: 0, w: 55, h: 100, zIndex: 2, productScope: 'all', productIds: [], locked: true, note: '仅占位示意，不会出现在串流画面' },
  { id: 'avatar-pos', name: '伴播形象', type: 'avatar', src: '/avatars/xiaoxiao-dress.jpg', x: 48, y: 5, w: 52, h: 90, zIndex: 3, productScope: 'all', productIds: [], locked: true },
]

function createDefaultScene(): Scene {
  return { id: 'default', name: '默认场景', materials: [...DEFAULT_MATERIALS] }
}

// ============ 拖拽 Hook ============
function useDragResize(
  mat: Material,
  onUpdate: (id: string, updates: Partial<Material>) => void,
  canvasRef: React.RefObject<HTMLDivElement | null>
) {
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number; origW: number; origH: number; mode: 'move' | 'resize' | null }>({ startX: 0, startY: 0, origX: 0, origY: 0, origW: 0, origH: 0, mode: null })

  const onPointerDown = useCallback((e: React.PointerEvent, mode: 'move' | 'resize') => {
    e.stopPropagation()
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    dragRef.current = {
      startX: e.clientX, startY: e.clientY,
      origX: mat.x, origY: mat.y, origW: mat.w, origH: mat.h,
      mode,
    }
    const onMove = (ev: PointerEvent) => {
      const dx = ((ev.clientX - dragRef.current.startX) / rect.width) * 100
      const dy = ((ev.clientY - dragRef.current.startY) / rect.height) * 100
      if (mode === 'move') {
        onUpdate(mat.id, { x: Math.max(0, Math.min(95, dragRef.current.origX + dx)), y: Math.max(0, Math.min(95, dragRef.current.origY + dy)) })
      } else {
        onUpdate(mat.id, { w: Math.max(5, Math.min(100 - mat.x, dragRef.current.origW + dx)), h: Math.max(5, Math.min(100 - mat.y, dragRef.current.origH + dy)) })
      }
    }
    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }, [mat, onUpdate, canvasRef])

  return { onPointerDown }
}

// ============ 声控切镜面板 ============
function VoiceSwitchContent({ avatarSrc, scenes }: { avatarSrc: string; scenes: Scene[] }) {
  const [tags, setTags] = useState<SwitchTag[]>(DEFAULT_TAGS)
  const [activeTagId, setActiveTagId] = useState<string>('t1')
  const [showAddTag, setShowAddTag] = useState(false)
  const [newTagLabel, setNewTagLabel] = useState('')
  const [showChangeImg, setShowChangeImg] = useState(false)

  const activeTag = tags.find(t => t.id === activeTagId)
  const canAddTag = tags.length < MAX_TAGS

  const addTag = () => {
    const label = newTagLabel.trim()
    if (!label || !canAddTag) return
    const id = `t-${Date.now()}`
    setTags(prev => [...prev, { id, label }])
    setActiveTagId(id)
    setNewTagLabel('')
    setShowAddTag(false)
  }

  const deleteTag = (tagId: string) => {
    setTags(prev => prev.filter(t => t.id !== tagId))
    if (activeTagId === tagId) setActiveTagId(tags[0]?.id || '')
  }

  return (
    <>
      {/* 主体内容 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {/* 标题区域 */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 4 }}>声控切镜</div>
          <div style={{ fontSize: 12, color: C.textSec }}>通过语音指令自动切换直播场景</div>
        </div>

        {/* 默认形象 */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 10 }}>默认形象</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              width: 120, height: 120, borderRadius: '50%', overflow: 'hidden',
              border: `3px solid ${C.border}`, background: '#f0f0f0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {avatarSrc ? (
                <img src={avatarSrc} alt="默认形象" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 40 }}>🎭</span>
              )}
            </div>
          </div>
        </div>

        {/* 切镜标签 */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 }}>切镜标签</div>
          <div style={{ fontSize: 11, color: C.textSec, marginBottom: 10 }}>
            可自定义添加标签，每个形象最多设置{MAX_TAGS}个切镜标签
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {tags.map(tag => {
              const isActive = activeTagId === tag.id
              return (
                <div key={tag.id} onClick={() => setActiveTagId(tag.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '6px 12px', borderRadius: 6, cursor: 'pointer',
                  border: isActive ? `1.5px solid ${C.blue}` : `1px solid ${C.border}`,
                  background: isActive ? C.blueLight : C.card,
                  color: isActive ? C.blue : C.text,
                  fontSize: 12, fontWeight: isActive ? 600 : 400,
                  transition: 'all 0.15s',
                }}>
                  {tag.label}
                  {!tag.isDefault && (
                    <span onClick={e => { e.stopPropagation(); deleteTag(tag.id) }} style={{
                      marginLeft: 2, fontSize: 10, color: C.textTert, cursor: 'pointer',
                      lineHeight: 1,
                    }}>✕</span>
                  )}
                </div>
              )
            })}
            {canAddTag && (
              <button onClick={() => setShowAddTag(true)} style={{
                padding: '6px 12px', borderRadius: 6,
                border: `1px dashed ${C.blue}`, background: 'transparent',
                color: C.blue, fontSize: 12, cursor: 'pointer', fontFamily: C.font,
              }}>+ 自定义</button>
            )}
          </div>

          {/* 添加标签弹窗 */}
          {showAddTag && (
            <div style={{ marginTop: 10, display: 'flex', gap: 6, alignItems: 'center' }}>
              <input
                value={newTagLabel}
                onChange={e => setNewTagLabel(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTag()}
                placeholder="输入标签名称"
                autoFocus
                style={{
                  flex: 1, height: 30, padding: '0 10px', borderRadius: 6,
                  border: `1px solid ${C.border}`, fontSize: 12, fontFamily: C.font, outline: 'none',
                }}
              />
              <button onClick={addTag} style={{
                padding: '5px 12px', borderRadius: 6, border: 'none',
                background: C.blue, color: '#fff', fontSize: 11, fontWeight: 600,
                cursor: 'pointer', fontFamily: C.font,
              }}>确定</button>
              <button onClick={() => { setShowAddTag(false); setNewTagLabel('') }} style={{
                padding: '5px 12px', borderRadius: 6,
                border: `1px solid ${C.border}`, background: C.card, color: C.textSec,
                fontSize: 11, cursor: 'pointer', fontFamily: C.font,
              }}>取消</button>
            </div>
          )}
        </div>

        {/* 素材来源 */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 10 }}>素材来源</div>

          {/* 当前标签的素材 */}
          {activeTag && (
            <div style={{
              padding: 12, borderRadius: 8, border: `1px solid ${C.border}`,
              background: C.card, marginBottom: 10,
            }}>
              {activeTag.imageSrc ? (
                <div style={{ position: 'relative' }}>
                  <div style={{
                    width: '100%', height: 200, borderRadius: 6, overflow: 'hidden',
                    background: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <ChromaKeyImg src={activeTag.imageSrc}
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  </div>
                  <div style={{
                    position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
                    background: 'rgba(0,0,0,0.6)', borderRadius: 4, padding: '2px 8px',
                  }}>
                    <span style={{ fontSize: 10, color: '#fff' }}>{activeTag.label}</span>
                  </div>
                </div>
              ) : (
                <div style={{
                  width: '100%', height: 160, borderRadius: 6,
                  background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b4e 100%)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  color: 'rgba(255,255,255,0.5)', gap: 6,
                }}>
                  <span style={{ fontSize: 28 }}>🎭</span>
                  <span style={{ fontSize: 12 }}>正在识别中...</span>
                </div>
              )}
              <div style={{
                marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: 11, color: C.textSec }}>
                  {activeTag.label} · 绿幕素材
                </span>
                <button onClick={() => setShowChangeImg(true)} style={{
                  padding: '3px 10px', borderRadius: 4, border: `1px solid ${C.border}`,
                  background: C.card, color: C.blue, fontSize: 10, cursor: 'pointer', fontFamily: C.font,
                }}>更换图片</button>
              </div>
            </div>
          )}

          {/* 添加按钮 */}
          <button style={{
            width: '100%', padding: '10px', borderRadius: 8,
            border: `1px dashed ${C.border}`, background: 'transparent',
            color: C.blue, fontSize: 12, cursor: 'pointer', fontFamily: C.font,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
          }}>
            <span style={{ fontSize: 14, fontWeight: 300 }}>+</span> 添加
          </button>
        </div>

        {/* 换图弹窗 */}
        {showChangeImg && (
          <div onClick={() => setShowChangeImg(false)} style={{
            position: 'absolute', inset: 0, zIndex: 300,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div onClick={e => e.stopPropagation()} style={{
              width: 360, background: '#fff', borderRadius: 14, padding: '20px', fontFamily: C.font,
            }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 12 }}>
                更换「{activeTag?.label}」素材
              </div>
              <div style={{
                padding: '24px', borderRadius: 8, border: `1px dashed ${C.border}`,
                textAlign: 'center', color: C.textTert, fontSize: 12, marginBottom: 12, cursor: 'pointer',
              }}>
                + 点击上传绿幕素材图片<br/>
                <span style={{ fontSize: 10 }}>支持 jpg/png 格式</span>
              </div>
              <div style={{ fontSize: 10, color: C.textSec, marginBottom: 12, lineHeight: 1.5 }}>
                💡 建议上传带绿幕背景的形象图片，系统会自动抠绿处理
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={() => setShowChangeImg(false)} style={{
                  padding: '6px 16px', borderRadius: 6, border: `1px solid ${C.border}`,
                  background: C.card, color: C.textSec, fontSize: 12, cursor: 'pointer', fontFamily: C.font,
                }}>取消</button>
                <button onClick={() => setShowChangeImg(false)} style={{
                  padding: '6px 16px', borderRadius: 6, border: 'none',
                  background: C.blue, color: '#fff', fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', fontFamily: C.font,
                }}>确定</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 底部确认按钮 */}
      <div style={{
        padding: '12px 16px', background: C.card, borderTop: `1px solid ${C.border}`,
        flexShrink: 0,
      }}>
        <button style={{
          width: '100%', padding: '10px', borderRadius: 8, border: 'none',
          background: C.blue, color: '#fff', fontSize: 14, fontWeight: 600,
          cursor: 'pointer', fontFamily: C.font,
          boxShadow: '0 2px 8px rgba(51,112,255,0.3)',
        }}>确认</button>
      </div>
    </>
  )
}

// ============ 弹窗组件 ============
function AddMaterialModal({ onClose, onAdd }: { onClose: () => void; onAdd: (m: Omit<Material, 'id' | 'zIndex'>) => void }) {
  const [name, setName] = useState('')
  const [source, setSource] = useState<'local' | 'url'>('local')
  const [scope, setScope] = useState<'all' | 'specific'>('all')
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [url, setUrl] = useState('')

  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: 380, background: '#fff', borderRadius: 14, padding: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', fontFamily: C.font }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 14 }}>新增素材</div>

        <div style={{ fontSize: 11, color: C.textSec, marginBottom: 4 }}>素材名称</div>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="例：品牌LOGO" style={{ width: '100%', height: 32, padding: '0 10px', borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 12, fontFamily: C.font, outline: 'none', boxSizing: 'border-box', marginBottom: 10 }} />

        <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
          <button onClick={() => setSource('local')} style={{ flex: 1, padding: '6px', borderRadius: 6, border: source === 'local' ? `1.5px solid ${C.blue}` : `1px solid ${C.border}`, background: source === 'local' ? C.blueLight : C.card, color: source === 'local' ? C.blue : C.textSec, fontSize: 11, cursor: 'pointer', fontFamily: C.font }}>本地资源</button>
          <button onClick={() => setSource('url')} style={{ flex: 1, padding: '6px', borderRadius: 6, border: source === 'url' ? `1.5px solid ${C.blue}` : `1px solid ${C.border}`, background: source === 'url' ? C.blueLight : C.card, color: source === 'url' ? C.blue : C.textSec, fontSize: 11, cursor: 'pointer', fontFamily: C.font }}>URL 资源</button>
        </div>

        {source === 'local' ? (
          <div style={{ padding: '16px', borderRadius: 8, border: `1px dashed ${C.border}`, textAlign: 'center', color: C.textTert, fontSize: 12, marginBottom: 10, cursor: 'pointer' }}>
            + 点击上传（支持 jpg/png/gif/mp4）
          </div>
        ) : (
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="输入素材 URL" style={{ width: '100%', height: 32, padding: '0 10px', borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 12, fontFamily: C.font, outline: 'none', boxSizing: 'border-box', marginBottom: 10 }} />
        )}

        <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
          <button onClick={() => setScope('all')} style={{ flex: 1, padding: '6px', borderRadius: 6, border: scope === 'all' ? `1.5px solid ${C.green}` : `1px solid ${C.border}`, background: scope === 'all' ? C.greenLight : C.card, color: scope === 'all' ? C.green : C.textSec, fontSize: 11, cursor: 'pointer', fontFamily: C.font }}>全部商品生效</button>
          <button onClick={() => setScope('specific')} style={{ flex: 1, padding: '6px', borderRadius: 6, border: scope === 'specific' ? `1.5px solid ${C.green}` : `1px solid ${C.border}`, background: scope === 'specific' ? C.greenLight : C.card, color: scope === 'specific' ? C.green : C.textSec, fontSize: 11, cursor: 'pointer', fontFamily: C.font }}>限定商品生效</button>
        </div>

        {scope === 'specific' && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
            {PRODUCTS.map(p => (
              <button key={p.id} onClick={() => setSelectedProducts(prev => prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id])} style={{
                padding: '3px 8px', borderRadius: 4,
                border: selectedProducts.includes(p.id) ? `1px solid ${C.blue}` : `1px solid ${C.border}`,
                background: selectedProducts.includes(p.id) ? C.blueLight : C.card,
                color: selectedProducts.includes(p.id) ? C.blue : C.textSec,
                fontSize: 10, cursor: 'pointer', fontFamily: C.font,
              }}>{p.label}</button>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '6px 16px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.card, color: C.textSec, fontSize: 12, cursor: 'pointer', fontFamily: C.font }}>取消</button>
          <button onClick={() => { onAdd({ name: name || '未命名素材', type: 'image', x: 20 + Math.random() * 30, y: 20 + Math.random() * 30, w: 30, h: 30, productScope: scope, productIds: selectedProducts }); onClose() }}
            style={{ padding: '6px 16px', borderRadius: 6, border: 'none', background: C.blue, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: C.font }}>确定</button>
        </div>
      </div>
    </div>
  )
}

// ============ 主组件 ============
export default function SceneEditorPanel({ onClose, onSwitchPanel, onConfirmConfig }: Props) {
  const [scenes, setScenes] = useState<Scene[]>([createDefaultScene()])
  const [activeSceneId, setActiveSceneId] = useState('default')
  const [selectedMatId, setSelectedMatId] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showBatchModal, setShowBatchModal] = useState(false)
  const [showCameraModal, setShowCameraModal] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [editingSceneName, setEditingSceneName] = useState(false)
  const [newSceneName, setNewSceneName] = useState('')
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('scene')
  const canvasRef = useRef<HTMLDivElement>(null)

  const activeScene = scenes.find(s => s.id === activeSceneId) || scenes[0]

  const updateMaterial = useCallback((matId: string, updates: Partial<Material>) => {
    setScenes(prev => prev.map(s => s.id === activeSceneId ? {
      ...s, materials: s.materials.map(m => m.id === matId ? { ...m, ...updates } : m),
    } : s))
  }, [activeSceneId])

  const addMaterial = (mat: Omit<Material, 'id' | 'zIndex'>) => {
    const id = `mat-${Date.now()}`
    const maxZ = Math.max(0, ...activeScene.materials.map(m => m.zIndex))
    setScenes(prev => prev.map(s => s.id === activeSceneId ? {
      ...s, materials: [...s.materials, { ...mat, id, zIndex: maxZ + 1 }],
    } : s))
  }

  const deleteMaterial = (matId: string) => {
    setScenes(prev => prev.map(s => s.id === activeSceneId ? {
      ...s, materials: s.materials.filter(m => m.id !== matId),
    } : s))
    if (selectedMatId === matId) setSelectedMatId(null)
  }

  const moveLayer = (matId: string, direction: 'up' | 'down') => {
    setScenes(prev => prev.map(s => {
      if (s.id !== activeSceneId) return s
      const mats = [...s.materials]
      const idx = mats.findIndex(m => m.id === matId)
      if (idx < 0) return s
      // 'up' in the list = higher zIndex = later in array (list is reversed)
      // pressing ▲ means move UP in visual order = move RIGHT in array (higher index)
      const swapIdx = direction === 'up' ? idx + 1 : idx - 1
      if (swapIdx < 0 || swapIdx >= mats.length) return s
      // Swap positions in array
      const tmp = mats[idx]
      mats[idx] = mats[swapIdx]
      mats[swapIdx] = tmp
      // Update zIndex to match new order
      mats.forEach((m, i) => { m.zIndex = i + 1 })
      return { ...s, materials: [...mats] }
    }))
  }

  const addScene = () => {
    const id = `scene-${Date.now()}`
    const name = newSceneName || `镜头${scenes.length + 1}`
    setScenes(prev => [...prev, { id, name, materials: [...DEFAULT_MATERIALS] }])
    setActiveSceneId(id)
    setNewSceneName('')
    setEditingSceneName(false)
  }

  const getMatColor = (mat: Material) => {
    if (mat.type === 'avatar') return { bg: 'rgba(51,112,255,0.12)', border: 'rgba(51,112,255,0.5)', text: 'rgba(51,112,255,0.8)' }
    if (mat.type === 'host') return { bg: 'rgba(255,152,0,0.12)', border: 'rgba(255,152,0,0.5)', text: 'rgba(255,152,0,0.8)' }
    return { bg: 'rgba(0,0,0,0.06)', border: 'rgba(0,0,0,0.2)', text: 'rgba(0,0,0,0.5)' }
  }

  const getIcon = (mat: Material) => {
    if (mat.type === 'avatar') return '🎭'
    if (mat.type === 'host') return '📷'
    if (mat.type === 'video') return '🎬'
    if (mat.type === 'camera') return '📹'
    return '🖼'
  }

  return (
    <div style={{
      position: 'absolute', top: 36, right: 0, bottom: 0, width: 520,
      zIndex: 102, overflow: 'hidden', borderRadius: '8px 0 0 0',
      boxShadow: '-2px 0 16px rgba(0,0,0,0.15)', fontFamily: C.font,
      display: 'flex', flexDirection: 'column', background: C.bg,
    }}>
      {/* 顶部：标题 + 关闭 */}
      <div style={{ padding: '10px 16px', background: C.card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: C.text }}>🎬 场景装修</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => setShowPreview(!showPreview)} style={{
            padding: '4px 12px', borderRadius: 6,
            border: `1px solid ${showPreview ? C.blue : C.border}`,
            background: showPreview ? C.blueLight : 'transparent',
            color: showPreview ? C.blue : C.textSec,
            fontSize: 12, cursor: 'pointer', fontFamily: C.font,
          }}>{showPreview ? '🎬 预览中' : '👁 装修预览'}</button>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 18, color: C.textSec, cursor: 'pointer', padding: 4 }}>✕</button>
        </div>
      </div>

      {/* 模块 Tab */}
      {onSwitchPanel && <TabBar active="sceneLayout" onSwitch={onSwitchPanel} />}

      {/* 子标签：场景编辑 / 声控切镜 */}
      <div style={{ padding: '8px 16px', background: C.card, borderBottom: `1px solid ${C.border}`, display: 'flex', gap: 6, flexShrink: 0 }}>
        <button onClick={() => setActiveSubTab('scene')} style={{
          padding: '5px 14px', borderRadius: 6, border: 'none', fontSize: 12,
          fontWeight: activeSubTab === 'scene' ? 600 : 400,
          background: activeSubTab === 'scene' ? C.blueLight : '#F0F0F0',
          color: activeSubTab === 'scene' ? C.blue : C.textSec,
          cursor: 'pointer', fontFamily: C.font, transition: 'all 0.15s',
        }}>场景编辑</button>
        <button onClick={() => setActiveSubTab('voiceSwitch')} style={{
          padding: '5px 14px', borderRadius: 6, border: 'none', fontSize: 12,
          fontWeight: activeSubTab === 'voiceSwitch' ? 600 : 400,
          background: activeSubTab === 'voiceSwitch' ? C.blueLight : '#F0F0F0',
          color: activeSubTab === 'voiceSwitch' ? C.blue : C.textSec,
          cursor: 'pointer', fontFamily: C.font, transition: 'all 0.15s',
        }}>声控切镜</button>
      </div>

      {/* 条件渲染：场景编辑 or 声控切镜 */}
      {activeSubTab === 'scene' && (
        <>
          {/* 场景标签行 */}
          <div style={{
            padding: '8px 16px', background: C.card, borderBottom: `1px solid ${C.border}`,
            display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, overflowX: 'auto',
          }}>
        {scenes.map(scene => (
          <button key={scene.id} onClick={() => { setActiveSceneId(scene.id); setSelectedMatId(null) }} style={{
            padding: '5px 14px', borderRadius: 6, border: 'none', fontSize: 12, whiteSpace: 'nowrap',
            fontWeight: activeSceneId === scene.id ? 600 : 400,
            background: activeSceneId === scene.id ? C.blueLight : '#F0F0F0',
            color: activeSceneId === scene.id ? C.blue : C.textSec,
            cursor: 'pointer', fontFamily: C.font,
          }}>{scene.name}</button>
        ))}
        {editingSceneName ? (
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <input value={newSceneName} onChange={e => setNewSceneName(e.target.value)} placeholder="场景名称"
              autoFocus onKeyDown={e => e.key === 'Enter' && addScene()}
              style={{ width: 80, height: 26, padding: '0 6px', borderRadius: 4, border: `1px solid ${C.border}`, fontSize: 11, outline: 'none', fontFamily: C.font }} />
            <button onClick={addScene} style={{ padding: '3px 8px', borderRadius: 4, border: 'none', background: C.blue, color: '#fff', fontSize: 10, cursor: 'pointer', fontFamily: C.font }}>确定</button>
          </div>
        ) : (
          <button onClick={() => setEditingSceneName(true)} style={{
            padding: '5px 10px', borderRadius: 6, border: `1px dashed ${C.border}`,
            background: 'transparent', color: C.blue, fontSize: 12, cursor: 'pointer', fontFamily: C.font,
          }}>+ 新增场景</button>
        )}
      </div>

      {/* 主体：左右分栏 */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* 左侧：9:16 预览区（外框精确 9:16，无多余空白） */}
        <div style={{
          width: 184, height: 327.11, // 184 * 16/9 = 327.11
          flexShrink: 0, background: '#1a1a2e',
          borderRight: `1px solid ${C.border}`,
          position: 'relative', overflow: 'hidden',
        }}>
          <div
            ref={canvasRef}
            onClick={() => setSelectedMatId(null)}
            style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(180deg, #2d1b4e 0%, #1a1a2e 100%)',
              borderRadius: 0,
            }}
          >
            {/* 渲染所有素材 */}
            {activeScene.materials.map(mat => {
              const colors = getMatColor(mat)
              const isSelected = selectedMatId === mat.id
              return (
                <div
                  key={mat.id}
                  onClick={e => { e.stopPropagation(); setSelectedMatId(mat.id) }}
                  onPointerDown={e => {
                    if (mat.locked || isSelected) {
                      const handler = useDragResize(mat, updateMaterial, canvasRef)
                      handler.onPointerDown(e, 'move')
                    }
                  }}
                  style={{
                    position: 'absolute',
                    left: `${mat.x}%`, top: `${mat.y}%`,
                    width: `${mat.w}%`, height: `${mat.h}%`,
                    background: (mat.type === 'host' || mat.type === 'avatar') ? 'transparent' : colors.bg,
                    border: isSelected ? `2px solid ${C.blue}` : (mat.locked ? `1px solid ${colors.border}` : `1px dashed ${colors.border}`),
                    borderRadius: 4, cursor: 'move',
                    overflow: 'hidden',
                    transition: isSelected ? 'none' : 'border 0.15s',
                    userSelect: 'none',
                  }}
                >
                  {/* 图片素材（host 用 chroma key，avatar 用原图） */}
                  {mat.src && mat.type === 'host' && (
                    <ChromaKeyImg src={mat.src}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }} />
                  )}
                  {mat.src && mat.type !== 'host' && (
                    <img src={mat.src} alt={mat.name} draggable={false}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }} />
                  )}
                  {/* 名称标签（浮在图片上） */}
                  <div style={{
                    position: 'absolute', top: 3, left: 3,
                    background: 'rgba(0,0,0,0.55)', borderRadius: 3,
                    padding: '2px 5px', display: 'flex', alignItems: 'center', gap: 3,
                  }}>
                    <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                      {mat.type === 'host' ? '📷' : mat.type === 'avatar' ? '🎭' : '🖼'} {mat.name}
                    </span>
                  </div>
                  {/* 站位说明（host 类型） */}
                  {mat.note && (
                    <div style={{
                      position: 'absolute', bottom: 2, left: 2, right: 2,
                      background: 'rgba(255,152,0,0.8)', borderRadius: 3,
                      padding: '2px 4px', textAlign: 'center',
                    }}>
                      <span style={{ fontSize: 5, color: '#fff', fontWeight: 500, lineHeight: 1.2 }}>
                        ⚠️ 仅占位，不出现在串流
                      </span>
                    </div>
                  )}
                  {/* 无图片时的 fallback */}
                  {!mat.src && (
                    <>
                      <span style={{ fontSize: 16, marginBottom: 2 }}>{getIcon(mat)}</span>
                      <span style={{ fontSize: 9, color: colors.text, fontWeight: 500, textAlign: 'center', padding: '0 4px' }}>{mat.name}</span>
                    </>
                  )}
                  {mat.productScope === 'specific' && (
                    <span style={{
                      position: 'absolute', top: 3, right: 3,
                      fontSize: 7, color: C.orange, padding: '1px 4px',
                      background: 'rgba(255,255,255,0.85)', borderRadius: 2,
                    }}>限定商品</span>
                  )}
                  {/* 缩放手柄（选中时显示） */}
                  {isSelected && (
                    <div onPointerDown={e => {
                      e.stopPropagation()
                      const handler = useDragResize(mat, updateMaterial, canvasRef)
                      handler.onPointerDown(e, 'resize')
                    }} style={{
                      position: 'absolute', right: -3, bottom: -3,
                      width: 10, height: 10, borderRadius: 2,
                      background: C.blue, cursor: 'se-resize',
                      zIndex: 10,
                    }} />
                  )}
                </div>
              )
            })}

            {/* 预览模式覆盖层 */}
            {showPreview && (
              <div style={{
                position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 8,
              }}>
                <div style={{
                  padding: '8px 16px', borderRadius: 20,
                  background: 'rgba(51,112,255,0.9)', color: '#fff',
                  fontSize: 12, fontWeight: 600,
                }}>👁 装修预览模式</div>
              </div>
            )}
          </div>
        </div>

        {/* 右侧：素材列表 + 操作 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: C.card, overflow: 'hidden' }}>
          {/* 操作按钮 */}
          <div style={{ padding: '10px 12px', borderBottom: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => setShowAddModal(true)} style={{
                flex: 1, padding: '6px', borderRadius: 6, border: `1px solid ${C.border}`,
                background: C.card, color: C.blue, fontSize: 11, cursor: 'pointer', fontFamily: C.font,
              }}>+ 新增素材</button>
              <button onClick={() => setShowBatchModal(true)} style={{
                flex: 1, padding: '6px', borderRadius: 6, border: `1px solid ${C.border}`,
                background: C.card, color: C.blue, fontSize: 11, cursor: 'pointer', fontFamily: C.font,
              }}>+ 批量新增</button>
            </div>
            <button onClick={() => setShowCameraModal(true)} style={{
              width: '100%', padding: '6px', borderRadius: 6, border: `1px solid ${C.border}`,
              background: C.card, color: C.textSec, fontSize: 11, cursor: 'pointer', fontFamily: C.font,
            }}>📹 添加摄像头</button>
          </div>

          {/* 素材列表标题 */}
          <div style={{ padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: C.textSec }}>素材列表 <span style={{ fontWeight: 400 }}>可通过左侧按钮调整层级</span></span>
            <button onClick={() => setScenes(prev => prev.map(s => s.id === activeSceneId ? { ...s, materials: s.materials.filter(m => m.locked) } : s))}
              style={{ fontSize: 10, color: C.red, background: 'none', border: 'none', cursor: 'pointer', fontFamily: C.font }}>清空</button>
          </div>

          {/* 素材列表 */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
            {[...activeScene.materials].reverse().map((mat, idx) => {
              const isSelected = selectedMatId === mat.id
              return (
                <div key={mat.id} onClick={() => setSelectedMatId(mat.id)} style={{
                  padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8,
                  background: isSelected ? C.blueLight : 'transparent',
                  borderLeft: isSelected ? `3px solid ${C.blue}` : '3px solid transparent',
                  cursor: 'pointer', transition: 'all 0.1s',
                }}>
                  {/* 层级序号 + 调整按钮 */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                    <button onClick={e => { e.stopPropagation(); moveLayer(mat.id, 'up') }} style={{
                      width: 16, height: 12, border: 'none', background: 'transparent', color: C.textTert, fontSize: 8, cursor: 'pointer', lineHeight: 1,
                    }}>▲</button>
                    <span style={{ fontSize: 10, color: C.textSec, fontWeight: 600 }}>{activeScene.materials.length - idx}</span>
                    <button onClick={e => { e.stopPropagation(); moveLayer(mat.id, 'down') }} style={{
                      width: 16, height: 12, border: 'none', background: 'transparent', color: C.textTert, fontSize: 8, cursor: 'pointer', lineHeight: 1,
                    }}>▼</button>
                  </div>

                  {/* 素材信息 */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {getIcon(mat)} {mat.name}
                    </div>
                    <div style={{ fontSize: 10, color: C.textTert }}>
                      {mat.productScope === 'all' ? '全商品' : '限定商品'}
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  {!mat.locked && (
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      <button onClick={e => { e.stopPropagation() }} style={{
                        padding: '2px 6px', borderRadius: 3, border: `1px solid ${C.border}`,
                        background: C.card, color: C.blue, fontSize: 9, cursor: 'pointer', fontFamily: C.font,
                      }}>编辑</button>
                      <button onClick={e => { e.stopPropagation(); deleteMaterial(mat.id) }} style={{
                        padding: '2px 6px', borderRadius: 3, border: `1px solid ${C.border}`,
                        background: C.card, color: C.red, fontSize: 9, cursor: 'pointer', fontFamily: C.font,
                      }}>删除</button>
                    </div>
                  )}
                  {mat.locked && (
                    <span style={{ fontSize: 9, color: C.textTert, flexShrink: 0 }}>固定</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 底部 */}
      <div style={{ padding: '10px 16px', background: C.card, borderTop: `1px solid ${C.border}`, display: 'flex', gap: 10, flexShrink: 0, justifyContent: 'flex-end' }}>
        <button onClick={onClose} style={{
          padding: '8px 20px', borderRadius: 8, background: 'transparent',
          border: `1px solid ${C.border}`, color: C.textSec, fontSize: 13, cursor: 'pointer', fontFamily: C.font,
        }}>取消</button>
        <button onClick={onConfirmConfig} style={{
          padding: '8px 24px', borderRadius: 8, background: C.blue, border: 'none',
          color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: C.font,
          boxShadow: '0 2px 8px rgba(51,112,255,0.3)',
        }}>确认配置</button>
      </div>

      {/* 弹窗 */}
      {showAddModal && <AddMaterialModal onClose={() => setShowAddModal(false)} onAdd={addMaterial} />}
      {showBatchModal && (
        <div onClick={() => setShowBatchModal(false)} style={{ position: 'absolute', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: 360, background: '#fff', borderRadius: 14, padding: '20px', fontFamily: C.font }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 10 }}>批量新增素材</div>
            <div style={{ padding: '24px', borderRadius: 8, border: `1px dashed ${C.border}`, textAlign: 'center', color: C.textTert, fontSize: 12, marginBottom: 10, cursor: 'pointer' }}>
              + 点击选择文件（支持多选）<br/><span style={{ fontSize: 10 }}>支持 jpg, png, gif, mp4, mov, mkv, webm</span>
            </div>
            <div style={{ fontSize: 10, color: C.textSec, marginBottom: 10, lineHeight: 1.6 }}>
              💡 文件名中包含商品ID时，系统将自动匹配对应商品
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowBatchModal(false)} style={{ padding: '6px 16px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.card, color: C.textSec, fontSize: 12, cursor: 'pointer', fontFamily: C.font }}>取消</button>
              <button onClick={() => setShowBatchModal(false)} style={{ padding: '6px 16px', borderRadius: 6, border: 'none', background: C.blue, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: C.font }}>确定</button>
            </div>
          </div>
        </div>
      )}
      {showCameraModal && (
        <div onClick={() => setShowCameraModal(false)} style={{ position: 'absolute', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: 320, background: '#fff', borderRadius: 14, padding: '20px', fontFamily: C.font }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 10 }}>添加摄像头</div>
            <div style={{ padding: '12px 14px', borderRadius: 8, border: `1px solid ${C.border}`, marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: C.textSec, marginBottom: 6 }}>选择摄像头设备</div>
              <select style={{ width: '100%', height: 32, borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 12, fontFamily: C.font, padding: '0 8px', outline: 'none' }}>
                <option>e2eSoft iVCam</option>
                <option>FaceTime HD Camera</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <button style={{ flex: 1, padding: '6px', borderRadius: 6, border: `1.5px solid ${C.blue}`, background: C.blueLight, color: C.blue, fontSize: 11, cursor: 'pointer', fontFamily: C.font }}>16:9</button>
              <button style={{ flex: 1, padding: '6px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.card, color: C.textSec, fontSize: 11, cursor: 'pointer', fontFamily: C.font }}>9:16</button>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowCameraModal(false)} style={{ padding: '6px 16px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.card, color: C.textSec, fontSize: 12, cursor: 'pointer', fontFamily: C.font }}>取消</button>
              <button onClick={() => { addMaterial({ name: '摄像头', type: 'camera', x: 0, y: 0, w: 100, h: 100, productScope: 'all', productIds: [] }); setShowCameraModal(false) }}
                style={{ padding: '6px 16px', borderRadius: 6, border: 'none', background: C.blue, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: C.font }}>确定</button>
            </div>
          </div>
        </div>
      )}
        </>
      )}

      {/* 声控切镜内容 */}
      {activeSubTab === 'voiceSwitch' && (
        <VoiceSwitchContent avatarSrc="/avatars/xiaoxiao-dress.jpg" scenes={scenes} />
      )}
    </div>
  )
}
