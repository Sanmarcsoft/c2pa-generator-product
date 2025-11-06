/**
 * Contrast Ratio Utilities
 * WCAG 2.0 compliant contrast ratio calculations
 *
 * Reference: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum
 */

/**
 * Calculate relative luminance of a color
 * Formula from WCAG 2.0 relative luminance definition
 *
 * @param {string} hex - Hex color code (e.g., '#3C83F6')
 * @returns {number} Luminance value between 0 and 1
 */
export function getLuminance(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  // Normalize RGB values to 0-1
  let [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => val / 255);

  // Apply gamma correction
  r = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  g = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  b = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

  // Calculate luminance
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors
 * Formula: (L1 + 0.05) / (L2 + 0.05) where L1 is the lighter color
 *
 * @param {string} color1 - First hex color
 * @param {string} color2 - Second hex color
 * @returns {number} Contrast ratio (typically between 1 and 21)
 */
export function calculateContrastRatio(color1, color2) {
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);

  // Lighter color should be L1
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG AA standard
 *
 * @param {number} ratio - Contrast ratio
 * @param {string} type - 'text' or 'ui' (default: 'text')
 * @returns {boolean} True if meets WCAG AA
 */
export function meetsWCAGAA(ratio, type = 'text') {
  const minRatio = type === 'ui' ? 3.0 : 4.5;
  return ratio >= minRatio;
}

/**
 * Check if contrast ratio meets WCAG AAA standard
 *
 * @param {number} ratio - Contrast ratio
 * @param {string} type - 'text' or 'ui' (default: 'text')
 * @returns {boolean} True if meets WCAG AAA
 */
export function meetsWCAGAAA(ratio, type = 'text') {
  const minRatio = type === 'ui' ? 3.0 : 7.0;
  return ratio >= minRatio;
}

/**
 * Get WCAG conformance level
 *
 * @param {number} ratio - Contrast ratio
 * @param {string} type - 'text' or 'ui'
 * @returns {string} 'AAA', 'AA', 'A', or 'FAIL'
 */
export function getWCAGLevel(ratio, type = 'text') {
  if (meetsWCAGAAA(ratio, type)) return 'AAA';
  if (meetsWCAGAA(ratio, type)) return 'AA';
  if (ratio >= 3.0) return 'A';
  return 'FAIL';
}

/**
 * Convert hex color to RGB object
 *
 * @param {string} hex - Hex color code
 * @returns {object|null} Object with r, g, b properties or null if invalid
 */
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Convert RGB object to hex color
 *
 * @param {object} rgb - Object with r, g, b properties
 * @returns {string} Hex color code
 */
export function rgbToHex(rgb) {
  const toHex = (value) => Math.round(Math.max(0, Math.min(255, value)))
    .toString(16)
    .padStart(2, '0');

  return '#' + toHex(rgb.r) + toHex(rgb.g) + toHex(rgb.b);
}

/**
 * Blend two colors with given opacity
 * Simulates how foreground with opacity appears over background
 *
 * @param {string} foreground - Foreground hex color
 * @param {string} background - Background hex color
 * @param {number} opacity - Foreground opacity (0-1)
 * @returns {string} Blended hex color
 */
export function blendColors(foreground, background, opacity) {
  const fg = hexToRgb(foreground);
  const bg = hexToRgb(background);

  if (!fg || !bg) return foreground;

  const blended = {
    r: fg.r * opacity + bg.r * (1 - opacity),
    g: fg.g * opacity + bg.g * (1 - opacity),
    b: fg.b * opacity + bg.b * (1 - opacity)
  };

  return rgbToHex(blended);
}

/**
 * Lighten a color by a given percentage
 *
 * @param {string} hex - Hex color code
 * @param {number} percent - Percentage to lighten (0-100)
 * @returns {string} Lightened hex color
 */
export function lightenColor(hex, percent) {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const amount = (percent / 100) * 255;
  rgb.r = Math.min(255, rgb.r + amount);
  rgb.g = Math.min(255, rgb.g + amount);
  rgb.b = Math.min(255, rgb.b + amount);

  return rgbToHex(rgb);
}

/**
 * Darken a color by a given percentage
 *
 * @param {string} hex - Hex color code
 * @param {number} percent - Percentage to darken (0-100)
 * @returns {string} Darkened hex color
 */
export function darkenColor(hex, percent) {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const amount = (percent / 100) * 255;
  rgb.r = Math.max(0, rgb.r - amount);
  rgb.g = Math.max(0, rgb.g - amount);
  rgb.b = Math.max(0, rgb.b - amount);

  return rgbToHex(rgb);
}

/**
 * Find optimal text color (black or white) for given background
 *
 * @param {string} bgColor - Background hex color
 * @returns {string} Either '#ffffff' (white) or '#111827' (dark charcoal)
 */
export function getOptimalTextColor(bgColor) {
  const luminance = getLuminance(bgColor);
  // If luminance > 0.5, background is light, use dark text
  // If luminance <= 0.5, background is dark, use white text
  return luminance > 0.5 ? '#111827' : '#ffffff';
}

/**
 * Generate color palette with validated contrast ratios
 *
 * @param {string} primaryColor - Primary hex color
 * @returns {object} Color palette with text colors
 */
export function generatePalette(primaryColor) {
  const darkText = '#111827';
  const lightText = '#ffffff';

  const contrastDark = calculateContrastRatio(darkText, primaryColor);
  const contrastLight = calculateContrastRatio(lightText, primaryColor);

  return {
    background: primaryColor,
    textDark: {
      color: darkText,
      ratio: contrastDark,
      wcag: getWCAGLevel(contrastDark, 'text')
    },
    textLight: {
      color: lightText,
      ratio: contrastLight,
      wcag: getWCAGLevel(contrastLight, 'text')
    },
    recommended: contrastDark > contrastLight ? darkText : lightText
  };
}

/**
 * Format contrast ratio for display
 *
 * @param {number} ratio - Contrast ratio
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted ratio (e.g., "4.50:1")
 */
export function formatRatio(ratio, decimals = 2) {
  return `${ratio.toFixed(decimals)}:1`;
}

/**
 * Create contrast report for color pair
 *
 * @param {string} textColor - Text hex color
 * @param {string} bgColor - Background hex color
 * @returns {object} Detailed contrast report
 */
export function generateContrastReport(textColor, bgColor) {
  const ratio = calculateContrastRatio(textColor, bgColor);
  const wcagLevel = getWCAGLevel(ratio, 'text');
  const wcagUILevel = getWCAGLevel(ratio, 'ui');

  return {
    textColor,
    backgroundColor: bgColor,
    ratio: ratio,
    ratioFormatted: formatRatio(ratio),
    wcag: {
      text: {
        level: wcagLevel,
        passes: meetsWCAGAA(ratio, 'text')
      },
      ui: {
        level: wcagUILevel,
        passes: meetsWCAGAA(ratio, 'ui')
      }
    },
    recommendation: {
      passesAA: meetsWCAGAA(ratio, 'text'),
      passesAAA: meetsWCAGAAA(ratio, 'text'),
      message: generateRecommendation(ratio)
    }
  };
}

/**
 * Generate recommendation message based on contrast ratio
 *
 * @param {number} ratio - Contrast ratio
 * @returns {string} Recommendation message
 */
function generateRecommendation(ratio) {
  if (ratio >= 7.0) {
    return 'WCAG AAA - Excellent contrast, suitable for all text sizes';
  } else if (ratio >= 4.5) {
    return 'WCAG AA - Good contrast, suitable for normal text';
  } else if (ratio >= 3.0) {
    return 'WCAG A - Acceptable for large text only';
  } else {
    return 'WCAG Fail - Insufficient contrast, needs improvement';
  }
}

/**
 * Compare two color combinations for contrast
 *
 * @param {object} combo1 - { text: '#...', bg: '#...' }
 * @param {object} combo2 - { text: '#...', bg: '#...' }
 * @returns {object} Comparison result
 */
export function compareContrast(combo1, combo2) {
  const ratio1 = calculateContrastRatio(combo1.text, combo1.bg);
  const ratio2 = calculateContrastRatio(combo2.text, combo2.bg);
  const difference = ratio2 - ratio1;
  const improvement = (difference / ratio1) * 100;

  return {
    combo1: {
      ratio: formatRatio(ratio1),
      level: getWCAGLevel(ratio1, 'text')
    },
    combo2: {
      ratio: formatRatio(ratio2),
      level: getWCAGLevel(ratio2, 'text')
    },
    difference: formatRatio(difference),
    improvementPercent: improvement.toFixed(1),
    isBetter: ratio2 > ratio1
  };
}

/**
 * Find best text color from array for given background
 *
 * @param {string} bgColor - Background hex color
 * @param {array} textColors - Array of text hex colors to test
 * @returns {object} Best color with its contrast ratio
 */
export function findBestTextColor(bgColor, textColors = ['#ffffff', '#111827']) {
  const results = textColors.map(textColor => ({
    color: textColor,
    ratio: calculateContrastRatio(textColor, bgColor),
    level: getWCAGLevel(calculateContrastRatio(textColor, bgColor), 'text')
  }));

  return results.reduce((best, current) =>
    current.ratio > best.ratio ? current : best
  );
}

/**
 * Create accessibility audit for button colors
 *
 * @param {string} normalBg - Normal state background color
 * @param {string} hoverBg - Hover state background color
 * @param {string} textColor - Text color
 * @returns {object} Comprehensive audit
 */
export function auditButtonColors(normalBg, hoverBg, textColor) {
  const normalRatio = calculateContrastRatio(textColor, normalBg);
  const hoverRatio = calculateContrastRatio(textColor, hoverBg);
  const bgLuminance = getLuminance(normalBg);
  const textLuminance = getLuminance(textColor);

  return {
    normal: {
      ratio: formatRatio(normalRatio),
      level: getWCAGLevel(normalRatio, 'text'),
      passes: meetsWCAGAA(normalRatio, 'text')
    },
    hover: {
      ratio: formatRatio(hoverRatio),
      level: getWCAGLevel(hoverRatio, 'text'),
      passes: meetsWCAGAA(hoverRatio, 'text')
    },
    feedback: {
      luminanceDifference: Math.abs(bgLuminance - getLuminance(hoverBg)),
      isDistinguishable: Math.abs(bgLuminance - getLuminance(hoverBg)) > 0.05
    },
    overallPass: meetsWCAGAA(normalRatio, 'text') && meetsWCAGAA(hoverRatio, 'text'),
    issues: [
      ...(!meetsWCAGAA(normalRatio, 'text') ? ['Normal state fails WCAG AA'] : []),
      ...(!meetsWCAGAA(hoverRatio, 'text') ? ['Hover state fails WCAG AA'] : []),
      ...(!Math.abs(bgLuminance - getLuminance(hoverBg)) > 0.05 ? ['Hover state not visually distinct'] : [])
    ]
  };
}

export default {
  getLuminance,
  calculateContrastRatio,
  meetsWCAGAA,
  meetsWCAGAAA,
  getWCAGLevel,
  hexToRgb,
  rgbToHex,
  blendColors,
  lightenColor,
  darkenColor,
  getOptimalTextColor,
  generatePalette,
  formatRatio,
  generateContrastReport,
  compareContrast,
  findBestTextColor,
  auditButtonColors
};
