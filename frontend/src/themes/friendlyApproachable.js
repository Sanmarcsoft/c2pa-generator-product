/**
 * Theme Configuration: Friendly & Approachable
 *
 * Warm, inviting interface with soft colors, rounded shapes, and friendly iconography.
 * Creates an approachable experience for users who may be new to the technology.
 *
 * @theme friendly-approachable
 */

const friendlyApproachable = {
  id: 'friendly-approachable',
  name: 'Friendly & Approachable',
  description: 'Warm, inviting interface with soft colors and rounded shapes',
  preview: {
    primary: '#FB923C',
    background: '#FFFBF5',
    text: '#3F3F46',
  },

  colors: {
    // Warm Primary Colors
    warm: {
      50: '#FEF3F2',
      100: '#FEE4E2',
      200: '#FECACA',
      300: '#FDA4AF',
      400: '#FB7185',
      500: '#F43F5E',
      600: '#E11D48',
      700: '#BE123C',
      800: '#9F1239',
      900: '#881337',
    },

    // Friendly Accent Colors
    accent: {
      blue: '#60A5FA',
      teal: '#2DD4BF',
      orange: '#FB923C',
      green: '#4ADE80',
      purple: '#A78BFA',
      yellow: '#FCD34D',
    },

    // Semantic Colors
    background: {
      primary: '#FFFBF5',      // Cream white
      secondary: '#FFF8F0',    // Warm white
      tertiary: '#FEF3E7',     // Light peach
      accent: '#E0F2FE',       // Soft blue tint
    },

    text: {
      primary: '#3F3F46',      // Warm dark gray
      secondary: '#71717A',    // Medium gray
      tertiary: '#A1A1AA',     // Light gray
      onColor: '#FFFFFF',      // White for colored backgrounds
    },

    border: {
      color: '#E5E7EB',
    },

    shadow: {
      soft: 'rgba(251, 146, 60, 0.08)',
      warm: 'rgba(251, 146, 60, 0.12)',
      strong: 'rgba(251, 146, 60, 0.18)',
    },
  },

  typography: {
    // Font Families
    fontFamily: {
      primary: "'Nunito', 'Quicksand', -apple-system, BlinkMacSystemFont, sans-serif",
      headings: "'Poppins', 'Nunito', -apple-system, sans-serif",
      code: "'JetBrains Mono', 'Fira Code', monospace",
    },

    // Type Scale
    fontSize: {
      display: '2.75rem',    // 44px
      h1: '2rem',            // 32px
      h2: '1.75rem',         // 28px
      h3: '1.5rem',          // 24px
      h4: '1.25rem',         // 20px
      h5: '1.125rem',        // 18px
      base: '1rem',          // 16px
      sm: '0.9375rem',       // 15px
      xs: '0.8125rem',       // 13px
    },

    // Font Weights
    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },

    // Line Heights (more spacious)
    lineHeight: {
      tight: 1.3,
      normal: 1.6,
      relaxed: 1.8,
    },
  },

  spacing: {
    0: '0',
    1: '0.25rem',    // 4px
    2: '0.5rem',     // 8px
    3: '0.75rem',    // 12px
    4: '1rem',       // 16px
    5: '1.5rem',     // 24px (more generous)
    6: '2rem',       // 32px
    8: '2.5rem',     // 40px
    10: '3rem',      // 48px
    12: '4rem',      // 64px
    16: '5rem',      // 80px
    20: '6rem',      // 96px
  },

  borderRadius: {
    sm: '0.5rem',     // 8px
    md: '0.75rem',    // 12px
    lg: '1rem',       // 16px
    xl: '1.5rem',     // 24px
    '2xl': '2rem',    // 32px
    full: '9999px',   // Pill shape
  },

  shadows: {
    sm: '0 2px 8px rgba(251, 146, 60, 0.1)',
    md: '0 8px 20px rgba(251, 146, 60, 0.15)',
    lg: '0 20px 50px rgba(0, 0, 0, 0.2)',
  },

  animations: {
    transition: {
      quick: '150ms ease-out',
      normal: '250ms ease-out',
      slow: '400ms ease-out',
      bounce: '300ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },

    easing: {
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      elastic: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },

  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },

  container: {
    sm: '600px',
    md: '720px',
    lg: '960px',
    xl: '1200px',
    '2xl': '1400px',
  },
};

export default friendlyApproachable;
