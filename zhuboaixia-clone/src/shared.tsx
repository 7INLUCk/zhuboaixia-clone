import React, { useState } from 'react'

type PanelKey = 'avatar' | 'voice' | 'voiceSwitch' | 'autoChat' | 'sceneLayout' | 'autoComment' | 'welcomeThanks' | 'priceControl' | 'coupons' | 'luckyBag' | 'systemSettings'
type Props = { onClose: () => void; onSwitchPanel?: (panel: PanelKey) => void; onConfirmConfig?: () => void }

const C = {
  blue: '#3370FF', blueLight: 'rgba(51,112,255,0.08)',
  orange: '#FF7D00', orangeLight: 'rgba(255,125,0,0.08)',
  green: '#00B42A', greenLight: 'rgba(0,180,42,0.08)',
  red: '#F53F3F',
  bg: '#F7F8FA', card: '#FFFFFF',
  text: '#1D2129', textSec: '#86909C', textTert: '#C9CDD4',
  border: '#E5E6EB',
  font: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif',
}

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <div onClick={() => !disabled && onChange(!checked)} style={{
      width: 40, height: 22, borderRadius: 11, 
      background: disabled ? '#E5E6EB' : (checked ? C.blue : '#C9CDD4'),
      padding: 2, cursor: disabled ? 'not-allowed' : 'pointer', transition: 'background 0.2s',
      display: 'flex', alignItems: 'center', justifyContent: checked ? 'flex-end' : 'flex-start',
      opacity: disabled ? 0.6 : 1,
    }}>
      <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }} />
    </div>
  )
}

const CORE_TABS: { key: PanelKey; label: string }[] = [
  { key: 'avatar', label: '🎭 伴播形象' },
  { key: 'voice', label: '🔊 伴播音色' },
  { key: 'voiceSwitch', label: '🎙 声控互动' },
  { key: 'autoChat', label: '💬 智能搭话' },
  { key: 'sceneLayout', label: '🎬 场景装修' },
]

const TOOL_TABS: { key: PanelKey; label: string }[] = [
  { key: 'autoComment', label: '💬 发评/回评' },
  { key: 'welcomeThanks', label: '👋 欢迎/感谢' },
  { key: 'priceControl', label: '💰 开价/预热' },
  { key: 'coupons', label: '🎟 优惠券' },
  { key: 'luckyBag', label: '🎁 福袋' },
  { key: 'systemSettings', label: '⚙️ 系统设置' },
]

function TabBar({ active, onSwitch }: { active: PanelKey; onSwitch?: (p: PanelKey) => void }) {
  return (
    <div style={{ flexShrink: 0 }}>
      {/* 核心配置 */}
      <div style={{
        padding: '8px 16px 4px', background: C.card,
        display: 'flex', gap: 4, overflowX: 'auto',
      }}>
        <span style={{ fontSize: 10, color: C.textTert, alignSelf: 'center', marginRight: 2, flexShrink: 0 }}>核心</span>
        {CORE_TABS.map(tab => (
          <button key={tab.key} onClick={() => onSwitch?.(tab.key)} style={{
            padding: '5px 10px', borderRadius: 6, border: 'none', fontSize: 12, whiteSpace: 'nowrap',
            fontWeight: active === tab.key ? 600 : 400,
            background: active === tab.key ? C.blueLight : 'transparent',
            color: active === tab.key ? C.blue : C.textSec,
            cursor: 'pointer', fontFamily: C.font, transition: 'all 0.15s',
          }}>{tab.label}</button>
        ))}
      </div>
      {/* 直播工具 */}
      <div style={{
        padding: '4px 16px 8px', background: C.card, borderBottom: `1px solid ${C.border}`,
        display: 'flex', gap: 4, overflowX: 'auto',
      }}>
        <span style={{ fontSize: 10, color: C.textTert, alignSelf: 'center', marginRight: 2, flexShrink: 0 }}>工具</span>
        {TOOL_TABS.map(tab => (
          <button key={tab.key} onClick={() => onSwitch?.(tab.key)} style={{
            padding: '5px 10px', borderRadius: 6, border: 'none', fontSize: 12, whiteSpace: 'nowrap',
            fontWeight: active === tab.key ? 600 : 400,
            background: active === tab.key ? '#FFF7E6' : 'transparent',
            color: active === tab.key ? C.orange : C.textSec,
            cursor: 'pointer', fontFamily: C.font, transition: 'all 0.15s',
          }}>{tab.label}</button>
        ))}
      </div>
    </div>
  )
}

export { TabBar, CORE_TABS, TOOL_TABS, C, Toggle }
export type { PanelKey, Props }

