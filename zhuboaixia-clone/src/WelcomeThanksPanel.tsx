import React, { useState } from 'react'
import { TabBar, C, Toggle, PanelKey } from './shared'

type Props = { onClose: () => void; onSwitchPanel?: (p: PanelKey) => void; onConfirmConfig?: () => void }

const PRODUCTS = [
  { id: 'p1', label: '目视伦负离子光波时尚眼镜', price: '¥138.00', stock: '18.6万', sold: 0, exposure: '0%', img: '🎧' },
  { id: 'p2', label: '超好看米色短外套女小个子春季新款', price: '¥78.00', stock: '99万+', sold: 0, exposure: '0%', img: '🧥' },
  { id: 'p3', label: '张紫一春夏莫代尔舒适休闲两件套', price: '¥138.00', stock: '99万+', sold: 0, exposure: '0%', img: '👗' },
]

const SCENES = [
  { key: 'enter', label: '🚪 进入直播间', toggleDesc: '开启后直播间新进观众时，系统将自动在评论区发送一条欢迎语', placeholder: '欢迎 #观众 进入直播间' },
  { key: 'follow', label: '❤️ 关注主播', toggleDesc: '开启后直播间有观众关注主播时，系统将自动在评论区发送一条感谢', placeholder: '感谢 #观众 的关注' },
  { key: 'like', label: '👍 点赞', toggleDesc: '开启后直播间有观众点赞时，系统将自动在评论区发送一条感谢', placeholder: '感谢 #观众 的点赞' },
  { key: 'share', label: '🔗 分享', toggleDesc: '开启后直播间有观众分享直播间时，系统将自动在评论区发送一条感谢', placeholder: '感谢 #观众 分享直播间' },
  { key: 'order', label: '🛒 下单', toggleDesc: '开启后直播间有观众下单并付款后，系统将自动在评论区发送一条感谢', placeholder: '感谢#观众 老板支持，为老板安排加急发货~' },
]

export default function WelcomeThanksPanel({ onClose, onSwitchPanel, onConfirmConfig }: Props) {
  const [scenes, setScenes] = useState<Record<string, { enabled: boolean; content: string }>>({
    enter: { enabled: true, content: '欢迎 #观众 进入直播间' },
    follow: { enabled: true, content: '感谢 #观众 的关注' },
    like: { enabled: true, content: '感谢 #观众 的点赞' },
    share: { enabled: true, content: '感谢 #观众 分享直播间' },
    order: { enabled: true, content: '感谢#观众 老板支持，为老板安排加急发货~' },
  })

  const toggleScene = (key: string) => {
    setScenes(prev => ({ ...prev, [key]: { ...prev[key], enabled: !prev[key].enabled } }))
  }

  const updateContent = (key: string, content: string) => {
    setScenes(prev => ({ ...prev, [key]: { ...prev[key], content } }))
  }

  const hintBox = (
    <div style={{
      padding: '6px 10px', borderRadius: 6, marginBottom: 8,
      background: '#F0F5FF', border: '1px solid #BEDAFF',
      fontSize: 10, color: '#4E5969', lineHeight: 1.6,
    }}>
      一行一条，系统会随机从中套用一条，<code style={{ background: '#E8ECF0', padding: '1px 4px', borderRadius: 3 }}>#观众</code> 代表观众名
    </div>
  )

  return (
    <div style={{
      position: 'absolute', top: 36, right: 0, bottom: 0, width: 520,
      zIndex: 102, overflow: 'hidden', borderRadius: '8px 0 0 0',
      boxShadow: '-2px 0 16px rgba(0,0,0,0.15)', fontFamily: C.font,
      display: 'flex', flexDirection: 'column', background: C.bg,
    }}>
      <div style={{ padding: '10px 16px', background: C.card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: C.text }}>👋 欢迎 / 感谢</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 18, color: C.textSec, cursor: 'pointer', padding: 4 }}>✕</button>
      </div>
      {onSwitchPanel && <TabBar active="welcomeThanks" onSwitch={onSwitchPanel} />}

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>
        <div style={{ fontSize: 12, color: C.textSec, marginBottom: 12, lineHeight: 1.6 }}>
          观众触发行为时，系统自动在评论区发送欢迎/感谢话术。
        </div>

        {SCENES.map(scene => {
          const state = scenes[scene.key] || { enabled: false, content: '' }
          return (
            <div key={scene.key} style={{
              padding: '12px 14px', background: C.card, borderRadius: 10,
              border: `1px solid ${C.border}`, marginBottom: 10,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: state.enabled ? 10 : 0 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{scene.label}</span>
                <Toggle checked={state.enabled} onChange={() => toggleScene(scene.key)} />
              </div>
              {state.enabled && (
                <>
                  <div style={{ fontSize: 11, color: C.textSec, marginBottom: 6, lineHeight: 1.5 }}>{scene.toggleDesc}</div>
                  {hintBox}
                  <textarea value={state.content} onChange={e => updateContent(scene.key, e.target.value)}
                    placeholder={scene.placeholder}
                    style={{
                      width: '100%', height: 80, padding: '8px 10px', borderRadius: 8,
                      border: `1px solid ${C.border}`, fontSize: 12, fontFamily: C.font,
                      resize: 'none', outline: 'none', boxSizing: 'border-box', lineHeight: 1.6,
                    }} />
                </>
              )}
            </div>
          )
        })}

        {/* ===== 直播商品列表 ===== */}
        <div style={{ marginTop: 20, borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 10 }}>直播商品</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {PRODUCTS.map((p, i) => (
              <div key={p.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', background: C.card, borderRadius: 8, border: `1px solid ${C.border}`,
              }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: C.textSec, width: 18, textAlign: 'center', flexShrink: 0 }}>{i + 1}</span>
                <div style={{ width: 40, height: 40, borderRadius: 6, background: '#F5F6F7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{p.img}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: C.text, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.label}</div>
                  <div style={{ fontSize: 10, color: C.textTert, marginTop: 4, display: 'flex', gap: 12 }}>
                    <span>到手价/库存：<span style={{ color: C.red }}>{p.price}</span>/{p.stock}</span>
                    <span>成交：¥0.00/0</span>
                    <span>曝光率：{p.exposure}</span>
                  </div>
                </div>
                <button style={{
                  padding: '4px 10px', borderRadius: 4, border: `1px solid ${C.border}`,
                  background: C.card, color: C.textSec, fontSize: 11, cursor: 'pointer', fontFamily: C.font,
                  flexShrink: 0,
                }}>📢 讲解</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: '12px 16px', background: C.card, borderTop: `1px solid ${C.border}`, display: 'flex', gap: 10, flexShrink: 0 }}>
        <button onClick={onClose} style={{ flex: 1, height: 42, borderRadius: 8, background: 'transparent', border: `1px solid ${C.border}`, color: C.textSec, fontSize: 14, cursor: 'pointer', fontFamily: C.font }}>取消</button>
        <button onClick={onConfirmConfig} style={{ flex: 2, height: 42, borderRadius: 8, background: C.blue, border: 'none', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: C.font, boxShadow: '0 2px 8px rgba(51,112,255,0.3)' }}>确认配置</button>
      </div>
    </div>
  )
}
