/**
 * Theme Registry
 *
 * Central registry for all application themes.
 * Exports theme configurations and utilities for theme management.
 *
 * @module themes
 */

import modernMinimalist from './modernMinimalist';
import friendlyApproachable from './friendlyApproachable';
import techSavvy from './techSavvy';

/**
 * Theme registry object
 * Maps theme identifiers to their configurations
 */
export const themeRegistry = {
  'modern-minimalist': modernMinimalist,
  'friendly-approachable': friendlyApproachable,
  'tech-savvy': techSavvy,
};

/**
 * Get theme configuration by ID
 * @param {string} themeId - Theme identifier
 * @returns {Object} Theme configuration object
 */
export const getThemeConfig = (themeId) => {
  return themeRegistry[themeId] || themeRegistry['modern-minimalist'];
};

/**
 * Get all available themes
 * @returns {Array<Object>} Array of theme metadata
 */
export const getAllThemes = () => {
  return Object.entries(themeRegistry).map(([id, config]) => ({
    id,
    name: config.name,
    description: config.description,
    preview: config.preview,
  }));
};

/**
 * Get CSS class name for theme
 * @param {string} themeId - Theme identifier
 * @returns {string} CSS class name
 */
export const getThemeClassName = (themeId) => {
  return `theme-${themeId}`;
};

export { modernMinimalist, friendlyApproachable, techSavvy };
export default themeRegistry;
