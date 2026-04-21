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
import BanboUpdateFlow from './BanboUpdateFlow'
import { PanelKey } from './shared'
import type { WizardResult } from './wizard/types'

type ActivePanel = 'none' | 'main' | 'livePreview' | 'config' | PanelKey
type BanboState = 'unconfigured' | 'wizard' | 'configured' | 'updating'

export default function BuyinDashboardOverlay({ onClose }: { onClose: () => void }) {
  const [activePanel, setActivePanel] = useState<ActivePanel>('main')
  const [banboState, setBanboState] = useState<BanboState>('unconfigured')
  const [wizardResult, setWizardResult] = useState<WizardResult | null>(null)
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
            <BanboSetupWizard onComplete={(result) => {
              setWizardResult(result)
              setBanboState('configured')
            }} />
          )}
          {banboState === 'configured' && (
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              <CanvasPanel onClose={() => setActivePanel('none')} />
              <button
                onClick={() => setBanboState('updating')}
                style={{
                  position: 'absolute', bottom: 20, left: '50%',
                  transform: 'translateX(-50%)',
                  padding: '8px 20px', borderRadius: 8,
                  border: '1.5px dashed #FF7D00', background: '#FFFBE6',
                  color: '#875800', fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', zIndex: 10,
                }}
              >🔄 模拟货盘更新</button>
            </div>
          )}
          {banboState === 'updating' && wizardResult && (
            <BanboUpdateFlow
              wizardResult={wizardResult}
              onComplete={(result) => {
                setWizardResult(result)
                setBanboState('configured')
              }}
              onCancel={() => setBanboState('configured')}
            />
          )}
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
