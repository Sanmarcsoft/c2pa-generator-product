/**
 * Theme Configuration: Tech-Savvy & Trustworthy
 *
 * Sophisticated, professional interface with dark color scheme and electric accents.
 * Appeals to tech-savvy users who value precision, control, and transparency.
 *
 * @theme tech-savvy
 */

const techSavvy = {
  id: 'tech-savvy',
  name: 'Tech-Savvy & Trustworthy',
  description: 'Dark, professional interface with electric accents',
  preview: {
    primary: '#00E5FF',
    background: '#0F1628',
    text: '#FFFFFF',
  },

  colors: {
    // Dark Foundation
    dark: {
      900: '#0A0E1A',
      800: '#0F1628',
      750: '#141B2E',
      700: '#1A2235',
      600: '#242E45',
      500: '#2E3A55',
      400: '#3D4A65',
      300: '#4D5A75',
      200: '#5D6A85',
      100: '#7A8599',
    },

    // Electric Accents
    electric: {
      cyan: '#00E5FF',
      cyanLight: '#33EBFF',
      cyanDark: '#00B8CC',
      teal: '#00FFA3',
      blue: '#0080FF',
      purple: '#A855F7',
      yellow: '#FFD600',
      red: '#FF3366',
      orange: '#FF6B35',
    },

    // Semantic Colors
    background: {
      primary: '#0F1628',
      secondary: '#141B2E',
      tertiary: '#1A2235',
      elevated: '#242E45',
      glass: 'rgba(255, 255, 255, 0.03)',
      glassHover: 'rgba(255, 255, 255, 0.06)',
    },

    text: {
      primary: '#FFFFFF',
      secondary: '#B4BFCF',
      tertiary: '#7A8599',
      electric: '#00E5FF',
    },

    border: {
      subtle: '#242E45',
      medium: '#3D4A65',
      strong: '#4D5A75',
      electric: '#00E5FF',
    },

    glow: {
      cyan: '0 0 20px rgba(0, 229, 255, 0.4)',
      teal: '0 0 20px rgba(0, 255, 163, 0.4)',
      blue: '0 0 20px rgba(0, 128, 255, 0.4)',
    },
  },

  typography: {
    // Font Families
    fontFamily: {
      primary: "'Space Grotesk', 'Montserrat', 'Inter', -apple-system, sans-serif",
      headings: "'Outfit', 'Space Grotesk', sans-serif",
      code: "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace",
      monoNum: "'Roboto Mono', monospace",
    },

    // Type Scale
    fontSize: {
      display: '3.5rem',     // 56px
      h1: '2.5rem',          // 40px
      h2: '2rem',            // 32px
      h3: '1.5rem',          // 24px
      h4: '1.25rem',         // 20px
      h5: '1.125rem',        // 18px
      base: '1rem',          // 16px
      sm: '0.875rem',        // 14px
      xs: '0.75rem',         // 12px
      code: '0.9375rem',     // 15px
    },

    // Font Weights
    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      black: 900,
    },

    // Line Heights
    lineHeight: {
      tight: 1.2,
      snug: 1.4,
      normal: 1.6,
      relaxed: 1.8,
    },

    // Letter Spacing
    letterSpacing: {
      tight: '-0.02em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
    },
  },

  spacing: {
    0: '0',
    px: '1px',
    0.5: '0.125rem',   // 2px
    1: '0.25rem',      // 4px
    2: '0.5rem',       // 8px
    3: '0.75rem',      // 12px
    4: '1rem',         // 16px
    5: '1.25rem',      // 20px
    6: '1.5rem',       // 24px
    8: '2rem',         // 32px
    10: '2.5rem',      // 40px
    12: '3rem',        // 48px
    16: '4rem',        // 64px
    20: '5rem',        // 80px
    24: '6rem',        // 96px
    32: '8rem',        // 128px
  },

  borderRadius: {
    none: '0',
    sm: '2px',
    md: '4px',
    lg: '6px',
    xl: '8px',
    '2xl': '12px',
    full: '9999px',
  },

  shadows: {
    sm: '0 4px 24px rgba(0, 0, 0, 0.5)',
    md: '0 8px 32px rgba(0, 0, 0, 0.6)',
    lg: '0 24px 48px rgba(0, 0, 0, 0.8)',
  },

  animations: {
    transition: {
      instant: '100ms ease',
      fast: '150ms ease',
      normal: '200ms ease',
      slow: '300ms ease',
      smooth: '400ms cubic-bezier(0.4, 0, 0.2, 1)',
    },

    easing: {
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      emphasize: 'cubic-bezier(0, 0, 0.2, 1)',
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
    '2xl': '1440px',
    full: '100%',
  },

  effects: {
    gridPattern: 'linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)',
    gridSize: '20px 20px',
  },
};

export default techSavvy;
