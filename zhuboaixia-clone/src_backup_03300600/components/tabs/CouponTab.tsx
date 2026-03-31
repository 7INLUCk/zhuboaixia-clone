import React from 'react'

export default function CouponTab() {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-600">达人券</span>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-50">
            刷新
          </button>
          <button className="px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-50">
            全部取消
          </button>
        </div>
      </div>

      <div className="text-xs text-gray-400 mb-4">共0条记录</div>

      <div className="border border-gray-100 rounded-lg overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-gray-500">优惠券信息</th>
              <th className="px-3 py-2 text-left text-gray-500">循环弹券次数</th>
              <th className="px-3 py-2 text-left text-gray-500">间隔时间(秒)</th>
              <th className="px-3 py-2 text-left text-gray-500">发券状态</th>
              <th className="px-3 py-2 text-left text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} className="px-3 py-8 text-center text-gray-400">
                无达人券记录 <span className="text-blue-600 cursor-pointer hover:underline">前往达人券管理</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}