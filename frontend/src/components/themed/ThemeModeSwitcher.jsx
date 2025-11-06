/**
 * ThemeModeSwitcher Component
 *
 * Provides UI for switching between light/dark/system theme modes.
 * Compact toggle for quick appearance switching.
 */

import PropTypes from 'prop-types';
import { useTheme, THEME_MODES } from '../../contexts/ThemeContext';
import './ThemeModeSwitcher.css';

/**
 * Mode icons for visual identification
 */
const MODE_ICONS = {
  [THEME_MODES.LIGHT]: '☀️',
  [THEME_MODES.DARK]: '🌙',
  [THEME_MODES.SYSTEM]: '💻',
};

/**
 * ThemeModeSwitcher Component
 * @param {Object} props
 * @param {('compact'|'buttons'|'dropdown')} props.variant - Display variant
 * @param {boolean} props.showLabel - Show text label
 * @param {string} props.className - Additional CSS classes
 */
const ThemeModeSwitcher = ({
  variant = 'compact',
  showLabel = false,
  className = ''
}) => {
  const { themeMode, themeModes, changeThemeMode, getModeName, loading } = useTheme();

  /**
   * Handle mode selection
   */
  const handleModeChange = (modeKey) => {
    changeThemeMode(modeKey);
  };

  /**
   * Cycle to next mode (for compact variant)
   */
  const cycleMode = () => {
    const modes = Object.values(themeModes);
    const currentIndex = modes.indexOf(themeMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    handleModeChange(modes[nextIndex]);
  };

  /**
   * Render Compact Variant (single button that cycles)
   */
  if (variant === 'compact') {
    return (
      <div className={`theme-mode-switcher theme-mode-switcher-compact ${className}`}>
        <button
          className="theme-mode-button"
          onClick={cycleMode}
          disabled={loading}
          aria-label={`Current mode: ${getModeName(themeMode)}. Click to cycle through modes.`}
          title={`Appearance: ${getModeName(themeMode)}`}
        >
          <span className="theme-mode-icon">
            {MODE_ICONS[themeMode]}
          </span>
          {showLabel && (
            <span className="theme-mode-label">
              {getModeName(themeMode)}
            </span>
          )}
        </button>
      </div>
    );
  }

  /**
   * Render Button Group Variant
   */
  if (variant === 'buttons') {
    return (
      <div className={`theme-mode-switcher theme-mode-switcher-buttons ${className}`}>
        {showLabel && <div className="theme-mode-buttons-label">Appearance:</div>}
        <div className="theme-mode-buttons-group">
          {Object.values(themeModes).map((modeKey) => {
            const isActive = modeKey === themeMode;

            return (
              <button
                key={modeKey}
                className={`theme-mode-button-option ${isActive ? 'active' : ''}`}
                onClick={() => handleModeChange(modeKey)}
                disabled={loading}
                title={getModeName(modeKey)}
                aria-label={`Switch to ${getModeName(modeKey)} mode`}
                aria-pressed={isActive}
              >
                <span className="theme-mode-option-icon">{MODE_ICONS[modeKey]}</span>
                <span className="theme-mode-option-label">{getModeName(modeKey)}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  /**
   * Render Dropdown Variant
   */
  if (variant === 'dropdown') {
    return (
      <div className={`theme-mode-switcher theme-mode-switcher-dropdown ${className}`}>
        {showLabel && <label className="theme-mode-label" htmlFor="theme-mode-select">Appearance:</label>}
        <select
          id="theme-mode-select"
          className="theme-mode-select"
          value={themeMode}
          onChange={(e) => handleModeChange(e.target.value)}
          disabled={loading}
          aria-label="Select appearance mode"
        >
          {Object.values(themeModes).map((modeKey) => (
            <option key={modeKey} value={modeKey}>
              {MODE_ICONS[modeKey]} {getModeName(modeKey)}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return null;
};

ThemeModeSwitcher.propTypes = {
  variant: PropTypes.oneOf(['compact', 'buttons', 'dropdown']),
  showLabel: PropTypes.bool,
  className: PropTypes.string
};

export default ThemeModeSwitcher;
