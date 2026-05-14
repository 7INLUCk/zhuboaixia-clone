import React, { useState } from 'react'
import { tokens } from './tokens'

const T = tokens
const C = T.colors

const TIERS = [
  { key: 'starter', label: '随心购', minQty: 1,   maxQty: 49,       price: 200, discount: '5折' },
  { key: 'growth',  label: '超值包', minQty: 50,  maxQty: 99,       price: 160, discount: '4折', recommended: true },
  { key: 'scale',   label: '大促包', minQty: 100, maxQty: Infinity, price: 120, discount: '3折' },
]
const FULL_PRICE = 400

function getActiveTier(qty: number) {
  let result = TIERS[0]
  for (const t of TIERS) { if (qty >= t.minQty) result = t }
  return result
}

export default function BanboPurchasePage({ onBack, hideHeader }: { onBack?: () => void; hideHeader?: boolean }) {
  const [qty, setQty] = useState(1)

  const tier = getActiveTier(qty)
  const total = qty * tier.price
  const saved = qty * (FULL_PRICE - tier.price)

  // 下一档升级提示
  const nextTier = TIERS[TIERS.indexOf(tier) + 1]
  const toNext = nextTier ? nextTier.minQty - qty : 0

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

      <div style={{ flex: 1, overflowY: 'auto', padding: '36px 24px 48px' }}>
        <div style={{ maxWidth: 520, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* 标题 */}
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.textPrimary, marginBottom: 6 }}>
              增购童装伴播形象次数
            </div>
            <div style={{ fontSize: 13, color: C.textSecondary, marginBottom: 10 }}>
              购买后次数即时到账，有效期 1 年
            </div>
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 7,
              padding: '9px 12px', borderRadius: 8,
              background: '#FFF7E6', borderLeft: '3px solid #F59E0B',
            }}>
              <span style={{ fontSize: 13, color: '#B45309', lineHeight: 1 }}>ⓘ</span>
              <span style={{ fontSize: 12, color: '#92400E', lineHeight: '18px' }}>
                本次数仅适用于童装品类伴播形象，不可用于其他品类
              </span>
            </div>
          </div>

          {/* 三档阶梯卡片 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {TIERS.map(t => {
              const isActive = tier.key === t.key
              return (
                <div
                  key={t.key}
                  onClick={() => setQty(t.minQty)}
                  style={{
                    borderRadius: 12, padding: '14px 18px',
                    background: isActive ? '#F5F4FF' : '#FAFAFA',
                    border: `2px solid ${isActive ? C.primary : '#E5E6EB'}`,
                    cursor: isActive ? 'default' : 'pointer',
                    transition: 'border-color 0.15s, background 0.15s',
                    display: 'flex', alignItems: 'center',
                    position: 'relative',
                  }}
                >
                  {/* 推荐角标 */}
                  {t.recommended && (
                    <div style={{
                      position: 'absolute', top: -1, right: 14,
                      background: '#F43F5E', color: '#fff',
                      fontSize: 10, fontWeight: 600,
                      padding: '2px 9px',
                      borderRadius: '0 0 7px 7px',
                    }}>推荐</div>
                  )}

                  {/* 左：档位名 + 数量范围 */}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 14, fontWeight: 600,
                      color: isActive ? C.primary : C.textPrimary,
                      marginBottom: 3,
                    }}>
                      {t.label}
                    </div>
                    <div style={{ fontSize: 12, color: C.textTertiary }}>
                      {t.maxQty === Infinity ? `${t.minQty} 次及以上` : `${t.minQty}–${t.maxQty} 次`}
                    </div>
                  </div>

                  {/* 右：价格 + 折扣 */}
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{
                      fontSize: 24, fontWeight: 700,
                      color: isActive ? C.primary : C.textPrimary,
                    }}>¥{t.price}</span>
                    <span style={{ fontSize: 12, color: C.textSecondary }}>/次</span>
                    <span style={{
                      marginLeft: 6,
                      background: isActive ? C.primary : '#E5E6EB',
                      color: isActive ? '#fff' : C.textSecondary,
                      fontSize: 11, fontWeight: 600,
                      padding: '2px 7px', borderRadius: 6,
                      transition: 'background 0.15s, color 0.15s',
                    }}>{t.discount}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* 数量 + 结算 */}
          <div style={{
            borderRadius: 14, border: `1px solid ${C.border}`,
            overflow: 'hidden',
          }}>
            {/* 数量行 */}
            <div style={{
              padding: '16px 20px',
              display: 'flex', alignItems: 'center', gap: 12,
              borderBottom: `1px solid ${C.border}`,
            }}>
              <span style={{ fontSize: 13, color: C.textSecondary, marginRight: 4, flexShrink: 0 }}>购买数量</span>
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
              {/* 升档提示 */}
              {nextTier && toNext <= 10 && (
                <span
                  onClick={() => setQty(nextTier.minQty)}
                  style={{ fontSize: 12, color: C.primary, cursor: 'pointer', marginLeft: 'auto', flexShrink: 0 }}
                >
                  再加 {toNext} 次享{nextTier.discount} →
                </span>
              )}
              {!nextTier && (
                <span style={{ fontSize: 12, color: '#16A34A', marginLeft: 'auto', flexShrink: 0 }}>
                  已享最低折扣 ✓
                </span>
              )}
            </div>

            {/* 结算行 */}
            <div style={{ padding: '18px 20px', background: '#FAFAFA' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span style={{ fontSize: 13, color: C.textSecondary }}>
                    {qty} 次 × ¥{tier.price}（{tier.discount}）
                  </span>
                  <span style={{ fontSize: 11, color: '#16A34A' }}>
                    已省 ¥{saved}
                  </span>
                </div>
                <span style={{ fontSize: 24, fontWeight: 700, color: C.textPrimary }}>
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
