import React, { useState } from 'react'

type Props = { onClose: () => void; onSwitchPanel?: (panel: 'avatar' | 'voice' | 'voiceSwitch' | 'autoChat' | 'sceneLayout') => void }

const C = {
  blue: '#3370FF', blueLight: 'rgba(51,112,255,0.08)',
  orange: '#FF7D00', orangeLight: 'rgba(255,125,0,0.08)',
  green: '#00B42A', greenLight: 'rgba(0,180,42,0.08)',
  bg: '#F7F8FA', card: '#FFFFFF',
  text: '#1D2129', textSec: '#86909C', textTert: '#C9CDD4',
  border: '#E5E6EB',
  font: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif',
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div onClick={() => onChange(!checked)} style={{
      width: 40, height: 22, borderRadius: 11, background: checked ? C.blue : '#C9CDD4',
      padding: 2, cursor: 'pointer', transition: 'background 0.2s',
      display: 'flex', alignItems: 'center', justifyContent: checked ? 'flex-end' : 'flex-start',
    }}>
      <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }} />
    </div>
  )
}

// 预设布局
const PRESETS = [
  {
    id: 'left-host',
    name: '主播左 · 伴播右',
    desc: '主播占左侧60%，伴播占右侧40%',
    host: { left: '0%', top: '10%', width: '58%', height: '80%' },
    avatar: { left: '60%', top: '15%', width: '38%', height: '70%' },
  },
  {
    id: 'right-host',
    name: '主播右 · 伴播左',
    desc: '主播占右侧60%，伴播占左侧40%',
    host: { left: '42%', top: '10%', width: '58%', height: '80%' },
    avatar: { left: '2%', top: '15%', width: '38%', height: '70%' },
  },
  {
    id: 'pip-right',
    name: '全屏主播 · 伴播浮窗',
    desc: '主播全屏，伴播在右下角小窗',
    host: { left: '0%', top: '0%', width: '100%', height: '100%' },
    avatar: { left: '60%', top: '55%', width: '36%', height: '40%' },
  },
  {
    id: 'pip-left',
    name: '全屏主播 · 伴播左下',
    desc: '主播全屏，伴播在左下角小窗',
    host: { left: '0%', top: '0%', width: '100%', height: '100%' },
    avatar: { left: '4%', top: '55%', width: '36%', height: '40%' },
  },
]

// 模拟：商品列表
const LIVE_PRODUCTS = [
  { id: 'p1', name: '助播虾落地手机直播支架', linkNum: 1 },
  { id: 'p2', name: '助播虾磁吸直播挂脖支架', linkNum: 2 },
  { id: 'p3', name: '补光灯套装', linkNum: 3 },
]

const TABS = [
  { key: 'avatar' as const, label: '🎭 伴播形象' },
  { key: 'voice' as const, label: '🔊 伴播音色' },
  { key: 'voiceSwitch' as const, label: '🎙 声控互动' },
  { key: 'autoChat' as const, label: '💬 智能搭话' },
  { key: 'sceneLayout' as const, label: '🎬 画面布局' },
]

export default function SceneLayoutPanel({ onClose, onSwitchPanel }: Props) {
  const [selectedPreset, setSelectedPreset] = useState('left-host')
  const [productBindingEnabled, setProductBindingEnabled] = useState(false)
  // 商品→布局绑定
  const [productBindings, setProductBindings] = useState<Record<string, string>>({
    p1: 'left-host', p2: '', p3: '',
  })

  const activePreset = PRESETS.find(p => p.id === selectedPreset) || PRESETS[0]

  return (
    <div style={{
      position: 'absolute', top: 36, right: 0, bottom: 0, width: 520,
      zIndex: 102, overflow: 'hidden', borderRadius: '8px 0 0 0',
      boxShadow: '-2px 0 16px rgba(0,0,0,0.15)', fontFamily: C.font,
      display: 'flex', flexDirection: 'column', background: C.bg,
    }}>
      {/* ===== 顶部 Tab + 关闭 ===== */}
      <div style={{
        padding: '10px 16px', background: C.card, borderBottom: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', gap: 4, overflowX: 'auto' }}>
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => onSwitchPanel?.(tab.key)} style={{
              padding: '6px 10px', borderRadius: 6, border: 'none', fontSize: 12, whiteSpace: 'nowrap',
              fontWeight: tab.key === 'sceneLayout' ? 600 : 400,
              background: tab.key === 'sceneLayout' ? C.blueLight : 'transparent',
              color: tab.key === 'sceneLayout' ? C.blue : C.textSec,
              cursor: 'pointer', fontFamily: C.font, transition: 'all 0.15s',
            }}>{tab.label}</button>
          ))}
        </div>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', fontSize: 18, color: C.textSec,
          cursor: 'pointer', padding: 4, flexShrink: 0,
        }}>✕</button>
      </div>

      {/* ===== 内容区 ===== */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>

        {/* ---- 9:16 实时预览 ---- */}
        <div style={{
          width: '100%', maxWidth: 200, margin: '0 auto 14px',
          aspectRatio: '9/16', borderRadius: 10,
          border: `1px solid ${C.border}`, overflow: 'hidden',
          position: 'relative', background: '#1a1a2e',
        }}>
          {/* 直播背景 */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, #2d1b4e 0%, #1a1a2e 100%)',
          }} />

          {/* 主播区域 */}
          <div style={{
            position: 'absolute',
            ...activePreset.host,
            background: 'linear-gradient(135deg, rgba(255,152,0,0.15) 0%, rgba(255,87,34,0.1) 100%)',
            border: '1px dashed rgba(255,152,0,0.5)',
            borderRadius: 4,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 9, color: 'rgba(255,152,0,0.7)', fontWeight: 600 }}>📷 主播</span>
          </div>

          {/* 伴播形象区域 */}
          <div style={{
            position: 'absolute',
            ...activePreset.avatar,
            background: 'linear-gradient(135deg, rgba(51,112,255,0.15) 0%, rgba(156,39,176,0.1) 100%)',
            border: '1px dashed rgba(51,112,255,0.5)',
            borderRadius: 4,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 9, color: 'rgba(51,112,255,0.7)', fontWeight: 600 }}>🎭 伴播</span>
          </div>

          {/* 预览标签 */}
          <div style={{
            position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.6)', borderRadius: 4, padding: '2px 8px',
            fontSize: 9, color: 'rgba(255,255,255,0.6)',
          }}>
            {activePreset.name}
          </div>
        </div>

        {/* ---- 预设布局 ---- */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8 }}>
            预设布局
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {PRESETS.map(preset => {
              const isActive = selectedPreset === preset.id
              return (
                <button
                  key={preset.id}
                  onClick={() => setSelectedPreset(preset.id)}
                  style={{
                    padding: '10px', borderRadius: 10,
                    border: isActive ? `1.5px solid ${C.blue}` : `1px solid ${C.border}`,
                    background: isActive ? C.blueLight : C.card,
                    cursor: 'pointer', fontFamily: C.font, textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                >
                  {/* 迷你布局预览 */}
                  <div style={{
                    width: '100%', aspectRatio: '9/16', maxHeight: 64,
                    borderRadius: 6, marginBottom: 6, overflow: 'hidden',
                    position: 'relative', background: '#f5f5f5',
                  }}>
                    <div style={{
                      position: 'absolute',
                      left: `calc(${preset.host.left} * 0.9)`,
                      top: `calc(${preset.host.top} * 0.9)`,
                      width: `calc(${preset.host.width} * 0.9)`,
                      height: `calc(${preset.host.height} * 0.9)`,
                      background: isActive ? 'rgba(255,152,0,0.25)' : 'rgba(0,0,0,0.08)',
                      borderRadius: 2,
                    }} />
                    <div style={{
                      position: 'absolute',
                      left: `calc(${preset.avatar.left} * 0.9)`,
                      top: `calc(${preset.avatar.top} * 0.9)`,
                      width: `calc(${preset.avatar.width} * 0.9)`,
                      height: `calc(${preset.avatar.height} * 0.9)`,
                      background: isActive ? 'rgba(51,112,255,0.25)' : 'rgba(0,0,0,0.15)',
                      borderRadius: 2,
                    }} />
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: isActive ? C.blue : C.text, marginBottom: 1 }}>
                    {preset.name}
                  </div>
                  <div style={{ fontSize: 10, color: C.textSec }}>{preset.desc}</div>
                  {isActive && (
                    <div style={{
                      position: 'absolute', top: 6, right: 6,
                      width: 16, height: 16, borderRadius: '50%',
                      background: C.blue, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: 10, fontWeight: 700,
                    }}>✓</div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* ---- 商品场景绑定 ---- */}
        <div style={{
          padding: '12px 14px', background: C.card, borderRadius: 10,
          border: `1px solid ${C.border}`, marginBottom: 14,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: productBindingEnabled ? 10 : 0 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>
                📦 商品场景绑定
                <span style={{ fontSize: 10, fontWeight: 400, color: C.textTert, marginLeft: 4 }}>可选</span>
              </div>
              <div style={{ fontSize: 11, color: C.textSec, marginTop: 2 }}>
                不同商品切换不同画面布局
              </div>
            </div>
            <Toggle checked={productBindingEnabled} onChange={setProductBindingEnabled} />
          </div>

          {productBindingEnabled && (
            <>
              <div style={{
                padding: '6px 10px', marginBottom: 10, borderRadius: 6,
                background: '#F0F5FF', border: '1px solid #D4E0FF',
                fontSize: 11, color: C.blue,
              }}>
                未绑定的商品 → 使用当前默认布局
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {LIVE_PRODUCTS.map(prod => {
                  const bound = productBindings[prod.id] || ''
                  return (
                    <div key={prod.id} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '8px 10px', borderRadius: 8,
                      background: bound ? '#FFFBF0' : '#FAFAFA',
                      border: bound ? '1px solid #FFE58F' : `1px solid ${C.border}`,
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 3, background: '#F0F0F0', color: C.textSec, flexShrink: 0 }}>{prod.linkNum}号</span>
                          <span style={{ fontSize: 12, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prod.name}</span>
                        </div>
                      </div>
                      <select
                        value={bound}
                        onChange={e => setProductBindings(prev => ({ ...prev, [prod.id]: e.target.value }))}
                        onClick={e => e.stopPropagation()}
                        style={{
                          width: 130, height: 28, borderRadius: 6,
                          border: bound ? `1px solid ${C.orange}` : `1px solid ${C.border}`,
                          background: bound ? C.orangeLight : C.card,
                          color: bound ? C.orange : C.textSec,
                          fontSize: 11, fontFamily: C.font, padding: '0 6px',
                          outline: 'none', cursor: 'pointer', flexShrink: 0,
                        }}
                      >
                        <option value="">默认布局</option>
                        {PRESETS.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* ---- 当前布局信息 ---- */}
        <div style={{
          padding: '14px', borderRadius: 10,
          background: 'linear-gradient(135deg, #F0F5FF 0%, #F7F8FA 100%)',
          border: `1px solid ${C.border}`,
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 8 }}>📐 当前布局</div>
          <div style={{ fontSize: 11, color: C.textSec, lineHeight: 1.8 }}>
            <div>布局模式：<span style={{ color: C.blue, fontWeight: 600 }}>{activePreset.name}</span></div>
            <div>主播区域：{activePreset.host.width} × {activePreset.host.height}</div>
            <div>伴播区域：{activePreset.avatar.width} × {activePreset.avatar.height}</div>
            <div style={{ marginTop: 6, fontSize: 10, color: C.textTert }}>
              💡 最终输出到虚拟摄像头，接入抖音直播伴侣
            </div>
          </div>
        </div>
      </div>

      {/* ===== 底部 ===== */}
      <div style={{
        padding: '12px 16px', background: C.card, borderTop: `1px solid ${C.border}`,
        display: 'flex', gap: 10, flexShrink: 0,
      }}>
        <button onClick={onClose} style={{
          flex: 1, height: 42, borderRadius: 8, background: 'transparent',
          border: `1px solid ${C.border}`, color: C.textSec, fontSize: 14, cursor: 'pointer', fontFamily: C.font,
        }}>取消</button>
        <button style={{
          flex: 2, height: 42, borderRadius: 8, background: C.blue, border: 'none',
          color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: C.font,
          boxShadow: '0 2px 8px rgba(51,112,255,0.3)',
        }}>确认配置</button>
      </div>
    </div>
  )
}
