import React, { useState } from 'react'

type Props = { onClose: () => void; onContinueConfig?: () => void }
type ViewState = 'empty' | 'configured' | 'live'

export default function BuyinControlPanel({ onClose, onContinueConfig }: Props) {
  const [viewState, setViewState] = useState<ViewState>('empty')
  const [elapsed, setElapsed] = useState(0)
  const [liveTimer, setLiveTimer] = useState<any>(null)

  const startLive = () => {
    setViewState('live')
    const t = setInterval(() => setElapsed(prev => prev + 1), 1000)
    setLiveTimer(t)
  }
  const stopLive = () => {
    setViewState('configured')
    setElapsed(0)
    if (liveTimer) clearInterval(liveTimer)
  }
  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600).toString().padStart(2, '0')
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0')
    const sec = (s % 60).toString().padStart(2, '0')
    return `${h}:${m}:${sec}`
  }

  const f = "'PingFang SC', 'Microsoft YaHei', -apple-system, sans-serif"

  return (
    <div style={{
      position: 'absolute', top: 36, right: 0, bottom: 0, width: 520,
      zIndex: 102, overflow: 'hidden', borderRadius: '8px 0 0 0',
      boxShadow: '-2px 0 16px rgba(0,0,0,0.08)', fontFamily: f,
      display: 'flex', flexDirection: 'column',
      background: '#fff',
    }}>
      {/* ===== 9:16 画布 ===== */}
      <div style={{
        flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center',
        padding: '20px 16px 0', minHeight: 0,
      }}>
        <div style={{
          position: 'relative', width: '100%', paddingTop: '177.8%',
          borderRadius: 16, overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
        }}>
          {/* 背景 */}
          {viewState === 'live' ? (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(170deg, #FFF8F0 0%, #FFECD2 50%, #FCE4EC 100%)',
            }} />
          ) : (
            <div style={{
              position: 'absolute', inset: 0,
              background: '#F8F9FB',
            }}>
              {/* 点阵装饰 */}
              <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.35 }}>
                <defs>
                  <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="10" cy="10" r="0.8" fill="#C9CDD4" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#dots)" />
              </svg>
            </div>
          )}

          {viewState === 'empty' && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: '0 10%',
            }}>
              {/* 插画区：三个几何圆形组合 */}
              <div style={{ position: 'relative', width: 120, height: 120, marginBottom: 28 }}>
                {/* 大圆 - 渐变 */}
                <div style={{
                  position: 'absolute', top: 10, left: 10, width: 100, height: 100,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #E8ECFF 0%, #D4DEFF 100%)',
                }} />
                {/* 中圆 - 半透明 */}
                <div style={{
                  position: 'absolute', top: 0, right: 0, width: 60, height: 60,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(123,97,255,0.15) 0%, rgba(51,112,255,0.1) 100%)',
                  border: '1.5px solid rgba(123,97,255,0.12)',
                }} />
                {/* 小圆 - 装饰 */}
                <div style={{
                  position: 'absolute', bottom: 8, left: 0, width: 32, height: 32,
                  borderRadius: '50%',
                  background: 'rgba(51,112,255,0.08)',
                  border: '1px solid rgba(51,112,255,0.1)',
                }} />
                {/* 中心图标 */}
                <div style={{
                  position: 'absolute', top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 48, height: 48, borderRadius: 14,
                  background: '#fff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.03)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 2c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 13.2c-2.5 0-4.71-1.28-6-3.22.03-2 4-3.08 6-3.08s5.97 1.09 6 3.08c-1.29 1.94-3.5 3.22-6 3.22z" fill="#3370FF" opacity="0.7" />
                  </svg>
                </div>
              </div>

              {/* 文字区 */}
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <div style={{
                  fontSize: 18, fontWeight: 700, color: '#1D2129',
                  letterSpacing: -0.3, marginBottom: 10,
                }}>
                  创建你的数字伴播
                </div>
                <div style={{
                  fontSize: 13, color: '#86909C', lineHeight: 1.8,
                  maxWidth: 240,
                }}>
                  选择形象与声音，让 AI 伴播<br/>在直播间自动为你讲解互动
                </div>
              </div>

              {/* CTA */}
              <button onClick={onContinueConfig} style={{
                padding: '12px 36px', borderRadius: 10,
                border: 'none',
                background: 'linear-gradient(135deg, #3370FF 0%, #5B8DEF 100%)',
                color: '#fff', fontSize: 14, fontWeight: 600,
                cursor: 'pointer', fontFamily: f,
                boxShadow: '0 4px 16px rgba(51,112,255,0.3), 0 1px 3px rgba(51,112,255,0.2)',
                letterSpacing: 0.5,
              }}>
                开始配置
              </button>

              {/* 底部步骤提示 */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                marginTop: 24, fontSize: 11, color: '#C9CDD4',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{
                    width: 16, height: 16, borderRadius: '50%',
                    background: '#F0F1F5', display: 'inline-flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: 9, fontWeight: 700, color: '#86909C',
                  }}>1</span>
                  <span>选形象</span>
                </div>
                <div style={{ width: 12, height: 1, background: '#E5E6EB' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{
                    width: 16, height: 16, borderRadius: '50%',
                    background: '#F0F1F5', display: 'inline-flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: 9, fontWeight: 700, color: '#86909C',
                  }}>2</span>
                  <span>配声音</span>
                </div>
                <div style={{ width: 12, height: 1, background: '#E5E6EB' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{
                    width: 16, height: 16, borderRadius: '50%',
                    background: '#F0F1F5', display: 'inline-flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: 9, fontWeight: 700, color: '#86909C',
                  }}>3</span>
                  <span>开直播</span>
                </div>
              </div>
            </div>
          )}

          {viewState === 'configured' && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 14,
            }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'linear-gradient(135deg, #E8ECFF, #D4DEFF)',
                border: '2px solid #BEDAFF',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 30,
              }}>🐟</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1D2129' }}>场景已就绪</div>
              <div style={{ fontSize: 12, color: '#86909C' }}>伴播形象已配置完成</div>
              <button onClick={onContinueConfig} style={{
                padding: '6px 16px', borderRadius: 6,
                border: '1px solid #E5E6EB', background: '#fff',
                color: '#3370FF', fontSize: 12, cursor: 'pointer', fontFamily: f,
              }}>编辑场景</button>
            </div>
          )}

          {viewState === 'live' && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 12,
            }}>
              <div style={{
                position: 'absolute', top: 14, left: 14,
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '4px 12px', borderRadius: 14,
                background: 'rgba(255,77,79,0.1)', border: '1px solid rgba(255,77,79,0.2)',
              }}>
                <span style={{
                  width: 7, height: 7, borderRadius: '50%', background: '#FF4D4F',
                  boxShadow: '0 0 6px rgba(255,77,79,0.5)',
                  animation: 'blink 1.5s ease-in-out infinite',
                }} />
                <span style={{ fontSize: 12, color: '#F53F3F', fontWeight: 600 }}>直播中</span>
              </div>
              <div style={{
                position: 'absolute', top: 14, right: 14,
                fontSize: 13, color: '#1D2129', fontWeight: 600,
                fontVariantNumeric: 'tabular-nums', fontFamily: 'monospace',
              }}>{formatTime(elapsed)}</div>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'linear-gradient(135deg, #E8ECFF, #D4DEFF)',
                border: '2px solid #BEDAFF',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 30,
              }}>🐟</div>
            </div>
          )}
        </div>
      </div>

      {/* ===== 底部控制 ===== */}
      <div style={{ padding: '14px 16px 18px', flexShrink: 0 }}>
        {viewState === 'empty' && (
          <button disabled style={{
            width: '100%', height: 46, borderRadius: 12,
            border: '1px solid #E5E6EB', background: '#F7F8FA',
            color: '#C9CDD4', fontSize: 14, fontWeight: 600,
            cursor: 'not-allowed', fontFamily: f,
          }}>启动伴播</button>
        )}
        {viewState === 'configured' && (
          <button onClick={startLive} style={{
            width: '100%', height: 46, borderRadius: 12,
            border: 'none', background: 'linear-gradient(135deg, #00B42A, #2FC25B)',
            color: '#fff', fontSize: 14, fontWeight: 600,
            cursor: 'pointer', fontFamily: f,
            boxShadow: '0 4px 12px rgba(0,180,42,0.2)',
          }}>启动伴播</button>
        )}
        {viewState === 'live' && (
          <button onClick={stopLive} style={{
            width: '100%', height: 46, borderRadius: 12,
            border: 'none', background: 'linear-gradient(135deg, #F53F3F, #FF7875)',
            color: '#fff', fontSize: 14, fontWeight: 600,
            cursor: 'pointer', fontFamily: f,
            boxShadow: '0 4px 12px rgba(245,63,63,0.2)',
          }}>停止伴播</button>
        )}
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
