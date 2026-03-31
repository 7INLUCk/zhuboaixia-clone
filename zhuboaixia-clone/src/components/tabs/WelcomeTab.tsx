import React, { useState } from 'react'

export default function WelcomeTab() {
  const [subTab, setSubTab] = useState('enter')
  const [enabled, setEnabled] = useState(true)
  const [welcomeText, setWelcomeText] = useState(`欢迎 #观众 进入直播间
#观众，欢迎进入直播间，小黄车所有商品均已开价
欢迎 #观众，想看哪个品请打在公屏上，主播马上讲解`)

  const subTabs = [
    { key: 'enter', label: '进入直播间' },
    { key: 'follow', label: '关注主播' },
    { key: 'like', label: '点赞' },
    { key: 'share', label: '分享' },
    { key: 'order', label: '下单' },
  ]

  return (
    <div className="p-4">
      {/* Sub-tabs */}
      <div className="flex border-b border-gray-100 mb-4 overflow-x-auto">
        {subTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setSubTab(tab.key)}
            className={`px-3 py-2 text-sm whitespace-nowrap ${
              subTab === tab.key ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-400 mb-3">
        开启后直播间新进观众时，系统将自动在评论区发送一条欢迎语
      </p>

      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-600">开启</span>
        <div
          onClick={() => setEnabled(!enabled)}
          className={`toggle-switch ${enabled ? 'active' : ''}`}
        />
      </div>

      <div className="mb-2">
        <div className="text-sm text-gray-700 mb-2">欢迎语格式</div>
        <p className="text-xs text-gray-400 mb-2">一行一条，系统会随机从中套用一条，#观众 代表观众名</p>
        <textarea
          value={welcomeText}
          onChange={e => setWelcomeText(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs h-32 resize-none focus:outline-none focus:border-blue-300"
        />
      </div>
    </div>
  )
}