import React from 'react';
import PropTypes from 'prop-types';
import '../styles/simple-progress-chart.css';

/**
 * SimpleProgressChart
 *
 * Displays C2PA certification progress as a simple 6-step vertical progress chart
 *
 * @param {Object} props
 * @param {string} props.currentPhase - Current phase ID (e.g., "phase-3")
 * @param {Array} props.phases - Array of phase objects with status
 * @param {Function} props.onPhaseClick - Callback when phase is clicked
 */
function SimpleProgressChart({ currentPhase = 'phase-1', phases = [], onPhaseClick }) {
  const defaultPhases = [
    { id: 'phase-1', number: 1, name: 'Preparation & Registration', status: 'pending' },
    { id: 'phase-2', number: 2, name: 'Technical Assessment', status: 'pending' },
    { id: 'phase-3', number: 3, name: 'Implementation', status: 'pending' },
    { id: 'phase-4', number: 4, name: 'Security Validation', status: 'pending' },
    { id: 'phase-5', number: 5, name: 'Testing & Validation', status: 'pending' },
    { id: 'phase-6', number: 6, name: 'Certification Submission', status: 'pending' }
  ];

  const displayPhases = phases.length > 0 ? phases : defaultPhases;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
      case 'go':
        return '✓';
      case 'in-progress':
        return '◐';
      default:
        return '○';
    }
  };

  const getStatusClass = (status) => {
    return status === 'go' ? 'completed' : status;
  };

  const handlePhaseClick = (phase) => {
    if (onPhaseClick) {
      onPhaseClick(phase);
    }
  };

  const handleKeyPress = (event, phase) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handlePhaseClick(phase);
    }
  };

  return (
    <div
      className="simple-progress-chart"
      role="progressbar"
      aria-valuemin="1"
      aria-valuemax="6"
      aria-valuenow={parseInt(currentPhase.split('-')[1]) || 1}
      aria-label={`Progress: Phase ${parseInt(currentPhase.split('-')[1]) || 1} of 6`}
    >
      <table className="progress-table">
        <tbody>
          <tr className="progress-row">
            {displayPhases.map((phase) => {
              const isActive = phase.id === currentPhase;
              const isCurrent = phase.status === 'in-progress';

              return (
                <td
                  key={phase.id}
                  className={`phase-cell phase-${phase.number} ${getStatusClass(phase.status)} ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}`}
                  onClick={() => handlePhaseClick(phase)}
                  onKeyPress={(e) => handleKeyPress(e, phase)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Phase ${phase.number}: ${phase.name} - Status: ${phase.status}`}
                >
                  {phase.name}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>

      <div className="progress-summary">
        <div className="summary-item">
          <span className="summary-label">Current Phase:</span>
          <span className="summary-value">{parseInt(currentPhase.split('-')[1]) || 1} of 6</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Completed:</span>
          <span className="summary-value">
            {displayPhases.filter(p => p.status === 'completed' || p.status === 'go').length} phases
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Progress:</span>
          <span className="summary-value">
            {Math.round((displayPhases.filter(p => p.status === 'completed' || p.status === 'go').length / 6) * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}

SimpleProgressChart.propTypes = {
  currentPhase: PropTypes.string,
  phases: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    number: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    status: PropTypes.oneOf(['pending', 'in-progress', 'completed', 'go']).isRequired,
    completedTasks: PropTypes.number,
    totalTasks: PropTypes.number
  })),
  onPhaseClick: PropTypes.func
};

export default SimpleProgressChart;
