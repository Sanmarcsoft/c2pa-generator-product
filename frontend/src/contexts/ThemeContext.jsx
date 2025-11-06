import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * ThemeContext - Manages theme state and persistence
 *
 * Provides theme selection, localStorage persistence, and API sync for logged-in users.
 * Supports three themes: modern-minimalist, friendly-approachable, tech-savvy
 *
 * @context ThemeContext
 */
const ThemeContext = createContext(null);

/**
 * Available theme identifiers
 * @constant
 */
export const THEMES = {
  ELEGANT: 'elegant',
  RETRO: 'retro',
  MODERN_MINIMALIST: 'modern-minimalist',
  FRIENDLY_APPROACHABLE: 'friendly-approachable',
  TECH_SAVVY: 'tech-savvy-trustworthy',
};

/**
 * Available theme modes (appearance)
 * @constant
 */
export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};

/**
 * Default theme - Tech-Savvy & Trustworthy theme
 * @constant
 */
const DEFAULT_THEME = THEMES.TECH_SAVVY;

/**
 * Default theme mode - Follow system preference
 * @constant
 */
const DEFAULT_THEME_MODE = THEME_MODES.SYSTEM;

/**
 * Custom hook to access theme context
 * @throws {Error} If used outside of ThemeProvider
 * @returns {Object} Theme context value
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

/**
 * ThemeProvider Component
 *
 * Wraps the application to provide theme context to all children.
 * Handles theme persistence to localStorage and sync with backend API.
 *
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @param {Object} [props.user] - Authenticated user object (for API sync)
 * @param {string} [props.token] - Auth token (for API sync)
 */
export const ThemeProvider = ({ children, user = null, token = null }) => {
  const [currentTheme, setCurrentTheme] = useState(DEFAULT_THEME);
  const [themeMode, setThemeMode] = useState(DEFAULT_THEME_MODE);
  const [systemPreference, setSystemPreference] = useState('light');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Detect system color scheme preference
   */
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateSystemPreference = (e) => {
      setSystemPreference(e.matches ? 'dark' : 'light');
    };

    // Set initial preference
    setSystemPreference(mediaQuery.matches ? 'dark' : 'light');

    // Listen for changes
    mediaQuery.addEventListener('change', updateSystemPreference);

    return () => {
      mediaQuery.removeEventListener('change', updateSystemPreference);
    };
  }, []);

  /**
   * Initialize theme from localStorage or user preferences
   */
  useEffect(() => {
    const initTheme = async () => {
      try {
        // First, try to get theme from localStorage
        const storedTheme = localStorage.getItem('app_theme');
        const storedMode = localStorage.getItem('app_theme_mode');

        if (storedTheme && Object.values(THEMES).includes(storedTheme)) {
          setCurrentTheme(storedTheme);
        }

        if (storedMode && Object.values(THEME_MODES).includes(storedMode)) {
          setThemeMode(storedMode);
        }

        // If user is authenticated, fetch their theme preference from API
        if (user && token) {
          await syncThemeFromAPI(token);
        }
      } catch (err) {
        console.error('Error initializing theme:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initTheme();
  }, [user, token]);

  /**
   * Get the effective theme mode (resolve 'system' to actual preference)
   */
  const getEffectiveMode = () => {
    if (themeMode === THEME_MODES.SYSTEM) {
      return systemPreference;
    }
    return themeMode;
  };

  /**
   * Apply theme and mode to document when they change
   */
  useEffect(() => {
    const effectiveMode = getEffectiveMode();

    // Set data-theme attribute for theme variant
    document.documentElement.setAttribute('data-theme', currentTheme);

    // Set data-mode attribute for appearance (light/dark)
    document.documentElement.setAttribute('data-mode', effectiveMode);

    // Emit custom event for other components that need to know about theme changes
    window.dispatchEvent(new CustomEvent('themechange', {
      detail: {
        theme: currentTheme,
        mode: themeMode,
        effectiveMode
      }
    }));

    // Add theme and mode classes to body for additional styling hooks
    document.body.className = `theme-${currentTheme} mode-${effectiveMode}`;
  }, [currentTheme, themeMode, systemPreference]);

  /**
   * Fetch user's theme preference from backend
   * @param {string} authToken - Authentication token
   */
  const syncThemeFromAPI = async (authToken) => {
    try {
      const response = await fetch('/api/user/theme', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.theme && Object.values(THEMES).includes(data.theme)) {
          setCurrentTheme(data.theme);
          localStorage.setItem('app_theme', data.theme);
        }
        if (data.themeMode && Object.values(THEME_MODES).includes(data.themeMode)) {
          setThemeMode(data.themeMode);
          localStorage.setItem('app_theme_mode', data.themeMode);
        }
      }
    } catch (err) {
      console.error('Error fetching theme from API:', err);
      // Continue with localStorage theme, don't throw error
    }
  };

  /**
   * Save user's theme preference to backend
   * @param {Object} preferences - Theme preferences
   * @param {string} [preferences.theme] - Theme identifier
   * @param {string} [preferences.themeMode] - Theme mode
   * @param {string} authToken - Authentication token
   */
  const saveThemeToAPI = async (preferences, authToken) => {
    try {
      const response = await fetch('/api/user/theme', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        throw new Error('Failed to save theme preference');
      }
    } catch (err) {
      console.error('Error saving theme to API:', err);
      // Don't throw - localStorage already updated
    }
  };

  /**
   * Change the current theme
   * @param {string} newTheme - Theme identifier from THEMES constant
   */
  const changeTheme = async (newTheme) => {
    if (!Object.values(THEMES).includes(newTheme)) {
      console.error(`Invalid theme: ${newTheme}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Update state
      setCurrentTheme(newTheme);

      // Save to localStorage
      localStorage.setItem('app_theme', newTheme);

      // If user is authenticated, save to backend
      if (user && token) {
        await saveThemeToAPI({ theme: newTheme }, token);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error changing theme:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Change the theme mode (light/dark/system)
   * @param {string} newMode - Mode identifier from THEME_MODES constant
   */
  const changeThemeMode = async (newMode) => {
    if (!Object.values(THEME_MODES).includes(newMode)) {
      console.error(`Invalid theme mode: ${newMode}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Update state
      setThemeMode(newMode);

      // Save to localStorage
      localStorage.setItem('app_theme_mode', newMode);

      // If user is authenticated, save to backend
      if (user && token) {
        await saveThemeToAPI({ themeMode: newMode }, token);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error changing theme mode:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reset theme to default
   */
  const resetTheme = () => {
    changeTheme(DEFAULT_THEME);
  };

  /**
   * Reset theme mode to default
   */
  const resetThemeMode = () => {
    changeThemeMode(DEFAULT_THEME_MODE);
  };

  /**
   * Get theme display name
   * @param {string} themeId - Theme identifier
   * @returns {string} Human-readable theme name
   */
  const getThemeName = (themeId) => {
    const names = {
      [THEMES.ELEGANT]: 'Elegant',
      [THEMES.RETRO]: '8-Bit Retro',
      [THEMES.MODERN_MINIMALIST]: 'Modern Minimalist',
      [THEMES.FRIENDLY_APPROACHABLE]: 'Friendly & Approachable',
      [THEMES.TECH_SAVVY]: 'Tech-Savvy & Trustworthy',
    };
    return names[themeId] || themeId;
  };

  /**
   * Get theme mode display name
   * @param {string} modeId - Mode identifier
   * @returns {string} Human-readable mode name
   */
  const getModeName = (modeId) => {
    const names = {
      [THEME_MODES.LIGHT]: 'Light',
      [THEME_MODES.DARK]: 'Dark',
      [THEME_MODES.SYSTEM]: 'System',
    };
    return names[modeId] || modeId;
  };

  const value = {
    // Theme
    currentTheme,
    themes: THEMES,
    changeTheme,
    resetTheme,
    getThemeName,
    isTheme: (themeId) => currentTheme === themeId,

    // Theme Mode
    themeMode,
    themeModes: THEME_MODES,
    changeThemeMode,
    resetThemeMode,
    getModeName,
    effectiveMode: getEffectiveMode(),
    isMode: (modeId) => themeMode === modeId,

    // State
    loading,
    error,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
  user: PropTypes.object,
  token: PropTypes.string,
};

export default ThemeContext;
