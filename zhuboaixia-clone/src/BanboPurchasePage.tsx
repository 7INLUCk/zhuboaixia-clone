import React, { useState } from 'react'
import { tokens } from './tokens'

const T = tokens
const C = T.colors

const UNIT_PRICE = 158
const BULK_PRICE = 88
const BULK_MIN = 20

export default function BanboPurchasePage({ onBack, hideHeader }: { onBack?: () => void; hideHeader?: boolean }) {
  const [qty, setQty] = useState(1)

  const isBulk = qty >= BULK_MIN
  const unitPrice = isBulk ? BULK_PRICE : UNIT_PRICE
  const total = qty * unitPrice
  const saving = isBulk ? qty * (UNIT_PRICE - BULK_PRICE) : 0

  function changeQty(delta: number) {
    setQty(q => Math.max(1, q + delta))
  }

  function setQtyStr(val: string) {
    const n = parseInt(val, 10)
    if (!isNaN(n) && n >= 1) setQty(n)
  }

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: '#fff', fontFamily: T.fonts.family,
    }}>
      {/* 顶栏：只保留返回 */}
      {!hideHeader && (
        <div style={{
          padding: '0 24px', height: 48,
          display: 'flex', alignItems: 'center',
          borderBottom: `1px solid ${C.border}`,
          flexShrink: 0,
        }}>
          {onBack && (
            <button onClick={onBack} style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: C.textSecondary, fontSize: 13, padding: 0,
            }}>
              <span style={{ fontSize: 16 }}>←</span>
              返回
            </button>
          )}
        </div>
      )}

      {/* 内容区 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '36px 24px 48px' }}>
        <div style={{ maxWidth: 520, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>

          {/* 页面标题 */}
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.textPrimary, marginBottom: 6 }}>
              增购伴播形象次数
            </div>
            <div style={{ fontSize: 13, color: C.textSecondary }}>
              购买后次数即时到账，有效期 1 年
            </div>
          </div>

          {/* 两个定价卡 */}
          <div style={{ display: 'flex', gap: 14 }}>
            {/* 灵活购 */}
            <div
              onClick={() => { if (isBulk) setQty(1) }}
              style={{
                flex: 1, borderRadius: 14, padding: '22px 20px',
                background: !isBulk ? '#F5F4FF' : '#FAFAFA',
                border: `2px solid ${!isBulk ? C.primary : '#E5E6EB'}`,
                cursor: isBulk ? 'pointer' : 'default',
                transition: 'border-color 0.15s, background 0.15s',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary, marginBottom: 12 }}>
                灵活购
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginBottom: 14 }}>
                <span style={{ fontSize: 30, fontWeight: 700, color: C.textPrimary }}>¥{UNIT_PRICE}</span>
                <span style={{ fontSize: 12, color: C.textSecondary }}> / 次</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <span style={{ fontSize: 12, color: C.textSecondary }}>随买随用，无数量限制</span>
                <span style={{ fontSize: 12, color: C.textSecondary }}>有效期 1 年</span>
              </div>
            </div>

            {/* 超值包 */}
            <div
              onClick={() => { if (!isBulk) setQty(BULK_MIN) }}
              style={{
                flex: 1, borderRadius: 14, padding: '22px 20px',
                background: isBulk ? '#F5F4FF' : '#FAFAFA',
                border: `2px solid ${isBulk ? C.primary : '#E5E6EB'}`,
                cursor: !isBulk ? 'pointer' : 'default',
                transition: 'border-color 0.15s, background 0.15s',
                position: 'relative', overflow: 'hidden',
              }}
            >
              {/* 推荐角标 */}
              <div style={{
                position: 'absolute', top: 12, right: 14,
                background: '#F43F5E', color: '#fff',
                fontSize: 10, fontWeight: 600,
                padding: '2px 8px', borderRadius: 10,
              }}>省 {Math.round((1 - BULK_PRICE / UNIT_PRICE) * 100)}%</div>

              <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary, marginBottom: 12 }}>
                超值包
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginBottom: 14 }}>
                <span style={{ fontSize: 30, fontWeight: 700, color: C.textPrimary }}>¥{BULK_PRICE}</span>
                <span style={{ fontSize: 12, color: C.textSecondary }}> / 次</span>
                <span style={{ fontSize: 11, color: C.textTertiary, textDecoration: 'line-through', marginLeft: 4 }}>
                  ¥{UNIT_PRICE}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <span style={{ fontSize: 12, color: C.textSecondary }}>{BULK_MIN} 次起购</span>
                <span style={{ fontSize: 12, color: C.textSecondary }}>有效期 1 年</span>
              </div>
            </div>
          </div>

          {/* 数量 + 结算 */}
          <div style={{
            borderRadius: 14, border: `1px solid ${C.border}`,
            overflow: 'hidden',
          }}>
            {/* 数量行 */}
            <div style={{
              padding: '18px 20px',
              display: 'flex', alignItems: 'center', gap: 12,
              borderBottom: `1px solid ${C.border}`,
            }}>
              <span style={{ fontSize: 13, color: C.textSecondary, marginRight: 4 }}>购买数量</span>
              <button
                onClick={() => changeQty(-1)}
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  border: `1px solid ${C.border}`, background: '#fff',
                  fontSize: 16, cursor: 'pointer', color: C.textPrimary,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}
              >−</button>
              <input
                type="number" min={1} value={qty}
                onChange={e => setQtyStr(e.target.value)}
                style={{
                  width: 60, height: 32, borderRadius: 8,
                  border: `1px solid ${C.border}`,
                  textAlign: 'center', fontSize: 15, fontWeight: 600,
                  color: C.textPrimary, fontFamily: T.fonts.family, outline: 'none',
                }}
                onFocus={e => (e.target.style.borderColor = C.primary)}
                onBlur={e => (e.target.style.borderColor = C.border)}
              />
              <button
                onClick={() => changeQty(1)}
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  border: `1px solid ${C.border}`, background: '#fff',
                  fontSize: 16, cursor: 'pointer', color: C.textPrimary,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}
              >+</button>
              <span style={{ fontSize: 12, color: C.textTertiary }}>次</span>
              {/* 提示切换到超值包 */}
              {!isBulk && (
                <span
                  onClick={() => setQty(BULK_MIN)}
                  style={{ fontSize: 12, color: C.primary, cursor: 'pointer', marginLeft: 'auto' }}
                >
                  买 {BULK_MIN} 次享超值包价 →
                </span>
              )}
              {isBulk && (
                <span style={{ fontSize: 12, color: '#16A34A', marginLeft: 'auto' }}>
                  已享超值包价 ✓
                </span>
              )}
            </div>

            {/* 结算行 */}
            <div style={{ padding: '18px 20px', background: '#FAFAFA' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ fontSize: 13, color: C.textSecondary }}>
                  {qty} 次 × ¥{unitPrice}
                  {isBulk && (
                    <span style={{ marginLeft: 8, fontSize: 11, color: '#16A34A' }}>
                      省 ¥{saving}
                    </span>
                  )}
                </span>
                <span style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary }}>
                  ¥{total}
                </span>
              </div>
              <button
                onClick={() => alert('跳转支付（演示）')}
                style={{
                  width: '100%', height: 44, borderRadius: 10, border: 'none',
                  background: C.primary, color: '#fff',
                  fontSize: 15, fontWeight: 600, cursor: 'pointer',
                  fontFamily: T.fonts.family,
                }}
              >
                立即购买
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
