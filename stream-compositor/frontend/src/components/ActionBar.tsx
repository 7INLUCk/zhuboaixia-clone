import React, { useState } from 'react'
import { LayerData } from '../App'

interface ActionBarProps {
  canComposite: boolean
  compositing: boolean
  compositeResult: string | null
  selectedLayer: string | null
  hostLayer: LayerData | null
  companionLayer: LayerData | null
  onComposite: () => void
  onExport: () => void
  onLayerUpdate: (id: string, updates: Partial<LayerData>) => void
}

export default function ActionBar({
  canComposite, compositing, compositeResult, selectedLayer,
  hostLayer, companionLayer, onComposite, onExport, onLayerUpdate,
}: ActionBarProps) {
  const [exportHover, setExportHover] = useState(false)
  const [compositeHover, setCompositeHover] = useState(false)

  const selectedData = selectedLayer === 'host' ? hostLayer
    : selectedLayer === 'companion' ? companionLayer : null

  return (
    <div style={{
      background: 'oklch(16% 0.008 50)',
      borderLeft: '1px solid oklch(22% 0.008 50)',
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
          CONTROLS
        </div>
        <div style={{
          fontSize: 13,
          color: 'oklch(60% 0.02 50)',
        }}>
          调整 · 合成 · 导出
        </div>
      </div>

      <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: 20, overflow: 'auto' }}>
        {/* Selected layer info */}
        {selectedData && (
          <div>
            <div style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'oklch(50% 0.06 55)',
              fontFamily: "'JetBrains Mono', monospace",
              marginBottom: 8,
            }}>
              选中: {selectedData.name}
            </div>

            {/* Scale slider */}
            <div style={{ marginBottom: 12 }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                fontSize: 11, color: 'oklch(50% 0.02 50)',
                fontFamily: "'JetBrains Mono', monospace",
                marginBottom: 6,
              }}>
                <span>缩放</span>
                <span>{Math.round(selectedData.scale * 100)}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={300}
                value={Math.round(selectedData.scale * 100)}
                onChange={e => onLayerUpdate(selectedData.id, { scale: Number(e.target.value) / 100 })}
                style={{
                  width: '100%',
                  accentColor: 'oklch(65% 0.14 55)',
                  height: 4,
                }}
              />
            </div>

            {/* Visibility toggle */}
            <button
              onClick={() => onLayerUpdate(selectedData.id, { visible: !selectedData.visible })}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: selectedData.visible ? 'transparent' : 'oklch(22% 0.015 30)',
                border: `1px solid ${selectedData.visible ? 'oklch(28% 0.008 50)' : 'oklch(30% 0.04 30)'}`,
                borderRadius: 6,
                color: selectedData.visible ? 'oklch(60% 0.02 50)' : 'oklch(55% 0.06 30)',
                fontSize: 12,
                cursor: 'pointer',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {selectedData.visible ? '◉ 可见' : '○ 隐藏'}
            </button>
          </div>
        )}

        {/* Instructions when nothing selected */}
        {!selectedData && (
          <div style={{
            fontSize: 11,
            lineHeight: 1.7,
            color: 'oklch(35% 0.015 50)',
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            <div style={{ color: 'oklch(42% 0.02 50)', marginBottom: 6, fontWeight: 500 }}>操作</div>
            点击画布图层 → 选中<br/>
            拖拽 → 移动位置<br/>
            拖四角 → 等比缩放<br/>
            空白处点击 → 取消选中
          </div>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Composite button */}
        <button
          onClick={onComposite}
          disabled={!canComposite || compositing}
          onMouseEnter={() => setCompositeHover(true)}
          onMouseLeave={() => setCompositeHover(false)}
          style={{
            width: '100%',
            padding: '14px 0',
            background: compositing
              ? 'oklch(22% 0.01 50)'
              : canComposite
                ? (compositeHover
                  ? 'oklch(62% 0.14 55)'
                  : 'oklch(55% 0.12 55)')
                : 'oklch(20% 0.008 50)',
            border: `1px solid ${canComposite ? 'oklch(60% 0.14 55)' : 'oklch(25% 0.008 50)'}`,
            borderRadius: 8,
            color: canComposite ? 'oklch(12% 0.02 50)' : 'oklch(35% 0.015 50)',
            fontSize: 13,
            fontWeight: 600,
            cursor: canComposite && !compositing ? 'pointer' : 'not-allowed',
            fontFamily: "'Space Grotesk', sans-serif",
            letterSpacing: '0.02em',
            transition: 'all 0.15s ease',
          }}
        >
          {compositing ? '处理中…' : '开始合成'}
        </button>

        {/* Export / Result */}
        {compositeResult && (
          <div style={{
            borderRadius: 8,
            overflow: 'hidden',
            border: '1px solid oklch(28% 0.008 50)',
          }}>
            <img
              src={compositeResult}
              alt="合成结果"
              style={{ width: '100%', display: 'block' }}
            />
            <button
              onClick={onExport}
              onMouseEnter={() => setExportHover(true)}
              onMouseLeave={() => setExportHover(false)}
              style={{
                width: '100%',
                padding: '10px 0',
                background: exportHover ? 'oklch(25% 0.06 150)' : 'oklch(20% 0.04 150)',
                border: 'none',
                borderTop: '1px solid oklch(28% 0.008 50)',
                color: 'oklch(72% 0.1 150)',
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: "'JetBrains Mono', monospace",
                transition: 'background 0.15s ease',
              }}
            >
              ↓ 下载结果
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
