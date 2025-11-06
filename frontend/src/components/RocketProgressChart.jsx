import React, { useState, useEffect, useRef } from 'react';
import VectorRocket from './VectorRocket';
import '../styles/rocket-chart.css';

/**
 * RocketProgressChart
 *
 * Displays C2PA certification progress as an Atari-style vector rocket
 * moving through 6 phase milestones with CRT screen effects.
 *
 * Features:
 * - CRT aesthetic with scanlines, phosphor glow, and vignette
 * - Vector-style rocket that animates vertically through phases
 * - 6 milestone markers with 4 states (pending, in-progress, completed, go)
 * - Hover tooltips showing phase details
 * - Click handlers for phase interaction
 * - Fully accessible with ARIA labels and keyboard navigation
 *
 * @param {Object} props
 * @param {string} props.currentPhase - Current phase ID (e.g., "phase-3")
 * @param {Array} props.phases - Array of phase objects with status
 * @param {Function} props.onPhaseClick - Callback when phase milestone clicked
 */
const RocketProgressChart = ({
  currentPhase = 'phase-1',
  phases = [],
  onPhaseClick = null
}) => {
  const [isRocketMoving, setIsRocketMoving] = useState(false);
  const [rocketPosition, setRocketPosition] = useState(0);
  const prevPhaseRef = useRef(currentPhase);

  // Extract phase number from ID (e.g., "phase-3" -> 3)
  const getCurrentPhaseNumber = (phaseId) => {
    const match = phaseId?.match(/phase-(\d+)/);
    return match ? parseInt(match[1], 10) : 1;
  };

  const currentPhaseNumber = getCurrentPhaseNumber(currentPhase);

  // Calculate rocket Y position based on current phase
  // Phase 1 at top (4rem), Phase 6 at bottom
  useEffect(() => {
    const calculatePosition = () => {
      const containerHeight = 600; // Default height
      const topPadding = 64; // 4rem
      const bottomPadding = 64; // 4rem
      const availableHeight = containerHeight - topPadding - bottomPadding;

      // Position rocket at the current phase milestone
      const phaseIndex = currentPhaseNumber - 1;
      const position = topPadding + (availableHeight / 5) * phaseIndex;

      return position;
    };

    const newPosition = calculatePosition();

    // Detect if phase changed to trigger animation
    if (prevPhaseRef.current !== currentPhase) {
      setIsRocketMoving(true);
      setTimeout(() => setIsRocketMoving(false), 800);
      prevPhaseRef.current = currentPhase;
    }

    setRocketPosition(newPosition);
  }, [currentPhase, currentPhaseNumber]);

  // Calculate milestone positions (6 evenly spaced)
  const getMilestonePositions = () => {
    const containerHeight = 600;
    const topPadding = 64;
    const bottomPadding = 64;
    const availableHeight = containerHeight - topPadding - bottomPadding;
    const spacing = availableHeight / 5;

    return phases.map((_, index) => topPadding + spacing * index);
  };

  const milestonePositions = getMilestonePositions();

  // Handle phase milestone click
  const handlePhaseClick = (phase) => {
    if (onPhaseClick) {
      onPhaseClick(phase);
    }
  };

  // Handle keyboard navigation
  const handlePhaseKeyDown = (event, phase) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handlePhaseClick(phase);
    }
  };

  // Get status badge text
  const getStatusText = (status) => {
    const statusMap = {
      'pending': 'Pending',
      'in-progress': 'In Progress',
      'completed': 'Completed',
      'go': 'Ready'
    };
    return statusMap[status] || status;
  };

  return (
    <div
      className="rocket-chart-container crt-effect"
      role="progressbar"
      aria-valuemin="1"
      aria-valuemax="6"
      aria-valuenow={currentPhaseNumber}
      aria-label={`C2PA Certification Progress: Phase ${currentPhaseNumber} of 6`}
    >
      {/* CRT Visual Effects */}
      <div className="crt-scanlines" aria-hidden="true" />
      <div className="crt-vignette" aria-hidden="true" />

      {/* Chart Content */}
      <div className="rocket-chart-content">
        {/* Milestone Track with Connecting Line */}
        <div className="milestone-track">
          <div className="milestone-connecting-line" aria-hidden="true" />

          {/* Phase Milestone Markers */}
          {phases.map((phase, index) => (
            <div
              key={phase.id}
              className={`milestone-marker ${phase.status}`}
              style={{ top: `${milestonePositions[index]}px` }}
              onClick={() => handlePhaseClick(phase)}
              onKeyDown={(e) => handlePhaseKeyDown(e, phase)}
              tabIndex={0}
              role="button"
              aria-label={`Phase ${phase.number}: ${phase.name} - ${getStatusText(phase.status)}`}
            >
              {/* Phase Number */}
              <span className="milestone-number" aria-hidden="true">
                P{phase.number}
              </span>

              {/* Milestone Circle */}
              <svg className="milestone-circle" viewBox="0 0 32 32">
                <circle
                  cx="16"
                  cy="16"
                  r="14"
                />
                {/* Checkmark for completed phases */}
                {(phase.status === 'completed' || phase.status === 'go') && (
                  <path
                    d="M 10 16 L 14 20 L 22 12"
                    stroke="#0a0a0a"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
              </svg>

              {/* Phase Name */}
              <span className="milestone-name" aria-hidden="true">
                {phase.name}
              </span>

              {/* Tooltip */}
              <div className="milestone-tooltip" role="tooltip">
                <div className="tooltip-title">{phase.name}</div>
                <div className="tooltip-status">
                  Status: {getStatusText(phase.status)}
                </div>
                {phase.totalTasks && (
                  <div className="tooltip-tasks">
                    Tasks: {phase.completedTasks || 0} / {phase.totalTasks}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Rocket Icon */}
        <div
          className="rocket-icon"
          style={{ top: `${rocketPosition}px` }}
          role="img"
          aria-label={`Progress rocket at Phase ${currentPhaseNumber} of 6`}
        >
          <VectorRocket
            color="#00FF00"
            isMoving={isRocketMoving}
            ariaLabel={`Rocket indicator showing current progress at phase ${currentPhaseNumber}`}
          />
        </div>
      </div>

      {/* Screen reader announcement for phase changes */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {currentPhase && `Currently on Phase ${currentPhaseNumber} of 6`}
      </div>
    </div>
  );
};

export default RocketProgressChart;
