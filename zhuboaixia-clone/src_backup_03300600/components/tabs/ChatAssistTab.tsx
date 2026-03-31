import React, { useState } from 'react'

export default function ChatAssistTab() {
  const [smartEnabled, setSmartEnabled] = useState(true)
  const [frequency, setFrequency] = useState<'high' | 'medium' | 'low'>('high')
  const [fixedEnabled, setFixedEnabled] = useState(false)
  const [specialNote, setSpecialNote] = useState('当主播强调这款连衣裙是定制棉感面料，夏天穿凉爽透气时，助播要搭话。')

  return (
    <div className="p-4">
      {/* Smart chat */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm font-medium text-gray-700">智能搭话</div>
          <div className="text-xs text-gray-400">系统自动识别主播话术实时跟播搭话</div>
        </div>
        <div
          onClick={() => setSmartEnabled(!smartEnabled)}
          className={`toggle-switch ${smartEnabled ? 'active' : ''}`}
        />
      </div>

      {/* Special note */}
      <div className="mb-4">
        <div className="text-sm text-gray-700 mb-2">搭话助播特别交代</div>
        <textarea
          value={specialNote}
          onChange={e => setSpecialNote(e.target.value)}
          placeholder="描述你希望助播搭话的场景..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm h-20 resize-none focus:outline-none focus:border-blue-300"
        />
      </div>

      {/* Frequency */}
      <div className="mb-4">
        <div className="text-sm text-gray-700 mb-2">搭话频率</div>
        <div className="flex gap-2">
          {[
            { key: 'high', label: '🚀 高频搭话', desc: '节奏快' },
            { key: 'medium', label: '⚡ 中频搭话', desc: '适中' },
            { key: 'low', label: '🐌 低频搭话', desc: '舒缓' },
          ].map(opt => (
            <button
              key={opt.key}
              onClick={() => setFrequency(opt.key as any)}
              className={`flex-1 py-2 px-3 rounded-lg text-xs transition-colors ${
                frequency === opt.key
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-50 text-gray-600 border border-gray-200'
              }`}
            >
              <div className="font-medium">{opt.label}</div>
              <div className="text-gray-400">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Fixed chat */}
      <div className="border-t border-gray-100 pt-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-medium text-gray-700">固定搭话</div>
          <div className="flex items-center gap-2">
            <div
              onClick={() => setFixedEnabled(!fixedEnabled)}
              className={`toggle-switch ${fixedEnabled ? 'active' : ''}`}
            />
            <button className="text-xs text-blue-600 hover:text-blue-700">+ 新增</button>
          </div>
        </div>
        <div className="text-xs text-gray-400 text-center py-4 bg-gray-50 rounded">
          暂无固定搭话，点击右上角「新增」按钮添加
        </div>
      </div>
    </div>
  )
}