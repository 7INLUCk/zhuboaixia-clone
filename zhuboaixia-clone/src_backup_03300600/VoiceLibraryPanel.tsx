import React, { useState, useRef, useEffect } from 'react'

type Props = { onClose: () => void; onSwitchPanel?: (panel: 'avatar' | 'voice' | 'voiceSwitch' | 'autoChat' | 'sceneLayout') => void }

// ============ 数据模型 ============
type VoiceItem = {
  id: string
  name: string
  gender: 'male' | 'female'
  age: 'child' | 'adult'
  style: string
  duration: string
  color: string
}

// ============ 音色数据 ============
const VOICES: VoiceItem[] = [
  { id: 'v1', name: '甜心小姐姐', gender: 'female', age: 'adult', style: '甜美亲切', duration: '15s', color: '#FF6B9D' },
  { id: 'v2', name: '知性女主播', gender: 'female', age: 'adult', style: '专业沉稳', duration: '12s', color: '#C084FC' },
  { id: 'v3', name: '元气小女孩', gender: 'female', age: 'child', style: '活泼可爱', duration: '10s', color: '#F472B6' },
  { id: 'v4', name: '阳光大男孩', gender: 'male', age: 'adult', style: '热情爽朗', duration: '14s', color: '#60A5FA' },
  { id: 'v5', name: '磁性男声', gender: 'male', age: 'adult', style: '低沉有魅力', duration: '13s', color: '#818CF8' },
  { id: 'v6', name: '活力小男孩', gender: 'male', age: 'child', style: '调皮有趣', duration: '11s', color: '#34D399' },
]

// ============ 颜色系统 ============
const C = {
  blue: '#3370FF',
  blueLight: 'rgba(51,112,255,0.08)',
  green: '#00B42A',
  greenLight: 'rgba(0,180,42,0.08)',
  bg: '#F7F8FA',
  card: '#FFFFFF',
  text: '#1D2129',
  textSec: '#86909C',
  textTert: '#C9CDD4',
  border: '#E5E6EB',
  font: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif',
}

// ============ 播放按钮动画 ============
function PlayButton({ playing, onClick, color }: { playing: boolean; onClick: () => void; color: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 40, height: 40, borderRadius: '50%',
        background: playing ? color : `${color}15`,
        border: `2px solid ${color}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', transition: 'all 0.2s',
        flexShrink: 0,
      }}
    >
      {playing ? (
        <svg width="16" height="16" viewBox="0 0 16 16" fill={color === '#fff' ? '#fff' : color}>
          <rect x="3" y="2" width="4" height="12" rx="1" />
          <rect x="9" y="2" width="4" height="12" rx="1" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill={color}>
          <path d="M4 2.5v11l10-5.5z" />
        </svg>
      )}
    </button>
  )
}

// ============ 音色卡片 ============
function VoiceCard({ voice, selected, playing, onSelect, onPlay }: {
  voice: VoiceItem; selected: boolean; playing: boolean;
  onSelect: () => void; onPlay: () => void
}) {
  const genderLabel = voice.gender === 'female' ? '女' : '男'
  const ageLabel = voice.age === 'child' ? '童声' : '成人'

  return (
    <div
      onClick={onSelect}
      style={{
        padding: '12px 14px',
        borderRadius: 10,
        background: selected ? `${voice.color}08` : C.card,
        border: selected ? `1.5px solid ${voice.color}` : `1px solid ${C.border}`,
        cursor: 'pointer',
        transition: 'all 0.15s',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      {/* 音色色块标识 */}
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: `${voice.color}15`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, flexShrink: 0,
      }}>
        {voice.gender === 'female' ? '🎤' : '🎙'}
      </div>

      {/* 信息 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{voice.name}</span>
          {selected && (
            <span style={{
              fontSize: 10, padding: '1px 6px', borderRadius: 4,
              background: `${voice.color}20`, color: voice.color, fontWeight: 500,
            }}>已选</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: 11, padding: '2px 8px', borderRadius: 4,
            background: `${voice.color}12`, color: voice.color,
          }}>{genderLabel}·{ageLabel}</span>
          <span style={{ fontSize: 11, color: C.textSec }}>{voice.style}</span>
        </div>
      </div>

      {/* 试听按钮 */}
      <div onClick={(e) => { e.stopPropagation(); onPlay() }}>
        <PlayButton playing={playing} onClick={onPlay} color={voice.color} />
      </div>
    </div>
  )
}

export default function VoiceLibraryPanel({ onClose, onSwitchPanel }: Props) {
  const [selectedId, setSelectedId] = useState('v1')
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'female' | 'male'>('all')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 模拟试听：播放 3 秒后自动停止
  const handlePlay = (id: string) => {
    if (playingId === id) {
      setPlayingId(null)
      if (timerRef.current) clearTimeout(timerRef.current)
      return
    }
    setPlayingId(id)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setPlayingId(null), 3000)
  }

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  const filteredVoices = VOICES.filter(v => filter === 'all' || v.gender === filter)
  const selected = VOICES.find(v => v.id === selectedId) || VOICES[0]

  // 统计
  const femaleCount = VOICES.filter(v => v.gender === 'female').length
  const maleCount = VOICES.filter(v => v.gender === 'male').length
  const childCount = VOICES.filter(v => v.age === 'child').length

  return (
    <div style={{
      position: 'absolute',
      top: 36,
      right: 0,
      bottom: 0,
      width: 520,
      zIndex: 102,
      overflow: 'hidden',
      borderRadius: '8px 0 0 0',
      boxShadow: '-2px 0 16px rgba(0,0,0,0.15)',
      fontFamily: C.font,
      display: 'flex',
      flexDirection: 'column',
      background: C.bg,
    }}>
      {/* ===== 顶部：模块切换 Tab + 关闭 ===== */}
      <div style={{
        padding: '10px 16px',
        background: C.card,
        borderBottom: `1px solid ${C.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {[
            { key: 'avatar' as const, label: '🎭 伴播形象', active: false },
            { key: 'voice' as const, label: '🔊 伴播音色', active: true },
            { key: 'voiceSwitch' as const, label: '🎙 声控互动', active: false },
            { key: 'autoChat' as const, label: '💬 智能搭话', active: false },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => onSwitchPanel?.(tab.key)}
              style={{
                padding: '6px 16px',
                borderRadius: 6,
                border: 'none',
                fontSize: 13,
                fontWeight: tab.active ? 600 : 400,
                background: tab.active ? C.blueLight : 'transparent',
                color: tab.active ? C.blue : C.textSec,
                cursor: 'pointer',
                fontFamily: C.font,
                transition: 'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', fontSize: 18, color: C.textSec,
          cursor: 'pointer', padding: 4,
        }}>✕</button>
      </div>

      {/* ===== 筛选标签 ===== */}
      <div style={{
        padding: '10px 16px',
        background: C.card,
        borderBottom: `1px solid ${C.border}`,
        display: 'flex',
        gap: 8,
        flexShrink: 0,
      }}>
        {[
          { key: 'all' as const, label: '全部', count: VOICES.length },
          { key: 'female' as const, label: '女声', count: femaleCount },
          { key: 'male' as const, label: '男声', count: maleCount },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              padding: '5px 14px',
              borderRadius: 16,
              border: 'none',
              fontSize: 13,
              fontWeight: filter === tab.key ? 500 : 400,
              background: filter === tab.key ? C.blueLight : 'transparent',
              color: filter === tab.key ? C.blue : C.textSec,
              cursor: 'pointer',
              fontFamily: C.font,
            }}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* ===== 主体内容 ===== */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
        {/* 当前选中音色信息 */}
        <div style={{
          padding: '14px 16px',
          background: `linear-gradient(135deg, ${selected.color}12 0%, ${selected.color}05 100%)`,
          borderRadius: 12,
          marginBottom: 16,
          border: `1px solid ${selected.color}20`,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: `${selected.color}20`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24,
          }}>
            {selected.gender === 'female' ? '🎤' : '🎙'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 2 }}>
              {selected.name}
            </div>
            <div style={{ fontSize: 12, color: C.textSec }}>
              {selected.gender === 'female' ? '女声' : '男声'} · {selected.age === 'child' ? '童声' : '成人'} · {selected.style}
            </div>
          </div>
          <PlayButton
            playing={playingId === selected.id}
            onClick={() => handlePlay(selected.id)}
            color={selected.color}
          />
        </div>

        {/* 分类标题：女声 */}
        {filteredVoices.some(v => v.gender === 'female') && (
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8, marginTop: 4 }}>
            👩 女声
            <span style={{ fontSize: 11, fontWeight: 400, color: C.textSec, marginLeft: 6 }}>
              甜美 / 知性 / 活泼
            </span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {filteredVoices.filter(v => v.gender === 'female').map(voice => (
            <VoiceCard
              key={voice.id}
              voice={voice}
              selected={selectedId === voice.id}
              playing={playingId === voice.id}
              onSelect={() => setSelectedId(voice.id)}
              onPlay={() => handlePlay(voice.id)}
            />
          ))}
        </div>

        {/* 分类标题：男声 */}
        {filteredVoices.some(v => v.gender === 'male') && (
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8 }}>
            👨 男声
            <span style={{ fontSize: 11, fontWeight: 400, color: C.textSec, marginLeft: 6 }}>
              阳光 / 磁性 / 活力
            </span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filteredVoices.filter(v => v.gender === 'male').map(voice => (
            <VoiceCard
              key={voice.id}
              voice={voice}
              selected={selectedId === voice.id}
              playing={playingId === voice.id}
              onSelect={() => setSelectedId(voice.id)}
              onPlay={() => handlePlay(voice.id)}
            />
          ))}
        </div>

        {/* 年龄分布提示 */}
        <div style={{
          marginTop: 16,
          padding: '10px 14px',
          background: '#F7F8FA',
          borderRadius: 8,
          border: `1px solid ${C.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}>
          <div style={{ fontSize: 11, color: C.textSec }}>年龄分布</div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>{VOICES.filter(v => v.age === 'adult').length}</div>
              <div style={{ fontSize: 10, color: C.textSec }}>成人</div>
            </div>
            <div style={{ width: 1, background: C.border }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>{childCount}</div>
              <div style={{ fontSize: 10, color: C.textSec }}>童声</div>
            </div>
          </div>
        </div>

        {/* 添加音色提示 */}
        <div style={{
          marginTop: 12,
          padding: '14px',
          borderRadius: 8,
          border: `1.5px dashed ${C.border}`,
          textAlign: 'center',
          cursor: 'pointer',
        }}>
          <span style={{ fontSize: 18, color: C.textTert }}>🎤</span>
          <div style={{ fontSize: 12, color: C.textSec, marginTop: 4 }}>需要更多音色？</div>
          <div style={{ fontSize: 11, color: C.blue, marginTop: 2 }}>联系客服定制专属音色 →</div>
        </div>
      </div>

      {/* ===== 底部操作栏 ===== */}
      <div style={{
        padding: '12px 16px',
        background: C.card,
        borderTop: `1px solid ${C.border}`,
        display: 'flex',
        gap: 10,
        flexShrink: 0,
      }}>
        <button onClick={onClose} style={{
          flex: 1, height: 42, borderRadius: 8,
          background: 'transparent', border: `1px solid ${C.border}`,
          color: C.textSec, fontSize: 14, cursor: 'pointer',
          fontFamily: C.font,
        }}>
          取消
        </button>
        <button style={{
          flex: 2, height: 42, borderRadius: 8,
          background: C.blue, border: 'none',
          color: '#fff', fontSize: 14, fontWeight: 600,
          cursor: 'pointer', fontFamily: C.font,
          boxShadow: '0 2px 8px rgba(51,112,255,0.3)',
        }}>
          确认配置
        </button>
      </div>
    </div>
  )
}
