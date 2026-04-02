import React, { useState } from 'react'
import { TabBar, C, PanelKey } from './shared'

type Props = { onClose: () => void; onSwitchPanel?: (p: PanelKey) => void; onConfirmConfig?: () => void }

type PriceRule = { id: string; name: string; openCmd: string; warmupCmd: string; products: string[] }

const PRODUCTS = [
  { id: 'p1', label: '1号 助播虾落地支架', price: '¥138.00', stock: '99万+', sold: 0, exposure: '0%', img: '🎧' },
  { id: 'p2', label: '2号 磁吸挂脖支架', price: '¥78.00', stock: '99万+', sold: 0, exposure: '0%', img: '🧥' },
  { id: 'p3', label: '3号 补光灯套装', price: '¥138.00', stock: '99万+', sold: 0, exposure: '0%', img: '👕' },
  { id: 'p4', label: '4号 手机三脚架', price: '¥27.90', stock: '1.63万', sold: 0, exposure: '0%', img: '📱' },
]

export default function PriceControlPanel({ onClose, onSwitchPanel, onConfirmConfig }: Props) {
  const [rules, setRules] = useState<PriceRule[]>([
    { id: 'r1', name: '1号链接', openCmd: '三二一上链接', warmupCmd: '已经没有了', products: ['p1'] },
  ])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [productSearch, setProductSearch] = useState('')
  const [showProductPicker, setShowProductPicker] = useState<string | null>(null)

  const addRule = () => {
    const id = `r${Date.now()}`
    setRules(prev => [...prev, { id, name: '', openCmd: '', warmupCmd: '', products: [] }])
    setEditingId(id)
  }

  const updateRule = (id: string, field: string, value: any) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r))
  }

  const toggleProduct = (ruleId: string, productId: string) => {
    setRules(prev => prev.map(r => {
      if (r.id !== ruleId) return r
      const products = r.products.includes(productId) ? r.products.filter(p => p !== productId) : [...r.products, productId]
      return { ...r, products }
    }))
  }

  const selectAllProducts = (ruleId: string, allIds: string[]) => {
    setRules(prev => prev.map(r => {
      if (r.id !== ruleId) return r
      const allSelected = allIds.every(id => r.products.includes(id))
      return { ...r, products: allSelected ? [] : allIds }
    }))
  }

  const filteredProducts = PRODUCTS.filter(p =>
    productSearch === '' || p.label.toLowerCase().includes(productSearch.toLowerCase())
  )

  const inputStyle: React.CSSProperties = {
    width: '100%', height: 28, padding: '0 8px', borderRadius: 6,
    border: `1px solid ${C.border}`, fontSize: 12, fontFamily: C.font,
    outline: 'none', boxSizing: 'border-box',
  }

  const hintBox = (text: string, examples: string[], tip: string) => (
    <div style={{
      padding: '8px 10px', borderRadius: 6, marginBottom: 8,
      background: '#F0F5FF', border: '1px solid #BEDAFF', fontSize: 10, lineHeight: 1.6,
    }}>
      <div style={{ color: '#1D2129' }}>💡 {text}</div>
      <div style={{ color: '#4E5969' }}>示例：{examples.join('、')}</div>
      <div style={{ color: '#FF7D00', marginTop: 2 }}>{tip}</div>
    </div>
  )

  // 编辑区
  const renderEditForm = (rule: PriceRule) => {
    const currentProducts = PRODUCTS.filter(p => rule.products.includes(p.id))
    return (
      <>
        <div style={{ fontSize: 10, color: C.textTert, marginBottom: 4 }}>分组名称 *</div>
        <input value={rule.name} onChange={e => updateRule(rule.id, 'name', e.target.value)} placeholder="请输入分组名称，最多30字" style={{ ...inputStyle, marginBottom: 8 }} />

        <div style={{ fontSize: 10, color: C.textTert, marginBottom: 4 }}>开价指令 *</div>
        <input value={rule.openCmd} onChange={e => updateRule(rule.id, 'openCmd', e.target.value)} placeholder="请输入开价口令" style={{ ...inputStyle, marginBottom: 4 }} />
        {hintBox('全场同步：只要您说出口令，关联的所有商品都会同步进入开价状态。', ['三二一开价', '上链接三二一开抢'], '建议：涉及数字时尽量使用中文（如「两百」、「六幺八」），能显著提升语音匹配触发率。')}

        <div style={{ fontSize: 10, color: C.textTert, marginBottom: 4 }}>预热指令 *</div>
        <input value={rule.warmupCmd} onChange={e => updateRule(rule.id, 'warmupCmd', e.target.value)} placeholder="请输入预热口令" style={{ ...inputStyle, marginBottom: 4 }} />
        {hintBox('全场同步：只要您说出口令，关联的所有商品都会同步进入预热状态。', ['小助理把商品截单', '抢购结束啦'], '建议：涉及数字时尽量使用中文（如「两百」、「六幺八」），能显著提升语音匹配触发率。')}

        <div style={{ fontSize: 10, color: C.textTert, marginBottom: 4 }}>关联商品</div>
        {/* 搜索 + 全选 */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
          <input value={productSearch} onChange={e => setProductSearch(e.target.value)} placeholder="搜索商品名称" style={{ ...inputStyle, flex: 1, height: 26, fontSize: 11 }} />
          <label style={{ fontSize: 11, color: C.textSec, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <input type="checkbox" checked={filteredProducts.length > 0 && filteredProducts.every(p => rule.products.includes(p.id))}
              onChange={() => selectAllProducts(rule.id, filteredProducts.map(p => p.id))} />
            全选
          </label>
        </div>
        {/* 商品复选框列表 */}
        <div style={{ maxHeight: 120, overflowY: 'auto', border: `1px solid ${C.border}`, borderRadius: 6, marginBottom: 8 }}>
          {filteredProducts.length === 0 ? (
            <div style={{ padding: 16, textAlign: 'center', fontSize: 11, color: C.textTert }}>暂无匹配商品</div>
          ) : filteredProducts.map(p => (
            <label key={p.id} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px',
              borderBottom: `1px solid ${C.border}`, cursor: 'pointer', fontSize: 11, color: C.text,
            }}>
              <input type="checkbox" checked={rule.products.includes(p.id)} onChange={() => toggleProduct(rule.id, p.id)} />
              <span>{p.img}</span>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.label}</span>
              <span style={{ color: C.red, fontSize: 10, flexShrink: 0 }}>{p.price}</span>
            </label>
          ))}
        </div>
        {currentProducts.length > 0 && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
            {currentProducts.map(p => (
              <span key={p.id} style={{
                padding: '2px 6px', borderRadius: 4, fontSize: 10,
                background: C.blueLight, color: C.blue, border: `1px solid ${C.blue}`,
              }}>{p.label} ✕</span>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
          <button onClick={() => setEditingId(null)} style={{
            padding: '4px 16px', borderRadius: 4, border: 'none',
            background: C.blue, color: '#fff', fontSize: 11, cursor: 'pointer', fontFamily: C.font,
          }}>完成</button>
        </div>
      </>
    )
  }

  return (
    <div style={{
      position: 'absolute', top: 36, right: 0, bottom: 0, width: 520,
      zIndex: 102, overflow: 'hidden', borderRadius: '8px 0 0 0',
      boxShadow: '-2px 0 16px rgba(0,0,0,0.15)', fontFamily: C.font,
      display: 'flex', flexDirection: 'column', background: C.bg,
    }}>
      {/* 顶栏 */}
      <div style={{ padding: '10px 16px', background: C.card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: C.text }}>💰 声控开价 / 预热</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 18, color: C.textSec, cursor: 'pointer', padding: 4 }}>✕</button>
      </div>
      {onSwitchPanel && <TabBar active="priceControl" onSwitch={onSwitchPanel} />}

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>
        {/* 副标题 */}
        <div style={{ fontSize: 12, color: C.textSec, marginBottom: 12, lineHeight: 1.6 }}>
          配置声控开价和预热口令及关联商品，识别到口令后自动执行讲解操作。
        </div>

        {/* 新增按钮 */}
        <button onClick={addRule} style={{
          width: '100%', padding: '10px', borderRadius: 8, border: `1.5px dashed ${C.border}`,
          background: 'transparent', color: C.blue, fontSize: 12, cursor: 'pointer', fontFamily: C.font, marginBottom: 12,
        }}>+ 新增配置</button>

        {/* 配置列表 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rules.map(rule => (
            <div key={rule.id} style={{ padding: '12px 14px', background: C.card, borderRadius: 10, border: `1px solid ${C.border}` }}>
              {editingId === rule.id ? renderEditForm(rule) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{rule.name || '(未命名)'}</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => setEditingId(rule.id)} style={{ padding: '2px 8px', borderRadius: 4, border: `1px solid ${C.border}`, background: C.card, color: C.blue, fontSize: 10, cursor: 'pointer', fontFamily: C.font }}>编辑</button>
                      <button onClick={() => setRules(p => p.filter(r => r.id !== rule.id))} style={{ padding: '2px 8px', borderRadius: 4, border: `1px solid ${C.border}`, background: C.card, color: C.red, fontSize: 10, cursor: 'pointer', fontFamily: C.font }}>删除</button>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: C.textSec, lineHeight: 1.6 }}>
                    <div>开价指令：<span style={{ color: C.green }}>{rule.openCmd || '—'}</span></div>
                    <div>预热指令：<span style={{ color: '#FF7D00' }}>{rule.warmupCmd || '—'}</span></div>
                    <div>关联商品：{rule.products.length > 0 ? rule.products.map(pid => PRODUCTS.find(p => p.id === pid)?.label).join('、') : '未关联'}</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ===== 直播商品列表 ===== */}
        <div style={{ marginTop: 20, borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 10 }}>直播商品</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {PRODUCTS.map((p, i) => (
              <div key={p.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', background: C.card, borderRadius: 8, border: `1px solid ${C.border}`,
              }}>
                {/* 序号 */}
                <span style={{ fontSize: 14, fontWeight: 700, color: C.textSec, width: 18, textAlign: 'center', flexShrink: 0 }}>{i + 1}</span>
                {/* 缩略图 */}
                <div style={{ width: 40, height: 40, borderRadius: 6, background: '#F5F6F7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{p.img}</div>
                {/* 信息 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: C.text, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.label}</div>
                  <div style={{ fontSize: 10, color: C.textTert, marginTop: 4, display: 'flex', gap: 12 }}>
                    <span>到手价/库存：<span style={{ color: C.red }}>{p.price}</span>/{p.stock}</span>
                    <span>成交：¥0.00/0</span>
                    <span>曝光率：{p.exposure}</span>
                  </div>
                </div>
                {/* 讲解按钮 */}
                <button style={{
                  padding: '4px 10px', borderRadius: 4, border: `1px solid ${C.border}`,
                  background: C.card, color: C.textSec, fontSize: 11, cursor: 'pointer', fontFamily: C.font,
                  flexShrink: 0,
                }}>📢 讲解</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 底部按钮 */}
      <div style={{ padding: '12px 16px', background: C.card, borderTop: `1px solid ${C.border}`, display: 'flex', gap: 10, flexShrink: 0 }}>
        <button onClick={onClose} style={{ flex: 1, height: 42, borderRadius: 8, background: 'transparent', border: `1px solid ${C.border}`, color: C.textSec, fontSize: 14, cursor: 'pointer', fontFamily: C.font }}>取消</button>
        <button onClick={onConfirmConfig} style={{ flex: 2, height: 42, borderRadius: 8, background: C.blue, border: 'none', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: C.font, boxShadow: '0 2px 8px rgba(51,112,255,0.3)' }}>确认配置</button>
      </div>
    </div>
  )
}
