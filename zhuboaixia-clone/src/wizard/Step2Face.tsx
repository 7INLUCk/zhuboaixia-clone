// src/wizard/Step2Face.tsx
import React, { useState, useRef, useCallback, useEffect } from 'react'
import { C } from '../shared'
import { FACE_LIBRARY } from './mockData'
import type { WizardState } from './types'

type Props = {
  state: WizardState
  onUpdate: (patch: Partial<WizardState>) => void
  onNext: () => void
  onPrev: () => void
}

type CustomFace = {
  id: string
  name: string
  gender: 'male' | 'female' | null  // null = IP 形象，不区分性别
  type: 'realistic' | 'ip'
  previewUrl: string
  color: string
  emoji: string
}

type TabId = 'library' | 'upload' | 'ai'
type UploadPhase = 'upload' | 'config' | 'generating' | 'confirm'

export default function Step2Face({ state, onUpdate, onNext, onPrev }: Props) {
  const { selectedFaceIds } = state
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all')
  const [activeTab, setActiveTab] = useState<TabId>('library')
  const [confirmPendingId, setConfirmPendingId] = useState<string | null>(null)

  // Upload tab state
  const [uploadPhase, setUploadPhase] = useState<UploadPhase>('upload')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadGender, setUploadGender] = useState<'male' | 'female'>('female')
  const [uploadType, setUploadType] = useState<'realistic' | 'ip'>('realistic')
  const [typeAutoDetected, setTypeAutoDetected] = useState(false)
  const [genderAutoDetected, setGenderAutoDetected] = useState(false)
  const [uploadName, setUploadName] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  // Upload generation state
  const [generateStep, setGenerateStep] = useState(0)
  const [generateCount, setGenerateCount] = useState(0)
  const MAX_GENERATE = 3

  // AI 定制 tab state
  const [aiPhase, setAiPhase] = useState<'form' | 'generating' | 'confirm'>('form')
  const [aiPersonType, setAiPersonType] = useState<'adult' | 'child'>('adult')
  const [aiGender, setAiGender] = useState<'female' | 'male'>('female')
  const [aiAge, setAiAge] = useState<'18-22' | '23-28' | '29-35' | '35+'>('23-28')
  const [aiSkin, setAiSkin] = useState<'fair' | 'natural' | 'wheat'>('natural')
  const [aiHairLength, setAiHairLength] = useState<'short' | 'medium' | 'long'>('long')
  const [aiHairStyle, setAiHairStyle] = useState<string>('straight')
  const [aiMaleHair, setAiMaleHair] = useState<string>('clean')
  const [aiVibe, setAiVibe] = useState<string>('')
  const [aiNote, setAiNote] = useState('')
  const [aiName, setAiName] = useState('')
  // 儿童专属
  const [aiChildAge, setAiChildAge] = useState<'3-6' | '6-10' | '10-15'>('6-10')
  const [aiChildHair, setAiChildHair] = useState<string>('')  // 因性别而异，初始空
  const [aiChildVibe, setAiChildVibe] = useState<string>('')
  const [aiGenerateCount, setAiGenerateCount] = useState(0)
  const [aiGenerateStep, setAiGenerateStep] = useState(0)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [customFaces, setCustomFaces] = useState<CustomFace[]>([])

  const findFace = (id: string) =>
    FACE_LIBRARY.find(f => f.id === id) ?? customFaces.find(f => f.id === id) ?? null

  const filtered = FACE_LIBRARY.filter(f => {
    if (genderFilter !== 'all' && f.gender !== genderFilter) return false
    return true
  })

  const applyGenderConstraint = (id: string, gender: 'male' | 'female' | null, currentIds: string[]) => {
    if (gender === null) {
      if (currentIds.length < 2) return [...currentIds, id]
      return [...currentIds.slice(0, currentIds.length - 1), id]
    }
    const sameGenderId = currentIds.find(sid => findFace(sid)?.gender === gender)
    if (sameGenderId) return currentIds.map(sid => sid === sameGenderId ? id : sid)
    return [...currentIds, id]
  }

  const doSelect = (id: string) => {
    const face = findFace(id)
    if (!face) return
    const libFace = FACE_LIBRARY.find(f => f.id === id)
    const faceType: 'ip' | 'realistic' = libFace ? 'realistic' : ((face as CustomFace).type ?? 'realistic')
    onUpdate({
      selectedFaceIds: applyGenderConstraint(id, face.gender, selectedFaceIds),
      faceTypes: { ...state.faceTypes, [id]: faceType },
    })
  }

  const toggle = (id: string) => {
    const face = findFace(id)
    if (!face) return
    if (selectedFaceIds.includes(id)) {
      onUpdate({ selectedFaceIds: selectedFaceIds.filter(x => x !== id) })
    } else {
      const isLibraryFace = !!FACE_LIBRARY.find(f => f.id === id)
      if (isLibraryFace) {
        setConfirmPendingId(id)
      } else {
        doSelect(id)
      }
    }
  }

  // File handling
  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件（JPG / PNG / WEBP）')
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    const detectedType: 'realistic' | 'ip' = Math.random() > 0.35 ? 'realistic' : 'ip'
    setUploadType(detectedType)
    setTypeAutoDetected(true)
    if (detectedType === 'realistic') {
      setUploadGender(Math.random() > 0.5 ? 'female' : 'male')
      setGenderAutoDetected(true)
    } else {
      setGenderAutoDetected(false)
    }
    setUploadName(file.name.replace(/\.[^.]+$/, ''))
    setUploadPhase('config')
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [])

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }
  const onDragLeave = () => setIsDragging(false)

  // Generation mock: 2 steps with timeouts
  const runGenerate = () => {
    setGenerateStep(0)
    setUploadPhase('generating')
    setTimeout(() => setGenerateStep(1), 1800)
    setTimeout(() => setUploadPhase('confirm'), 4200)
  }

  const handleUseThisFace = () => {
    if (uploadType === 'ip') {
      // IP 直接入库，不走生图
      commitFace()
    } else {
      setGenerateCount(1)
      runGenerate()
    }
  }

  const handleRegenerate = () => {
    setGenerateCount(c => c + 1)
    runGenerate()
  }

  const commitFace = () => {
    const id = `custom_${Date.now()}`
    const effectiveGender: 'male' | 'female' | null = uploadType === 'ip' ? null : uploadGender
    const defaultName = uploadType === 'ip'
      ? '自定义 IP 形象'
      : effectiveGender === 'female' ? '自定义女性形象' : '自定义男性形象'
    const face: CustomFace = {
      id,
      name: uploadName.trim() || defaultName,
      gender: effectiveGender,
      type: uploadType,
      previewUrl: previewUrl!,
      color: uploadType === 'ip' ? '#E8F5E9' : effectiveGender === 'female' ? '#FFD0E8' : '#B3D4FF',
      emoji: uploadType === 'ip' ? '🎭' : effectiveGender === 'female' ? '👩' : '👨',
    }
    setCustomFaces(prev => [...prev, face])
    onUpdate({ selectedFaceIds: applyGenderConstraint(id, effectiveGender, selectedFaceIds) })
    resetUpload()
    setActiveTab('library')
  }

  const resetUpload = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setUploadName('')
    setTypeAutoDetected(false)
    setGenderAutoDetected(false)
    setGenerateStep(0)
    setGenerateCount(0)
    setUploadPhase('upload')
  }

  // AI 定制：运行生成
  const runAiGenerate = () => {
    setAiGenerateStep(0)
    setAiPhase('generating')
    setTimeout(() => setAiGenerateStep(1), 1800)
    setTimeout(() => setAiPhase('confirm'), 4200)
  }

  const startAiGenerate = () => {
    setAiGenerateCount(1)
    runAiGenerate()
  }

  const rerunAiGenerate = () => {
    setAiGenerateCount(c => c + 1)
    runAiGenerate()
  }

  const commitAiFace = () => {
    const id = `ai_${Date.now()}`
    let defaultName: string
    if (aiPersonType === 'child') {
      defaultName = `${aiGender === 'female' ? '女童' : '男童'}·${aiChildAge}岁·${aiChildVibe}`
    } else {
      const hairLabel = aiGender === 'female'
        ? `${aiHairLength === 'short' ? '短发' : aiHairLength === 'medium' ? '中长发' : '长发'}·${aiHairStyle === 'straight' ? '直发' : aiHairStyle === 'wavy' ? '波浪' : aiHairStyle === 'updo' ? '盘发' : '马尾'}`
        : aiMaleHair === 'clean' ? '干练利落' : aiMaleHair === 'textured' ? '造型碎发' : '时髦潮流'
      defaultName = `${aiGender === 'female' ? '女' : '男'}·${aiVibe}·${hairLabel}`
    }
    const name = aiName.trim() || defaultName
    const face: CustomFace = {
      id,
      name,
      gender: aiGender,
      type: 'realistic',
      previewUrl: '',
      color: aiGender === 'female' ? '#FFD0E8' : '#B3D4FF',
      emoji: aiPersonType === 'child' ? (aiGender === 'female' ? '👧' : '👦') : (aiGender === 'female' ? '👩' : '👨'),
    }
    setCustomFaces(prev => [...prev, face])
    onUpdate({ selectedFaceIds: applyGenderConstraint(id, aiGender, selectedFaceIds) })
    setAiPhase('form')
    setAiVibe('')
    setAiChildVibe('')
    setAiNote('')
    setAiName('')
    setAiGenerateCount(0)
    setActiveTab('library')
  }

  const resetAi = () => {
    setAiPhase('form')
    setAiGenerateCount(0)
    setAiGenerateStep(0)
  }

  // AI 定制表单是否可以提交
  const aiFormValid = aiPersonType === 'child' ? aiChildVibe !== '' : aiVibe !== ''

  // AI 定制关键词摘要（用于确认页左侧展示）
  const aiSummaryTags = aiPersonType === 'child' ? [
    aiGender === 'female' ? '女童' : '男童',
    `${aiChildAge}岁`,
    aiSkin === 'fair' ? '白皙' : aiSkin === 'natural' ? '自然肤色' : '健康小麦',
    aiChildHair || '自然发型',
    aiChildVibe,
  ] : [
    aiGender === 'female' ? '女性' : '男性',
    aiAge,
    aiSkin === 'fair' ? '白皙' : aiSkin === 'natural' ? '自然肤色' : '健康小麦',
    aiGender === 'female'
      ? `${aiHairLength === 'short' ? '短发' : aiHairLength === 'medium' ? '中长发' : '长发'}·${aiHairStyle === 'straight' ? '直发' : aiHairStyle === 'wavy' ? '波浪' : aiHairStyle === 'updo' ? '盘发' : '马尾'}`
      : aiMaleHair === 'clean' ? '干练利落' : aiMaleHair === 'textured' ? '造型碎发' : '时髦潮流',
    aiVibe,
  ]

  const FilterBtn = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button onClick={onClick} style={{
      padding: '5px 14px', borderRadius: 16, border: 'none', fontSize: 12,
      fontWeight: active ? 600 : 400,
      background: active ? C.blue : '#F2F3F5',
      color: active ? '#fff' : C.textSec,
      cursor: 'pointer', fontFamily: C.font,
    }}>{label}</button>
  )

  const TABS: { id: TabId; label: string }[] = [
    { id: 'library', label: '从形象库选' },
    { id: 'upload', label: '上传参考图' },
    { id: 'ai', label: '✨ AI 定制' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* 说明 */}
      <div style={{ padding: '20px 24px 12px', flexShrink: 0 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 6 }}>选择面容</div>
        <div style={{ fontSize: 13, color: C.textSec, marginBottom: 10 }}>
          最多选 2 个面容，后续所有伴播形象均基于所选面容生成。
        </div>
        <div style={{
          padding: '8px 12px', borderRadius: 8,
          background: '#EFF4FF', border: `1px solid ${C.blue}20`,
          fontSize: 12, color: '#1D4ED8', lineHeight: 1.6,
        }}>
          💡 <strong>建议各选一个男性和女性面容。</strong>主播讲男款商品时出男形象，讲女款时出女形象——一男一女覆盖所有品类受众，配置一次长期生效。
        </div>
      </div>

      {/* Tab 栏 */}
      <div style={{
        padding: '0 24px', flexShrink: 0,
        display: 'flex', gap: 0,
        borderBottom: `1px solid ${C.border}`,
      }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              if (uploadPhase === 'generating' || aiPhase === 'generating') return
              setActiveTab(tab.id)
            }}
            style={{
              padding: '10px 16px', border: 'none', background: 'none',
              fontSize: 13, fontFamily: C.font,
              cursor: uploadPhase === 'generating' || aiPhase === 'generating' ? 'default' : 'pointer',
              color: activeTab === tab.id ? C.blue : C.textSec,
              fontWeight: activeTab === tab.id ? 600 : 400,
              borderBottom: activeTab === tab.id ? `2px solid ${C.blue}` : '2px solid transparent',
              marginBottom: -1, transition: 'all 0.15s',
            }}
          >{tab.label}</button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', fontSize: 12, color: C.textSec }}>
          已选 {selectedFaceIds.length}/2
        </div>
      </div>

      {/* Tab 内容 */}
      <div style={{ flex: 1, overflowY: 'auto' }}>

        {/* ── Tab 1: 形象库 ── */}
        {activeTab === 'library' && (
          <div style={{ padding: '12px 24px 16px' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <FilterBtn label="全部" active={genderFilter === 'all'} onClick={() => setGenderFilter('all')} />
              <FilterBtn label="女性" active={genderFilter === 'female'} onClick={() => setGenderFilter('female')} />
              <FilterBtn label="男性" active={genderFilter === 'male'} onClick={() => setGenderFilter('male')} />
            </div>

            {/* 我上传的 */}
            {customFaces.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: C.textTert, marginBottom: 8 }}>我上传的</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
                  {customFaces
                    .filter(f => genderFilter === 'all' || f.gender === genderFilter)
                    .map(face => {
                      const selected = selectedFaceIds.includes(face.id)
                      const idx = selectedFaceIds.indexOf(face.id)
                      return (
                        <div key={face.id} onClick={() => toggle(face.id)} style={{
                          borderRadius: 12, border: `2px solid ${selected ? C.blue : C.border}`,
                          background: selected ? C.blueLight : '#fff',
                          padding: '14px 8px', textAlign: 'center', cursor: 'pointer',
                          position: 'relative', transition: 'all 0.15s',
                        }}>
                          {selected && (
                            <div style={{
                              position: 'absolute', top: 6, right: 6,
                              width: 20, height: 20, borderRadius: '50%',
                              background: C.blue, color: '#fff', fontSize: 11, fontWeight: 700,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>{idx + 1}</div>
                          )}
                          <div style={{
                            width: 64, height: 64, borderRadius: '50%',
                            background: face.color, margin: '0 auto 8px',
                            overflow: 'hidden', border: `2px solid rgba(0,0,0,0.06)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {face.previewUrl
                              ? <img src={face.previewUrl} alt={face.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : <span style={{ fontSize: 32 }}>{face.emoji}</span>
                            }
                          </div>
                          <div style={{ fontSize: 12, fontWeight: 500, color: C.text, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{face.name}</div>
                          <div style={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
                            {face.gender ? (
                              <span style={{
                                fontSize: 10, padding: '1px 6px', borderRadius: 8,
                                background: face.gender === 'female' ? '#FFE8F0' : '#E8F0FF',
                                color: face.gender === 'female' ? '#FF4D8D' : '#3370FF',
                              }}>{face.gender === 'female' ? '女' : '男'}</span>
                            ) : (
                              <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 8, background: '#F0EDFF', color: '#7B61FF' }}>IP</span>
                            )}
                            <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 8, background: '#F2F3F5', color: C.textSec }}>
                              {face.type === 'realistic' ? '写实' : '卡通'}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                </div>
                <div style={{ height: 1, background: C.border, margin: '14px 0' }} />
              </div>
            )}

            {/* 面容库 */}
            <div style={{
              padding: '8px 10px', borderRadius: 8, marginBottom: 10,
              background: '#FFFBE6', border: '1px solid #FFE58F',
              fontSize: 11, color: '#7C5800', lineHeight: 1.6,
            }}>
              🔒 <strong>独家模特机制：</strong>确认使用某个形象后，该形象将从公共库移除，成为您的专属模特，其他用户将无法再选用。
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
              {filtered.map(face => {
                const selected = selectedFaceIds.includes(face.id)
                const idx = selectedFaceIds.indexOf(face.id)
                return (
                  <div key={face.id} onClick={() => toggle(face.id)} style={{
                    borderRadius: 12, border: `2px solid ${selected ? C.blue : C.border}`,
                    background: selected ? C.blueLight : '#fff',
                    padding: '14px 8px', textAlign: 'center', cursor: 'pointer',
                    position: 'relative', transition: 'all 0.15s',
                  }}>
                    {selected && (
                      <div style={{
                        position: 'absolute', top: 6, right: 6,
                        width: 20, height: 20, borderRadius: '50%',
                        background: C.blue, color: '#fff', fontSize: 11, fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>{idx + 1}</div>
                    )}
                    <div style={{
                      width: 64, height: 64, borderRadius: '50%',
                      background: face.color, margin: '0 auto 8px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 32, border: `2px solid rgba(0,0,0,0.06)`,
                    }}>{face.emoji}</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 4 }}>{face.name}</div>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: 10, padding: '1px 6px', borderRadius: 8,
                        background: face.gender === 'female' ? '#FFE8F0' : '#E8F0FF',
                        color: face.gender === 'female' ? '#FF4D8D' : '#3370FF',
                      }}>{face.gender === 'female' ? '女' : '男'}</span>
                      <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 8, background: '#F2F3F5', color: C.textSec }}>{face.ageGroup}岁</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Tab 2: 上传参考图 ── */}
        {activeTab === 'upload' && (
          <div style={{ padding: '20px 24px' }}>

            {/* Phase 1: 拖拽上传 */}
            {uploadPhase === 'upload' && (
              <>
                {/* 图片质量提醒 */}
                <div style={{
                  padding: '10px 12px', borderRadius: 8, marginBottom: 12,
                  background: '#FFFBE6', border: '1px solid #FFE58F',
                  fontSize: 12, color: '#7C5800', lineHeight: 1.7,
                }}>
                  ⚠️ <strong>上传前请注意：</strong>请使用正脸清晰的单人照片。<br />
                  侧脸、模糊或含多人的图片可能导致处理报错或生成质量下降，后果由用户自行承担。
                </div>
                <div
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: `2px dashed ${isDragging ? C.blue : C.border}`,
                    borderRadius: 14, background: isDragging ? C.blueLight : '#FAFBFC',
                    padding: '44px 24px', textAlign: 'center',
                    transition: 'all 0.15s', cursor: 'pointer',
                  }}
                >
                  <div style={{ fontSize: 36, marginBottom: 12 }}>📁</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 6 }}>
                    拖拽图片至此，或点击上传
                  </div>
                  <div style={{ fontSize: 12, color: C.textSec, marginBottom: 16, lineHeight: 1.6 }}>
                    支持 JPG、PNG、WEBP · 图片仅用于生成数字形象，不会对外公开
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); fileInputRef.current?.click() }}
                    style={{
                      padding: '9px 24px', borderRadius: 8,
                      border: `1px solid ${C.blue}`, background: '#fff',
                      color: C.blue, fontSize: 13, fontWeight: 600,
                      cursor: 'pointer', fontFamily: C.font,
                    }}
                  >选择文件</button>
                  <input ref={fileInputRef} type="file" accept="image/*"
                    style={{ display: 'none' }} onChange={onFileChange} />
                </div>
              </>
            )}

            {/* Phase 2: 配置 */}
            {uploadPhase === 'config' && previewUrl && (
              <div style={{ display: 'flex', gap: 20 }}>
                {/* 左：图片预览 */}
                <div style={{ flexShrink: 0, width: 170 }}>
                  <div style={{ borderRadius: 12, overflow: 'hidden', border: `1px solid ${C.border}`, aspectRatio: '3/4' }}>
                    <img src={previewUrl} alt="预览" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <button onClick={resetUpload} style={{
                    marginTop: 8, width: '100%', padding: '6px 0', borderRadius: 6,
                    border: `1px solid ${C.border}`, background: '#fff',
                    color: C.textSec, fontSize: 12, cursor: 'pointer', fontFamily: C.font,
                  }}>重新上传</button>
                </div>

                {/* 右：配置 */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>

                  {/* 形象类型 */}
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 8 }}>
                      形象类型
                      {typeAutoDetected && <span style={{ fontSize: 11, fontWeight: 400, color: C.green, marginLeft: 6 }}>✓ 已自动识别</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {[
                        { id: 'realistic' as const, label: '写实真人', desc: '贴近真实人物' },
                        { id: 'ip' as const, label: 'IP 卡通', desc: '动漫风格角色' },
                      ].map(t => (
                        <div key={t.id} onClick={() => {
                          setUploadType(t.id)
                          if (t.id === 'ip') setGenderAutoDetected(false)
                        }} style={{
                          flex: 1, padding: '9px 12px', borderRadius: 8, cursor: 'pointer',
                          border: `1.5px solid ${uploadType === t.id ? C.blue : C.border}`,
                          background: uploadType === t.id ? C.blueLight : '#fff',
                          transition: 'all 0.15s',
                        }}>
                          <div style={{ fontSize: 13, fontWeight: uploadType === t.id ? 600 : 500, color: uploadType === t.id ? C.blue : C.text }}>{t.label}</div>
                          <div style={{ fontSize: 11, color: C.textSec, marginTop: 2 }}>{t.desc}</div>
                        </div>
                      ))}
                    </div>
                    {typeAutoDetected && <div style={{ fontSize: 11, color: C.textTert, marginTop: 4 }}>识别有误？手动切换即可覆盖</div>}
                  </div>

                  {/* 性别（仅写实） */}
                  {uploadType === 'realistic' ? (
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 8 }}>
                        性别
                        {genderAutoDetected && <span style={{ fontSize: 11, fontWeight: 400, color: C.green, marginLeft: 6 }}>✓ 已自动识别</span>}
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {(['female', 'male'] as const).map(g => (
                          <button key={g} onClick={() => setUploadGender(g)} style={{
                            flex: 1, padding: '7px 0', borderRadius: 8, fontSize: 13,
                            border: `1.5px solid ${uploadGender === g ? C.blue : C.border}`,
                            background: uploadGender === g ? C.blueLight : '#fff',
                            color: uploadGender === g ? C.blue : C.text,
                            fontWeight: uploadGender === g ? 600 : 400,
                            cursor: 'pointer', fontFamily: C.font,
                          }}>{g === 'female' ? '👩 女性' : '👨 男性'}</button>
                        ))}
                      </div>
                      {genderAutoDetected && <div style={{ fontSize: 11, color: C.textTert, marginTop: 4 }}>识别有误？手动选择即可覆盖</div>}
                    </div>
                  ) : (
                    <div style={{ padding: '8px 12px', borderRadius: 8, background: '#F2F3F5', fontSize: 12, color: C.textSec, lineHeight: 1.6 }}>
                      🎭 IP 卡通形象不区分性别，可与任意面容搭配使用
                    </div>
                  )}

                  {/* 名称 */}
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 8 }}>形象名称</div>
                    <input value={uploadName} onChange={e => setUploadName(e.target.value)}
                      placeholder={uploadType === 'ip' ? '自定义 IP 形象' : uploadGender === 'female' ? '自定义女性形象' : '自定义男性形象'}
                      style={{
                        width: '100%', padding: '8px 12px', borderRadius: 8, fontSize: 13,
                        border: `1px solid ${C.border}`, outline: 'none',
                        fontFamily: C.font, color: C.text, boxSizing: 'border-box',
                      }} />
                  </div>

                  {/* 替换提示 */}
                  {uploadType === 'realistic' && selectedFaceIds.some(id => findFace(id)?.gender === uploadGender) && (
                    <div style={{ padding: '8px 12px', borderRadius: 8, background: '#FFF7E6', border: '1px solid #FFD591', fontSize: 12, color: '#8B5E00', lineHeight: 1.6 }}>
                      ⚠️ 已选的{uploadGender === 'female' ? '女性' : '男性'}面容将被替换为此上传形象
                    </div>
                  )}
                  {uploadType === 'ip' && selectedFaceIds.length >= 2 && (
                    <div style={{ padding: '8px 12px', borderRadius: 8, background: '#FFF7E6', border: '1px solid #FFD591', fontSize: 12, color: '#8B5E00', lineHeight: 1.6 }}>
                      ⚠️ 已选满 2 个面容，将替换最后一个
                    </div>
                  )}

                  {/* 确认按钮 */}
                  <button onClick={handleUseThisFace} style={{
                    padding: '12px 0', borderRadius: 8, border: 'none',
                    background: C.blue, color: '#fff', fontSize: 14, fontWeight: 600,
                    cursor: 'pointer', fontFamily: C.font, marginTop: 'auto',
                  }}>✓ 使用此面容</button>
                </div>
              </div>
            )}

            {/* Phase 3a: 生成中 */}
            {uploadPhase === 'generating' && (
              <div style={{ padding: '60px 0', textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>
                  <SpinDot large />
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 8 }}>形象处理中</div>
                <div style={{ fontSize: 12, color: C.textTert }}>通常需要 15–30 秒，请稍候</div>
              </div>
            )}

            {/* Phase 3b: 确认结果 */}
            {uploadPhase === 'confirm' && previewUrl && (
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 16 }}>确认生成结果</div>
                {/* 双图对比 */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 20, maxWidth: 360 }}>
                  {/* 参考图 */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: C.textSec, marginBottom: 6, textAlign: 'center' }}>参考图</div>
                    <div style={{ borderRadius: 10, overflow: 'hidden', border: `1px solid ${C.border}`, aspectRatio: '3/4' }}>
                      <img src={previewUrl} alt="参考图" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  </div>
                  {/* 处理结果 mock */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: C.textSec, marginBottom: 6, textAlign: 'center' }}>处理结果</div>
                    <div style={{
                      borderRadius: 10, border: `1px solid ${C.border}`, aspectRatio: '3/4',
                      background: 'linear-gradient(160deg, #E8F0FF 0%, #F0E8FF 100%)',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', gap: 8,
                    }}>
                      <div style={{ fontSize: 32 }}>🧍</div>
                      <div style={{ fontSize: 11, color: C.textSec, textAlign: 'center', lineHeight: 1.5, padding: '0 12px' }}>
                        白衬衫白裤子<br />正面素体形象
                      </div>
                    </div>
                  </div>
                </div>
                {/* 名称 */}
                <div style={{ fontSize: 12, color: C.textSec, marginBottom: 16, textAlign: 'center' }}>
                  {uploadName.trim() || (uploadGender === 'female' ? '自定义女性形象' : '自定义男性形象')}
                </div>
                {/* 操作按钮 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button onClick={commitFace} style={{
                    padding: '12px 0', borderRadius: 8, border: 'none',
                    background: C.blue, color: '#fff', fontSize: 14, fontWeight: 600,
                    cursor: 'pointer', fontFamily: C.font,
                  }}>✓ 确认使用</button>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={handleRegenerate}
                      disabled={generateCount >= MAX_GENERATE}
                      style={{
                        flex: 1, padding: '9px 0', borderRadius: 8, fontSize: 13,
                        border: `1px solid ${generateCount >= MAX_GENERATE ? C.border : C.blue}`,
                        background: '#fff',
                        color: generateCount >= MAX_GENERATE ? C.textTert : C.blue,
                        cursor: generateCount >= MAX_GENERATE ? 'not-allowed' : 'pointer',
                        fontFamily: C.font,
                      }}
                    >
                      🔄 重新生成{generateCount >= MAX_GENERATE ? '（已达上限）' : `（${generateCount}/${MAX_GENERATE}）`}
                    </button>
                    <button onClick={resetUpload} style={{
                      flex: 1, padding: '9px 0', borderRadius: 8, fontSize: 13,
                      border: `1px solid ${C.border}`, background: '#fff',
                      color: C.textSec, cursor: 'pointer', fontFamily: C.font,
                    }}>← 重新上传</button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ── Tab 3: AI 定制 ── */}
        {activeTab === 'ai' && (
          <div style={{ padding: '16px 24px 24px' }}>

            {/* 表单 */}
            {aiPhase === 'form' && (() => {
              const SectionLabel = ({ children }: { children: React.ReactNode }) => (
                <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 8 }}>{children}</div>
              )
              const ChipRow = ({ children }: { children: React.ReactNode }) => (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{children}</div>
              )
              const Chip = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
                <button onClick={onClick} style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: 12, fontFamily: C.font, cursor: 'pointer',
                  border: `1.5px solid ${active ? C.blue : C.border}`,
                  background: active ? C.blueLight : '#fff',
                  color: active ? C.blue : C.text,
                  fontWeight: active ? 600 : 400,
                }}>{label}</button>
              )

              const femaleVibes = ['甜美邻家', '知性优雅', '御姐气场', '阳光活力', '清新自然']
              const maleVibes = ['成熟稳重', '帅气潮流', '亲和专业', '阳光活力']
              const childFemaleVibes = ['活泼可爱', '文静乖巧', '甜美萌系', '阳光运动']
              const childMaleVibes = ['活泼可爱', '阳光运动', '帅气酷炫', '文静乖巧']
              const childFemaleHairs = ['双马尾', '丸子头', '刘海直发', '短发']
              const childMaleHairs = ['平头利落', '自然碎发', '刘海造型']

              const VibeGrid = ({ vibes, current, onSelect }: { vibes: string[]; current: string; onSelect: (v: string) => void }) => (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {vibes.map(v => (
                    <div key={v} onClick={() => onSelect(v)} style={{
                      padding: '9px 10px', borderRadius: 8, cursor: 'pointer', textAlign: 'center',
                      border: `1.5px solid ${current === v ? C.blue : C.border}`,
                      background: current === v ? C.blueLight : '#fff',
                      fontSize: 12, fontWeight: current === v ? 600 : 400,
                      color: current === v ? C.blue : C.text,
                    }}>{v}</div>
                  ))}
                </div>
              )

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                  {/* 人群类型 */}
                  <div>
                    <SectionLabel>人群类型</SectionLabel>
                    <div style={{ display: 'flex', gap: 10 }}>
                      {[
                        { id: 'adult' as const, emoji: '👤', label: '成人形象', desc: '18岁以上' },
                        { id: 'child' as const, emoji: '🧒', label: '儿童形象', desc: '3–15岁' },
                      ].map(t => (
                        <div key={t.id} onClick={() => {
                          setAiPersonType(t.id)
                          setAiVibe('')
                          setAiChildVibe('')
                          setAiChildHair('')
                        }} style={{
                          flex: 1, padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                          border: `1.5px solid ${aiPersonType === t.id ? C.blue : C.border}`,
                          background: aiPersonType === t.id ? C.blueLight : '#fff',
                          display: 'flex', alignItems: 'center', gap: 10,
                        }}>
                          <span style={{ fontSize: 22 }}>{t.emoji}</span>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: aiPersonType === t.id ? 600 : 500, color: aiPersonType === t.id ? C.blue : C.text }}>{t.label}</div>
                            <div style={{ fontSize: 11, color: C.textSec }}>{t.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 性别 */}
                  <div>
                    <SectionLabel>性别</SectionLabel>
                    <ChipRow>
                      {(['female', 'male'] as const).map(g => (
                        <Chip key={g}
                          label={aiPersonType === 'child'
                            ? (g === 'female' ? '👧 女童' : '👦 男童')
                            : (g === 'female' ? '👩 女性' : '👨 男性')}
                          active={aiGender === g}
                          onClick={() => { setAiGender(g); setAiVibe(''); setAiChildVibe(''); setAiChildHair('') }} />
                      ))}
                    </ChipRow>
                  </div>

                  {/* 年龄段 */}
                  <div>
                    <SectionLabel>年龄段</SectionLabel>
                    {aiPersonType === 'adult' ? (
                      <ChipRow>
                        {(['18-22', '23-28', '29-35', '35+'] as const).map(a => (
                          <Chip key={a} label={a === '18-22' ? '18–22 青春' : a === '23-28' ? '23–28 年轻' : a === '29-35' ? '29–35 成熟' : '35+ 稳重'}
                            active={aiAge === a} onClick={() => setAiAge(a)} />
                        ))}
                      </ChipRow>
                    ) : (
                      <ChipRow>
                        {(['3-6', '6-10', '10-15'] as const).map(a => (
                          <Chip key={a} label={a === '3-6' ? '3–6 幼儿' : a === '6-10' ? '6–10 小学' : '10–15 少年'}
                            active={aiChildAge === a} onClick={() => setAiChildAge(a)} />
                        ))}
                      </ChipRow>
                    )}
                  </div>

                  {/* 肤色 */}
                  <div>
                    <SectionLabel>肤色</SectionLabel>
                    <ChipRow>
                      {[
                        { id: 'fair', label: '⬜ 白皙' },
                        { id: 'natural', label: '🟨 自然肤色' },
                        { id: 'wheat', label: '🟫 健康小麦' },
                      ].map(s => (
                        <Chip key={s.id} label={s.label} active={aiSkin === s.id}
                          onClick={() => setAiSkin(s.id as typeof aiSkin)} />
                      ))}
                    </ChipRow>
                  </div>

                  {/* 发型 */}
                  <div>
                    <SectionLabel>发型</SectionLabel>
                    {aiPersonType === 'adult' ? (
                      aiGender === 'female' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <ChipRow>
                            {[{ id: 'short', label: '短发' }, { id: 'medium', label: '中长发' }, { id: 'long', label: '长发' }].map(h => (
                              <Chip key={h.id} label={h.label} active={aiHairLength === h.id}
                                onClick={() => setAiHairLength(h.id as typeof aiHairLength)} />
                            ))}
                          </ChipRow>
                          <ChipRow>
                            {[{ id: 'straight', label: '直发' }, { id: 'wavy', label: '波浪卷' }, { id: 'updo', label: '盘发' }, { id: 'ponytail', label: '马尾' }].map(h => (
                              <Chip key={h.id} label={h.label} active={aiHairStyle === h.id}
                                onClick={() => setAiHairStyle(h.id)} />
                            ))}
                          </ChipRow>
                        </div>
                      ) : (
                        <ChipRow>
                          {[{ id: 'clean', label: '干净利落' }, { id: 'textured', label: '造型碎发' }, { id: 'trendy', label: '时髦潮流' }].map(h => (
                            <Chip key={h.id} label={h.label} active={aiMaleHair === h.id}
                              onClick={() => setAiMaleHair(h.id)} />
                          ))}
                        </ChipRow>
                      )
                    ) : (
                      <ChipRow>
                        {(aiGender === 'female' ? childFemaleHairs : childMaleHairs).map(h => (
                          <Chip key={h} label={h} active={aiChildHair === h}
                            onClick={() => setAiChildHair(h)} />
                        ))}
                      </ChipRow>
                    )}
                  </div>

                  {/* 气质风格 */}
                  <div>
                    <SectionLabel>气质风格 <span style={{ fontWeight: 400, color: C.textTert, fontSize: 11 }}>必选一种</span></SectionLabel>
                    {aiPersonType === 'adult' ? (
                      <VibeGrid vibes={aiGender === 'female' ? femaleVibes : maleVibes} current={aiVibe} onSelect={setAiVibe} />
                    ) : (
                      <VibeGrid vibes={aiGender === 'female' ? childFemaleVibes : childMaleVibes} current={aiChildVibe} onSelect={setAiChildVibe} />
                    )}
                  </div>

                  {/* 形象名称 */}
                  <div>
                    <SectionLabel>形象名称 <span style={{ fontWeight: 400, color: C.textTert, fontSize: 11 }}>可选</span></SectionLabel>
                    <input
                      value={aiName}
                      onChange={e => setAiName(e.target.value)}
                      placeholder={aiPersonType === 'child'
                        ? `${aiGender === 'female' ? '女童' : '男童'}·${aiChildAge}岁·…（留空自动生成）`
                        : `${aiGender === 'female' ? '女' : '男'}·${aiVibe || aiAge}·…（留空自动生成）`}
                      style={{
                        width: '100%', padding: '8px 12px', borderRadius: 8, fontSize: 13,
                        border: `1px solid ${C.border}`, outline: 'none',
                        fontFamily: C.font, color: C.text, boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  {/* 补充说明 */}
                  <div>
                    <SectionLabel>补充说明 <span style={{ fontWeight: 400, color: C.textTert, fontSize: 11 }}>可选，50字以内</span></SectionLabel>
                    <textarea
                      value={aiNote}
                      onChange={e => setAiNote(e.target.value.slice(0, 50))}
                      placeholder={aiPersonType === 'child' ? '如：圆脸、眼睛大、表情活泼…' : '如：希望眼睛大一点，偏韩系风格…'}
                      rows={2}
                      style={{
                        width: '100%', padding: '8px 12px', borderRadius: 8, fontSize: 12,
                        border: `1px solid ${C.border}`, outline: 'none', resize: 'none',
                        fontFamily: C.font, color: C.text, boxSizing: 'border-box', lineHeight: 1.6,
                      }}
                    />
                    <div style={{ fontSize: 11, color: C.textTert, textAlign: 'right', marginTop: 2 }}>{aiNote.length}/50</div>
                  </div>

                  {/* 生成按钮 */}
                  <button
                    onClick={startAiGenerate}
                    disabled={!aiFormValid}
                    style={{
                      padding: '12px 0', borderRadius: 8, border: 'none',
                      background: aiFormValid ? C.blue : C.border,
                      color: '#fff', fontSize: 14, fontWeight: 600,
                      cursor: aiFormValid ? 'pointer' : 'not-allowed', fontFamily: C.font,
                    }}
                  >✨ 开始生成</button>
                </div>
              )
            })()}

            {/* 生成中 */}
            {aiPhase === 'generating' && (
              <div style={{ padding: '60px 0', textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>
                  <SpinDot large />
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 8 }}>形象处理中</div>
                <div style={{ fontSize: 12, color: C.textTert }}>通常需要 15–30 秒，请稍候</div>
              </div>
            )}

            {/* 确认结果 */}
            {aiPhase === 'confirm' && (
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 16 }}>确认生成结果</div>
                <div style={{ display: 'flex', gap: 12, marginBottom: 20, maxWidth: 360 }}>
                  {/* 左：参数摘要 */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: C.textSec, marginBottom: 6, textAlign: 'center' }}>你的需求</div>
                    <div style={{
                      borderRadius: 10, border: `1px solid ${C.border}`, aspectRatio: '3/4',
                      background: '#FAFBFC', padding: '12px 10px',
                      display: 'flex', flexDirection: 'column', gap: 6, justifyContent: 'center',
                    }}>
                      {aiSummaryTags.map((tag, i) => (
                        <div key={i} style={{
                          padding: '4px 8px', borderRadius: 6, background: C.blueLight,
                          fontSize: 11, color: C.blue, fontWeight: 500, textAlign: 'center',
                        }}>{tag}</div>
                      ))}
                      {aiNote.trim() && (
                        <div style={{ fontSize: 10, color: C.textTert, marginTop: 4, lineHeight: 1.5 }}>"{aiNote.trim()}"</div>
                      )}
                    </div>
                  </div>
                  {/* 右：处理结果 mock */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: C.textSec, marginBottom: 6, textAlign: 'center' }}>处理结果</div>
                    <div style={{
                      borderRadius: 10, border: `1px solid ${C.border}`, aspectRatio: '3/4',
                      background: 'linear-gradient(160deg, #E8F0FF 0%, #F0E8FF 100%)',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', gap: 8,
                    }}>
                      <div style={{ fontSize: 32 }}>{aiGender === 'female' ? '👩' : '👨'}</div>
                      <div style={{ fontSize: 11, color: C.textSec, textAlign: 'center', lineHeight: 1.5, padding: '0 12px' }}>
                        白衬衫白裤子<br />正面素体形象
                      </div>
                    </div>
                  </div>
                </div>
                {/* 操作按钮 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button onClick={commitAiFace} style={{
                    padding: '12px 0', borderRadius: 8, border: 'none',
                    background: C.blue, color: '#fff', fontSize: 14, fontWeight: 600,
                    cursor: 'pointer', fontFamily: C.font,
                  }}>✓ 确认使用</button>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={rerunAiGenerate}
                      disabled={aiGenerateCount >= MAX_GENERATE}
                      style={{
                        flex: 1, padding: '9px 0', borderRadius: 8, fontSize: 13,
                        border: `1px solid ${aiGenerateCount >= MAX_GENERATE ? C.border : C.blue}`,
                        background: '#fff',
                        color: aiGenerateCount >= MAX_GENERATE ? C.textTert : C.blue,
                        cursor: aiGenerateCount >= MAX_GENERATE ? 'not-allowed' : 'pointer',
                        fontFamily: C.font,
                      }}
                    >🔄 重新生成{aiGenerateCount >= MAX_GENERATE ? '（已达上限）' : `（${aiGenerateCount}/${MAX_GENERATE}）`}</button>
                    <button onClick={resetAi} style={{
                      flex: 1, padding: '9px 0', borderRadius: 8, fontSize: 13,
                      border: `1px solid ${C.border}`, background: '#fff',
                      color: C.textSec, cursor: 'pointer', fontFamily: C.font,
                    }}>← 重新配置</button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </div>

      {/* 已选面容预览 */}
      {selectedFaceIds.length > 0 && (
        <div style={{
          padding: '10px 24px', borderTop: `1px solid ${C.border}`,
          background: '#FAFBFC', display: 'flex', gap: 12, alignItems: 'center', flexShrink: 0, flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: 12, color: C.textSec }}>已选：</span>
          {selectedFaceIds.map(id => {
            const f = findFace(id)
            if (!f) return null
            const isCustom = id.startsWith('custom_')
            const genderLabel = f.gender === 'female' ? '女性形象' : f.gender === 'male' ? '男性形象' : 'IP 形象'
            const genderColor = f.gender === 'female' ? '#FF4D8D' : f.gender === 'male' ? '#3370FF' : '#7B61FF'
            return (
              <div key={id} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '4px 10px', borderRadius: 20,
                background: f.color + '40', border: `1px solid ${f.color}`,
              }}>
                {isCustom && (f as CustomFace).previewUrl
                  ? <img src={(f as CustomFace).previewUrl} alt={f.name}
                      style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: 16 }}>{f.emoji}</span>
                }
                <span style={{ fontSize: 12, fontWeight: 500, color: C.text }}>{f.name}</span>
                <span style={{ fontSize: 10, color: genderColor, fontWeight: 600 }}>· {genderLabel}</span>
                {!isCustom && (
                  <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, background: '#FFF0DC', color: C.orange, fontWeight: 600 }}>独家</span>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* 底部按钮 */}
      <div style={{
        padding: '16px 24px', borderTop: `1px solid ${C.border}`,
        display: 'flex', justifyContent: 'space-between', flexShrink: 0,
      }}>
        <button onClick={onPrev} style={{
          padding: '10px 24px', borderRadius: 8,
          border: `1px solid ${C.border}`, background: '#fff',
          color: C.text, fontSize: 14, cursor: 'pointer', fontFamily: C.font,
        }}>← 上一步</button>
        <button
          onClick={onNext}
          disabled={selectedFaceIds.length === 0}
          style={{
            padding: '10px 32px', borderRadius: 8, border: 'none',
            background: selectedFaceIds.length > 0 ? C.blue : C.border,
            color: '#fff', fontSize: 14, fontWeight: 600,
            cursor: selectedFaceIds.length > 0 ? 'pointer' : 'not-allowed', fontFamily: C.font,
          }}
        >确认面容，下一步 →</button>
      </div>

      {/* 独家模特确认弹窗 */}
      {confirmPendingId && (() => {
        const f = findFace(confirmPendingId)
        if (!f) return null
        return (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 500,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }} onClick={() => setConfirmPendingId(null)}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
            <div style={{
              position: 'relative', zIndex: 1, width: 360, background: '#fff',
              borderRadius: 14, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            }} onClick={e => e.stopPropagation()}>
              <div style={{ padding: '20px 20px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
                    background: (f as any).color ?? '#eee',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                  }}>{f.emoji}</div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{f.name}</div>
                    <div style={{ fontSize: 11, color: C.textSec, marginTop: 2 }}>
                      {f.gender === 'female' ? '女性形象' : f.gender === 'male' ? '男性形象' : 'IP 形象'}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: C.text, lineHeight: 1.7, marginBottom: 10 }}>
                  确认使用「<strong>{f.name}</strong>」作为您的独家伴播模特？
                </div>
                <div style={{
                  padding: '10px 12px', borderRadius: 8,
                  background: '#FFFBE6', border: '1px solid #FFE58F',
                  fontSize: 12, color: '#7C5800', lineHeight: 1.6,
                }}>
                  🔒 确认后该形象将从公共库中移除，不再提供给其他用户使用，成为您的专属模特。
                </div>
              </div>
              <div style={{ padding: '0 20px 20px', display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setConfirmPendingId(null)}
                  style={{
                    flex: 1, padding: '10px 0', borderRadius: 8,
                    border: `1px solid ${C.border}`, background: '#fff',
                    color: C.text, fontSize: 14, cursor: 'pointer', fontFamily: C.font,
                  }}
                >再看看</button>
                <button
                  onClick={() => { doSelect(confirmPendingId); setConfirmPendingId(null) }}
                  style={{
                    flex: 2, padding: '10px 0', borderRadius: 8, border: 'none',
                    background: C.blue, color: '#fff',
                    fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: C.font,
                  }}
                >确认独家使用</button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

// 转圈动画点
function SpinDot({ large }: { large?: boolean }) {
  const [frame, setFrame] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setFrame(f => (f + 1) % 4), 350)
    return () => clearInterval(t)
  }, [])
  const dots = ['●○○', '○●○', '○○●', '○●○'][frame]
  if (large) {
    return <span style={{ color: C.blue, fontSize: 22, letterSpacing: 4 }}>{dots}</span>
  }
  return <span style={{ color: '#fff', fontSize: 12 }}>{['·', '··', '···', '··'][frame]}</span>
}
