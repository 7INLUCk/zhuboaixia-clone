import { TabBar, PanelKey } from './shared'
import React, { useState, useRef, useEffect } from 'react'

type Props = { onClose: () => void; onSwitchPanel?: (p: PanelKey) => void }

// ============ 数据模型 ============
type VoiceItem = {
  id: string
  name: string
  gender: 'male' | 'female'
  age: 'child' | 'adult'
  style: string
  tags: string[]
  color: string
}

// ============ 音色数据 ============
const VOICES: VoiceItem[] = [
  { id: 'v1', name: '甜心小姐姐', gender: 'female', age: 'adult', style: '甜美亲切', tags: ['甜美', '亲切'], color: '#FF6B9D' },
  { id: 'v2', name: '知性女主播', gender: 'female', age: 'adult', style: '专业沉稳', tags: ['商务', '专业'], color: '#C084FC' },
  { id: 'v3', name: '元气小女孩', gender: 'female', age: 'child', style: '活泼可爱', tags: ['活泼', '可爱'], color: '#F472B6' },
  { id: 'v4', name: '阳光大男孩', gender: 'male', age: 'adult', style: '热情爽朗', tags: ['阳光', '爽朗'], color: '#60A5FA' },
  { id: 'v5', name: '磁性男声', gender: 'male', age: 'adult', style: '低沉有魅力', tags: ['磁性', '成熟'], color: '#818CF8' },
  { id: 'v6', name: '活力小男孩', gender: 'male', age: 'child', style: '调皮有趣', tags: ['活力', '有趣'], color: '#34D399' },
]

// 模拟：当前动作素材绑定的音色（实际从上游读取，这里假设动作素材用的是"甜心小姐姐"）
const LOCKED_VOICE_ID = 'v1'
const LOCKED_REASON = '当前动作素材使用「甜心小姐姐」录制，音色已锁定'

// ============ 颜色系统 ============
const C = {
  blue: '#3370FF', blueLight: 'rgba(51,112,255,0.08)',
  green: '#00B42A', greenLight: 'rgba(0,180,42,0.08)',
  orange: '#FF7D00', orangeLight: 'rgba(255,125,0,0.08)',
  red: '#F53F3F',
  bg: '#F7F8FA', card: '#FFFFFF',
  text: '#1D2129', textSec: '#86909C', textTert: '#C9CDD4',
  border: '#E5E6EB',
  font: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif',
}

// ============ 播放按钮 ============
function PlayButton({ playing, onClick, color, size }: { playing: boolean; onClick: () => void; color: string; size?: number }) {
  const s = size || 36
  return (
    <button onClick={onClick} style={{
      width: s, height: s, borderRadius: '50%',
      background: playing ? color : `${color}12`,
      border: `1.5px solid ${color}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0,
    }}>
      {playing ? (
        <svg width={s * 0.4} height={s * 0.4} viewBox="0 0 16 16" fill={color}>
          <rect x="3" y="2" width="4" height="12" rx="1" />
          <rect x="9" y="2" width="4" height="12" rx="1" />
        </svg>
      ) : (
        <svg width={s * 0.4} height={s * 0.4} viewBox="0 0 16 16" fill={color}>
          <path d="M4 2.5v11l10-5.5z" />
        </svg>
      )}
    </button>
  )
}

export default function VoiceLibraryPanel({ onClose, onSwitchPanel }: Props) {
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'female' | 'male'>('all')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const lockedVoice = VOICES.find(v => v.id === LOCKED_VOICE_ID) || VOICES[0]

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
  const femaleCount = VOICES.filter(v => v.gender === 'female').length
  const maleCount = VOICES.filter(v => v.gender === 'male').length

  return (
    <div style={{
      position: 'absolute', top: 36, right: 0, bottom: 0, width: 520,
      zIndex: 102, overflow: 'hidden', borderRadius: '8px 0 0 0',
      boxShadow: '-2px 0 16px rgba(0,0,0,0.15)', fontFamily: C.font,
      display: 'flex', flexDirection: 'column', background: C.bg,
    }}>
      {/* ===== 顶栏标题 + 关闭 ===== */}
      <div style={{
        padding: '10px 16px', background: C.card, display: 'flex',
        alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
      }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: C.text }}>🔊 伴播音色</span>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', fontSize: 18, color: C.textSec,
          cursor: 'pointer', padding: 4,
        }}>x</button>
      </div>
      {onSwitchPanel && <TabBar active="voice" onSwitch={onSwitchPanel} />}

      {/* ===== 主体内容 ===== */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>

        {/* ---- 当前锁定音色 ---- */}
        <div style={{
          padding: '16px',
          background: `linear-gradient(135deg, ${lockedVoice.color}10 0%, ${lockedVoice.color}04 100%)`,
          borderRadius: 12,
          border: `1.5px solid ${lockedVoice.color}30`,
          marginBottom: 14,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* 大头像色块 */}
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: `${lockedVoice.color}18`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, flexShrink: 0, position: 'relative',
            }}>
              🎤
              {/* 锁定标记 */}
              <div style={{
                position: 'absolute', top: -4, right: -4,
                width: 20, height: 20, borderRadius: '50%',
                background: C.orange, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
              }}>🔒</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{lockedVoice.name}</span>
                <span style={{
                  fontSize: 10, padding: '2px 8px', borderRadius: 4,
                  background: C.orangeLight, color: C.orange, fontWeight: 600,
                }}>已锁定</span>
              </div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                {lockedVoice.tags.map(tag => (
                  <span key={tag} style={{
                    fontSize: 11, padding: '2px 8px', borderRadius: 4,
                    background: `${lockedVoice.color}12`, color: lockedVoice.color,
                  }}>{tag}</span>
                ))}
              </div>
              <div style={{ fontSize: 11, color: C.textSec }}>{LOCKED_REASON}</div>
            </div>
            <PlayButton
              playing={playingId === lockedVoice.id}
              onClick={() => handlePlay(lockedVoice.id)}
              color={lockedVoice.color}
              size={44}
            />
          </div>
        </div>

        {/* ---- 音色列表（全部灰显，不可选） ---- */}
        <div style={{
          fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span>全部音色</span>
          <span style={{ fontSize: 11, fontWeight: 400, color: C.textTert }}>音色由动作素材决定，不可手动切换</span>
        </div>

        {/* 筛选标签 */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          {[
            { key: 'all' as const, label: '全部', count: VOICES.length },
            { key: 'female' as const, label: '女声', count: femaleCount },
            { key: 'male' as const, label: '男声', count: maleCount },
          ].map(tab => (
            <button key={tab.key} onClick={() => setFilter(tab.key)} style={{
              padding: '4px 12px', borderRadius: 14, border: 'none', fontSize: 12,
              fontWeight: filter === tab.key ? 500 : 400,
              background: filter === tab.key ? C.blueLight : 'transparent',
              color: filter === tab.key ? C.blue : C.textSec,
              cursor: 'pointer', fontFamily: C.font,
            }}>
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* 音色列表 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {filteredVoices.map(voice => {
            const isLocked = voice.id === LOCKED_VOICE_ID
            return (
              <div key={voice.id} style={{
                padding: '10px 14px', borderRadius: 10,
                background: isLocked ? `${voice.color}06` : C.card,
                border: isLocked ? `1px solid ${voice.color}25` : `1px solid ${C.border}`,
                display: 'flex', alignItems: 'center', gap: 10,
                opacity: isLocked ? 1 : 0.5,
                cursor: 'default',
              }}>
                {/* 色块 */}
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: `${voice.color}12`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, flexShrink: 0,
                }}>
                  {voice.gender === 'female' ? '🎤' : '🎙'}
                </div>
                {/* 信息 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{voice.name}</span>
                    {isLocked && (
                      <span style={{
                        fontSize: 9, padding: '1px 6px', borderRadius: 3,
                        background: C.orangeLight, color: C.orange, fontWeight: 600,
                      }}>当前使用</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {voice.tags.map(tag => (
                      <span key={tag} style={{
                        fontSize: 10, padding: '1px 6px', borderRadius: 3,
                        background: `${voice.color}10`, color: isLocked ? voice.color : C.textTert,
                      }}>{tag}</span>
                    ))}
                  </div>
                </div>
                {/* 试听 */}
                <div onClick={(e) => { e.stopPropagation(); handlePlay(voice.id) }}>
                  <PlayButton
                    playing={playingId === voice.id}
                    onClick={() => handlePlay(voice.id)}
                    color={isLocked ? voice.color : C.textTert}
                    size={32}
                  />
                </div>
                {/* 锁定图标（非当前音色） */}
                {!isLocked && (
                  <span style={{ fontSize: 14, color: C.textTert, flexShrink: 0 }}>🔒</span>
                )}
              </div>
            )
          })}
        </div>

        {/* ---- 自定义声音 ---- */}
        <div style={{
          marginTop: 16, padding: '14px', borderRadius: 10,
          border: `1.5px dashed ${C.border}`, textAlign: 'center',
        }}>
          <div style={{ fontSize: 20, marginBottom: 6 }}>🎤</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>自定义声音</div>
          <div style={{ fontSize: 11, color: C.textSec, marginBottom: 12, lineHeight: 1.5 }}>
            快速克隆专属音色，只需15秒
          </div>
          <button style={{
            width: '100%', padding: '10px', borderRadius: 8,
            background: C.blue, border: 'none', color: '#fff',
            fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: C.font,
            boxShadow: '0 2px 8px rgba(51,112,255,0.25)',
          }}>
            训练声音
          </button>
        </div>
      </div>

      {/* ===== 底部操作栏 ===== */}
      <div style={{
        padding: '12px 16px', background: C.card, borderTop: `1px solid ${C.border}`,
        display: 'flex', gap: 10, flexShrink: 0,
      }}>
        <button onClick={onClose} style={{
          flex: 1, height: 42, borderRadius: 8,
          background: 'transparent', border: `1px solid ${C.border}`,
          color: C.textSec, fontSize: 14, cursor: 'pointer', fontFamily: C.font,
        }}>取消</button>
        <button style={{
          flex: 2, height: 42, borderRadius: 8,
          background: C.blue, border: 'none', color: '#fff',
          fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: C.font,
          boxShadow: '0 2px 8px rgba(51,112,255,0.3)',
        }}>确认配置</button>
      </div>
    </div>
  )
}
