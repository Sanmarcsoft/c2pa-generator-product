/**
 * Theme Test Utilities
 *
 * Shared utilities, helpers, and mock data for theme testing.
 * Provides viewport mocking, color validation, performance measurement,
 * and test data generators.
 *
 * @file testUtils.js
 */

// ============================================================================
// Viewport Size Constants
// ============================================================================

export const VIEWPORTS = {
  mobile: {
    small: { width: 320, height: 568, name: 'iPhone SE' },
    medium: { width: 375, height: 667, name: 'iPhone 8' },
    large: { width: 414, height: 896, name: 'iPhone 11 Pro Max' },
  },
  tablet: {
    portrait: { width: 768, height: 1024, name: 'iPad Portrait' },
    landscape: { width: 1024, height: 768, name: 'iPad Landscape' },
  },
  desktop: {
    small: { width: 1280, height: 720, name: 'HD' },
    large: { width: 1920, height: 1080, name: 'Full HD' },
    xlarge: { width: 2560, height: 1440, name: '2K' },
  },
};

// ============================================================================
// Theme Constants
// ============================================================================

export const THEME_IDS = [
  'modern-minimalist',
  'friendly-approachable',
  'tech-savvy-trustworthy',
];

export const THEME_NAMES = {
  'modern-minimalist': 'Modern Minimalist',
  'friendly-approachable': 'Friendly & Approachable',
  'tech-savvy-trustworthy': 'Tech-Savvy & Trustworthy',
};

// ============================================================================
// Expected Theme Color Values
// ============================================================================

export const EXPECTED_COLORS = {
  'modern-minimalist': {
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
    accent: {
      blue: '#3B82F6',
      blueLight: '#60A5FA',
      blueDark: '#2563EB',
      green: '#10B981',
      yellow: '#F59E0B',
      red: '#EF4444',
    },
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
  },
  'friendly-approachable': {
    // Add expected colors for friendly theme
    accent: {
      orange: '#FB923C',
      blue: '#60A5FA',
      teal: '#2DD4BF',
      green: '#4ADE80',
    },
    background: {
      primary: '#FFFBF5',
      secondary: '#FFF8F0',
      tertiary: '#FEF3E7',
    },
  },
  'tech-savvy-trustworthy': {
    // Add expected colors for tech theme
    dark: {
      900: '#0A0E1A',
      800: '#0F1628',
      700: '#1A2235',
      600: '#242E45',
    },
    accent: {
      cyan: '#00E5FF',
      teal: '#00FFA3',
      blue: '#0080FF',
      purple: '#A855F7',
    },
  },
};

// ============================================================================
// Mock matchMedia
// ============================================================================

export const createMatchMedia = (width) => {
  return (query) => ({
    matches: query.includes(`${width}px`) || query.includes(`max-width: ${width}px`),
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  });
};

export const setViewport = (width, height) => {
  window.innerWidth = width;
  window.innerHeight = height;
  window.matchMedia = createMatchMedia(width);

  // Trigger resize event
  window.dispatchEvent(new Event('resize'));
};

// ============================================================================
// Color Utilities
// ============================================================================

/**
 * Convert hex color to RGB
 */
export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

/**
 * Calculate relative luminance
 */
export const getLuminance = (rgb) => {
  const { r, g, b } = typeof rgb === 'string' ? hexToRgb(rgb) : rgb;

  const rsRGB = r / 255;
  const gsRGB = g / 255;
  const bsRGB = b / 255;

  const rL = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const gL = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const bL = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  return 0.2126 * rL + 0.7152 * gL + 0.0722 * bL;
};

/**
 * Calculate contrast ratio between two colors
 */
export const getContrastRatio = (color1, color2) => {
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Validate if color meets WCAG contrast requirements
 */
export const meetsWCAGContrast = (foreground, background, level = 'AA', fontSize = 'normal') => {
  const ratio = getContrastRatio(foreground, background);

  const requirements = {
    AA: {
      normal: 4.5,
      large: 3.0,
    },
    AAA: {
      normal: 7.0,
      large: 4.5,
    },
  };

  return ratio >= requirements[level][fontSize];
};

/**
 * Validate hex color format
 */
export const isValidHexColor = (color) => {
  return /^#[0-9A-F]{6}$/i.test(color);
};

// ============================================================================
// Performance Measurement Utilities
// ============================================================================

/**
 * Measure synchronous operation performance
 */
export const measurePerformance = (callback) => {
  const start = performance.now();
  callback();
  const end = performance.now();
  return end - start;
};

/**
 * Measure async operation performance
 */
export const measureAsync = async (callback) => {
  const start = performance.now();
  await callback();
  const end = performance.now();
  return end - start;
};

/**
 * Measure multiple iterations and return statistics
 */
export const measureMultiple = (callback, iterations = 10) => {
  const measurements = [];

  for (let i = 0; i < iterations; i++) {
    measurements.push(measurePerformance(callback));
  }

  return {
    min: Math.min(...measurements),
    max: Math.max(...measurements),
    avg: measurements.reduce((a, b) => a + b, 0) / measurements.length,
    median: measurements.sort((a, b) => a - b)[Math.floor(measurements.length / 2)],
    all: measurements,
  };
};

/**
 * Measure frame rate
 */
export const measureFrameRate = (duration = 1000) => {
  return new Promise((resolve) => {
    const frames = [];
    let lastTime = performance.now();
    let animationId;

    const measureFrame = () => {
      const currentTime = performance.now();
      const delta = currentTime - lastTime;
      frames.push(delta);
      lastTime = currentTime;

      if (currentTime - frames[0] < duration) {
        animationId = requestAnimationFrame(measureFrame);
      } else {
        cancelAnimationFrame(animationId);
        const avgFrameTime = frames.reduce((a, b) => a + b, 0) / frames.length;
        const fps = 1000 / avgFrameTime;

        resolve({
          fps,
          avgFrameTime,
          frames: frames.length,
          droppedFrames: frames.filter((t) => t > 32).length,
        });
      }
    };

    animationId = requestAnimationFrame(measureFrame);
  });
};

// ============================================================================
// Mock Data Generators
// ============================================================================

/**
 * Generate mock chat messages
 */
export const generateMockChatMessages = (count = 10) => {
  const messages = [];
  for (let i = 0; i < count; i++) {
    messages.push({
      id: `msg-${i}`,
      isAI: i % 2 === 0,
      content: `This is test message ${i}`,
      timestamp: new Date(Date.now() - i * 60000).toISOString(),
    });
  }
  return messages;
};

/**
 * Generate mock document list
 */
export const generateMockDocuments = (count = 20) => {
  const types = ['pdf', 'image', 'video', 'data'];
  const statuses = ['certified', 'pending', 'failed', 'review'];

  const documents = [];
  for (let i = 0; i < count; i++) {
    documents.push({
      id: `doc-${i}`,
      name: `document-${i}.${types[i % types.length]}`,
      type: types[i % types.length],
      size: Math.floor(Math.random() * 50000000),
      status: statuses[i % statuses.length],
      hash: Math.random().toString(36).substring(2, 10),
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    });
  }
  return documents;
};

/**
 * Generate mock user data
 */
export const generateMockUser = () => {
  return {
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
    theme: 'modern-minimalist',
    preferences: {
      notifications: true,
      darkMode: false,
    },
  };
};

// ============================================================================
// Accessibility Testing Helpers
// ============================================================================

/**
 * Check if element is keyboard accessible
 */
export const isKeyboardAccessible = (element) => {
  const tabIndex = element.getAttribute('tabindex');
  const isInteractive =
    element.tagName === 'BUTTON' ||
    element.tagName === 'A' ||
    element.tagName === 'INPUT' ||
    element.tagName === 'SELECT' ||
    element.tagName === 'TEXTAREA';

  return isInteractive || (tabIndex !== null && parseInt(tabIndex) >= 0);
};

/**
 * Check if element has proper ARIA labels
 */
export const hasProperAriaLabel = (element) => {
  return (
    element.hasAttribute('aria-label') ||
    element.hasAttribute('aria-labelledby') ||
    element.textContent.trim().length > 0
  );
};

/**
 * Find all focusable elements
 */
export const getFocusableElements = (container) => {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',');

  return Array.from(container.querySelectorAll(selector));
};

/**
 * Simulate keyboard navigation
 */
export const simulateKeyboardNavigation = async (container, userEvent) => {
  const focusableElements = getFocusableElements(container);
  const results = [];

  for (let i = 0; i < focusableElements.length; i++) {
    await userEvent.tab();
    results.push({
      element: focusableElements[i],
      hasFocus: document.activeElement === focusableElements[i],
    });
  }

  return results;
};

// ============================================================================
// Responsive Testing Helpers
// ============================================================================

/**
 * Test component at all breakpoints
 */
export const testAtAllBreakpoints = (renderFn, testFn) => {
  const allViewports = [
    ...Object.values(VIEWPORTS.mobile),
    ...Object.values(VIEWPORTS.tablet),
    ...Object.values(VIEWPORTS.desktop),
  ];

  return allViewports.map((viewport) => {
    setViewport(viewport.width, viewport.height);
    const result = renderFn();
    const testResult = testFn(result, viewport);
    return { viewport, ...testResult };
  });
};

/**
 * Check touch target size
 */
export const checkTouchTargetSize = (element, minSize = 44) => {
  const rect = element.getBoundingClientRect();
  return {
    width: rect.width,
    height: rect.height,
    meetsMinimum: rect.width >= minSize && rect.height >= minSize,
  };
};

// ============================================================================
// Mock LocalStorage
// ============================================================================

export const createMockLocalStorage = () => {
  let store = {};

  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }),
  };
};

// ============================================================================
// Visual Regression Helpers
// ============================================================================

/**
 * Generate snapshot name
 */
export const generateSnapshotName = (themeName, componentName, variant = '') => {
  const parts = [themeName, componentName, variant].filter(Boolean);
  return parts.join('--');
};

/**
 * Compare theme configurations
 */
export const compareThemeConfigs = (theme1, theme2) => {
  const differences = {
    colors: {},
    typography: {},
    spacing: {},
  };

  // Compare colors
  Object.keys(theme1.colors).forEach((key) => {
    if (JSON.stringify(theme1.colors[key]) !== JSON.stringify(theme2.colors[key])) {
      differences.colors[key] = {
        theme1: theme1.colors[key],
        theme2: theme2.colors[key],
      };
    }
  });

  // Compare typography
  Object.keys(theme1.typography).forEach((key) => {
    if (JSON.stringify(theme1.typography[key]) !== JSON.stringify(theme2.typography[key])) {
      differences.typography[key] = {
        theme1: theme1.typography[key],
        theme2: theme2.typography[key],
      };
    }
  });

  return differences;
};

// ============================================================================
// Test Cleanup
// ============================================================================

/**
 * Clean up after theme tests
 */
export const cleanupThemeTests = () => {
  // Reset document root
  document.documentElement.className = '';
  document.documentElement.removeAttribute('style');

  // Reset viewport
  window.innerWidth = 1024;
  window.innerHeight = 768;

  // Clear localStorage
  if (window.localStorage) {
    window.localStorage.clear();
  }

  // Clear mocks
  jest.clearAllMocks();
};

/**
 * Setup theme test environment
 */
export const setupThemeTestEnvironment = () => {
  // Mock matchMedia
  window.matchMedia = createMatchMedia(1024);

  // Mock localStorage
  const mockStorage = createMockLocalStorage();
  Object.defineProperty(window, 'localStorage', {
    value: mockStorage,
    writable: true,
  });

  // Mock IntersectionObserver
  global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
    takeRecords() {
      return [];
    }
  };

  // Mock ResizeObserver
  global.ResizeObserver = class ResizeObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
  };

  return {
    cleanup: cleanupThemeTests,
  };
};

// ============================================================================
// Exports
// ============================================================================

export default {
  // Viewport utilities
  VIEWPORTS,
  setViewport,
  createMatchMedia,

  // Theme constants
  THEME_IDS,
  THEME_NAMES,
  EXPECTED_COLORS,

  // Color utilities
  hexToRgb,
  getLuminance,
  getContrastRatio,
  meetsWCAGContrast,
  isValidHexColor,

  // Performance utilities
  measurePerformance,
  measureAsync,
  measureMultiple,
  measureFrameRate,

  // Mock data
  generateMockChatMessages,
  generateMockDocuments,
  generateMockUser,

  // Accessibility utilities
  isKeyboardAccessible,
  hasProperAriaLabel,
  getFocusableElements,
  simulateKeyboardNavigation,

  // Responsive utilities
  testAtAllBreakpoints,
  checkTouchTargetSize,

  // Storage utilities
  createMockLocalStorage,

  // Visual regression
  generateSnapshotName,
  compareThemeConfigs,

  // Test environment
  setupThemeTestEnvironment,
  cleanupThemeTests,
};
