import React, { useState } from 'react'

export default function LuckyBagTab() {
  const [sendTime, setSendTime] = useState<'now' | 'scheduled'>('now')
  const [position, setPosition] = useState<'top' | 'bottom'>('bottom')
  const [mode, setMode] = useState<'single' | 'multi' | 'none'>('single')
  const [interval, setInterval] = useState('10')

  return (
    <div className="p-4">
      {/* Send time */}
      <div className="mb-4">
        <div className="text-sm text-gray-700 mb-2">发放时间</div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input type="radio" checked={sendTime === 'now'} onChange={() => setSendTime('now')} />
            <span className="text-sm text-gray-600">立即发放</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" checked={sendTime === 'scheduled'} onChange={() => setSendTime('scheduled')} />
            <span className="text-sm text-gray-600">定时发放</span>
          </label>
        </div>
      </div>

      {/* Interval */}
      <div className="mb-4">
        <div className="text-sm text-gray-700 mb-2">发放频率</div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">开奖间隔</span>
          <input
            type="number"
            value={interval}
            onChange={e => setInterval(e.target.value)}
            className="w-16 px-2 py-1 border border-gray-200 rounded text-sm"
          />
          <span className="text-sm text-gray-600">秒</span>
        </div>
      </div>

      {/* Position */}
      <div className="mb-4">
        <div className="text-sm text-gray-700 mb-2">添加位置</div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input type="radio" checked={position === 'top'} onChange={() => setPosition('top')} />
            <span className="text-sm text-gray-600">顶部</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" checked={position === 'bottom'} onChange={() => setPosition('bottom')} />
            <span className="text-sm text-gray-600">底部</span>
          </label>
        </div>
      </div>

      {/* Mode */}
      <div className="mb-4">
        <div className="text-sm text-gray-700 mb-2">发放模式</div>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input type="radio" checked={mode === 'single'} onChange={() => setMode('single')} />
            <span className="text-sm text-gray-600">单福袋循环</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" checked={mode === 'multi'} onChange={() => setMode('multi')} />
            <span className="text-sm text-gray-600">多福袋循环</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" checked={mode === 'none'} onChange={() => setMode('none')} />
            <span className="text-sm text-gray-600">不循环</span>
          </label>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mb-4">
        <button className="px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-50">
          批量复制
        </button>
        <button className="px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-50">
          批量下线
        </button>
        <button className="px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-50">
          刷新
        </button>
        <button className="px-3 py-1.5 text-xs text-white bg-blue-600 rounded hover:bg-blue-700">
          + 创建福袋
        </button>
      </div>

      {/* Empty state */}
      <div className="text-xs text-gray-400 text-center py-8 border border-gray-100 rounded-lg">
        暂无可用福袋集，请先创建
      </div>
    </div>
  )
}