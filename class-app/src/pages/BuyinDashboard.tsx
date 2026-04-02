import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import BuyinControlPanel from './BuyinControlPanel'
import CourseAnnouncement from './CourseAnnouncement'
import CoursewareDownload from './CoursewareDownload'
import CourseMaterial from './CourseMaterial'
import NotificationBar from './NotificationBar'

export default function BuyinDashboard() {
  const navigate = useNavigate()
  const { tab } = useParams<{ tab: string }>()

  const activeTab = tab || 'course-announcement'

  const handleClose = () => {
    navigate('/classroom')
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'course-announcement':
        return <CourseAnnouncement />
      case 'courseware-download':
        return <CoursewareDownload />
      case 'course-material':
        return <CourseMaterial />
      case 'notification':
        return <NotificationBar />
      default:
        return <CourseAnnouncement />
    }
  }

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: '#F7F8FA',
      fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif',
    }}>
      {/* 左侧控制面板 */}
      <BuyinControlPanel activeTab={activeTab} />

      {/* 右侧内容区 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* 顶部关闭栏 */}
        <div style={{
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '0 24px',
          background: '#fff',
          borderBottom: '1px solid #E5E6EB',
        }}>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 20,
              color: '#86909C',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 6,
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#F2F3F5')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            ✕
          </button>
        </div>

        {/* 内容区 */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {renderContent()}
        </div>
      </div>
    </div>
  )
}
