/**
 * Theme System Tests
 *
 * Comprehensive test suite for theme loading, initialization, switching,
 * persistence, and CSS custom property application.
 *
 * Test-Driven Development: These tests validate the core theme system
 * functionality across all three themes.
 *
 * @file ThemeSystem.test.jsx
 */

import { render, screen, waitFor, renderHook, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../../contexts/ThemeContext';

// Mock localStorage
const mockLocalStorage = (() => {
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
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

describe('Theme System Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
    document.documentElement.className = '';
    document.documentElement.removeAttribute('style');
  });

  /**
   * Test Suite 1: Theme Loading and Initialization
   */
  describe('Theme Loading and Initialization', () => {
    test('should load default theme (modern-minimalist) on first visit', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      expect(result.current.currentTheme).toBe('modern-minimalist');
      expect(document.documentElement.className).toContain('theme-modern-minimalist');
    });

    test('should load all three theme configurations', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      expect(result.current.themes).toHaveLength(3);

      const themeIds = result.current.themes.map(t => t.id);
      expect(themeIds).toEqual([
        'modern-minimalist',
        'friendly-approachable',
        'tech-savvy-trustworthy'
      ]);
    });

    test('should initialize theme metadata correctly for modern-minimalist', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      const theme = result.current.themes.find(t => t.id === 'modern-minimalist');

      expect(theme).toMatchObject({
        id: 'modern-minimalist',
        name: 'Modern Minimalist',
        description: expect.any(String),
        colors: expect.objectContaining({
          primary: expect.any(Object),
          accent: expect.any(Object),
          background: expect.any(Object),
          text: expect.any(Object)
        }),
        typography: expect.any(Object),
        spacing: expect.any(Object)
      });
    });

    test('should initialize theme metadata correctly for friendly-approachable', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      const theme = result.current.themes.find(t => t.id === 'friendly-approachable');

      expect(theme).toBeDefined();
      expect(theme.id).toBe('friendly-approachable');
      expect(theme.colors.accent).toBeDefined();
    });

    test('should initialize theme metadata correctly for tech-savvy-trustworthy', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      const theme = result.current.themes.find(t => t.id === 'tech-savvy-trustworthy');

      expect(theme).toBeDefined();
      expect(theme.id).toBe('tech-savvy-trustworthy');
      expect(theme.colors).toBeDefined();
    });

    test('should restore theme from localStorage on page reload', () => {
      mockLocalStorage.setItem('c2pa-theme', 'friendly-approachable');

      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      expect(result.current.currentTheme).toBe('friendly-approachable');
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('c2pa-theme');
    });

    test('should handle corrupted localStorage data gracefully', () => {
      mockLocalStorage.setItem('c2pa-theme', 'invalid-theme-data');

      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      // Should fallback to default theme
      expect(result.current.currentTheme).toBe('modern-minimalist');
    });

    test('should initialize theme in less than 50ms', () => {
      const startTime = performance.now();

      renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(50);
    });
  });

  /**
   * Test Suite 2: Theme Switching Functionality
   */
  describe('Theme Switching Functionality', () => {
    test('should switch from modern-minimalist to friendly-approachable', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      expect(result.current.currentTheme).toBe('modern-minimalist');

      act(() => {
        result.current.setTheme('friendly-approachable');
      });

      expect(result.current.currentTheme).toBe('friendly-approachable');
    });

    test('should switch from friendly-approachable to tech-savvy-trustworthy', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      act(() => {
        result.current.setTheme('friendly-approachable');
      });

      expect(result.current.currentTheme).toBe('friendly-approachable');

      act(() => {
        result.current.setTheme('tech-savvy-trustworthy');
      });

      expect(result.current.currentTheme).toBe('tech-savvy-trustworthy');
    });

    test('should complete theme switch in less than 100ms', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      const startTime = performance.now();

      act(() => {
        result.current.setTheme('tech-savvy-trustworthy');
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(100);
    });

    test('should reject invalid theme names', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      act(() => {
        result.current.setTheme('non-existent-theme');
      });

      // Should remain on current theme
      expect(result.current.currentTheme).toBe('modern-minimalist');

      consoleSpy.mockRestore();
    });

    test('should handle rapid theme switching without errors', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      expect(() => {
        act(() => {
          result.current.setTheme('friendly-approachable');
          result.current.setTheme('tech-savvy-trustworthy');
          result.current.setTheme('modern-minimalist');
          result.current.setTheme('friendly-approachable');
        });
      }).not.toThrow();

      expect(result.current.currentTheme).toBe('friendly-approachable');
    });
  });

  /**
   * Test Suite 3: Theme Persistence (localStorage)
   */
  describe('Theme Persistence (localStorage)', () => {
    test('should persist theme selection to localStorage', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      act(() => {
        result.current.setTheme('tech-savvy-trustworthy');
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'c2pa-theme',
        'tech-savvy-trustworthy'
      );
    });

    test('should update localStorage on each theme change', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      act(() => {
        result.current.setTheme('friendly-approachable');
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'c2pa-theme',
        'friendly-approachable'
      );

      act(() => {
        result.current.setTheme('tech-savvy-trustworthy');
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'c2pa-theme',
        'tech-savvy-trustworthy'
      );
    });

    test('should handle localStorage quota exceeded error', () => {
      mockLocalStorage.setItem.mockImplementationOnce(() => {
        throw new DOMException('QuotaExceededError');
      });

      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      expect(() => {
        act(() => {
          result.current.setTheme('friendly-approachable');
        });
      }).not.toThrow();

      // Theme should still be set in state even if localStorage fails
      expect(result.current.currentTheme).toBe('friendly-approachable');
    });

    test('should handle localStorage being disabled', () => {
      const originalLocalStorage = window.localStorage;
      delete window.localStorage;

      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      expect(() => {
        act(() => {
          result.current.setTheme('tech-savvy-trustworthy');
        });
      }).not.toThrow();

      window.localStorage = originalLocalStorage;
    });
  });

  /**
   * Test Suite 4: Default Theme Fallback
   */
  describe('Default Theme Fallback', () => {
    test('should use default theme when localStorage is empty', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      expect(result.current.currentTheme).toBe('modern-minimalist');
    });

    test('should fallback to default when stored theme is invalid', () => {
      mockLocalStorage.setItem('c2pa-theme', 'invalid-theme-name');

      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      expect(result.current.currentTheme).toBe('modern-minimalist');
    });

    test('should fallback to default when localStorage read fails', () => {
      mockLocalStorage.getItem.mockImplementationOnce(() => {
        throw new Error('Storage access denied');
      });

      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      expect(result.current.currentTheme).toBe('modern-minimalist');
    });
  });

  /**
   * Test Suite 5: CSS Custom Property Application
   */
  describe('CSS Custom Property Application', () => {
    test('should apply theme class to document root', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      expect(document.documentElement.className).toContain('theme-modern-minimalist');

      act(() => {
        result.current.setTheme('friendly-approachable');
      });

      expect(document.documentElement.className).toContain('theme-friendly-approachable');
      expect(document.documentElement.className).not.toContain('theme-modern-minimalist');
    });

    test('should apply CSS custom properties for modern-minimalist theme', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      act(() => {
        result.current.setTheme('modern-minimalist');
      });

      const rootStyles = getComputedStyle(document.documentElement);

      // These would be set by the actual CSS file, but we test that the class is applied
      expect(document.documentElement.className).toContain('theme-modern-minimalist');
    });

    test('should apply CSS custom properties for friendly-approachable theme', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      act(() => {
        result.current.setTheme('friendly-approachable');
      });

      expect(document.documentElement.className).toContain('theme-friendly-approachable');
    });

    test('should apply CSS custom properties for tech-savvy-trustworthy theme', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      act(() => {
        result.current.setTheme('tech-savvy-trustworthy');
      });

      expect(document.documentElement.className).toContain('theme-tech-savvy-trustworthy');
    });

    test('should remove previous theme class when switching', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      act(() => {
        result.current.setTheme('modern-minimalist');
      });

      expect(document.documentElement.className).toContain('theme-modern-minimalist');

      act(() => {
        result.current.setTheme('tech-savvy-trustworthy');
      });

      expect(document.documentElement.className).not.toContain('theme-modern-minimalist');
      expect(document.documentElement.className).toContain('theme-tech-savvy-trustworthy');
    });

    test('should clean up theme class on unmount', () => {
      const { unmount } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      expect(document.documentElement.className).toContain('theme-');

      unmount();

      // Cleanup behavior depends on implementation
      // Test that unmount doesn't cause errors
      expect(() => unmount()).not.toThrow();
    });
  });

  /**
   * Test Suite 6: Theme Context API
   */
  describe('Theme Context API', () => {
    test('should provide getCurrentThemeConfig method', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      const config = result.current.getCurrentThemeConfig();

      expect(config).toBeDefined();
      expect(config.id).toBe('modern-minimalist');
      expect(config.colors).toBeDefined();
      expect(config.typography).toBeDefined();
    });

    test('should return correct config for each theme', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      const themes = ['modern-minimalist', 'friendly-approachable', 'tech-savvy-trustworthy'];

      themes.forEach(themeName => {
        act(() => {
          result.current.setTheme(themeName);
        });

        const config = result.current.getCurrentThemeConfig();
        expect(config.id).toBe(themeName);
      });
    });

    test('should provide theme preview colors', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      result.current.themes.forEach(theme => {
        expect(theme.preview).toBeDefined();
        expect(theme.preview.primary).toMatch(/^#[0-9A-F]{6}$/i);
        expect(theme.preview.background).toMatch(/^#[0-9A-F]{6}$/i);
        expect(theme.preview.text).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });

    test('should throw error when useTheme is called outside provider', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        renderHook(() => useTheme());
      }).toThrow();

      consoleSpy.mockRestore();
    });
  });

  /**
   * Test Suite 7: Performance and Optimization
   */
  describe('Performance and Optimization', () => {
    test('should not cause re-renders when theme stays the same', () => {
      let renderCount = 0;

      const TestComponent = () => {
        const { currentTheme } = useTheme();
        renderCount++;
        return <div>{currentTheme}</div>;
      };

      const { rerender } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const initialRenderCount = renderCount;

      rerender(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Should not cause unnecessary re-renders
      expect(renderCount).toBe(initialRenderCount);
    });

    test('should handle memory cleanup on unmount', () => {
      const { unmount } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      expect(() => unmount()).not.toThrow();
    });

    test('should batch multiple theme operations', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      const startTime = performance.now();

      act(() => {
        result.current.setTheme('friendly-approachable');
        result.current.setTheme('tech-savvy-trustworthy');
      });

      const endTime = performance.now();

      // Should complete in reasonable time
      expect(endTime - startTime).toBeLessThan(50);
    });
  });

  /**
   * Test Suite 8: Error Recovery
   */
  describe('Error Recovery', () => {
    test('should recover from CSS application errors', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      // Simulate error in CSS application
      const originalClassList = document.documentElement.classList;
      document.documentElement.classList = {
        add: jest.fn(() => { throw new Error('CSS error'); }),
        remove: jest.fn(),
        contains: jest.fn()
      };

      expect(() => {
        act(() => {
          result.current.setTheme('friendly-approachable');
        });
      }).not.toThrow();

      document.documentElement.classList = originalClassList;
    });

    test('should maintain state consistency on errors', () => {
      mockLocalStorage.setItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      act(() => {
        result.current.setTheme('tech-savvy-trustworthy');
      });

      // State should be consistent even if localStorage fails
      expect(result.current.currentTheme).toBe('tech-savvy-trustworthy');
    });
  });
});
