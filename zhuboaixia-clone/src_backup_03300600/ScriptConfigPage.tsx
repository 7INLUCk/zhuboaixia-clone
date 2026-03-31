import React, { useState } from 'react'
import { tokens } from './tokens'

type Props = { onNavigate: (page: any) => void }

const T = tokens

const defaultScripts = [
  { id: 's1', scene: '欢迎观众', script: '欢迎 #观众 来到直播间！喜欢的话点个关注哦~', enabled: true },
  { id: 's2', scene: '感谢下单', script: '感谢 #观众 下单！品质保证，放心入手！', enabled: true },
  { id: 's3', scene: '感谢关注', script: '谢谢 #观众 的关注！每天都有好物推荐~', enabled: true },
  { id: 's4', scene: '感谢分享', script: '感谢 #观众 分享直播间！让更多人看到好物~', enabled: false },
  { id: 's5', scene: '催单话术', script: '库存不多了，喜欢的宝子抓紧拍！', enabled: false },
]

export default function ScriptConfigPage({ onNavigate }: Props) {
  const [scripts, setScripts] = useState(defaultScripts)
  const [aiMode, setAiMode] = useState(false)

  const toggle = (id: string) => {
    setScripts(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s))
  }

  return (
    <div style={{ padding: 32, fontFamily: T.fonts.family }}>
      <div style={{ fontSize: 18, fontWeight: 600, color: T.colors.textPrimary, marginBottom: 4 }}>
        伴播台词配置
      </div>
      <div style={{ fontSize: 13, color: T.colors.textSecondary, marginBottom: 24 }}>
        配置伴播在不同场景下的台词，支持预制台词和AI自动生成
      </div>

      {/* AI生成开关 */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', background: '#F5F3FF', borderRadius: 8, marginBottom: 20,
      }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, color: T.colors.textPrimary }}>🤖 AI自动生成台词</div>
          <div style={{ fontSize: 12, color: T.colors.textSecondary }}>开启后，伴播会根据主播话术实时生成回复</div>
        </div>
        <div
          onClick={() => setAiMode(!aiMode)}
          style={{
            width: 44, height: 24, borderRadius: 12, cursor: 'pointer',
            background: aiMode ? T.colors.primary : '#ccc', position: 'relative',
            transition: 'background 0.2s',
          }}
        >
          <div style={{
            width: 20, height: 20, borderRadius: 10, background: '#fff',
            position: 'absolute', top: 2, left: aiMode ? 22 : 2,
            transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }} />
        </div>
      </div>

      {/* 预制台词列表 */}
      <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 12, color: T.colors.textPrimary }}>
        预制台词
      </div>
      {scripts.map(s => (
        <div key={s.id} style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 0', borderBottom: `1px solid ${T.colors.border}`,
        }}>
          <div
            onClick={() => toggle(s.id)}
            style={{
              width: 18, height: 18, borderRadius: 4, cursor: 'pointer',
              border: s.enabled ? `2px solid ${T.colors.primary}` : `2px solid #ccc`,
              background: s.enabled ? T.colors.primary : '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 12, flexShrink: 0,
            }}
          >
            {s.enabled && '✓'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: T.colors.textPrimary }}>{s.scene}</div>
            <div style={{ fontSize: 12, color: T.colors.textSecondary, marginTop: 2 }}>{s.script}</div>
          </div>
        </div>
      ))}

      <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
        <button onClick={() => onNavigate('banbo-avatar')} style={btnStyle('#fff', T.colors.border)}>
          上一步
        </button>
        <button onClick={() => onNavigate('banbo-action')} style={btnStyle(T.colors.primary, '#fff')}>
          下一步：配置动作
        </button>
      </div>
    </div>
  )
}

const btnStyle = (bg: string, color: string): React.CSSProperties => ({
  padding: '10px 24px', borderRadius: 6, border: bg === '#fff' ? `1px solid ${T.colors.border}` : 'none',
  background: bg, color, fontSize: 14, fontWeight: 500, cursor: 'pointer',
})
