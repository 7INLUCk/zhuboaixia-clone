import React, { useState } from 'react'

export default function DirectorTab() {
  const [subTab, setSubTab] = useState<'scene' | 'voice'>('scene')
  const [scenes] = useState([
    { id: 'default', name: '默认场景' },
  ])

  return (
    <div className="p-4">
      {/* Sub-tabs */}
      <div className="flex border-b border-gray-100 mb-4">
        <button
          onClick={() => setSubTab('scene')}
          className={`px-4 py-2 text-sm ${subTab === 'scene' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
        >
          场景装修
        </button>
        <button
          onClick={() => setSubTab('voice')}
          className={`px-4 py-2 text-sm ${subTab === 'voice' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
        >
          声控切镜
        </button>
      </div>

      {subTab === 'scene' ? (
        <>
          {/* Scene selector */}
          <div className="flex items-center gap-2 mb-4">
            <select className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm">
              {scenes.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <button className="px-3 py-2 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50">
              + 新增场景
            </button>
          </div>

          {/* Preview */}
          <div className="mb-4">
            <div className="text-sm text-gray-600 mb-2">画面预览</div>
            <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
              <span className="text-sm text-gray-500">暂无预览资源</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mb-4">
            <button className="flex-1 py-2 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-50">
              + 批量新增素材
            </button>
            <button className="flex-1 py-2 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-50">
              + 新增素材
            </button>
            <button className="flex-1 py-2 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-50">
              + 添加摄像头
            </button>
          </div>

          {/* Materials list */}
          <div className="border border-gray-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-700">素材列表</span>
              <button className="text-xs text-gray-400 hover:text-gray-600">清空</button>
            </div>
            <div className="text-xs text-gray-400 text-center py-6">
              暂无数据，点击上方「新增」按钮添加布景素材资源
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Voice switch camera */}
          <div className="flex justify-end mb-4">
            <button className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700">
              + 新增
            </button>
          </div>
          <div className="text-xs text-gray-400 text-center py-8">
            暂无切镜规则，点击「新增」添加
          </div>
        </>
      )}
    </div>
  )
}