import React, { useState } from 'react'
import { tokens } from './tokens'
import BanboPurchasePage from './BanboPurchasePage'

const T = tokens
const C = T.colors

type OuterTab = 'subscription' | 'addon'

const PRIMARY = '#5850EC'
const PRO_COLOR = '#E8002D'
const CHECK_COLOR = '#16A34A'
const PRO_BG = '#FFF5F6'
const PRO_BORDER = '#E8002D'

// ─── Cell data model ────────────────────────────────────────────────────────

interface Cell {
  yes: boolean
  note?: string
}

const Y: Cell = { yes: true }
const N: Cell = { yes: false }
const YN = (note: string): Cell => ({ yes: true, note })

// ─── Table data ─────────────────────────────────────────────────────────────

interface TableRow {
  group: string | null
  feature: string
  basic: Cell
  pro: Cell
  flagship: Cell
}

interface TableSection {
  title: string
  rows: TableRow[]
}

const TABLE: TableSection[] = [
  {
    title: '语音控品',
    rows: [
      { group: '弹讲解', feature: '声控切讲解', basic: N, pro: Y, flagship: Y },
      { group: '弹讲解', feature: '重复商品弹窗', basic: Y, pro: Y, flagship: Y },
      { group: '预热开价', feature: '声控开价（并弹讲解）', basic: N, pro: Y, flagship: Y },
      { group: '投放秒杀', feature: '声控投放秒杀', basic: N, pro: Y, flagship: Y },
      { group: '投放秒杀', feature: '自动投放', basic: YN('3个(限免)'), pro: YN('不限'), flagship: YN('不限') },
      { group: '投放秒杀', feature: '新增秒杀', basic: YN('1组(限免)'), pro: YN('不限'), flagship: YN('不限') },
    ],
  },
  {
    title: '捧哏搭话',
    rows: [
      { group: '搭话助播', feature: '智能搭话', basic: N, pro: YN('限免'), flagship: Y },
      { group: '搭话助播', feature: '自定义搭话', basic: N, pro: YN('限免'), flagship: Y },
      { group: '数字人出镜助播', feature: '数字人形象', basic: N, pro: N, flagship: YN('3个(支持定制)') },
    ],
  },
  {
    title: '智能营销',
    rows: [
      { group: '智能发优惠券', feature: '自动发优惠券', basic: Y, pro: Y, flagship: Y },
      { group: '智能发福袋', feature: '自动发福袋', basic: Y, pro: Y, flagship: Y },
      { group: '智能发福袋', feature: '批量复制福袋', basic: Y, pro: Y, flagship: Y },
    ],
  },
  {
    title: '声控导播',
    rows: [
      { group: '多场景管理', feature: '声控切场景', basic: N, pro: Y, flagship: Y },
      { group: '多场景管理', feature: '手动切场景', basic: Y, pro: Y, flagship: Y },
      { group: '多场景管理', feature: '远/近多机位镜头', basic: YN('1个(限免)'), pro: YN('不限'), flagship: YN('不限') },
      { group: '多场景管理', feature: '视频放映镜头', basic: YN('1个(限免)'), pro: YN('不限'), flagship: YN('不限') },
      { group: '场景装修', feature: '添加素材', basic: Y, pro: Y, flagship: Y },
      { group: '场景装修', feature: '画面布局', basic: Y, pro: Y, flagship: Y },
      { group: '场景装修', feature: '动态贴片', basic: YN('3个(商品)'), pro: Y, flagship: Y },
    ],
  },
  {
    title: '公屏互动',
    rows: [
      { group: '固定发评/回评', feature: '自动发评', basic: YN('20条'), pro: YN('不限'), flagship: YN('不限') },
      { group: '固定发评/回评', feature: '自动固定回评', basic: YN('100条'), pro: YN('不限'), flagship: YN('不限') },
      { group: '欢迎/感谢', feature: '进入直播间欢迎', basic: Y, pro: Y, flagship: Y },
      { group: '欢迎/感谢', feature: '点关注感谢', basic: Y, pro: Y, flagship: Y },
      { group: '欢迎/感谢', feature: '点赞感谢', basic: Y, pro: Y, flagship: Y },
      { group: '欢迎/感谢', feature: '分享感谢', basic: Y, pro: Y, flagship: Y },
      { group: '欢迎/感谢', feature: '下单感谢', basic: Y, pro: Y, flagship: Y },
    ],
  },
  {
    title: '矩阵管理',
    rows: [
      { group: null, feature: '账号集控', basic: N, pro: N, flagship: YN('20') },
      { group: null, feature: '智能导播', basic: N, pro: N, flagship: Y },
    ],
  },
]

// ─── Grouped structure for rendering ────────────────────────────────────────

interface GroupedFeature {
  feature: string
  basic: Cell
  pro: Cell
  flagship: Cell
}

interface GroupedRow {
  group: string | null
  features: GroupedFeature[]
}

interface GroupedSection {
  title: string
  groups: GroupedRow[]
}

function groupTableData(sections: TableSection[]): GroupedSection[] {
  return sections.map(section => {
    const groups: GroupedRow[] = []
    let current: GroupedRow | null = null
    for (const row of section.rows) {
      if (!current || current.group !== row.group) {
        current = { group: row.group, features: [] }
        groups.push(current)
      }
      current.features.push({ feature: row.feature, basic: row.basic, pro: row.pro, flagship: row.flagship })
    }
    return { title: section.title, groups }
  })
}

const GROUPED = groupTableData(TABLE)

// ─── Cell renderer ──────────────────────────────────────────────────────────

function renderCell(cell: Cell, isPro = false) {
  const checkColor = isPro ? PRO_COLOR : CHECK_COLOR
  if (!cell.yes) {
    return <span style={{ color: C.textTertiary, fontSize: 15 }}>–</span>
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
      <span style={{ color: checkColor, fontSize: 15, lineHeight: 1 }}>✓</span>
      {cell.note && (
        <span style={{ fontSize: 11, color: C.textSecondary, whiteSpace: 'nowrap' }}>{cell.note}</span>
      )}
    </div>
  )
}

// ─── Plan card ──────────────────────────────────────────────────────────────

const PLAN_COL_W = 160

function PlanCard({ plan }: { plan: typeof PLANS[number] }) {
  const isPro = plan.id === 'pro'
  const isFlag = plan.id === 'flagship'

  return (
    <div style={{
      flex: 1,
      borderRadius: 12,
      border: isPro ? `2px solid ${PRO_BORDER}` : '1px solid #E5E6EB',
      background: isPro ? PRO_BG : '#fff',
      padding: '22px 20px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      position: 'relative',
      transform: isPro ? 'translateY(-4px)' : 'none',
      boxShadow: isPro ? '0 8px 24px rgba(232,0,45,0.12)' : '0 1px 4px rgba(0,0,0,0.06)',
    }}>
      {isPro && (
        <div style={{
          position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)',
          background: PRO_COLOR, color: '#fff',
          fontSize: 11, fontWeight: 600,
          padding: '2px 12px', borderRadius: '0 0 8px 8px',
          whiteSpace: 'nowrap',
        }}>
          推荐
        </div>
      )}

      <div style={{ fontSize: 15, fontWeight: 600, color: C.textPrimary, marginTop: isPro ? 8 : 0 }}>
        {plan.name}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: isPro ? PRO_COLOR : C.textPrimary }}>
          ¥{plan.price}
        </span>
        <span style={{ fontSize: 12, color: C.textTertiary, textDecoration: 'line-through' }}>
          ¥{plan.original}
        </span>
      </div>

      <div style={{ fontSize: 12, color: C.textSecondary, lineHeight: 1.5 }}>
        {plan.desc}
      </div>

      {isFlag && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          background: '#EEF0FF', borderRadius: 6,
          padding: '3px 8px', alignSelf: 'flex-start',
          fontSize: 11, color: PRIMARY, fontWeight: 500,
        }}>
          🎁 赠送两个伴播形象
        </div>
      )}

      <button
        onClick={() => alert(plan.id === 'flagship' ? '立即订阅（演示）' : '立即购买（演示）')}
        style={{
          marginTop: 'auto',
          height: 38, borderRadius: 8, border: 'none',
          background: isPro ? PRO_COLOR : plan.id === 'flagship' ? PRIMARY : PRIMARY,
          color: '#fff',
          fontSize: 14, fontWeight: 600, cursor: 'pointer',
          fontFamily: T.fonts.family,
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        {plan.id === 'flagship' ? '立即订阅' : '立即购买'}
      </button>
    </div>
  )
}

const PLANS = [
  { id: 'basic', name: '基础版', price: 59, original: 99, desc: '智能场控助手，实现直播间高效自动化' },
  { id: 'pro', name: '专业版', price: 199, original: 399, desc: '听主播讲就能自主干活的AI中控和AI场控' },
  { id: 'flagship', name: '旗舰版', price: 399, original: 699, desc: '全功能全场景，团队级直播管理' },
]

// ─── Comparison table ────────────────────────────────────────────────────────

function ComparisonTable() {
  const headerCells = [
    { label: '权益对比', flex: true, isProLabel: false },
    { label: '基础版', width: PLAN_COL_W, isProLabel: false },
    { label: '专业版', width: PLAN_COL_W, isProLabel: true },
    { label: '旗舰版', width: PLAN_COL_W, isProLabel: false },
  ]

  return (
    <div style={{ border: '1px solid #E5E6EB', borderRadius: 10, overflow: 'hidden' }}>
      {/* Table header */}
      <div style={{ display: 'flex', background: '#F7F8FA', borderBottom: '1px solid #E5E6EB' }}>
        <div style={{ flex: 1, padding: '12px 16px', fontSize: 13, fontWeight: 600, color: C.textPrimary }}>
          权益对比
        </div>
        {(['基础版', '专业版', '旗舰版'] as const).map((label, i) => (
          <div key={label} style={{
            width: PLAN_COL_W,
            padding: '12px 8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 600,
            color: i === 1 ? PRO_COLOR : C.textPrimary,
            background: i === 1 ? PRO_BG : 'transparent',
            borderLeft: '1px solid #E5E6EB',
          }}>
            {label}
          </div>
        ))}
      </div>

      {/* Sections */}
      {GROUPED.map((section, si) => (
        <div key={si}>
          {/* Section title */}
          <div style={{
            padding: '10px 16px',
            fontSize: 13, fontWeight: 600, color: C.textPrimary,
            background: '#F7F8FA',
            borderTop: si > 0 ? '1px solid #E5E6EB' : undefined,
            borderBottom: '1px solid #E5E6EB',
          }}>
            {section.title}
          </div>

          {/* Groups */}
          {section.groups.map((group, gi) => (
            <div key={gi} style={{
              display: 'flex',
              borderBottom: gi < section.groups.length - 1 ? '1px solid #F0F1F5' : 'none',
            }}>
              {/* Group label */}
              {group.group !== null && (
                <div style={{
                  width: 120,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '10px 8px',
                  borderRight: '1px solid #F0F1F5',
                  flexShrink: 0,
                }}>
                  <span style={{ fontSize: 12, color: C.textPrimary, fontWeight: 500, textAlign: 'center' }}>
                    {group.group}
                  </span>
                </div>
              )}

              {/* Features */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {group.features.map((feat, fi) => (
                  <div key={fi} style={{
                    display: 'flex',
                    borderBottom: fi < group.features.length - 1 ? '1px solid #F0F1F5' : 'none',
                    minHeight: 44,
                  }}>
                    {/* Feature name */}
                    <div style={{
                      flex: 1,
                      padding: '10px 12px',
                      display: 'flex', alignItems: 'center',
                      fontSize: 12, color: '#4E5969',
                      borderRight: '1px solid #F0F1F5',
                    }}>
                      {feat.feature}
                    </div>
                    {/* Basic */}
                    <div style={{
                      width: PLAN_COL_W, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderRight: '1px solid #F0F1F5',
                    }}>
                      {renderCell(feat.basic)}
                    </div>
                    {/* Pro */}
                    <div style={{
                      width: PLAN_COL_W, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: PRO_BG,
                      borderRight: '1px solid #F0F1F5',
                    }}>
                      {renderCell(feat.pro, true)}
                    </div>
                    {/* Flagship */}
                    <div style={{
                      width: PLAN_COL_W, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {renderCell(feat.flagship)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

// ─── Subscription tab content ────────────────────────────────────────────────

function SubscriptionContent() {
  const periods = [
    { key: 'monthly', label: '月卡', active: true },
    { key: 'quarterly', label: '季卡', active: false },
    { key: 'annual', label: '年卡', active: false, badge: '性价比拉满' },
  ]

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px 48px' }}>
      {/* Period tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 28 }}>
        {periods.map(p => (
          <div key={p.key} style={{ position: 'relative' }}>
            <div style={{
              padding: '8px 28px',
              borderRadius: 24,
              fontSize: 14, fontWeight: 500,
              background: p.active ? PRIMARY : '#F2F3F5',
              color: p.active ? '#fff' : C.textTertiary,
              cursor: p.active ? 'default' : 'not-allowed',
              userSelect: 'none',
              transition: 'all 0.15s',
            }}>
              {p.label}
            </div>
            {p.badge && (
              <div style={{
                position: 'absolute', top: -8, right: -4,
                background: '#F43F5E', color: '#fff',
                fontSize: 9, fontWeight: 600,
                padding: '2px 6px', borderRadius: 8,
                whiteSpace: 'nowrap',
              }}>
                {p.badge}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Plan cards */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 36, alignItems: 'stretch' }}>
        {PLANS.map(plan => <PlanCard key={plan.id} plan={plan} />)}
      </div>

      {/* Comparison table */}
      <ComparisonTable />
    </div>
  )
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function BuyMembershipPage({ initialTab = 'subscription' }: { initialTab?: OuterTab }) {
  const [tab, setTab] = useState<OuterTab>(initialTab)

  const tabs: { key: OuterTab; label: string }[] = [
    { key: 'subscription', label: '会员订阅' },
    { key: 'addon', label: '伴播特惠包' },
  ]

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: '#fff', fontFamily: T.fonts.family,
    }}>
      {/* Outer tab bar */}
      <div style={{
        display: 'flex', gap: 0,
        borderBottom: '1px solid #E5E6EB',
        padding: '0 24px',
        flexShrink: 0,
      }}>
        {tabs.map(t => {
          const isActive = t.key === tab
          return (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: '0 4px',
              marginRight: 24,
              height: 44,
              fontSize: 14, fontWeight: isActive ? 600 : 400,
              color: isActive ? PRIMARY : C.textSecondary,
              background: 'transparent', border: 'none',
              borderBottom: isActive ? `2px solid ${PRIMARY}` : '2px solid transparent',
              cursor: 'pointer',
              fontFamily: T.fonts.family,
              transition: 'all 0.15s',
            }}>
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      {tab === 'subscription' ? (
        <SubscriptionContent />
      ) : (
        <BanboPurchasePage hideHeader />
      )}
    </div>
  )
}
