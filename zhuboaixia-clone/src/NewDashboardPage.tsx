import React from 'react'
import ShellLayout from './ShellLayout'
import { tokens } from './tokens'

type Props = {
  onNavigate: (page: any) => void
}

const T = tokens

const NAV_ITEMS = [
  { key: 'home', label: '我的直播', icon: '📺' },
  { key: 'new-page', label: '数据看板', icon: '📊' },
  { key: 'tutorial', label: '使用教程', icon: '📖' },
  { key: 'buy', label: '购买会员', icon: '👑' },
  { key: 'record', label: '购买记录', icon: '🕐' },
]

// 模拟数据
const mockStats = [
  { label: '今日GMV', value: '¥12,580', change: '+15.3%', up: true },
  { label: '今日订单', value: '89', change: '+8.2%', up: true },
  { label: '在线观众', value: '234', change: '-2.1%', up: false },
  { label: '互动率', value: '68.5%', change: '+5.7%', up: true },
]

const mockProducts = [
  { name: '夏季薄款防晒衣', price: '¥89', sales: 234, gmv: '¥20,826' },
  { name: '冰丝阔腿裤女', price: '¥69', sales: 189, gmv: '¥13,041' },
  { name: '纯棉短袖T恤', price: '¥39', sales: 456, gmv: '¥17,784' },
  { name: '高腰A字半身裙', price: '¥99', sales: 67, gmv: '¥6,633' },
]

export default function NewDashboardPage({ onNavigate }: Props) {
  return (
    <ShellLayout
      title="数据看板"
      subtitle="实时直播数据概览"
      navItems={NAV_ITEMS}
      activeNav="new-page"
      onNavClick={(key) => {
        if (key === 'home') onNavigate('home')
        else if (key === 'tutorial') onNavigate('tutorial')
        else if (key === 'buy') onNavigate('buy')
      }}
    >
      {/* 统计卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {mockStats.map((stat, i) => (
          <div key={i} style={{
            background: T.colors.mainBg,
            border: `1px solid ${T.colors.border}`,
            borderRadius: T.radius.md,
            padding: '20px 16px',
          }}>
            <div style={{ fontSize: 12, color: T.colors.textSecondary, marginBottom: 8 }}>{stat.label}</div>
            <div style={{ fontSize: 24, fontWeight: 600, color: T.colors.textPrimary, marginBottom: 4 }}>
              {stat.value}
            </div>
            <div style={{
              fontSize: 12,
              color: stat.up ? '#00B42A' : '#F53F3F',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}>
              {stat.up ? '↑' : '↓'} {stat.change}
            </div>
          </div>
        ))}
      </div>

      {/* 商品排行 */}
      <div style={{
        background: T.colors.mainBg,
        border: `1px solid ${T.colors.border}`,
        borderRadius: T.radius.md,
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '16px 20px',
          borderBottom: `1px solid ${T.colors.border}`,
          fontWeight: 600,
          fontSize: 15,
        }}>
          🏆 商品销量排行
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F7F8FA' }}>
              <th style={thStyle}>排名</th>
              <th style={thStyle}>商品名称</th>
              <th style={thStyle}>单价</th>
              <th style={thStyle}>销量</th>
              <th style={thStyle}>GMV</th>
            </tr>
          </thead>
          <tbody>
            {mockProducts.map((p, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${T.colors.border}` }}>
                <td style={tdStyle}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    background: i < 3 ? '#FFF3E0' : '#F2F3F5',
                    color: i < 3 ? '#FF7D00' : T.colors.textSecondary,
                    fontSize: 12,
                    fontWeight: 600,
                  }}>
                    {i + 1}
                  </span>
                </td>
                <td style={{ ...tdStyle, fontWeight: 500 }}>{p.name}</td>
                <td style={tdStyle}>{p.price}</td>
                <td style={tdStyle}>{p.sales}</td>
                <td style={{ ...tdStyle, fontWeight: 500, color: T.colors.primary }}>{p.gmv}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ShellLayout>
  )
}

const thStyle: React.CSSProperties = {
  padding: '12px 16px',
  textAlign: 'left',
  fontSize: 12,
  color: '#86909C',
  fontWeight: 500,
}

const tdStyle: React.CSSProperties = {
  padding: '14px 16px',
  fontSize: 14,
  color: '#1D2129',
}