import React, { useState } from 'react'
import { TabBar, C, PanelKey } from './shared'

type Props = { onClose: () => void; onSwitchPanel?: (p: PanelKey) => void }

type LuckyBag = { id: string; name: string; selected: boolean }

const PRODUCTS = [
  { id: 'p1', label: '目视伦负离子光波时尚眼镜', price: '¥138.00', stock: '18.6万', sold: 0, exposure: '0%', img: '🎧' },
  { id: 'p2', label: '超好看米色短外套女小个子春季新款', price: '¥78.00', stock: '99万+', sold: 0, exposure: '0%', img: '🧥' },
  { id: 'p3', label: '张紫一春夏莫代尔舒适休闲两件套', price: '¥138.00', stock: '99万+', sold: 0, exposure: '0%', img: '👗' },
  { id: 'p4', label: '2025新款立领上衣情侣款男女同款', price: '¥27.90', stock: '1.63万', sold: 0, exposure: '0%', img: '🧥' },
]

// 模拟福袋数据
const MOCK_BAGS: LuckyBag[] = [
  { id: 'b1', name: '福袋A - 精美礼品', selected: false },
  { id: 'b2', name: '福袋B - 优惠大礼包', selected: false },
  { id: 'b3', name: '福袋C - 限时惊喜', selected: false },
]

export default function LuckyBagPanel({ onClose, onSwitchPanel }: Props) {
  const [mode, setMode] = useState<'single' | 'multi' | 'none'>('single')
  const [interval, setIntervalVal] = useState(10)
  const [intervalUnit, setIntervalUnit] = useState<'秒' | '分钟'>('秒')
  const [timing, setTiming] = useState<'immediate' | 'scheduled'>('immediate')
  const [scheduleTime, setScheduleTime] = useState('')
  const [position, setPosition] = useState<'top' | 'bottom'>('bottom')
  const [bags, setBags] = useState<LuckyBag[]>(MOCK_BAGS)
  const [bagOrder, setBagOrder] = useState<string[]>([])
  const [hasBags, setHasBags] = useState(false)

  // 模拟刷新获取福袋
  const refreshBags = () => {
    setHasBags(true)
    setBags(MOCK_BAGS.map(b => ({ ...b, selected: false })))
    setBagOrder([])
  }

  const toggleBag = (bagId: string) => {
    setBags(prev => prev.map(b => b.id === bagId ? { ...b, selected: !b.selected } : b))
    if (mode === 'multi') {
      setBagOrder(prev => prev.includes(bagId) ? prev.filter(id => id !== bagId) : [...prev, bagId])
    } else {
      setBagOrder(prev => prev.includes(bagId) ? [] : [bagId])
    }
  }

  const selectAll = () => {
    const allSelected = bags.every(b => b.selected)
    setBags(prev => prev.map(b => ({ ...b, selected: !allSelected })))
    setBagOrder(allSelected ? [] : bags.map(b => b.id))
  }

  const clearOrder = () => {
    setBags(prev => prev.map(b => ({ ...b, selected: false })))
    setBagOrder([])
  }

  const removeFromOrder = (bagId: string) => {
    setBagOrder(prev => prev.filter(id => id !== bagId))
    setBags(prev => prev.map(b => b.id === bagId ? { ...b, selected: false } : b))
  }

  const selectedBags = bags.filter(b => bagOrder.includes(b.id))

  const radioBtn = (active: boolean) => (
    <span style={{
      display: 'inline-block', width: 14, height: 14, borderRadius: '50%',
      border: `2px solid ${active ? C.blue : '#C9CDD4'}`,
      background: active ? C.blue : 'transparent',
      position: 'relative', flexShrink: 0,
    }}>
      {active && <span style={{
        position: 'absolute', top: 3, left: 3, width: 4, height: 4,
        borderRadius: '50%', background: '#fff',
      }} />}
    </span>
  )

  return (
    <div style={{
      position: 'absolute', top: 36, right: 0, bottom: 0, width: 520,
      zIndex: 102, overflow: 'hidden', borderRadius: '8px 0 0 0',
      boxShadow: '-2px 0 16px rgba(0,0,0,0.15)', fontFamily: C.font,
      display: 'flex', flexDirection: 'column', background: C.bg,
    }}>
      <div style={{ padding: '10px 16px', background: C.card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: C.text }}>🎁 发福袋</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 18, color: C.textSec, cursor: 'pointer', padding: 4 }}>✕</button>
      </div>
      {onSwitchPanel && <TabBar active="luckyBag" onSwitch={onSwitchPanel} />}

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>
        {/* ===== 发放时间 ===== */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8 }}>发放时间</div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <label onClick={() => setTiming('immediate')} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12, color: C.text }}>
              {radioBtn(timing === 'immediate')} 立即发放
            </label>
            <label onClick={() => setTiming('scheduled')} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12, color: C.text }}>
              {radioBtn(timing === 'scheduled')} 定时发放
            </label>
          </div>
          {timing === 'scheduled' && (
            <div style={{ marginTop: 8 }}>
              <input type="datetime-local" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)}
                step={1} style={{
                  width: '100%', height: 30, padding: '0 8px', borderRadius: 6,
                  border: `1px solid ${C.border}`, fontSize: 12, fontFamily: C.font, outline: 'none', boxSizing: 'border-box',
                }} />
            </div>
          )}
        </div>

        {/* ===== 发放频率 ===== */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8 }}>发放频率</div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.textSec,
            padding: '10px 14px', background: C.card, borderRadius: 8, border: `1px solid ${C.border}`,
          }}>
            开奖后间隔
            <input type="number" value={interval} min={1}
              onChange={e => setIntervalVal(Math.max(1, parseInt(e.target.value) || 1))}
              style={{
                width: 50, height: 28, padding: '0 4px', borderRadius: 6,
                border: `1px solid ${C.border}`, fontSize: 12, textAlign: 'center',
                outline: 'none', fontFamily: C.font,
              }} />
            <select value={intervalUnit} onChange={e => setIntervalUnit(e.target.value as any)} style={{
              height: 28, padding: '0 4px', borderRadius: 6,
              border: `1px solid ${C.border}`, fontSize: 12, fontFamily: C.font,
              outline: 'none', background: C.card, cursor: 'pointer',
            }}>
              <option value="秒">秒</option>
              <option value="分钟">分钟</option>
            </select>
          </div>
        </div>

        {/* ===== 添加位置 ===== */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8 }}>添加位置</div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <label onClick={() => setPosition('top')} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12, color: C.text }}>
              {radioBtn(position === 'top')} 顶部
            </label>
            <label onClick={() => setPosition('bottom')} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12, color: C.text }}>
              {radioBtn(position === 'bottom')} 底部
            </label>
          </div>
        </div>

        {/* ===== 发放模式 ===== */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8 }}>发放模式</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { key: 'single' as const, label: '单福袋循环', desc: '重复投放同一个' },
              { key: 'multi' as const, label: '多福袋循环', desc: '按顺序循环投放' },
              { key: 'none' as const, label: '不循环', desc: '只发1次' },
            ].map(opt => (
              <button key={opt.key} onClick={() => setMode(opt.key)} style={{
                flex: 1, padding: '8px 6px', borderRadius: 8,
                border: mode === opt.key ? `1.5px solid ${C.blue}` : `1px solid ${C.border}`,
                background: mode === opt.key ? C.blueLight : C.card,
                cursor: 'pointer', fontFamily: C.font, textAlign: 'center',
              }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: mode === opt.key ? C.blue : C.text }}>{opt.label}</div>
                <div style={{ fontSize: 10, color: C.textSec, marginTop: 2 }}>{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ===== 操作工具栏 ===== */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <button onClick={() => {}} style={{
            padding: '4px 10px', borderRadius: 4, border: `1px solid ${C.border}`,
            background: C.card, color: C.textSec, fontSize: 11, cursor: 'pointer', fontFamily: C.font,
          }}>📋 批量复制</button>
          <button onClick={() => {}} style={{
            padding: '4px 10px', borderRadius: 4, border: `1px solid ${C.border}`,
            background: C.card, color: C.textSec, fontSize: 11, cursor: 'pointer', fontFamily: C.font,
          }}>🗑 批量下线</button>
          <button onClick={refreshBags} style={{
            padding: '4px 10px', borderRadius: 4, border: `1px solid ${C.border}`,
            background: C.card, color: C.blue, fontSize: 11, cursor: 'pointer', fontFamily: C.font,
          }}>🔄 刷新</button>
          <button onClick={() => {}} style={{
            padding: '4px 10px', borderRadius: 4, border: 'none',
            background: C.blue, color: '#fff', fontSize: 11, cursor: 'pointer', fontFamily: C.font,
          }}>+ 创建福袋</button>
        </div>

        {/* ===== 福袋选择区 ===== */}
        {!hasBags ? (
          <div style={{
            padding: '20px', borderRadius: 10, border: `1px dashed ${C.border}`,
            textAlign: 'center', color: C.textTert, fontSize: 12, background: C.card, marginBottom: 10,
          }}>
            🎁 暂无可用福袋集，请先创建
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            {/* 左侧：选择福袋 */}
            <div style={{
              flex: 1, background: C.card, borderRadius: 8,
              border: `1px solid ${C.border}`, padding: 10,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: C.text }}>单击选择福袋</span>
                <button onClick={selectAll} style={{
                  padding: '1px 6px', borderRadius: 3, border: `1px solid ${C.border}`,
                  background: C.card, color: C.blue, fontSize: 10, cursor: 'pointer', fontFamily: C.font,
                }}>全选</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {bags.map(bag => (
                  <div key={bag.id} onClick={() => toggleBag(bag.id)} style={{
                    padding: '6px 8px', borderRadius: 4, cursor: 'pointer', fontSize: 11,
                    border: bagOrder.includes(bag.id) ? `1px solid ${C.blue}` : `1px solid ${C.border}`,
                    background: bagOrder.includes(bag.id) ? C.blueLight : C.card,
                    color: bagOrder.includes(bag.id) ? C.blue : C.text,
                  }}>
                    {bag.name}
                  </div>
                ))}
              </div>
            </div>
            {/* 右侧：发放顺序（仅多福袋循环显示） */}
            {mode === 'multi' && (
              <div style={{
                flex: 1, background: C.card, borderRadius: 8,
                border: `1px solid ${C.border}`, padding: 10,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: C.text }}>福袋发放顺序</span>
                  <button onClick={clearOrder} style={{
                    padding: '1px 6px', borderRadius: 3, border: `1px solid ${C.border}`,
                    background: C.card, color: C.red, fontSize: 10, cursor: 'pointer', fontFamily: C.font,
                  }}>清空</button>
                </div>
                {bagOrder.length === 0 ? (
                  <div style={{ padding: '16px 0', textAlign: 'center', fontSize: 11, color: C.textTert }}>
                    点击左侧编号选择福袋
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {bagOrder.map((bagId, idx) => {
                      const bag = bags.find(b => b.id === bagId)
                      if (!bag) return null
                      return (
                        <div key={bagId} style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          padding: '5px 8px', borderRadius: 4,
                          background: '#F7F8FA', border: `1px solid ${C.border}`, fontSize: 11,
                        }}>
                          <span style={{ color: C.textSec, fontWeight: 600, width: 16, textAlign: 'center' }}>{idx + 1}</span>
                          <span style={{ flex: 1, color: C.text }}>{bag.name}</span>
                          <span onClick={() => removeFromOrder(bagId)} style={{ color: C.red, cursor: 'pointer', fontSize: 12 }}>✕</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ===== 直播商品列表 ===== */}
        <div style={{ marginTop: 20, borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 10 }}>直播商品</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {PRODUCTS.map((p, i) => (
              <div key={p.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', background: C.card, borderRadius: 8, border: `1px solid ${C.border}`,
              }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: C.textSec, width: 18, textAlign: 'center', flexShrink: 0 }}>{i + 1}</span>
                <div style={{ width: 40, height: 40, borderRadius: 6, background: '#F5F6F7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{p.img}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: C.text, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.label}</div>
                  <div style={{ fontSize: 10, color: C.textTert, marginTop: 4, display: 'flex', gap: 12 }}>
                    <span>到手价/库存：<span style={{ color: C.red }}>{p.price}</span>/{p.stock}</span>
                    <span>成交：¥0.00/0</span>
                    <span>曝光率：{p.exposure}</span>
                  </div>
                </div>
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

      <div style={{ padding: '12px 16px', background: C.card, borderTop: `1px solid ${C.border}`, display: 'flex', gap: 10, flexShrink: 0 }}>
        <button onClick={onClose} style={{ flex: 1, height: 42, borderRadius: 8, background: 'transparent', border: `1px solid ${C.border}`, color: C.textSec, fontSize: 14, cursor: 'pointer', fontFamily: C.font }}>取消</button>
        <button style={{ flex: 2, height: 42, borderRadius: 8, background: C.blue, border: 'none', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: C.font, boxShadow: '0 2px 8px rgba(51,112,255,0.3)' }}>开启</button>
      </div>
    </div>
  )
}
