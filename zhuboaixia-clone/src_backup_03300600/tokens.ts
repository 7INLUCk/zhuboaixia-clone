// 从截图提取的 Design Tokens
export const tokens = {
  colors: {
    primary: '#5850EC',
    primaryHover: '#6B5CE7',
    sidebar: '#F8F9FB',
    sidebarSelected: '#EEF0FF',
    sidebarBorder: '#E5E6EB',
    mainBg: '#FFFFFF',
    textPrimary: '#1D2129',
    textSecondary: '#86909C',
    textTertiary: '#C9CDD4',
    border: '#E5E6EB',
  },
  sidebar: {
    width: 220,
    itemHeight: 44,
    iconSize: 18,
    selectedBorder: 3,
  },
  header: {
    height: 56,
    titleSize: 16,
    subtitleSize: 14,
  },
  fonts: {
    family: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", "Segoe UI", sans-serif',
    title: '600 16px',
    body: '400 14px',
    small: '400 12px',
  },
  radius: {
    sm: 4,
    md: 8,
    lg: 12,
  },
} as const
