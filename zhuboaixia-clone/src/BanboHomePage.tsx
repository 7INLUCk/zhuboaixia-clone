import React from 'react'
import { tokens } from './tokens'

type Props = { onNavigate: (page: any) => void }

const T = tokens

const mockRooms = [
  {
    id: 'r1', name: 'Leoooooo!', platform: '巨量百应', type: '抖音达人版',
    status: 'live' as const, avatar: '暖暖', avatarEmoji: '🌸',
    createTime: '2026-03-28 17:30:13', id_code: 'ID:257897',
    gradient: 'linear-gradient(180deg, #E8E8E8 0%, #C0C0C0 50%, #999 100%)',
  },
  {
    id: 'r2', name: '小米数码旗舰店', platform: '巨量百应', type: '抖音达人版',
    status: 'scheduled' as const, avatar: '专业帝', avatarEmoji: '🎯',
    createTime: '2026-03-28 14:22:05', id_code: 'ID:257901',
    gradient: 'linear-gradient(180deg, #D5E8D4 0%, #A8D5BA 50%, #7BC4A0 100%)',
  },
  {
    id: 'r3', name: '暖暖美妆直播间', platform: '抖音本地生活', type: '本地生活版',
    status: 'ended' as const, avatar: '暖暖', avatarEmoji: '🌸',
    createTime: '2026-03-27 20:15:30', id_code: 'ID:257845',
    gradient: 'linear-gradient(180deg, #FFE0EB 0%, #FFB3D9 50%, #FF8CC6 100%)',
  },
]

const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
  live: { label: '直播中', bg: '#F53F3F', color: '#fff' },
  scheduled: { label: '待开播', bg: '#FF7D00', color: '#fff' },
  ended: { label: '已结束', bg: '#86909C', color: '#fff' },
}

export default function BanboHomePage({ onNavigate }: Props) {
  const [hovRefresh, setHovRefresh] = React.useState(false)
  const [hovCreate, setHovCreate] = React.useState(false)

  return (
    <div style={{ fontFamily: T.fonts.family, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 顶栏：对齐参考图 */}
      <div style={{
        padding: '16px 20px 14px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: `1px solid ${T.colors.border}`,
      }}>
        {/* 左侧：标题+副标题 */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{
            fontSize: 16, fontWeight: 700, color: T.colors.textPrimary,
            borderLeft: `3px solid ${T.colors.primary}`, paddingLeft: 8,
          }}>AI 伴播</span>
          <span style={{ fontSize: 12, color: T.colors.textTertiary }}>
            AI伴播形象与真人主播同屏互动，让直播间更有温度
          </span>
        </div>
        {/* 右侧：刷新 + 创建按钮 */}
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button
            onMouseEnter={() => setHovRefresh(true)}
            onMouseLeave={() => setHovRefresh(false)}
            style={{
              padding: '7px 16px', borderRadius: 6, fontSize: 13, fontWeight: 400,
              border: `1px solid ${T.colors.border}`,
              background: hovRefresh ? '#F7F8FA' : '#fff',
              color: T.colors.textPrimary, cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >刷新</button>
          <button
            onClick={() => onNavigate('banbo-create')}
            onMouseEnter={() => setHovCreate(true)}
            onMouseLeave={() => setHovCreate(false)}
            style={{
              padding: '7px 16px', borderRadius: 6, fontSize: 13, fontWeight: 500,
              border: 'none',
              background: hovCreate ? T.colors.primaryHover : T.colors.primary,
              color: '#fff', cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >创建伴播直播间</button>
        </div>
      </div>

      {/* 卡片区 */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 16,
        }}>
          {mockRooms.map(room => {
            const st = statusConfig[room.status]
            return (
              <div
                key={room.id}
                onClick={() => onNavigate(room.status === 'live' ? 'banbo-dashboard' : 'banbo-avatar')}
                style={{
                  borderRadius: 8, overflow: 'hidden',
                  border: `1px solid ${T.colors.border}`,
                  background: '#fff', cursor: 'pointer',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  transition: 'box-shadow 0.2s, transform 0.2s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)'
                  ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'
                  ;(e.currentTarget as HTMLElement).style.transform = 'none'
                }}
              >
                {/* 预览区：9:16 比例 */}
                <div style={{
                  position: 'relative',
                  paddingTop: '177.8%', // 9:16 = 177.8%
                  background: room.gradient,
                }}>
                  {/* 绝对定位内容层 */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', flexDirection: 'column',
                    justifyContent: 'space-between', padding: 10,
                  }}>
                    {/* 左上：状态标签 */}
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{
                        fontSize: 11, padding: '3px 8px', borderRadius: 4,
                        background: st.bg, color: st.color, fontWeight: 500,
                      }}>{st.label}</span>
                      <span style={{
                        fontSize: 14, cursor: 'pointer', opacity: 0.4,
                      }} onClick={e => e.stopPropagation()}>🗑</span>
                    </div>

                    {/* 中间：伴播形象 */}
                    <div style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <div style={{
                        width: 64, height: 64, borderRadius: '50%',
                        background: 'rgba(255,255,255,0.3)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 32,
                      }}>{room.avatarEmoji}</div>
                    </div>

                    {/* 底部：平台+ID */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        fontSize: 10, padding: '2px 6px', borderRadius: 3,
                        background: 'rgba(0,0,0,0.5)', color: '#fff',
                      }}>{room.type}</span>
                      <span style={{ fontSize: 10, color: '#fff', fontWeight: 500 }}>{room.id_code}</span>
                    </div>
                  </div>
                </div>

                {/* 信息区 */}
                <div style={{ padding: '8px 10px' }}>
                  <div style={{
                    fontSize: 13, fontWeight: 600, color: T.colors.textPrimary,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    marginBottom: 3,
                  }}>{room.name}</div>
                  <div style={{ fontSize: 11, color: T.colors.textTertiary }}>
                    创建时间：{room.createTime}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* 底部提示 */}
        <div style={{
          textAlign: 'center', padding: '20px 0 8px',
          fontSize: 12, color: T.colors.textTertiary,
        }}>没有更多数据了</div>
      </div>
    </div>
  )
}
