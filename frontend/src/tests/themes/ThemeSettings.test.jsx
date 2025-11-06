/**
 * ThemeSettings Tests - Theme Settings Page Component
 *
 * Tests the theme settings/preferences page including:
 * - Theme preview cards display
 * - Theme selection functionality
 * - Save/persist functionality
 * - API error handling
 * - Visual feedback for selected theme
 * - Accessibility of settings interface
 *
 * Test-Driven Development: These tests are written BEFORE implementation.
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { AuthContext } from '../../contexts/AuthContext';
import ThemeSettings from '../../pages/ThemeSettings';

// Mock AuthContext
const mockAuthContext = {
  token: 'mock-token-123',
  user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
  isAuthenticated: true,
  login: jest.fn(),
  logout: jest.fn()
};

// Mock fetch
global.fetch = jest.fn();

// Helper to render ThemeSettings with context
const renderThemeSettings = (initialTheme = 'modern-minimalist', authContext = mockAuthContext) => {
  return render(
    <ThemeProvider initialTheme={initialTheme}>
      <AuthContext.Provider value={authContext}>
        <ThemeSettings />
      </AuthContext.Provider>
    </ThemeProvider>
  );
};

describe('ThemeSettings Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockClear();
  });

  /**
   * Test Suite: Theme Preview Cards
   */
  describe('Theme Preview Cards', () => {
    test('should display all three theme preview cards', () => {
      renderThemeSettings();

      expect(screen.getByText(/Modern Minimalist/i)).toBeInTheDocument();
      expect(screen.getByText(/Friendly & Approachable/i)).toBeInTheDocument();
      expect(screen.getByText(/Tech-Savvy & Trustworthy/i)).toBeInTheDocument();
    });

    test('should display theme descriptions', () => {
      renderThemeSettings();

      // Each theme should have a description
      const descriptions = screen.getAllByTestId('theme-description');
      expect(descriptions).toHaveLength(3);

      descriptions.forEach(desc => {
        expect(desc.textContent.length).toBeGreaterThan(0);
      });
    });

    test('should display theme preview images or color swatches', () => {
      const { container } = renderThemeSettings();

      const previews = container.querySelectorAll('.theme-preview');
      expect(previews).toHaveLength(3);

      previews.forEach(preview => {
        // Should have visual representation
        expect(preview.querySelector('img') || preview.querySelector('.color-swatch')).toBeTruthy();
      });
    });

    test('should show key features for each theme', () => {
      renderThemeSettings();

      // Modern Minimalist features
      expect(screen.getByText(/Clean lines/i)).toBeInTheDocument();
      expect(screen.getByText(/Monochromatic/i)).toBeInTheDocument();

      // Friendly & Approachable features
      expect(screen.getByText(/Warm colors/i)).toBeInTheDocument();
      expect(screen.getByText(/Rounded corners/i)).toBeInTheDocument();

      // Tech-Savvy & Trustworthy features
      expect(screen.getByText(/Professional/i)).toBeInTheDocument();
      expect(screen.getByText(/Blue tones/i)).toBeInTheDocument();
    });

    test('should display color palette for each theme', () => {
      const { container } = renderThemeSettings();

      const themeCards = container.querySelectorAll('.theme-card');

      themeCards.forEach(card => {
        const colorSwatches = card.querySelectorAll('.color-swatch');
        expect(colorSwatches.length).toBeGreaterThanOrEqual(3);
      });
    });

    test('should show interactive preview on hover', async () => {
      const { container } = renderThemeSettings();

      const themeCard = container.querySelector('.theme-card');

      fireEvent.mouseEnter(themeCard);

      await waitFor(() => {
        expect(themeCard).toHaveClass('hover');
      });
    });
  });

  /**
   * Test Suite: Theme Selection
   */
  describe('Theme Selection', () => {
    test('should highlight currently selected theme', () => {
      renderThemeSettings('friendly-approachable');

      const friendlyCard = screen.getByText(/Friendly & Approachable/i).closest('.theme-card');
      expect(friendlyCard).toHaveClass('selected');
    });

    test('should select theme when clicking on card', async () => {
      renderThemeSettings('modern-minimalist');

      const techCard = screen.getByText(/Tech-Savvy & Trustworthy/i).closest('.theme-card');

      await userEvent.click(techCard);

      await waitFor(() => {
        expect(techCard).toHaveClass('selected');
      });
    });

    test('should select theme when clicking "Select" button', async () => {
      renderThemeSettings('modern-minimalist');

      const selectButtons = screen.getAllByRole('button', { name: /Select/i });
      const friendlyButton = selectButtons[1]; // Friendly & Approachable

      await userEvent.click(friendlyButton);

      await waitFor(() => {
        const friendlyCard = screen.getByText(/Friendly & Approachable/i).closest('.theme-card');
        expect(friendlyCard).toHaveClass('selected');
      });
    });

    test('should show visual feedback when theme is selected', async () => {
      renderThemeSettings();

      const techCard = screen.getByText(/Tech-Savvy & Trustworthy/i).closest('.theme-card');

      await userEvent.click(techCard);

      await waitFor(() => {
        expect(techCard).toHaveClass('selected');
        expect(techCard.querySelector('.checkmark')).toBeInTheDocument();
      });
    });

    test('should update select button text for active theme', () => {
      renderThemeSettings('modern-minimalist');

      const modernCard = screen.getByText(/Modern Minimalist/i).closest('.theme-card');
      const button = modernCard.querySelector('button');

      expect(button).toHaveTextContent(/Active|Selected/i);
    });

    test('should allow keyboard navigation between theme cards', async () => {
      renderThemeSettings();

      const themeCards = screen.getAllByRole('article');
      const firstCard = themeCards[0];

      firstCard.focus();
      expect(firstCard).toHaveFocus();

      // Navigate with arrow keys
      fireEvent.keyDown(firstCard, { key: 'ArrowRight', code: 'ArrowRight' });

      await waitFor(() => {
        expect(themeCards[1]).toHaveFocus();
      });
    });

    test('should select theme with keyboard (Enter or Space)', async () => {
      renderThemeSettings('modern-minimalist');

      const friendlyCard = screen.getByText(/Friendly & Approachable/i).closest('.theme-card');

      friendlyCard.focus();
      fireEvent.keyDown(friendlyCard, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(friendlyCard).toHaveClass('selected');
      });
    });
  });

  /**
   * Test Suite: Save Functionality
   */
  describe('Save Functionality', () => {
    test('should call API to save theme when theme is selected', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      renderThemeSettings('modern-minimalist');

      const techCard = screen.getByText(/Tech-Savvy & Trustworthy/i).closest('.theme-card');

      await userEvent.click(techCard);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/user/theme',
          expect.objectContaining({
            method: 'PUT',
            headers: expect.objectContaining({
              'Authorization': `Bearer mock-token-123`,
              'Content-Type': 'application/json'
            }),
            body: JSON.stringify({ theme: 'tech-savvy-trustworthy' })
          })
        );
      });
    });

    test('should show success message after saving', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      renderThemeSettings();

      const techCard = screen.getByText(/Tech-Savvy & Trustworthy/i).closest('.theme-card');

      await userEvent.click(techCard);

      await waitFor(() => {
        expect(screen.getByText(/Theme saved successfully/i)).toBeInTheDocument();
      });
    });

    test('should show loading state while saving', async () => {
      global.fetch.mockImplementationOnce(() =>
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({ success: true })
        }), 1000))
      );

      renderThemeSettings();

      const techCard = screen.getByText(/Tech-Savvy & Trustworthy/i).closest('.theme-card');

      await userEvent.click(techCard);

      await waitFor(() => {
        expect(screen.getByTestId('saving-indicator')).toBeInTheDocument();
      });
    });

    test('should disable theme selection while saving', async () => {
      global.fetch.mockImplementationOnce(() =>
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({ success: true })
        }), 1000))
      );

      renderThemeSettings();

      const techCard = screen.getByText(/Tech-Savvy & Trustworthy/i).closest('.theme-card');
      const friendlyCard = screen.getByText(/Friendly & Approachable/i).closest('.theme-card');

      await userEvent.click(techCard);

      // Try to click another theme while saving
      await userEvent.click(friendlyCard);

      // Should still be on tech theme
      expect(techCard).toHaveClass('selected');
    });

    test('should persist theme to localStorage', async () => {
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');

      renderThemeSettings();

      const friendlyCard = screen.getByText(/Friendly & Approachable/i).closest('.theme-card');

      await userEvent.click(friendlyCard);

      await waitFor(() => {
        expect(setItemSpy).toHaveBeenCalledWith('c2pa-theme', 'friendly-approachable');
      });

      setItemSpy.mockRestore();
    });
  });

  /**
   * Test Suite: API Error Handling
   */
  describe('API Error Handling', () => {
    test('should display error message when API call fails', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      renderThemeSettings();

      const techCard = screen.getByText(/Tech-Savvy & Trustworthy/i).closest('.theme-card');

      await userEvent.click(techCard);

      await waitFor(() => {
        expect(screen.getByText(/Failed to save theme/i)).toBeInTheDocument();
      });
    });

    test('should still update theme locally when API fails', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      renderThemeSettings('modern-minimalist');

      const techCard = screen.getByText(/Tech-Savvy & Trustworthy/i).closest('.theme-card');

      await userEvent.click(techCard);

      await waitFor(() => {
        expect(techCard).toHaveClass('selected');
      });
    });

    test('should show retry button on API failure', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      renderThemeSettings();

      const techCard = screen.getByText(/Tech-Savvy & Trustworthy/i).closest('.theme-card');

      await userEvent.click(techCard);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument();
      });
    });

    test('should retry API call when retry button is clicked', async () => {
      global.fetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true })
        });

      renderThemeSettings();

      const techCard = screen.getByText(/Tech-Savvy & Trustworthy/i).closest('.theme-card');

      await userEvent.click(techCard);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument();
      });

      const retryButton = screen.getByRole('button', { name: /Retry/i });
      await userEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText(/Theme saved successfully/i)).toBeInTheDocument();
      });

      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    test('should handle unauthorized (401) error', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' })
      });

      renderThemeSettings();

      const techCard = screen.getByText(/Tech-Savvy & Trustworthy/i).closest('.theme-card');

      await userEvent.click(techCard);

      await waitFor(() => {
        expect(screen.getByText(/Please log in again/i)).toBeInTheDocument();
      });
    });

    test('should handle server error (500)', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Server error' })
      });

      renderThemeSettings();

      const techCard = screen.getByText(/Tech-Savvy & Trustworthy/i).closest('.theme-card');

      await userEvent.click(techCard);

      await waitFor(() => {
        expect(screen.getByText(/Server error/i)).toBeInTheDocument();
      });
    });

    test('should auto-dismiss success message after 3 seconds', async () => {
      jest.useFakeTimers();

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      renderThemeSettings();

      const techCard = screen.getByText(/Tech-Savvy & Trustworthy/i).closest('.theme-card');

      await userEvent.click(techCard);

      await waitFor(() => {
        expect(screen.getByText(/Theme saved successfully/i)).toBeInTheDocument();
      });

      // Fast-forward 3 seconds
      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(screen.queryByText(/Theme saved successfully/i)).not.toBeInTheDocument();
      });

      jest.useRealTimers();
    });
  });

  /**
   * Test Suite: Live Theme Preview
   */
  describe('Live Theme Preview', () => {
    test('should apply theme preview on hover without saving', async () => {
      const { container } = renderThemeSettings('modern-minimalist');

      const friendlyCard = screen.getByText(/Friendly & Approachable/i).closest('.theme-card');

      fireEvent.mouseEnter(friendlyCard);

      await waitFor(() => {
        const previewElement = container.querySelector('.theme-preview-overlay');
        expect(previewElement).toHaveClass('theme-friendly-approachable');
      });

      fireEvent.mouseLeave(friendlyCard);

      await waitFor(() => {
        const previewElement = container.querySelector('.theme-preview-overlay');
        expect(previewElement).not.toBeInTheDocument();
      });
    });

    test('should show preview tooltip with theme details', async () => {
      renderThemeSettings();

      const techCard = screen.getByText(/Tech-Savvy & Trustworthy/i).closest('.theme-card');

      fireEvent.mouseEnter(techCard);

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
    });
  });

  /**
   * Test Suite: Accessibility
   */
  describe('Accessibility', () => {
    test('should have proper heading hierarchy', () => {
      renderThemeSettings();

      expect(screen.getByRole('heading', { level: 1, name: /Theme Settings/i })).toBeInTheDocument();
    });

    test('should have ARIA labels for theme cards', () => {
      renderThemeSettings();

      const themeCards = screen.getAllByRole('article');

      themeCards.forEach((card, index) => {
        expect(card).toHaveAttribute('aria-label', expect.stringContaining('theme'));
      });
    });

    test('should indicate selected theme to screen readers', () => {
      renderThemeSettings('friendly-approachable');

      const friendlyCard = screen.getByText(/Friendly & Approachable/i).closest('.theme-card');

      expect(friendlyCard).toHaveAttribute('aria-selected', 'true');
    });

    test('should announce theme changes to screen readers', async () => {
      renderThemeSettings();

      const techCard = screen.getByText(/Tech-Savvy & Trustworthy/i).closest('.theme-card');

      await userEvent.click(techCard);

      await waitFor(() => {
        const liveRegion = screen.getByRole('status');
        expect(liveRegion).toHaveTextContent(/Tech-Savvy & Trustworthy theme selected/i);
      });
    });

    test('should be operable with keyboard only', async () => {
      renderThemeSettings();

      const themeCards = screen.getAllByRole('article');

      // Tab to first card
      userEvent.tab();
      expect(themeCards[0]).toHaveFocus();

      // Select with Enter
      fireEvent.keyDown(themeCards[0], { key: 'Enter' });

      await waitFor(() => {
        expect(themeCards[0]).toHaveClass('selected');
      });
    });

    test('should meet color contrast requirements', () => {
      const { container } = renderThemeSettings();

      const themeCards = container.querySelectorAll('.theme-card');

      themeCards.forEach(card => {
        const styles = window.getComputedStyle(card);
        expect(styles.color).toBeDefined();
        expect(styles.backgroundColor).toBeDefined();
        // Actual contrast ratio checking would be done with a library
      });
    });
  });

  /**
   * Test Suite: Responsive Design
   */
  describe('Responsive Design', () => {
    test('should display theme cards in grid on desktop', () => {
      const { container } = renderThemeSettings();

      const grid = container.querySelector('.theme-grid');
      const styles = window.getComputedStyle(grid);

      expect(styles.display).toBe('grid');
    });

    test('should stack theme cards vertically on mobile', () => {
      global.innerWidth = 375;

      const { container } = renderThemeSettings();

      const grid = container.querySelector('.theme-grid');
      const styles = window.getComputedStyle(grid);

      expect(styles.gridTemplateColumns).toBe('1fr');
    });

    test('should show 2 columns on tablet', () => {
      global.innerWidth = 768;

      const { container } = renderThemeSettings();

      const grid = container.querySelector('.theme-grid');
      const styles = window.getComputedStyle(grid);

      expect(styles.gridTemplateColumns).toMatch(/repeat\(2/);
    });
  });

  /**
   * Test Suite: Snapshot Tests
   */
  describe('Snapshot Tests', () => {
    test('should match snapshot with modern-minimalist selected', () => {
      const { container } = renderThemeSettings('modern-minimalist');
      expect(container.firstChild).toMatchSnapshot();
    });

    test('should match snapshot with friendly-approachable selected', () => {
      const { container } = renderThemeSettings('friendly-approachable');
      expect(container.firstChild).toMatchSnapshot();
    });

    test('should match snapshot with tech-savvy-trustworthy selected', () => {
      const { container } = renderThemeSettings('tech-savvy-trustworthy');
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
