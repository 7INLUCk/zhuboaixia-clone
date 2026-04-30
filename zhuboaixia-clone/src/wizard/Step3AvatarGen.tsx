// src/wizard/Step3AvatarGen.tsx — 形象生成（固定槽位穿搭 + 定装照）
import React, { useState, useEffect, useRef } from 'react'
import { C } from '../shared'
import { CARGO_PRODUCTS, FACE_LIBRARY } from './mockData'
import type { WizardState, AvatarConfig, OutfitSlot, FixedSlotKey, PortraitRound } from './types'

type Props = {
  state: WizardState
  onUpdate: (patch: Partial<WizardState>) => void
  onNext: () => void
  onPrev: () => void
  editMode?: boolean
}

const SLOT_LABEL: Record<FixedSlotKey, string> = { top: '上身', bottom: '下身', shoes: '鞋子' }
const SLOT_EMOJI: Record<FixedSlotKey, string> = { top: '👕', bottom: '👖', shoes: '👟' }

// bodySlots that are "recommended" for each fixed slot (soft reference only)
const SLOT_SUGGESTED: Record<FixedSlotKey, string[]> = {
  top:    ['top', 'outer', 'dress'],
  bottom: ['bottom', 'dress'],
  shoes:  ['shoes'],
}

const PORTRAIT_COLORS = ['#FFD0E8', '#B3D4FF', '#C8F0D0', '#FFE0B0', '#D0E0FF', '#FFD4F0']
const THUMB_COLORS = ['#E8F4FF', '#FFF0E8', '#F0FFE8', '#F8E8FF', '#FFE8E8', '#FFF8E8']

const MAX_ADJUST = 3

function makeEmptySlots(): OutfitSlot[] {
  return [
    { slot: 'top',    productId: null, selectedImageIndex: 0, source: 'empty' },
    { slot: 'bottom', productId: null, selectedImageIndex: 0, source: 'empty' },
    { slot: 'shoes',  productId: null, selectedImageIndex: 0, source: 'empty' },
  ]
}

function makeConfig(faceId: string, faceType: 'ip' | 'realistic', avatarIndex: number): AvatarConfig {
  const face = FACE_LIBRARY.find(f => f.id === faceId)
  const baseName = face?.name ?? '自定义形象'
  return {
    id: `avatar-${faceId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: `${baseName}-形象${avatarIndex}`,
    mode: faceType === 'ip' ? 'ip' : 'product-bound',
    faceId,
    outfitSlots: makeEmptySlots(),
    portraitStatus: 'pending',
    portraitAdjustCount: 0,
    portraitPrompt: '',
    portraitRounds: [],
    portraitAppliedRoundId: null,
    portraitViewingRoundId: null,
    selectedSkillIds: ['sp-daily', 'sp-enter', 'sp-exit', 'sp-auto-outfit', 'sp-showcase'],
    materials: {},
    materialsDone: false,
    reviewStatus: 'unsubmitted',
  }
}

type SlotModal = {
  configId: string
  slotKey: FixedSlotKey
  step: 1 | 2
  pendingProductId: string | null
  pendingImageIdx: number
  pendingIsCombined: boolean
}

export default function Step3AvatarGen({ state, onUpdate, onNext, onPrev, editMode }: Props) {
  const { avatarConfigs, selectedFaceIds, faceTypes } = state
  const [selectedFaceId, setSelectedFaceId] = useState<string>(selectedFaceIds[0] ?? '')
  const [slotModal, setSlotModal] = useState<SlotModal | null>(null)
  const [generatingId, setGeneratingId] = useState<string | null>(null)
  // key: configId, value: true=force-expanded, false=force-collapsed
  const [cardExpansionOverrides, setCardExpansionOverrides] = useState<Record<string, boolean>>({})
  const [showCoverageDetail, setShowCoverageDetail] = useState(false)

  const [uploadToast, setUploadToast] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pendingUploadRef = useRef<{ configId: string; slotKey: FixedSlotKey } | null>(null)

  const isCardExpanded = (config: { id: string; portraitStatus: string }) =>
    config.id in cardExpansionOverrides
      ? cardExpansionOverrides[config.id]
      : config.portraitStatus !== 'confirmed'

  const setCardExpanded = (configId: string, expanded: boolean) =>
    setCardExpansionOverrides(prev => ({ ...prev, [configId]: expanded }))

  useEffect(() => {
    if (selectedFaceIds.length === 0) return
    const valid = avatarConfigs.filter(c => selectedFaceIds.includes(c.faceId))
    const existingFaceIds = new Set(valid.map(c => c.faceId))
    const toAdd = selectedFaceIds
      .filter(fid => !existingFaceIds.has(fid))
      .map(fid => makeConfig(fid, faceTypes[fid] ?? 'realistic', 1))
    if (toAdd.length > 0 || valid.length !== avatarConfigs.length) {
      onUpdate({ avatarConfigs: [...valid, ...toAdd] })
    }
  }, [selectedFaceIds.join(',')]) // eslint-disable-line

  useEffect(() => {
    if (selectedFaceIds.length > 0 && !selectedFaceIds.includes(selectedFaceId)) {
      setSelectedFaceId(selectedFaceIds[0])
    }
  }, [selectedFaceIds, selectedFaceId])

  const updateConfig = (id: string, patch: Partial<AvatarConfig>) =>
    onUpdate({ avatarConfigs: avatarConfigs.map(c => c.id === id ? { ...c, ...patch } : c) })

  const deleteConfig = (id: string) =>
    onUpdate({ avatarConfigs: avatarConfigs.filter(c => c.id !== id) })

  const addAvatarForFace = (faceId: string) => {
    const count = avatarConfigs.filter(c => c.faceId === faceId).length
    onUpdate({ avatarConfigs: [...avatarConfigs, makeConfig(faceId, faceTypes[faceId] ?? 'realistic', count + 1)] })
  }

  // 鞋子槽可跨形象复用，不参与互斥 — 只统计 top/bottom 槽的占用
  const getClaimedIds = (exceptId: string): Set<string> =>
    new Set(
      avatarConfigs
        .filter(c => c.id !== exceptId)
        .flatMap(c => c.outfitSlots
          .filter(s => s.slot !== 'shoes')
          .map(s => s.productId)
          .filter((id): id is string => id !== null)
        )
    )

  const getFaceInfo   = (faceId: string) => FACE_LIBRARY.find(f => f.id === faceId)
  const getFaceGender = (faceId: string) => getFaceInfo(faceId)?.gender ?? null
  const getFaceEmoji  = (faceId: string) => getFaceInfo(faceId)?.emoji ?? '👤'

  // ── Portrait ops ──
  const generatePortrait = (configId: string) => {
    const config = avatarConfigs.find(c => c.id === configId)
    if (!config) return
    setGeneratingId(configId)
    updateConfig(configId, { portraitStatus: 'generating' })
    setTimeout(() => {
      setGeneratingId(null)
      const newRound: PortraitRound = {
        id: `round-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        colorIdx: config.portraitRounds.length,
      }
      const newRounds = [...config.portraitRounds, newRound]
      updateConfig(configId, {
        portraitStatus: 'reviewing',
        portraitRounds: newRounds,
        portraitViewingRoundId: newRound.id,
        portraitPrompt: '',
      })
    }, 2000 + Math.random() * 800)
  }

  const doRegenerate = (configId: string, c: AvatarConfig) => {
    if (!c.portraitPrompt.trim()) return
    setGeneratingId(configId)
    updateConfig(configId, { portraitStatus: 'generating' })
    setTimeout(() => {
      setGeneratingId(null)
      const newRound: PortraitRound = {
        id: `round-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        colorIdx: c.portraitRounds.length,
      }
      const newRounds = [...c.portraitRounds, newRound]
      updateConfig(configId, {
        portraitStatus: 'reviewing',
        portraitRounds: newRounds,
        portraitViewingRoundId: newRound.id,
        portraitAdjustCount: c.portraitAdjustCount + 1,
        portraitPrompt: '',
      })
    }, 2200 + Math.random() * 600)
  }

  const applyPortraitRound = (configId: string, roundId: string) =>
    updateConfig(configId, { portraitStatus: 'confirmed', portraitAppliedRoundId: roundId })

  const backToReviewing = (configId: string) =>
    updateConfig(configId, { portraitStatus: 'reviewing' })

  // ── Slot modal: step 1 — pick product ──
  const openSlotModal = (configId: string, slotKey: FixedSlotKey) => {
    setSlotModal({ configId, slotKey, step: 1, pendingProductId: null, pendingImageIdx: 0, pendingIsCombined: false })
  }

  // Clicking a product in step 1 → go to step 2
  const handleStep1ProductClick = (productId: string) => {
    if (!slotModal) return
    // Pre-fill image index if this product is already in the current slot
    const config = avatarConfigs.find(c => c.id === slotModal.configId)
    const existingFill = config?.outfitSlots.find(s => s.slot === slotModal.slotKey)
    const preIdx = existingFill?.productId === productId ? existingFill.selectedImageIndex : 0
    const product = CARGO_PRODUCTS.find(p => p.id === productId)!
    const isCombined = product.bodySlot === 'dress'
    setSlotModal({ ...slotModal, step: 2, pendingProductId: productId, pendingImageIdx: preIdx, pendingIsCombined: isCombined })
  }

  // Confirm in step 2 → apply to state
  const handleConfirmSelection = () => {
    if (!slotModal || !slotModal.pendingProductId) return
    const { configId, slotKey, pendingProductId, pendingImageIdx, pendingIsCombined } = slotModal
    const config = avatarConfigs.find(c => c.id === configId)
    if (!config) return
    let newSlots = [...config.outfitSlots]

    if (pendingIsCombined && (slotKey === 'top' || slotKey === 'bottom')) {
      newSlots = newSlots.map(s =>
        (s.slot === 'top' || s.slot === 'bottom')
          ? { ...s, productId: pendingProductId, selectedImageIndex: pendingImageIdx, source: 'product' as const }
          : s
      )
    } else {
      const currentSlot = config.outfitSlots.find(s => s.slot === slotKey)
      const oppositeKey = slotKey === 'top' ? 'bottom' : slotKey === 'bottom' ? 'top' : null
      const oppositeSlot = oppositeKey ? config.outfitSlots.find(s => s.slot === oppositeKey) : null
      const wasCombined = !!(currentSlot?.productId && currentSlot.productId === oppositeSlot?.productId)

      newSlots = newSlots.map(s => {
        if (s.slot === slotKey) return { ...s, productId: pendingProductId, selectedImageIndex: pendingImageIdx, source: 'product' as const }
        if (wasCombined && oppositeKey && s.slot === oppositeKey) {
          return { ...s, productId: null, selectedImageIndex: 0, source: 'empty' as const }
        }
        return s
      })
    }

    updateConfig(configId, { outfitSlots: newSlots, portraitStatus: 'pending', portraitAppliedRoundId: null })
    setSlotModal(null)
  }

  const handleUploadSlot = (configId: string, slotKey: FixedSlotKey) => {
    const config = avatarConfigs.find(c => c.id === configId)
    if (!config) return
    const newSlots = config.outfitSlots.map(s =>
      s.slot === slotKey ? { ...s, productId: null, selectedImageIndex: 0, source: 'uploaded' as const } : s
    )
    updateConfig(configId, { outfitSlots: newSlots, portraitStatus: 'pending', portraitAppliedRoundId: null })
    setSlotModal(null)
  }

  useEffect(() => {
    if (!uploadToast) return
    const t = setTimeout(() => setUploadToast(null), 3500)
    return () => clearTimeout(t)
  }, [uploadToast])

  const triggerUpload = (configId: string, slotKey: FixedSlotKey) => {
    pendingUploadRef.current = { configId, slotKey }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
      fileInputRef.current.click()
    }
  }

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !pendingUploadRef.current) return
    const { configId, slotKey } = pendingUploadRef.current

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setUploadToast('仅支持 JPG、PNG、WebP 格式')
      return
    }

    if (file.size > 7 * 1024 * 1024) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1)
      setUploadToast(`图片大小不能超过 7MB，当前 ${sizeMB}MB，请压缩后重试`)
      return
    }

    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const w = img.naturalWidth
      const h = img.naturalHeight
      URL.revokeObjectURL(url)
      if (w * h < 196) {
        setUploadToast('图片分辨率太低，请上传更高清的图片')
        return
      }
      if (w > 3072 || h > 3072) {
        setUploadToast(`图片尺寸超出限制（最大 3072×3072），当前 ${w}×${h}，请缩小后重试`)
        return
      }
      handleUploadSlot(configId, slotKey)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      setUploadToast('图片文件已损坏，请更换')
    }
    img.src = url
  }

  const handleRemoveSlot = (configId: string, slotKey: FixedSlotKey) => {
    const config = avatarConfigs.find(c => c.id === configId)
    if (!config) return
    const topS = config.outfitSlots.find(s => s.slot === 'top')!
    const botS = config.outfitSlots.find(s => s.slot === 'bottom')!
    const isCombined = !!(topS.productId && topS.productId === botS.productId)
    let newSlots = [...config.outfitSlots]
    if (isCombined && (slotKey === 'top' || slotKey === 'bottom')) {
      newSlots = newSlots.map(s =>
        (s.slot === 'top' || s.slot === 'bottom')
          ? { slot: s.slot, productId: null, selectedImageIndex: 0, source: 'empty' as const }
          : s
      )
    } else {
      newSlots = newSlots.map(s =>
        s.slot === slotKey
          ? { slot: s.slot, productId: null, selectedImageIndex: 0, source: 'empty' as const }
          : s
      )
    }
    updateConfig(configId, { outfitSlots: newSlots, portraitStatus: 'pending', portraitAppliedRoundId: null })
  }

  // ── Coverage ──
  const coveredIds = new Set(
    avatarConfigs.flatMap(c => c.outfitSlots.map(s => s.productId).filter((id): id is string => id !== null))
  )
  const uncoveredCount = state.selectedProductIds.filter(id => !coveredIds.has(id)).length

  // ── Valid avatars（IP 天然有效；真人须定装照已确认）──
  const validAvatarCount = avatarConfigs.filter(c => c.mode === 'ip' || c.portraitStatus === 'confirmed').length
  const incompletePortraitCount = avatarConfigs.filter(c => c.mode !== 'ip' && c.portraitStatus !== 'confirmed').length

  // ── Modal context ──
  const slotModalConfig = slotModal ? avatarConfigs.find(c => c.id === slotModal.configId) ?? null : null
  const slotModalGender = slotModalConfig ? getFaceGender(slotModalConfig.faceId) : null
  const slotModalClaimed = slotModalConfig ? getClaimedIds(slotModalConfig.id) : new Set<string>()
  // Products already in other slots of the same config (hard block — same avatar can't use one product twice)
  const slotModalOtherSlotIds = new Set(
    slotModalConfig?.outfitSlots
      .filter(s => s.slot !== slotModal?.slotKey)
      .map(s => s.productId)
      .filter((id): id is string => id !== null) ?? []
  )

  const faceConfigs = avatarConfigs.filter(c => c.faceId === selectedFaceId)
  const currentFaceType = selectedFaceId ? (faceTypes[selectedFaceId] ?? 'realistic') : 'realistic'

  // Step 2 product
  const step2Product = slotModal?.pendingProductId
    ? CARGO_PRODUCTS.find(p => p.id === slotModal.pendingProductId) ?? null
    : null

  const uncoveredProducts = state.selectedProductIds
    .filter(id => !coveredIds.has(id))
    .map(id => CARGO_PRODUCTS.find(p => p.id === id))
    .filter(Boolean) as typeof CARGO_PRODUCTS

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', position: 'relative' }}>

      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleFileSelected} />

      {uploadToast && (
        <div style={{
          position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)',
          padding: '10px 20px', borderRadius: 8, zIndex: 9999,
          background: '#FFF1F0', border: '1px solid #FFA39E', color: '#CF1322',
          fontSize: 13, fontWeight: 500, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}>
          {uploadToast}
        </div>
      )}

      {/* 编辑模式：未覆盖商品提醒 */}
      {editMode && uncoveredProducts.length > 0 && (
        <div style={{
          padding: '8px 16px', flexShrink: 0,
          background: '#FFFBF0', borderBottom: `1px solid ${C.orange}30`,
          display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: 12, color: C.orange, fontWeight: 600, flexShrink: 0 }}>
            ⚠️ {uncoveredProducts.length} 件商品尚无形象覆盖
          </span>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {uncoveredProducts.map(p => (
              <span key={p.id} style={{
                fontSize: 11, padding: '1px 6px', borderRadius: 4,
                background: C.orange + '20', color: C.orange,
              }}>{p.linkNum}号 {p.name}</span>
            ))}
          </div>
        </div>
      )}

      {/* 顶部：标题 + 副标题 + 覆盖摘要 */}
      {(() => {
        const coveredCount = state.selectedProductIds.length - uncoveredCount
        const total = state.selectedProductIds.length
        const previewUncovered = uncoveredProducts.slice(0, 2)
        const moreCount = uncoveredProducts.length - previewUncovered.length

        return (
          <div style={{ padding: '12px 24px 10px', flexShrink: 0, borderBottom: `1px solid ${C.border}` }}>
            {/* 标题行 + 覆盖摘要 */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text, flexShrink: 0 }}>形象生成</div>
              {/* 覆盖摘要（可点击展开） */}
              <div
                onClick={() => setShowCoverageDetail(v => !v)}
                style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', flexWrap: 'wrap', justifyContent: 'flex-end' }}
              >
                <span style={{ fontSize: 11, fontWeight: 600, color: uncoveredCount === 0 ? C.green : C.orange, flexShrink: 0 }}>
                  {uncoveredCount === 0 ? `✓ ${coveredCount}/${total} 已覆盖` : `覆盖 ${coveredCount}/${total}`}
                </span>
                {uncoveredCount > 0 && previewUncovered.map(p => (
                  <span key={p.id} style={{ fontSize: 10, padding: '1px 7px', borderRadius: 10, background: '#FFF7ED', color: '#875800', border: '1px solid #FECF8A', fontWeight: 600, flexShrink: 0 }}>
                    ○ {p.linkNum}号
                  </span>
                ))}
                {moreCount > 0 && (
                  <span style={{ fontSize: 10, color: C.textTert, flexShrink: 0 }}>+{moreCount}件</span>
                )}
                <span style={{ fontSize: 10, color: C.textTert, flexShrink: 0 }}>{showCoverageDetail ? '▴' : '▾'}</span>
              </div>
            </div>

            {/* 副标题 */}
            <div style={{ fontSize: 12, color: C.textSec, marginTop: 4, lineHeight: 1.6 }}>
              为每个面容配置穿搭（上身 / 下身 / 鞋子），再生成定装照。同一面容可创建多套穿搭，形成多个独立伴播形象。
            </div>

            {/* 覆盖详情（展开） */}
            {showCoverageDetail && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8, padding: '8px 10px', borderRadius: 8, background: '#FAFBFC', border: `1px solid ${C.border}` }}>
                {state.selectedProductIds.map(pid => {
                  const p = CARGO_PRODUCTS.find(prod => prod.id === pid)
                  if (!p) return null
                  const covered = coveredIds.has(pid)
                  return (
                    <span key={pid} style={{
                      fontSize: 11, padding: '2px 9px', borderRadius: 20,
                      background: covered ? '#E6F9EF' : '#FFF7ED',
                      color: covered ? '#1A7A3A' : '#875800',
                      border: `1px solid ${covered ? '#C3E6CB' : '#FECF8A'}`,
                      fontWeight: covered ? 400 : 600,
                    }}>
                      {covered ? '✓' : '○'} {p.linkNum}号 {p.name}
                    </span>
                  )
                })}
              </div>
            )}
          </div>
        )
      })()}

      {/* 面容横向 tabs */}
      <div style={{ padding: '10px 24px', flexShrink: 0, borderBottom: `1px solid ${C.border}`, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: C.textSec, fontWeight: 600, flexShrink: 0 }}>面容：</span>
        {selectedFaceIds.length === 0 ? (
          <span style={{ fontSize: 12, color: C.textTert }}>请先在上一步选择面容</span>
        ) : selectedFaceIds.map(faceId => {
          const face = getFaceInfo(faceId)
          const count = avatarConfigs.filter(c => c.faceId === faceId).length
          const active = selectedFaceId === faceId
          const gender = getFaceGender(faceId)
          const isIp = faceTypes[faceId] === 'ip'
          return (
            <button key={faceId} onClick={() => setSelectedFaceId(faceId)} style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '5px 12px', borderRadius: 20,
              border: `1.5px solid ${active ? C.blue : C.border}`,
              background: active ? C.blueLight : '#fff',
              color: active ? C.blue : C.text,
              fontSize: 12, fontWeight: active ? 600 : 400,
              cursor: 'pointer', fontFamily: C.font,
            }}>
              <span style={{ fontSize: 16 }}>{getFaceEmoji(faceId)}</span>
              <span>{face?.name ?? faceId}</span>
              {gender && <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 8, fontWeight: 600, background: gender === 'female' ? '#FFE8F0' : '#E8F0FF', color: gender === 'female' ? '#FF4D8D' : '#3370FF' }}>{gender === 'female' ? '女' : '男'}</span>}
              {isIp && <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 8, background: '#F0EDFF', color: '#7B61FF' }}>IP</span>}
              <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 8, background: active ? C.blue : '#EBEBEB', color: active ? '#fff' : C.textSec }}>{count}个</span>
            </button>
          )
        })}
      </div>

      {/* 形象卡片区 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
        {!selectedFaceId ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: C.textTert, fontSize: 13 }}>请先在上一步选择面容</div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 22 }}>{getFaceEmoji(selectedFaceId)}</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{getFaceInfo(selectedFaceId)?.name ?? selectedFaceId} 的伴播形象</span>
              <span style={{ fontSize: 12, color: C.textSec }}>（{faceConfigs.length}个）</span>
            </div>

            {currentFaceType === 'ip' && (
              <div style={{ padding: '14px', borderRadius: 10, border: `1px solid ${C.green}30`, background: C.greenLight, marginBottom: 16, fontSize: 12, color: C.textSec, lineHeight: 1.7 }}>
                🎭 IP 形象使用固定造型，不与商品款式绑定，无需配置穿搭。
              </div>
            )}

            {faceConfigs.map((config, idx) => (
              <AvatarCard
                key={config.id}
                config={config}
                index={idx}
                totalForFace={faceConfigs.length}
                colorIdx={avatarConfigs.indexOf(config)}
                generatingId={generatingId}
                isExpanded={isCardExpanded(config)}
                onExpand={() => setCardExpanded(config.id, true)}
                onCollapse={() => setCardExpanded(config.id, false)}
                onSlotClick={(slotKey) => openSlotModal(config.id, slotKey)}
                onSlotRemove={(slotKey) => handleRemoveSlot(config.id, slotKey)}
                onDelete={faceConfigs.length > 1 ? () => deleteConfig(config.id) : undefined}
                onGenerate={() => generatePortrait(config.id)}
                onDoRegenerate={(c) => doRegenerate(config.id, c)}
                onApplyRound={(roundId) => applyPortraitRound(config.id, roundId)}
                onBackToReviewing={() => backToReviewing(config.id)}
                onUpdateField={(patch) => updateConfig(config.id, patch)}
                getFaceEmoji={getFaceEmoji}
              />
            ))}

            {currentFaceType !== 'ip' && (
              <button onClick={() => addAvatarForFace(selectedFaceId)} style={{
                width: '100%', padding: '12px 0', borderRadius: 10, marginTop: 4,
                border: `1.5px dashed ${C.blue}`, background: C.blueLight,
                color: C.blue, fontSize: 13, fontWeight: 600,
                cursor: 'pointer', fontFamily: C.font,
              }}>+ 新增形象</button>
            )}
          </>
        )}
      </div>

      {/* 底部导航 */}
      <div style={{ padding: '16px 24px', borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', flexShrink: 0 }}>
        <button onClick={onPrev} style={{ padding: '10px 24px', borderRadius: 8, border: `1px solid ${C.border}`, background: '#fff', color: C.text, fontSize: 14, cursor: 'pointer', fontFamily: C.font }}>← 上一步</button>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
          {validAvatarCount === 0 && !generatingId && (
            <div style={{ fontSize: 11, color: C.textTert }}>请先完成至少一个形象的定装照</div>
          )}
          {validAvatarCount > 0 && incompletePortraitCount > 0 && (
            <div style={{ fontSize: 11, color: C.textTert }}>另有 {incompletePortraitCount} 个形象未完成定装照，不会参与技能配置</div>
          )}
          <button
            onClick={onNext}
            disabled={generatingId !== null || validAvatarCount === 0}
            style={{
              padding: '10px 32px', borderRadius: 8, border: 'none',
              background: (generatingId || validAvatarCount === 0) ? C.border : uncoveredCount === 0 ? C.blue : C.orange,
              color: '#fff', fontSize: 14, fontWeight: 600,
              cursor: (generatingId || validAvatarCount === 0) ? 'not-allowed' : 'pointer', fontFamily: C.font,
            }}
          >
            {generatingId ? '生成中...' : uncoveredCount === 0 ? '确认形象，下一步 →' : `仍有 ${uncoveredCount} 件未关联，继续 →`}
          </button>
        </div>
      </div>

      {/* ── 槽位选择弹窗（两步）── */}
      {slotModal && slotModalConfig && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ width: 480, maxHeight: '80%', borderRadius: 14, background: '#fff', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }}>

            {/* 弹窗头 */}
            <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
              {slotModal.step === 2 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button onClick={() => setSlotModal({ ...slotModal, step: 1, pendingProductId: null, pendingImageIdx: 0 })}
                    style={{ background: 'none', border: 'none', color: C.blue, fontSize: 13, cursor: 'pointer', padding: 0, fontFamily: C.font }}>← 返回</button>
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>选择参考图</span>
                  {step2Product && <span style={{ fontSize: 12, color: C.textSec }}>· {step2Product.linkNum}号 {step2Product.name}</span>}
                </div>
              ) : (
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>
                  {SLOT_EMOJI[slotModal.slotKey]} 选择{SLOT_LABEL[slotModal.slotKey]}商品
                </div>
              )}
              {slotModal.step === 1 && (
                <div style={{ fontSize: 12, color: '#1D6B3A', background: '#EBF7EE', border: '1px solid #C3E6CB', borderRadius: 6, padding: '5px 10px', marginTop: 8 }}>
                  📐 建议白底平铺正面图，AI 生成效果最佳
                </div>
              )}
            </div>

            {/* ── Step 1：选商品 ── */}
            {slotModal.step === 1 && (
              <>
                <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>

                  {/* 推荐商品 */}
                  {(() => {
                    const suggested = CARGO_PRODUCTS.filter(p =>
                      SLOT_SUGGESTED[slotModal.slotKey].includes(p.bodySlot) && !slotModalClaimed.has(p.id) && !slotModalOtherSlotIds.has(p.id)
                    )
                    const others = CARGO_PRODUCTS.filter(p =>
                      !SLOT_SUGGESTED[slotModal.slotKey].includes(p.bodySlot) && !slotModalClaimed.has(p.id) && !slotModalOtherSlotIds.has(p.id)
                    )
                    const claimed = CARGO_PRODUCTS.filter(p => slotModalClaimed.has(p.id) || slotModalOtherSlotIds.has(p.id))

                    const BODY_SLOT_LABEL: Record<string, string> = {
                      top: '上身', bottom: '下身', dress: '连衣裙（上下身）',
                      outer: '外套', shoes: '鞋子', accessory: '配饰',
                    }
                    const renderRow = (prod: typeof CARGO_PRODUCTS[0]) => {
                      const currentFill = slotModalConfig.outfitSlots.find(s => s.slot === slotModal.slotKey)
                      const isCurrentlySelected = currentFill?.productId === prod.id ||
                        (prod.bodySlot === 'dress' && slotModalConfig.outfitSlots.find(s => s.slot === 'top')?.productId === prod.id)
                      const typeLabel = BODY_SLOT_LABEL[prod.bodySlot] ?? prod.bodySlot
                      const genderLabel = prod.genderTag === 'female' ? '女装' : prod.genderTag === 'male' ? '男装' : null
                      const aiRef = genderLabel ? `${typeLabel} · ${genderLabel}` : typeLabel

                      return (
                        <div key={prod.id} onClick={() => handleStep1ProductClick(prod.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px', borderRadius: 8, marginBottom: 4, cursor: 'pointer', border: `1px solid ${isCurrentlySelected ? C.blue : C.border}`, background: isCurrentlySelected ? C.blueLight : '#fff', transition: 'background 0.1s' }}
                          onMouseEnter={e => { if (!isCurrentlySelected) (e.currentTarget as HTMLDivElement).style.background = '#F5F9FF' }}
                          onMouseLeave={e => { if (!isCurrentlySelected) (e.currentTarget as HTMLDivElement).style.background = '#fff' }}
                        >
                          <div style={{ width: 44, height: 54, borderRadius: 8, background: prod.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{prod.emoji}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{prod.linkNum}号 {prod.name}</div>
                            <div style={{ display: 'flex', gap: 5, marginTop: 3, alignItems: 'center', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: 11, color: C.textSec }}>{prod.price}</span>
                              <span style={{ fontSize: 10, padding: '1px 7px', borderRadius: 6, background: '#F2F3F5', color: '#6B7280' }}>AI参考：{aiRef}</span>
                            </div>
                          </div>
                          <span style={{ fontSize: 12, color: C.textTert, flexShrink: 0 }}>选择 →</span>
                        </div>
                      )
                    }

                    return (
                      <>
                        {suggested.map(p => renderRow(p))}

                        {others.length > 0 && (
                          <>
                            <div style={{ fontSize: 11, color: C.textTert, padding: '8px 4px 4px', fontWeight: 600 }}>其他商品</div>
                            {others.map(p => renderRow(p))}
                          </>
                        )}

                        {claimed.length > 0 && (
                          <>
                            <div style={{ fontSize: 11, color: C.textTert, padding: '8px 4px 4px', fontWeight: 600 }}>已占用</div>
                            {claimed.map(prod => (
                              <div key={prod.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px', borderRadius: 8, marginBottom: 4, opacity: 0.4, background: '#F9FAFB', border: `1px solid ${C.border}`, cursor: 'not-allowed' }}>
                                <div style={{ width: 44, height: 54, borderRadius: 8, background: prod.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{prod.emoji}</div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: 13, color: C.text }}>{prod.linkNum}号 {prod.name}</div>
                                  <div style={{ fontSize: 11, color: C.textTert, marginTop: 2 }}>
                                    {slotModalOtherSlotIds.has(prod.id) ? '已在本形象其他槽位使用' : '已被其他形象占用'}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </>
                        )}
                      </>
                    )
                  })()}
                </div>
                <div style={{ padding: '12px 20px', borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
                  <button onClick={() => triggerUpload(slotModal.configId, slotModal.slotKey)} style={{ width: '100%', padding: '9px 0', borderRadius: 8, fontSize: 12, border: `1px solid ${C.border}`, background: '#fff', color: C.text, cursor: 'pointer', fontFamily: C.font }}>
                    📁 从本地上传图片（不选商品）
                  </button>
                  <div style={{ fontSize: 10, color: C.textTert, textAlign: 'center', marginTop: 4 }}>支持 JPG / PNG / WebP，单张不超过 7MB，建议尺寸不超过 3072×3072</div>
                </div>
              </>
            )}

            {/* ── Step 2：选图片 ── */}
            {slotModal.step === 2 && step2Product && (
              <>
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
                  {/* 图片质量标准说明 */}
                  <div style={{ borderRadius: 8, border: '1px solid #C3E6CB', background: '#EBF7EE', padding: '10px 12px', marginBottom: 14 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#1D6B3A', marginBottom: 6 }}>📐 白底平铺高清正面图效果最佳</div>
                    <div style={{ fontSize: 11, color: '#2D7D4A', lineHeight: 1.8 }}>
                      <div>① <b>单品图</b>：仅含该商品，不含其他商品或道具</div>
                      <div>② <b>高清正面</b>：清晰、正面角度，避免侧面或俯视</div>
                      <div>③ <b>纯色背景</b>：白底最佳，避免复杂背景干扰</div>
                    </div>
                    <div style={{ fontSize: 11, color: '#875800', background: '#FFFBE6', border: '1px solid #FFD666', borderRadius: 5, padding: '4px 8px', marginTop: 8 }}>
                      ⚠️ 若下方没有符合标准的图片，建议从本地上传合格素材，否则 AI 生成效果可能受影响
                    </div>
                  </div>
                  {/* 上下身一体 toggle（仅对上身/下身槽位显示） */}
                  {(slotModal.slotKey === 'top' || slotModal.slotKey === 'bottom') && (
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', borderRadius: 8, border: `1.5px solid ${slotModal.pendingIsCombined ? C.blue : C.border}`, background: slotModal.pendingIsCombined ? C.blueLight : '#FAFBFC', marginBottom: 14, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={slotModal.pendingIsCombined}
                        onChange={e => setSlotModal({ ...slotModal, pendingIsCombined: e.target.checked })}
                        style={{ marginTop: 2, accentColor: C.blue, flexShrink: 0 }}
                      />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: slotModal.pendingIsCombined ? C.blue : C.text }}>此商品上下身一体</div>
                        <div style={{ fontSize: 11, color: C.textSec, lineHeight: 1.6 }}>连衣裙、连体裤、套装等，同时覆盖上身和下身槽位</div>
                      </div>
                    </label>
                  )}
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.textSec, marginBottom: 10 }}>
                    以下为该商品链接下的宣传图，AI 已推荐最佳选项：
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {step2Product.images.map((_, ii) => {
                      const isAi = ii === 0
                      const selected = slotModal.pendingImageIdx === ii
                      return (
                        <div key={ii} onClick={() => setSlotModal({ ...slotModal, pendingImageIdx: ii })} style={{ cursor: 'pointer', width: 90 }}>
                          <div style={{
                            width: 90, height: 108, borderRadius: 10,
                            background: THUMB_COLORS[ii % THUMB_COLORS.length],
                            border: `2.5px solid ${selected ? C.blue : C.border}`,
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
                            position: 'relative', transition: 'border-color 0.15s',
                          }}>
                            <span style={{ fontSize: 32 }}>{step2Product.emoji}</span>
                            {isAi && (
                              <div style={{ position: 'absolute', top: 5, left: 5, fontSize: 9, padding: '2px 5px', borderRadius: 4, background: selected ? C.blue : '#E8F0FF', color: selected ? '#fff' : C.blue, fontWeight: 700 }}>AI推荐</div>
                            )}
                            {selected && (
                              <div style={{ position: 'absolute', top: 5, right: 5, width: 18, height: 18, borderRadius: '50%', background: C.blue, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>✓</div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div style={{ padding: '12px 20px', borderTop: `1px solid ${C.border}`, display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button onClick={() => triggerUpload(slotModal.configId, slotModal.slotKey)} style={{ flex: 1, padding: '9px 0', borderRadius: 8, fontSize: 12, border: `1px solid ${C.border}`, background: '#fff', color: C.text, cursor: 'pointer', fontFamily: C.font }}>
                    📁 从本地上传
                  </button>
                  <button onClick={handleConfirmSelection} style={{ flex: 2, padding: '9px 0', borderRadius: 8, fontSize: 12, border: 'none', background: C.blue, color: '#fff', fontWeight: 600, cursor: 'pointer', fontFamily: C.font }}>
                    确认使用此图片
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  )
}

// ── AvatarCard ──

type PreviewInfo = { product: typeof CARGO_PRODUCTS[0] | null; imageIdx: number; source: 'product' | 'uploaded' | 'empty' }

type AvatarCardProps = {
  config: AvatarConfig
  index: number
  totalForFace: number
  colorIdx: number
  generatingId: string | null
  isExpanded: boolean
  onExpand: () => void
  onCollapse: () => void
  onSlotClick: (slotKey: FixedSlotKey) => void
  onSlotRemove: (slotKey: FixedSlotKey) => void
  onDelete?: () => void
  onGenerate: () => void
  onDoRegenerate: (c: AvatarConfig) => void
  onApplyRound: (roundId: string) => void
  onBackToReviewing: () => void
  onUpdateField: (patch: Partial<AvatarConfig>) => void
  getFaceEmoji: (id: string) => string
}

function AvatarCard({ config, index, totalForFace, colorIdx, generatingId, isExpanded, onExpand, onCollapse, onSlotClick, onSlotRemove, onDelete, onGenerate, onDoRegenerate, onApplyRound, onBackToReviewing, onUpdateField, getFaceEmoji }: AvatarCardProps) {
  const [preview, setPreview] = useState<PreviewInfo | null>(null)

  const topSlot    = config.outfitSlots.find(s => s.slot === 'top')!
  const bottomSlot = config.outfitSlots.find(s => s.slot === 'bottom')!
  const shoesSlot  = config.outfitSlots.find(s => s.slot === 'shoes')!

  const topProduct    = topSlot.productId    ? CARGO_PRODUCTS.find(p => p.id === topSlot.productId)    ?? null : null
  const bottomProduct = bottomSlot.productId ? CARGO_PRODUCTS.find(p => p.id === bottomSlot.productId) ?? null : null
  const shoesProduct  = shoesSlot.productId  ? CARGO_PRODUCTS.find(p => p.id === shoesSlot.productId)  ?? null : null

  const isDress = !!(topSlot.productId && topSlot.productId === bottomSlot.productId)
  const allSlotsFilled = topSlot.source !== 'empty' && bottomSlot.source !== 'empty' && shoesSlot.source !== 'empty'
  const canGenerate = config.mode === 'ip' || allSlotsFilled
  const cardLabel = totalForFace > 1 ? `形象 ${index + 1}` : '伴播形象'

  const appliedRound = config.portraitRounds.find(r => r.id === config.portraitAppliedRoundId) ?? null
  const portraitBg = appliedRound
    ? PORTRAIT_COLORS[appliedRound.colorIdx % PORTRAIT_COLORS.length]
    : PORTRAIT_COLORS[colorIdx % PORTRAIT_COLORS.length]
  const slotEmojis = config.outfitSlots
    .filter(s => s.productId && s.source === 'product')
    .map(s => CARGO_PRODUCTS.find(p => p.id === s.productId)?.emoji ?? '')
    .filter((e, i, arr) => e && arr.indexOf(e) === i)

  // ── compact 态 ──
  if (!isExpanded) {
    const outfitTags: string[] = []
    if (isDress && topProduct) {
      outfitTags.push(`${topProduct.emoji} ${topProduct.linkNum}号`)
    } else {
      if (topProduct) outfitTags.push(`${topProduct.emoji} ${topProduct.linkNum}号`)
      if (bottomProduct) outfitTags.push(`${bottomProduct.emoji} ${bottomProduct.linkNum}号`)
    }
    if (shoesProduct) outfitTags.push(`${shoesProduct.emoji} ${shoesProduct.linkNum}号`)
    const outfitSummary = outfitTags.join('  ·  ') || '暂无穿搭'

    return (
      <div style={{ borderRadius: 10, border: `1px solid #BBF7D0`, background: '#F0FDF4', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px' }}>
        <PortraitThumb bg={portraitBg} faceEmoji={getFaceEmoji(config.faceId)} slotEmojis={slotEmojis} confirmed />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{cardLabel}</div>
          <div style={{ fontSize: 11, color: C.textSec, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{outfitSummary}</div>
        </div>
        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: '#DCFCE7', color: '#166534', fontWeight: 600, flexShrink: 0 }}>✓ 已完成</span>
        <button onClick={onExpand} style={{ padding: '5px 12px', borderRadius: 6, fontSize: 11, border: `1px solid ${C.border}`, background: '#fff', color: C.textSec, cursor: 'pointer', fontFamily: C.font, flexShrink: 0 }}>编辑</button>
      </div>
    )
  }

  // ── 展开态 ──
  return (
    <>
      <div style={{ borderRadius: 12, border: `1px solid ${C.border}`, background: '#fff', marginBottom: 16, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#FAFBFC', borderBottom: `1px solid ${C.border}` }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{cardLabel}</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {config.portraitStatus === 'confirmed' && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: '#E6F9EF', color: C.green, fontWeight: 600 }}>✓ 定装照已确认</span>}
            {config.portraitStatus === 'confirmed' && <button onClick={onCollapse} style={{ background: 'none', border: 'none', color: C.blue, cursor: 'pointer', fontSize: 11, padding: '2px 4px', fontFamily: C.font }}>收起 ↑</button>}
            {onDelete && <button onClick={onDelete} style={{ background: 'none', border: 'none', color: C.textTert, cursor: 'pointer', fontSize: 12, padding: '2px 6px', fontFamily: C.font }}>删除</button>}
          </div>
        </div>

        {config.mode === 'ip' && (
          <div style={{ padding: '12px 14px', fontSize: 12, color: C.textSec, lineHeight: 1.7 }}>🎭 IP 形象使用固定造型，无需配置穿搭</div>
        )}

        {config.mode !== 'ip' && (
          <div style={{ padding: '12px 14px 4px' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.textSec, marginBottom: 8, letterSpacing: '0.02em' }}>穿搭槽位</div>
            {isDress ? (
              <SlotRow label="上下身一体" product={topProduct} source={topSlot.source} imageIdx={topSlot.selectedImageIndex}
                onClick={() => onSlotClick('top')} onRemove={() => onSlotRemove('top')}
                onImageClick={() => setPreview({ product: topProduct, imageIdx: topSlot.selectedImageIndex, source: topSlot.source })} />
            ) : (
              <>
                <SlotRow label="上身" product={topProduct}    source={topSlot.source}    imageIdx={topSlot.selectedImageIndex}
                  onClick={() => onSlotClick('top')}    onRemove={() => onSlotRemove('top')}
                  onImageClick={() => setPreview({ product: topProduct, imageIdx: topSlot.selectedImageIndex, source: topSlot.source })} />
                <SlotRow label="下身" product={bottomProduct} source={bottomSlot.source} imageIdx={bottomSlot.selectedImageIndex}
                  onClick={() => onSlotClick('bottom')} onRemove={() => onSlotRemove('bottom')}
                  onImageClick={() => setPreview({ product: bottomProduct, imageIdx: bottomSlot.selectedImageIndex, source: bottomSlot.source })} />
              </>
            )}
            <SlotRow label="鞋子" product={shoesProduct} source={shoesSlot.source} imageIdx={shoesSlot.selectedImageIndex}
              onClick={() => onSlotClick('shoes')} onRemove={() => onSlotRemove('shoes')}
              onImageClick={() => setPreview({ product: shoesProduct, imageIdx: shoesSlot.selectedImageIndex, source: shoesSlot.source })} />
          </div>
        )}

        <div style={{ borderTop: `1px solid ${C.border}`, padding: '12px 14px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.textSec, marginBottom: 10, letterSpacing: '0.02em' }}>定装照</div>
          {!canGenerate ? (
            <div style={{ fontSize: 12, color: C.textTert, paddingBottom: 4 }}>请先配置全部穿搭槽位（上身 / 下身 / 鞋子）</div>
          ) : (
            <PortraitSection config={config} colorIdx={colorIdx} generatingId={generatingId} onGenerate={onGenerate} onDoRegenerate={onDoRegenerate} onApplyRound={onApplyRound} onBackToReviewing={onBackToReviewing} onUpdateField={onUpdateField} getFaceEmoji={getFaceEmoji} />
          )}
        </div>
      </div>

      {/* 图片放大预览 */}
      {preview && (
        <div onClick={() => setPreview(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }}>
          <div onClick={e => e.stopPropagation()} style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 12px 48px rgba(0,0,0,0.4)' }}>
            {preview.source === 'uploaded' ? (
              <div style={{ width: 280, height: 340, background: '#E8EAED', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                <span style={{ fontSize: 56 }}>📁</span>
                <span style={{ fontSize: 13, color: '#666' }}>本地上传图片</span>
              </div>
            ) : preview.product ? (
              <div style={{ width: 280, height: 340, background: THUMB_COLORS[preview.imageIdx % THUMB_COLORS.length], display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                <span style={{ fontSize: 96 }}>{preview.product.emoji}</span>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#333' }}>{preview.product.linkNum}号 {preview.product.name}</div>
                  {preview.imageIdx === 0 && <div style={{ fontSize: 11, color: C.blue, marginTop: 4 }}>AI 推荐图</div>}
                </div>
              </div>
            ) : null}
          </div>
          <div style={{ position: 'absolute', top: 20, right: 24, fontSize: 24, color: '#fff', cursor: 'pointer', opacity: 0.8 }}>✕</div>
        </div>
      )}
    </>
  )
}

// ── SlotRow ──

function SlotRow({ label, product, source, imageIdx, onClick, onRemove, onImageClick }: {
  label: string
  product: typeof CARGO_PRODUCTS[0] | null
  source: 'product' | 'uploaded' | 'empty'
  imageIdx: number
  onClick: () => void
  onRemove: () => void
  onImageClick?: () => void
}) {
  const isEmpty = source === 'empty'
  const isUploaded = source === 'uploaded'

  const thumbBg = isUploaded
    ? '#E8EAED'
    : product
      ? THUMB_COLORS[imageIdx % THUMB_COLORS.length]
      : '#F2F3F5'

  return (
    <div onClick={isEmpty ? onClick : undefined} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, marginBottom: 7, border: `1px solid ${isEmpty ? C.border : C.blue + '50'}`, background: isEmpty ? '#FAFBFC' : '#F0F6FF', cursor: isEmpty ? 'pointer' : 'default' }}>
      <div style={{ flexShrink: 0 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#555', background: '#EFEFEF', borderRadius: 5, padding: '2px 8px', whiteSpace: 'nowrap' }}>
          {label}
        </span>
      </div>

      {isEmpty ? (
        <span style={{ flex: 1, fontSize: 12, color: C.textTert }}>+ 点击选择商品</span>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          {/* 缩略图，可点击放大 */}
          <div
            onClick={e => { e.stopPropagation(); onImageClick?.() }}
            title="点击查看大图"
            style={{ width: 32, height: 40, borderRadius: 6, background: thumbBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isUploaded ? 18 : 20, flexShrink: 0, cursor: 'zoom-in', border: `1px solid rgba(0,0,0,0.06)` }}
          >
            {isUploaded ? '📁' : (product?.emoji ?? '')}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {isUploaded ? (
              <div style={{ fontSize: 12, fontWeight: 500, color: C.text }}>已上传图片</div>
            ) : product ? (
              <div style={{ fontSize: 12, fontWeight: 500, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {product.linkNum}号 {product.name}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {!isEmpty && (
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          <button onClick={e => { e.stopPropagation(); onClick() }} style={{ padding: '3px 8px', borderRadius: 5, fontSize: 11, border: `1px solid ${C.border}`, background: '#fff', color: C.textSec, cursor: 'pointer', fontFamily: C.font }}>换</button>
          <button onClick={e => { e.stopPropagation(); onRemove() }} style={{ padding: '3px 6px', borderRadius: 5, fontSize: 13, border: 'none', background: 'none', color: C.textTert, cursor: 'pointer', fontFamily: C.font, lineHeight: 1 }}>×</button>
        </div>
      )}
    </div>
  )
}

// ── PortraitSection ──

function PortraitSection({ config, colorIdx, generatingId, onGenerate, onDoRegenerate, onApplyRound, onBackToReviewing, onUpdateField, getFaceEmoji }: {
  config: AvatarConfig; colorIdx: number; generatingId: string | null
  onGenerate: () => void
  onDoRegenerate: (c: AvatarConfig) => void
  onApplyRound: (roundId: string) => void
  onBackToReviewing: () => void
  onUpdateField: (patch: Partial<AvatarConfig>) => void
  getFaceEmoji: (id: string) => string
}) {
  const [showRegenForm, setShowRegenForm] = useState(false)
  const [previewRoundId, setPreviewRoundId] = useState<string | null>(null)

  const { portraitStatus, portraitAdjustCount, portraitPrompt, portraitRounds, portraitAppliedRoundId, portraitViewingRoundId } = config
  const isGenerating = generatingId === config.id

  const viewingId = previewRoundId ?? portraitViewingRoundId ?? (portraitRounds[portraitRounds.length - 1]?.id ?? null)
  const viewingRound = portraitRounds.find(r => r.id === viewingId) ?? portraitRounds[portraitRounds.length - 1] ?? null
  const appliedRound = portraitRounds.find(r => r.id === portraitAppliedRoundId) ?? null

  const slotEmojis = config.outfitSlots
    .filter(s => s.productId && s.source === 'product')
    .map(s => CARGO_PRODUCTS.find(p => p.id === s.productId)?.emoji ?? '')
    .filter((e, i, arr) => e && arr.indexOf(e) === i)

  // ── pending ──
  if (portraitStatus === 'pending') return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 80, height: 100, borderRadius: 10, background: '#F2F3F5', border: `1.5px dashed ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ fontSize: 28, opacity: 0.2 }}>🖼</span>
      </div>
      <div>
        <div style={{ fontSize: 12, color: C.textSec, marginBottom: 10, lineHeight: 1.6 }}>AI 将面容与穿搭参考图合成一张完整定装照</div>
        <button onClick={onGenerate} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: C.blue, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: C.font }}>生成定装照</button>
      </div>
    </div>
  )

  // ── generating ──
  if (portraitStatus === 'generating' || isGenerating) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 0' }}>
      <div style={{ width: 22, height: 22, borderRadius: '50%', border: `3px solid ${C.blue}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div>
        <div style={{ fontSize: 12, fontWeight: 500, color: C.text }}>AI 合成中</div>
        <div style={{ fontSize: 11, color: C.textSec }}>通常需要 15–30 秒</div>
      </div>
    </div>
  )

  // ── reviewing / confirmed ──
  if (portraitStatus === 'reviewing' || portraitStatus === 'confirmed') {
    const displayRound = portraitStatus === 'confirmed' ? (appliedRound ?? viewingRound) : viewingRound
    const displayBg = displayRound ? PORTRAIT_COLORS[displayRound.colorIdx % PORTRAIT_COLORS.length] : PORTRAIT_COLORS[colorIdx % PORTRAIT_COLORS.length]

    return (
      <div>
        {/* 历史轮次缩略图条（reviewing 且多轮时才显示） */}
        {portraitStatus === 'reviewing' && portraitRounds.length > 1 && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, color: C.textSec, marginBottom: 5 }}>
              每次生成的图片均已保存，可随时点击切换查看
            </div>
          <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 2 }}>
            {portraitRounds.map((r, i) => {
              const bg = PORTRAIT_COLORS[r.colorIdx % PORTRAIT_COLORS.length]
              const isViewing = r.id === viewingId
              return (
                <div key={r.id} onClick={() => setPreviewRoundId(r.id)} style={{ flexShrink: 0, cursor: 'pointer' }}>
                  <div style={{ width: 52, height: 65, borderRadius: 8, background: `linear-gradient(160deg,${bg},${bg}88)`, border: `2.5px solid ${isViewing ? C.blue : C.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                    <span style={{ fontSize: 22 }}>{getFaceEmoji(config.faceId)}</span>
                    {slotEmojis.length > 0 && <div style={{ display: 'flex' }}>{slotEmojis.map((e, j) => <span key={j} style={{ fontSize: 10 }}>{e}</span>)}</div>}
                  </div>
                  <div style={{ fontSize: 9, color: isViewing ? C.blue : C.textTert, textAlign: 'center', marginTop: 2, fontWeight: isViewing ? 600 : 400 }}>第{i + 1}轮</div>
                </div>
              )
            })}
          </div>
          </div>
        )}

        {/* 大图预览区 */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <PortraitThumb
            bg={displayBg}
            faceEmoji={getFaceEmoji(config.faceId)}
            slotEmojis={slotEmojis}
            confirmed={portraitStatus === 'confirmed'}
            adjustCount={portraitAdjustCount}
            large
          />

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
            {portraitStatus === 'reviewing' && (
              <>
                <div style={{ fontSize: 11, color: C.textSec, lineHeight: 1.6 }}>
                  {portraitRounds.length > 1 ? `第 ${portraitRounds.findIndex(r => r.id === viewingId) + 1}/${portraitRounds.length} 轮` : '已生成'}，确认满意后点击应用。
                </div>
                <button onClick={() => { onApplyRound(viewingId!); setShowRegenForm(false) }} style={{ padding: '7px 0', borderRadius: 8, border: 'none', background: C.green, color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: C.font }}>✓ 应用这张</button>
                {portraitAdjustCount < MAX_ADJUST ? (
                  <button onClick={() => setShowRegenForm(v => !v)} style={{ padding: '6px 0', borderRadius: 8, fontSize: 11, border: `1px solid ${C.orange}`, background: showRegenForm ? '#FFF4E6' : '#fff', color: C.orange, cursor: 'pointer', fontFamily: C.font }}>
                    {showRegenForm ? '收起' : `↺ 重新生成（已用 ${portraitAdjustCount}/${MAX_ADJUST} 次）`}
                  </button>
                ) : (
                  <div style={{ fontSize: 11, color: C.textTert }}>已达重新生成上限（{MAX_ADJUST} 次）</div>
                )}
              </>
            )}

            {portraitStatus === 'confirmed' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 15, height: 15, borderRadius: '50%', background: C.green, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700 }}>✓</div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.green }}>定装照已确认</span>
                </div>
                <button onClick={() => { onBackToReviewing(); setShowRegenForm(false) }} style={{ padding: '6px 0', borderRadius: 8, fontSize: 11, border: `1px solid ${C.border}`, background: '#fff', color: C.textSec, cursor: 'pointer', fontFamily: C.font }}>重新查看 / 调整</button>
              </>
            )}
          </div>
        </div>

        {/* 重新生成表单 */}
        {showRegenForm && (
          <div style={{ marginTop: 12 }}>
            {/* 抽卡说明 */}
            <div style={{ borderRadius: 8, border: `1px solid ${C.blue}30`, background: C.blueLight, padding: '8px 10px', marginBottom: 8, fontSize: 11, color: C.blue, lineHeight: 1.7 }}>
              🎲 每次重新生成相互独立，基于概率随机产出，与上一张无关。首次结果有瑕疵时，多次重新生成可提高抽到优质图的概率。
            </div>

            {/* 自检引导 */}
            <div style={{ borderRadius: 8, border: '1px solid #FFD666', background: '#FFFBE6', padding: '10px 12px', marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#875800', marginBottom: 6 }}>💡 生成前先自检素材图</div>
              <div style={{ fontSize: 11, color: '#875800', lineHeight: 1.9 }}>
                <div>① 图片是否清晰？模糊图会导致细节丢失</div>
                <div>② 关键部位是否被遮挡？（领口 / 袖子 / 裤脚）</div>
                <div>③ 背景是否复杂？建议纯色或白底</div>
              </div>
              <div style={{ fontSize: 11, color: '#5C3D00', marginTop: 6, fontWeight: 600 }}>有问题 → 返回穿搭槽位换图，效果远好于反复调整提示词</div>
            </div>

            {/* 描述输入（可选） */}
            <div style={{ fontSize: 11, color: C.textSec, marginBottom: 5, fontWeight: 600 }}>
              描述修改需求
              <span style={{ fontWeight: 400, color: C.textTert, marginLeft: 4 }}>（可选，留空可直接重新生成）</span>
            </div>
            <textarea
              value={portraitPrompt}
              onChange={e => onUpdateField({ portraitPrompt: e.target.value })}
              placeholder="将上衣颜色改为深海蓝 / 将裙摆改为A字型 / 将裤长改为九分"
              rows={2}
              style={{ width: '100%', padding: '7px 9px', borderRadius: 8, fontSize: 11, border: `1px solid ${C.border}`, outline: 'none', resize: 'none', fontFamily: C.font, boxSizing: 'border-box', lineHeight: 1.6 }}
            />
            <div style={{ fontSize: 10, color: C.textTert, marginBottom: 8 }}>格式建议：将 [部位] 从 [现状] 改为 [目标]，越具体越准确</div>
            <div style={{ display: 'flex', gap: 7 }}>
              <button onClick={() => setShowRegenForm(false)} style={{ flex: 1, padding: '7px 0', borderRadius: 8, fontSize: 11, border: `1px solid ${C.border}`, background: '#fff', color: C.textSec, cursor: 'pointer', fontFamily: C.font }}>取消</button>
              <button
                onClick={() => { onDoRegenerate(config); setShowRegenForm(false) }}
                style={{ flex: 2, padding: '7px 0', borderRadius: 8, fontSize: 11, border: 'none', background: C.blue, color: '#fff', fontWeight: 600, cursor: 'pointer', fontFamily: C.font }}
              >重新生成</button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return null
}

function PortraitThumb({ bg, faceEmoji, slotEmojis, confirmed, adjustCount, large }: {
  bg: string; faceEmoji: string; slotEmojis: string[]; confirmed?: boolean; adjustCount?: number; large?: boolean
}) {
  const w = large ? 104 : 72
  const h = large ? 128 : 90
  return (
    <div style={{ width: w, height: h, borderRadius: 10, flexShrink: 0, background: `linear-gradient(160deg, ${bg}, ${bg}88)`, border: `2px solid ${confirmed ? C.green : C.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
      <span style={{ fontSize: large ? 40 : 28 }}>{faceEmoji}</span>
      {slotEmojis.length > 0 && <div style={{ display: 'flex', gap: 1 }}>{slotEmojis.map((e, i) => <span key={i} style={{ fontSize: large ? 16 : 13 }}>{e}</span>)}</div>}
      {adjustCount !== undefined && adjustCount > 0 && <span style={{ fontSize: 9, color: 'rgba(0,0,0,0.35)' }}>已调{adjustCount}次</span>}
    </div>
  )
}

