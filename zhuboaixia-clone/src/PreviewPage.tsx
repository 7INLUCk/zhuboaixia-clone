import React, { useState } from 'react'
import { tokens } from './tokens'

type Props = { onNavigate: (page: any) => void }

const T = tokens

export default function PreviewPage({ onNavigate }: Props) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentScript, setCurrentScript] = useState('')

  const testScripts = [
    '欢迎小明来到直播间！喜欢的话点个关注哦~',
    '感谢小红下单！品质保证，放心入手！',
    '库存不多了，喜欢的宝子抓紧拍！',
  ]

  const playScript = (script: string) => {
    setCurrentScript(script)
    setIsPlaying(true)
    setTimeout(() => setIsPlaying(false), 3000)
  }

  return (
    <div style={{ padding: 32, fontFamily: T.fonts.family }}>
      <div style={{ fontSize: 18, fontWeight: 600, color: T.colors.textPrimary, marginBottom: 4 }}>
        伴播预览
      </div>
      <div style={{ fontSize: 13, color: T.colors.textSecondary, marginBottom: 24 }}>
        预览伴播形象+台词+动作效果
      </div>

      {/* 预览区域 */}
      <div style={{
        width: '100%', height: 320, background: '#1a1a2e', borderRadius: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* 模拟直播间背景 */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }} />
        
        {/* 伴播形象占位 */}
        <div style={{
          width: 160, height: 240, borderRadius: 12,
          background: 'linear-gradient(180deg, #FF6B9D 0%, #FF8C42 100%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          position: 'relative', zIndex: 1,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🐟</div>
          <div style={{ color: '#fff', fontSize: 14, fontWeight: 500 }}>小鱼</div>
          {isPlaying && (
            <div style={{
              position: 'absolute', bottom: -20, left: '50%', transform: 'translateX(-50%)',
              background: 'rgba(0,0,0,0.8)', color: '#fff', padding: '6px 16px',
              borderRadius: 16, fontSize: 12, whiteSpace: 'nowrap',
              animation: 'fadeInUp 0.3s ease',
            }}>
              🗣️ {currentScript}
            </div>
          )}
        </div>

        {/* 角标 */}
        <div style={{
          position: 'absolute', top: 12, right: 12,
          background: 'rgba(255,107,157,0.9)', color: '#fff',
          padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 500,
        }}>
          伴播 · 小鱼
        </div>
      </div>

      {/* 测试台词 */}
      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 13, color: T.colors.textSecondary, marginBottom: 8 }}>点击测试台词效果：</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {testScripts.map((s, i) => (
            <button
              key={i}
              onClick={() => playScript(s)}
              style={{
                padding: '6px 12px', borderRadius: 6, border: `1px solid ${T.colors.border}`,
                background: '#fff', fontSize: 12, color: T.colors.textPrimary, cursor: 'pointer',
              }}
            >
              {s.substring(0, 15)}...
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
        <button onClick={() => onNavigate('banbo-action')} style={btnStyle('#fff', T.colors.border)}>
          上一步
        </button>
        <button onClick={() => onNavigate('banbo-dashboard')} style={btnStyle(T.colors.primary, '#fff')}>
          开始使用伴播 →
        </button>
      </div>
    </div>
  )
}

const btnStyle = (bg: string, color: string): React.CSSProperties => ({
  padding: '10px 24px', borderRadius: 6, border: bg === '#fff' ? `1px solid ${T.colors.border}` : 'none',
  background: bg, color, fontSize: 14, fontWeight: 500, cursor: 'pointer',
})
