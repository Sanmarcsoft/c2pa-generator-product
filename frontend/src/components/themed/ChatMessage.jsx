import PropTypes from 'prop-types';
import './ChatMessage.css';

/**
 * Themed ChatMessage Component
 *
 * Displays chat messages with theme-aware styling for both user and assistant messages.
 * Supports avatars, timestamps, and optional action buttons.
 *
 * @component
 * @example
 * <ChatMessage
 *   sender="user"
 *   message="What is C2PA?"
 *   timestamp={new Date()}
 * />
 *
 * <ChatMessage
 *   sender="assistant"
 *   message="C2PA is a technical standard..."
 *   timestamp={new Date()}
 *   actions={[{ label: 'View Source', onClick: handleClick }]}
 * />
 */
const ChatMessage = ({
  sender = 'user',
  message,
  timestamp,
  avatar,
  actions = [],
  isLoading = false,
  className = '',
  ...props
}) => {
  const classNames = [
    'themed-chat-message',
    `themed-chat-message--${sender}`,
    isLoading && 'themed-chat-message--loading',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const formatTimestamp = (date) => {
    if (!date) return '';
    const now = new Date();
    const messageDate = new Date(date);
    const diffInMinutes = Math.floor((now - messageDate) / 60000);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return messageDate.toLocaleDateString();
  };

  const getDefaultAvatar = () => {
    return sender === 'assistant' ? '🤖' : '👤';
  };

  return (
    <div className={classNames} {...props}>
      {/* Avatar */}
      <div className="themed-chat-message__avatar" aria-hidden="true">
        {avatar || getDefaultAvatar()}
      </div>

      {/* Content */}
      <div className="themed-chat-message__content">
        {/* Message bubble */}
        <div className="themed-chat-message__bubble">
          {isLoading ? (
            <div className="themed-chat-message__loading">
              <span className="themed-chat-message__loading-dot"></span>
              <span className="themed-chat-message__loading-dot"></span>
              <span className="themed-chat-message__loading-dot"></span>
            </div>
          ) : (
            <p className="themed-chat-message__text">{message}</p>
          )}
        </div>

        {/* Timestamp */}
        {timestamp && !isLoading && (
          <time
            className="themed-chat-message__timestamp"
            dateTime={new Date(timestamp).toISOString()}
          >
            {formatTimestamp(timestamp)}
          </time>
        )}

        {/* Actions */}
        {actions.length > 0 && !isLoading && (
          <div className="themed-chat-message__actions">
            {actions.map((action, index) => (
              <button
                key={index}
                type="button"
                className="themed-chat-message__action-btn"
                onClick={action.onClick}
                aria-label={action.label}
              >
                {action.icon && <span className="themed-chat-message__action-icon">{action.icon}</span>}
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

ChatMessage.propTypes = {
  /** Message sender type */
  sender: PropTypes.oneOf(['user', 'assistant']).isRequired,
  /** Message text content */
  message: PropTypes.string,
  /** Message timestamp */
  timestamp: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.instanceOf(Date),
  ]),
  /** Avatar URL or emoji */
  avatar: PropTypes.string,
  /** Action buttons array */
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      icon: PropTypes.node,
      onClick: PropTypes.func.isRequired,
    })
  ),
  /** Loading state */
  isLoading: PropTypes.bool,
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default ChatMessage;
