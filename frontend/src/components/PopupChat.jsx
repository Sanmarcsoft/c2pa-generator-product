import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './PopupChat.css';

/**
 * PopupChat - Floating chat overlay for Progress page
 *
 * Popup version of the chat interface that overlays the page.
 * Can be toggled open/closed with a floating action button.
 */
function PopupChat({ productId, isOpen, onToggle }) {
  const { token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (productId && token && isOpen) {
      fetchRecentMessages();
    }
  }, [productId, token, isOpen]);

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

  if (!isOpen) return null;

  return (
    <>
      <div className="popup-chat-overlay" onClick={onToggle} />
      <div className="popup-chat">
        <div className="popup-chat-header">
          <div className="header-left">
            <h3>C2PA Assistant</h3>
            <span className="chat-status">Online</span>
          </div>
          <button className="close-btn" onClick={onToggle} aria-label="Close chat">
            ×
          </button>
        </div>

        <div className="popup-chat-messages">
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
          <div className="popup-chat-error">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        <form className="popup-chat-input-form" onSubmit={handleSubmit}>
          <input
            type="text"
            className="popup-chat-input"
            placeholder="Ask about certification..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            className="popup-chat-send-btn"
            disabled={!inputMessage.trim() || loading}
          >
            {loading ? '...' : '→'}
          </button>
        </form>
      </div>
    </>
  );
}

export default PopupChat;
