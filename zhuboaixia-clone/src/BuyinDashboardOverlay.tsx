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
import { PanelKey } from './shared'

type ActivePanel = 'none' | 'main' | 'livePreview' | 'config' | PanelKey

export default function BuyinDashboardOverlay({ onClose }: { onClose: () => void }) {
  const [activePanel, setActivePanel] = useState<ActivePanel>('main')
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

      {activePanel === 'main' && <BuyinControlPanel onClose={() => setActivePanel('none')} onContinueConfig={() => setActivePanel('avatar')} />}
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
