/**
 * Theme Configuration: Modern Minimalist
 *
 * Clean, sophisticated interface with generous whitespace and refined color palette.
 * Prioritizes content and functionality through subtle interactions.
 *
 * @theme modern-minimalist
 */

const modernMinimalist = {
  id: 'modern-minimalist',
  name: 'Modern Minimalist',
  description: 'Clean, sophisticated interface with generous whitespace',
  preview: {
    primary: '#3B82F6',
    background: '#FFFFFF',
    text: '#1E293B',
  },

  colors: {
    // Primary Colors
    primary: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
    },

    // Accent Colors
    accent: {
      blue: '#3B82F6',
      blueLight: '#60A5FA',
      blueDark: '#2563EB',
      green: '#10B981',
      yellow: '#F59E0B',
      red: '#EF4444',
    },

    // Semantic Colors
    background: {
      primary: '#FFFFFF',
      secondary: '#F8FAFC',
      tertiary: '#F1F5F9',
    },

    text: {
      primary: '#1E293B',
      secondary: '#64748B',
      tertiary: '#94A3B8',
    },

    border: {
      color: '#E2E8F0',
    },

    shadow: {
      sm: 'rgba(15, 23, 42, 0.04)',
      md: 'rgba(15, 23, 42, 0.08)',
      lg: 'rgba(15, 23, 42, 0.12)',
    },
  },

  typography: {
    // Font Families
    fontFamily: {
      primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      code: "'SF Mono', Monaco, 'Courier New', monospace",
    },

    // Type Scale
    fontSize: {
      display: '3rem',      // 48px
      h1: '2.25rem',        // 36px
      h2: '1.875rem',       // 30px
      h3: '1.5rem',         // 24px
      h4: '1.25rem',        // 20px
      h5: '1.125rem',       // 18px
      base: '1rem',         // 16px
      sm: '0.875rem',       // 14px
      xs: '0.75rem',        // 12px
    },

    // Font Weights
    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },

    // Line Heights
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  spacing: {
    0: '0',
    1: '0.25rem',    // 4px
    2: '0.5rem',     // 8px
    3: '0.75rem',    // 12px
    4: '1rem',       // 16px
    5: '1.25rem',    // 20px
    6: '1.5rem',     // 24px
    8: '2rem',       // 32px
    10: '2.5rem',    // 40px
    12: '3rem',      // 48px
    16: '4rem',      // 64px
    20: '5rem',      // 80px
    24: '6rem',      // 96px
  },

  borderRadius: {
    sm: '0.25rem',    // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    full: '9999px',
  },

  shadows: {
    sm: '0 1px 3px rgba(0,0,0,0.04)',
    md: '0 4px 12px rgba(0,0,0,0.08)',
    lg: '0 20px 25px -5px rgba(0,0,0,0.1)',
  },

  animations: {
    transition: {
      fast: '150ms ease',
      normal: '200ms ease',
      slow: '300ms ease',
    },

    easing: {
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },

  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  container: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};

export default modernMinimalist;
