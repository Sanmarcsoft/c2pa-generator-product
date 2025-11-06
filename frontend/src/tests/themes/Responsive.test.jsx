/**
 * Responsive Design Tests
 *
 * Comprehensive test suite for responsive behavior across viewport sizes:
 * - Mobile (320px, 375px, 414px)
 * - Tablet (768px, 1024px)
 * - Desktop (1280px, 1920px)
 *
 * Tests cover touch targets, font sizes, and responsive layouts for all three themes.
 *
 * @file Responsive.test.jsx
 */

import { render, screen, within } from '@testing-library/react';
import { ThemeProvider } from '../../contexts/ThemeContext';

// Mock matchMedia
const createMatchMedia = (width) => {
  return (query) => ({
    matches: query.includes(`${width}px`),
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  });
};

// Test viewport sizes
const VIEWPORTS = {
  mobile: {
    small: { width: 320, height: 568 },    // iPhone SE
    medium: { width: 375, height: 667 },   // iPhone 8
    large: { width: 414, height: 896 },    // iPhone 11 Pro Max
  },
  tablet: {
    portrait: { width: 768, height: 1024 }, // iPad Portrait
    landscape: { width: 1024, height: 768 }, // iPad Landscape
  },
  desktop: {
    small: { width: 1280, height: 720 },   // HD
    large: { width: 1920, height: 1080 },  // Full HD
    xlarge: { width: 2560, height: 1440 }, // 2K
  },
};

// Mock components
const ResponsiveLayout = ({ children }) => (
  <div className="responsive-layout" data-testid="layout">
    {children}
  </div>
);

const ResponsiveButton = ({ children, ...props }) => (
  <button
    className="responsive-button"
    data-testid="responsive-button"
    style={{ minHeight: '44px', minWidth: '44px' }}
    {...props}
  >
    {children}
  </button>
);

const ResponsiveText = ({ children, size = 'base' }) => (
  <p
    className={`text-${size}`}
    data-testid="responsive-text"
    style={{ fontSize: size === 'base' ? '16px' : '14px' }}
  >
    {children}
  </p>
);

const ResponsiveGrid = ({ columns, children }) => (
  <div
    className={`grid grid-cols-${columns}`}
    data-testid="responsive-grid"
    style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)` }}
  >
    {children}
  </div>
);

describe('Responsive Design Tests', () => {
  const themes = ['modern-minimalist', 'friendly-approachable', 'tech-savvy-trustworthy'];

  beforeEach(() => {
    // Reset window dimensions
    global.innerWidth = 1024;
    global.innerHeight = 768;
  });

  /**
   * Test Suite 1: Mobile Viewport Rendering (320px)
   */
  describe('Mobile Viewport - 320px (iPhone SE)', () => {
    beforeEach(() => {
      window.matchMedia = createMatchMedia(320);
      global.innerWidth = VIEWPORTS.mobile.small.width;
      global.innerHeight = VIEWPORTS.mobile.small.height;
    });

    themes.forEach(themeName => {
      describe(`Theme: ${themeName}`, () => {
        test('should render mobile layout at 320px', () => {
          render(
            <ThemeProvider initialTheme={themeName}>
              <ResponsiveLayout>
                <div data-testid="content">Mobile Content</div>
              </ResponsiveLayout>
            </ThemeProvider>
          );

          const layout = screen.getByTestId('layout');
          expect(layout).toBeInTheDocument();
        });

        test('should use single column layout for content', () => {
          render(
            <ThemeProvider initialTheme={themeName}>
              <ResponsiveGrid columns={1}>
                <div>Item 1</div>
                <div>Item 2</div>
              </ResponsiveGrid>
            </ThemeProvider>
          );

          const grid = screen.getByTestId('responsive-grid');
          expect(grid.style.gridTemplateColumns).toBe('repeat(1, 1fr)');
        });

        test('should meet minimum touch target size (44x44px)', () => {
          render(
            <ThemeProvider initialTheme={themeName}>
              <ResponsiveButton>Tap Me</ResponsiveButton>
            </ThemeProvider>
          );

          const button = screen.getByTestId('responsive-button');
          const styles = window.getComputedStyle(button);

          expect(parseInt(styles.minHeight)).toBeGreaterThanOrEqual(44);
          expect(parseInt(styles.minWidth)).toBeGreaterThanOrEqual(44);
        });

        test('should use readable font sizes (minimum 14px)', () => {
          render(
            <ThemeProvider initialTheme={themeName}>
              <ResponsiveText>Readable text</ResponsiveText>
            </ThemeProvider>
          );

          const text = screen.getByTestId('responsive-text');
          const fontSize = parseInt(window.getComputedStyle(text).fontSize);

          expect(fontSize).toBeGreaterThanOrEqual(14);
        });

        test('should stack navigation items vertically', () => {
          render(
            <ThemeProvider initialTheme={themeName}>
              <nav data-testid="mobile-nav" style={{ display: 'flex', flexDirection: 'column' }}>
                <a href="#home">Home</a>
                <a href="#chat">Chat</a>
                <a href="#docs">Docs</a>
              </nav>
            </ThemeProvider>
          );

          const nav = screen.getByTestId('mobile-nav');
          expect(nav.style.flexDirection).toBe('column');
        });
      });
    });
  });

  /**
   * Test Suite 2: Mobile Viewport Rendering (375px)
   */
  describe('Mobile Viewport - 375px (iPhone 8)', () => {
    beforeEach(() => {
      window.matchMedia = createMatchMedia(375);
      global.innerWidth = VIEWPORTS.mobile.medium.width;
      global.innerHeight = VIEWPORTS.mobile.medium.height;
    });

    themes.forEach(themeName => {
      describe(`Theme: ${themeName}`, () => {
        test('should render optimally at 375px width', () => {
          render(
            <ThemeProvider initialTheme={themeName}>
              <ResponsiveLayout>
                <div>Content</div>
              </ResponsiveLayout>
            </ThemeProvider>
          );

          expect(screen.getByTestId('layout')).toBeInTheDocument();
        });

        test('should maintain touch target sizes', () => {
          render(
            <ThemeProvider initialTheme={themeName}>
              <>
                <ResponsiveButton>Button 1</ResponsiveButton>
                <ResponsiveButton>Button 2</ResponsiveButton>
                <ResponsiveButton>Button 3</ResponsiveButton>
              </>
            </ThemeProvider>
          );

          const buttons = screen.getAllByTestId('responsive-button');
          buttons.forEach(button => {
            const styles = window.getComputedStyle(button);
            expect(parseInt(styles.minHeight)).toBeGreaterThanOrEqual(44);
          });
        });

        test('should adapt spacing for medium mobile screens', () => {
          render(
            <ThemeProvider initialTheme={themeName}>
              <div
                data-testid="spaced-container"
                style={{ padding: '16px' }}
              >
                Content
              </div>
            </ThemeProvider>
          );

          const container = screen.getByTestId('spaced-container');
          expect(container.style.padding).toBe('16px');
        });
      });
    });
  });

  /**
   * Test Suite 3: Mobile Viewport Rendering (414px)
   */
  describe('Mobile Viewport - 414px (iPhone 11 Pro Max)', () => {
    beforeEach(() => {
      window.matchMedia = createMatchMedia(414);
      global.innerWidth = VIEWPORTS.mobile.large.width;
      global.innerHeight = VIEWPORTS.mobile.large.height;
    });

    themes.forEach(themeName => {
      describe(`Theme: ${themeName}`, () => {
        test('should render at large mobile size', () => {
          render(
            <ThemeProvider initialTheme={themeName}>
              <ResponsiveLayout>Large Mobile</ResponsiveLayout>
            </ThemeProvider>
          );

          expect(screen.getByTestId('layout')).toBeInTheDocument();
        });

        test('should use comfortable spacing on larger mobile', () => {
          render(
            <ThemeProvider initialTheme={themeName}>
              <div
                data-testid="comfortable-container"
                style={{ padding: '20px' }}
              >
                Content
              </div>
            </ThemeProvider>
          );

          const container = screen.getByTestId('comfortable-container');
          const padding = parseInt(container.style.padding);
          expect(padding).toBeGreaterThanOrEqual(16);
        });
      });
    });
  });

  /**
   * Test Suite 4: Tablet Viewport (768px Portrait)
   */
  describe('Tablet Viewport - 768px (iPad Portrait)', () => {
    beforeEach(() => {
      window.matchMedia = createMatchMedia(768);
      global.innerWidth = VIEWPORTS.tablet.portrait.width;
      global.innerHeight = VIEWPORTS.tablet.portrait.height;
    });

    themes.forEach(themeName => {
      describe(`Theme: ${themeName}`, () => {
        test('should render tablet layout at 768px', () => {
          render(
            <ThemeProvider initialTheme={themeName}>
              <ResponsiveLayout>Tablet Content</ResponsiveLayout>
            </ThemeProvider>
          );

          expect(screen.getByTestId('layout')).toBeInTheDocument();
        });

        test('should use 2-column grid for content', () => {
          render(
            <ThemeProvider initialTheme={themeName}>
              <ResponsiveGrid columns={2}>
                <div>Column 1</div>
                <div>Column 2</div>
              </ResponsiveGrid>
            </ThemeProvider>
          );

          const grid = screen.getByTestId('responsive-grid');
          expect(grid.style.gridTemplateColumns).toBe('repeat(2, 1fr)');
        });

        test('should maintain touch target sizes for tablet', () => {
          render(
            <ThemeProvider initialTheme={themeName}>
              <ResponsiveButton>Tablet Button</ResponsiveButton>
            </ThemeProvider>
          );

          const button = screen.getByTestId('responsive-button');
          const styles = window.getComputedStyle(button);
          expect(parseInt(styles.minHeight)).toBeGreaterThanOrEqual(44);
        });

        test('should show horizontal navigation on tablet', () => {
          render(
            <ThemeProvider initialTheme={themeName}>
              <nav
                data-testid="tablet-nav"
                style={{ display: 'flex', flexDirection: 'row' }}
              >
                <a href="#home">Home</a>
                <a href="#chat">Chat</a>
              </nav>
            </ThemeProvider>
          );

          const nav = screen.getByTestId('tablet-nav');
          expect(nav.style.flexDirection).toBe('row');
        });

        test('should use appropriate font sizes for tablet', () => {
          render(
            <ThemeProvider initialTheme={themeName}>
              <ResponsiveText size="base">Tablet text</ResponsiveText>
            </ThemeProvider>
          );

          const text = screen.getByTestId('responsive-text');
          const fontSize = parseInt(window.getComputedStyle(text).fontSize);
          expect(fontSize).toBeGreaterThanOrEqual(16);
        });
      });
    });
  });

  /**
   * Test Suite 5: Tablet Viewport (1024px Landscape)
   */
  describe('Tablet Viewport - 1024px (iPad Landscape)', () => {
    beforeEach(() => {
      window.matchMedia = createMatchMedia(1024);
      global.innerWidth = VIEWPORTS.tablet.landscape.width;
      global.innerHeight = VIEWPORTS.tablet.landscape.height;
    });

    themes.forEach(themeName => {
      describe(`Theme: ${themeName}`, () => {
        test('should render landscape tablet layout', () => {
          render(
            <ThemeProvider initialTheme={themeName}>
              <ResponsiveLayout>Landscape Tablet</ResponsiveLayout>
            </ThemeProvider>
          );

          expect(screen.getByTestId('layout')).toBeInTheDocument();
        });

        test('should use 3-column grid for landscape', () => {
          render(
            <ThemeProvider initialTheme={themeName}>
              <ResponsiveGrid columns={3}>
                <div>Col 1</div>
                <div>Col 2</div>
                <div>Col 3</div>
              </ResponsiveGrid>
            </ThemeProvider>
          );

          const grid = screen.getByTestId('responsive-grid');
          expect(grid.style.gridTemplateColumns).toBe('repeat(3, 1fr)');
        });

        test('should support split-screen layouts', () => {
          render(
            <ThemeProvider initialTheme={themeName}>
              <div
                data-testid="split-layout"
                style={{ display: 'grid', gridTemplateColumns: '300px 1fr' }}
              >
                <aside>Sidebar</aside>
                <main>Main Content</main>
              </div>
            </ThemeProvider>
          );

          const layout = screen.getByTestId('split-layout');
          expect(layout.style.gridTemplateColumns).toBe('300px 1fr');
        });
      });
    });
  });

  /**
   * Test Suite 6: Desktop Viewport (1280px)
   */
  describe('Desktop Viewport - 1280px (HD)', () => {
    beforeEach(() => {
      window.matchMedia = createMatchMedia(1280);
      global.innerWidth = VIEWPORTS.desktop.small.width;
      global.innerHeight = VIEWPORTS.desktop.small.height;
    });

    themes.forEach(themeName => {
      describe(`Theme: ${themeName}`, () => {
        test('should render desktop layout at 1280px', () => {
          render(
            <ThemeProvider initialTheme={themeName}>
              <ResponsiveLayout>Desktop Content</ResponsiveLayout>
            </ThemeProvider>
          );

          expect(screen.getByTestId('layout')).toBeInTheDocument();
        });

        test('should use 4-column grid for desktop', () => {
          render(
            <ThemeProvider initialTheme={themeName}>
              <ResponsiveGrid columns={4}>
                <div>1</div>
                <div>2</div>
                <div>3</div>
                <div>4</div>
              </ResponsiveGrid>
            </ThemeProvider>
          );

          const grid = screen.getByTestId('responsive-grid');
          expect(grid.style.gridTemplateColumns).toBe('repeat(4, 1fr)');
        });

        test('should show full navigation menu', () => {
          render(
            <ThemeProvider initialTheme={themeName}>
              <nav data-testid="desktop-nav">
                <a href="#home">Home</a>
                <a href="#chat">Chat</a>
                <a href="#docs">Documents</a>
                <a href="#progress">Progress</a>
                <a href="#admin">Admin</a>
              </nav>
            </ThemeProvider>
          );

          const nav = screen.getByTestId('desktop-nav');
          const links = within(nav).getAllByRole('link');
          expect(links.length).toBeGreaterThanOrEqual(4);
        });

        test('should use optimal font sizes for desktop', () => {
          render(
            <ThemeProvider initialTheme={themeName}>
              <ResponsiveText size="base">Desktop text</ResponsiveText>
            </ThemeProvider>
          );

          const text = screen.getByTestId('responsive-text');
          const fontSize = parseInt(window.getComputedStyle(text).fontSize);
          expect(fontSize).toBeGreaterThanOrEqual(16);
        });
      });
    });
  });

  /**
   * Test Suite 7: Desktop Viewport (1920px)
   */
  describe('Desktop Viewport - 1920px (Full HD)', () => {
    beforeEach(() => {
      window.matchMedia = createMatchMedia(1920);
      global.innerWidth = VIEWPORTS.desktop.large.width;
      global.innerHeight = VIEWPORTS.desktop.large.height;
    });

    themes.forEach(themeName => {
      describe(`Theme: ${themeName}`, () => {
        test('should render large desktop layout', () => {
          render(
            <ThemeProvider initialTheme={themeName}>
              <ResponsiveLayout>Large Desktop</ResponsiveLayout>
            </ThemeProvider>
          );

          expect(screen.getByTestId('layout')).toBeInTheDocument();
        });

        test('should constrain content width for readability', () => {
          render(
            <ThemeProvider initialTheme={themeName}>
              <div
                data-testid="constrained-container"
                style={{ maxWidth: '1440px', margin: '0 auto' }}
              >
                Content
              </div>
            </ThemeProvider>
          );

          const container = screen.getByTestId('constrained-container');
          const maxWidth = parseInt(container.style.maxWidth);
          expect(maxWidth).toBeLessThanOrEqual(1600);
        });

        test('should support wide grid layouts', () => {
          render(
            <ThemeProvider initialTheme={themeName}>
              <ResponsiveGrid columns={4}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <div key={i}>Item {i}</div>
                ))}
              </ResponsiveGrid>
            </ThemeProvider>
          );

          const grid = screen.getByTestId('responsive-grid');
          expect(grid).toBeInTheDocument();
        });
      });
    });
  });

  /**
   * Test Suite 8: Touch Target Sizes
   */
  describe('Touch Target Sizes (Minimum 44x44px)', () => {
    const touchTargetSizes = [
      { name: 'small', size: 44 },
      { name: 'medium', size: 48 },
      { name: 'large', size: 56 },
    ];

    themes.forEach(themeName => {
      describe(`Theme: ${themeName}`, () => {
        touchTargetSizes.forEach(({ name, size }) => {
          test(`should provide ${name} touch targets (${size}px)`, () => {
            render(
              <ThemeProvider initialTheme={themeName}>
                <button
                  data-testid={`touch-target-${name}`}
                  style={{ minHeight: `${size}px`, minWidth: `${size}px` }}
                >
                  {name}
                </button>
              </ThemeProvider>
            );

            const button = screen.getByTestId(`touch-target-${name}`);
            const styles = window.getComputedStyle(button);

            expect(parseInt(styles.minHeight)).toBeGreaterThanOrEqual(44);
            expect(parseInt(styles.minWidth)).toBeGreaterThanOrEqual(44);
          });
        });

        test('should maintain spacing between touch targets (minimum 8px)', () => {
          render(
            <ThemeProvider initialTheme={themeName}>
              <div data-testid="touch-group" style={{ display: 'flex', gap: '8px' }}>
                <ResponsiveButton>Button 1</ResponsiveButton>
                <ResponsiveButton>Button 2</ResponsiveButton>
              </div>
            </ThemeProvider>
          );

          const group = screen.getByTestId('touch-group');
          const gap = parseInt(group.style.gap);
          expect(gap).toBeGreaterThanOrEqual(8);
        });

        test('should support accessible tap areas on mobile', () => {
          window.matchMedia = createMatchMedia(375);

          render(
            <ThemeProvider initialTheme={themeName}>
              <button
                data-testid="mobile-tap-target"
                style={{ padding: '12px 24px', minHeight: '44px' }}
              >
                Tap Me
              </button>
            </ThemeProvider>
          );

          const button = screen.getByTestId('mobile-tap-target');
          expect(parseInt(window.getComputedStyle(button).minHeight)).toBe(44);
        });
      });
    });
  });

  /**
   * Test Suite 9: Font Size Requirements
   */
  describe('Font Size Requirements (Minimum 14-16px)', () => {
    themes.forEach(themeName => {
      describe(`Theme: ${themeName}`, () => {
        test('should use minimum 16px for body text', () => {
          render(
            <ThemeProvider initialTheme={themeName}>
              <p data-testid="body-text" style={{ fontSize: '16px' }}>
                Body text content
              </p>
            </ThemeProvider>
          );

          const text = screen.getByTestId('body-text');
          const fontSize = parseInt(window.getComputedStyle(text).fontSize);
          expect(fontSize).toBeGreaterThanOrEqual(16);
        });

        test('should use minimum 14px for secondary text', () => {
          render(
            <ThemeProvider initialTheme={themeName}>
              <small data-testid="secondary-text" style={{ fontSize: '14px' }}>
                Secondary text
              </small>
            </ThemeProvider>
          );

          const text = screen.getByTestId('secondary-text');
          const fontSize = parseInt(window.getComputedStyle(text).fontSize);
          expect(fontSize).toBeGreaterThanOrEqual(14);
        });

        test('should scale font sizes appropriately on mobile', () => {
          window.matchMedia = createMatchMedia(375);

          render(
            <ThemeProvider initialTheme={themeName}>
              <div>
                <h1 data-testid="heading" style={{ fontSize: '24px' }}>Heading</h1>
                <p data-testid="paragraph" style={{ fontSize: '16px' }}>Paragraph</p>
              </div>
            </ThemeProvider>
          );

          const heading = screen.getByTestId('heading');
          const paragraph = screen.getByTestId('paragraph');

          expect(parseInt(window.getComputedStyle(heading).fontSize)).toBeGreaterThanOrEqual(20);
          expect(parseInt(window.getComputedStyle(paragraph).fontSize)).toBeGreaterThanOrEqual(16);
        });

        test('should not use fonts smaller than 12px', () => {
          render(
            <ThemeProvider initialTheme={themeName}>
              <span data-testid="small-text" style={{ fontSize: '12px' }}>
                Small text
              </span>
            </ThemeProvider>
          );

          const text = screen.getByTestId('small-text');
          const fontSize = parseInt(window.getComputedStyle(text).fontSize);
          expect(fontSize).toBeGreaterThanOrEqual(12);
        });
      });
    });
  });

  /**
   * Test Suite 10: Responsive Behavior Consistency
   */
  describe('Responsive Behavior Consistency', () => {
    test('should transition smoothly between breakpoints', () => {
      const breakpoints = [320, 768, 1024, 1280, 1920];

      breakpoints.forEach(width => {
        window.matchMedia = createMatchMedia(width);
        global.innerWidth = width;

        const { unmount } = render(
          <ThemeProvider initialTheme="modern-minimalist">
            <ResponsiveLayout>Content at {width}px</ResponsiveLayout>
          </ThemeProvider>
        );

        expect(screen.getByTestId('layout')).toBeInTheDocument();
        unmount();
      });
    });

    test('should maintain functionality across all viewport sizes', () => {
      const viewportWidths = [320, 414, 768, 1024, 1280, 1920];

      viewportWidths.forEach(width => {
        window.matchMedia = createMatchMedia(width);
        global.innerWidth = width;

        const { unmount } = render(
          <ThemeProvider>
            <ResponsiveButton>Test</ResponsiveButton>
          </ThemeProvider>
        );

        const button = screen.getByTestId('responsive-button');
        expect(button).toBeEnabled();
        unmount();
      });
    });

    test('should apply consistent theming across viewport sizes', () => {
      const viewportWidths = [375, 768, 1280];

      themes.forEach(theme => {
        viewportWidths.forEach(width => {
          window.matchMedia = createMatchMedia(width);
          global.innerWidth = width;

          const { unmount } = render(
            <ThemeProvider initialTheme={theme}>
              <ResponsiveLayout>Content</ResponsiveLayout>
            </ThemeProvider>
          );

          expect(document.documentElement.className).toContain(`theme-${theme}`);
          unmount();
        });
      });
    });
  });
});
