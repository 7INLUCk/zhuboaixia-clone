import React, { useState } from 'react'
import { tokens } from './tokens'
import CanvasPanel from './CanvasPanel'

type Props = { onNavigate: (page: any) => void }
const T = tokens

// ====== Mock 数据 ======
const PRODUCTS = [
  { id: 'p1', name: '有机冷榨椰子油500ml', price: 68, stock: 523, status: '在售' },
  { id: 'p2', name: '玻尿酸补水面膜10片装', price: 39.9, stock: 1280, status: '在售' },
  { id: 'p3', name: '纯棉宽松T恤男款', price: 89, stock: 0, status: '缺货' },
  { id: 'p4', name: '无线蓝牙耳机降噪款', price: 199, stock: 347, status: '在售' },
  { id: 'p5', name: '坚果礼盒年货装1.2kg', price: 99, stock: 89, status: '在售' },
  { id: 'p6', name: '氨基酸洁面乳温和型', price: 49.9, stock: 2100, status: '在售' },
]

const COMMENTS = [
  { id: 'c1', user: '小红花', content: '这个面膜好用吗？敏感肌能用吗', time: '2分钟前' },
  { id: 'c2', user: '爱吃坚果', content: '礼盒里面有什么？有腰果吗', time: '3分钟前' },
  { id: 'c3', user: '数码控', content: '耳机降噪效果怎么样', time: '5分钟前' },
  { id: 'c4', user: '穿搭达人', content: 'T恤有其他颜色吗', time: '6分钟前' },
  { id: 'c5', user: '省钱小能手', content: '有没有优惠券啊', time: '8分钟前' },
]

// ====== Toggle 组件 ======
function Toggle({ checked, onChange, small }: { checked: boolean; onChange: (v: boolean) => void; small?: boolean }) {
  const [hov, setHov] = useState(false)
  const w = small ? 32 : 40
  const h = small ? 18 : 22
  const d = small ? 14 : 18
  return (
    <div
      onClick={() => onChange(!checked)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: w, height: h, borderRadius: h / 2,
        background: checked ? '#5850EC' : (hov ? '#C9CDD4' : '#E5E6EB'),
        cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0,
      }}
    >
      <div style={{
        width: d, height: d, borderRadius: '50%', background: '#fff',
        position: 'absolute', top: (h - d) / 2,
        left: checked ? w - d - (h - d) / 2 : (h - d) / 2,
        transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </div>
  )
}

// ====== 左侧：抖音中控台模拟 ======
function DouyinControlPanel() {
  const [activeMenu, setActiveMenu] = useState('products')
  const menuItems = [
    { key: 'products', icon: '📦', label: '商品管理' },
    { key: 'live', icon: '📺', label: '直播管理' },
    { key: 'data', icon: '📊', label: '数据中心' },
    { key: 'fans', icon: '👥', label: '粉丝运营' },
  ]

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#F5F6F7', overflow: 'hidden' }}>
      {/* 顶栏 */}
      <div style={{
        height: 48, background: '#fff', display: 'flex', alignItems: 'center',
        padding: '0 16px', justifyContent: 'space-between',
        borderBottom: '1px solid #E5E6EB', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#1D2129' }}>🎵 抖音电商</span>
          <span style={{ fontSize: 12, color: '#86909C' }}>直播中控台</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: '#86909C' }}>178******311</span>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#E5E6EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>👤</div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* 左侧菜单 */}
        <div style={{ width: 140, background: '#fff', borderRight: '1px solid #E5E6EB', padding: '8px 0' }}>
          {menuItems.map(m => (
            <div key={m.key} onClick={() => setActiveMenu(m.key)} style={{
              height: 40, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 8,
              cursor: 'pointer', fontSize: 13,
              color: activeMenu === m.key ? '#5850EC' : '#4E5969',
              background: activeMenu === m.key ? '#F2F3FF' : 'transparent',
              borderLeft: activeMenu === m.key ? '3px solid #5850EC' : '3px solid transparent',
              fontWeight: activeMenu === m.key ? 500 : 400,
            }}>
              <span>{m.icon}</span><span>{m.label}</span>
            </div>
          ))}
        </div>

        {/* 右侧内容 */}
        <div style={{ flex: 1, padding: 16, overflow: 'auto' }}>
          {activeMenu === 'products' && (
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#1D2129' }}>商品列表</div>
              <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #E5E6EB', overflow: 'hidden' }}>
                <div style={{
                  display: 'grid', gridTemplateColumns: '2fr 0.8fr 0.6fr 0.6fr 0.8fr',
                  padding: '10px 14px', fontSize: 12, color: '#86909C', background: '#FAFAFB',
                  borderBottom: '1px solid #E5E6EB', fontWeight: 500,
                }}>
                  <span>商品名称</span><span>价格</span><span>库存</span><span>状态</span><span>操作</span>
                </div>
                {PRODUCTS.map(p => (
                  <div key={p.id} style={{
                    display: 'grid', gridTemplateColumns: '2fr 0.8fr 0.6fr 0.6fr 0.8fr',
                    padding: '10px 14px', fontSize: 12, color: '#1D2129',
                    borderBottom: '1px solid #F2F3F5', alignItems: 'center',
                  }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                    <span style={{ color: '#F53F3F', fontWeight: 600 }}>¥{p.price}</span>
                    <span>{p.stock}</span>
                    <span style={{ color: p.status === '缺货' ? '#F53F3F' : '#00B42A', fontSize: 11 }}>{p.status}</span>
                    <span style={{ color: '#5850EC', cursor: 'pointer', fontSize: 11 }}>编辑</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeMenu === 'live' && (
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#1D2129' }}>直播间信息</div>
              <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #E5E6EB', padding: 20 }}>
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                  {[
                    { label: '直播间', value: '美妆专场·每周三福利夜', color: '#1D2129' },
                    { label: '状态', value: '● 直播中', color: '#F53F3F' },
                    { label: '开播时间', value: '2026-03-29 20:00', color: '#1D2129' },
                    { label: '观看人数', value: '1,283', color: '#1D2129' },
                    { label: '在线人数', value: '156', color: '#1D2129' },
                    { label: '已售商品', value: '87件', color: '#F53F3F' },
                  ].map((item, i) => (
                    <div key={i} style={{ minWidth: 140 }}>
                      <div style={{ fontSize: 11, color: '#86909C', marginBottom: 4 }}>{item.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: item.color }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {activeMenu === 'data' && (
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#1D2129' }}>今日数据</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                {[
                  { label: '今日观看', value: '1,283', icon: '👁', color: '#5850EC' },
                  { label: '新增粉丝', value: '+47', icon: '👥', color: '#00B42A' },
                  { label: '成交额', value: '¥8,932', icon: '💰', color: '#F53F3F' },
                  { label: '转化率', value: '6.8%', icon: '📈', color: '#FF7D00' },
                ].map((d, i) => (
                  <div key={i} style={{ background: '#fff', borderRadius: 8, border: '1px solid #E5E6EB', padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 20 }}>{d.icon}</span>
                      <span style={{ fontSize: 20, fontWeight: 700, color: d.color }}>{d.value}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#86909C' }}>{d.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeMenu === 'fans' && (
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#1D2129' }}>粉丝评论</div>
              {COMMENTS.map(c => (
                <div key={c.id} style={{
                  background: '#fff', borderRadius: 8, border: '1px solid #E5E6EB',
                  padding: '10px 14px', marginBottom: 8,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#1D2129' }}>{c.user}</span>
                    <span style={{ fontSize: 11, color: '#C9CDD4' }}>{c.time}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#4E5969' }}>{c.content}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ====== 右侧：伴播面板 ======
function BanboSidePanel() {
  const [activeTab, setActiveTab] = useState('avatar')
  const [scene, setScene] = useState(0)
  const [isLive, setIsLive] = useState(false)
  // 形象
  const [selectedAvatar, setSelectedAvatar] = useState('a1')
  const [selectedVoice, setSelectedVoice] = useState('v1')
  const [speed, setSpeed] = useState(50)
  const [volume, setVolume] = useState(70)
  // 互动
  const [welcomeOn, setWelcomeOn] = useState(true)
  const [chatOn, setChatOn] = useState(true)
  const [replyOn, setReplyOn] = useState(false)
  const [qaOn, setQaOn] = useState(true)
  // 动作
  const [voiceSwitchOn, setVoiceSwitchOn] = useState(true)
  const [costumeOn, setCostumeOn] = useState(false)
  const [showcaseOn, setShowcaseOn] = useState(true)
  // 营销
  const [couponOn, setCouponOn] = useState(false)
  const [luckyBagOn, setLuckyBagOn] = useState(false)
  const [popOn, setPopOn] = useState(true)
  // 设置
  const [aiMode, setAiMode] = useState(true)
  const [autoStart, setAutoStart] = useState(false)
  const [sensitivity, setSensitivity] = useState(70)
  const [delay, setDelay] = useState(3)

  const scenes = [
    { name: '电商风', bg: 'linear-gradient(180deg, #FFE0EB 0%, #FF6B9D 100%)' },
    { name: '简约风', bg: 'linear-gradient(180deg, #E8E8E8 0%, #999 100%)' },
    { name: '温馨风', bg: 'linear-gradient(180deg, #FFF3E0 0%, #FFB74D 100%)' },
  ]

  const avatars = [
    { id: 'a1', name: '暖暖', emoji: '🌸', color: '#FFB3D9', type: '公共' },
    { id: 'a2', name: '闪闪', emoji: '⚡', color: '#FFD591', type: '公共' },
    { id: 'a3', name: '专业帝', emoji: '🎯', color: '#B3D4FF', type: '公共' },
    { id: 'a4', name: '定制形象', emoji: '✨', color: '#E8D5FF', type: '定制' },
  ]

  const voices = [
    { id: 'v1', name: '温柔女声', tag: '推荐', gender: '女' },
    { id: 'v2', name: '活力男声', tag: '', gender: '男' },
    { id: 'v3', name: '知性女声', tag: '', gender: '女' },
    { id: 'v4', name: '磁性男声', tag: '', gender: '男' },
  ]

  const tabs = [
    { key: 'avatar', icon: '🎭', label: '形象' },
    { key: 'interact', icon: '💬', label: '互动' },
    { key: 'action', icon: '🎬', label: '动作' },
    { key: 'market', icon: '🎫', label: '营销' },
    { key: 'settings', icon: '⚙️', label: '设置' },
  ]

  const scrollStyle: React.CSSProperties = { flex: 1, overflow: 'auto', padding: '10px 12px' }
  const sectionTitle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: '#C9CDD4', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }
  const rowStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }
  const labelStyle: React.CSSProperties = { fontSize: 12, color: '#fff' }
  const subLabelStyle: React.CSSProperties = { fontSize: 10, color: '#86909C', marginTop: 1 }

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', background: '#1a1a2e', color: '#fff', fontFamily: T.fonts.family }}>
      {/* 预览区 */}
      <div style={{ padding: '12px 12px 0' }}>
        <div style={{
          position: 'relative', width: '100%', paddingTop: '177.8%',
          borderRadius: 10, overflow: 'hidden',
          background: scenes[scene].bg,
        }}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 12 }}>
            {/* 状态 */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: isLive ? '#F53F3F' : '#FF7D00', color: '#fff' }}>
                {isLive ? '● 直播中' : '待开播'}
              </span>
            </div>
            {/* 形象 */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: 48 }}>{avatars.find(a => a.id === selectedAvatar)?.emoji || '🌸'}</div>
            </div>
            {/* 场景模板 */}
            <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
              {scenes.map((s, i) => (
                <button key={i} onClick={() => setScene(i)} style={{
                  padding: '3px 8px', borderRadius: 4, fontSize: 10, border: 'none',
                  background: scene === i ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
                  color: '#fff', cursor: 'pointer',
                }}>{s.name}</button>
              ))}
            </div>
          </div>
        </div>
        {/* 启动按钮 */}
        <button onClick={() => setIsLive(!isLive)} style={{
          width: '100%', padding: '10px 0', borderRadius: 8, border: 'none',
          background: isLive ? '#F53F3F' : '#00B42A', color: '#fff',
          fontSize: 14, fontWeight: 600, cursor: 'pointer', marginTop: 10,
        }}>{isLive ? '⏹ 停止伴播' : '▶ 启动伴播'}</button>
      </div>

      {/* Tab 栏 */}
      <div style={{ display: 'flex', borderTop: '1px solid #2a2a4a', borderBottom: '1px solid #2a2a4a', marginTop: 8 }}>
        {tabs.map(t => (
          <div key={t.key} onClick={() => setActiveTab(t.key)} style={{
            flex: 1, padding: '8px 0', textAlign: 'center', cursor: 'pointer',
            fontSize: 11, color: activeTab === t.key ? '#fff' : '#666',
            background: activeTab === t.key ? '#2a2a4a' : 'transparent',
            borderBottom: activeTab === t.key ? '2px solid #5850EC' : '2px solid transparent',
          }}>
            <div style={{ fontSize: 16 }}>{t.icon}</div>
            <div>{t.label}</div>
          </div>
        ))}
      </div>

      {/* Tab 内容 */}
      <div style={scrollStyle}>
        {activeTab === 'avatar' && (
          <div>
            <div style={sectionTitle}>伴播形象</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6, marginBottom: 12 }}>
              {avatars.map(a => (
                <div key={a.id} onClick={() => setSelectedAvatar(a.id)} style={{
                  padding: '10px 8px', borderRadius: 8, textAlign: 'center', cursor: 'pointer',
                  border: `2px solid ${selectedAvatar === a.id ? '#D3ADF7' : '#2a2a4a'}`,
                  background: selectedAvatar === a.id ? 'rgba(114,46,209,0.2)' : 'rgba(255,255,255,0.05)',
                }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>{a.emoji}</div>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{a.name}</div>
                  <div style={{ fontSize: 9, color: a.type === '定制' ? '#FF7D00' : '#86909C', marginTop: 2 }}>{a.type}</div>
                </div>
              ))}
            </div>
            <div style={sectionTitle}>声音</div>
            {voices.map(v => (
              <div key={v.id} onClick={() => setSelectedVoice(v.id)} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                borderRadius: 6, marginBottom: 4, cursor: 'pointer',
                background: selectedVoice === v.id ? 'rgba(88,80,236,0.2)' : 'transparent',
                border: `1px solid ${selectedVoice === v.id ? '#5850EC' : 'transparent'}`,
              }}>
                <span style={{ fontSize: 12, flex: 1 }}>{v.name}</span>
                {v.tag && <span style={{ fontSize: 9, padding: '1px 4px', borderRadius: 3, background: '#00B42A', color: '#fff' }}>{v.tag}</span>}
                <span style={{ fontSize: 10, color: '#86909C' }}>{v.gender}</span>
                <span style={{ fontSize: 12, cursor: 'pointer' }}>▶</span>
              </div>
            ))}
            <div style={{ marginTop: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#86909C', marginBottom: 4 }}>
                <span>语速</span><span>{speed < 33 ? '偏慢' : speed > 66 ? '偏快' : '适中'}</span>
              </div>
              <input type="range" min={0} max={100} value={speed} onChange={e => setSpeed(+e.target.value)} style={{ width: '100%', accentColor: '#5850EC' }} />
            </div>
            <div style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#86909C', marginBottom: 4 }}>
                <span>音量</span><span>{volume < 33 ? '偏小' : volume > 66 ? '偏大' : '适中'}</span>
              </div>
              <input type="range" min={0} max={100} value={volume} onChange={e => setVolume(+e.target.value)} style={{ width: '100%', accentColor: '#5850EC' }} />
            </div>
          </div>
        )}

        {activeTab === 'interact' && (
          <div>
            <div style={sectionTitle}>互动规则</div>
            <div style={rowStyle}>
              <div><div style={labelStyle}>欢迎感谢</div><div style={subLabelStyle}>观众进入时自动欢迎</div></div>
              <Toggle checked={welcomeOn} onChange={setWelcomeOn} small />
            </div>
            {welcomeOn && (
              <div style={{ marginBottom: 10, padding: '6px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: 6 }}>
                <div style={{ fontSize: 10, color: '#86909C', marginBottom: 4 }}>欢迎文案</div>
                <div style={{ fontSize: 11, color: '#C9CDD4' }}>欢迎来到直播间！喜欢的宝宝点点关注~</div>
              </div>
            )}
            <div style={rowStyle}>
              <div><div style={labelStyle}>搭话互动</div><div style={subLabelStyle}>AI自动回复评论</div></div>
              <Toggle checked={chatOn} onChange={setChatOn} small />
            </div>
            {chatOn && (
              <div style={{ marginBottom: 10, padding: '6px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: 6 }}>
                <div style={{ fontSize: 10, color: '#86909C', marginBottom: 4 }}>回复频率</div>
                <div style={{ fontSize: 11, color: '#C9CDD4' }}>每条评论间隔 5 秒回复</div>
              </div>
            )}
            <div style={rowStyle}>
              <div><div style={labelStyle}>发评回评</div><div style={subLabelStyle}>自动发好评引导</div></div>
              <Toggle checked={replyOn} onChange={setReplyOn} small />
            </div>
            <div style={rowStyle}>
              <div><div style={labelStyle}>问答管理</div><div style={subLabelStyle}>关键词自动回复</div></div>
              <Toggle checked={qaOn} onChange={setQaOn} small />
            </div>
            {qaOn && (
              <div style={{ marginBottom: 10, padding: '6px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: 6 }}>
                <div style={{ fontSize: 10, color: '#86909C', marginBottom: 4 }}>已配置规则</div>
                <div style={{ fontSize: 11, color: '#C9CDD4' }}>• 「价格」→ 回复价格信息<br/>• 「发货」→ 回复物流信息<br/>• 「优惠」→ 推送优惠券</div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'action' && (
          <div>
            <div style={sectionTitle}>动作触发</div>
            <div style={rowStyle}>
              <div><div style={labelStyle}>声控切品</div><div style={subLabelStyle}>主播说话自动切换商品</div></div>
              <Toggle checked={voiceSwitchOn} onChange={setVoiceSwitchOn} small />
            </div>
            <div style={rowStyle}>
              <div><div style={labelStyle}>换装转场</div><div style={subLabelStyle}>讲解时伴播形象换装展示</div></div>
              <Toggle checked={costumeOn} onChange={setCostumeOn} small />
            </div>
            {costumeOn && (
              <div style={{ marginBottom: 10, padding: '6px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: 6 }}>
                <div style={{ fontSize: 10, color: '#86909C', marginBottom: 4 }}>可用动作</div>
                {['转圈换装', '展示手势', '拿起商品', '比心推荐'].map((a, i) => (
                  <div key={i} style={{ fontSize: 11, color: '#C9CDD4', padding: '3px 0', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{a}</span><span style={{ color: '#5850EC', cursor: 'pointer', fontSize: 10 }}>配置</span>
                  </div>
                ))}
              </div>
            )}
            <div style={rowStyle}>
              <div><div style={labelStyle}>商品展示</div><div style={subLabelStyle}>讲解时弹出商品卡片</div></div>
              <Toggle checked={showcaseOn} onChange={setShowcaseOn} small />
            </div>
          </div>
        )}

        {activeTab === 'market' && (
          <div>
            <div style={sectionTitle}>营销工具</div>
            <div style={rowStyle}>
              <div><div style={labelStyle}>发优惠券</div><div style={subLabelStyle}>定时自动弹出优惠券</div></div>
              <Toggle checked={couponOn} onChange={setCouponOn} small />
            </div>
            {couponOn && (
              <div style={{ marginBottom: 10, padding: '6px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: 6 }}>
                <div style={{ fontSize: 10, color: '#86909C', marginBottom: 4 }}>券信息</div>
                <div style={{ fontSize: 11, color: '#C9CDD4' }}>满99减10 · 每15分钟弹出一次</div>
              </div>
            )}
            <div style={rowStyle}>
              <div><div style={labelStyle}>发福袋</div><div style={subLabelStyle}>定时发福袋抽奖</div></div>
              <Toggle checked={luckyBagOn} onChange={setLuckyBagOn} small />
            </div>
            {luckyBagOn && (
              <div style={{ marginBottom: 10, padding: '6px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: 6 }}>
                <div style={{ fontSize: 10, color: '#86909C', marginBottom: 4 }}>发放频率</div>
                <div style={{ fontSize: 11, color: '#C9CDD4' }}>每30分钟发一次，每次5个</div>
              </div>
            )}
            <div style={rowStyle}>
              <div><div style={labelStyle}>弹品</div><div style={subLabelStyle}>自动弹出当前讲解商品</div></div>
              <Toggle checked={popOn} onChange={setPopOn} small />
            </div>
            {popOn && (
              <div style={{ marginBottom: 10, padding: '6px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: 6 }}>
                <div style={{ fontSize: 10, color: '#86909C', marginBottom: 4 }}>弹品频率</div>
                <div style={{ fontSize: 11, color: '#C9CDD4' }}>每讲解完一个商品自动弹出</div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <div style={sectionTitle}>高级设置</div>
            <div style={rowStyle}>
              <div><div style={labelStyle}>AI智能互动</div><div style={subLabelStyle}>自动识别评论意图</div></div>
              <Toggle checked={aiMode} onChange={setAiMode} small />
            </div>
            <div style={rowStyle}>
              <div><div style={labelStyle}>自动开播</div><div style={subLabelStyle}>直播间开启后自动运行</div></div>
              <Toggle checked={autoStart} onChange={setAutoStart} small />
            </div>
            <div style={{ marginTop: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#86909C', marginBottom: 4 }}>
                <span>互动灵敏度</span><span>{sensitivity < 33 ? '低' : sensitivity > 66 ? '高' : '中'}</span>
              </div>
              <input type="range" min={0} max={100} value={sensitivity} onChange={e => setSensitivity(+e.target.value)} style={{ width: '100%', accentColor: '#5850EC' }} />
              <div style={{ fontSize: 10, color: '#666', marginTop: 2 }}>灵敏度越高，伴播响应越频繁</div>
            </div>
            <div style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#86909C', marginBottom: 4 }}>
                <span>互动延迟</span><span>{delay}秒</span>
              </div>
              <input type="range" min={0} max={10} value={delay} onChange={e => setDelay(+e.target.value)} style={{ width: '100%', accentColor: '#5850EC' }} />
              <div style={{ fontSize: 10, color: '#666', marginTop: 2 }}>伴播收到指令后的响应延迟</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ====== 主页面 ======
export default function BanboPanelPage({ onNavigate }: Props) {
  const [panelOpen, setPanelOpen] = useState(true)

  return (
    <div style={{ position: 'relative', height: '100%', fontFamily: T.fonts.family, overflow: 'hidden' }}>
      {/* 抖音中控台（全宽） */}
      <DouyinControlPanel />

      {/* 展开/收起按钮 */}
      <div
        onClick={() => setPanelOpen(!panelOpen)}
        style={{
          position: 'absolute', top: 56, right: panelOpen ? 380 : 0,
          width: 36, height: 36, borderRadius: '8px 0 0 8px',
          background: '#5850EC', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', zIndex: 20, fontSize: 16,
          boxShadow: '-2px 0 8px rgba(0,0,0,0.15)',
          transition: 'right 0.3s',
        }}
        title={panelOpen ? '收起伴播面板' : '展开伴播面板'}
      >
        {panelOpen ? '▶' : '◀'}
      </div>

      {/* 伴播面板（覆盖在右侧，可收起） */}
      <div style={{
        position: 'absolute', top: 0, right: 0, bottom: 0,
        width: panelOpen ? 380 : 0,
        overflow: 'hidden',
        transition: 'width 0.3s ease',
        boxShadow: panelOpen ? '-4px 0 20px rgba(0,0,0,0.2)' : 'none',
        zIndex: 15,
      }}>
        {panelOpen && <CanvasPanel onClose={() => setPanelOpen(false)} />}
      </div>
    </div>
  )
}
