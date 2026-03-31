import React, { useState } from 'react'

export default function VoicePricingTab() {
  const [configs, setConfigs] = useState<any[]>([])

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm font-medium text-gray-700">声控开价/预热</div>
          <div className="text-xs text-gray-400 mt-1">配置声控开价和预热口令及关联商品</div>
        </div>
        <button className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700">
          + 新增配置
        </button>
      </div>

      {/* Table */}
      <div className="border border-gray-100 rounded-lg overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-gray-500">分组名称</th>
              <th className="px-3 py-2 text-left text-gray-500">指令口令</th>
              <th className="px-3 py-2 text-left text-gray-500">关联商品</th>
              <th className="px-3 py-2 text-left text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={4} className="px-3 py-12 text-center">
                <div className="text-gray-400 text-sm mb-1">暂无配置数据</div>
                <div className="text-gray-300 text-xs">请点击上方按钮添加新的声控开价/预热分组</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}