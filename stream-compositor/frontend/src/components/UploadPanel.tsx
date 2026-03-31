import React, { useRef, useState } from 'react'
import { LayerData } from '../App'

interface UploadPanelProps {
  onUpload: (file: File, type: 'background' | 'host' | 'companion') => void
  backgroundLayer: LayerData | null
  hostLayer: LayerData | null
  companionLayer: LayerData | null
}

const ITEMS = [
  { key: 'background' as const, label: '背景', sub: '直播间底图', accept: 'image/*' },
  { key: 'host' as const, label: '主播', sub: '绿幕基底', accept: 'image/*' },
  { key: 'companion' as const, label: '伴播', sub: '卡通 / AI形象', accept: 'image/*' },
]

export default function UploadPanel({ onUpload, backgroundLayer, hostLayer, companionLayer }: UploadPanelProps) {
  const refs = useRef<Record<string, HTMLInputElement | null>>({})
  const [hoveredKey, setHoveredKey] = useState<string | null>(null)
  const map = { background: backgroundLayer, host: hostLayer, companion: companionLayer }

  return (
    <div style={{
      background: 'oklch(16% 0.008 50)',
      borderRight: '1px solid oklch(22% 0.008 50)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}>
      {/* Header */}
      <div style={{
        padding: '24px 20px 20px',
        borderBottom: '1px solid oklch(22% 0.008 50)',
      }}>
        <div style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'oklch(55% 0.08 50)',
          fontFamily: "'JetBrains Mono', monospace",
          marginBottom: 6,
        }}>
          ASSETS
        </div>
        <div style={{
          fontSize: 13,
          fontWeight: 400,
          color: 'oklch(60% 0.02 50)',
          lineHeight: 1.5,
        }}>
          上传三件素材开始合成
        </div>
      </div>

      {/* Upload items */}
      <div style={{ flex: 1, padding: '12px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {ITEMS.map((item, i) => {
          const layer = map[item.key]
          const isHovered = hoveredKey === item.key

          return (
            <div key={item.key}>
              <input
                ref={el => { refs.current[item.key] = el }}
                type="file"
                accept={item.accept}
                style={{ display: 'none' }}
                onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(f, item.key) }}
              />
              <button
                onClick={() => refs.current[item.key]?.click()}
                onMouseEnter={() => setHoveredKey(item.key)}
                onMouseLeave={() => setHoveredKey(null)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 12px',
                  background: layer
                    ? (isHovered ? 'oklch(22% 0.015 80)' : 'oklch(20% 0.012 80)')
                    : (isHovered ? 'oklch(20% 0.008 50)' : 'transparent'),
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                  textAlign: 'left',
                }}
              >
                {/* Index number */}
                <span style={{
                  fontSize: 11,
                  fontWeight: 600,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: layer ? 'oklch(65% 0.1 55)' : 'oklch(40% 0.02 50)',
                  width: 20,
                  flexShrink: 0,
                }}>
                  {String(i + 1).padStart(2, '0')}
                </span>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: layer ? 'oklch(88% 0.008 50)' : 'oklch(65% 0.02 50)',
                    marginBottom: 2,
                  }}>
                    {item.label}
                  </div>
                  <div style={{
                    fontSize: 11,
                    color: layer ? 'oklch(55% 0.06 50)' : 'oklch(42% 0.02 50)',
                    fontFamily: layer ? "'JetBrains Mono', monospace" : 'inherit',
                  }}>
                    {layer ? '已就绪' : item.sub}
                  </div>
                </div>

                {/* Status dot */}
                <div style={{
                  width: 6, height: 6,
                  borderRadius: '50%',
                  background: layer ? 'oklch(70% 0.12 150)' : 'oklch(28% 0.01 50)',
                  flexShrink: 0,
                  transition: 'background 0.3s',
                }} />
              </button>

              {/* Thumbnail preview */}
              {layer && (
                <div style={{
                  margin: '4px 0 0 32px',
                  height: 56,
                  borderRadius: 6,
                  overflow: 'hidden',
                  background: 'oklch(10% 0.006 50)',
                  border: '1px solid oklch(22% 0.008 50)',
                }}>
                  <img
                    src={layer.imageUrl}
                    alt={layer.name}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer instructions */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid oklch(22% 0.008 50)',
        fontSize: 11,
        lineHeight: 1.7,
        color: 'oklch(38% 0.015 50)',
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        <div style={{ color: 'oklch(45% 0.02 50)', marginBottom: 4, fontWeight: 500 }}>工作流</div>
        上传 → 拖拽定位 → 缩放调整 → 合成导出
      </div>
    </div>
  )
}
