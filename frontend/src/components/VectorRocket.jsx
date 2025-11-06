import React from 'react';

/**
 * VectorRocket
 *
 * Atari-style vector graphics rocket icon with animated exhaust
 * Used as progress indicator in RocketProgressChart
 *
 * @param {Object} props
 * @param {string} props.color - Rocket vector color (default: #00FF00)
 * @param {boolean} props.isMoving - Whether rocket is currently animating (intensifies exhaust)
 * @param {string} props.ariaLabel - Accessibility label
 */
const VectorRocket = ({
  color = '#00FF00',
  isMoving = false,
  ariaLabel = 'Progress Rocket'
}) => {
  return (
    <svg
      width="48"
      height="60"
      viewBox="0 0 48 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={ariaLabel}
    >
      {/* Nose Cone (Pointed Triangle) */}
      <path
        d="M 24 2 L 18 12 L 30 12 Z"
        stroke={color}
        strokeWidth="2"
        fill="none"
        strokeLinejoin="miter"
      />

      {/* Upper Body Section */}
      <path
        d="M 18 12 L 16 18 L 32 18 L 30 12 Z"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />

      {/* Main Body (Rounded Rectangle) */}
      <rect
        x="16"
        y="18"
        width="16"
        height="20"
        rx="2"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />

      {/* Window/Cockpit (Small Circle) */}
      <circle
        cx="24"
        cy="24"
        r="3"
        stroke={color}
        strokeWidth="1.5"
        fill={color}
        fillOpacity="0.3"
      />

      {/* Body Detail Lines */}
      <line
        x1="20"
        y1="30"
        x2="28"
        y2="30"
        stroke={color}
        strokeWidth="1"
        opacity="0.6"
      />
      <line
        x1="20"
        y1="34"
        x2="28"
        y2="34"
        stroke={color}
        strokeWidth="1"
        opacity="0.6"
      />

      {/* Left Fin (Trapezoid) */}
      <path
        d="M 16 28 L 8 38 L 10 38 L 16 38 Z"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />

      {/* Right Fin (Trapezoid) */}
      <path
        d="M 32 28 L 40 38 L 38 38 L 32 38 Z"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />

      {/* Engine Nozzle */}
      <rect
        x="18"
        y="38"
        width="12"
        height="4"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />

      {/* Exhaust Flame - Center */}
      <path
        d="M 24 42 L 22 50 L 24 48 L 26 50 Z"
        stroke="#FFB000"
        strokeWidth="2"
        fill="#FFB000"
        fillOpacity="0.5"
      >
        <animate
          attributeName="opacity"
          values={isMoving ? "0.5;1;0.5" : "0.3;0.6;0.3"}
          dur={isMoving ? "0.3s" : "0.8s"}
          repeatCount="indefinite"
        />
        <animate
          attributeName="d"
          values="M 24 42 L 22 50 L 24 48 L 26 50 Z; M 24 42 L 22 52 L 24 49 L 26 52 Z; M 24 42 L 22 50 L 24 48 L 26 50 Z"
          dur={isMoving ? "0.3s" : "0.8s"}
          repeatCount="indefinite"
        />
      </path>

      {/* Exhaust Flame - Left */}
      <path
        d="M 20 42 L 18 48 L 19 46 L 20 48 Z"
        stroke="#FF9900"
        strokeWidth="1.5"
        fill="#FF9900"
        fillOpacity="0.4"
      >
        <animate
          attributeName="opacity"
          values={isMoving ? "0.4;0.8;0.4" : "0.2;0.5;0.2"}
          dur={isMoving ? "0.4s" : "1s"}
          repeatCount="indefinite"
          begin="0.1s"
        />
      </path>

      {/* Exhaust Flame - Right */}
      <path
        d="M 28 42 L 30 48 L 29 46 L 28 48 Z"
        stroke="#FF9900"
        strokeWidth="1.5"
        fill="#FF9900"
        fillOpacity="0.4"
      >
        <animate
          attributeName="opacity"
          values={isMoving ? "0.4;0.8;0.4" : "0.2;0.5;0.2"}
          dur={isMoving ? "0.4s" : "1s"}
          repeatCount="indefinite"
          begin="0.2s"
        />
      </path>

      {/* Exhaust Particles - Small dots for extra effect */}
      <circle cx="22" cy="54" r="1" fill="#FFCC00" opacity="0.6">
        <animate
          attributeName="cy"
          values="54;58;54"
          dur={isMoving ? "0.5s" : "1.2s"}
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.6;0;0.6"
          dur={isMoving ? "0.5s" : "1.2s"}
          repeatCount="indefinite"
        />
      </circle>

      <circle cx="26" cy="56" r="1" fill="#FFCC00" opacity="0.6">
        <animate
          attributeName="cy"
          values="56;60;56"
          dur={isMoving ? "0.5s" : "1.2s"}
          repeatCount="indefinite"
          begin="0.3s"
        />
        <animate
          attributeName="opacity"
          values="0.6;0;0.6"
          dur={isMoving ? "0.5s" : "1.2s"}
          repeatCount="indefinite"
          begin="0.3s"
        />
      </circle>
    </svg>
  );
};

export default VectorRocket;
