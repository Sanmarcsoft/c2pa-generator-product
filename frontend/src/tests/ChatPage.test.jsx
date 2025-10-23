/**
 * Component Tests for ChatPage with Session Persistence
 *
 * These tests follow TDD principles - they are written BEFORE implementation
 * and will initially FAIL until the session persistence feature is implemented.
 *
 * Tests cover:
 * - Loading most recent active session on mount
 * - Displaying session messages
 * - Sending messages adds to current session
 * - Creating new session when user has none
 * - Handling session loading errors
 * - Persisting session across component remounts
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { act } from 'react';
import userEvent from '@testing-library/user-event';
import ChatPage from '../pages/ChatPage';
import { AuthContext } from '../contexts/AuthContext';

// Mock ChatContext (to be created)
const mockChatContext = {
  currentSession: null,
  sessions: [],
  messages: [],
  loading: false,
  sendMessage: jest.fn(),
  createNewSession: jest.fn(),
  switchSession: jest.fn(),
  loadActiveSession: jest.fn(),
  loadSessionMessages: jest.fn()
};

// Mock AuthContext
const mockAuthContext = {
  token: 'mock-token-123',
  user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
  isAuthenticated: true,
  login: jest.fn(),
  logout: jest.fn()
};

// Helper to render ChatPage with mocked contexts
const renderChatPage = (chatContextValue = mockChatContext, authContextValue = mockAuthContext) => {
  // Mock ChatContext Provider (will be created in implementation)
  const ChatContext = { Provider: ({ children }) => children };

  return render(
    <AuthContext.Provider value={authContextValue}>
      <ChatContext.Provider value={chatContextValue}>
        <ChatPage />
      </ChatContext.Provider>
    </AuthContext.Provider>
  );
};

describe('ChatPage Component - Session Persistence Tests', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Reset fetch mock
    global.fetch = jest.fn();
  });

  /**
   * Test Suite: Session Loading on Mount
   */
  describe('Session Loading on Mount', () => {
    test('should load most recent active session on mount', async () => {
      const mockSession = {
        id: 'session-1',
        title: 'Recent Session',
        createdAt: '2025-10-20T10:00:00Z',
        messageCount: 5
      };

      const mockMessages = [
        { id: 'msg-1', sender: 'user', message: 'Hello', createdAt: '2025-10-20T10:00:00Z' },
        { id: 'msg-2', sender: 'assistant', message: 'Hi there!', createdAt: '2025-10-20T10:00:01Z' }
      ];

      const chatContext = {
        ...mockChatContext,
        currentSession: mockSession,
        messages: mockMessages,
        loadActiveSession: jest.fn()
      };

      renderChatPage(chatContext);

      // Should call loadActiveSession on mount
      expect(chatContext.loadActiveSession).toHaveBeenCalledTimes(1);

      // Should display session title
      await waitFor(() => {
        expect(screen.getByText(/Recent Session/i)).toBeInTheDocument();
      });
    });

    test('should display session messages on mount', async () => {
      const mockMessages = [
        { id: 'msg-1', sender: 'user', message: 'Test user message', createdAt: '2025-10-20T10:00:00Z' },
        { id: 'msg-2', sender: 'assistant', message: 'Test assistant response', createdAt: '2025-10-20T10:00:01Z' }
      ];

      const chatContext = {
        ...mockChatContext,
        currentSession: { id: 'session-1', title: 'Test Session' },
        messages: mockMessages
      };

      renderChatPage(chatContext);

      await waitFor(() => {
        expect(screen.getByText('Test user message')).toBeInTheDocument();
        expect(screen.getByText('Test assistant response')).toBeInTheDocument();
      });
    });

    test('should create new session when user has none', async () => {
      const chatContext = {
        ...mockChatContext,
        currentSession: null,
        messages: [],
        createNewSession: jest.fn().mockResolvedValue({
          id: 'new-session-1',
          title: 'New Conversation'
        })
      };

      renderChatPage(chatContext);

      // Should create new session on first message send
      const input = screen.getByPlaceholderText(/type your message/i);
      const sendButton = screen.getByRole('button', { name: /send/i });

      await userEvent.type(input, 'First message');
      await userEvent.click(sendButton);

      await waitFor(() => {
        expect(chatContext.createNewSession).toHaveBeenCalled();
      });
    });

    test('should handle session loading errors gracefully', async () => {
      const chatContext = {
        ...mockChatContext,
        loadActiveSession: jest.fn().mockRejectedValue(new Error('Failed to load session'))
      };

      // Should not crash and should display error message
      renderChatPage(chatContext);

      await waitFor(() => {
        // Component should still render
        expect(screen.getByText(/AI ASSISTANT CHAT/i)).toBeInTheDocument();
      });
    });

    test('should show loading state while fetching session', async () => {
      const chatContext = {
        ...mockChatContext,
        loading: true,
        currentSession: null,
        messages: []
      };

      renderChatPage(chatContext);

      // Should show loading spinner
      await waitFor(() => {
        const loadingSpinner = screen.getByTestId('loading-spinner') ||
                             document.querySelector('.loading-spinner');
        expect(loadingSpinner).toBeInTheDocument();
      });
    });
  });

  /**
   * Test Suite: Sending Messages
   */
  describe('Sending Messages', () => {
    test('should send message to current session', async () => {
      const chatContext = {
        ...mockChatContext,
        currentSession: { id: 'session-1', title: 'Test Session' },
        messages: [],
        sendMessage: jest.fn()
      };

      renderChatPage(chatContext);

      const input = screen.getByPlaceholderText(/type your message/i);
      const sendButton = screen.getByRole('button', { name: /send/i });

      await userEvent.type(input, 'Test message');
      await userEvent.click(sendButton);

      await waitFor(() => {
        expect(chatContext.sendMessage).toHaveBeenCalledWith(
          'Test message',
          expect.any(Object) // context
        );
      });
    });

    test('should clear input after sending message', async () => {
      const chatContext = {
        ...mockChatContext,
        currentSession: { id: 'session-1', title: 'Test Session' },
        sendMessage: jest.fn()
      };

      renderChatPage(chatContext);

      const input = screen.getByPlaceholderText(/type your message/i);

      await userEvent.type(input, 'Test message');
      expect(input).toHaveValue('Test message');

      const sendButton = screen.getByRole('button', { name: /send/i });
      await userEvent.click(sendButton);

      await waitFor(() => {
        expect(input).toHaveValue('');
      });
    });

    test('should show optimistic update when sending message', async () => {
      const chatContext = {
        ...mockChatContext,
        currentSession: { id: 'session-1', title: 'Test Session' },
        messages: [],
        sendMessage: jest.fn()
      };

      renderChatPage(chatContext);

      const input = screen.getByPlaceholderText(/type your message/i);
      const sendButton = screen.getByRole('button', { name: /send/i });

      await userEvent.type(input, 'Optimistic message');
      await userEvent.click(sendButton);

      // Message should appear immediately
      await waitFor(() => {
        expect(screen.getByText('Optimistic message')).toBeInTheDocument();
      });
    });

    test('should disable send button when loading', async () => {
      const chatContext = {
        ...mockChatContext,
        currentSession: { id: 'session-1', title: 'Test Session' },
        loading: true
      };

      renderChatPage(chatContext);

      const sendButton = screen.getByRole('button', { name: /send/i });
      expect(sendButton).toBeDisabled();
    });

    test('should disable send button when input is empty', async () => {
      const chatContext = {
        ...mockChatContext,
        currentSession: { id: 'session-1', title: 'Test Session' }
      };

      renderChatPage(chatContext);

      const sendButton = screen.getByRole('button', { name: /send/i });
      expect(sendButton).toBeDisabled();
    });

    test('should not send empty messages', async () => {
      const chatContext = {
        ...mockChatContext,
        currentSession: { id: 'session-1', title: 'Test Session' },
        sendMessage: jest.fn()
      };

      renderChatPage(chatContext);

      const input = screen.getByPlaceholderText(/type your message/i);
      const sendButton = screen.getByRole('button', { name: /send/i });

      await userEvent.type(input, '   '); // Only whitespace
      await userEvent.click(sendButton);

      expect(chatContext.sendMessage).not.toHaveBeenCalled();
    });
  });

  /**
   * Test Suite: Session Persistence Across Remounts
   */
  describe('Session Persistence Across Remounts', () => {
    test('should restore session after component remount', async () => {
      const mockSession = {
        id: 'session-1',
        title: 'Persistent Session',
        messageCount: 3
      };

      const mockMessages = [
        { id: 'msg-1', sender: 'user', message: 'Message 1', createdAt: '2025-10-20T10:00:00Z' }
      ];

      const chatContext = {
        ...mockChatContext,
        currentSession: mockSession,
        messages: mockMessages,
        loadActiveSession: jest.fn()
      };

      // First render
      const { unmount } = renderChatPage(chatContext);

      await waitFor(() => {
        expect(screen.getByText('Persistent Session')).toBeInTheDocument();
      });

      // Unmount
      unmount();

      // Re-render (simulates navigation away and back)
      renderChatPage(chatContext);

      // Should load session again
      await waitFor(() => {
        expect(chatContext.loadActiveSession).toHaveBeenCalled();
      });
    });

    test('should maintain message history after browser refresh simulation', async () => {
      // Mock localStorage for session persistence
      const mockLocalStorage = {
        getItem: jest.fn().mockReturnValue('session-1'),
        setItem: jest.fn()
      };
      Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

      const chatContext = {
        ...mockChatContext,
        currentSession: { id: 'session-1', title: 'Test Session' },
        messages: [
          { id: 'msg-1', sender: 'user', message: 'Persisted message', createdAt: '2025-10-20T10:00:00Z' }
        ]
      };

      renderChatPage(chatContext);

      await waitFor(() => {
        expect(screen.getByText('Persisted message')).toBeInTheDocument();
      });
    });
  });

  /**
   * Test Suite: Message Display
   */
  describe('Message Display', () => {
    test('should display messages in chronological order', async () => {
      const mockMessages = [
        { id: 'msg-1', sender: 'user', message: 'First message', createdAt: '2025-10-20T10:00:00Z' },
        { id: 'msg-2', sender: 'assistant', message: 'Second message', createdAt: '2025-10-20T10:00:01Z' },
        { id: 'msg-3', sender: 'user', message: 'Third message', createdAt: '2025-10-20T10:00:02Z' }
      ];

      const chatContext = {
        ...mockChatContext,
        currentSession: { id: 'session-1', title: 'Test Session' },
        messages: mockMessages
      };

      renderChatPage(chatContext);

      const messages = screen.getAllByText(/message/i);
      expect(messages[0]).toHaveTextContent('First message');
      expect(messages[1]).toHaveTextContent('Second message');
      expect(messages[2]).toHaveTextContent('Third message');
    });

    test('should differentiate between user and assistant messages', async () => {
      const mockMessages = [
        { id: 'msg-1', sender: 'user', message: 'User message', createdAt: '2025-10-20T10:00:00Z' },
        { id: 'msg-2', sender: 'assistant', message: 'Assistant message', createdAt: '2025-10-20T10:00:01Z' }
      ];

      const chatContext = {
        ...mockChatContext,
        currentSession: { id: 'session-1', title: 'Test Session' },
        messages: mockMessages
      };

      renderChatPage(chatContext);

      await waitFor(() => {
        expect(screen.getByText('YOU')).toBeInTheDocument();
        expect(screen.getByText('AI ASSISTANT')).toBeInTheDocument();
      });
    });

    test('should auto-scroll to bottom when new message arrives', async () => {
      const mockMessages = [
        { id: 'msg-1', sender: 'user', message: 'Message 1', createdAt: '2025-10-20T10:00:00Z' }
      ];

      const chatContext = {
        ...mockChatContext,
        currentSession: { id: 'session-1', title: 'Test Session' },
        messages: mockMessages
      };

      const { rerender } = renderChatPage(chatContext);

      // Add new message
      const updatedMessages = [
        ...mockMessages,
        { id: 'msg-2', sender: 'assistant', message: 'New message', createdAt: '2025-10-20T10:00:01Z' }
      ];

      const updatedContext = {
        ...chatContext,
        messages: updatedMessages
      };

      rerender(
        <AuthContext.Provider value={mockAuthContext}>
          <ChatPage />
        </AuthContext.Provider>
      );

      // Should scroll to show new message (implementation detail)
      await waitFor(() => {
        expect(screen.getByText('New message')).toBeInTheDocument();
      });
    });
  });

  /**
   * Test Suite: Error Handling
   */
  describe('Error Handling', () => {
    test('should display error message when send fails', async () => {
      const chatContext = {
        ...mockChatContext,
        currentSession: { id: 'session-1', title: 'Test Session' },
        sendMessage: jest.fn().mockRejectedValue(new Error('Network error'))
      };

      renderChatPage(chatContext);

      const input = screen.getByPlaceholderText(/type your message/i);
      const sendButton = screen.getByRole('button', { name: /send/i });

      await userEvent.type(input, 'Test message');
      await userEvent.click(sendButton);

      await waitFor(() => {
        // Should display error (implementation specific)
        expect(screen.getByText(/error/i) || screen.getByText(/failed/i)).toBeInTheDocument();
      });
    });

    test('should handle session not found error', async () => {
      const chatContext = {
        ...mockChatContext,
        currentSession: null,
        loadActiveSession: jest.fn().mockRejectedValue({
          code: 'SESSION_NOT_FOUND',
          message: 'Session not found'
        })
      };

      renderChatPage(chatContext);

      await waitFor(() => {
        // Should still render without crashing
        expect(screen.getByText(/AI ASSISTANT CHAT/i)).toBeInTheDocument();
      });
    });

    test('should remove optimistic message on send failure', async () => {
      const chatContext = {
        ...mockChatContext,
        currentSession: { id: 'session-1', title: 'Test Session' },
        messages: [],
        sendMessage: jest.fn().mockRejectedValue(new Error('Send failed'))
      };

      renderChatPage(chatContext);

      const input = screen.getByPlaceholderText(/type your message/i);
      const sendButton = screen.getByRole('button', { name: /send/i });

      await userEvent.type(input, 'Failed message');
      await userEvent.click(sendButton);

      // Message appears optimistically
      await waitFor(() => {
        expect(screen.getByText('Failed message')).toBeInTheDocument();
      });

      // Message should be removed after failure
      await waitFor(() => {
        expect(screen.queryByText('Failed message')).not.toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  /**
   * Test Suite: Session Title Display
   */
  describe('Session Title Display', () => {
    test('should display session title in header', async () => {
      const chatContext = {
        ...mockChatContext,
        currentSession: { id: 'session-1', title: 'Phase 2 Requirements Discussion' },
        messages: []
      };

      renderChatPage(chatContext);

      await waitFor(() => {
        expect(screen.getByText(/Phase 2 Requirements Discussion/i)).toBeInTheDocument();
      });
    });

    test('should display default title when session has no title', async () => {
      const chatContext = {
        ...mockChatContext,
        currentSession: { id: 'session-1', title: null },
        messages: []
      };

      renderChatPage(chatContext);

      await waitFor(() => {
        expect(screen.getByText(/AI ASSISTANT CHAT/i)).toBeInTheDocument();
      });
    });

    test('should update title when session changes', async () => {
      const chatContext = {
        ...mockChatContext,
        currentSession: { id: 'session-1', title: 'Original Title' },
        messages: []
      };

      const { rerender } = renderChatPage(chatContext);

      await waitFor(() => {
        expect(screen.getByText(/Original Title/i)).toBeInTheDocument();
      });

      // Switch session
      const updatedContext = {
        ...chatContext,
        currentSession: { id: 'session-2', title: 'New Title' }
      };

      rerender(
        <AuthContext.Provider value={mockAuthContext}>
          <ChatPage />
        </AuthContext.Provider>
      );

      await waitFor(() => {
        expect(screen.getByText(/New Title/i)).toBeInTheDocument();
      });
    });
  });

  /**
   * Test Suite: Keyboard Shortcuts
   */
  describe('Keyboard Shortcuts', () => {
    test('should send message on Enter key press', async () => {
      const chatContext = {
        ...mockChatContext,
        currentSession: { id: 'session-1', title: 'Test Session' },
        sendMessage: jest.fn()
      };

      renderChatPage(chatContext);

      const input = screen.getByPlaceholderText(/type your message/i);

      await userEvent.type(input, 'Test message{Enter}');

      await waitFor(() => {
        expect(chatContext.sendMessage).toHaveBeenCalledWith(
          'Test message',
          expect.any(Object)
        );
      });
    });

    test('should not send message on Shift+Enter (multiline support)', async () => {
      const chatContext = {
        ...mockChatContext,
        currentSession: { id: 'session-1', title: 'Test Session' },
        sendMessage: jest.fn()
      };

      renderChatPage(chatContext);

      const input = screen.getByPlaceholderText(/type your message/i);

      await userEvent.type(input, 'Line 1{Shift>}{Enter}{/Shift}Line 2');

      expect(chatContext.sendMessage).not.toHaveBeenCalled();
      expect(input).toHaveValue(expect.stringContaining('Line 1'));
      expect(input).toHaveValue(expect.stringContaining('Line 2'));
    });
  });

  /**
   * Test Suite: Authentication Integration
   */
  describe('Authentication Integration', () => {
    test('should require authentication to access chat', async () => {
      const unauthenticatedContext = {
        ...mockAuthContext,
        token: null,
        user: null,
        isAuthenticated: false
      };

      renderChatPage(mockChatContext, unauthenticatedContext);

      // Should redirect or show login prompt
      await waitFor(() => {
        expect(screen.queryByPlaceholderText(/type your message/i)).not.toBeInTheDocument();
      });
    });

    test('should pass authentication token in API requests', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          response: { message: 'Response', id: 'msg-1' }
        })
      });

      const chatContext = {
        ...mockChatContext,
        currentSession: { id: 'session-1', title: 'Test Session' }
      };

      renderChatPage(chatContext);

      const input = screen.getByPlaceholderText(/type your message/i);
      const sendButton = screen.getByRole('button', { name: /send/i });

      await userEvent.type(input, 'Test message');
      await userEvent.click(sendButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/chat'),
          expect.objectContaining({
            headers: expect.objectContaining({
              'Authorization': 'Bearer mock-token-123'
            })
          })
        );
      });
    });
  });
});
