import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './EmbeddedChat.css';

/**
 * EmbeddedChat - Compact chat interface for split-screen layout
 *
 * Embedded version of the chat interface designed for the Progress page.
 * Shows recent messages and allows sending new messages.
 */
function EmbeddedChat({ productId }) {
  const { token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (productId && token) {
      fetchRecentMessages();
    }
  }, [productId, token]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchRecentMessages = async () => {
    try {
      const response = await fetch(`/api/chat/history?product_id=${productId}&limit=20`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setLoading(true);
    setError(null);

    // Add user message immediately to UI
    const tempUserMsg = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          product_id: productId
        }),
      });

      const data = await response.json();

      if (data.success && data.response) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.response,
          timestamp: new Date().toISOString()
        }]);
      } else {
        setError(data.error || 'Failed to get response');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!productId) {
    return (
      <div className="embedded-chat">
        <div className="chat-header">
          <h3>C2PA Assistant Chat</h3>
        </div>
        <div className="chat-empty">
          <p>Select a product to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="embedded-chat">
      <div className="chat-header">
        <h3>C2PA Assistant Chat</h3>
        <span className="chat-status">Online</span>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-welcome">
            <p>Ask questions about your C2PA certification process!</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`chat-message ${msg.role}`}>
              <div className="message-avatar">
                {msg.role === 'user' ? '👤' : '🤖'}
              </div>
              <div className="message-content">
                <div className="message-text">{msg.content}</div>
                <div className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="chat-message assistant">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="message-text typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="chat-error">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <form className="chat-input-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="chat-input"
          placeholder="Ask about certification process..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="chat-send-btn"
          disabled={!inputMessage.trim() || loading}
        >
          {loading ? '...' : '→'}
        </button>
      </form>
    </div>
  );
}

export default EmbeddedChat;
