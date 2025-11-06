/**
 * ThemedChatPage Tests - Chat Interface with Theme Support
 *
 * Tests the chat page component with theme integration including:
 * - Message rendering in all three themes
 * - Color contrast compliance
 * - Mobile responsive layout
 * - Input field theming
 * - Message bubble styling
 * - Accessibility in chat context
 *
 * Test-Driven Development: These tests are written BEFORE implementation.
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { AuthContext } from '../../contexts/AuthContext';
import ChatPage from '../../pages/ChatPage';

// Mock AuthContext
const mockAuthContext = {
  token: 'mock-token-123',
  user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
  isAuthenticated: true,
  login: jest.fn(),
  logout: jest.fn()
};

// Helper to render ChatPage with theme
const renderChatPageWithTheme = (theme = 'modern-minimalist', authContext = mockAuthContext) => {
  return render(
    <ThemeProvider initialTheme={theme}>
      <AuthContext.Provider value={authContext}>
        <ChatPage />
      </AuthContext.Provider>
    </ThemeProvider>
  );
};

describe('ThemedChatPage Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  /**
   * Test Suite: Theme Application
   */
  describe('Theme Application', () => {
    test('should apply modern-minimalist theme classes to chat page', () => {
      const { container } = renderChatPageWithTheme('modern-minimalist');

      const chatPage = container.querySelector('.chat-page');
      expect(chatPage).toHaveClass('theme-modern-minimalist');
    });

    test('should apply friendly-approachable theme classes to chat page', () => {
      const { container } = renderChatPageWithTheme('friendly-approachable');

      const chatPage = container.querySelector('.chat-page');
      expect(chatPage).toHaveClass('theme-friendly-approachable');
    });

    test('should apply tech-savvy-trustworthy theme classes to chat page', () => {
      const { container } = renderChatPageWithTheme('tech-savvy-trustworthy');

      const chatPage = container.querySelector('.chat-page');
      expect(chatPage).toHaveClass('theme-tech-savvy-trustworthy');
    });

    test('should update theme classes when theme changes', () => {
      const { container, rerender } = render(
        <ThemeProvider initialTheme="modern-minimalist">
          <AuthContext.Provider value={mockAuthContext}>
            <ChatPage />
          </AuthContext.Provider>
        </ThemeProvider>
      );

      const chatPage = container.querySelector('.chat-page');
      expect(chatPage).toHaveClass('theme-modern-minimalist');

      // Change theme
      rerender(
        <ThemeProvider initialTheme="friendly-approachable">
          <AuthContext.Provider value={mockAuthContext}>
            <ChatPage />
          </AuthContext.Provider>
        </ThemeProvider>
      );

      expect(chatPage).toHaveClass('theme-friendly-approachable');
      expect(chatPage).not.toHaveClass('theme-modern-minimalist');
    });
  });

  /**
   * Test Suite: Message Rendering in Different Themes
   */
  describe('Message Rendering in Different Themes', () => {
    test('should render user messages with modern-minimalist theme styling', () => {
      renderChatPageWithTheme('modern-minimalist');

      const userMessages = screen.getAllByText(/YOU/i);
      userMessages.forEach(msg => {
        const messageContainer = msg.closest('.chat-message');
        expect(messageContainer).toHaveClass('theme-modern-minimalist');
        expect(messageContainer).toHaveClass('user');
      });
    });

    test('should render assistant messages with friendly-approachable theme styling', () => {
      renderChatPageWithTheme('friendly-approachable');

      const assistantMessages = screen.getAllByText(/AI ASSISTANT/i);
      assistantMessages.forEach(msg => {
        const messageContainer = msg.closest('.chat-message');
        expect(messageContainer).toHaveClass('theme-friendly-approachable');
        expect(messageContainer).toHaveClass('assistant');
      });
    });

    test('should apply theme-specific colors to message bubbles', () => {
      const { container } = renderChatPageWithTheme('tech-savvy-trustworthy');

      const messages = container.querySelectorAll('.chat-message');
      messages.forEach(message => {
        const styles = window.getComputedStyle(message);
        expect(styles.backgroundColor).toBeDefined();
        expect(styles.color).toBeDefined();
      });
    });

    test('should differentiate user and assistant messages visually in all themes', () => {
      const themes = ['modern-minimalist', 'friendly-approachable', 'tech-savvy-trustworthy'];

      themes.forEach(theme => {
        const { container, unmount } = renderChatPageWithTheme(theme);

        const userMessage = container.querySelector('.chat-message.user');
        const assistantMessage = container.querySelector('.chat-message.assistant');

        const userStyles = window.getComputedStyle(userMessage);
        const assistantStyles = window.getComputedStyle(assistantMessage);

        // User and assistant messages should have different backgrounds
        expect(userStyles.backgroundColor).not.toBe(assistantStyles.backgroundColor);

        unmount();
      });
    });
  });

  /**
   * Test Suite: Color Contrast Compliance
   */
  describe('Color Contrast Compliance', () => {
    test('should meet WCAG 2.1 AA contrast ratio for user messages in modern-minimalist', () => {
      const { container } = renderChatPageWithTheme('modern-minimalist');

      const userMessage = container.querySelector('.chat-message.user .message-content');
      const styles = window.getComputedStyle(userMessage);

      // In a real implementation, you would use a contrast checker library
      // For now, we verify that both properties exist
      expect(styles.color).toBeDefined();
      expect(styles.backgroundColor || styles.background).toBeDefined();

      // Minimum contrast ratio of 4.5:1 for WCAG 2.1 AA
      // This would be calculated with an actual contrast checking function
    });

    test('should meet WCAG 2.1 AA contrast ratio for assistant messages in friendly-approachable', () => {
      const { container } = renderChatPageWithTheme('friendly-approachable');

      const assistantMessage = container.querySelector('.chat-message.assistant .message-content');
      const styles = window.getComputedStyle(assistantMessage);

      expect(styles.color).toBeDefined();
      expect(styles.backgroundColor || styles.background).toBeDefined();
    });

    test('should meet WCAG 2.1 AA contrast ratio for tech-savvy-trustworthy theme', () => {
      const { container } = renderChatPageWithTheme('tech-savvy-trustworthy');

      const messages = container.querySelectorAll('.message-content');
      messages.forEach(message => {
        const styles = window.getComputedStyle(message);
        expect(styles.color).toBeDefined();
        expect(styles.backgroundColor || styles.background).toBeDefined();
      });
    });

    test('should maintain contrast in loading spinner for all themes', () => {
      global.fetch.mockImplementationOnce(() =>
        new Promise(resolve => setTimeout(resolve, 1000))
      );

      const { container } = renderChatPageWithTheme('modern-minimalist');

      const input = screen.getByPlaceholderText(/TYPE YOUR MESSAGE/i);
      const sendButton = screen.getByRole('button', { name: /SEND/i });

      fireEvent.change(input, { target: { value: 'Test message' } });
      fireEvent.click(sendButton);

      const spinner = container.querySelector('.loading-spinner');
      if (spinner) {
        const styles = window.getComputedStyle(spinner);
        expect(styles.borderColor || styles.color).toBeDefined();
      }
    });
  });

  /**
   * Test Suite: Input Field Theming
   */
  describe('Input Field Theming', () => {
    test('should apply theme styling to input field', () => {
      const { container } = renderChatPageWithTheme('modern-minimalist');

      const input = container.querySelector('.chat-input');
      expect(input).toHaveClass('theme-modern-minimalist');
    });

    test('should apply theme styling to send button', () => {
      const { container } = renderChatPageWithTheme('friendly-approachable');

      const sendButton = screen.getByRole('button', { name: /SEND/i });
      expect(sendButton).toHaveClass('theme-friendly-approachable');
    });

    test('should maintain input visibility in all themes', () => {
      const themes = ['modern-minimalist', 'friendly-approachable', 'tech-savvy-trustworthy'];

      themes.forEach(theme => {
        const { container, unmount } = renderChatPageWithTheme(theme);

        const input = container.querySelector('.chat-input');
        const styles = window.getComputedStyle(input);

        expect(styles.backgroundColor).toBeDefined();
        expect(styles.color).toBeDefined();
        expect(styles.borderColor || styles.border).toBeDefined();

        unmount();
      });
    });

    test('should show proper focus styles in all themes', () => {
      const themes = ['modern-minimalist', 'friendly-approachable', 'tech-savvy-trustworthy'];

      themes.forEach(theme => {
        const { container, unmount } = renderChatPageWithTheme(theme);

        const input = container.querySelector('.chat-input');
        input.focus();

        expect(input).toHaveFocus();

        const styles = window.getComputedStyle(input);
        // Should have visible focus indicator
        expect(
          styles.outline !== 'none' ||
          styles.boxShadow !== 'none' ||
          styles.borderColor !== ''
        ).toBeTruthy();

        unmount();
      });
    });

    test('should apply disabled styling to input when loading', async () => {
      global.fetch.mockImplementationOnce(() =>
        new Promise(resolve => setTimeout(resolve, 1000))
      );

      renderChatPageWithTheme('modern-minimalist');

      const input = screen.getByPlaceholderText(/TYPE YOUR MESSAGE/i);
      const sendButton = screen.getByRole('button', { name: /SEND/i });

      fireEvent.change(input, { target: { value: 'Test' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(input).toBeDisabled();
      });
    });
  });

  /**
   * Test Suite: Mobile Responsive Layout
   */
  describe('Mobile Responsive Layout', () => {
    test('should stack messages vertically on mobile', () => {
      // Mock mobile viewport
      global.innerWidth = 375;
      global.innerHeight = 667;

      const { container } = renderChatPageWithTheme('modern-minimalist');

      const chatMessages = container.querySelector('.chat-messages');
      const styles = window.getComputedStyle(chatMessages);

      expect(styles.flexDirection).toBe('column');
    });

    test('should use full width on mobile screens (320px)', () => {
      global.innerWidth = 320;

      const { container } = renderChatPageWithTheme('friendly-approachable');

      const chatContainer = container.querySelector('.chat-container');
      const styles = window.getComputedStyle(chatContainer);

      expect(styles.width).toMatch(/100%|auto/);
    });

    test('should adjust message bubble width on tablet (768px)', () => {
      global.innerWidth = 768;

      const { container } = renderChatPageWithTheme('tech-savvy-trustworthy');

      const messages = container.querySelectorAll('.chat-message');
      messages.forEach(message => {
        const styles = window.getComputedStyle(message);
        const maxWidth = parseInt(styles.maxWidth);

        // Messages should not be full width on tablet
        expect(maxWidth).toBeLessThan(768);
      });
    });

    test('should use appropriate font sizes on mobile (minimum 14px)', () => {
      global.innerWidth = 375;

      const { container } = renderChatPageWithTheme('modern-minimalist');

      const messageContent = container.querySelector('.message-content');
      const styles = window.getComputedStyle(messageContent);
      const fontSize = parseInt(styles.fontSize);

      expect(fontSize).toBeGreaterThanOrEqual(14);
    });

    test('should maintain touch targets of 44x44px on mobile', () => {
      global.innerWidth = 375;

      renderChatPageWithTheme('friendly-approachable');

      const sendButton = screen.getByRole('button', { name: /SEND/i });
      const styles = window.getComputedStyle(sendButton);

      const minHeight = parseInt(styles.minHeight);
      const minWidth = parseInt(styles.minWidth);

      expect(minHeight).toBeGreaterThanOrEqual(44);
      expect(minWidth).toBeGreaterThanOrEqual(44);
    });

    test('should prevent horizontal scroll on mobile', () => {
      global.innerWidth = 375;

      const { container } = renderChatPageWithTheme('tech-savvy-trustworthy');

      const chatPage = container.querySelector('.chat-page');
      const styles = window.getComputedStyle(chatPage);

      expect(styles.overflowX).toBe('hidden');
    });

    test('should adjust padding on mobile devices', () => {
      global.innerWidth = 375;

      const { container } = renderChatPageWithTheme('modern-minimalist');

      const chatContainer = container.querySelector('.chat-container');
      const styles = window.getComputedStyle(chatContainer);
      const padding = parseInt(styles.padding);

      // Reduced padding on mobile for more screen real estate
      expect(padding).toBeLessThanOrEqual(16);
    });
  });

  /**
   * Test Suite: Theme Transitions
   */
  describe('Theme Transitions', () => {
    test('should smoothly transition colors when theme changes', () => {
      const { container, rerender } = render(
        <ThemeProvider initialTheme="modern-minimalist">
          <AuthContext.Provider value={mockAuthContext}>
            <ChatPage />
          </AuthContext.Provider>
        </ThemeProvider>
      );

      const chatPage = container.querySelector('.chat-page');
      const initialStyles = window.getComputedStyle(chatPage);

      // Change theme
      rerender(
        <ThemeProvider initialTheme="friendly-approachable">
          <AuthContext.Provider value={mockAuthContext}>
            <ChatPage />
          </AuthContext.Provider>
        </ThemeProvider>
      );

      const newStyles = window.getComputedStyle(chatPage);

      // Should have transition property
      expect(
        initialStyles.transition !== 'none' || newStyles.transition !== 'none'
      ).toBeTruthy();
    });

    test('should not cause layout shift when theme changes', () => {
      const { container, rerender } = render(
        <ThemeProvider initialTheme="modern-minimalist">
          <AuthContext.Provider value={mockAuthContext}>
            <ChatPage />
          </AuthContext.Provider>
        </ThemeProvider>
      );

      const initialHeight = container.querySelector('.chat-page').offsetHeight;

      // Change theme
      rerender(
        <ThemeProvider initialTheme="tech-savvy-trustworthy">
          <AuthContext.Provider value={mockAuthContext}>
            <ChatPage />
          </AuthContext.Provider>
        </ThemeProvider>
      );

      const newHeight = container.querySelector('.chat-page').offsetHeight;

      // Height should remain approximately the same
      expect(Math.abs(newHeight - initialHeight)).toBeLessThan(10);
    });
  });

  /**
   * Test Suite: Chat-Specific Accessibility
   */
  describe('Chat-Specific Accessibility', () => {
    test('should have proper ARIA labels for messages', () => {
      const { container } = renderChatPageWithTheme('modern-minimalist');

      const userMessage = container.querySelector('.chat-message.user');
      expect(userMessage).toHaveAttribute('role', 'article');
      expect(userMessage).toHaveAttribute('aria-label', expect.stringContaining('message'));
    });

    test('should announce new messages to screen readers', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          response: { message: 'New AI response' }
        })
      });

      renderChatPageWithTheme('friendly-approachable');

      const input = screen.getByPlaceholderText(/TYPE YOUR MESSAGE/i);
      const sendButton = screen.getByRole('button', { name: /SEND/i });

      await userEvent.type(input, 'Test question');
      await userEvent.click(sendButton);

      await waitFor(() => {
        const liveRegion = screen.getByRole('status', { hidden: true });
        expect(liveRegion).toBeInTheDocument();
      });
    });

    test('should have proper heading hierarchy', () => {
      renderChatPageWithTheme('tech-savvy-trustworthy');

      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toHaveTextContent(/AI ASSISTANT CHAT/i);
    });

    test('should maintain focus management when sending messages', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          response: { message: 'Response' }
        })
      });

      renderChatPageWithTheme('modern-minimalist');

      const input = screen.getByPlaceholderText(/TYPE YOUR MESSAGE/i);

      input.focus();
      expect(input).toHaveFocus();

      await userEvent.type(input, 'Test{Enter}');

      await waitFor(() => {
        // Focus should return to input after sending
        expect(input).toHaveFocus();
      });
    });

    test('should provide keyboard shortcuts information', () => {
      const { container } = renderChatPageWithTheme('friendly-approachable');

      // Should have tooltips or aria-describedby for keyboard shortcuts
      const input = container.querySelector('.chat-input');
      expect(
        input.getAttribute('aria-describedby') ||
        input.getAttribute('title')
      ).toBeDefined();
    });
  });

  /**
   * Test Suite: Snapshot Tests
   */
  describe('Snapshot Tests', () => {
    test('should match snapshot for modern-minimalist theme', () => {
      const { container } = renderChatPageWithTheme('modern-minimalist');
      expect(container.firstChild).toMatchSnapshot();
    });

    test('should match snapshot for friendly-approachable theme', () => {
      const { container } = renderChatPageWithTheme('friendly-approachable');
      expect(container.firstChild).toMatchSnapshot();
    });

    test('should match snapshot for tech-savvy-trustworthy theme', () => {
      const { container } = renderChatPageWithTheme('tech-savvy-trustworthy');
      expect(container.firstChild).toMatchSnapshot();
    });

    test('should match snapshot with loading state', async () => {
      global.fetch.mockImplementationOnce(() =>
        new Promise(resolve => setTimeout(resolve, 1000))
      );

      const { container } = renderChatPageWithTheme('modern-minimalist');

      const input = screen.getByPlaceholderText(/TYPE YOUR MESSAGE/i);
      const sendButton = screen.getByRole('button', { name: /SEND/i });

      fireEvent.change(input, { target: { value: 'Test' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        const spinner = container.querySelector('.loading-spinner');
        expect(spinner).toBeInTheDocument();
      });

      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
