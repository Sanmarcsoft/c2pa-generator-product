import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import Button from '../components/themed/Button';
import Input from '../components/themed/Input';
import Card, { CardHeader, CardBody, CardFooter } from '../components/themed/Card';
import ChatMessage from '../components/themed/ChatMessage';
import Navigation from '../components/themed/Navigation';
import Modal from '../components/themed/Modal';
import './ThemeShowcase.css';

/**
 * ThemeShowcase Page
 *
 * Demonstrates all themed components across different states and variants.
 * Allows theme switching to preview components in all themes.
 */
const ThemeShowcase = () => {
  const { currentTheme, themes, changeTheme, getThemeName } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    if (e.target.value.length > 0) {
      setInputError('');
    }
  };

  const handleInputValidation = () => {
    if (inputValue.length === 0) {
      setInputError('This field is required');
    }
  };

  const navItems = [
    { label: 'Home', href: '#home', active: true, icon: '🏠' },
    { label: 'Chat', href: '#chat', icon: '💬' },
    { label: 'Documents', href: '#docs', icon: '📄' },
    { label: 'Progress', href: '#progress', icon: '📊' },
  ];

  const chatMessages = [
    {
      sender: 'assistant',
      message: 'Hello! How can I assist you with C2PA certification today?',
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      sender: 'user',
      message: 'What is C2PA and how does it work?',
      timestamp: new Date(Date.now() - 3000000),
    },
    {
      sender: 'assistant',
      message:
        'C2PA (Coalition for Content Provenance and Authenticity) is a technical standard that helps verify the authenticity and provenance of digital content. It embeds metadata into files to track their origin and modifications.',
      timestamp: new Date(Date.now() - 2500000),
      actions: [
        { label: 'View Source', icon: '📎', onClick: () => console.log('View source') },
        { label: 'Copy', icon: '📋', onClick: () => console.log('Copy') },
      ],
    },
  ];

  return (
    <div className="theme-showcase">
      {/* Theme Selector */}
      <div className="theme-showcase__header">
        <h1 className="theme-showcase__title">Component Showcase</h1>
        <div className="theme-showcase__theme-selector">
          <label htmlFor="theme-select" className="theme-showcase__label">
            Current Theme:
          </label>
          <select
            id="theme-select"
            className="theme-showcase__select"
            value={currentTheme}
            onChange={(e) => changeTheme(e.target.value)}
          >
            {Object.values(themes).map((theme) => (
              <option key={theme} value={theme}>
                {getThemeName(theme)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="theme-showcase__content">
        {/* Navigation Component */}
        <section className="theme-showcase__section">
          <h2 className="theme-showcase__section-title">Navigation</h2>
          <div className="theme-showcase__demo">
            <Navigation
              logo="C2PA Generator"
              tagline="Certification Assistant"
              items={navItems}
              actions={
                <>
                  <Button variant="ghost" size="small">
                    Login
                  </Button>
                  <Button variant="primary" size="small">
                    Sign Up
                  </Button>
                </>
              }
              onNavigate={(item) => console.log('Navigate to:', item)}
            />
          </div>
          <p className="theme-showcase__note">
            Try resizing the window to see mobile responsive behavior with hamburger menu.
          </p>
        </section>

        {/* Buttons */}
        <section className="theme-showcase__section">
          <h2 className="theme-showcase__section-title">Buttons</h2>

          <div className="theme-showcase__group">
            <h3 className="theme-showcase__group-title">Variants</h3>
            <div className="theme-showcase__demo theme-showcase__demo--inline">
              <Button variant="primary">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="ghost">Ghost Button</Button>
            </div>
          </div>

          <div className="theme-showcase__group">
            <h3 className="theme-showcase__group-title">Sizes</h3>
            <div className="theme-showcase__demo theme-showcase__demo--inline">
              <Button variant="primary" size="small">
                Small
              </Button>
              <Button variant="primary" size="medium">
                Medium
              </Button>
              <Button variant="primary" size="large">
                Large
              </Button>
            </div>
          </div>

          <div className="theme-showcase__group">
            <h3 className="theme-showcase__group-title">States</h3>
            <div className="theme-showcase__demo theme-showcase__demo--inline">
              <Button variant="primary" disabled>
                Disabled
              </Button>
              <Button variant="primary" loading>
                Loading
              </Button>
              <Button variant="primary" danger>
                Danger
              </Button>
            </div>
          </div>

          <div className="theme-showcase__group">
            <h3 className="theme-showcase__group-title">Full Width</h3>
            <div className="theme-showcase__demo">
              <Button variant="primary" fullWidth>
                Full Width Button
              </Button>
            </div>
          </div>
        </section>

        {/* Inputs */}
        <section className="theme-showcase__section">
          <h2 className="theme-showcase__section-title">Inputs</h2>

          <div className="theme-showcase__group">
            <h3 className="theme-showcase__group-title">Text Input</h3>
            <div className="theme-showcase__demo">
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                helperText="Please use your legal name"
              />
            </div>
          </div>

          <div className="theme-showcase__group">
            <h3 className="theme-showcase__group-title">Required Input</h3>
            <div className="theme-showcase__demo">
              <Input
                label="Email Address"
                type="email"
                placeholder="example@domain.com"
                required
              />
            </div>
          </div>

          <div className="theme-showcase__group">
            <h3 className="theme-showcase__group-title">Validation States</h3>
            <div className="theme-showcase__demo">
              <Input
                label="Username"
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleInputValidation}
                error={inputError}
                placeholder="Choose a username"
              />
            </div>
            <div className="theme-showcase__demo">
              <Input
                label="Password"
                type="password"
                success
                helperText="Password is strong"
                placeholder="Enter password"
              />
            </div>
          </div>

          <div className="theme-showcase__group">
            <h3 className="theme-showcase__group-title">Textarea</h3>
            <div className="theme-showcase__demo">
              <Input
                as="textarea"
                label="Description"
                placeholder="Enter a description..."
                rows={4}
                helperText="Maximum 500 characters"
              />
            </div>
          </div>

          <div className="theme-showcase__group">
            <h3 className="theme-showcase__group-title">Disabled Input</h3>
            <div className="theme-showcase__demo">
              <Input
                label="Disabled Field"
                value="This field is disabled"
                disabled
              />
            </div>
          </div>
        </section>

        {/* Cards */}
        <section className="theme-showcase__section">
          <h2 className="theme-showcase__section-title">Cards</h2>

          <div className="theme-showcase__group">
            <h3 className="theme-showcase__group-title">Basic Card</h3>
            <div className="theme-showcase__demo">
              <Card>
                <h3>Simple Card</h3>
                <p>This is a basic card with default padding.</p>
              </Card>
            </div>
          </div>

          <div className="theme-showcase__group">
            <h3 className="theme-showcase__group-title">Card with Header and Footer</h3>
            <div className="theme-showcase__demo">
              <Card padding="none">
                <CardHeader>
                  <h3 className="theme-showcase__card-title">Card Title</h3>
                </CardHeader>
                <CardBody>
                  <p>
                    This card has a header and footer section. It's useful for structured
                    content like forms or dialogs.
                  </p>
                </CardBody>
                <CardFooter>
                  <Button variant="secondary" size="small">
                    Cancel
                  </Button>
                  <Button variant="primary" size="small">
                    Save
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>

          <div className="theme-showcase__group">
            <h3 className="theme-showcase__group-title">Interactive Card</h3>
            <div className="theme-showcase__demo">
              <Card
                interactive
                hover
                onClick={() => alert('Card clicked!')}
              >
                <h3>Clickable Card</h3>
                <p>This card has hover effects and is clickable.</p>
              </Card>
            </div>
          </div>

          <div className="theme-showcase__group">
            <h3 className="theme-showcase__group-title">Card Grid</h3>
            <div className="theme-showcase__grid">
              <Card padding="medium">
                <h4>Card 1</h4>
                <p>Content for card 1</p>
              </Card>
              <Card padding="medium">
                <h4>Card 2</h4>
                <p>Content for card 2</p>
              </Card>
              <Card padding="medium">
                <h4>Card 3</h4>
                <p>Content for card 3</p>
              </Card>
            </div>
          </div>
        </section>

        {/* Chat Messages */}
        <section className="theme-showcase__section">
          <h2 className="theme-showcase__section-title">Chat Messages</h2>

          <div className="theme-showcase__group">
            <h3 className="theme-showcase__group-title">Conversation</h3>
            <div className="theme-showcase__demo theme-showcase__chat-container">
              {chatMessages.map((msg, index) => (
                <ChatMessage
                  key={index}
                  sender={msg.sender}
                  message={msg.message}
                  timestamp={msg.timestamp}
                  actions={msg.actions}
                />
              ))}
            </div>
          </div>

          <div className="theme-showcase__group">
            <h3 className="theme-showcase__group-title">Loading State</h3>
            <div className="theme-showcase__demo">
              <ChatMessage sender="assistant" isLoading />
            </div>
          </div>
        </section>

        {/* Modal */}
        <section className="theme-showcase__section">
          <h2 className="theme-showcase__section-title">Modal</h2>

          <div className="theme-showcase__group">
            <div className="theme-showcase__demo">
              <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                Open Modal
              </Button>
            </div>
          </div>

          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Confirm Action"
            footer={
              <>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  danger
                  onClick={() => {
                    alert('Action confirmed!');
                    setIsModalOpen(false);
                  }}
                >
                  Confirm
                </Button>
              </>
            }
          >
            <p>
              Are you sure you want to proceed with this action? This operation cannot be
              undone and may have permanent consequences.
            </p>
            <p>Please review your decision carefully before confirming.</p>
          </Modal>
        </section>

        {/* Typography */}
        <section className="theme-showcase__section">
          <h2 className="theme-showcase__section-title">Typography</h2>

          <div className="theme-showcase__group">
            <div className="theme-showcase__demo theme-showcase__typography">
              <h1>Heading 1 - Display Text</h1>
              <h2>Heading 2 - Page Title</h2>
              <h3>Heading 3 - Section Header</h3>
              <h4>Heading 4 - Subsection</h4>
              <h5>Heading 5 - Card Title</h5>
              <p>
                Body text - This is regular paragraph text with normal line height and
                spacing. It's optimized for readability and comfortable reading experience.
              </p>
              <p className="text-secondary">
                Secondary text - Used for less important information or supporting content.
              </p>
              <p className="text-tertiary">
                Tertiary text - Used for metadata, timestamps, or subtle hints.
              </p>
            </div>
          </div>
        </section>

        {/* Colors */}
        <section className="theme-showcase__section">
          <h2 className="theme-showcase__section-title">Colors</h2>

          <div className="theme-showcase__group">
            <h3 className="theme-showcase__group-title">Accent Colors</h3>
            <div className="theme-showcase__color-grid">
              <div className="theme-showcase__color-swatch">
                <div
                  className="theme-showcase__color-box"
                  style={{ background: 'var(--accent-blue)' }}
                />
                <span>Blue</span>
              </div>
              <div className="theme-showcase__color-swatch">
                <div
                  className="theme-showcase__color-box"
                  style={{ background: 'var(--accent-green)' }}
                />
                <span>Green</span>
              </div>
              <div className="theme-showcase__color-swatch">
                <div
                  className="theme-showcase__color-box"
                  style={{ background: 'var(--accent-yellow)' }}
                />
                <span>Yellow</span>
              </div>
              <div className="theme-showcase__color-swatch">
                <div
                  className="theme-showcase__color-box"
                  style={{ background: 'var(--accent-red)' }}
                />
                <span>Red</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ThemeShowcase;
