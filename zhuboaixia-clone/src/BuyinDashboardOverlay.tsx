import React, { useState } from 'react'
import BuyinControlPanel from './BuyinControlPanel'
import BuyinLivePreviewPanel from './BuyinLivePreviewPanel'
import AvatarLibraryPanel from './AvatarLibraryPanel'
import VoiceLibraryPanel from './VoiceLibraryPanel'
import VoiceSwitchPanel from './VoiceSwitchPanel'
import AutoChatPanel from './AutoChatPanel'
import SceneEditorPanel from './SceneEditorPanel'
import AutoCommentPanel from './AutoCommentPanel'
import WelcomeThanksPanel from './WelcomeThanksPanel'
import PriceControlPanel from './PriceControlPanel'
import CouponPanel from './CouponPanel'
import LuckyBagPanel from './LuckyBagPanel'
import SystemSettingsPanel from './SystemSettingsPanel'
import ConfigPanel from './ConfigPanel'
import CanvasPanel from './CanvasPanel'
import BanboEntryScreen from './BanboEntryScreen'
import BanboSetupWizard from './BanboSetupWizard'
import { PanelKey, C } from './shared'
import type { WizardResult } from './wizard/types'

type ActivePanel = 'none' | 'main' | 'livePreview' | 'config' | 'zhuboxia-preview' | PanelKey
type BanboState = 'unconfigured' | 'wizard' | 'configured'

export default function BuyinDashboardOverlay({ onClose, onGoToManage }: { onClose: () => void; onGoToManage?: () => void }) {
  const [activePanel, setActivePanel] = useState<ActivePanel>('main')
  const [banboState, setBanboState] = useState<BanboState>('configured')
  const [wizardResult, setWizardResult] = useState<WizardResult | null>(null)
  const [reviewExpanded, setReviewExpanded] = useState(false)
  const [showSyncBanner, setShowSyncBanner] = useState(false)
  const [previewRunning, setPreviewRunning] = useState(false)
  const editMode = wizardResult !== null
  const panelOpen = activePanel !== 'none'
  const switchPanel = (p: PanelKey) => setActivePanel(p)

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 100, cursor: 'default', overflow: 'hidden' }}>
      <img src="/screenshots/buyin-overlay.jpg" alt="巨量百应" draggable={false}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', userSelect: 'none', pointerEvents: 'none', zIndex: 1 }} />
      <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 2 }}>
        {/* 按钮点击热区（视觉已画在截图上） */}
        <rect x="1195" y="5" width="130" height="28" rx="4" fill="transparent"
          style={{ cursor: 'pointer' }} onClick={() => setActivePanel(panelOpen ? 'none' : 'main')} />
        {/* 配置按钮热区（右上角） */}
        {!panelOpen && <rect x="1100" y="40" width="80" height="28" rx="4" fill="transparent"
          style={{ cursor: 'pointer' }} onClick={() => setActivePanel('config')} />}
        {!panelOpen && <rect x="1370" y="8" width="60" height="22" fill="transparent"
          style={{ cursor: 'pointer' }} onClick={onClose} />}
      </svg>

      {/* 伴播主面板（4状态机） */}
      {activePanel === 'main' && (
        <div style={{
          position: 'absolute', top: 0, right: 0, bottom: 0,
          width: 760, overflow: 'hidden', zIndex: 10,
          boxShadow: '-4px 0 20px rgba(0,0,0,0.2)',
        }}>
          {banboState === 'unconfigured' && (
            <BanboEntryScreen onStart={() => setBanboState('wizard')} />
          )}
          {banboState === 'wizard' && (
            <BanboSetupWizard
              initialState={wizardResult ?? undefined}
              editMode={editMode}
              onComplete={(result) => {
                setWizardResult(result)
                setBanboState('configured')
                setShowSyncBanner(true)
                setTimeout(() => setShowSyncBanner(false), 4000)
              }}
            />
          )}
          {banboState === 'configured' && (
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              <CanvasPanel onClose={() => { setPreviewRunning(false); setActivePanel('zhuboxia-preview') }} wizardResult={wizardResult ?? undefined} onGoToManage={onGoToManage} isLive={previewRunning} />
              <link rel="preload" as="image" href="/screenshots/zhuboxia-panel.png" />
              <link rel="preload" as="image" href="/screenshots/zhuboxia-running.jpg" />

              {/* 同步成功横幅（4秒后自动消失） */}
              {showSyncBanner && (
                <div style={{
                  position: 'absolute', top: 44, left: 0, right: 0, zIndex: 30,
                  background: '#E6F9EF', borderBottom: `1px solid ${C.green}40`,
                  padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8,
                  fontSize: 12, color: C.green, fontFamily: C.font,
                }}>
                  <span style={{ fontWeight: 600 }}>✓ 向导配置已同步</span>
                  <span style={{ color: C.textSec }}>· 商品绑定、技能与口令已按照您的设置自动应用</span>
                </div>
              )}

              {/* 审核状态 + 编辑入口 合并浮层 */}
              {wizardResult && (() => {
                const avatars = wizardResult.avatarConfigs
                const reviewing = avatars.filter(c => c.reviewStatus === 'reviewing').length
                const approved = avatars.filter(c => c.reviewStatus === 'approved').length
                const pending = avatars.filter(c => c.reviewStatus === 'unsubmitted').length
                return (
                  <div style={{
                    position: 'absolute', top: 56, right: 12, zIndex: 20,
                    background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(8px)',
                    border: `1px solid ${C.border}`, borderRadius: 12,
                    width: 218, boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                    overflow: 'hidden', fontFamily: C.font,
                  }}>
                    {/* 主操作按钮（常驻，最显眼） */}
                    <div style={{ padding: '10px 12px 8px' }}>
                      <button
                        onClick={() => setBanboState('wizard')}
                        style={{
                          width: '100%', padding: '8px 0', borderRadius: 7, border: 'none',
                          background: C.blue, color: '#fff', fontSize: 12, fontWeight: 600,
                          cursor: 'pointer', fontFamily: C.font,
                        }}
                      >✏️ 调整形象 / 技能配置</button>
                    </div>

                    {/* 审核状态折叠区 */}
                    <div style={{ borderTop: `1px solid ${C.border}` }}>
                      <div
                        onClick={() => setReviewExpanded(v => !v)}
                        style={{ padding: '7px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                      >
                        <span style={{ fontSize: 11, fontWeight: 600, color: C.text }}>素材审核状态</span>
                        <span style={{ fontSize: 10, color: C.textSec }}>
                          {reviewing > 0 && `${reviewing}个审核中`}
                          {reviewing > 0 && approved > 0 && ' · '}
                          {approved > 0 && `${approved}个已通过`}
                          {reviewing === 0 && approved === 0 && pending > 0 && `${pending}个待提交`}
                          {'  '}{reviewExpanded ? '▲' : '▼'}
                        </span>
                      </div>
                      {reviewExpanded && (
                        <div style={{ padding: '0 12px 8px' }}>
                          {avatars.map(c => (
                            <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
                              <span style={{ fontSize: 11, color: C.text, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: 6 }}>{c.name}</span>
                              {c.reviewStatus === 'approved' && <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: '#E6F9EF', color: C.green, fontWeight: 500, flexShrink: 0 }}>✓ 已通过</span>}
                              {c.reviewStatus === 'reviewing' && <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: C.blueLight, color: C.blue, fontWeight: 500, flexShrink: 0 }}>⏳ 审核中</span>}
                              {c.reviewStatus === 'unsubmitted' && <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: '#F3F4F6', color: C.textTert, fontWeight: 500, flexShrink: 0 }}>待提交</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })()}
            </div>
          )}
        </div>
      )}
      {activePanel === 'zhuboxia-preview' && (
        <div
          style={{
            position: 'absolute', top: 0, right: 0, bottom: 0,
            width: 420, zIndex: 10,
            boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
            background: '#000',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <img
            src={previewRunning ? '/screenshots/zhuboxia-running.jpg' : '/screenshots/zhuboxia-panel.png'}
            alt="助播虾预览"
            draggable={false}
            style={{ width: '100%', height: '100%', objectFit: 'contain', userSelect: 'none', pointerEvents: 'none' }}
          />
          {/* 预加载第二张图 */}
          {!previewRunning && <link rel="preload" as="image" href="/screenshots/zhuboxia-running.jpg" />}
          {/* 右侧按钮列热区（形象/配音/KT板/设置/设备）→ 跳回配置面板 */}
          {!previewRunning && <div
            onClick={() => setActivePanel('main')}
            style={{
              position: 'absolute', top: '5%', right: 0, width: '15%', height: '40%',
              cursor: 'pointer',
            }}
          />}
          {/* 启动助播虾按钮热区 → 切换到运行中截图 */}
          {!previewRunning && <div
            onClick={() => setPreviewRunning(true)}
            style={{
              position: 'absolute', top: '68%', left: '10%', width: '80%', height: '12%',
              cursor: 'pointer',
            }}
          />}
          {/* 运行中截图左上角热区 → 跳回配置面板 */}
          {previewRunning && <div
            onClick={() => { setPreviewRunning(false); setActivePanel('main') }}
            style={{
              position: 'absolute', top: 0, left: 0, width: '25%', height: '5%',
              cursor: 'pointer',
            }}
          />}
        </div>
      )}
      {activePanel === 'livePreview' && <BuyinLivePreviewPanel onClose={() => setActivePanel('none')} onContinueConfig={() => setActivePanel('avatar')} />}
      {activePanel === 'config' && <ConfigPanel onClose={() => setActivePanel('none')} />}
      {activePanel === 'avatar' && <AvatarLibraryPanel onClose={() => setActivePanel('main')} onSwitchPanel={switchPanel} onConfirmConfig={() => setActivePanel('livePreview')} />}
      {activePanel === 'voice' && <VoiceLibraryPanel onClose={() => setActivePanel('main')} onSwitchPanel={switchPanel} onConfirmConfig={() => setActivePanel('livePreview')} />}
      {activePanel === 'voiceSwitch' && <VoiceSwitchPanel onClose={() => setActivePanel('main')} onSwitchPanel={switchPanel} onConfirmConfig={() => setActivePanel('livePreview')} />}
      {activePanel === 'autoChat' && <AutoChatPanel onClose={() => setActivePanel('main')} onSwitchPanel={switchPanel} onConfirmConfig={() => setActivePanel('livePreview')} />}
      {activePanel === 'sceneLayout' && <SceneEditorPanel onClose={() => setActivePanel('main')} onSwitchPanel={switchPanel} onConfirmConfig={() => setActivePanel('livePreview')} />}
      {activePanel === 'autoComment' && <AutoCommentPanel onClose={() => setActivePanel('main')} onSwitchPanel={switchPanel} onConfirmConfig={() => setActivePanel('livePreview')} />}
      {activePanel === 'welcomeThanks' && <WelcomeThanksPanel onClose={() => setActivePanel('main')} onSwitchPanel={switchPanel} onConfirmConfig={() => setActivePanel('livePreview')} />}
      {activePanel === 'priceControl' && <PriceControlPanel onClose={() => setActivePanel('main')} onSwitchPanel={switchPanel} onConfirmConfig={() => setActivePanel('livePreview')} />}
      {activePanel === 'coupons' && <CouponPanel onClose={() => setActivePanel('main')} onSwitchPanel={switchPanel} onConfirmConfig={() => setActivePanel('livePreview')} />}
      {activePanel === 'luckyBag' && <LuckyBagPanel onClose={() => setActivePanel('main')} onSwitchPanel={switchPanel} onConfirmConfig={() => setActivePanel('livePreview')} />}
      {activePanel === 'systemSettings' && <SystemSettingsPanel onClose={() => setActivePanel('main')} onSwitchPanel={switchPanel} onConfirmConfig={() => setActivePanel('livePreview')} />}
    </div>
  )
}
