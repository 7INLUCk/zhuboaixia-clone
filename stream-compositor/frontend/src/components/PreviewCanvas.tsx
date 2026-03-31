import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Stage, Layer, Image as KonvaImage, Transformer, Rect, Text } from 'react-konva'
import Konva from 'konva'
import { LayerData } from '../App'

interface PreviewCanvasProps {
  layers: LayerData[]
  selectedLayer: string | null
  onSelect: (id: string | null) => void
  onLayerUpdate: (id: string, updates: Partial<LayerData>) => void
  canvasWidth: number
  canvasHeight: number
}

const imageCache = new Map<string, HTMLImageElement>()

function useImage(url: string): HTMLImageElement | null {
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  useEffect(() => {
    if (!url) return
    if (imageCache.has(url)) { setImg(imageCache.get(url)!); return }
    const i = new window.Image()
    i.crossOrigin = 'anonymous'
    i.onload = () => { imageCache.set(url, i); setImg(i) }
    i.src = url
  }, [url])
  return img
}

function DraggableLayer({
  layer, isSelected, sw, sh, onSelect, onTransform,
}: {
  layer: LayerData; isSelected: boolean; sw: number; sh: number
  onSelect: () => void
  onTransform: (a: { x: number; y: number; scale: number }) => void
}) {
  const ref = useRef<Konva.Image>(null)
  const trRef = useRef<Konva.Transformer>(null)
  const image = useImage(layer.imageUrl)

  useEffect(() => {
    if (isSelected && trRef.current && ref.current) {
      trRef.current.nodes([ref.current])
      trRef.current.getLayer()?.batchDraw()
    }
  }, [isSelected])

  if (!image || !layer.visible) return null

  const maxDim = Math.min(sw, sh)
  const base = (maxDim * 0.5) / Math.max(image.naturalWidth, image.naturalHeight)
  const ds = base * layer.scale
  const x = layer.x * sw
  const y = layer.y * sh

  return (
    <>
      <KonvaImage
        ref={ref}
        image={image}
        x={x} y={y}
        offsetX={image.naturalWidth / 2}
        offsetY={image.naturalHeight / 2}
        scaleX={ds} scaleY={ds}
        draggable
        onClick={onSelect} onTap={onSelect}
        onDragEnd={e => {
          const n = e.target
          onTransform({ x: n.x() / sw, y: n.y() / sh, scale: layer.scale })
        }}
        onTransformEnd={() => {
          const n = ref.current
          if (!n) return
          const avg = (n.scaleX() + n.scaleY()) / 2
          onTransform({ x: n.x() / sw, y: n.y() / sh, scale: avg / base })
          n.scaleX(1); n.scaleY(1)
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(old, nw) => {
            if (nw.width < 30 || nw.height < 30) return old
            const ar = old.width / old.height
            nw.height = nw.width / ar
            return nw
          }}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
          rotateEnabled={false}
          borderStroke="oklch(65% 0.14 55)"
          borderStrokeWidth={1.5}
          borderDash={[6, 4]}
          anchorFill="oklch(20% 0.02 50)"
          anchorStroke="oklch(65% 0.14 55)"
          anchorStrokeWidth={1.5}
          anchorSize={10}
          anchorCornerRadius={2}
        />
      )}
    </>
  )
}

export default function PreviewCanvas({
  layers, selectedLayer, onSelect, onLayerUpdate, canvasWidth, canvasHeight,
}: PreviewCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 360, height: 640 })

  useEffect(() => {
    const c = containerRef.current
    if (!c) return
    const resize = () => {
      const r = c.getBoundingClientRect()
      const ar = canvasWidth / canvasHeight
      let w = r.width - 64
      let h = w / ar
      if (h > r.height - 80) { h = r.height - 80; w = h * ar }
      setSize({ width: Math.floor(w), height: Math.floor(h) })
    }
    resize()
    const obs = new ResizeObserver(resize)
    obs.observe(c)
    return () => obs.disconnect()
  }, [canvasWidth, canvasHeight])

  const bgLayer = layers.find(l => l.id === 'background')
  const bgImage = useImage(bgLayer?.imageUrl || '')

  return (
    <div ref={containerRef} style={{
      width: '100%', flex: 1,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', zIndex: 1,
    }}>
      <div style={{ position: 'relative' }}>
        {/* Shadow effect behind the canvas */}
        <div style={{
          position: 'absolute',
          top: 8, left: 8, right: -8, bottom: -8,
          background: 'oklch(8% 0.006 50)',
          borderRadius: 6,
          filter: 'blur(20px)',
          opacity: 0.6,
        }} />

        <Stage
          width={size.width}
          height={size.height}
          onClick={e => { if (e.target === e.target.getStage()) onSelect(null) }}
          style={{
            borderRadius: 6,
            overflow: 'hidden',
            border: '1px solid oklch(24% 0.008 50)',
            background: 'oklch(10% 0.006 50)',
            position: 'relative',
            zIndex: 2,
          }}
        >
          <Layer>
            {bgImage ? (
              <KonvaImage image={bgImage} width={size.width} height={size.height} listening={false} />
            ) : (
              <>
                <Rect width={size.width} height={size.height} fill="oklch(10% 0.006 50)" listening={false} />
                <Text
                  text="等待素材上传"
                  x={0} y={size.height / 2 - 8}
                  width={size.width}
                  align="center"
                  fill="oklch(30% 0.015 50)"
                  fontSize={13}
                  fontFamily="Space Grotesk"
                />
              </>
            )}
          </Layer>
          <Layer>
            {layers.filter(l => l.id !== 'background').map(layer => (
              <DraggableLayer
                key={layer.id}
                layer={layer}
                isSelected={selectedLayer === layer.id}
                sw={size.width} sh={size.height}
                onSelect={() => onSelect(layer.id)}
                onTransform={a => onLayerUpdate(layer.id, { x: a.x, y: a.y, scale: a.scale })}
              />
            ))}
          </Layer>
        </Stage>
      </div>

      {/* Canvas metadata label */}
      <div style={{
        position: 'absolute',
        bottom: 12,
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: 10,
        fontWeight: 500,
        fontFamily: "'JetBrains Mono', monospace",
        color: 'oklch(30% 0.015 50)',
        letterSpacing: '0.06em',
      }}>
        9:16 · {canvasWidth}×{canvasHeight}
      </div>
    </div>
  )
}
