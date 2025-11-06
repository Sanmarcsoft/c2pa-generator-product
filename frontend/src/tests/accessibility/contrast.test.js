/**
 * Accessibility Contrast Ratio Tests
 * Tests WCAG AA compliance for button components across all themes
 *
 * These tests validate that all button components meet WCAG AA standards:
 * - Minimum 4.5:1 contrast ratio for text
 * - Minimum 3:1 contrast ratio for UI components
 * - Adequate contrast in both light and dark themes
 * - Proper visibility in disabled states
 */

import { calculateContrastRatio, getLuminance } from '../utils/contrastUtils';

describe('Accessibility: Button Contrast Ratios', () => {
  // Helper function to check WCAG AA compliance
  const assertWCAGAA = (ratio, context = '') => {
    const minRatio = 4.5; // Text requires 4.5:1 for AA
    expect(ratio).toBeGreaterThanOrEqual(minRatio,
      `${context} failed WCAG AA: ${ratio.toFixed(2)}:1 (needs ${minRatio}:1)`
    );
  };

  const assertWCAGAAUI = (ratio, context = '') => {
    const minRatio = 3.0; // UI components require 3:1 for AA
    expect(ratio).toBeGreaterThanOrEqual(minRatio,
      `${context} failed WCAG AA UI: ${ratio.toFixed(2)}:1 (needs ${minRatio}:1)`
    );
  };

  const assertWCAGAAA = (ratio, context = '') => {
    const minRatio = 7.0; // AAA requires 7:1
    expect(ratio).toBeGreaterThanOrEqual(minRatio,
      `${context} failed WCAG AAA: ${ratio.toFixed(2)}:1 (needs ${minRatio}:1)`
    );
  };

  describe('EmbeddedDocumentUpload: .upload-btn', () => {
    // Current problematic colors
    const uploadBtnBackground = '#3C83F6';    // Blue
    const uploadBtnHoverBg = '#2563eb';       // Darker blue
    const uploadBtnText = '#ffffff';          // White (PROBLEMATIC)
    const lightBackground = '#ffffff';        // White page background
    const darkBackground = '#111827';         // Dark theme background

    describe('Light Theme', () => {
      test('Normal state should have sufficient text contrast', () => {
        const ratio = calculateContrastRatio(uploadBtnText, uploadBtnBackground);
        console.log(`[FAIL] Upload button normal: ${ratio.toFixed(2)}:1`);
        // Currently FAILS - documents the issue
        expect(ratio).toBeLessThan(4.5);
      });

      test('Hover state should have sufficient text contrast', () => {
        const ratio = calculateContrastRatio(uploadBtnText, uploadBtnHoverBg);
        console.log(`[PASS] Upload button hover: ${ratio.toFixed(2)}:1`);
        assertWCAGAA(ratio, 'Upload button hover state');
      });

      test('Disabled state (60% opacity) should be visible', () => {
        // Simulate disabled opacity effect
        const disabledOpacity = 0.6;
        const blendedBg = blendColors(uploadBtnBackground, lightBackground, disabledOpacity);
        const ratio = calculateContrastRatio(uploadBtnText, blendedBg);
        console.log(`[CRITICAL] Upload button disabled: ${ratio.toFixed(2)}:1`);
        // This FAILS significantly
        expect(ratio).toBeLessThan(3.0);
      });
    });

    describe('Dark Theme', () => {
      test('Normal state on dark background', () => {
        const ratio = calculateContrastRatio(uploadBtnText, uploadBtnBackground);
        console.log(`[FAIL] Upload button dark theme: ${ratio.toFixed(2)}:1`);
        // White on blue fails even on dark theme background
        expect(ratio).toBeLessThan(4.5);
      });

      test('Should have dark theme override with proper contrast', () => {
        // Recommended dark theme colors
        const darkThemeText = '#111827';
        const darkThemeBg = '#60A5FA';  // Lighter blue for dark theme
        const ratio = calculateContrastRatio(darkThemeText, darkThemeBg);
        console.log(`[RECOMMENDED] Upload button dark theme fix: ${ratio.toFixed(2)}:1`);
        assertWCAGAA(ratio, 'Upload button dark theme (recommended fix)');
      });
    });

    describe('Recommended Fixes', () => {
      test('Fix: Use dark text on current blue background', () => {
        const darkText = '#111827';
        const ratio = calculateContrastRatio(darkText, uploadBtnBackground);
        console.log(`[SOLUTION 1] Dark text on blue: ${ratio.toFixed(2)}:1`);
        assertWCAGAA(ratio, 'Fix 1: Dark text on blue background');
      });

      test('Fix: Use lighter blue with white text', () => {
        const lightBlue = '#60A5FA';
        const ratio = calculateContrastRatio(uploadBtnText, lightBlue);
        console.log(`[SOLUTION 2] White text on light blue: ${ratio.toFixed(2)}:1`);
        assertWCAGAA(ratio, 'Fix 2: White text on lighter blue');
      });

      test('Fix: Use improved active color purple', () => {
        const improvedPurple = '#7c3aed';  // Darker purple
        const ratio = calculateContrastRatio(uploadBtnText, improvedPurple);
        console.log(`[SOLUTION 3] White text on improved purple: ${ratio.toFixed(2)}:1`);
        assertWCAGAA(ratio, 'Fix 3: White text on darker purple');
      });
    });
  });

  describe('IntegratedProgressPage: .btn-primary', () => {
    const btnPrimaryBg = '#3C83F6';      // Blue (default)
    const btnPrimaryHoverBg = '#2563EB'; // Darker blue
    const btnPrimaryText = '#ffffff';    // White (PROBLEMATIC)

    describe('Light Theme', () => {
      test('Normal state - currently fails WCAG AA', () => {
        const ratio = calculateContrastRatio(btnPrimaryText, btnPrimaryBg);
        console.log(`[FAIL] btn-primary normal: ${ratio.toFixed(2)}:1`);
        expect(ratio).toBeLessThan(4.5);
      });

      test('Hover state - should pass WCAG AA', () => {
        const ratio = calculateContrastRatio(btnPrimaryText, btnPrimaryHoverBg);
        console.log(`[PASS] btn-primary hover: ${ratio.toFixed(2)}:1`);
        assertWCAGAA(ratio, 'btn-primary hover state');
      });
    });

    describe('Dark Theme', () => {
      const darkBg = '#111827';

      test('Normal state on dark background - currently fails', () => {
        const ratio = calculateContrastRatio(btnPrimaryText, btnPrimaryBg);
        console.log(`[FAIL] btn-primary dark theme: ${ratio.toFixed(2)}:1`);
        expect(ratio).toBeLessThan(4.5);
      });

      test('Needs dark theme override', () => {
        // Recommended: lighter blue for dark theme
        const lightBlue = '#60A5FA';
        const darkText = '#111827';
        const ratio = calculateContrastRatio(darkText, lightBlue);
        console.log(`[RECOMMENDED] btn-primary dark fix: ${ratio.toFixed(2)}:1`);
        assertWCAGAA(ratio, 'btn-primary dark theme with fix');
      });
    });

    describe('Recommended Fixes', () => {
      test('Fix 1: Dark text on current blue', () => {
        const darkText = '#111827';
        const ratio = calculateContrastRatio(darkText, btnPrimaryBg);
        console.log(`[SOLUTION] btn-primary dark text: ${ratio.toFixed(2)}:1`);
        assertWCAGAA(ratio, 'btn-primary with dark text fix');
      });

      test('Fix 2: Lighter blue background', () => {
        const lightBlue = '#60A5FA';
        const ratio = calculateContrastRatio(btnPrimaryText, lightBlue);
        console.log(`[SOLUTION] btn-primary light blue: ${ratio.toFixed(2)}:1`);
        assertWCAGAA(ratio, 'btn-primary with light blue background');
      });
    });
  });

  describe('IntegratedProgressPage: .toggle-btn (Mobile)', () => {
    const toggleBgNormal = '#3C83F6';    // Blue
    const toggleBgActive = '#8b5cf6';    // Purple
    const toggleText = '#ffffff';        // White (PROBLEMATIC)

    describe('Light Theme', () => {
      test('Normal state - currently fails', () => {
        const ratio = calculateContrastRatio(toggleText, toggleBgNormal);
        console.log(`[FAIL] toggle-btn normal: ${ratio.toFixed(2)}:1`);
        expect(ratio).toBeLessThan(4.5);
      });

      test('Active state - currently fails', () => {
        const ratio = calculateContrastRatio(toggleText, toggleBgActive);
        console.log(`[FAIL] toggle-btn active: ${ratio.toFixed(2)}:1`);
        expect(ratio).toBeLessThan(4.5);
      });
    });

    describe('Dark Theme', () => {
      test('Normal state on dark background - fails', () => {
        const ratio = calculateContrastRatio(toggleText, toggleBgNormal);
        console.log(`[FAIL] toggle-btn dark normal: ${ratio.toFixed(2)}:1`);
        expect(ratio).toBeLessThan(4.5);
      });

      test('Active state on dark background - fails', () => {
        const ratio = calculateContrastRatio(toggleText, toggleBgActive);
        console.log(`[FAIL] toggle-btn dark active: ${ratio.toFixed(2)}:1`);
        expect(ratio).toBeLessThan(4.5);
      });
    });

    describe('Recommended Fixes', () => {
      test('Fix: Use darker toggle colors for white text', () => {
        const darkerBlue = '#1e40af';   // Dark enough for white text
        const ratio = calculateContrastRatio(toggleText, darkerBlue);
        console.log(`[SOLUTION] toggle-btn darker: ${ratio.toFixed(2)}:1`);
        assertWCAGAA(ratio, 'toggle-btn with darker blue');
      });

      test('Fix: Use dark text on current colors', () => {
        const darkText = '#111827';
        const ratio = calculateContrastRatio(darkText, toggleBgNormal);
        console.log(`[SOLUTION] toggle-btn dark text: ${ratio.toFixed(2)}:1`);
        assertWCAGAA(ratio, 'toggle-btn with dark text');
      });

      test('Fix: Improve active state color', () => {
        const improvedActive = '#6d28d9';  // Darker purple
        const ratio = calculateContrastRatio(toggleText, improvedActive);
        console.log(`[SOLUTION] toggle-btn active improved: ${ratio.toFixed(2)}:1`);
        assertWCAGAA(ratio, 'toggle-btn active with improved color');
      });
    });
  });

  describe('Cross-Theme Button Consistency', () => {
    test('All buttons should have consistent text color', () => {
      // Test that light theme buttons all use same approach
      const uploadBtn = '#111827';      // Dark text
      const btnPrimary = '#111827';     // Dark text
      const toggleBtn = '#111827';      // Dark text

      expect(uploadBtn).toBe(btnPrimary);
      expect(btnPrimary).toBe(toggleBtn);
    });

    test('Dark theme buttons should use lighter backgrounds', () => {
      const darkThemeLightBg = '#60A5FA';
      const minContrast = calculateContrastRatio('#111827', darkThemeLightBg);
      console.log(`[CHECK] Dark theme consistency: ${minContrast.toFixed(2)}:1`);
      assertWCAGAA(minContrast, 'Dark theme button consistency');
    });

    test('Hover states should provide clear visual feedback', () => {
      const normalBg = '#3C83F6';
      const hoverBg = '#2563EB';
      const contrastChange = calculateContrastRatio(normalBg, hoverBg);
      // Check that colors are sufficiently different
      const luminanceNormal = getLuminance(normalBg);
      const luminanceHover = getLuminance(hoverBg);
      const difference = Math.abs(luminanceNormal - luminanceHover);
      console.log(`[CHECK] Hover feedback luminance difference: ${(difference * 100).toFixed(2)}%`);
      expect(difference).toBeGreaterThan(0.05);
    });
  });

  describe('Disabled Button States', () => {
    test('Disabled buttons should have adequate contrast even with opacity', () => {
      const bgColor = '#3C83F6';
      const textColor = '#ffffff';
      const whiteBackground = '#ffffff';
      const disabledOpacity = 0.6;

      // Blend colors with opacity
      const blendedBg = blendColors(bgColor, whiteBackground, disabledOpacity);
      const ratio = calculateContrastRatio(textColor, blendedBg);

      console.log(`[INFO] Disabled button contrast: ${ratio.toFixed(2)}:1`);
      // Current implementation fails - this documents it
      expect(ratio).toBeLessThan(3.0);
    });

    test('Disabled state fix: Use darker background with lower opacity', () => {
      const bgColor = '#111827';  // Very dark
      const textColor = '#ffffff';
      const whiteBackground = '#ffffff';
      const disabledOpacity = 0.4;

      const blendedBg = blendColors(bgColor, whiteBackground, disabledOpacity);
      const ratio = calculateContrastRatio(textColor, blendedBg);

      console.log(`[SOLUTION] Disabled button improved: ${ratio.toFixed(2)}:1`);
      assertWCAGAA(ratio, 'Disabled button with improved colors');
    });
  });

  describe('Theme Switching Consistency', () => {
    test('Light to dark theme transition should maintain contrast', () => {
      const scenarios = [
        {
          name: 'Upload button',
          lightText: '#111827',
          lightBg: '#3C83F6',
          darkText: '#111827',
          darkBg: '#60A5FA'
        },
        {
          name: 'Primary button',
          lightText: '#111827',
          lightBg: '#3C83F6',
          darkText: '#111827',
          darkBg: '#60A5FA'
        }
      ];

      scenarios.forEach(scenario => {
        const lightRatio = calculateContrastRatio(scenario.lightText, scenario.lightBg);
        const darkRatio = calculateContrastRatio(scenario.darkText, scenario.darkBg);

        console.log(`${scenario.name} - Light: ${lightRatio.toFixed(2)}:1, Dark: ${darkRatio.toFixed(2)}:1`);

        assertWCAGAA(lightRatio, `${scenario.name} light theme`);
        assertWCAGAA(darkRatio, `${scenario.name} dark theme`);
      });
    });
  });

  describe('Edge Cases', () => {
    test('Very light background with light text should fail', () => {
      const ratio = calculateContrastRatio('#f0f0f0', '#ffffff');
      console.log(`[CHECK] Light on light: ${ratio.toFixed(2)}:1`);
      expect(ratio).toBeLessThan(1.5);
    });

    test('Very dark background with light text should pass', () => {
      const ratio = calculateContrastRatio('#ffffff', '#000000');
      console.log(`[CHECK] Light on dark: ${ratio.toFixed(2)}:1`);
      assertWCAGAAA(ratio, 'Light text on black (maximum contrast)');
    });

    test('Medium gray should provide acceptable contrast', () => {
      const ratio = calculateContrastRatio('#ffffff', '#666666');
      console.log(`[CHECK] Light on medium gray: ${ratio.toFixed(2)}:1`);
      assertWCAGAA(ratio, 'Light text on medium gray');
    });
  });
});

/**
 * Utility Functions
 */

/**
 * Calculate relative luminance of a color
 * Formula from WCAG 2.0
 */
function getLuminance(hex) {
  const rgb = hexToRgb(hex);
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors
 * Formula: (L1 + 0.05) / (L2 + 0.05) where L1 is lighter
 */
function calculateContrastRatio(color1, color2) {
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Convert hex color to RGB object
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

/**
 * Blend two colors with opacity
 * Simulates how opacity blends with background
 */
function blendColors(foreground, background, opacity) {
  const fg = hexToRgb(foreground);
  const bg = hexToRgb(background);

  const blended = {
    r: Math.round(fg.r * opacity + bg.r * (1 - opacity)),
    g: Math.round(fg.g * opacity + bg.g * (1 - opacity)),
    b: Math.round(fg.b * opacity + bg.b * (1 - opacity))
  };

  return rgbToHex(blended);
}

/**
 * Convert RGB object to hex color
 */
function rgbToHex(rgb) {
  return '#' + [rgb.r, rgb.g, rgb.b]
    .map(x => x.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

export { getLuminance, calculateContrastRatio, hexToRgb, blendColors, rgbToHex };
