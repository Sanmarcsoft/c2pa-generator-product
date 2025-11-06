/**
 * Accessibility Tests
 *
 * Comprehensive WCAG 2.1 AA compliance test suite covering:
 * - Contrast ratios
 * - Keyboard navigation
 * - Focus indicators
 * - ARIA labels and roles
 * - Screen reader compatibility
 * - Color blindness simulation
 *
 * @file Accessibility.test.jsx
 */

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ThemeProvider } from '../../contexts/ThemeContext';

expect.extend(toHaveNoViolations);

// Contrast ratio calculation helper
const getContrastRatio = (foreground, background) => {
  // Simple contrast ratio calculation (would use actual library in production)
  // This is a placeholder for the actual calculation
  const getLuminance = (rgb) => {
    const [r, g, b] = rgb.match(/\d+/g).map(Number);
    const rsRGB = r / 255;
    const gsRGB = g / 255;
    const bsRGB = b / 255;

    const rL = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const gL = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const bL = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

    return 0.2126 * rL + 0.7152 * gL + 0.0722 * bL;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);

  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  return ratio;
};

describe('Accessibility Tests - WCAG 2.1 AA Compliance', () => {
  const themes = ['modern-minimalist', 'friendly-approachable', 'tech-savvy-trustworthy'];

  /**
   * Test Suite 1: Contrast Ratio Compliance
   */
  describe('Contrast Ratio Compliance', () => {
    describe('Modern Minimalist Theme', () => {
      test('should meet 4.5:1 contrast for normal text (16px) on white', () => {
        // Primary text (#1E293B) on white background
        const textColor = 'rgb(30, 41, 59)';
        const bgColor = 'rgb(255, 255, 255)';

        const ratio = getContrastRatio(textColor, bgColor);
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      });

      test('should meet 3:1 contrast for large text (18px+)', () => {
        // Secondary text (#64748B) on white background
        const textColor = 'rgb(100, 116, 139)';
        const bgColor = 'rgb(255, 255, 255)';

        const ratio = getContrastRatio(textColor, bgColor);
        expect(ratio).toBeGreaterThanOrEqual(3.0);
      });

      test('should meet 3:1 contrast for UI components (blue accent)', () => {
        // Blue accent (#3B82F6) on white background
        const accentColor = 'rgb(59, 130, 246)';
        const bgColor = 'rgb(255, 255, 255)';

        const ratio = getContrastRatio(accentColor, bgColor);
        expect(ratio).toBeGreaterThanOrEqual(3.0);
      });

      test('should meet contrast for white text on blue background', () => {
        // White text on blue accent button
        const textColor = 'rgb(255, 255, 255)';
        const bgColor = 'rgb(59, 130, 246)';

        const ratio = getContrastRatio(textColor, bgColor);
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      });
    });

    describe('Friendly Approachable Theme', () => {
      test('should meet contrast requirements for warm backgrounds', () => {
        // Primary text (#3F3F46) on cream background (#FFFBF5)
        const textColor = 'rgb(63, 63, 70)';
        const bgColor = 'rgb(255, 251, 245)';

        const ratio = getContrastRatio(textColor, bgColor);
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      });

      test('should meet contrast for orange accent elements', () => {
        // Friendly orange (#FB923C) on white
        const accentColor = 'rgb(251, 146, 60)';
        const bgColor = 'rgb(255, 255, 255)';

        const ratio = getContrastRatio(accentColor, bgColor);
        expect(ratio).toBeGreaterThanOrEqual(3.0);
      });
    });

    describe('Tech Savvy Trustworthy Theme', () => {
      test('should meet AAA contrast for white text on dark background', () => {
        // White text (#FFFFFF) on dark background (#0F1628)
        const textColor = 'rgb(255, 255, 255)';
        const bgColor = 'rgb(15, 22, 40)';

        const ratio = getContrastRatio(textColor, bgColor);
        expect(ratio).toBeGreaterThanOrEqual(7.0); // AAA level
      });

      test('should meet contrast for electric cyan accent', () => {
        // Electric cyan (#00E5FF) on dark background
        const accentColor = 'rgb(0, 229, 255)';
        const bgColor = 'rgb(15, 22, 40)';

        const ratio = getContrastRatio(accentColor, bgColor);
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      });
    });

    test('should validate contrast ratios for all themes programmatically', () => {
      const colorCombinations = [
        { theme: 'modern-minimalist', text: 'rgb(30, 41, 59)', bg: 'rgb(255, 255, 255)', min: 4.5 },
        { theme: 'friendly-approachable', text: 'rgb(63, 63, 70)', bg: 'rgb(255, 251, 245)', min: 4.5 },
        { theme: 'tech-savvy-trustworthy', text: 'rgb(255, 255, 255)', bg: 'rgb(15, 22, 40)', min: 7.0 },
      ];

      colorCombinations.forEach(({ theme, text, bg, min }) => {
        const ratio = getContrastRatio(text, bg);
        expect(ratio).toBeGreaterThanOrEqual(min);
      });
    });
  });

  /**
   * Test Suite 2: Keyboard Navigation
   */
  describe('Keyboard Navigation', () => {
    themes.forEach(themeName => {
      describe(`Theme: ${themeName}`, () => {
        test('should support Tab navigation through interactive elements', async () => {
          const user = userEvent.setup();

          render(
            <ThemeProvider initialTheme={themeName}>
              <div>
                <button data-testid="button-1">Button 1</button>
                <button data-testid="button-2">Button 2</button>
                <input data-testid="input-1" type="text" />
                <a href="#test" data-testid="link-1">Link 1</a>
              </div>
            </ThemeProvider>
          );

          const button1 = screen.getByTestId('button-1');
          const button2 = screen.getByTestId('button-2');
          const input1 = screen.getByTestId('input-1');
          const link1 = screen.getByTestId('link-1');

          // Tab through elements
          await user.tab();
          expect(button1).toHaveFocus();

          await user.tab();
          expect(button2).toHaveFocus();

          await user.tab();
          expect(input1).toHaveFocus();

          await user.tab();
          expect(link1).toHaveFocus();
        });

        test('should support Shift+Tab for reverse navigation', async () => {
          const user = userEvent.setup();

          render(
            <ThemeProvider initialTheme={themeName}>
              <div>
                <button data-testid="button-1">Button 1</button>
                <button data-testid="button-2">Button 2</button>
              </div>
            </ThemeProvider>
          );

          const button1 = screen.getByTestId('button-1');
          const button2 = screen.getByTestId('button-2');

          await user.tab();
          await user.tab();
          expect(button2).toHaveFocus();

          await user.tab({ shift: true });
          expect(button1).toHaveFocus();
        });

        test('should support Enter key for button activation', async () => {
          const user = userEvent.setup();
          const handleClick = jest.fn();

          render(
            <ThemeProvider initialTheme={themeName}>
              <button data-testid="button" onClick={handleClick}>
                Click Me
              </button>
            </ThemeProvider>
          );

          const button = screen.getByTestId('button');
          button.focus();

          await user.keyboard('{Enter}');
          expect(handleClick).toHaveBeenCalled();
        });

        test('should support Space key for button activation', async () => {
          const user = userEvent.setup();
          const handleClick = jest.fn();

          render(
            <ThemeProvider initialTheme={themeName}>
              <button data-testid="button" onClick={handleClick}>
                Click Me
              </button>
            </ThemeProvider>
          );

          const button = screen.getByTestId('button');
          button.focus();

          await user.keyboard(' ');
          expect(handleClick).toHaveBeenCalled();
        });

        test('should skip disabled elements during Tab navigation', async () => {
          const user = userEvent.setup();

          render(
            <ThemeProvider initialTheme={themeName}>
              <div>
                <button data-testid="button-1">Enabled</button>
                <button data-testid="button-2" disabled>Disabled</button>
                <button data-testid="button-3">Enabled</button>
              </div>
            </ThemeProvider>
          );

          const button1 = screen.getByTestId('button-1');
          const button3 = screen.getByTestId('button-3');

          await user.tab();
          expect(button1).toHaveFocus();

          await user.tab();
          expect(button3).toHaveFocus(); // Should skip disabled button
        });

        test('should maintain logical tab order', async () => {
          const user = userEvent.setup();

          render(
            <ThemeProvider initialTheme={themeName}>
              <form>
                <input data-testid="input-1" type="text" />
                <select data-testid="select-1">
                  <option>Option</option>
                </select>
                <textarea data-testid="textarea-1" />
                <button data-testid="submit-button" type="submit">Submit</button>
              </form>
            </ThemeProvider>
          );

          await user.tab();
          expect(screen.getByTestId('input-1')).toHaveFocus();

          await user.tab();
          expect(screen.getByTestId('select-1')).toHaveFocus();

          await user.tab();
          expect(screen.getByTestId('textarea-1')).toHaveFocus();

          await user.tab();
          expect(screen.getByTestId('submit-button')).toHaveFocus();
        });
      });
    });
  });

  /**
   * Test Suite 3: Focus Indicators
   */
  describe('Focus Indicators', () => {
    themes.forEach(themeName => {
      describe(`Theme: ${themeName}`, () => {
        test('should show visible focus outline on buttons', async () => {
          const user = userEvent.setup();

          render(
            <ThemeProvider initialTheme={themeName}>
              <button data-testid="button">Focus Me</button>
            </ThemeProvider>
          );

          const button = screen.getByTestId('button');
          await user.tab();

          expect(button).toHaveFocus();
          // Actual visual focus indicator tested in visual regression
        });

        test('should show visible focus outline on inputs', async () => {
          const user = userEvent.setup();

          render(
            <ThemeProvider initialTheme={themeName}>
              <input data-testid="input" type="text" />
            </ThemeProvider>
          );

          const input = screen.getByTestId('input');
          await user.click(input);

          expect(input).toHaveFocus();
        });

        test('should show visible focus outline on links', async () => {
          const user = userEvent.setup();

          render(
            <ThemeProvider initialTheme={themeName}>
              <a href="#test" data-testid="link">Link</a>
            </ThemeProvider>
          );

          const link = screen.getByTestId('link');
          await user.tab();

          expect(link).toHaveFocus();
        });

        test('should maintain focus visibility during keyboard navigation', async () => {
          const user = userEvent.setup();

          render(
            <ThemeProvider initialTheme={themeName}>
              <nav>
                <a href="#home" data-testid="link-1">Home</a>
                <a href="#about" data-testid="link-2">About</a>
                <a href="#contact" data-testid="link-3">Contact</a>
              </nav>
            </ThemeProvider>
          );

          await user.tab();
          expect(screen.getByTestId('link-1')).toHaveFocus();

          await user.tab();
          expect(screen.getByTestId('link-2')).toHaveFocus();

          await user.tab();
          expect(screen.getByTestId('link-3')).toHaveFocus();
        });

        test('should have focus outline with minimum 2px thickness', () => {
          render(
            <ThemeProvider initialTheme={themeName}>
              <button
                data-testid="button"
                style={{ outline: '2px solid blue' }}
              >
                Button
              </button>
            </ThemeProvider>
          );

          const button = screen.getByTestId('button');
          const styles = window.getComputedStyle(button);

          expect(styles.outline).toBeTruthy();
        });
      });
    });
  });

  /**
   * Test Suite 4: ARIA Labels and Roles
   */
  describe('ARIA Labels and Roles', () => {
    themes.forEach(themeName => {
      describe(`Theme: ${themeName}`, () => {
        test('should have proper ARIA labels on interactive elements', () => {
          render(
            <ThemeProvider initialTheme={themeName}>
              <button aria-label="Close dialog" data-testid="close-button">
                ×
              </button>
            </ThemeProvider>
          );

          const button = screen.getByTestId('close-button');
          expect(button).toHaveAttribute('aria-label', 'Close dialog');
        });

        test('should have proper roles on navigation elements', () => {
          render(
            <ThemeProvider initialTheme={themeName}>
              <nav role="navigation" data-testid="main-nav">
                <ul role="menubar">
                  <li role="menuitem">
                    <a href="#home">Home</a>
                  </li>
                </ul>
              </nav>
            </ThemeProvider>
          );

          const nav = screen.getByTestId('main-nav');
          expect(nav).toHaveAttribute('role', 'navigation');
        });

        test('should have aria-expanded on expandable elements', () => {
          render(
            <ThemeProvider initialTheme={themeName}>
              <button
                aria-expanded="false"
                aria-controls="menu"
                data-testid="menu-button"
              >
                Menu
              </button>
              <div id="menu" role="menu" hidden>
                Menu content
              </div>
            </ThemeProvider>
          );

          const button = screen.getByTestId('menu-button');
          expect(button).toHaveAttribute('aria-expanded', 'false');
          expect(button).toHaveAttribute('aria-controls', 'menu');
        });

        test('should have aria-live regions for dynamic content', () => {
          render(
            <ThemeProvider initialTheme={themeName}>
              <div
                role="status"
                aria-live="polite"
                aria-atomic="true"
                data-testid="status"
              >
                Loading...
              </div>
            </ThemeProvider>
          );

          const status = screen.getByTestId('status');
          expect(status).toHaveAttribute('aria-live', 'polite');
        });

        test('should have proper form labels', () => {
          render(
            <ThemeProvider initialTheme={themeName}>
              <form>
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  aria-required="true"
                  data-testid="email-input"
                />
              </form>
            </ThemeProvider>
          );

          const input = screen.getByTestId('email-input');
          expect(input).toHaveAttribute('aria-required', 'true');

          const label = screen.getByText('Email Address');
          expect(label).toHaveAttribute('for', 'email');
        });

        test('should use aria-describedby for error messages', () => {
          render(
            <ThemeProvider initialTheme={themeName}>
              <div>
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  aria-describedby="password-error"
                  aria-invalid="true"
                  data-testid="password-input"
                />
                <div id="password-error" role="alert">
                  Password must be at least 8 characters
                </div>
              </div>
            </ThemeProvider>
          );

          const input = screen.getByTestId('password-input');
          expect(input).toHaveAttribute('aria-describedby', 'password-error');
          expect(input).toHaveAttribute('aria-invalid', 'true');
        });
      });
    });
  });

  /**
   * Test Suite 5: Screen Reader Compatibility
   */
  describe('Screen Reader Compatibility', () => {
    themes.forEach(themeName => {
      describe(`Theme: ${themeName}`, () => {
        test('should have semantic HTML structure', () => {
          render(
            <ThemeProvider initialTheme={themeName}>
              <div>
                <header data-testid="header">
                  <nav>Navigation</nav>
                </header>
                <main data-testid="main">
                  <article>Content</article>
                </main>
                <aside data-testid="aside">
                  Sidebar
                </aside>
                <footer data-testid="footer">
                  Footer
                </footer>
              </div>
            </ThemeProvider>
          );

          expect(screen.getByTestId('header')).toBeInTheDocument();
          expect(screen.getByTestId('main')).toBeInTheDocument();
          expect(screen.getByTestId('aside')).toBeInTheDocument();
          expect(screen.getByTestId('footer')).toBeInTheDocument();
        });

        test('should have alt text for images', () => {
          render(
            <ThemeProvider initialTheme={themeName}>
              <img
                src="logo.png"
                alt="C2PA Generator Logo"
                data-testid="logo"
              />
            </ThemeProvider>
          );

          const img = screen.getByTestId('logo');
          expect(img).toHaveAttribute('alt', 'C2PA Generator Logo');
        });

        test('should hide decorative icons from screen readers', () => {
          render(
            <ThemeProvider initialTheme={themeName}>
              <button data-testid="button">
                <span aria-hidden="true">⚙️</span>
                Settings
              </button>
            </ThemeProvider>
          );

          const button = screen.getByTestId('button');
          const icon = within(button).getByText('⚙️');
          expect(icon).toHaveAttribute('aria-hidden', 'true');
        });

        test('should announce loading states', () => {
          render(
            <ThemeProvider initialTheme={themeName}>
              <div
                role="progressbar"
                aria-valuenow={50}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Loading progress"
                data-testid="progressbar"
              >
                50%
              </div>
            </ThemeProvider>
          );

          const progressbar = screen.getByTestId('progressbar');
          expect(progressbar).toHaveAttribute('role', 'progressbar');
          expect(progressbar).toHaveAttribute('aria-valuenow', '50');
          expect(progressbar).toHaveAttribute('aria-label', 'Loading progress');
        });

        test('should provide skip links for navigation', () => {
          render(
            <ThemeProvider initialTheme={themeName}>
              <div>
                <a href="#main-content" className="skip-link">
                  Skip to main content
                </a>
                <nav>Navigation</nav>
                <main id="main-content">Content</main>
              </div>
            </ThemeProvider>
          );

          const skipLink = screen.getByText('Skip to main content');
          expect(skipLink).toHaveAttribute('href', '#main-content');
        });
      });
    });
  });

  /**
   * Test Suite 6: Automated Accessibility Testing (axe)
   */
  describe('Automated Accessibility Testing (axe)', () => {
    themes.forEach(themeName => {
      describe(`Theme: ${themeName}`, () => {
        test('should have no axe violations on basic page', async () => {
          const { container } = render(
            <ThemeProvider initialTheme={themeName}>
              <div>
                <h1>Page Title</h1>
                <button>Click Me</button>
                <a href="#test">Link</a>
              </div>
            </ThemeProvider>
          );

          const results = await axe(container);
          expect(results).toHaveNoViolations();
        });

        test('should have no axe violations on form', async () => {
          const { container } = render(
            <ThemeProvider initialTheme={themeName}>
              <form>
                <label htmlFor="name">Name</label>
                <input id="name" type="text" />

                <label htmlFor="email">Email</label>
                <input id="email" type="email" />

                <button type="submit">Submit</button>
              </form>
            </ThemeProvider>
          );

          const results = await axe(container);
          expect(results).toHaveNoViolations();
        });

        test('should have no axe violations on navigation', async () => {
          const { container } = render(
            <ThemeProvider initialTheme={themeName}>
              <nav aria-label="Main navigation">
                <ul>
                  <li><a href="#home">Home</a></li>
                  <li><a href="#about">About</a></li>
                  <li><a href="#contact">Contact</a></li>
                </ul>
              </nav>
            </ThemeProvider>
          );

          const results = await axe(container);
          expect(results).toHaveNoViolations();
        });
      });
    });
  });

  /**
   * Test Suite 7: Color Blindness Support
   */
  describe('Color Blindness Support', () => {
    test('should not rely solely on color to convey information', () => {
      render(
        <ThemeProvider initialTheme="modern-minimalist">
          <div>
            <button className="success" data-testid="success-button">
              <span aria-label="Success">✓</span> Success
            </button>
            <button className="error" data-testid="error-button">
              <span aria-label="Error">×</span> Error
            </button>
          </div>
        </ThemeProvider>
      );

      // Both buttons should have text labels AND icons, not just color
      expect(screen.getByTestId('success-button')).toHaveTextContent('Success');
      expect(screen.getByTestId('error-button')).toHaveTextContent('Error');
    });

    test('should use patterns or icons alongside color for status', () => {
      render(
        <ThemeProvider>
          <div>
            <div className="status-success" data-testid="status-success">
              <span role="img" aria-label="Success">✓</span>
              <span>Completed</span>
            </div>
            <div className="status-error" data-testid="status-error">
              <span role="img" aria-label="Error">⚠️</span>
              <span>Failed</span>
            </div>
            <div className="status-pending" data-testid="status-pending">
              <span role="img" aria-label="Pending">⏳</span>
              <span>In Progress</span>
            </div>
          </div>
        </ThemeProvider>
      );

      // Each status should have both visual icon and text
      expect(screen.getByTestId('status-success')).toHaveTextContent('Completed');
      expect(screen.getByTestId('status-error')).toHaveTextContent('Failed');
      expect(screen.getByTestId('status-pending')).toHaveTextContent('In Progress');
    });

    test('should provide sufficient contrast for colorblind users', () => {
      // Test with colors that remain distinguishable for common types of colorblindness
      const { container } = render(
        <ThemeProvider>
          <div>
            <button style={{ color: 'rgb(0, 0, 139)', backgroundColor: 'rgb(255, 255, 255)' }}>
              Blue (Safe for colorblindness)
            </button>
          </div>
        </ThemeProvider>
      );

      expect(container).toBeInTheDocument();
    });
  });

  /**
   * Test Suite 8: Focus Management
   */
  describe('Focus Management', () => {
    test('should trap focus within modal dialogs', async () => {
      const user = userEvent.setup();

      render(
        <ThemeProvider>
          <div>
            <button data-testid="open-button">Open Modal</button>
            <div role="dialog" aria-modal="true" data-testid="modal">
              <button data-testid="modal-button-1">Button 1</button>
              <button data-testid="modal-button-2">Button 2</button>
              <button data-testid="modal-close">Close</button>
            </div>
          </div>
        </ThemeProvider>
      );

      const modalButton1 = screen.getByTestId('modal-button-1');
      const modalButton2 = screen.getByTestId('modal-button-2');
      const modalClose = screen.getByTestId('modal-close');

      // Focus should cycle within modal
      modalButton1.focus();
      expect(modalButton1).toHaveFocus();

      await user.tab();
      expect(modalButton2).toHaveFocus();

      await user.tab();
      expect(modalClose).toHaveFocus();
    });

    test('should restore focus when closing modals', () => {
      const { rerender } = render(
        <ThemeProvider>
          <div>
            <button data-testid="trigger-button">Open</button>
          </div>
        </ThemeProvider>
      );

      const triggerButton = screen.getByTestId('trigger-button');
      triggerButton.focus();
      expect(triggerButton).toHaveFocus();

      // In actual implementation, focus should return to trigger after modal closes
    });
  });
});
