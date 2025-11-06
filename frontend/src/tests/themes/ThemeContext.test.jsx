/**
 * ThemeContext Tests - Theme System Provider
 *
 * Tests the core theme management functionality including:
 * - Theme initialization from localStorage and API
 * - Theme switching and state management
 * - Persistence to localStorage and database
 * - Error handling and fallback behavior
 * - Theme validation
 *
 * Test-Driven Development: These tests are written BEFORE implementation.
 */

import { render, screen, waitFor, renderHook, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../../contexts/ThemeContext';

// Mock fetch for API calls
global.fetch = jest.fn();

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
  value: mockLocalStorage
});

describe('ThemeContext - Theme Provider Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
    global.fetch.mockClear();
  });

  /**
   * Test Suite: Theme Initialization
   */
  describe('Theme Initialization', () => {
    test('should initialize with default theme when no stored theme exists', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      expect(result.current.currentTheme).toBe('modern-minimalist');
      expect(result.current.themes).toHaveLength(3);
    });

    test('should load theme from localStorage on mount', () => {
      mockLocalStorage.setItem('c2pa-theme', 'friendly-approachable');

      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      expect(result.current.currentTheme).toBe('friendly-approachable');
    });

    test('should load theme from API if authenticated', async () => {
      const mockAuthToken = 'test-token-123';
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          theme: 'tech-savvy-trustworthy'
        })
      });

      const wrapper = ({ children }) => (
        <ThemeProvider authToken={mockAuthToken}>
          {children}
        </ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.currentTheme).toBe('tech-savvy-trustworthy');
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/user/theme',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockAuthToken}`
          })
        })
      );
    });

    test('should prioritize API theme over localStorage', async () => {
      mockLocalStorage.setItem('c2pa-theme', 'modern-minimalist');

      const mockAuthToken = 'test-token-123';
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          theme: 'friendly-approachable'
        })
      });

      const wrapper = ({ children }) => (
        <ThemeProvider authToken={mockAuthToken}>
          {children}
        </ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.currentTheme).toBe('friendly-approachable');
      });
    });

    test('should fallback to localStorage if API call fails', async () => {
      mockLocalStorage.setItem('c2pa-theme', 'tech-savvy-trustworthy');

      const mockAuthToken = 'test-token-123';
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const wrapper = ({ children }) => (
        <ThemeProvider authToken={mockAuthToken}>
          {children}
        </ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.currentTheme).toBe('tech-savvy-trustworthy');
      });
    });

    test('should use default theme if both API and localStorage fail', async () => {
      const mockAuthToken = 'test-token-123';
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const wrapper = ({ children }) => (
        <ThemeProvider authToken={mockAuthToken}>
          {children}
        </ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.currentTheme).toBe('modern-minimalist');
      });
    });
  });

  /**
   * Test Suite: Theme Switching
   */
  describe('Theme Switching', () => {
    test('should switch theme when setTheme is called', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      act(() => {
        result.current.setTheme('friendly-approachable');
      });

      expect(result.current.currentTheme).toBe('friendly-approachable');
    });

    test('should update localStorage when theme changes', () => {
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

    test('should call API to persist theme if authenticated', async () => {
      const mockAuthToken = 'test-token-123';
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      const wrapper = ({ children }) => (
        <ThemeProvider authToken={mockAuthToken}>
          {children}
        </ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      await act(async () => {
        await result.current.setTheme('friendly-approachable');
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/user/theme',
          expect.objectContaining({
            method: 'PUT',
            headers: expect.objectContaining({
              'Authorization': `Bearer ${mockAuthToken}`,
              'Content-Type': 'application/json'
            }),
            body: JSON.stringify({ theme: 'friendly-approachable' })
          })
        );
      });
    });

    test('should still update localStorage even if API call fails', async () => {
      const mockAuthToken = 'test-token-123';
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const wrapper = ({ children }) => (
        <ThemeProvider authToken={mockAuthToken}>
          {children}
        </ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      await act(async () => {
        await result.current.setTheme('tech-savvy-trustworthy');
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'c2pa-theme',
        'tech-savvy-trustworthy'
      );
      expect(result.current.currentTheme).toBe('tech-savvy-trustworthy');
    });

    test('should reject invalid theme names', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      act(() => {
        result.current.setTheme('invalid-theme-name');
      });

      // Should remain on default theme
      expect(result.current.currentTheme).toBe('modern-minimalist');
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test('should apply theme class to document root', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      act(() => {
        result.current.setTheme('friendly-approachable');
      });

      expect(document.documentElement.className).toContain('theme-friendly-approachable');
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
  });

  /**
   * Test Suite: Theme Data Structure
   */
  describe('Theme Data Structure', () => {
    test('should provide all three theme configurations', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      expect(result.current.themes).toHaveLength(3);
      expect(result.current.themes.map(t => t.id)).toEqual([
        'modern-minimalist',
        'friendly-approachable',
        'tech-savvy-trustworthy'
      ]);
    });

    test('should provide theme metadata', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      const modernTheme = result.current.themes.find(t => t.id === 'modern-minimalist');

      expect(modernTheme).toMatchObject({
        id: 'modern-minimalist',
        name: expect.any(String),
        description: expect.any(String),
        colors: expect.objectContaining({
          primary: expect.any(String),
          secondary: expect.any(String),
          background: expect.any(String),
          text: expect.any(String)
        })
      });
    });

    test('should provide current theme object via getCurrentThemeConfig', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      act(() => {
        result.current.setTheme('friendly-approachable');
      });

      const themeConfig = result.current.getCurrentThemeConfig();

      expect(themeConfig).toMatchObject({
        id: 'friendly-approachable',
        name: expect.any(String),
        colors: expect.any(Object)
      });
    });
  });

  /**
   * Test Suite: Performance and Optimization
   */
  describe('Performance and Optimization', () => {
    test('should complete theme switch in less than 100ms', async () => {
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

    test('should debounce API calls when theme changes rapidly', async () => {
      jest.useFakeTimers();

      const mockAuthToken = 'test-token-123';
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true })
      });

      const wrapper = ({ children }) => (
        <ThemeProvider authToken={mockAuthToken}>
          {children}
        </ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      // Rapidly switch themes
      act(() => {
        result.current.setTheme('friendly-approachable');
        result.current.setTheme('tech-savvy-trustworthy');
        result.current.setTheme('modern-minimalist');
      });

      // Fast-forward debounce timer
      act(() => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        // Should only make one API call for the final theme
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      jest.useRealTimers();
    });

    test('should not cause memory leaks on unmount', () => {
      const { unmount } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      // Should clean up without errors
      expect(() => unmount()).not.toThrow();
    });
  });

  /**
   * Test Suite: Error Handling
   */
  describe('Error Handling', () => {
    test('should handle API timeout gracefully', async () => {
      const mockAuthToken = 'test-token-123';
      global.fetch.mockImplementationOnce(() =>
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 5000)
        )
      );

      const wrapper = ({ children }) => (
        <ThemeProvider authToken={mockAuthToken}>
          {children}
        </ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.currentTheme).toBe('modern-minimalist');
      });
    });

    test('should handle malformed API response', async () => {
      const mockAuthToken = 'test-token-123';
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ invalid: 'data' })
      });

      const wrapper = ({ children }) => (
        <ThemeProvider authToken={mockAuthToken}>
          {children}
        </ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        // Should fallback to default theme
        expect(result.current.currentTheme).toBe('modern-minimalist');
      });
    });

    test('should handle localStorage quota exceeded', () => {
      mockLocalStorage.setItem.mockImplementationOnce(() => {
        throw new Error('QuotaExceededError');
      });

      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      // Should not crash
      expect(() => {
        act(() => {
          result.current.setTheme('friendly-approachable');
        });
      }).not.toThrow();
    });
  });

  /**
   * Test Suite: Theme Context Consumer
   */
  describe('Theme Context Consumer', () => {
    test('should throw error when useTheme is used outside ThemeProvider', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        renderHook(() => useTheme());
      }).toThrow();

      consoleSpy.mockRestore();
    });

    test('should provide theme context to nested components', () => {
      const TestComponent = () => {
        const { currentTheme } = useTheme();
        return <div data-testid="theme-display">{currentTheme}</div>;
      };

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('theme-display')).toHaveTextContent('modern-minimalist');
    });
  });

  /**
   * Test Suite: Theme Persistence Sync
   */
  describe('Theme Persistence Sync', () => {
    test('should sync theme when authToken changes', async () => {
      const { rerender } = renderHook(
        ({ authToken }) => useTheme(),
        {
          wrapper: ({ children, authToken }) => (
            <ThemeProvider authToken={authToken}>
              {children}
            </ThemeProvider>
          ),
          initialProps: { authToken: null }
        }
      );

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          theme: 'friendly-approachable'
        })
      });

      // User logs in
      rerender({ authToken: 'new-token-123' });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/user/theme',
          expect.objectContaining({
            headers: expect.objectContaining({
              'Authorization': 'Bearer new-token-123'
            })
          })
        );
      });
    });

    test('should handle logout by keeping localStorage theme', () => {
      mockLocalStorage.setItem('c2pa-theme', 'tech-savvy-trustworthy');

      const { rerender, result } = renderHook(
        ({ authToken }) => useTheme(),
        {
          wrapper: ({ children, authToken }) => (
            <ThemeProvider authToken={authToken}>
              {children}
            </ThemeProvider>
          ),
          initialProps: { authToken: 'token-123' }
        }
      );

      // User logs out
      rerender({ authToken: null });

      expect(result.current.currentTheme).toBe('tech-savvy-trustworthy');
    });
  });
});
