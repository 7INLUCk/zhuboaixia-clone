import React, { useState } from 'react'
import { TabBar, C, PanelKey } from './shared'

type Props = { onClose: () => void; onSwitchPanel?: (p: PanelKey) => void; onConfirmConfig?: () => void }

type MicDevice = { id: string; name: string; isDefault: boolean }

const PRODUCTS = [
  { id: 'p1', label: '目视伦负离子光波时尚眼镜', price: '¥138.00', stock: '18.6万', sold: 0, exposure: '0%', img: '🎧' },
  { id: 'p2', label: '超好看米色短外套女小个子春季新款', price: '¥78.00', stock: '99万+', sold: 0, exposure: '0%', img: '🧥' },
  { id: 'p3', label: '张紫一春夏莫代尔舒适休闲两件套', price: '¥138.00', stock: '99万+', sold: 0, exposure: '0%', img: '👗' },
]

const MOCK_MICS: MicDevice[] = [
  { id: 'm1', name: 'Default - 麦克风 (ToDesk Virtual Audio)', isDefault: true },
  { id: 'm2', name: 'Communications - 耳机式麦克风 (花冉 Halo Soundbar Hands-Free AG Audio)', isDefault: false },
  { id: 'm3', name: '麦克风 (UGREEN Camera 2K)', isDefault: false },
  { id: 'm4', name: '麦克风 (ToDesk Virtual Audio)', isDefault: false },
]

type BgOption = { key: string; label: string; desc: string; color: string }

const BG_OPTIONS: BgOption[] = [
  { key: 'none', label: '无背景色', desc: '不设置特定背景色，不使用抠像功能时可选', color: '' },
  { key: 'green', label: '绿色背景', desc: '推荐在使用标准绿幕「场景装修」时选择', color: '#00C853' },
  { key: 'blue', label: '蓝色背景', desc: '适合部分直播间灯光偏暖的场景', color: '#2979FF' },
]

export default function SystemSettingsPanel({ onClose, onSwitchPanel, onConfirmConfig }: Props) {
  const [activeTab, setActiveTab] = useState<'audio' | 'camera'>('audio')
  const [selectedMic, setSelectedMic] = useState('m1')
  const [mics, setMics] = useState<MicDevice[]>(MOCK_MICS)
  const [bgColor, setBgColor] = useState('green')

  const refreshMics = () => {
    // 模拟刷新设备列表
    setMics([...MOCK_MICS])
  }

  return (
    <div style={{
      position: 'absolute', top: 36, right: 0, bottom: 0, width: 520,
      zIndex: 102, overflow: 'hidden', borderRadius: '8px 0 0 0',
      boxShadow: '-2px 0 16px rgba(0,0,0,0.15)', fontFamily: C.font,
      display: 'flex', flexDirection: 'column', background: C.bg,
    }}>
      <div style={{ padding: '10px 16px', background: C.card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: C.text }}>⚙️ 系统设置</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 18, color: C.textSec, cursor: 'pointer', padding: 4 }}>✕</button>
      </div>
      {onSwitchPanel && <TabBar active="systemSettings" onSwitch={onSwitchPanel} />}

      {/* 子 Tab：声音设备设置 / 镜头设置 */}
      <div style={{
        display: 'flex', gap: 0, padding: '0 16px',
        borderBottom: `1px solid ${C.border}`, flexShrink: 0,
      }}>
        {[
          { key: 'audio' as const, label: '🎤 声音设备设置' },
          { key: 'camera' as const, label: '📷 镜头设置' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            padding: '10px 16px', border: 'none', background: 'none',
            fontSize: 13, fontWeight: activeTab === tab.key ? 600 : 400,
            color: activeTab === tab.key ? C.blue : C.textSec,
            borderBottom: activeTab === tab.key ? `2px solid ${C.blue}` : '2px solid transparent',
            cursor: 'pointer', fontFamily: C.font,
          }}>{tab.label}</button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>
        {activeTab === 'audio' && (
          <>
            {/* 声音输入设备 */}
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 }}>声音输入设备</div>
            <div style={{ fontSize: 12, color: C.textSec, marginBottom: 12, lineHeight: 1.6 }}>
              请选择要使用的麦克风设备，系统会优先使用您在这里选择的设备。
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
              {mics.map(mic => (
                <div key={mic.id} onClick={() => setSelectedMic(mic.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                  border: selectedMic === mic.id ? `1.5px solid ${C.blue}` : `1px solid ${C.border}`,
                  background: selectedMic === mic.id ? C.blueLight : C.card,
                }}>
                  {/* Radio */}
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                    border: `2px solid ${selectedMic === mic.id ? C.blue : '#C9CDD4'}`,
                  }}>
                    {selectedMic === mic.id && (
                      <span style={{
                        width: 8, height: 8, borderRadius: '50%', background: C.blue,
                      }} />
                    )}
                  </span>
                  {/* 麦克风图标 */}
                  <span style={{ fontSize: 18, flexShrink: 0 }}>
                    {selectedMic === mic.id ? '🎙️' : '🎤'}
                  </span>
                  {/* 设备名 */}
                  <span style={{
                    flex: 1, fontSize: 12,
                    color: selectedMic === mic.id ? C.blue : C.text,
                    fontWeight: selectedMic === mic.id ? 500 : 400,
                  }}>{mic.name}</span>
                  {/* 默认标签 */}
                  {mic.isDefault && (
                    <span style={{
                      padding: '1px 6px', borderRadius: 3, fontSize: 10,
                      background: C.blueLight, color: C.blue, fontWeight: 500,
                    }}>默认</span>
                  )}
                </div>
              ))}
            </div>

            {/* 刷新列表 */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={refreshMics} style={{
                padding: '6px 14px', borderRadius: 6, border: 'none',
                background: C.blue, color: '#fff', fontSize: 12,
                cursor: 'pointer', fontFamily: C.font,
              }}>刷新列表</button>
            </div>
          </>
        )}

        {activeTab === 'camera' && (
          <>
            {/* 选择镜头背景颜色 */}
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 }}>选择镜头背景颜色</div>
            <div style={{ fontSize: 12, color: C.textSec, marginBottom: 12, lineHeight: 1.6 }}>
              选择您在使用抠像或绿幕功能时的背景颜色，用于提升识别效果。
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {BG_OPTIONS.map(opt => (
                <div key={opt.key} onClick={() => setBgColor(opt.key)} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px', borderRadius: 8, cursor: 'pointer',
                  border: bgColor === opt.key ? `1.5px solid ${C.blue}` : `1px solid ${C.border}`,
                  background: bgColor === opt.key ? C.blueLight : C.card,
                }}>
                  {/* 颜色方块 */}
                  <div style={{
                    width: 36, height: 36, borderRadius: 6, flexShrink: 0,
                    background: opt.color || '#F5F6F7',
                    border: opt.color ? 'none' : `1px dashed ${C.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {!opt.color && <span style={{ fontSize: 14, color: C.textTert }}>✕</span>}
                  </div>
                  {/* 文字 */}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 13, fontWeight: 600,
                      color: bgColor === opt.key ? C.blue : C.text,
                    }}>{opt.label}</div>
                    <div style={{ fontSize: 11, color: C.textSec, marginTop: 2 }}>{opt.desc}</div>
                  </div>
                  {/* 选中指示 */}
                  {bgColor === opt.key && (
                    <span style={{
                      width: 20, height: 20, borderRadius: '50%',
                      background: C.blue, color: '#fff', fontSize: 12,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>✓</span>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

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
