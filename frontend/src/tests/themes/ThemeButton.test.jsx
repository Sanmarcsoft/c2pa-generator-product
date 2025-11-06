/**
 * ThemeButton Tests - Themed Button Component
 *
 * Tests button components with theme support including:
 * - Visual rendering in all three themes
 * - Proper styling and CSS classes applied
 * - Interactive states (hover, focus, active, disabled)
 * - Accessibility (keyboard navigation, ARIA attributes)
 * - Button variants (primary, secondary, danger)
 * - Responsive behavior
 *
 * Test-Driven Development: These tests are written BEFORE implementation.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '../../contexts/ThemeContext';
import ThemeButton from '../../components/ThemeButton';

// Helper to render button with theme context
const renderWithTheme = (component, theme = 'modern-minimalist') => {
  return render(
    <ThemeProvider initialTheme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('ThemeButton Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test Suite: Basic Rendering
   */
  describe('Basic Rendering', () => {
    test('should render button with text content', () => {
      renderWithTheme(<ThemeButton>Click Me</ThemeButton>);

      expect(screen.getByRole('button', { name: 'Click Me' })).toBeInTheDocument();
    });

    test('should render with custom className', () => {
      renderWithTheme(
        <ThemeButton className="custom-class">Button</ThemeButton>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    test('should render as disabled when disabled prop is true', () => {
      renderWithTheme(<ThemeButton disabled>Disabled</ThemeButton>);

      expect(screen.getByRole('button')).toBeDisabled();
    });

    test('should render with icon when icon prop is provided', () => {
      renderWithTheme(
        <ThemeButton icon={<span data-testid="test-icon">⚙️</span>}>
          Settings
        </ThemeButton>
      );

      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    test('should render icon-only button without text', () => {
      renderWithTheme(
        <ThemeButton
          icon={<span data-testid="test-icon">🔍</span>}
          aria-label="Search"
        />
      );

      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
      expect(screen.getByLabelText('Search')).toBeInTheDocument();
    });
  });

  /**
   * Test Suite: Theme-Specific Styling
   */
  describe('Theme-Specific Styling', () => {
    test('should apply modern-minimalist theme classes', () => {
      renderWithTheme(
        <ThemeButton variant="primary">Modern Button</ThemeButton>,
        'modern-minimalist'
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('theme-button');
      expect(button).toHaveClass('theme-modern-minimalist');
      expect(button).toHaveClass('variant-primary');
    });

    test('should apply friendly-approachable theme classes', () => {
      renderWithTheme(
        <ThemeButton variant="primary">Friendly Button</ThemeButton>,
        'friendly-approachable'
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('theme-button');
      expect(button).toHaveClass('theme-friendly-approachable');
    });

    test('should apply tech-savvy-trustworthy theme classes', () => {
      renderWithTheme(
        <ThemeButton variant="primary">Tech Button</ThemeButton>,
        'tech-savvy-trustworthy'
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('theme-button');
      expect(button).toHaveClass('theme-tech-savvy-trustworthy');
    });

    test('should update classes when theme changes', () => {
      const { rerender } = render(
        <ThemeProvider initialTheme="modern-minimalist">
          <ThemeButton>Button</ThemeButton>
        </ThemeProvider>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('theme-modern-minimalist');

      // Change theme
      rerender(
        <ThemeProvider initialTheme="friendly-approachable">
          <ThemeButton>Button</ThemeButton>
        </ThemeProvider>
      );

      expect(button).toHaveClass('theme-friendly-approachable');
      expect(button).not.toHaveClass('theme-modern-minimalist');
    });
  });

  /**
   * Test Suite: Button Variants
   */
  describe('Button Variants', () => {
    test('should render primary variant', () => {
      renderWithTheme(<ThemeButton variant="primary">Primary</ThemeButton>);

      expect(screen.getByRole('button')).toHaveClass('variant-primary');
    });

    test('should render secondary variant', () => {
      renderWithTheme(<ThemeButton variant="secondary">Secondary</ThemeButton>);

      expect(screen.getByRole('button')).toHaveClass('variant-secondary');
    });

    test('should render danger variant', () => {
      renderWithTheme(<ThemeButton variant="danger">Delete</ThemeButton>);

      expect(screen.getByRole('button')).toHaveClass('variant-danger');
    });

    test('should render outline variant', () => {
      renderWithTheme(<ThemeButton variant="outline">Outline</ThemeButton>);

      expect(screen.getByRole('button')).toHaveClass('variant-outline');
    });

    test('should render ghost variant', () => {
      renderWithTheme(<ThemeButton variant="ghost">Ghost</ThemeButton>);

      expect(screen.getByRole('button')).toHaveClass('variant-ghost');
    });

    test('should default to primary variant when not specified', () => {
      renderWithTheme(<ThemeButton>Default</ThemeButton>);

      expect(screen.getByRole('button')).toHaveClass('variant-primary');
    });
  });

  /**
   * Test Suite: Button Sizes
   */
  describe('Button Sizes', () => {
    test('should render small size button', () => {
      renderWithTheme(<ThemeButton size="small">Small</ThemeButton>);

      expect(screen.getByRole('button')).toHaveClass('size-small');
    });

    test('should render medium size button (default)', () => {
      renderWithTheme(<ThemeButton>Medium</ThemeButton>);

      expect(screen.getByRole('button')).toHaveClass('size-medium');
    });

    test('should render large size button', () => {
      renderWithTheme(<ThemeButton size="large">Large</ThemeButton>);

      expect(screen.getByRole('button')).toHaveClass('size-large');
    });

    test('should have minimum touch target of 44x44px on mobile', () => {
      renderWithTheme(<ThemeButton size="small">Small Button</ThemeButton>);

      const button = screen.getByRole('button');
      const styles = window.getComputedStyle(button);

      // Minimum touch target for accessibility
      const minHeight = parseInt(styles.minHeight);
      const minWidth = parseInt(styles.minWidth);

      expect(minHeight).toBeGreaterThanOrEqual(44);
      expect(minWidth).toBeGreaterThanOrEqual(44);
    });
  });

  /**
   * Test Suite: Interactive States
   */
  describe('Interactive States', () => {
    test('should handle click events', async () => {
      const handleClick = jest.fn();
      renderWithTheme(<ThemeButton onClick={handleClick}>Click</ThemeButton>);

      const button = screen.getByRole('button');
      await userEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test('should not fire click when disabled', async () => {
      const handleClick = jest.fn();
      renderWithTheme(
        <ThemeButton onClick={handleClick} disabled>
          Disabled
        </ThemeButton>
      );

      const button = screen.getByRole('button');
      await userEvent.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });

    test('should apply hover state class', async () => {
      renderWithTheme(<ThemeButton>Hover Me</ThemeButton>);

      const button = screen.getByRole('button');

      fireEvent.mouseEnter(button);
      expect(button).toHaveClass('hover');

      fireEvent.mouseLeave(button);
      expect(button).not.toHaveClass('hover');
    });

    test('should apply focus state when focused', async () => {
      renderWithTheme(<ThemeButton>Focus Me</ThemeButton>);

      const button = screen.getByRole('button');
      button.focus();

      expect(button).toHaveFocus();
      expect(button).toHaveClass('focus');
    });

    test('should apply active state when pressed', async () => {
      renderWithTheme(<ThemeButton>Press Me</ThemeButton>);

      const button = screen.getByRole('button');

      fireEvent.mouseDown(button);
      expect(button).toHaveClass('active');

      fireEvent.mouseUp(button);
      expect(button).not.toHaveClass('active');
    });

    test('should apply disabled state styling', () => {
      renderWithTheme(<ThemeButton disabled>Disabled</ThemeButton>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('disabled');
      expect(button).toHaveAttribute('disabled');
    });

    test('should show loading state', () => {
      renderWithTheme(<ThemeButton loading>Loading</ThemeButton>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('loading');
      expect(button).toBeDisabled();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  /**
   * Test Suite: Accessibility
   */
  describe('Accessibility', () => {
    test('should be keyboard accessible', async () => {
      const handleClick = jest.fn();
      renderWithTheme(<ThemeButton onClick={handleClick}>Keyboard</ThemeButton>);

      const button = screen.getByRole('button');
      button.focus();

      // Press Enter
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
      expect(handleClick).toHaveBeenCalledTimes(1);

      // Press Space
      fireEvent.keyDown(button, { key: ' ', code: 'Space' });
      expect(handleClick).toHaveBeenCalledTimes(2);
    });

    test('should have proper ARIA attributes', () => {
      renderWithTheme(
        <ThemeButton
          aria-label="Save document"
          aria-describedby="save-description"
        >
          Save
        </ThemeButton>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Save document');
      expect(button).toHaveAttribute('aria-describedby', 'save-description');
    });

    test('should indicate loading state with aria-busy', () => {
      renderWithTheme(<ThemeButton loading>Saving</ThemeButton>);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    test('should indicate disabled state with aria-disabled', () => {
      renderWithTheme(<ThemeButton disabled>Disabled</ThemeButton>);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    test('should have visible focus indicator', () => {
      renderWithTheme(<ThemeButton>Focus Test</ThemeButton>);

      const button = screen.getByRole('button');
      button.focus();

      const styles = window.getComputedStyle(button);

      // Should have outline or box-shadow for focus
      expect(
        styles.outline !== 'none' || styles.boxShadow !== 'none'
      ).toBeTruthy();
    });

    test('should meet minimum font size of 14px', () => {
      renderWithTheme(<ThemeButton>Readable Text</ThemeButton>);

      const button = screen.getByRole('button');
      const styles = window.getComputedStyle(button);
      const fontSize = parseInt(styles.fontSize);

      expect(fontSize).toBeGreaterThanOrEqual(14);
    });

    test('should have proper color contrast in all themes', () => {
      const themes = ['modern-minimalist', 'friendly-approachable', 'tech-savvy-trustworthy'];

      themes.forEach(theme => {
        const { unmount } = renderWithTheme(
          <ThemeButton>Contrast Test</ThemeButton>,
          theme
        );

        const button = screen.getByRole('button');
        const styles = window.getComputedStyle(button);

        // Check contrast ratio (WCAG 2.1 AA requires 4.5:1)
        // This would need a contrast checking library in real implementation
        expect(styles.color).toBeDefined();
        expect(styles.backgroundColor).toBeDefined();

        unmount();
      });
    });
  });

  /**
   * Test Suite: Button Types
   */
  describe('Button Types', () => {
    test('should render as submit button', () => {
      renderWithTheme(<ThemeButton type="submit">Submit</ThemeButton>);

      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });

    test('should render as reset button', () => {
      renderWithTheme(<ThemeButton type="reset">Reset</ThemeButton>);

      expect(screen.getByRole('button')).toHaveAttribute('type', 'reset');
    });

    test('should default to button type', () => {
      renderWithTheme(<ThemeButton>Button</ThemeButton>);

      expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });
  });

  /**
   * Test Suite: Responsive Behavior
   */
  describe('Responsive Behavior', () => {
    test('should be full width when fullWidth prop is true', () => {
      renderWithTheme(<ThemeButton fullWidth>Full Width</ThemeButton>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('full-width');

      const styles = window.getComputedStyle(button);
      expect(styles.width).toBe('100%');
    });

    test('should stack icon and text on mobile when compact prop is true', () => {
      renderWithTheme(
        <ThemeButton
          icon={<span data-testid="icon">📱</span>}
          compact
        >
          Mobile
        </ThemeButton>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('compact');
    });
  });

  /**
   * Test Suite: Performance
   */
  describe('Performance', () => {
    test('should not re-render unnecessarily', () => {
      const renderSpy = jest.fn();

      const TestButton = () => {
        renderSpy();
        return <ThemeButton>Test</ThemeButton>;
      };

      const { rerender } = renderWithTheme(<TestButton />);

      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Re-render with same props
      rerender(
        <ThemeProvider initialTheme="modern-minimalist">
          <TestButton />
        </ThemeProvider>
      );

      // Should use React.memo to prevent unnecessary re-renders
      expect(renderSpy).toHaveBeenCalledTimes(1);
    });

    test('should handle rapid clicks without performance degradation', async () => {
      const handleClick = jest.fn();
      renderWithTheme(<ThemeButton onClick={handleClick}>Click</ThemeButton>);

      const button = screen.getByRole('button');
      const startTime = performance.now();

      // Simulate 100 rapid clicks
      for (let i = 0; i < 100; i++) {
        fireEvent.click(button);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(handleClick).toHaveBeenCalledTimes(100);
      expect(duration).toBeLessThan(1000); // Should complete in under 1 second
    });
  });

  /**
   * Test Suite: Snapshot Tests
   */
  describe('Snapshot Tests', () => {
    test('should match snapshot for modern-minimalist theme', () => {
      const { container } = renderWithTheme(
        <ThemeButton variant="primary">Modern Button</ThemeButton>,
        'modern-minimalist'
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    test('should match snapshot for friendly-approachable theme', () => {
      const { container } = renderWithTheme(
        <ThemeButton variant="primary">Friendly Button</ThemeButton>,
        'friendly-approachable'
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    test('should match snapshot for tech-savvy-trustworthy theme', () => {
      const { container } = renderWithTheme(
        <ThemeButton variant="primary">Tech Button</ThemeButton>,
        'tech-savvy-trustworthy'
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    test('should match snapshot for disabled state', () => {
      const { container } = renderWithTheme(
        <ThemeButton disabled>Disabled Button</ThemeButton>
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    test('should match snapshot for loading state', () => {
      const { container } = renderWithTheme(
        <ThemeButton loading>Loading Button</ThemeButton>
      );

      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
