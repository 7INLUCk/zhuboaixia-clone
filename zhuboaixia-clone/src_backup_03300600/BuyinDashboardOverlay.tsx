import React, { useState } from 'react'
import BuyinControlPanel from './BuyinControlPanel'
import AvatarLibraryPanel from './AvatarLibraryPanel'
import VoiceLibraryPanel from './VoiceLibraryPanel'
import VoiceSwitchPanel from './VoiceSwitchPanel'
import AutoChatPanel from './AutoChatPanel'
import SceneLayoutPanel from './SceneLayoutPanel'

type Props = { onClose: () => void }
type ActivePanel = 'none' | 'main' | 'avatar' | 'voice' | 'voiceSwitch' | 'autoChat' | 'sceneLayout'

export default function BuyinDashboardOverlay({ onClose }: Props) {
  const [activePanel, setActivePanel] = useState<ActivePanel>('none')
  const panelOpen = activePanel !== 'none'

  const switchPanel = (panel: ActivePanel) => setActivePanel(panel)

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 100, cursor: 'default', overflow: 'hidden' }}>
      <img src="/screenshots/buyin-overlay.jpg" alt="巨量百应" draggable={false}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', userSelect: 'none', pointerEvents: 'none', zIndex: 1 }} />
      <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 2 }}>
        <rect x="1195" y="5" width="130" height="28" rx="4" fill="transparent"
          style={{ cursor: 'pointer' }} onClick={() => setActivePanel(panelOpen ? 'none' : 'main')} />
        {!panelOpen && <rect x="1370" y="8" width="60" height="22" fill="transparent"
          style={{ cursor: 'pointer' }} onClick={onClose} />}
      </svg>

      {activePanel === 'main' && <BuyinControlPanel onClose={() => setActivePanel('none')} onContinueConfig={() => setActivePanel('avatar')} />}
      {activePanel === 'avatar' && <AvatarLibraryPanel onClose={() => setActivePanel('main')} onSwitchPanel={switchPanel} />}
      {activePanel === 'voice' && <VoiceLibraryPanel onClose={() => setActivePanel('main')} onSwitchPanel={switchPanel} />}
      {activePanel === 'voiceSwitch' && <VoiceSwitchPanel onClose={() => setActivePanel('main')} onSwitchPanel={switchPanel} />}
      {activePanel === 'autoChat' && <AutoChatPanel onClose={() => setActivePanel('main')} onSwitchPanel={switchPanel} />}
      {activePanel === 'sceneLayout' && <SceneLayoutPanel onClose={() => setActivePanel('main')} onSwitchPanel={switchPanel} />}
    </div>
  )
}
