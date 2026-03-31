import React, { useState } from 'react'
import { tokens } from './tokens'

type Props = { onNavigate: (page: any) => void }

const T = tokens

const actions = [
  { id: 'a1', name: '待机', desc: '默认状态，伴播安静站立', duration: '循环', selected: true },
  { id: 'a2', name: '说话', desc: '伴播开口说话时的动作', duration: '随台词', selected: true },
  { id: 'a3', name: '点头', desc: '表示赞同/确认', duration: '2秒', selected: false },
  { id: 'a4', name: '举手', desc: '引导注意力到商品', duration: '3秒', selected: false },
  { id: 'a5', name: '鼓掌', desc: '庆祝成交/好评', duration: '3秒', selected: false },
  { id: 'a6', name: '比心', desc: '感谢观众互动', duration: '2秒', selected: false },
]

export default function ActionConfigPage({ onNavigate }: Props) {
  const [selectedActions, setSelectedActions] = useState<string[]>(
    actions.filter(a => a.selected).map(a => a.id)
  )

  const toggleAction = (id: string) => {
    setSelectedActions(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  return (
    <div style={{ padding: 32, fontFamily: T.fonts.family }}>
      <div style={{ fontSize: 18, fontWeight: 600, color: T.colors.textPrimary, marginBottom: 4 }}>
        伴播动作配置
      </div>
      <div style={{ fontSize: 13, color: T.colors.textSecondary, marginBottom: 24 }}>
        选择伴播在直播间可用的动作，开播后按场景自动触发
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {actions.map(a => {
          const isSelected = selectedActions.includes(a.id)
          return (
            <div
              key={a.id}
              onClick={() => toggleAction(a.id)}
              style={{
                border: isSelected ? `2px solid ${T.colors.primary}` : `1px solid ${T.colors.border}`,
                borderRadius: 10, padding: 16, cursor: 'pointer',
                background: isSelected ? '#F5F3FF' : '#fff',
                transition: 'all 0.2s',
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 20,
                background: isSelected ? T.colors.primary : '#F2F3F5',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, marginBottom: 8,
              }}>
                {a.name === '待机' ? '🧘' : a.name === '说话' ? '🗣️' : a.name === '点头' ? '👍' : a.name === '举手' ? '🙋' : a.name === '鼓掌' ? '👏' : '❤️'}
              </div>
              <div style={{ fontSize: 14, fontWeight: 500, color: T.colors.textPrimary }}>{a.name}</div>
              <div style={{ fontSize: 12, color: T.colors.textSecondary, marginTop: 2 }}>{a.desc}</div>
              <div style={{ fontSize: 11, color: T.colors.textTertiary, marginTop: 4 }}>时长: {a.duration}</div>
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
        <button onClick={() => onNavigate('banbo-script')} style={btnStyle('#fff', T.colors.border)}>
          上一步
        </button>
        <button onClick={() => onNavigate('banbo-preview')} style={btnStyle(T.colors.primary, '#fff')}>
          下一步：预览效果
        </button>
      </div>
    </div>
  )
}

const btnStyle = (bg: string, color: string): React.CSSProperties => ({
  padding: '10px 24px', borderRadius: 6, border: bg === '#fff' ? `1px solid ${T.colors.border}` : 'none',
  background: bg, color, fontSize: 14, fontWeight: 500, cursor: 'pointer',
})
