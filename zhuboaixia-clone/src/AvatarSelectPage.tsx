import React, { useState } from 'react'
import { tokens } from './tokens'

type Props = {
  onNavigate: (page: any) => void
  onAvatarSelect?: (avatarId: string) => void
}

const T = tokens

const avatars = [
  { id: 'v1', name: '小鱼', desc: '温柔女声 · 知性风格', color: '#FF6B9D', emoji: '🐟' },
  { id: 'v2', name: '小橙', desc: '活力男声 · 带货达人', color: '#FF8C42', emoji: '🍊' },
  { id: 'v3', name: '小蓝', desc: '专业女声 · 品质主播', color: '#4ECDC4', emoji: '💎' },
  { id: 'v4', name: '小金', desc: '热情男声 · 砍价高手', color: '#FFD93D', emoji: '⭐' },
]

export default function AvatarSelectPage({ onNavigate, onAvatarSelect }: Props) {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <div style={{ padding: 32, fontFamily: T.fonts.family }}>
      <div style={{ fontSize: 18, fontWeight: 600, color: T.colors.textPrimary, marginBottom: 4 }}>
        选择伴播形象
      </div>
      <div style={{ fontSize: 13, color: T.colors.textSecondary, marginBottom: 24 }}>
        选择一个虚拟伴播形象，开播后它会出现在直播间画面中
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {avatars.map(av => (
          <div
            key={av.id}
            onClick={() => { setSelected(av.id); onAvatarSelect?.(av.id) }}
            style={{
              border: selected === av.id ? `2px solid ${T.colors.primary}` : `1px solid ${T.colors.border}`,
              borderRadius: 12,
              padding: 24,
              cursor: 'pointer',
              background: selected === av.id ? '#F5F3FF' : '#fff',
              transition: 'all 0.2s',
            }}
          >
            <div style={{
              width: 64, height: 64, borderRadius: 32,
              background: av.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, marginBottom: 12,
            }}>
              {av.emoji}
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: T.colors.textPrimary }}>{av.name}</div>
            <div style={{ fontSize: 13, color: T.colors.textSecondary, marginTop: 4 }}>{av.desc}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
        <button
          onClick={() => selected && onNavigate('banbo-script')}
          disabled={!selected}
          style={{
            padding: '10px 24px', borderRadius: 6, border: 'none',
            background: selected ? T.colors.primary : '#ccc', color: '#fff',
            fontSize: 14, fontWeight: 500, cursor: selected ? 'pointer' : 'not-allowed',
          }}
        >
          下一步：配置台词
        </button>
      </div>
    </div>
  )
}
