import React, { useState } from 'react'

export default function VoiceSwitchTab() {
  const [enabled, setEnabled] = useState(false)
  const [popupMode, setPopupMode] = useState<'always' | 'interval' | 'custom'>('interval')
  const [interval, setInterval] = useState('13')
  const [countMode, setCountMode] = useState<'unlimited' | 'limited'>('unlimited')
  const [count, setCount] = useState('3')

  return (
    <div className="p-4">
      {/* Enable switch */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-700">开启声控切品</span>
        <div
          onClick={() => setEnabled(!enabled)}
          className={`toggle-switch ${enabled ? 'active' : ''}`}
        />
      </div>

      {/* Trigger keywords */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-xs text-gray-500 mb-2">触发关键词（主播说出口令自动切换）</div>
        <div className="flex flex-wrap gap-2">
          {['一起看', '置顶', '弹', '切', '我们看下', '咱看下'].map(kw => (
            <span key={kw} className="px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-600">
              {kw}
            </span>
          ))}
        </div>
      </div>

      {/* Popup mode */}
      <div className="mb-4">
        <div className="text-sm text-gray-700 mb-2">弹品模式</div>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input type="radio" checked={popupMode === 'always'} onChange={() => setPopupMode('always')} />
            <span className="text-sm text-gray-600">一直弹</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" checked={popupMode === 'interval'} onChange={() => setPopupMode('interval')} />
            <span className="text-sm text-gray-600">每隔</span>
            <input
              type="number"
              value={interval}
              onChange={e => setInterval(e.target.value)}
              className="w-16 px-2 py-1 border border-gray-200 rounded text-sm"
            />
            <span className="text-sm text-gray-600">秒弹一次</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" checked={popupMode === 'custom'} onChange={() => setPopupMode('custom')} />
            <span className="text-sm text-gray-600">弹窗</span>
            <input type="number" defaultValue="11" className="w-12 px-2 py-1 border border-gray-200 rounded text-sm" />
            <span className="text-sm text-gray-600">秒，消失</span>
            <input type="number" defaultValue="15" className="w-12 px-2 py-1 border border-gray-200 rounded text-sm" />
            <span className="text-sm text-gray-600">秒</span>
          </label>
        </div>
      </div>

      {/* Count mode */}
      <div className="mb-4">
        <div className="text-sm text-gray-700 mb-2">弹出次数</div>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input type="radio" checked={countMode === 'unlimited'} onChange={() => setCountMode('unlimited')} />
            <span className="text-sm text-gray-600">不限次</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" checked={countMode === 'limited'} onChange={() => setCountMode('limited')} />
            <span className="text-sm text-gray-600">弹出</span>
            <input
              type="number"
              value={count}
              onChange={e => setCount(e.target.value)}
              className="w-16 px-2 py-1 border border-gray-200 rounded text-sm"
            />
            <span className="text-sm text-gray-600">次</span>
          </label>
        </div>
      </div>
    </div>
  )
}