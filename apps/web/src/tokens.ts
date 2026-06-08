// Design tokens for AgentPay application
// Centralized styling constants to ensure consistency across UI

export const tokens = {
  colors: {
    background: '#080808',
    surface: '#111111',
    surfaceAlt: '#1A1A1A',
    border: 'rgba(255,255,255,0.1)',
    borderSubtle: 'rgba(255,255,255,0.05)',
    text: {
      primary: '#ffffff',
      secondary: '#e5e2e1',
      tertiary: '#737373',
      muted: '#555555',
    },
    accent: '#C08532',
    success: '#4ae176',
    error: '#ffb4ab',
    errorBg: 'rgba(255,180,171,0.08)',
    errorBorder: 'rgba(255,180,171,0.25)',
    successBg: 'rgba(74,225,118,0.1)',
    successBorder: 'rgba(74,225,118,0.2)',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    xxl: '32px',
  },
  typography: {
    fontFamily: {
      display: 'Inter',
      body: 'Space Grotesk',
      mono: 'monospace',
    },
    fontSize: {
      xs: '10px',
      sm: '11px',
      md: '12px',
      lg: '13px',
      xl: '15px',
      display: '28px',
      title: '24px',
    },
    fontWeight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1,
      normal: 1.4,
      relaxed: 1.6,
    },
    letterSpacing: {
      tight: '-0.02em',
      normal: '0.01em',
      wide: '0.04em',
      wider: '0.06em',
      widest: '0.1em',
    },
  },
  shadows: {
    subtle: '0 1px 2px rgba(0,0,0,0.3)',
    medium: '0 4px 6px rgba(0,0,0,0.4)',
    large: '0 10px 15px rgba(0,0,0,0.5)',
  },
  radius: {
    none: '0px',
    sm: '2px',
    md: '4px',
    lg: '8px',
  },
  transitions: {
    fast: '0.15s ease',
    normal: '0.3s ease',
  },
} as const;

export default tokens;
