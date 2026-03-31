import React from 'react'
import { tokens } from './tokens'

export type NavItem = {
  key: string
  label: string
  icon: string
  active?: boolean
  onClick?: () => void
}

type Props = {
  title: string
  subtitle?: string
  navItems: NavItem[]
  activeNav: string
  onNavClick: (key: string) => void
  rightContent?: React.ReactNode
  children: React.ReactNode
}

const T = tokens

export default function ShellLayout({
  title, subtitle, navItems, activeNav, onNavClick, rightContent, children
}: Props) {
  return (
    <div style={{
      display: 'flex',
      height: '800px',
      width: '100%',
      fontFamily: T.fonts.family,
      fontSize: 14,
      color: T.colors.textPrimary,
      background: T.colors.mainBg,
    }}>
      {/* 侧边栏 */}
      <div style={{
        width: T.sidebar.width,
        background: T.colors.sidebar,
        borderRight: `1px solid ${T.colors.sidebarBorder}`,
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{
          padding: '20px 16px',
          borderBottom: `1px solid ${T.colors.sidebarBorder}`,
        }}>
          <span style={{ fontWeight: 600, fontSize: 16, color: T.colors.textPrimary }}>助播虾</span>
        </div>

        {/* 导航 */}
        <div style={{ flex: 1, padding: '8px 0' }}>
          {navItems.map(item => {
            const isActive = item.key === activeNav
            return (
              <div
                key={item.key}
                onClick={() => onNavClick(item.key)}
                style={{
                  height: T.sidebar.itemHeight,
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 16px',
                  gap: 10,
                  cursor: 'pointer',
                  fontSize: 14,
                  color: isActive ? T.colors.primary : T.colors.textSecondary,
                  background: isActive ? T.colors.sidebarSelected : 'transparent',
                  borderLeft: isActive ? `${T.sidebar.selectedBorder}px solid ${T.colors.primary}` : '3px solid transparent',
                  fontWeight: isActive ? 500 : 400,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.background = '#F2F3F5'
                }}
                onMouseLeave={e => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'
                }}
              >
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            )
          })}
        </div>

        {/* 底部 */}
        <div style={{
          padding: '16px',
          borderTop: `1px solid ${T.colors.sidebarBorder}`,
        }}>
          <div style={{ fontSize: 12, color: T.colors.textSecondary, marginBottom: 4 }}>
            <span style={{ color: '#FF7D00', fontWeight: 500 }}>专业版</span>
            <span>（试用中）</span>
          </div>
          <div style={{ fontSize: 12, color: T.colors.textTertiary, marginBottom: 12 }}>剩7天</div>
          <div style={{
            fontSize: 12,
            color: T.colors.primary,
            padding: '6px 0',
            cursor: 'pointer',
          }}>购买记录</div>
        </div>
      </div>

      {/* 右侧主内容 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* 顶栏 */}
        <div style={{
          height: T.header.height,
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${T.colors.border}`,
          flexShrink: 0,
        }}>
          <div>
            <span style={{ fontSize: T.header.titleSize, fontWeight: 600, color: T.colors.textPrimary }}>
              {title}
            </span>
            {subtitle && (
              <span style={{ fontSize: T.header.subtitleSize, color: T.colors.textSecondary, marginLeft: 12 }}>
                {subtitle}
              </span>
            )}
          </div>
          {rightContent}
        </div>

        {/* 内容区 */}
        <div style={{ flex: 1, overflow: 'auto', padding: 24, background: T.colors.mainBg }}>
          {children}
        </div>
      </div>
    </div>
  )
}
