import React, { useState, useCallback } from 'react'
import UploadPanel from './components/UploadPanel'
import PreviewCanvas from './components/PreviewCanvas'
import ActionBar from './components/ActionBar'

export interface LayerData {
  id: string
  name: string
  imageUrl: string
  serverPath: string
  x: number
  y: number
  scale: number
  visible: boolean
}

const CANVAS_W = 1080
const CANVAS_H = 1920

export default function App() {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [backgroundLayer, setBackgroundLayer] = useState<LayerData | null>(null)
  const [hostLayer, setHostLayer] = useState<LayerData | null>(null)
  const [companionLayer, setCompanionLayer] = useState<LayerData | null>(null)
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null)
  const [compositing, setCompositing] = useState(false)
  const [compositeResult, setCompositeResult] = useState<string | null>(null)
  const [statusMsg, setStatusMsg] = useState('')
  const [statusType, setStatusType] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleUpload = useCallback(async (file: File, type: 'background' | 'host' | 'companion') => {
    setStatusMsg(`处理${type === 'background' ? '背景' : type === 'host' ? '主播' : '伴播'}中…`)
    setStatusType('loading')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('file_type', type)

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()

      if (data.status !== 'ok') {
        setStatusMsg(data.error || '上传失败')
        setStatusType('error')
        return
      }

      if (data.session_id && !sessionId) setSessionId(data.session_id)

      const previewUrl = `http://localhost:8766${data.preview.startsWith('/') ? '' : '/'}${data.preview}`
      const layerData: LayerData = {
        id: type,
        name: type === 'background' ? '背景' : type === 'host' ? '主播' : '伴播',
        imageUrl: previewUrl,
        serverPath: data.preview,
        x: type === 'background' ? 0.5 : type === 'host' ? 0.5 : 0.65,
        y: type === 'background' ? 0.5 : type === 'host' ? 0.6 : 0.75,
        scale: type === 'companion' ? 0.5 : 1.0,
        visible: true,
      }

      if (type === 'background') setBackgroundLayer(layerData)
      else if (type === 'host') setHostLayer(layerData)
      else setCompanionLayer(layerData)

      setStatusMsg(`${layerData.name}就绪`)
      setStatusType('success')
      setTimeout(() => setStatusType('idle'), 2000)
    } catch (err: any) {
      setStatusMsg(err.message)
      setStatusType('error')
    }
  }, [sessionId])

  const handleLayerUpdate = useCallback((id: string, updates: Partial<LayerData>) => {
    const up = (prev: LayerData | null) => prev && prev.id === id ? { ...prev, ...updates } : prev
    if (id === 'background') setBackgroundLayer(up)
    else if (id === 'host') setHostLayer(up)
    else if (id === 'companion') setCompanionLayer(up)
  }, [])

  const handleComposite = useCallback(async () => {
    if (!sessionId) { setStatusMsg('请先上传素材'); setStatusType('error'); return }
    setCompositing(true); setStatusMsg('合成处理中…'); setStatusType('loading')

    try {
      const res = await fetch('/api/composite-full', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          host_x: hostLayer?.x ?? 0.5, host_y: hostLayer?.y ?? 0.6,
          host_scale: hostLayer?.scale ?? 1.0,
          companion_x: companionLayer?.x ?? 0.65, companion_y: companionLayer?.y ?? 0.75,
          companion_scale: companionLayer?.scale ?? 0.5,
          canvas_width: CANVAS_W, canvas_height: CANVAS_H,
        }),
      })
      if (res.ok) {
        const blob = await res.blob()
        setCompositeResult(URL.createObjectURL(blob))
        setStatusMsg('合成完成')
        setStatusType('success')
      } else {
        const err = await res.json()
        setStatusMsg(err.detail || '合成失败')
        setStatusType('error')
      }
    } catch (err: any) {
      setStatusMsg(err.message); setStatusType('error')
    } finally { setCompositing(false) }
  }, [sessionId, hostLayer, companionLayer])

  const layers = [backgroundLayer, hostLayer, companionLayer].filter(Boolean) as LayerData[]

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '260px 1fr 240px',
      height: '100dvh',
      gap: 0,
    }}>
      <UploadPanel
        onUpload={handleUpload}
        backgroundLayer={backgroundLayer}
        hostLayer={hostLayer}
        companionLayer={companionLayer}
      />

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'oklch(12% 0.006 50)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle grid pattern */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(oklch(20% 0.006 50 / 0.3) 1px, transparent 1px),
            linear-gradient(90deg, oklch(20% 0.006 50 / 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
        }} />

        <PreviewCanvas
          layers={layers}
          selectedLayer={selectedLayer}
          onSelect={setSelectedLayer}
          onLayerUpdate={handleLayerUpdate}
          canvasWidth={CANVAS_W}
          canvasHeight={CANVAS_H}
        />

        {/* Status indicator */}
        {statusMsg && (
          <div style={{
            position: 'absolute',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '6px 20px',
            borderRadius: 100,
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: '0.02em',
            fontFamily: "'JetBrains Mono', monospace",
            background: statusType === 'error' ? 'oklch(25% 0.08 30)'
              : statusType === 'success' ? 'oklch(25% 0.06 150)'
              : 'oklch(25% 0.01 50)',
            color: statusType === 'error' ? 'oklch(75% 0.12 30)'
              : statusType === 'success' ? 'oklch(80% 0.1 150)'
              : 'oklch(70% 0.02 50)',
            border: `1px solid ${statusType === 'error' ? 'oklch(30% 0.08 30)'
              : statusType === 'success' ? 'oklch(30% 0.06 150)'
              : 'oklch(28% 0.01 50)'}`,
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}>
            {statusType === 'loading' && '◎ '}{statusMsg}
          </div>
        )}
      </div>

      <ActionBar
        canComposite={!!(backgroundLayer && hostLayer)}
        compositing={compositing}
        compositeResult={compositeResult}
        selectedLayer={selectedLayer}
        hostLayer={hostLayer}
        companionLayer={companionLayer}
        onComposite={handleComposite}
        onExport={() => {
          if (compositeResult) {
            const a = document.createElement('a')
            a.href = compositeResult
            a.download = 'composite.jpg'
            a.click()
          }
        }}
        onLayerUpdate={handleLayerUpdate}
      />
    </div>
  )
}
