import React, { useEffect, useRef, useState } from 'react'

type Props = { onClose: () => void; onContinueConfig?: () => void }
type PanelMode = 'setup' | 'live'

function chromaKey(canvas: HTMLCanvasElement, src: string) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => {
    canvas.width = img.width
    canvas.height = img.height
    ctx.drawImage(img, 0, 0)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2]
      const isGreen = (g > 80 && g > r * 1.2 && g > b * 1.2) ||
                     (g > 120 && g > r + 30 && g > b + 30) ||
                     (g > 150 && r < 100 && b < 100)
      if (isGreen) {
        const strength = Math.min(1, (g - Math.max(r, b)) / 80)
        data[i + 3] = Math.round(data[i + 3] * (1 - strength))
      }
    }
    ctx.putImageData(imageData, 0, 0)
  }
  img.src = src
}

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export default function BuyinLivePreviewPanel({ onClose, onContinueConfig }: Props) {
  const adultRef = useRef<HTMLCanvasElement>(null)
  const cartRef = useRef<HTMLCanvasElement>(null)
  const [mode, setMode] = useState<PanelMode>('setup')
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (adultRef.current) chromaKey(adultRef.current, '/person-greenscreen.jpg')
    if (cartRef.current) chromaKey(cartRef.current, '/kid-greenscreen.jpg')
  }, [])

  // 直播计时器
  useEffect(() => {
    if (mode !== 'live') { setElapsed(0); return }
    const timer = setInterval(() => setElapsed(t => t + 1), 1000)
    return () => clearInterval(timer)
  }, [mode])

  const font = '-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif'

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
      fontFamily: font,
    }}>
      {/* 底层：直播间背景 */}
      <img
        src="/bg-livestream.jpg"
        alt="直播间背景"
        draggable={false}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          userSelect: 'none',
          transition: 'filter 0.3s',
          filter: mode === 'live' ? 'brightness(0.85)' : 'none',
        }}
      />

      {/* ===== 顶部信息栏 ===== */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        padding: '16px 20px 12px',
        background: mode === 'live'
          ? 'linear-gradient(to bottom, rgba(180,30,30,0.55) 0%, rgba(0,0,0,0.3) 70%, transparent 100%)'
          : 'linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.3) 70%, transparent 100%)',
        transition: 'background 0.3s',
      }}>
        {/* 品牌标签 */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: mode === 'live' ? 'rgba(255,77,79,0.2)' : 'rgba(51,112,255,0.2)',
          border: `1px solid ${mode === 'live' ? 'rgba(255,77,79,0.5)' : 'rgba(51,112,255,0.4)'}`,
          borderRadius: 14,
          padding: '3px 10px 3px 8px',
          marginBottom: 8,
          transition: 'all 0.3s',
        }}>
          {mode === 'live' ? (
            <>
              <span style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#FF4D4F',
                animation: 'pulse 1.5s infinite',
              }}/>
              <span style={{ fontSize: 12, color: '#FF9A9E', fontWeight: 600 }}>直播中</span>
            </>
          ) : (
            <>
              <span style={{ fontSize: 14 }}>🎙</span>
              <span style={{ fontSize: 12, color: '#7EB8FF', fontWeight: 500 }}>伴播模式</span>
            </>
          )}
        </div>

        {/* 标题 */}
        <div style={{
          fontSize: 18,
          fontWeight: 600,
          color: '#fff',
          marginBottom: 4,
          textShadow: '0 1px 4px rgba(0,0,0,0.3)',
        }}>
          {mode === 'live' ? '直播间运行中' : '伴播直播间配置'}
        </div>
      </div>

      {/* ===== 直播态：状态面板 ===== */}
      {mode === 'live' && (
        <div style={{
          position: 'absolute',
          top: 110,
          left: 20,
          right: 20,
          zIndex: 25,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(12px)',
          borderRadius: 10,
          padding: '14px 16px',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          {/* 计时器 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: '#52C41A',
                boxShadow: '0 0 8px rgba(82,196,26,0.5)',
              }}/>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>串流状态</span>
            </div>
            <span style={{
              fontSize: 20,
              fontWeight: 600,
              color: '#fff',
              fontFamily: 'monospace',
              letterSpacing: 2,
            }}>
              {formatTime(elapsed)}
            </span>
          </div>

          {/* 提示 */}
          <div style={{
            fontSize: 11,
            color: 'rgba(255,255,255,0.5)',
            lineHeight: 1.5,
            borderTop: '1px solid rgba(255,255,255,0.08)',
            paddingTop: 10,
          }}>
            💡 虚拟摄像头已就绪，请前往抖音直播伴侣接入后开始推流
          </div>
        </div>
      )}

      {/* ===== 大人形象 + 标注 ===== */}
      <div style={{
        position: 'absolute',
        left: '2%',
        bottom: '18%',
        zIndex: 3,
      }}>
        <canvas
          ref={adultRef}
          style={{
            height: '78vh',
            maxHeight: 480,
            width: 'auto',
          }}
        />
        <div style={{
          position: 'absolute',
          bottom: -24,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(6px)',
          borderRadius: 4,
          padding: '3px 10px',
          whiteSpace: 'nowrap',
        }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>👤 主播站位（示意图）</span>
        </div>
      </div>

      {/* ===== 3D 卡通形象 + 标注 ===== */}
      <div style={{
        position: 'absolute',
        right: '8%',
        bottom: '22%',
        zIndex: 4,
      }}>
        <canvas
          ref={cartRef}
          style={{
            height: '45vh',
            maxHeight: 300,
            width: 'auto',
          }}
        />
        <div style={{
          position: 'absolute',
          bottom: -24,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(6px)',
          borderRadius: 4,
          padding: '3px 10px',
          whiteSpace: 'nowrap',
        }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>🤖 伴播虚拟形象</span>
        </div>
      </div>

      {/* ===== 底部 CTA ===== */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 30,
        padding: '32px 20px 20px',
        background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)',
      }}>
        {mode === 'live' ? (
          /* 直播态：结束直播 */
          <button
            onClick={() => setMode('setup')}
            style={{
              width: '100%',
              height: 50,
              background: 'linear-gradient(135deg, #434343 0%, #2C2C2C 100%)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 10,
              color: '#fff',
              fontSize: 16,
              fontWeight: 600,
              fontFamily: font,
              cursor: 'pointer',
              letterSpacing: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'transform 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="5" y="5" width="8" height="8" rx="1.5" fill="#FF4D4F"/>
            </svg>
            结束直播
          </button>
        ) : (
          <>
            {/* 默认态：开始直播 */}
            <button
              onClick={() => setMode('live')}
              style={{
                width: '100%',
                height: 50,
                background: 'linear-gradient(135deg, #FF4D4F 0%, #FF7A45 100%)',
                border: 'none',
                borderRadius: 10,
                color: '#fff',
                fontSize: 16,
                fontWeight: 600,
                fontFamily: font,
                cursor: 'pointer',
                letterSpacing: 1.5,
                boxShadow: '0 4px 20px rgba(255,77,79,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'scale(1.02)'
                e.currentTarget.style.boxShadow = '0 6px 28px rgba(255,77,79,0.55)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(255,77,79,0.4)'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="7" stroke="#fff" strokeWidth="1.5"/>
                <path d="M7.5 6.5v5l4-2.5z" fill="#fff"/>
              </svg>
              开始直播
            </button>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
              <button onClick={onContinueConfig} style={{
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: 8,
                color: 'rgba(255,255,255,0.85)',
                fontSize: 13,
                fontFamily: font,
                padding: '8px 28px',
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
              }}>
                继续配置 →
              </button>
            </div>
          </>
        )}
      </div>

      {/* Pulse 动画 */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
