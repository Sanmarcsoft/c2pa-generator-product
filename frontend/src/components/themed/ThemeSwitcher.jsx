/**
 * ThemeSwitcher Component
 *
 * Provides UI for switching between available themes.
 * Shows current theme and allows selection from dropdown.
 * Includes visual preview icons for each theme.
 */

import { useState } from 'react';
import PropTypes from 'prop-types';
import { useTheme, THEMES } from '../../contexts/ThemeContext';
import './ThemeSwitcher.css';

/**
 * Theme preview icons/colors for visual identification
 */
const THEME_PREVIEWS = {
  [THEMES.RETRO]: {
    icon: '🕹️',
    colors: ['#00FF00', '#00FFFF', '#FF00FF'],
    description: 'Classic 8-bit Atari style with neon colors'
  },
  [THEMES.MODERN_MINIMALIST]: {
    icon: '✨',
    colors: ['#3B82F6', '#64748B', '#FFFFFF'],
    description: 'Clean and sophisticated with generous whitespace'
  },
  [THEMES.FRIENDLY_APPROACHABLE]: {
    icon: '😊',
    colors: ['#FB923C', '#60A5FA', '#FFFBF5'],
    description: 'Warm and inviting with soft colors'
  },
  [THEMES.TECH_SAVVY]: {
    icon: '⚡',
    colors: ['#00E5FF', '#0F1628', '#00FFA3'],
    description: 'Dark professional with electric accents'
  }
};

/**
 * ThemeSwitcher Component
 * @param {Object} props
 * @param {('dropdown'|'buttons'|'compact')} props.variant - Display variant
 * @param {boolean} props.showPreview - Show color preview
 * @param {string} props.className - Additional CSS classes
 */
const ThemeSwitcher = ({
  variant = 'dropdown',
  showPreview = true,
  className = ''
}) => {
  const { currentTheme, changeTheme, getThemeName, loading, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  /**
   * Handle theme selection
   */
  const handleThemeChange = (themeKey) => {
    changeTheme(themeKey);
    setIsOpen(false);
  };

  /**
   * Toggle dropdown
   */
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  /**
   * Render theme preview (color swatches)
   */
  const renderPreview = (themeKey) => {
    const preview = THEME_PREVIEWS[themeKey];
    if (!preview || !showPreview) return null;

    return (
      <div className="theme-preview">
        {preview.colors.map((color, index) => (
          <span
            key={index}
            className="theme-preview-color"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    );
  };

  /**
   * Render Dropdown Variant
   */
  if (variant === 'dropdown') {
    return (
      <div className={`theme-switcher theme-switcher-dropdown ${className}`}>
        <button
          className="theme-switcher-button"
          onClick={toggleDropdown}
          disabled={loading}
          aria-label="Select theme"
          aria-expanded={isOpen}
        >
          <span className="theme-icon">
            {THEME_PREVIEWS[currentTheme]?.icon || '🎨'}
          </span>
          <span className="theme-label">{getThemeName(currentTheme)}</span>
          <span className={`theme-chevron ${isOpen ? 'open' : ''}`}>▼</span>
        </button>

        {isOpen && (
          <div className="theme-dropdown">
            {Object.values(themes).map((themeKey) => {
              const preview = THEME_PREVIEWS[themeKey];
              const isActive = themeKey === currentTheme;

              return (
                <button
                  key={themeKey}
                  className={`theme-option ${isActive ? 'active' : ''}`}
                  onClick={() => handleThemeChange(themeKey)}
                  disabled={loading}
                >
                  <span className="theme-option-icon">{preview?.icon || '🎨'}</span>
                  <div className="theme-option-content">
                    <div className="theme-option-name">{getThemeName(themeKey)}</div>
                    {preview?.description && (
                      <div className="theme-option-description">
                        {preview.description}
                      </div>
                    )}
                  </div>
                  {renderPreview(themeKey)}
                  {isActive && <span className="theme-active-indicator">✓</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  /**
   * Render Button Group Variant
   */
  if (variant === 'buttons') {
    return (
      <div className={`theme-switcher theme-switcher-buttons ${className}`}>
        <div className="theme-buttons-label">Theme:</div>
        <div className="theme-buttons-group">
          {Object.values(themes).map((themeKey) => {
            const preview = THEME_PREVIEWS[themeKey];
            const isActive = themeKey === currentTheme;

            return (
              <button
                key={themeKey}
                className={`theme-button ${isActive ? 'active' : ''}`}
                onClick={() => handleThemeChange(themeKey)}
                disabled={loading}
                title={preview?.description}
                aria-label={`Switch to ${getThemeName(themeKey)} theme`}
              >
                <span className="theme-button-icon">{preview?.icon || '🎨'}</span>
                <span className="theme-button-label">{getThemeName(themeKey)}</span>
                {showPreview && renderPreview(themeKey)}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  /**
   * Render Compact Variant (icon only with tooltip)
   */
  if (variant === 'compact') {
    return (
      <div className={`theme-switcher theme-switcher-compact ${className}`}>
        <button
          className="theme-switcher-compact-button"
          onClick={toggleDropdown}
          disabled={loading}
          aria-label={`Current theme: ${getThemeName(currentTheme)}`}
          title={`Theme: ${getThemeName(currentTheme)}`}
        >
          {THEME_PREVIEWS[currentTheme]?.icon || '🎨'}
        </button>

        {isOpen && (
          <div className="theme-dropdown-compact">
            {Object.values(themes).map((themeKey) => {
              const preview = THEME_PREVIEWS[themeKey];
              const isActive = themeKey === currentTheme;

              return (
                <button
                  key={themeKey}
                  className={`theme-option-compact ${isActive ? 'active' : ''}`}
                  onClick={() => handleThemeChange(themeKey)}
                  disabled={loading}
                  title={getThemeName(themeKey)}
                  aria-label={`Switch to ${getThemeName(themeKey)} theme`}
                >
                  {preview?.icon || '🎨'}
                  {isActive && <span className="theme-active-badge">✓</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return null;
};

ThemeSwitcher.propTypes = {
  variant: PropTypes.oneOf(['dropdown', 'buttons', 'compact']),
  showPreview: PropTypes.bool,
  className: PropTypes.string
};

export default ThemeSwitcher;
