import React, { useState } from 'react'
import { TabBar, C, PanelKey } from './shared'

type Props = { onClose: () => void; onSwitchPanel?: (p: PanelKey) => void; onConfirmConfig?: () => void }

type Coupon = {
  id: string
  name: string
  type: string
  value: string
  threshold: string
  loopCount: number
  interval: number
  status: 'idle' | 'sending' | 'done'
}

const PRODUCTS = [
  { id: 'p1', label: '目视伦负离子光波时尚眼镜', price: '¥138.00', stock: '18.6万', sold: 0, exposure: '0%', img: '🎧' },
  { id: 'p2', label: '超好看米色短外套女小个子春季新款', price: '¥78.00', stock: '99万+', sold: 0, exposure: '0%', img: '🧥' },
  { id: 'p3', label: '张紫一春夏莫代尔舒适休闲两件套', price: '¥138.00', stock: '99万+', sold: 0, exposure: '0%', img: '👗' },
  { id: 'p4', label: '2025新款立领上衣情侣款男女同款', price: '¥27.90', stock: '1.63万', sold: 0, exposure: '0%', img: '🧥' },
]

export default function CouponPanel({ onClose, onSwitchPanel, onConfirmConfig }: Props) {
  const [coupons, setCoupons] = useState<Coupon[]>([
    // 模拟：默认无券，需从营销中心获取
  ])
  const [activeTab, setActiveTab] = useState<'influencer' | 'product'>('influencer')

  const refreshCoupons = () => {
    // 模拟：从营销中心刷新获取券列表
    setCoupons([
      { id: 'c1', name: '满100减10', type: '达人券', value: '10元', threshold: '满100', loopCount: 3, interval: 60, status: 'idle' },
      { id: 'c2', name: '满200减30', type: '达人券', value: '30元', threshold: '满200', loopCount: 5, interval: 120, status: 'idle' },
    ])
  }

  const updateCoupon = (id: string, field: string, value: any) => {
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c))
  }

  const cancelAll = () => {
    setCoupons(prev => prev.map(c => ({ ...c, status: 'idle' as const })))
  }

  const statusLabel = (status: Coupon['status']) => {
    switch (status) {
      case 'sending': return <span style={{ color: C.blue, fontSize: 11 }}>● 发送中</span>
      case 'done': return <span style={{ color: C.green, fontSize: 11 }}>● 已完成</span>
      default: return <span style={{ color: C.textTert, fontSize: 11 }}>○ 待发送</span>
    }
  }

  return (
    <div style={{
      position: 'absolute', top: 36, right: 0, bottom: 0, width: 520,
      zIndex: 102, overflow: 'hidden', borderRadius: '8px 0 0 0',
      boxShadow: '-2px 0 16px rgba(0,0,0,0.15)', fontFamily: C.font,
      display: 'flex', flexDirection: 'column', background: C.bg,
    }}>
      <div style={{ padding: '10px 16px', background: C.card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: C.text }}>🎟 发优惠券</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 18, color: C.textSec, cursor: 'pointer', padding: 4 }}>✕</button>
      </div>
      {onSwitchPanel && <TabBar active="coupons" onSwitch={onSwitchPanel} />}

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>
        {/* ===== 达人券 表格区 ===== */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              fontSize: 14, fontWeight: 600, color: C.blue,
              borderBottom: `2px solid ${C.blue}`, paddingBottom: 2,
            }}>达人券</span>
            <span style={{ fontSize: 11, color: C.textTert }}>共{coupons.length}条记录</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={refreshCoupons} style={{
              padding: '4px 10px', borderRadius: 4, border: `1px solid ${C.border}`,
              background: C.card, color: C.blue, fontSize: 11, cursor: 'pointer', fontFamily: C.font,
            }}>🔄 刷新</button>
            <button onClick={cancelAll} style={{
              padding: '4px 10px', borderRadius: 4, border: `1px solid ${C.border}`,
              background: C.card, color: C.textSec, fontSize: 11, cursor: 'pointer', fontFamily: C.font,
            }}>✕ 全部取消</button>
          </div>
        </div>

        {/* 表头 */}
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 0.8fr 0.8fr',
          padding: '8px 12px', background: '#F7F8FA', borderRadius: '8px 8px 0 0',
          border: `1px solid ${C.border}`, borderBottom: 'none',
          fontSize: 11, color: C.textSec, fontWeight: 500,
        }}>
          <span>优惠券信息</span>
          <span>循环弹券次数</span>
          <span>间隔时间(秒)</span>
          <span>发券状态</span>
          <span>操作</span>
        </div>

        {/* 表体 */}
        {coupons.length === 0 ? (
          <div style={{
            padding: '24px', textAlign: 'center',
            border: `1px solid ${C.border}`, borderTop: 'none', borderRadius: '0 0 8px 8px',
            background: C.card,
          }}>
            <div style={{ fontSize: 12, color: C.textTert, marginBottom: 6 }}>无达人券记录</div>
            <a href="https://buyin.jinritemai.com/dashboard/coupon" target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 12, color: C.blue, textDecoration: 'none', cursor: 'pointer' }}>
              前往达人券管理 →
            </a>
          </div>
        ) : (
          coupons.map(coupon => (
            <div key={coupon.id} style={{
              display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 0.8fr 0.8fr',
              padding: '10px 12px', background: C.card,
              border: `1px solid ${C.border}`, borderTop: 'none',
              alignItems: 'center', fontSize: 12,
            }}>
              {/* 优惠券信息 */}
              <div>
                <div style={{ fontWeight: 600, color: C.text }}>{coupon.name}</div>
                <div style={{ fontSize: 10, color: C.textTert, marginTop: 2 }}>{coupon.type} · {coupon.value} · {coupon.threshold}</div>
              </div>
              {/* 循环弹券次数 */}
              <input type="number" value={coupon.loopCount} min={1}
                onChange={e => updateCoupon(coupon.id, 'loopCount', Math.max(1, parseInt(e.target.value) || 1))}
                style={{
                  width: 48, height: 26, padding: '0 4px', borderRadius: 4,
                  border: `1px solid ${C.border}`, fontSize: 12, textAlign: 'center',
                  outline: 'none', fontFamily: C.font,
                }} />
              {/* 间隔时间 */}
              <input type="number" value={coupon.interval} min={5}
                onChange={e => updateCoupon(coupon.id, 'interval', Math.max(5, parseInt(e.target.value) || 5))}
                style={{
                  width: 48, height: 26, padding: '0 4px', borderRadius: 4,
                  border: `1px solid ${C.border}`, fontSize: 12, textAlign: 'center',
                  outline: 'none', fontFamily: C.font,
                }} />
              {/* 发券状态 */}
              {statusLabel(coupon.status)}
              {/* 操作 */}
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => updateCoupon(coupon.id, 'status', coupon.status === 'sending' ? 'idle' : 'sending')} style={{
                  padding: '2px 8px', borderRadius: 4,
                  border: `1px solid ${C.border}`,
                  background: coupon.status === 'sending' ? '#FFF0E6' : C.card,
                  color: coupon.status === 'sending' ? '#FF7D00' : C.blue,
                  fontSize: 10, cursor: 'pointer', fontFamily: C.font,
                }}>{coupon.status === 'sending' ? '停止' : '发送'}</button>
              </div>
            </div>
          ))
        )}

        {/* 未启用时的提示 */}
        {coupons.length > 0 && (
          <div style={{
            marginTop: 8, padding: '6px 10px', borderRadius: 6,
            background: '#FFF7E6', border: '1px solid #FFE58F',
            fontSize: 10, color: '#B8860B', lineHeight: 1.6,
          }}>
            ⚠️ 须先在抖音营销中心创建优惠券，点击「刷新」获取最新券列表。
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
        <button onClick={onConfirmConfig} style={{ flex: 2, height: 42, borderRadius: 8, background: C.blue, border: 'none', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: C.font, boxShadow: '0 2px 8px rgba(51,112,255,0.3)' }}>确认配置</button>
      </div>
    </div>
  )
}
