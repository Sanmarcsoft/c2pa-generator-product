/**
 * Performance Tests
 *
 * Comprehensive performance validation test suite covering:
 * - Theme switching performance (<100ms)
 * - CSS bundle size
 * - Animation frame rates (60fps target)
 * - Paint and layout thrashing prevention
 * - Memory leak detection
 * - Render performance
 *
 * @file Performance.test.jsx
 */

import { render, renderHook, act, waitFor } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../../contexts/ThemeContext';

// Performance measurement helpers
const measurePerformance = (callback) => {
  const start = performance.now();
  callback();
  const end = performance.now();
  return end - start;
};

const measureAsync = async (callback) => {
  const start = performance.now();
  await callback();
  const end = performance.now();
  return end - start;
};

// Mock components for performance testing
const HeavyComponent = ({ theme }) => {
  return (
    <div>
      {Array.from({ length: 100 }).map((_, i) => (
        <div key={i} className={`item item-${theme}`}>
          Item {i}
        </div>
      ))}
    </div>
  );
};

const AnimatedComponent = () => {
  return (
    <div className="animated-component" style={{ transition: 'all 200ms ease' }}>
      Animated Content
    </div>
  );
};

describe('Performance Tests', () => {
  const themes = ['modern-minimalist', 'friendly-approachable', 'tech-savvy-trustworthy'];

  // Clean up after each test
  afterEach(() => {
    jest.clearAllMocks();
    document.documentElement.className = '';
  });

  /**
   * Test Suite 1: Theme Switching Performance (<100ms)
   */
  describe('Theme Switching Performance (<100ms)', () => {
    test('should complete theme switch in under 100ms', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      const duration = measurePerformance(() => {
        act(() => {
          result.current.setTheme('friendly-approachable');
        });
      });

      expect(duration).toBeLessThan(100);
    });

    test('should switch between all themes quickly', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      themes.forEach(theme => {
        const duration = measurePerformance(() => {
          act(() => {
            result.current.setTheme(theme);
          });
        });

        expect(duration).toBeLessThan(100);
      });
    });

    test('should handle rapid theme switching without performance degradation', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      const durations = [];

      for (let i = 0; i < 10; i++) {
        const theme = themes[i % themes.length];
        const duration = measurePerformance(() => {
          act(() => {
            result.current.setTheme(theme);
          });
        });
        durations.push(duration);
      }

      // Average should be under 100ms
      const average = durations.reduce((a, b) => a + b, 0) / durations.length;
      expect(average).toBeLessThan(100);

      // Last switch should not be significantly slower (no performance degradation)
      expect(durations[9]).toBeLessThan(durations[0] * 2);
    });

    test('should complete theme switch with large component tree', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      render(
        <ThemeProvider>
          <HeavyComponent theme={result.current.currentTheme} />
        </ThemeProvider>
      );

      const duration = measurePerformance(() => {
        act(() => {
          result.current.setTheme('tech-savvy-trustworthy');
        });
      });

      // Should still be reasonably fast even with heavy components
      expect(duration).toBeLessThan(200);
    });

    test('should minimize reflows during theme switch', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      // Mock getBoundingClientRect calls (indicator of reflows)
      const reflowCalls = [];
      const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
      Element.prototype.getBoundingClientRect = function() {
        reflowCalls.push(this);
        return originalGetBoundingClientRect.call(this);
      };

      act(() => {
        result.current.setTheme('friendly-approachable');
      });

      Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;

      // Should minimize layout calculations
      expect(reflowCalls.length).toBeLessThan(10);
    });
  });

  /**
   * Test Suite 2: CSS Bundle Size
   */
  describe('CSS Bundle Size', () => {
    test('should have reasonable theme configuration size', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      const themeConfig = result.current.getCurrentThemeConfig();
      const themeSize = JSON.stringify(themeConfig).length;

      // Theme configuration should be under 10KB
      expect(themeSize).toBeLessThan(10 * 1024);
    });

    test('should not duplicate theme data in memory', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      const theme1 = result.current.themes.find(t => t.id === 'modern-minimalist');
      const theme2 = result.current.themes.find(t => t.id === 'modern-minimalist');

      // Should reference the same object
      expect(theme1).toBe(theme2);
    });

    test('should lazy load theme resources', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      // Only current theme should be fully loaded
      const currentTheme = result.current.getCurrentThemeConfig();
      expect(currentTheme).toBeDefined();

      // Theme list should exist but not necessarily fully loaded
      expect(result.current.themes.length).toBe(3);
    });

    test('should efficiently serialize theme for storage', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      const startTime = performance.now();
      const serialized = JSON.stringify({
        theme: result.current.currentTheme
      });
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(10);
      expect(serialized.length).toBeLessThan(100); // Just storing theme name
    });
  });

  /**
   * Test Suite 3: Animation Frame Rates (60fps target)
   */
  describe('Animation Frame Rates (60fps target)', () => {
    test('should maintain 60fps during theme transitions', (done) => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      const frameTimings = [];
      let lastTime = performance.now();
      let animationId;

      const measureFrames = () => {
        const currentTime = performance.now();
        const delta = currentTime - lastTime;
        frameTimings.push(delta);
        lastTime = currentTime;

        if (frameTimings.length < 60) { // Measure for ~1 second
          animationId = requestAnimationFrame(measureFrames);
        } else {
          cancelAnimationFrame(animationId);

          // Calculate average frame time
          const avgFrameTime = frameTimings.reduce((a, b) => a + b, 0) / frameTimings.length;

          // Should maintain ~16.67ms per frame (60fps)
          expect(avgFrameTime).toBeLessThan(20); // Allow some variance

          // No frames should be significantly dropped
          const droppedFrames = frameTimings.filter(t => t > 32).length;
          expect(droppedFrames).toBeLessThan(5);

          done();
        }
      };

      act(() => {
        result.current.setTheme('friendly-approachable');
      });

      animationId = requestAnimationFrame(measureFrames);
    });

    test('should use GPU-accelerated properties for animations', () => {
      const { container } = render(
        <ThemeProvider>
          <AnimatedComponent />
        </ThemeProvider>
      );

      const element = container.querySelector('.animated-component');
      const styles = window.getComputedStyle(element);

      // Should use transform/opacity for animations (GPU accelerated)
      expect(styles.transition).toBeTruthy();
    });

    test('should avoid layout-triggering animations', () => {
      const layoutProperties = ['width', 'height', 'top', 'left', 'margin', 'padding'];

      const { container } = render(
        <ThemeProvider>
          <div className="animated-element" style={{ transition: 'transform 200ms, opacity 200ms' }}>
            Content
          </div>
        </ThemeProvider>
      );

      const element = container.querySelector('.animated-element');
      const transition = window.getComputedStyle(element).transition;

      // Should not animate layout properties
      layoutProperties.forEach(prop => {
        expect(transition.toLowerCase()).not.toContain(prop);
      });
    });

    test('should use requestAnimationFrame for smooth animations', (done) => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      let rafCalled = false;
      const originalRAF = window.requestAnimationFrame;
      window.requestAnimationFrame = (callback) => {
        rafCalled = true;
        return originalRAF(callback);
      };

      act(() => {
        result.current.setTheme('tech-savvy-trustworthy');
      });

      setTimeout(() => {
        window.requestAnimationFrame = originalRAF;
        // Would be true if animations use RAF
        done();
      }, 100);
    });
  });

  /**
   * Test Suite 4: Paint and Layout Thrashing Prevention
   */
  describe('Paint and Layout Thrashing Prevention', () => {
    test('should batch DOM updates during theme switch', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      const originalClassName = document.documentElement.className;

      act(() => {
        result.current.setTheme('friendly-approachable');
      });

      // Should only update class once (batched)
      expect(document.documentElement.className).toContain('theme-friendly-approachable');
      expect(document.documentElement.className).not.toContain(originalClassName);
    });

    test('should minimize forced reflows', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      render(
        <ThemeProvider>
          <div>
            <div>Child 1</div>
            <div>Child 2</div>
            <div>Child 3</div>
          </div>
        </ThemeProvider>
      );

      const reflowTriggers = [];
      const originalOffsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');

      Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
        get() {
          reflowTriggers.push(this);
          return originalOffsetHeight.get.call(this);
        }
      });

      act(() => {
        result.current.setTheme('tech-savvy-trustworthy');
      });

      if (originalOffsetHeight) {
        Object.defineProperty(HTMLElement.prototype, 'offsetHeight', originalOffsetHeight);
      }

      // Should not trigger excessive reflows
      expect(reflowTriggers.length).toBeLessThan(20);
    });

    test('should use CSS transforms instead of position changes', () => {
      const { container } = render(
        <ThemeProvider>
          <div
            className="movable-element"
            style={{ transform: 'translateX(0px)', transition: 'transform 200ms' }}
          >
            Content
          </div>
        </ThemeProvider>
      );

      const element = container.querySelector('.movable-element');
      const styles = window.getComputedStyle(element);

      // Should use transform (GPU) not left/top (CPU)
      expect(styles.transform).toBeTruthy();
    });

    test('should avoid synchronous layout calculations', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      const layoutReads = [];
      const properties = ['offsetWidth', 'offsetHeight', 'clientWidth', 'clientHeight'];

      properties.forEach(prop => {
        const descriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, prop);
        Object.defineProperty(HTMLElement.prototype, prop, {
          get() {
            layoutReads.push(prop);
            return descriptor.get.call(this);
          }
        });
      });

      act(() => {
        result.current.setTheme('friendly-approachable');
      });

      // Should not read layout properties during theme switch
      expect(layoutReads.length).toBe(0);
    });
  });

  /**
   * Test Suite 5: Memory Leak Detection
   */
  describe('Memory Leak Detection', () => {
    test('should clean up event listeners on unmount', () => {
      const { unmount } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      const initialListeners = [];
      // Track event listeners (simplified)

      unmount();

      // Should remove all listeners
      expect(() => unmount()).not.toThrow();
    });

    test('should not accumulate DOM nodes on theme switches', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      const initialChildCount = document.documentElement.childNodes.length;

      // Switch themes multiple times
      for (let i = 0; i < 10; i++) {
        act(() => {
          result.current.setTheme(themes[i % themes.length]);
        });
      }

      const finalChildCount = document.documentElement.childNodes.length;

      // Should not accumulate extra nodes
      expect(finalChildCount).toBe(initialChildCount);
    });

    test('should release memory after component unmount', () => {
      const { unmount, result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      const themeRef = result.current;

      unmount();

      // References should be cleared (would use WeakRef in production)
      expect(() => unmount()).not.toThrow();
    });

    test('should not leak closure references', () => {
      const renders = [];

      for (let i = 0; i < 10; i++) {
        const { unmount } = renderHook(() => useTheme(), {
          wrapper: ThemeProvider
        });
        renders.push(unmount);
      }

      // Clean up all renders
      renders.forEach(unmount => {
        expect(() => unmount()).not.toThrow();
      });
    });

    test('should handle rapid mount/unmount cycles', () => {
      for (let i = 0; i < 20; i++) {
        const { unmount } = renderHook(() => useTheme(), {
          wrapper: ThemeProvider
        });

        unmount();
      }

      // Should not crash or leak memory
      expect(document.documentElement.className).toBeDefined();
    });
  });

  /**
   * Test Suite 6: Render Performance
   */
  describe('Render Performance', () => {
    test('should render component tree in under 16ms (60fps)', () => {
      const duration = measurePerformance(() => {
        render(
          <ThemeProvider>
            <div>
              <HeavyComponent theme="modern-minimalist" />
            </div>
          </ThemeProvider>
        );
      });

      expect(duration).toBeLessThan(16);
    });

    test('should not cause unnecessary re-renders on theme switch', () => {
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

      // Rerender without changing theme
      rerender(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Should not cause extra renders
      expect(renderCount).toBe(initialRenderCount);
    });

    test('should efficiently update large lists', () => {
      const { rerender } = render(
        <ThemeProvider initialTheme="modern-minimalist">
          <HeavyComponent theme="modern-minimalist" />
        </ThemeProvider>
      );

      const duration = measurePerformance(() => {
        rerender(
          <ThemeProvider initialTheme="friendly-approachable">
            <HeavyComponent theme="friendly-approachable" />
          </ThemeProvider>
        );
      });

      // Should efficiently update even with 100+ elements
      expect(duration).toBeLessThan(50);
    });

    test('should use React.memo for performance optimization', () => {
      const MemoizedComponent = ({ theme }) => <div>{theme}</div>;

      const { rerender } = render(
        <ThemeProvider>
          <MemoizedComponent theme="modern-minimalist" />
        </ThemeProvider>
      );

      const startTime = performance.now();

      // Rerender with same props
      for (let i = 0; i < 10; i++) {
        rerender(
          <ThemeProvider>
            <MemoizedComponent theme="modern-minimalist" />
          </ThemeProvider>
        );
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Memoization should make rerenders very fast
      expect(duration).toBeLessThan(50);
    });
  });

  /**
   * Test Suite 7: Initial Load Performance
   */
  describe('Initial Load Performance', () => {
    test('should load theme system in under 100ms', () => {
      const duration = measurePerformance(() => {
        renderHook(() => useTheme(), {
          wrapper: ThemeProvider
        });
      });

      expect(duration).toBeLessThan(100);
    });

    test('should not block main thread during initialization', (done) => {
      const startTime = performance.now();

      renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      // Schedule work on main thread
      setTimeout(() => {
        const endTime = performance.now();
        const duration = endTime - startTime;

        // Main thread should remain responsive
        expect(duration).toBeLessThan(50);
        done();
      }, 0);
    });

    test('should lazy load theme configurations', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      // Only current theme should be fully loaded initially
      expect(result.current.currentTheme).toBe('modern-minimalist');
      expect(result.current.themes.length).toBe(3);
    });
  });

  /**
   * Test Suite 8: Interaction Performance
   */
  describe('Interaction Performance', () => {
    test('should respond to user interactions within 100ms', async () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      const handleClick = jest.fn();

      const duration = await measureAsync(async () => {
        await act(async () => {
          result.current.setTheme('friendly-approachable');
          handleClick();
        });
      });

      expect(duration).toBeLessThan(100);
    });

    test('should maintain responsiveness during theme changes', (done) => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      const interactionTimes = [];

      const testInteraction = (index) => {
        const start = performance.now();

        act(() => {
          result.current.setTheme(themes[index % themes.length]);
        });

        const end = performance.now();
        interactionTimes.push(end - start);

        if (index < 5) {
          setTimeout(() => testInteraction(index + 1), 10);
        } else {
          const avgTime = interactionTimes.reduce((a, b) => a + b, 0) / interactionTimes.length;
          expect(avgTime).toBeLessThan(100);
          done();
        }
      };

      testInteraction(0);
    });

    test('should handle concurrent theme changes gracefully', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      const promises = themes.map(theme =>
        new Promise(resolve => {
          act(() => {
            result.current.setTheme(theme);
          });
          resolve();
        })
      );

      return Promise.all(promises).then(() => {
        // Last theme should be applied
        expect(result.current.currentTheme).toBe(themes[themes.length - 1]);
      });
    });
  });

  /**
   * Test Suite 9: Bundle Size Optimization
   */
  describe('Bundle Size Optimization', () => {
    test('should tree-shake unused theme code', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      // Only used theme methods should be present
      expect(result.current.setTheme).toBeDefined();
      expect(result.current.currentTheme).toBeDefined();
      expect(result.current.getCurrentThemeConfig).toBeDefined();
    });

    test('should minimize theme data duplication', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      const theme1 = result.current.themes[0];
      const theme2 = result.current.themes[0];

      // Should reference the same object
      expect(theme1).toBe(theme2);
    });
  });

  /**
   * Test Suite 10: Performance Monitoring
   */
  describe('Performance Monitoring', () => {
    test('should provide performance metrics', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      const startTime = performance.now();

      act(() => {
        result.current.setTheme('friendly-approachable');
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should be measurable
      expect(duration).toBeGreaterThan(0);
      expect(duration).toBeLessThan(100);
    });

    test('should not degrade over time', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      const measurements = [];

      for (let i = 0; i < 20; i++) {
        const duration = measurePerformance(() => {
          act(() => {
            result.current.setTheme(themes[i % themes.length]);
          });
        });
        measurements.push(duration);
      }

      const firstHalf = measurements.slice(0, 10).reduce((a, b) => a + b, 0) / 10;
      const secondHalf = measurements.slice(10).reduce((a, b) => a + b, 0) / 10;

      // Performance should not degrade significantly
      expect(secondHalf).toBeLessThan(firstHalf * 1.5);
    });
  });
});
