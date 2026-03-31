import React, { useState } from 'react'

export default function CommentTab() {
  const [autoEnabled, setAutoEnabled] = useState(false)
  const [replyEnabled, setReplyEnabled] = useState(false)
  const [interval, setInterval] = useState('120')
  const [comments, setComments] = useState('')

  return (
    <div className="p-4">
      {/* Auto comment */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">定时自动发评</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">间隔</span>
            <input
              type="number"
              value={interval}
              onChange={e => setInterval(e.target.value)}
              className="w-16 px-2 py-1 border border-gray-200 rounded text-xs"
            />
            <span className="text-xs text-gray-400">秒</span>
            <div
              onClick={() => setAutoEnabled(!autoEnabled)}
              className={`toggle-switch ${autoEnabled ? 'active' : ''}`}
            />
          </div>
        </div>
        <p className="text-xs text-gray-400 mb-2">系统将按照如下间隔定时随机发送公屏弹幕</p>
        <div className="mb-2">
          <textarea
            value={comments}
            onChange={e => setComments(e.target.value)}
            placeholder="一行一条弹幕，系统将随机发送，每条最多50字"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs h-24 resize-none focus:outline-none focus:border-blue-300"
          />
          <div className="text-right text-xs text-gray-400 mt-1">{comments.length}/1000</div>
        </div>
        <button className="text-xs text-blue-600 hover:text-blue-700">+ 新增定时发评</button>
      </div>

      {/* Auto reply */}
      <div className="border-t border-gray-100 pt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">自动回评</span>
          <div className="flex items-center gap-2">
            <div
              onClick={() => setReplyEnabled(!replyEnabled)}
              className={`toggle-switch ${replyEnabled ? 'active' : ''}`}
            />
            <button className="text-xs text-blue-600 hover:text-blue-700">+ 新增回评</button>
          </div>
        </div>
        <p className="text-xs text-gray-400 mb-3">直播过程中系统会根据配置好的评论关键词和回评内容，自动触发回评</p>

        {/* Table */}
        <div className="border border-gray-100 rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-gray-500">回评组</th>
                <th className="px-3 py-2 text-left text-gray-500">评论关键词</th>
                <th className="px-3 py-2 text-left text-gray-500">主播回评</th>
                <th className="px-3 py-2 text-left text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} className="px-3 py-8 text-center text-gray-400">
                  暂无数据
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}