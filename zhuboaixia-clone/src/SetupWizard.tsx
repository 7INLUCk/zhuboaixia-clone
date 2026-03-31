import React, { useState } from 'react'

const C = {
  primary: '#5850EC',
  primaryHover: '#6B5CE7',
  green: '#00B42A',
  greenHover: '#00A328',
  red: '#F53F3F',
  orange: '#FF7D00',
  purple: '#722ED1',
  purpleBg: '#F5EEFF',
  purpleBorder: '#D3ADF7',
  blueBg: '#E8F3FF',
  blueBorder: '#69B1FF',
  border: '#E5E6EB',
  bg: '#F7F8FA',
  white: '#FFFFFF',
  textPrimary: '#1D2129',
  textSecondary: '#86909C',
  textTertiary: '#C9CDD4',
  sidebarBg: '#F8F9FB',
  font: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif',
}

// ====== 数据 ======
const PLATFORMS = [
  { id: 'bytedance', name: '巨量百应', desc: '抖音电商一站式平台，支持商品管理、直播场控', icon: '🎵' },
  { id: 'douyin-local', name: '抖音本地生活', desc: '本地商家直播带货，支持团购、门店导流', icon: '📍' },
]

const PRODUCTS = [
  { id: 'p1', name: '有机冷榨椰子油500ml', price: 68, sales: 12800, cat: '食品' },
  { id: 'p2', name: '玻尿酸补水面膜10片装', price: 39.9, sales: 56000, cat: '美妆' },
  { id: 'p3', name: '纯棉宽松T恤男款', price: 89, sales: 8900, cat: '服饰' },
  { id: 'p4', name: '北欧ins风台灯卧室', price: 128, sales: 3200, cat: '家居' },
  { id: 'p5', name: '无线蓝牙耳机降噪款', price: 199, sales: 23400, cat: '数码' },
  { id: 'p6', name: '坚果礼盒年货装1.2kg', price: 99, sales: 18900, cat: '食品' },
  { id: 'p7', name: '氨基酸洁面乳温和型', price: 49.9, sales: 34500, cat: '美妆' },
  { id: 'p8', name: '夏季冰丝阔腿裤女', price: 79, sales: 15600, cat: '服饰' },
  { id: 'p9', name: '智能空气加湿器静音', price: 159, sales: 7800, cat: '家居' },
]

const AVATARS = [
  { id: 'a1', name: '暖暖', desc: '温柔亲和型 · 适合美妆食品', emoji: '🌸', color: '#FFB3D9', type: 'public', recommendedVoiceId: 'v1' },
  { id: 'a2', name: '闪闪', desc: '活力元气型 · 适合服饰潮牌', emoji: '⚡', color: '#FFD591', type: 'public', recommendedVoiceId: 'v2' },
  { id: 'a3', name: '专业帝', desc: '专业严谨型 · 适合数码家电', emoji: '🎯', color: '#B3D4FF', type: 'public', recommendedVoiceId: 'v3' },
  { id: 'a4', name: '我的定制形象', desc: '已训练 · 专属形象', emoji: '✨', color: '#E8D5FF', type: 'custom', recommendedVoiceId: 'v5' },
]

const VOICES = [
  { id: 'v1', name: '温柔女声', gender: 'female', type: 'public', tag: '推荐 · 美妆食品', desc: '温柔亲和' },
  { id: 'v2', name: '活力男声', gender: 'male', type: 'public', tag: '推荐 · 服饰运动', desc: '活力四射' },
  { id: 'v3', name: '知性女声', gender: 'female', type: 'public', tag: '推荐 · 数码家电', desc: '专业严谨' },
  { id: 'v4', name: '甜美女声', gender: 'female', type: 'public', tag: '通用 · 全品类', desc: '甜美热情' },
  { id: 'v5', name: '我的定制声线', gender: 'female', type: 'custom', tag: '专属 · 已训练', desc: '个性定制' },
  { id: 'v6', name: '磁性男声', gender: 'male', type: 'public', tag: '通用 · 全品类', desc: '沉稳磁性' },
]

// ====== 按钮组件 ======
function PrimaryButton({ children, onClick, disabled, bg, hoverBg, style }: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean
  bg?: string; hoverBg?: string; style?: React.CSSProperties
}) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '9px 28px',
        borderRadius: 6,
        border: 'none',
        background: disabled ? '#C9CDD4' : (hov ? (hoverBg || C.primaryHover) : (bg || C.primary)),
        color: '#fff',
        fontSize: 14,
        fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: C.font,
        transition: 'background 0.2s',
        ...style,
      }}
    >
      {children}
    </button>
  )
}

function SecondaryButton({ children, onClick, style }: {
  children: React.ReactNode; onClick?: () => void; style?: React.CSSProperties
}) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '9px 20px',
        borderRadius: 6,
        border: `1px solid ${C.border}`,
        background: hov ? '#F2F3F5' : '#fff',
        color: C.textSecondary,
        fontSize: 14,
        fontWeight: 500,
        cursor: 'pointer',
        fontFamily: C.font,
        transition: 'all 0.2s',
        ...style,
      }}
    >
      {children}
    </button>
  )
}

// ====== 开关组件 ======
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        width: 40, height: 22, borderRadius: 11, cursor: 'pointer',
        background: checked ? C.primary : '#C9CDD4',
        padding: 2, transition: 'background 0.2s',
        display: 'flex', alignItems: checked ? 'center' : 'center',
        justifyContent: checked ? 'flex-end' : 'flex-start',
      }}
    >
      <div style={{
        width: 18, height: 18, borderRadius: '50%', background: '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
      }} />
    </div>
  )
}

// ====== 步骤1：创建直播间 ======
function Step1({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  const [selectedPlatform, setSelectedPlatform] = useState('')
  const [loginStatus, setLoginStatus] = useState<'idle' | 'loading' | 'logged'>('idle')
  const [roomName, setRoomName] = useState('')
  const [category, setCategory] = useState('')

  const handleLogin = () => {
    setLoginStatus('loading')
    setTimeout(() => setLoginStatus('logged'), 1500)
  }

  const selected = PLATFORMS.find(p => p.id === selectedPlatform)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 上半部分：平台选择 + 登录 */}
      <div style={{ display: 'flex', flex: 1, gap: 20, padding: '0 24px', overflow: 'auto' }}>
        {/* 左侧：平台网格 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary, marginBottom: 10, marginTop: 20 }}>
            选择直播平台
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12,
          }}>
            {PLATFORMS.map(p => {
              const isActive = selectedPlatform === p.id
              return (
                <div
                  key={p.id}
                  onClick={() => { setSelectedPlatform(p.id); setLoginStatus('idle') }}
                  style={{
                    padding: '18px 16px',
                    borderRadius: 8,
                    border: `2px solid ${isActive ? C.primary : C.border}`,
                    background: isActive ? '#EEF0FF' : '#fff',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.borderColor = '#B8BAE0'
                  }}
                  onMouseLeave={e => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.borderColor = C.border
                  }}
                >
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{p.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, marginBottom: 2 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: C.textSecondary }}>{p.desc}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 右侧：账号登录 */}
        <div style={{ width: 280, flexShrink: 0, marginTop: 20 }}>
          <div style={{
            border: `1px solid ${C.border}`, borderRadius: 8, padding: 20,
            background: '#fff', minHeight: 200,
          }}>
            {selected ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <span style={{ fontSize: 28 }}>{selected.icon}</span>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: C.textPrimary }}>{selected.name}</div>
                    <div style={{ fontSize: 12, color: C.textSecondary }}>账号授权</div>
                  </div>
                </div>
                {loginStatus === 'idle' && (
                  <PrimaryButton onClick={handleLogin} style={{ width: '100%' }}>
                    🔗 授权登录
                  </PrimaryButton>
                )}
                {loginStatus === 'loading' && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0',
                    justifyContent: 'center',
                  }}>
                    <div style={{
                      width: 16, height: 16, border: '2px solid #E5E6EB',
                      borderTopColor: C.primary, borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }} />
                    <span style={{ fontSize: 13, color: C.primary }}>登录中...</span>
                  </div>
                )}
                {loginStatus === 'logged' && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px', borderRadius: 8,
                    background: '#F0FFF4', border: '1px solid #B7EB8F',
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: '#E8F5E9', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: 18,
                    }}>👤</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: C.textPrimary }}>直播达人小王</div>
                      <div style={{ fontSize: 11, color: C.green }}>✅ 已连接</div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div style={{
                textAlign: 'center', padding: '40px 0',
                color: C.textTertiary, fontSize: 13,
              }}>
                ← 请先选择直播平台
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 底部：直播间信息 + 操作按钮 */}
      <div style={{ padding: '12px 24px 16px', borderTop: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: C.textSecondary, marginBottom: 4 }}>直播间名称</div>
            <input
              value={roomName}
              onChange={e => setRoomName(e.target.value)}
              placeholder="输入直播间名称"
              style={{
                width: '100%', padding: '8px 12px', borderRadius: 6,
                border: `1px solid ${C.border}`, fontSize: 13,
                outline: 'none', fontFamily: C.font, boxSizing: 'border-box',
              }}
              onFocus={e => (e.target as HTMLElement).style.borderColor = C.primary}
              onBlur={e => (e.target as HTMLElement).style.borderColor = C.border}
            />
          </div>
          <div style={{ width: 200 }}>
            <div style={{ fontSize: 12, color: C.textSecondary, marginBottom: 4 }}>直播分类</div>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              style={{
                width: '100%', padding: '8px 12px', borderRadius: 6,
                border: `1px solid ${C.border}`, fontSize: 13,
                outline: 'none', fontFamily: C.font, background: '#fff',
                cursor: 'pointer', boxSizing: 'border-box',
              }}
            >
              <option value="">选择分类</option>
              <option value="food">食品</option>
              <option value="beauty">美妆</option>
              <option value="fashion">服饰</option>
              <option value="home">家居</option>
              <option value="digital">数码</option>
              <option value="general">综合</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span
            onClick={onSkip}
            style={{ fontSize: 13, color: C.textSecondary, cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = C.primary}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = C.textSecondary}
          >
            跳过此步 →
          </span>
          <PrimaryButton onClick={onNext}>下一步</PrimaryButton>
        </div>
      </div>
    </div>
  )
}

// ====== 步骤2：导入商品 ======
function Step2({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('全部')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const cats = ['全部', '食品', '美妆', '服饰', '家居', '数码']
  const filtered = PRODUCTS.filter(p => {
    if (filterCat !== '全部' && p.cat !== filterCat) return false
    if (search && !p.name.includes(search)) return false
    return true
  })
  const selectedProducts = PRODUCTS.filter(p => selectedIds.has(p.id))
  const total = selectedProducts.reduce((s, p) => s + p.price, 0)

  const toggleProduct = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id); else next.add(id)
    setSelectedIds(next)
  }

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      {/* 左侧：商品列表 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* 搜索 + 筛选 */}
        <div style={{ padding: '14px 20px 10px', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="🔍 搜索商品..."
              style={{
                flex: 1, padding: '8px 14px', borderRadius: 6,
                border: `1px solid ${C.border}`, fontSize: 13,
                outline: 'none', fontFamily: C.font,
              }}
              onFocus={e => (e.target as HTMLElement).style.borderColor = C.primary}
              onBlur={e => (e.target as HTMLElement).style.borderColor = C.border}
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {cats.map(c => {
              const isActive = filterCat === c
              return (
                <button
                  key={c}
                  onClick={() => setFilterCat(c)}
                  style={{
                    padding: '4px 14px', borderRadius: 14,
                    border: `1px solid ${isActive ? C.primary : C.border}`,
                    background: isActive ? C.primary : '#fff',
                    color: isActive ? '#fff' : C.textSecondary,
                    fontSize: 12, cursor: 'pointer', fontFamily: C.font,
                    fontWeight: isActive ? 600 : 400,
                    transition: 'all 0.15s',
                  }}
                >
                  {c}
                </button>
              )
            })}
          </div>
        </div>

        {/* 商品网格 */}
        <div style={{ flex: 1, overflow: 'auto', padding: '0 20px 16px' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 10,
          }}>
            {filtered.map(p => {
              const isSelected = selectedIds.has(p.id)
              return (
                <div
                  key={p.id}
                  onClick={() => toggleProduct(p.id)}
                  style={{
                    border: `1px solid ${isSelected ? C.green : C.border}`,
                    borderRadius: 8, background: '#fff',
                    cursor: 'pointer', overflow: 'hidden',
                    transition: 'all 0.15s', position: 'relative',
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) (e.currentTarget as HTMLElement).style.borderColor = '#B8BAE0'
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) (e.currentTarget as HTMLElement).style.borderColor = C.border
                  }}
                >
                  {/* 勾选框 */}
                  <div style={{
                    position: 'absolute', top: 8, left: 8, zIndex: 2,
                    width: 20, height: 20, borderRadius: 4,
                    border: `2px solid ${isSelected ? C.green : '#D9D9D9'}`,
                    background: isSelected ? C.green : '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 12, fontWeight: 700,
                  }}>
                    {isSelected && '✓'}
                  </div>
                  {/* 已选标记 */}
                  {isSelected && (
                    <div style={{
                      position: 'absolute', bottom: 8, right: 8,
                      width: 24, height: 24, borderRadius: '50%',
                      background: C.green, color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, fontWeight: 700, zIndex: 2,
                    }}>✓</div>
                  )}
                  {/* 商品图占位 */}
                  <div style={{
                    height: 110, background: '#F7F8FA',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 36,
                  }}>📦</div>
                  {/* 信息 */}
                  <div style={{ padding: '8px 10px 10px' }}>
                    <div style={{
                      fontSize: 13, fontWeight: 500, color: C.textPrimary,
                      marginBottom: 4, lineHeight: '18px',
                      overflow: 'hidden', textOverflow: 'ellipsis',
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical' as any,
                    }}>{p.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: C.red }}>¥{p.price}</span>
                      <span style={{ fontSize: 11, color: C.textTertiary }}>已售{(p.sales / 10000).toFixed(1)}w</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 右侧边栏：已选商品 */}
      <div style={{
        width: 280, flexShrink: 0, borderLeft: `1px solid ${C.border}`,
        background: C.sidebarBg, display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}` }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary }}>已选商品</span>
          <span style={{
            marginLeft: 8, fontSize: 11, background: C.primary, color: '#fff',
            padding: '1px 8px', borderRadius: 10, fontWeight: 600,
          }}>{selectedIds.size}</span>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '8px 0' }}>
          {selectedProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: C.textTertiary, fontSize: 13 }}>
              点击商品添加到选品
            </div>
          ) : selectedProducts.map(p => (
            <div key={p.id} style={{
              display: 'flex', alignItems: 'center', padding: '8px 16px', gap: 8,
              borderBottom: `1px solid ${C.border}`,
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 12, color: C.textPrimary, overflow: 'hidden',
                  textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{p.name}</div>
                <div style={{ fontSize: 12, color: C.red, fontWeight: 600 }}>¥{p.price}</div>
              </div>
              <span
                onClick={(e) => { e.stopPropagation(); toggleProduct(p.id) }}
                style={{ cursor: 'pointer', color: C.textTertiary, fontSize: 16, padding: '0 4px' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = C.red}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = C.textTertiary}
              >✕</span>
            </div>
          ))}
        </div>
        <div style={{
          padding: '12px 16px', borderTop: `1px solid ${C.border}`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: C.textSecondary }}>合计金额</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: C.red }}>¥{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* 底部按钮栏 */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '12px 24px', borderTop: `1px solid ${C.border}`,
        background: '#fff', display: 'flex', justifyContent: 'space-between', zIndex: 5,
      }}>
        <SecondaryButton onClick={onPrev}>← 上一步</SecondaryButton>
        <PrimaryButton onClick={onNext}>下一步</PrimaryButton>
      </div>
    </div>
  )
}

// ====== 步骤3：选择伴播形象 + 声音 ======
function Step3({ onComplete, onPrev }: { onComplete: () => void; onPrev: () => void }) {
  const [avatar, setAvatar] = useState('')
  const [voice, setVoice] = useState('')
  const [speed, setSpeed] = useState(50)
  const [volume, setVolume] = useState(70)
  const [autoStart, setAutoStart] = useState(true)
  const [aiChat, setAiChat] = useState(true)
  const [voiceFilter, setVoiceFilter] = useState<'all' | 'male' | 'female'>('all')
  // 手动选择标记：用户手动改过音色后不再自动联动
  const [manualVoice, setManualVoice] = useState(false)

  const handleAvatarSelect = (av: typeof AVATARS[0]) => {
    setAvatar(av.id)
    if (!manualVoice) {
      setVoice(av.recommendedVoiceId)
    }
  }

  const handleVoiceSelect = (vId: string) => {
    setVoice(vId)
    setManualVoice(true)
  }

  const filteredVoices = VOICES.filter(v => voiceFilter === 'all' || v.gender === voiceFilter)

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      {/* 左侧：形象选择 (60%) */}
      <div style={{ flex: 3, padding: '20px 20px 16px', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>
            选择伴播形象
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <span style={{
              fontSize: 11, padding: '2px 8px', borderRadius: 4,
              background: '#EEF0FF', color: C.primary,
            }}>公共</span>
            <span style={{
              fontSize: 11, padding: '2px 8px', borderRadius: 4,
              background: '#FFF3E0', color: '#E65100',
            }}>定制</span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {AVATARS.map(a => {
            const isActive = avatar === a.id
            const isCustom = a.type === 'custom'
            const recVoice = VOICES.find(v => v.id === a.recommendedVoiceId)
            return (
              <div
                key={a.id}
                onClick={() => handleAvatarSelect(a)}
                style={{
                  padding: '20px 16px', borderRadius: 10, position: 'relative',
                  border: `2px solid ${isActive ? C.purpleBorder : C.border}`,
                  background: isActive ? C.purpleBg : '#fff',
                  cursor: 'pointer', textAlign: 'center',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.borderColor = '#D3ADF7'
                }}
                onMouseLeave={e => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.borderColor = C.border
                }}
              >
                {/* 公共/定制标签 */}
                <span style={{
                  position: 'absolute', top: 8, right: 8,
                  fontSize: 10, padding: '1px 6px', borderRadius: 3,
                  background: isCustom ? '#FFF3E0' : '#EEF0FF',
                  color: isCustom ? '#E65100' : C.primary,
                  fontWeight: 500,
                }}>
                  {isCustom ? '定制' : '公共'}
                </span>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: a.color, margin: '0 auto 10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 32, boxShadow: isActive ? '0 0 0 3px #D3ADF7' : 'none',
                }}>{a.emoji}</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: C.textPrimary, marginBottom: 4 }}>
                  {a.name}
                </div>
                <div style={{ fontSize: 12, color: C.textSecondary, marginBottom: 6 }}>{a.desc}</div>
                {/* 推荐音色提示 */}
                {recVoice && (
                  <div style={{
                    fontSize: 11, color: C.purple, marginTop: 4,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                  }}>
                    🔊 推荐音色：{recVoice.name}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 右侧：声音选择 (40%) */}
      <div style={{
        flex: 2, borderLeft: `1px solid ${C.border}`,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{ padding: '20px 16px 10px', flexShrink: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary, marginBottom: 10 }}>
            选择声音
          </div>
          {/* 性别筛选标签 */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            {([
              { key: 'all' as const, label: '全部' },
              { key: 'female' as const, label: '👩 女声' },
              { key: 'male' as const, label: '👨 男声' },
            ]).map(tab => (
              <button
                key={tab.key}
                onClick={() => setVoiceFilter(tab.key)}
                style={{
                  padding: '4px 12px', borderRadius: 6, fontSize: 12,
                  border: `1px solid ${voiceFilter === tab.key ? C.primary : C.border}`,
                  background: voiceFilter === tab.key ? '#EEF0FF' : '#fff',
                  color: voiceFilter === tab.key ? C.primary : C.textSecondary,
                  cursor: 'pointer', fontWeight: voiceFilter === tab.key ? 600 : 400,
                  transition: 'all 0.15s',
                }}
              >{tab.label}</button>
            ))}
          </div>
          {filteredVoices.map(v => {
            const isActive = voice === v.id
            const isCustom = v.type === 'custom'
            const isRecommended = avatar && AVATARS.find(a => a.id === avatar)?.recommendedVoiceId === v.id
            return (
              <div
                key={v.id}
                onClick={() => handleVoiceSelect(v.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 8, marginBottom: 6,
                  border: `1px solid ${isActive ? C.blueBorder : 'transparent'}`,
                  background: isActive ? C.blueBg : 'transparent',
                  cursor: 'pointer', transition: 'all 0.15s',
                  position: 'relative',
                }}
                onMouseEnter={e => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.background = '#F7F8FA'
                }}
                onMouseLeave={e => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: isActive ? C.primary : '#E5E6EB',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: isActive ? '#fff' : C.textSecondary, fontSize: 14, flexShrink: 0,
                }}>🔊</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: C.textPrimary }}>{v.name}</span>
                    <span style={{
                      fontSize: 9, padding: '0 4px', borderRadius: 3,
                      background: isCustom ? '#FFF3E0' : '#EEF0FF',
                      color: isCustom ? '#E65100' : C.primary,
                    }}>{isCustom ? '定制' : '公共'}</span>
                    {isRecommended && (
                      <span style={{
                        fontSize: 9, padding: '0 4px', borderRadius: 3,
                        background: '#E8F5E9', color: '#2E7D32',
                      }}>推荐</span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: C.textSecondary }}>{v.tag}</div>
                </div>
                <button
                  onClick={e => e.stopPropagation()}
                  style={{
                    width: 28, height: 28, borderRadius: '50%',
                    border: `1px solid ${C.border}`, background: '#fff',
                    cursor: 'pointer', fontSize: 12,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >▶</button>
              </div>
            )
          })}
        </div>

        {/* 调节滑块 */}
        <div style={{ padding: '8px 16px 16px', borderTop: `1px solid ${C.border}` }}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: C.textSecondary, marginBottom: 6 }}>
              <span>语速</span><span>{speed < 33 ? '偏慢' : speed > 66 ? '偏快' : '适中'}</span>
            </div>
            <input type="range" min={0} max={100} value={speed}
              onChange={e => setSpeed(+e.target.value)}
              style={{ width: '100%', accentColor: C.primary }}
            />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: C.textSecondary, marginBottom: 6 }}>
              <span>音量</span><span>{volume < 33 ? '偏小' : volume > 66 ? '偏大' : '适中'}</span>
            </div>
            <input type="range" min={0} max={100} value={volume}
              onChange={e => setVolume(+e.target.value)}
              style={{ width: '100%', accentColor: C.primary }}
            />
          </div>
        </div>

        {/* 快速设置 */}
        <div style={{ padding: '12px 16px', borderTop: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 13, color: C.textPrimary }}>开播后自动开始伴播</div>
              <div style={{ fontSize: 11, color: C.textTertiary }}>直播间开启后自动运行伴播</div>
            </div>
            <Toggle checked={autoStart} onChange={setAutoStart} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, color: C.textPrimary }}>AI智能互动</div>
              <div style={{ fontSize: 11, color: C.textTertiary }}>自动识别评论并回复</div>
            </div>
            <Toggle checked={aiChat} onChange={setAiChat} />
          </div>
        </div>
      </div>

      {/* 底部按钮栏 */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '12px 24px', borderTop: `1px solid ${C.border}`,
        background: '#fff', display: 'flex', justifyContent: 'space-between', zIndex: 5,
      }}>
        <SecondaryButton onClick={onPrev}>← 上一步</SecondaryButton>
        <PrimaryButton onClick={onComplete} bg={C.green} hoverBg={C.greenHover}>
          ✅ 完成配置
        </PrimaryButton>
      </div>
    </div>
  )
}

// ====== 顶部进度条 ======
function ProgressBar({ step }: { step: number }) {
  const steps = ['创建直播间', '导入商品', '伴播设置']
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '18px 24px 14px', gap: 0, flexShrink: 0,
    }}>
      {steps.map((label, i) => {
        const isCompleted = i < step
        const isCurrent = i === step
        return (
          <React.Fragment key={i}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 600,
                background: isCompleted ? C.green : isCurrent ? C.primary : '#E5E6EB',
                color: (isCompleted || isCurrent) ? '#fff' : C.textSecondary,
                transition: 'all 0.3s',
                boxShadow: isCurrent ? '0 0 0 3px rgba(88,80,236,0.2)' : 'none',
              }}>
                {isCompleted ? '✓' : i + 1}
              </div>
              <span style={{
                fontSize: 13, fontWeight: isCurrent ? 600 : 400,
                color: isCurrent ? C.textPrimary : isCompleted ? C.green : C.textSecondary,
              }}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                width: 80, height: 2, margin: '0 12px',
                background: isCompleted ? C.green : i < step ? `linear-gradient(to right, ${C.green}, ${C.primary})` : '#E5E6EB',
                borderRadius: 1,
                transition: 'all 0.3s',
              }} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// ====== 主组件 ======
export default function SetupWizard({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [currentStep, setCurrentStep] = useState<0 | 1 | 2>(0)

  const handleComplete = () => {
    onNavigate('banbo-dashboard')
  }

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: C.white,
      fontFamily: C.font,
      position: 'relative',
    }}>
      {/* spin 动画注入 */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <ProgressBar step={currentStep} />

      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {currentStep === 0 && (
          <Step1
            onNext={() => setCurrentStep(1)}
            onSkip={() => setCurrentStep(1)}
          />
        )}
        {currentStep === 1 && (
          <Step2
            onNext={() => setCurrentStep(2)}
            onPrev={() => setCurrentStep(0)}
          />
        )}
        {currentStep === 2 && (
          <Step3
            onComplete={handleComplete}
            onPrev={() => setCurrentStep(1)}
          />
        )}
      </div>
    </div>
  )
}
