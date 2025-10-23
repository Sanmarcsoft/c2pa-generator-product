import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './ChatPage.css';

function ChatPage() {
  const { token } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'assistant',
      message: 'Hello Sanmarcsoft LLC! 👾 I\'m your C2PA certification assistant. Ready to begin your journey?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      message: input
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = input;
    setInput('');
    setLoading(true);

    try {
      console.log('[ChatPage] Sending message:', messageText);
      console.log('[ChatPage] Token:', token ? 'Present' : 'Missing');

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: messageText })
      });

      console.log('[ChatPage] Response status:', response.status);
      const data = await response.json();
      console.log('[ChatPage] Response data:', data);

      if (data.success && data.response) {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'assistant',
          message: data.response.message
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'assistant',
          message: data.error || 'Failed to get response from AI'
        }]);
      }
    } catch (error) {
      console.error('[ChatPage] Chat error:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'assistant',
        message: `Error: ${error.message}`
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-page">
      <h1 className="page-title">AI ASSISTANT CHAT</h1>

      <div className="chat-container retro-card">
        <div className="chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-message ${msg.sender}`}>
              <div className="message-sender">
                {msg.sender === 'user' ? 'YOU' : 'AI ASSISTANT'}
              </div>
              <div className="message-content">{msg.message}</div>
            </div>
          ))}
          {loading && (
            <div className="chat-message assistant">
              <div className="message-sender">AI ASSISTANT</div>
              <div className="message-content">
                <div className="loading-spinner"></div>
              </div>
            </div>
          )}
        </div>

        <form className="chat-input-form" onSubmit={handleSend}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="TYPE YOUR MESSAGE..."
            className="chat-input"
            disabled={loading}
          />
          <button type="submit" disabled={loading || !input.trim()}>
            SEND
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatPage;
