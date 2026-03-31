import React, { useState } from 'react'
import BanboHomePage from './BanboHomePage'
import BanboCreatePage from './BanboCreatePage'
import BuyinDashboardOverlay from './BuyinDashboardOverlay'

export type Mode = 'zhu' | 'ban'
export type PageId = 
  | 'home-empty' | 'home-with-room' | 'create-room' | 'buy-membership' | 'tutorial'
  | 'dashboard-chat' | 'dashboard-director' | 'dashboard-comment'
  | 'dashboard-pricing' | 'dashboard-pricing-config'
  | 'dashboard-welcome' | 'dashboard-welcome-active'
  | 'dashboard-coupon' | 'dashboard-luckybag'
  | 'banbo-home' | 'banbo-create'

type PageMode = 'screenshot' | 'css'

interface Hotspot {
  id: string; x: number; y: number; w: number; h: number
  targetPage: PageId; tooltip?: string
}

interface PageConfig {
  mode: PageMode; screenshot?: string; hotspots?: Hotspot[]
}

// ============ 助播虾 截图热区 ============
const SIDEBAR: Hotspot[] = [
  { id: 'my-live', x: 15, y: 70, w: 225, h: 45, targetPage: 'home-empty', tooltip: '我的直播' },
  { id: 'tutorial', x: 15, y: 130, w: 225, h: 45, targetPage: 'tutorial', tooltip: '使用教程' },
  { id: 'pro', x: 15, y: 720, w: 225, h: 45, targetPage: 'buy-membership', tooltip: '专业版' },
  { id: 'buy', x: 15, y: 775, w: 225, h: 45, targetPage: 'buy-membership', tooltip: '购买会员' },
  { id: 'record', x: 15, y: 830, w: 225, h: 45, targetPage: 'buy-membership', tooltip: '购买记录' },
]

const TABS: Hotspot[] = [
  { id: 't1', x: 250, y: 55, w: 130, h: 40, targetPage: 'home-with-room', tooltip: '声控切品' },
  { id: 't2', x: 385, y: 55, w: 100, h: 40, targetPage: 'dashboard-chat', tooltip: '搭话助播' },
  { id: 't3', x: 490, y: 55, w: 90, h: 40, targetPage: 'dashboard-director', tooltip: '导播台' },
  { id: 't4', x: 585, y: 55, w: 115, h: 40, targetPage: 'dashboard-comment', tooltip: '发评回评' },
  { id: 't5', x: 705, y: 55, w: 145, h: 40, targetPage: 'dashboard-pricing', tooltip: '声控开价' },
  { id: 't6', x: 855, y: 55, w: 125, h: 40, targetPage: 'dashboard-welcome', tooltip: '欢迎感谢' },
  { id: 't7', x: 985, y: 55, w: 115, h: 40, targetPage: 'dashboard-coupon', tooltip: '发优惠券' },
  { id: 't8', x: 1105, y: 55, w: 115, h: 40, targetPage: 'dashboard-luckybag', tooltip: '发福袋' },
]

function sidebar(defaultPage: PageId): Hotspot[] {
  return SIDEBAR.map(h => ({ ...h, targetPage: h.id === 'my-live' ? defaultPage : h.targetPage }))
}

// ============ 页面配置 ============
const PAGES: Record<PageId, PageConfig> = {
  'home-empty': { mode: 'screenshot', screenshot: '/screenshots/01-ai-assistant-empty.jpg',
    hotspots: [...sidebar('home-empty'), { id: 'create', x: 1280, y: 65, w: 130, h: 40, targetPage: 'create-room', tooltip: '创建AI助播' }] },
  'home-with-room': { mode: 'screenshot', screenshot: '/screenshots/05-dashboard-voice-switch.jpg',
    hotspots: [...sidebar('home-with-room'), { id: 'card', x: 250, y: 130, w: 350, h: 420, targetPage: 'dashboard-chat', tooltip: '进入直播间' }] },
  'create-room': { mode: 'screenshot', screenshot: '/screenshots/04-create-room.jpg', hotspots: sidebar('create-room') },
  'buy-membership': { mode: 'screenshot', screenshot: '/screenshots/03-buy-membership.jpg', hotspots: sidebar('buy-membership') },
  'tutorial': { mode: 'screenshot', screenshot: '/screenshots/02-tutorial.jpg', hotspots: sidebar('tutorial') },
  'dashboard-chat': { mode: 'screenshot', screenshot: '/screenshots/06-dashboard-chat.jpg', hotspots: TABS },
  'dashboard-director': { mode: 'screenshot', screenshot: '/screenshots/07-dashboard-director.jpg', hotspots: TABS },
  'dashboard-comment': { mode: 'screenshot', screenshot: '/screenshots/08-dashboard-comment.jpg', hotspots: TABS },
  'dashboard-pricing': { mode: 'screenshot', screenshot: '/screenshots/09-dashboard-voice-pricing.jpg',
    hotspots: [...TABS, { id: 'add-config', x: 1300, y: 55, w: 120, h: 35, targetPage: 'dashboard-pricing-config', tooltip: '添加配置' }] },
  'dashboard-pricing-config': { mode: 'screenshot', screenshot: '/screenshots/11-dashboard-voice-pricing2.jpg', hotspots: TABS },
  'dashboard-welcome': { mode: 'screenshot', screenshot: '/screenshots/10-dashboard-welcome.jpg',
    hotspots: [...TABS, { id: 'toggle-welcome', x: 1280, y: 140, w: 80, h: 30, targetPage: 'dashboard-welcome-active', tooltip: '开启欢迎' }] },
  'dashboard-welcome-active': { mode: 'screenshot', screenshot: '/screenshots/12-dashboard-welcome2.jpg', hotspots: TABS },
  'dashboard-coupon': { mode: 'screenshot', screenshot: '/screenshots/13-dashboard-coupon.jpg', hotspots: TABS },
  'dashboard-luckybag': { mode: 'screenshot', screenshot: '/screenshots/14-dashboard-luckybag.jpg', hotspots: TABS },
  'banbo-home': { mode: 'css' }, 'banbo-create': { mode: 'css' },
}

const LABELS: Record<PageId, string> = {
  'home-empty': '我的直播', 'home-with-room': '我的直播',
  'create-room': '创建直播间', 'buy-membership': '购买会员', 'tutorial': '使用教程',
  'dashboard-chat': '搭话助播', 'dashboard-director': '导播台', 'dashboard-comment': '发评回评',
  'dashboard-pricing': '声控开价', 'dashboard-pricing-config': '声控开价(已配置)',
  'dashboard-welcome': '欢迎感谢', 'dashboard-welcome-active': '欢迎感谢(已启用)',
  'dashboard-coupon': '发优惠券', 'dashboard-luckybag': '发福袋',
  'banbo-home': '我的伴播', 'banbo-create': '创建直播间',
}

// 助播模式侧边栏菜单
const ZHU_NAV = [
  { key: 'home-empty', icon: '📺', label: '我的直播' },
  { key: 'tutorial', icon: '📖', label: '使用教程' },
  { key: 'buy-membership', icon: '💎', label: '购买会员' },
]

// 伴播模式侧边栏菜单
const BAN_NAV = [
  { key: 'banbo-home', icon: '📺', label: '我的伴播' },
]

// 色彩 token（与截图侧边栏颜色匹配）
const C = {
  primary: '#5850EC',
  sidebar: '#F8F9FB',
  sidebarBorder: '#E5E6EB',
  sidebarSelected: '#EEF0FF',
  mainBg: '#FFFFFF',
  textPrimary: '#1D2129',
  textSecondary: '#86909C',
  textTertiary: '#C9CDD4',
}

// 截图内容组件：处理 contain 缩放 + 对齐覆盖层
function ScreenshotContent({
  screenshot, hotspots, debug, hover, setHover, onNavigate,
}: {
  screenshot: string; hotspots: Hotspot[]; debug: boolean
  hover: string | null; setHover: (id: string | null) => void
  onNavigate: (p: PageId) => void
}) {
  // 裁切区域：去掉左侧侧边栏(0-250px) + 顶部tab条(0-95px)
  const CROP_LEFT = 250
  const CROP_TOP = 95
  const CROP_W = 1440 - CROP_LEFT  // 1190
  const CROP_H = 900 - CROP_TOP    // 805

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <img
        src={screenshot}
        alt=""
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          userSelect: 'none',
          pointerEvents: 'none',
          clipPath: `inset(${(CROP_TOP/900)*100}% 0% 0% ${(CROP_LEFT/1440)*100}%)`,
        }}
        draggable={false}
      />
      {hotspots.filter(hs => hs.x >= CROP_LEFT && hs.y >= CROP_TOP).map(hs => (
        <div
          key={hs.id}
          onClick={() => onNavigate(hs.targetPage)}
          onMouseEnter={() => setHover(hs.id)}
          onMouseLeave={() => setHover(null)}
          style={{
            position: 'absolute',
            left: `${((hs.x - CROP_LEFT) / CROP_W) * 100}%`,
            top: `${((hs.y - CROP_TOP) / CROP_H) * 100}%`,
            width: `${(hs.w / CROP_W) * 100}%`,
            height: `${(hs.h / CROP_H) * 100}%`,
            cursor: 'pointer',
            background: debug ? 'rgba(59,130,246,0.2)' : 'transparent',
            border: debug ? '2px solid rgba(59,130,246,0.6)' : 'none',
            borderRadius: 4,
            zIndex: 2,
          }}
          onMouseOver={e => {
            if (!debug) (e.currentTarget as HTMLElement).style.background = 'rgba(88,80,236,0.08)'
          }}
          onMouseOut={e => {
            if (!debug) (e.currentTarget as HTMLElement).style.background = 'transparent'
          }}
        >
          {debug && (
            <span style={{
              position: 'absolute', top: -18, left: 0,
              fontSize: 10, background: '#3B82F6', color: '#fff',
              padding: '1px 4px', borderRadius: 3, whiteSpace: 'nowrap',
            }}>
              {hs.tooltip || hs.id}
            </span>
          )}
        </div>
      ))}
      {hover && (
        <div style={{
          position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(17,24,39,0.9)', color: '#fff', fontSize: 12,
          padding: '4px 12px', borderRadius: 20, pointerEvents: 'none', zIndex: 10,
        }}>
          {hotspots.find(h => h.id === hover)?.tooltip}
        </div>
      )}
    </div>
  )
}

export default function App() {
  const [mode, setMode] = useState<Mode>('zhu')
  const [page, setPage] = useState<PageId>('home-empty')
  const [debug, setDebug] = useState(false)
  const [hover, setHover] = useState<string | null>(null)
  const [showBuyinOverlay, setShowBuyinOverlay] = useState(false)

  const switchMode = (m: Mode) => {
    setMode(m)
    setPage(m === 'zhu' ? 'home-empty' : 'banbo-home')
  }

  const config = PAGES[page]
  const navItems = mode === 'zhu' ? ZHU_NAV : BAN_NAV

  const navigate = (p: PageId) => setPage(p)

  // 截图页当前活跃的侧边栏项
  const activeSideKey = mode === 'zhu'
    ? (page.startsWith('dashboard') ? 'home-empty' : page)
    : page

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacFont, "PingFang SC", "Microsoft YaHei", sans-serif',
      overflow: 'hidden',
    }}>
      {/* 窗口外壳 */}
      <div style={{
        width: 1280,
        height: 832,
        borderRadius: 12,
        boxShadow: '0 25px 80px rgba(0,0,0,0.6)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* macOS 标题栏（纯装饰） */}
        <div style={{
          height: 28,
          background: 'linear-gradient(to bottom, #3c3c3c, #2d2d2d)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          gap: 7,
          borderBottom: '1px solid rgba(0,0,0,0.3)',
          flexShrink: 0,
        }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840' }} />
        </div>

        {/* 应用内容区 */}
        <div style={{
          flex: 1,
          display: 'flex',
          fontSize: 14,
          color: C.textPrimary,
          background: C.mainBg,
          position: 'relative',
        }}>
      {/* ===== 侧边栏 ===== */}
      <div style={{
        width: 220,
        background: C.sidebar,
        borderRight: `1px solid ${C.sidebarBorder}`,
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{
          padding: '20px 16px 12px',
          borderBottom: `1px solid ${C.sidebarBorder}`,
        }}>
          <span style={{ fontWeight: 700, fontSize: 17, color: C.textPrimary }}>助播虾</span>
        </div>

        {/* 模式切换 */}
        <div style={{ padding: '12px 12px 8px' }}>
          <div style={{
            display: 'flex',
            borderRadius: 8,
            overflow: 'hidden',
            border: `1px solid ${C.sidebarBorder}`,
            background: '#fff',
          }}>
            <button
              onClick={() => switchMode('zhu')}
              style={{
                flex: 1,
                padding: '7px 0',
                fontSize: 13,
                fontWeight: mode === 'zhu' ? 600 : 400,
                border: 'none',
                background: mode === 'zhu' ? C.primary : 'transparent',
                color: mode === 'zhu' ? '#fff' : C.textSecondary,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              🎤 助播
            </button>
            <button
              onClick={() => switchMode('ban')}
              style={{
                flex: 1,
                padding: '7px 0',
                fontSize: 13,
                fontWeight: mode === 'ban' ? 600 : 400,
                border: 'none',
                background: mode === 'ban' ? '#FF6B9D' : 'transparent',
                color: mode === 'ban' ? '#fff' : C.textSecondary,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              🐟 伴播
            </button>
          </div>
        </div>

        {/* 导航菜单 */}
        <div style={{ flex: 1, padding: '8px 0', overflow: 'auto' }}>
          {navItems.map(item => {
            const isActive = item.key === activeSideKey ||
              (mode === 'zhu' && item.key === 'home-empty' && (page === 'home-empty' || page === 'home-with-room'))
            return (
              <div
                key={item.key}
                onClick={() => navigate(item.key as PageId)}
                style={{
                  height: 44,
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 16px',
                  gap: 10,
                  cursor: 'pointer',
                  fontSize: 14,
                  color: isActive ? C.primary : C.textSecondary,
                  background: isActive ? C.sidebarSelected : 'transparent',
                  borderLeft: isActive ? `3px solid ${C.primary}` : '3px solid transparent',
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

        {/* 底部信息 */}
        <div style={{
          padding: '16px',
          borderTop: `1px solid ${C.sidebarBorder}`,
        }}>
          <div style={{ fontSize: 12, color: C.textSecondary, marginBottom: 4 }}>
            <span style={{ color: '#FF7D00', fontWeight: 500 }}>专业版</span>
            <span>（试用中）</span>
          </div>
          <div style={{ fontSize: 12, color: C.textTertiary, marginBottom: 12 }}>剩7天</div>
          <div style={{ fontSize: 12, color: C.textPrimary, padding: '6px 0', cursor: 'pointer' }}>购买记录</div>
          {debug && (
            <div style={{ fontSize: 11, color: C.primary, marginTop: 8 }}>🔍 热区调试已开启</div>
          )}
        </div>
      </div>

      {/* ===== 主内容区 ===== */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* 产品内顶栏 */}
        <div style={{
          height: 56,
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${C.sidebarBorder}`,
          flexShrink: 0,
          background: C.mainBg,
        }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: C.textPrimary }}>
            {LABELS[page]}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* 调试开关 */}
            <button
              onClick={() => setDebug(!debug)}
              style={{
                fontSize: 12,
                color: debug ? C.primary : C.textTertiary,
                padding: '4px 10px',
                borderRadius: 6,
                border: `1px solid ${C.sidebarBorder}`,
                background: debug ? C.sidebarSelected : 'transparent',
                cursor: 'pointer',
              }}
            >
              {debug ? '隐藏热区' : '调试'}
            </button>
            {/* 用户头像占位 */}
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#E5E6EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
            }}>
              👤
            </div>
          </div>
        </div>

        {/* 内容区 */}
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative', background: '#F0F1F5' }}>
          {config.mode === 'screenshot' ? (
            /* 截图页：contain 等比缩放 + 截图对齐的覆盖层 */
            <ScreenshotContent
              screenshot={config.screenshot || ''}
              hotspots={config.hotspots || []}
              debug={debug}
              hover={hover}
              setHover={setHover}
              onNavigate={navigate}
            />
          ) : (
            /* CSS 页（伴播专用） */
            <>
              {page === 'banbo-home' && <BanboHomePage onNavigate={navigate} />}
              {page === 'banbo-create' && (
                <BanboCreatePage
                  onNavigate={navigate}
                  onShowBuyin={() => setShowBuyinOverlay(true)}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* 巨量百应覆盖层：覆盖整个应用区域（侧边栏 + 主内容区） */}
      {showBuyinOverlay && (
        <BuyinDashboardOverlay onClose={() => { setShowBuyinOverlay(false); setPage('banbo-home') }} />
      )}
      </div>
    </div>
    </div>
  )
}
