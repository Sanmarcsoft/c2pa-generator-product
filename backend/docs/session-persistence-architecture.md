# Chat Session Persistence Architecture

## Document Version
- **Version**: 1.0
- **Date**: 2025-10-21
- **Author**: Software Architect Agent
- **Status**: Design Phase

---

## 1. Executive Summary

This document outlines the technical architecture for implementing comprehensive chat session persistence in the C2PA Generator Product Certification Assistant. The solution enables users to maintain continuous conversations across browser refreshes, logouts, and device changes while ensuring secure isolation between users and seamless integration with OpenWebUI.

### Key Design Goals
- **Persistence**: Users can leave and return to conversations without data loss
- **Isolation**: Each user's chat sessions are completely isolated from others
- **Continuity**: Sessions persist across browser refreshes and login sessions
- **Scalability**: Support multiple concurrent sessions per user (future enhancement)
- **Integration**: Maintain session continuity with OpenWebUI backend

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ AuthContext │  │  ChatContext │  │   ChatPage.jsx       │  │
│  │  (User ID)  │  │  (Session)   │  │  (UI Components)     │  │
│  └──────┬──────┘  └──────┬───────┘  └──────────┬───────────┘  │
└─────────┼─────────────────┼──────────────────────┼──────────────┘
          │                 │                      │
          │     JWT Token   │                      │
          └─────────────────┼──────────────────────┘
                           │
                    HTTPS / Bearer Auth
                           │
┌──────────────────────────┼───────────────────────────────────────┐
│                    Backend Layer                                 │
├──────────────────────────┼───────────────────────────────────────┤
│  ┌───────────────────────▼────────────────────────────────┐     │
│  │         requireAuth Middleware                         │     │
│  │     (Validates JWT, Attaches req.user)                 │     │
│  └───────────────────────┬────────────────────────────────┘     │
│                          │                                       │
│  ┌───────────────────────▼────────────────────────────────┐     │
│  │            Chat API Routes (/api/chat)                 │     │
│  │  ┌──────────────────────────────────────────────┐     │     │
│  │  │  POST /          - Send message              │     │     │
│  │  │  GET  /history   - Get conversation history  │     │     │
│  │  │  GET  /sessions  - List user's sessions      │     │     │
│  │  │  POST /sessions  - Create new session        │     │     │
│  │  │  GET  /sessions/:id - Get specific session   │     │     │
│  │  │  DELETE /sessions/:id - Archive session      │     │     │
│  │  └──────────────────────────────────────────────┘     │     │
│  └───────────────────────┬────────────────────────────────┘     │
│                          │                                       │
│  ┌───────────────────────▼────────────────────────────────┐     │
│  │           Session Management Service                   │     │
│  │  - Create/retrieve session by user_id                  │     │
│  │  - Manage session metadata (title, created_at, etc)    │     │
│  │  - Link messages to sessions                           │     │
│  └───────────────────────┬────────────────────────────────┘     │
│                          │                                       │
│  ┌───────────────────────▼────────────────────────────────┐     │
│  │              AI Service (aiService.js)                 │     │
│  │  - Generate responses with context                     │     │
│  │  - Manage OpenWebUI integration                        │     │
│  │  - Track openwebui_chat_id per session                 │     │
│  └───────────────────────┬────────────────────────────────┘     │
│                          │                                       │
└──────────────────────────┼───────────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────────┐
│                    Persistence Layer (SQLite)                    │
├──────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐   ┌──────────────────┐   ┌──────────────┐ │
│  │  users          │   │  chat_sessions   │   │ chat_messages│ │
│  ├─────────────────┤   ├──────────────────┤   ├──────────────┤ │
│  │ id (PK)         │   │ id (PK)          │   │ id (PK)      │ │
│  │ email           │◄──┤ user_id (FK)     │◄──┤ session_id   │ │
│  │ name            │   │ title            │   │ user_id (FK) │ │
│  │ role            │   │ created_at       │   │ sender       │ │
│  └─────────────────┘   │ updated_at       │   │ message      │ │
│                        │ openwebui_chat_id│   │ created_at   │ │
│                        │ is_active        │   │ openwebui... │ │
│                        │ metadata         │   └──────────────┘ │
│                        └──────────────────┘                     │
└──────────────────────────────────────────────────────────────────┘
                           │
                           │  (For OpenWebUI provider only)
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                  External: OpenWebUI Instance                    │
│              (openwebui.matthewstevens.org)                      │
│  - Maintains its own chat sessions                               │
│  - Returns chat_id for session continuity                        │
│  - Stores full conversation history                              │
└──────────────────────────────────────────────────────────────────┘
```

---

## 3. Database Schema

### 3.1 Current Schema (Already Implemented)

#### users table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,              -- UUID
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user',         -- 'user' or 'admin'
  name TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  last_login TEXT
);

CREATE INDEX idx_users_email ON users(email);
```

#### chat_messages table (Enhanced)
```sql
CREATE TABLE chat_messages (
  id TEXT PRIMARY KEY,              -- UUID
  sender TEXT NOT NULL,             -- 'user' or 'assistant'
  message TEXT NOT NULL,
  context TEXT,                     -- JSON: {currentPhase, etc}
  metadata TEXT,                    -- JSON: {timestamp, emotion, animation}
  user_id TEXT,                     -- FK to users.id (ADDED)
  openwebui_chat_id TEXT,           -- OpenWebUI session ID (ADDED)
  session_id TEXT,                  -- FK to chat_sessions.id (NEW)
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (session_id) REFERENCES chat_sessions (id) ON DELETE CASCADE
);

CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
```

### 3.2 New Schema Requirements

#### chat_sessions table (NEW)
```sql
CREATE TABLE chat_sessions (
  id TEXT PRIMARY KEY,              -- UUID
  user_id TEXT NOT NULL,            -- FK to users.id
  title TEXT,                       -- Auto-generated or user-defined
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  last_message_at TEXT,             -- Timestamp of last message
  openwebui_chat_id TEXT,           -- Associated OpenWebUI session
  is_active INTEGER DEFAULT 1,      -- 1=active, 0=archived
  message_count INTEGER DEFAULT 0,  -- Cached count for performance
  metadata TEXT,                    -- JSON: {phase, tags, etc}
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_is_active ON chat_sessions(is_active);
CREATE INDEX idx_chat_sessions_updated_at ON chat_sessions(updated_at);
CREATE UNIQUE INDEX idx_chat_sessions_openwebui ON chat_sessions(openwebui_chat_id) WHERE openwebui_chat_id IS NOT NULL;
```

### 3.3 Migration Strategy

**Migration File**: `/backend/src/migrations/001_add_chat_sessions.js`

```javascript
// Add to database.js initDatabase() function
async function migration_001_add_chat_sessions() {
  // Step 1: Create chat_sessions table
  await runAsync(`CREATE TABLE IF NOT EXISTS chat_sessions ...`);

  // Step 2: Add session_id column to chat_messages
  const tableInfo = await allAsync('PRAGMA table_info(chat_messages)');
  const hasSessionId = tableInfo.some(col => col.name === 'session_id');

  if (!hasSessionId) {
    await runAsync('ALTER TABLE chat_messages ADD COLUMN session_id TEXT');
  }

  // Step 3: Create default sessions for existing messages
  // Group messages by user_id and create sessions
  const existingMessages = await allAsync(
    'SELECT DISTINCT user_id FROM chat_messages WHERE user_id IS NOT NULL'
  );

  for (const { user_id } of existingMessages) {
    const sessionId = uuidv4();

    // Create default session for this user
    await runAsync(
      `INSERT INTO chat_sessions (id, user_id, title, created_at, is_active)
       VALUES (?, ?, ?, ?, ?)`,
      [sessionId, user_id, 'Default Session', new Date().toISOString(), 1]
    );

    // Link all existing messages to this session
    await runAsync(
      'UPDATE chat_messages SET session_id = ? WHERE user_id = ?',
      [sessionId, user_id]
    );
  }

  logger.info('Migration 001: chat_sessions table created and data migrated');
}
```

---

## 4. Backend API Endpoints

### 4.1 Chat Message Endpoints

#### POST /api/chat
**Purpose**: Send a new message in the current session

**Request**:
```json
{
  "message": "What are the requirements for Phase 2?",
  "context": {
    "currentPhase": "phase-2"
  },
  "sessionId": "optional-session-uuid"  // If not provided, use active session
}
```

**Response**:
```json
{
  "success": true,
  "response": {
    "id": "message-uuid",
    "message": "Phase 2 requirements include...",
    "emotion": "helpful",
    "animation": "presenting",
    "suggestions": ["Review technical docs", "Upload requirements"]
  },
  "session": {
    "id": "session-uuid",
    "title": "Phase 2 Discussion",
    "messageCount": 12,
    "updatedAt": "2025-10-21T10:30:00Z"
  }
}
```

**Implementation Notes**:
- If `sessionId` not provided, retrieve user's active session
- If no active session exists, create new session automatically
- Update session's `updated_at` and `last_message_at` timestamps
- Increment session's `message_count`
- Maintain OpenWebUI `chat_id` linkage if provider is OpenWebUI

---

#### GET /api/chat/history
**Purpose**: Get conversation history for current or specific session

**Query Parameters**:
- `sessionId` (optional): Specific session ID; defaults to active session
- `limit` (optional): Number of messages to return (default: 50)
- `offset` (optional): Pagination offset (default: 0)
- `order` (optional): 'asc' or 'desc' (default: 'asc')

**Request**:
```
GET /api/chat/history?sessionId=abc-123&limit=20&offset=0
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "session": {
    "id": "abc-123",
    "title": "Phase 2 Discussion",
    "createdAt": "2025-10-20T14:00:00Z",
    "messageCount": 24,
    "metadata": {
      "currentPhase": "phase-2"
    }
  },
  "messages": [
    {
      "id": "msg-1",
      "sender": "user",
      "message": "Tell me about Phase 2",
      "createdAt": "2025-10-20T14:05:00Z"
    },
    {
      "id": "msg-2",
      "sender": "assistant",
      "message": "Phase 2 is about...",
      "createdAt": "2025-10-20T14:05:02Z",
      "metadata": {
        "emotion": "helpful",
        "animation": "presenting"
      }
    }
  ],
  "pagination": {
    "total": 24,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

---

### 4.2 Session Management Endpoints (NEW)

#### GET /api/chat/sessions
**Purpose**: List all sessions for the authenticated user

**Query Parameters**:
- `includeArchived` (optional): Include archived sessions (default: false)
- `limit` (optional): Number of sessions (default: 20)
- `offset` (optional): Pagination offset (default: 0)

**Request**:
```
GET /api/chat/sessions?includeArchived=false&limit=10
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "sessions": [
    {
      "id": "session-1",
      "title": "Getting Started",
      "createdAt": "2025-10-20T10:00:00Z",
      "updatedAt": "2025-10-20T15:30:00Z",
      "lastMessageAt": "2025-10-20T15:30:00Z",
      "messageCount": 15,
      "isActive": true,
      "preview": "Last message preview text..."
    },
    {
      "id": "session-2",
      "title": "Phase 2 Requirements",
      "createdAt": "2025-10-21T09:00:00Z",
      "updatedAt": "2025-10-21T10:30:00Z",
      "lastMessageAt": "2025-10-21T10:30:00Z",
      "messageCount": 8,
      "isActive": true,
      "preview": "Most recent message..."
    }
  ],
  "pagination": {
    "total": 2,
    "limit": 10,
    "offset": 0
  }
}
```

---

#### POST /api/chat/sessions
**Purpose**: Create a new chat session

**Request**:
```json
{
  "title": "Phase 3 Planning",  // Optional, auto-generated if not provided
  "metadata": {
    "currentPhase": "phase-3",
    "tags": ["planning", "documents"]
  }
}
```

**Response**:
```json
{
  "success": true,
  "session": {
    "id": "new-session-uuid",
    "title": "Phase 3 Planning",
    "createdAt": "2025-10-21T11:00:00Z",
    "isActive": true,
    "messageCount": 0
  }
}
```

---

#### GET /api/chat/sessions/:sessionId
**Purpose**: Get detailed information about a specific session

**Request**:
```
GET /api/chat/sessions/abc-123
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "session": {
    "id": "abc-123",
    "userId": "user-123",
    "title": "Phase 2 Discussion",
    "createdAt": "2025-10-20T14:00:00Z",
    "updatedAt": "2025-10-21T10:30:00Z",
    "lastMessageAt": "2025-10-21T10:30:00Z",
    "messageCount": 24,
    "isActive": true,
    "openwebuiChatId": "openwebui-xyz",
    "metadata": {
      "currentPhase": "phase-2",
      "tags": ["requirements", "technical"]
    }
  }
}
```

---

#### PATCH /api/chat/sessions/:sessionId
**Purpose**: Update session metadata (title, tags, etc.)

**Request**:
```json
{
  "title": "Updated Session Title",
  "metadata": {
    "currentPhase": "phase-3",
    "tags": ["updated", "tags"]
  }
}
```

**Response**:
```json
{
  "success": true,
  "session": {
    "id": "abc-123",
    "title": "Updated Session Title",
    "updatedAt": "2025-10-21T11:15:00Z"
  }
}
```

---

#### DELETE /api/chat/sessions/:sessionId
**Purpose**: Archive (soft delete) a session

**Request**:
```
DELETE /api/chat/sessions/abc-123
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "message": "Session archived successfully"
}
```

**Implementation Notes**:
- Sets `is_active = 0` (soft delete)
- Messages are preserved but not displayed in active session lists
- Can be restored by admin if needed

---

## 5. Frontend State Management

### 5.1 New Context: ChatContext

**File**: `/frontend/src/contexts/ChatContext.jsx`

```javascript
import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ChatContext = createContext(null);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [currentSession, setCurrentSession] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load active session on mount or user change
  useEffect(() => {
    if (user && token) {
      loadActiveSession();
    }
  }, [user, token]);

  // Load the user's active session
  const loadActiveSession = async () => {
    try {
      const response = await fetch('/api/chat/sessions?limit=1', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.success && data.sessions.length > 0) {
        setCurrentSession(data.sessions[0]);
        await loadSessionMessages(data.sessions[0].id);
      } else {
        // No session exists, create a default one
        await createNewSession('New Conversation');
      }
    } catch (error) {
      console.error('Failed to load active session:', error);
    }
  };

  // Load messages for a specific session
  const loadSessionMessages = async (sessionId) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/chat/history?sessionId=${sessionId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await response.json();

      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create a new session
  const createNewSession = async (title) => {
    try {
      const response = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title })
      });
      const data = await response.json();

      if (data.success) {
        setCurrentSession(data.session);
        setMessages([]);
        return data.session;
      }
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  // Send a message in the current session
  const sendMessage = async (messageText, context = {}) => {
    if (!currentSession) {
      await createNewSession('New Conversation');
    }

    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      sender: 'user',
      message: messageText,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: messageText,
          context,
          sessionId: currentSession?.id
        })
      });
      const data = await response.json();

      if (data.success) {
        // Replace optimistic message with real one and add assistant response
        setMessages(prev => {
          const filtered = prev.filter(m => m.id !== optimisticMessage.id);
          return [
            ...filtered,
            { ...optimisticMessage, id: data.userMessageId || optimisticMessage.id },
            {
              id: data.response.id,
              sender: 'assistant',
              message: data.response.message,
              createdAt: new Date().toISOString(),
              metadata: {
                emotion: data.response.emotion,
                animation: data.response.animation
              }
            }
          ];
        });

        // Update current session metadata
        if (data.session) {
          setCurrentSession(data.session);
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
    } finally {
      setLoading(false);
    }
  };

  // Switch to a different session
  const switchSession = async (sessionId) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSession(session);
      await loadSessionMessages(sessionId);
    }
  };

  const value = {
    currentSession,
    sessions,
    messages,
    loading,
    sendMessage,
    createNewSession,
    switchSession,
    loadActiveSession,
    loadSessionMessages
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
```

### 5.2 Updated ChatPage Component

**File**: `/frontend/src/pages/ChatPage.jsx`

```javascript
import { useState, useEffect, useRef } from 'react';
import { useChatContext } from '../contexts/ChatContext';
import './ChatPage.css';

function ChatPage() {
  const {
    currentSession,
    messages,
    loading,
    sendMessage
  } = useChatContext();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const messageText = input;
    setInput('');

    await sendMessage(messageText, {
      currentPhase: 'phase-1' // Get from app state
    });
  };

  return (
    <div className="chat-page">
      <h1 className="page-title">
        AI ASSISTANT CHAT
        {currentSession && (
          <span className="session-title"> - {currentSession.title}</span>
        )}
      </h1>

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
          <div ref={messagesEndRef} />
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
```

---

## 6. Session Lifecycle

### 6.1 Session Creation Flow

```
User Opens Chat Page
        │
        ▼
ChatContext Initializes
        │
        ├─► Has Active Session? ────YES──► Load Session Messages
        │                                         │
        │                                         ▼
        │                                   Display Messages
        │                                         │
        └─► NO                                    │
             │                                     │
             ▼                                     │
    Create Default Session ───────────────────────┘
    (Title: "New Conversation")
             │
             ▼
    POST /api/chat/sessions
             │
             ├─► Generate UUID
             ├─► Create chat_sessions row
             ├─► Set is_active = 1
             ├─► If OpenWebUI: Create OpenWebUI session
             └─► Return session object
                      │
                      ▼
                Store in ChatContext
                      │
                      ▼
                Ready for Messages
```

### 6.2 Message Send Flow

```
User Types Message → Click Send
        │
        ▼
ChatContext.sendMessage()
        │
        ├─► Add Optimistic User Message to UI
        │
        ▼
POST /api/chat
        │
        ├─► requireAuth Middleware → Validate JWT → Attach req.user
        │
        ▼
Chat Route Handler
        │
        ├─► Resolve sessionId (from request or get active session)
        ├─► Insert user message → chat_messages table
        │       (id, sender='user', message, user_id, session_id)
        │
        ├─► Retrieve conversation history for session
        │       SELECT * FROM chat_messages WHERE session_id = ?
        │
        ├─► Call aiService.generateResponse()
        │       │
        │       ├─► Get/Create OpenWebUI session (if provider = openwebui)
        │       ├─► Build messages array with history
        │       ├─► Call OpenAI/OpenWebUI API
        │       └─► Return { message, emotion, animation, openwebuiChatId }
        │
        ├─► Insert assistant message → chat_messages table
        │       (id, sender='assistant', message, user_id, session_id,
        │        openwebui_chat_id, metadata)
        │
        ├─► Update chat_sessions table
        │       UPDATE chat_sessions SET
        │         updated_at = NOW(),
        │         last_message_at = NOW(),
        │         message_count = message_count + 2
        │       WHERE id = sessionId
        │
        └─► Return response with message & session info
                │
                ▼
        ChatContext Updates State
                │
                ├─► Replace optimistic message with real ID
                ├─► Add assistant message to messages array
                └─► Update currentSession metadata
                        │
                        ▼
                    UI Re-renders
```

### 6.3 Session Persistence on Browser Refresh

```
Page Refresh / User Returns to Chat
        │
        ▼
AuthContext Initializes
        │
        ├─► Read auth_token from localStorage
        ├─► Verify token: GET /api/auth/me
        └─► Set user state
                │
                ▼
        ChatContext Initializes
                │
                ▼
        loadActiveSession()
                │
                ├─► GET /api/chat/sessions?limit=1
                │       (Ordered by updated_at DESC)
                │
                ├─► Receive most recent active session
                │
                └─► loadSessionMessages(sessionId)
                        │
                        ├─► GET /api/chat/history?sessionId=...
                        ├─► Receive messages array
                        └─► setMessages(messages)
                                │
                                ▼
                        User sees conversation history restored
```

### 6.4 Session Isolation Between Users

```
User A Logs In                          User B Logs In
        │                                       │
        ▼                                       ▼
   JWT with A's ID                         JWT with B's ID
        │                                       │
        ▼                                       ▼
requireAuth extracts user_id=A         requireAuth extracts user_id=B
        │                                       │
        ▼                                       ▼
GET /api/chat/sessions                  GET /api/chat/sessions
        │                                       │
        ▼                                       ▼
SQL: WHERE user_id='A'                  SQL: WHERE user_id='B'
        │                                       │
        ▼                                       ▼
Returns only A's sessions               Returns only B's sessions
        │                                       │
        ▼                                       ▼
A sees their conversations              B sees their conversations

    ╔════════════════════════════════════════════════════════╗
    ║  Database enforces isolation via FOREIGN KEY + WHERE   ║
    ║  No cross-user session access possible                 ║
    ╚════════════════════════════════════════════════════════╝
```

---

## 7. OpenWebUI Integration Points

### 7.1 Session Mapping

The C2PA system maintains its own session management while optionally syncing with OpenWebUI:

```javascript
// In aiService.js - Enhanced getOrCreateOpenWebUISession()

async function getOrCreateOpenWebUISession(userId, userEmail, userName, userRole, sessionId) {
  // Check if OpenWebUI is configured
  const { getAsync } = require('../models/database');
  const providerSetting = await getAsync(
    'SELECT value FROM app_settings WHERE key = ?',
    ['ai_provider']
  );

  if (providerSetting?.value !== 'openwebui') {
    return null; // Not using OpenWebUI
  }

  // Check if session already has an OpenWebUI chat_id
  const session = await getAsync(
    'SELECT openwebui_chat_id FROM chat_sessions WHERE id = ?',
    [sessionId]
  );

  if (session?.openwebui_chat_id) {
    logger.info(`Reusing OpenWebUI session ${session.openwebui_chat_id}`);
    return session.openwebui_chat_id;
  }

  // Create new OpenWebUI session
  const openwebuiUrl = process.env.OPENWEBUI_URL;
  const openwebuiApiKey = getSecret('OPENWEBUI_API_KEY');

  try {
    const response = await axios.post(
      `${openwebuiUrl}/chats/new`,
      {
        chat: {
          title: `C2PA Chat - ${sessionId}`,
          models: [process.env.AI_MODEL || 'gpt-4'],
          messages: [],
          tags: ['c2pa-generator', `user:${userId}`, `session:${sessionId}`]
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${openwebuiApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const openwebuiChatId = response.data?.id;

    if (openwebuiChatId) {
      // Store the mapping in chat_sessions table
      await runAsync(
        'UPDATE chat_sessions SET openwebui_chat_id = ? WHERE id = ?',
        [openwebuiChatId, sessionId]
      );

      logger.info(`Created OpenWebUI session ${openwebuiChatId} for session ${sessionId}`);
      return openwebuiChatId;
    }
  } catch (error) {
    logger.error('Failed to create OpenWebUI session:', error.message);
    return null; // Continue without OpenWebUI integration
  }
}
```

### 7.2 Message Synchronization

When a message is sent:

1. **C2PA System**: Stores message in `chat_messages` table with `session_id`
2. **OpenWebUI** (if configured): Receives message with `chat_id` parameter
3. **Response**: OpenWebUI returns response, which is stored in `chat_messages`
4. **Linkage**: Both systems reference same conversation via `openwebui_chat_id`

**Benefits**:
- Users can access full conversation in OpenWebUI interface
- C2PA system maintains its own persistence independently
- Failure of OpenWebUI doesn't break C2PA chat functionality
- Session continuity maintained across both systems

---

## 8. Error Handling and Edge Cases

### 8.1 Common Error Scenarios

| Scenario | Detection | Handling |
|----------|-----------|----------|
| **User has no active session** | `GET /api/chat/sessions` returns empty | Auto-create default session on first message |
| **Session ID invalid** | `GET /api/chat/sessions/:id` returns 404 | Return error, redirect to active session |
| **Session belongs to different user** | Query `WHERE session_id=X AND user_id=Y` returns null | Return 403 Forbidden error |
| **OpenWebUI unavailable** | Connection timeout or 500 error | Continue without OpenWebUI, store messages locally |
| **Database connection lost** | SQLite error on query | Return 500, retry with exponential backoff |
| **Token expired mid-session** | JWT verification fails | Return 401, frontend redirects to login |
| **Duplicate message submission** | Same message text within 2 seconds | Debounce on frontend, use idempotency key |
| **Session limit exceeded** | User has >100 active sessions | Archive oldest sessions automatically |

### 8.2 Error Response Format

All API errors follow consistent structure:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "additional context"
  }
}
```

**Error Codes**:
- `SESSION_NOT_FOUND`: Session ID doesn't exist
- `SESSION_ACCESS_DENIED`: User doesn't own the session
- `NO_ACTIVE_SESSION`: User has no active sessions
- `OPENWEBUI_UNAVAILABLE`: OpenWebUI integration failed (non-fatal)
- `INVALID_MESSAGE`: Message validation failed
- `DATABASE_ERROR`: Database operation failed

### 8.3 Race Condition Handling

**Scenario**: User sends two messages rapidly in quick succession

**Solution**: Use database transactions and optimistic locking

```javascript
// In chat route handler
const session = await getAsync(
  'SELECT * FROM chat_sessions WHERE id = ? AND is_active = 1',
  [sessionId]
);

if (!session) {
  return res.status(404).json({ error: 'Session not found' });
}

// Use transaction to ensure atomic update
await runAsync('BEGIN TRANSACTION');
try {
  // Insert user message
  await runAsync('INSERT INTO chat_messages ...');

  // Insert assistant message
  await runAsync('INSERT INTO chat_messages ...');

  // Update session atomically
  await runAsync(
    `UPDATE chat_sessions SET
       updated_at = ?,
       message_count = message_count + 2
     WHERE id = ?`,
    [new Date().toISOString(), sessionId]
  );

  await runAsync('COMMIT');
} catch (error) {
  await runAsync('ROLLBACK');
  throw error;
}
```

---

## 9. Security Considerations

### 9.1 Authentication & Authorization

| Layer | Security Measure | Implementation |
|-------|------------------|----------------|
| **API** | JWT token validation | `requireAuth` middleware on all endpoints |
| **Session Access** | User ownership check | SQL: `WHERE user_id = req.user.id` |
| **Message Access** | Session-scoped queries | SQL: `WHERE session_id = ? AND user_id = ?` |
| **OpenWebUI** | Separate API key per user | User-specific tokens (future enhancement) |
| **Database** | Foreign key constraints | `ON DELETE CASCADE` for data integrity |

### 9.2 Data Privacy

**User Isolation**:
- All queries filtered by `user_id` from authenticated JWT
- No endpoint exposes cross-user data
- Admin endpoints (future) require `role='admin'` check

**Sensitive Data**:
- OpenWebUI API keys stored in secrets manager (not database)
- User passwords hashed with bcrypt (already implemented)
- No PII stored in chat messages metadata

### 9.3 Rate Limiting

```javascript
// Add to server.js or chat route
const rateLimit = require('express-rate-limit');

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,      // 1 minute
  max: 30,                  // 30 requests per minute per IP
  message: 'Too many messages sent. Please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/api/chat', requireAuth, chatLimiter, async (req, res) => {
  // Handler code
});
```

### 9.4 SQL Injection Prevention

- All queries use parameterized statements (already implemented)
- Example: `SELECT * FROM chat_messages WHERE user_id = ?` with `[userId]`
- Never concatenate user input into SQL strings

### 9.5 XSS Prevention

- Backend: Messages stored as plain text
- Frontend: React automatically escapes content in JSX
- For rich formatting (future): Use DOMPurify library

---

## 10. Migration Path from Current Implementation

### 10.1 Current State Assessment

**What Works**:
- ✅ User authentication with JWT
- ✅ `user_id` and `openwebui_chat_id` columns in `chat_messages`
- ✅ Messages stored with user association
- ✅ OpenWebUI integration functional

**What's Missing**:
- ❌ No `chat_sessions` table
- ❌ No `session_id` column in `chat_messages`
- ❌ Frontend loads all messages without session filtering
- ❌ No session management UI or API endpoints
- ❌ History endpoint doesn't support per-user filtering properly

### 10.2 Migration Steps (Zero Downtime)

#### Phase 1: Database Schema Update (Week 1)
1. Add `chat_sessions` table creation to `database.js`
2. Add `session_id` column to `chat_messages` table
3. Run migration script to create default sessions for existing users
4. Deploy backend changes (backward compatible - old frontend still works)

#### Phase 2: Backend API Development (Week 2)
1. Create `/api/chat/sessions` endpoints (GET, POST, PATCH, DELETE)
2. Update `POST /api/chat` to accept optional `sessionId`
3. Update `GET /api/chat/history` to filter by session
4. Add session auto-creation logic if none exists
5. Deploy backend (frontend can start using new endpoints)

#### Phase 3: Frontend Context Layer (Week 2-3)
1. Create `ChatContext.jsx` with session management
2. Update `ChatPage.jsx` to use `ChatContext`
3. Add session persistence on refresh
4. Test thoroughly with existing data
5. Deploy frontend (users see restored conversations)

#### Phase 4: UI Enhancements (Week 3-4)
1. Add session switcher sidebar (list of conversations)
2. Add "New Conversation" button
3. Add session rename functionality
4. Add session archive button
5. Polish UX and loading states

#### Phase 5: Testing & Monitoring (Week 4)
1. Load testing with concurrent users
2. Verify session isolation between users
3. Test browser refresh scenarios
4. Monitor error rates and performance
5. Gather user feedback

### 10.3 Rollback Plan

If issues arise during migration:

**Phase 1 Rollback**:
- New tables/columns don't break existing queries
- Simply don't populate `session_id` - messages still work

**Phase 2 Rollback**:
- Deploy previous backend version
- New endpoints aren't used by old frontend

**Phase 3 Rollback**:
- Revert frontend to previous build
- Backend remains functional for old frontend

**Data Safety**:
- No data is deleted during migration (only added)
- All migrations are additive (new columns, new tables)
- Original message data preserved in `chat_messages`

---

## 11. Performance Considerations

### 11.1 Query Optimization

**Indexes Required** (already in schema):
```sql
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_updated_at ON chat_sessions(updated_at);
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
```

**Query Pattern**:
```sql
-- Efficient: Uses index on user_id + updated_at
SELECT * FROM chat_sessions
WHERE user_id = ? AND is_active = 1
ORDER BY updated_at DESC
LIMIT 20;

-- Efficient: Uses index on session_id + created_at
SELECT * FROM chat_messages
WHERE session_id = ?
ORDER BY created_at ASC
LIMIT 50;
```

### 11.2 Caching Strategy

**Session Metadata Caching**:
- Cache `message_count` in `chat_sessions` table (update on insert)
- Avoid expensive `COUNT(*)` queries

**Frontend Caching**:
- Store active session in `ChatContext` state
- Only reload messages when switching sessions
- Use optimistic updates for better UX

### 11.3 Pagination

**Messages**:
- Load last 50 messages by default
- Implement "Load More" button for older messages
- Use offset-based pagination: `LIMIT 50 OFFSET 0`

**Sessions**:
- Load 20 most recent sessions
- Implement infinite scroll or "Load More" for older sessions

### 11.4 Database Size Management

**Archival Strategy**:
- Soft delete old sessions: `is_active = 0`
- Hard delete messages older than 1 year (with user consent)
- Compress archived sessions to JSON files (future enhancement)

**Estimated Growth**:
- Average message: 500 bytes
- 100 users × 10 messages/day × 365 days = ~183 MB/year
- SQLite handles this easily (supports databases up to 281 TB)

---

## 12. Testing Strategy

### 12.1 Unit Tests

**Backend Tests** (`/backend/tests/chat.test.js`):
```javascript
describe('Chat Session Persistence', () => {
  test('POST /api/chat creates session if none exists', async () => {
    const response = await request(app)
      .post('/api/chat')
      .set('Authorization', `Bearer ${testUserToken}`)
      .send({ message: 'Hello' });

    expect(response.status).toBe(200);
    expect(response.body.session).toBeDefined();
    expect(response.body.session.id).toBeTruthy();
  });

  test('GET /api/chat/history returns only user sessions', async () => {
    // User A sends messages
    await sendMessageAs(userAToken, 'User A message');

    // User B sends messages
    await sendMessageAs(userBToken, 'User B message');

    // User A fetches history
    const response = await request(app)
      .get('/api/chat/history')
      .set('Authorization', `Bearer ${userAToken}`);

    expect(response.body.messages).toHaveLength(1);
    expect(response.body.messages[0].message).toBe('User A message');
  });

  test('Session isolation: User cannot access another user session', async () => {
    const sessionA = await createSessionAs(userAToken);

    const response = await request(app)
      .get(`/api/chat/sessions/${sessionA.id}`)
      .set('Authorization', `Bearer ${userBToken}`);

    expect(response.status).toBe(403);
  });
});
```

### 12.2 Integration Tests

**Frontend Tests** (`/frontend/src/tests/ChatPage.test.jsx`):
```javascript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatProvider } from '../contexts/ChatContext';
import ChatPage from '../pages/ChatPage';

test('Chat page restores session on mount', async () => {
  // Mock API to return existing session
  mockApi('/api/chat/sessions', { sessions: [mockSession] });
  mockApi('/api/chat/history', { messages: [mockMessage] });

  render(
    <ChatProvider>
      <ChatPage />
    </ChatProvider>
  );

  await waitFor(() => {
    expect(screen.getByText('Welcome back!')).toBeInTheDocument();
  });
});

test('Sending message updates UI optimistically', async () => {
  render(<ChatProvider><ChatPage /></ChatProvider>);

  const input = screen.getByPlaceholderText('TYPE YOUR MESSAGE...');
  const sendButton = screen.getByText('SEND');

  userEvent.type(input, 'Test message');
  userEvent.click(sendButton);

  // Message appears immediately (optimistic)
  expect(screen.getByText('Test message')).toBeInTheDocument();

  // Wait for server response
  await waitFor(() => {
    expect(screen.getByText('AI response')).toBeInTheDocument();
  });
});
```

### 12.3 Load Testing

**Scenario**: 100 concurrent users, each sending 10 messages

```bash
# Using Apache Bench or similar tool
ab -n 1000 -c 100 -H "Authorization: Bearer <token>" \
   -p message.json -T application/json \
   http://localhost:3000/api/chat
```

**Expected Performance**:
- Response time: <500ms (p95)
- Throughput: >100 requests/second
- Error rate: <0.1%

---

## 13. Monitoring and Observability

### 13.1 Key Metrics

| Metric | Measurement | Alert Threshold |
|--------|-------------|-----------------|
| **Session Creation Rate** | Sessions/hour | >1000 (possible abuse) |
| **Message Throughput** | Messages/second | Monitor for trends |
| **API Error Rate** | Failed requests / total | >5% |
| **Response Time (p95)** | ms | >1000ms |
| **OpenWebUI Availability** | Success rate | <90% |
| **Database Size** | MB | >10GB (consider archival) |

### 13.2 Logging

**Log Events**:
```javascript
// In chat route handler
logger.info('Session created', {
  userId: req.user.id,
  sessionId: session.id,
  timestamp: new Date().toISOString()
});

logger.info('Message sent', {
  userId: req.user.id,
  sessionId: session.id,
  messageLength: message.length
});

logger.error('OpenWebUI integration failed', {
  userId: req.user.id,
  error: error.message,
  fallbackMode: true
});
```

### 13.3 Health Check Endpoint

```javascript
// GET /api/health
router.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      database: 'unknown',
      openwebui: 'unknown',
      authentication: 'healthy'
    }
  };

  // Check database
  try {
    await getAsync('SELECT 1');
    health.checks.database = 'healthy';
  } catch (error) {
    health.checks.database = 'unhealthy';
    health.status = 'degraded';
  }

  // Check OpenWebUI (if configured)
  if (process.env.OPENWEBUI_URL) {
    try {
      await axios.get(`${process.env.OPENWEBUI_URL}/health`, { timeout: 2000 });
      health.checks.openwebui = 'healthy';
    } catch (error) {
      health.checks.openwebui = 'unhealthy';
      // Non-fatal - system continues in fallback mode
    }
  } else {
    health.checks.openwebui = 'not_configured';
  }

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});
```

---

## 14. Future Enhancements (Out of Scope for Initial Implementation)

### 14.1 Multiple Concurrent Sessions
- User can have multiple active sessions simultaneously
- Session switcher UI in sidebar
- Drag-and-drop to organize sessions

### 14.2 Session Sharing
- Generate shareable link for a session
- Read-only access for collaborators
- Permission levels (view, comment, edit)

### 14.3 Export and Backup
- Export session as PDF or Markdown
- Scheduled backups to cloud storage
- Import historical conversations

### 14.4 Advanced Search
- Full-text search across all sessions
- Filter by date, phase, keywords
- Search within specific session

### 14.5 Session Templates
- Pre-built conversation starters for each phase
- Quick-start templates for common questions
- Customizable templates per user

### 14.6 Voice and Media Messages
- Voice-to-text input
- Image/document attachments in chat
- Video message support

---

## 15. Open Questions and Decisions Needed

### 15.1 Session Title Generation

**Question**: How should session titles be generated?

**Options**:
1. **Auto-generate from first message**: "What are the requirements..." → "Requirements Discussion"
2. **User-defined**: Prompt user to name session on creation
3. **AI-generated**: Use LLM to summarize session topic
4. **Timestamp-based**: "Conversation - Oct 21, 2025"

**Recommendation**: Start with Option 1 (auto-generate), allow user to rename manually

---

### 15.2 Session Limit per User

**Question**: Should there be a limit on active sessions per user?

**Options**:
1. **No limit**: Users can create unlimited sessions
2. **Soft limit**: Warning at 50 sessions, auto-archive oldest
3. **Hard limit**: Max 20 active sessions, must archive to create new

**Recommendation**: Soft limit of 50 active sessions with auto-archival

---

### 15.3 Message History Retention

**Question**: How long should message history be retained?

**Options**:
1. **Forever**: Never delete messages
2. **Rolling window**: Delete messages older than 1 year
3. **User-controlled**: Let users set retention policy
4. **Tiered**: Active sessions = forever, archived = 90 days

**Recommendation**: Keep all messages for active sessions, archive after 90 days of inactivity

---

### 15.4 OpenWebUI Session Creation Timing

**Question**: When should OpenWebUI sessions be created?

**Options**:
1. **On first message**: Lazy creation when user sends message
2. **On session creation**: Eager creation when C2PA session is created
3. **On demand**: Only if user explicitly uses OpenWebUI features

**Current Implementation**: Option 1 (on first message)
**Recommendation**: Keep current approach - it's efficient and avoids wasted resources

---

## 16. Success Criteria

The session persistence implementation will be considered successful when:

✅ **Functional Requirements**:
- [ ] Users can leave chat page and return to see full conversation history
- [ ] Each user's sessions are completely isolated from other users
- [ ] Sessions persist across browser refreshes and login/logout cycles
- [ ] New sessions are created automatically when needed
- [ ] OpenWebUI integration maintains session continuity

✅ **Non-Functional Requirements**:
- [ ] API response time <500ms (p95)
- [ ] Zero session data loss
- [ ] Support for 100+ concurrent users
- [ ] Database queries use proper indexes (no table scans)
- [ ] All endpoints require authentication

✅ **User Experience**:
- [ ] No perceivable delay when loading session history
- [ ] Optimistic UI updates for sent messages
- [ ] Clear error messages for any failures
- [ ] Smooth transition between sessions

✅ **Code Quality**:
- [ ] >80% test coverage for new code
- [ ] All API endpoints documented
- [ ] Error handling for all edge cases
- [ ] Logging for debugging and monitoring

---

## 17. Architectural Decisions Record (ADR)

### ADR-001: Use SQLite for Session Storage
**Decision**: Store sessions in SQLite database (same as existing data)
**Rationale**:
- Consistency with existing architecture
- ACID transactions for data integrity
- No additional infrastructure needed
- Sufficient performance for expected load
**Alternatives Considered**: Redis, PostgreSQL
**Status**: Accepted

---

### ADR-002: Implement Soft Delete for Sessions
**Decision**: Archive sessions using `is_active` flag rather than hard delete
**Rationale**:
- Preserve data for potential future restore
- Audit trail for compliance
- Simpler implementation (no cascade delete logic)
**Alternatives Considered**: Hard delete, move to archive table
**Status**: Accepted

---

### ADR-003: Create Separate ChatContext for State Management
**Decision**: Create dedicated ChatContext separate from AuthContext
**Rationale**:
- Separation of concerns (auth vs. chat logic)
- Independent state updates (chat can refresh without auth)
- Easier to test and maintain
**Alternatives Considered**: Extend AuthContext, use Redux
**Status**: Accepted

---

### ADR-004: Auto-Create Session on First Message
**Decision**: If user has no active session, create one automatically on first message
**Rationale**:
- Seamless UX (no explicit "New Session" action required)
- Reduces friction for new users
- Consistent with chat app expectations
**Alternatives Considered**: Force explicit session creation, use global default session
**Status**: Accepted

---

### ADR-005: Maintain OpenWebUI Integration as Optional
**Decision**: System functions fully without OpenWebUI, but integrates when configured
**Rationale**:
- Resilience (failure of OpenWebUI doesn't break app)
- Flexibility (users can choose AI provider)
- Simpler local development
**Alternatives Considered**: Require OpenWebUI, remove OpenWebUI integration
**Status**: Accepted

---

## 18. Appendix

### A. Database Migration SQL

```sql
-- Migration: Add chat sessions support
-- Version: 001
-- Date: 2025-10-21

BEGIN TRANSACTION;

-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  last_message_at TEXT,
  openwebui_chat_id TEXT,
  is_active INTEGER DEFAULT 1,
  message_count INTEGER DEFAULT 0,
  metadata TEXT,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_is_active ON chat_sessions(is_active);
CREATE INDEX idx_chat_sessions_updated_at ON chat_sessions(updated_at);
CREATE UNIQUE INDEX idx_chat_sessions_openwebui
  ON chat_sessions(openwebui_chat_id)
  WHERE openwebui_chat_id IS NOT NULL;

-- Add session_id column to chat_messages if not exists
-- (SQLite doesn't support IF NOT EXISTS for ALTER TABLE, so check first)
-- This would be done programmatically in the migration script

-- Create default sessions for existing users with messages
INSERT INTO chat_sessions (id, user_id, title, created_at, is_active, message_count)
SELECT
  hex(randomblob(16)) as id,
  user_id,
  'Default Session' as title,
  MIN(created_at) as created_at,
  1 as is_active,
  COUNT(*) as message_count
FROM chat_messages
WHERE user_id IS NOT NULL
GROUP BY user_id;

COMMIT;
```

### B. API Request/Response Examples

See Section 4 for comprehensive examples.

### C. References

- **C2PA Specification**: https://c2pa.org/specifications/specifications/1.4/
- **OpenWebUI Documentation**: https://docs.openwebui.com/
- **SQLite Best Practices**: https://www.sqlite.org/bestpractice.html
- **JWT Authentication**: https://jwt.io/introduction
- **React Context API**: https://react.dev/reference/react/useContext

---

## Document Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-10-21 | Software Architect Agent | Initial architecture document |

---

**END OF DOCUMENT**
