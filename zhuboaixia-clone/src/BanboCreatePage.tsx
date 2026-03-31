import React, { useState } from 'react'

type Props = { onNavigate: (page: any) => void; onShowBuyin?: () => void }

const C = {
  primary: '#722ED1',
  pink: '#F56C6C',
  pinkBorder: '#F56C6C',
  pinkCheck: '#F56C6C',
  pinkBg: '#FFF0F0',
  pinkAccent: '#E8836B',
  footerBg: '#FAFAFA',
  sectionBg: '#FFF5F5',
  cardBg: '#FFFFFF',
  border: '#E8E8E8',
  textPrimary: '#1D2129',
  textSecondary: '#86909C',
  textTertiary: '#C9CDD4',
  btnDisabled: '#E0E0E0',
  btnDisabledText: '#AAAAAA',
  link: '#5850EC',
  font: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif',
}

const PLATFORMS = [
  {
    id: 'bytedance',
    name: '巨量百应',
    desc: '适用于达人直播',
    logo: (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* 蓝色图形图标 */}
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <rect width="36" height="36" rx="6" fill="#1890FF"/>
          <path d="M10 12h16v4H10z" fill="#fff"/>
          <path d="M14 18h8v8h-8z" fill="#fff" opacity="0.8"/>
        </svg>
        {/* Buy in 文字 */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 0, fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px' }}>
          <span style={{ color: '#1890FF' }}>Buy</span>
          <span style={{ color: '#40A9FF', marginLeft: 2 }}>in</span>
        </div>
      </div>
    ),
  },
  {
    id: 'douyin-local',
    name: '抖音本地生活',
    desc: '',
    logo: (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* 抖音官方Logo */}
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <rect width="36" height="36" rx="6" fill="#161823"/>
          <path d="M24 10v14a5 5 0 1 1-4-4.9V14l-3 1V11l6-2v1z" fill="#25F4EE"/>
          <path d="M24 10v14a5 5 0 1 1-4-4.9V14l-3 1V11l6-2v1z" fill="#FE2C55" opacity="0.6"/>
        </svg>
        {/* 抖音文字 */}
        <div style={{ fontSize: 22, fontWeight: 700, color: '#1D2129', display: 'flex', gap: 0 }}>
          <span style={{ color: '#000' }}>抖音</span>
        </div>
      </div>
    ),
  },
]

// 从参考图提取的说明事项（"助播"已替换为"伴播"）
const NOTICES = [
  '您的伴播虾账号可以创建若干个伴播虾直播间，每个伴播虾直播间仅能固定绑定1个开播平台账号（绑定后不支持解绑）。',
  '您可以创建多个伴播虾直播间并绑定到同一个开播平台账号上。这样就能针对不同直播场景和品类，保存多套互不干扰的 AI 中控和场控方案！',
  '您的同一个伴播虾账号最多可以累计绑定3个不同的开播平台账号。',
  '您的同一个伴播虾账号同一时刻仅支持 1 路伴播虾直播间处于"开播中"状态。',
]

export default function BanboCreatePage({ onNavigate, onShowBuyin }: Props) {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('bytedance')
  const [agreed, setAgreed] = useState(false)

  const canCreate = selectedPlatform && agreed

  return (
    <div style={{
      fontFamily: C.font,
      flex: 1,
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column',
      background: '#FAFBFC',
    }}>
      {/* ===== 滚动内容区 ===== */}
      <div style={{
        flex: 1,
        minHeight: 0,
        overflow: 'auto',
        maxWidth: 800,
        width: '100%',
        margin: '0 auto',
        padding: '16px 28px',
        boxSizing: 'border-box',
      }}>
        {/* 标题栏 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: 4, height: 22, background: C.primary,
              borderRadius: 2, marginRight: 10,
            }} />
            <span style={{ fontSize: 20, fontWeight: 700, color: C.textPrimary }}>
              创建直播间
            </span>
          </div>
          <span
            onClick={() => onNavigate('banbo-home')}
            style={{
              fontSize: 14, color: C.textSecondary, cursor: 'pointer',
            }}
          >
            ← 返回列表
          </span>
        </div>

        {/* ===== 开播平台区域 ===== */}
        <div style={{
          background: C.sectionBg,
          borderRadius: '10px 10px 0 0',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
        }}>
          <div style={{
            width: 3, height: 18, background: C.pink,
            borderRadius: 2, marginRight: 10,
          }} />
          <span style={{ fontSize: 15, fontWeight: 600, color: C.textPrimary }}>
            开播平台
          </span>
        </div>

        {/* ===== 平台卡片 ===== */}
        <div style={{
          background: C.cardBg,
          borderRadius: '0 0 10px 10px',
          padding: '28px 28px 24px',
          display: 'flex',
          gap: 36,
          justifyContent: 'center',
        }}>
          {PLATFORMS.map(platform => {
            const isSelected = selectedPlatform === platform.id
            return (
              <div
                key={platform.id}
                onClick={() => setSelectedPlatform(platform.id)}
                style={{
                  width: 260,
                  padding: '24px 20px',
                  borderRadius: 8,
                  border: `2px solid ${isSelected ? C.pinkBorder : C.border}`,
                  background: C.cardBg,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative',
                  textAlign: 'center',
                }}
              >
                {/* 选中角标 */}
                {isSelected && (
                  <div style={{
                    position: 'absolute',
                    bottom: -2,
                    right: -2,
                    width: 24,
                    height: 24,
                    borderRadius: '2px 0 8px 0',
                    background: C.pinkCheck,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 700,
                  }}>
                    ✓
                  </div>
                )}

                {/* Logo */}
                <div style={{
                  marginBottom: 16,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 50,
                }}>
                  {platform.logo}
                </div>

                {/* 平台名称 */}
                <div style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: C.textPrimary,
                  marginBottom: 6,
                }}>
                  {platform.name}
                </div>

                {/* 描述 */}
                {platform.desc && (
                  <div style={{
                    fontSize: 13,
                    color: C.textSecondary,
                  }}>
                    {platform.desc}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* ===== 说明事项 ===== */}
        <div style={{
          background: '#F7F8FA',
          borderRadius: 8,
          padding: '12px 16px',
          marginTop: 16,
        }}>
          <div style={{
            fontSize: 13,
            fontWeight: 600,
            color: C.textPrimary,
            marginBottom: 8,
          }}>
            说明事项
          </div>
          {NOTICES.map((notice, i) => (
            <div key={i} style={{
              fontSize: 11,
              color: C.textSecondary,
              lineHeight: '18px',
              marginBottom: i < NOTICES.length - 1 ? 6 : 0,
              paddingLeft: 12,
              position: 'relative',
            }}>
              <span style={{
                position: 'absolute',
                left: 0,
                top: 0,
                color: C.textTertiary,
              }}>{i + 1}.</span>
              {notice}
            </div>
          ))}
        </div>
      </div>

      {/* ===== 底部操作栏（flex-shrink: 0 确保不被压缩） ===== */}
      <div style={{
        flexShrink: 0,
        height: 56,
        padding: '0 28px',
        borderTop: `1px solid ${C.border}`,
        background: C.footerBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: 800,
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            onClick={() => setAgreed(!agreed)}
            style={{
              width: 16, height: 16, borderRadius: 3,
              border: `2px solid ${agreed ? C.pinkCheck : '#D0D0D0'}`,
              background: agreed ? C.pinkCheck : '#fff',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {agreed && <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>✓</span>}
          </div>
          <span style={{ fontSize: 13, color: C.textSecondary }}>
            第三方授权以同步商品，阅读并同意
          </span>
          <span style={{ fontSize: 13, color: C.link, cursor: 'pointer' }}>
            《绑定协议》
          </span>
        </div>

        <button
          disabled={!canCreate}
          onClick={() => canCreate && onShowBuyin?.()}
          style={{
            padding: '10px 32px',
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 500,
            border: 'none',
            background: canCreate ? C.pinkCheck : C.btnDisabled,
            color: canCreate ? '#fff' : C.btnDisabledText,
            cursor: canCreate ? 'pointer' : 'not-allowed',
            fontFamily: C.font,
          }}
        >
          立即创建
        </button>
      </div>
    </div>
  )
}