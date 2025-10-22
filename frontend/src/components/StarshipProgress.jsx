import React, { useState, useEffect } from 'react';
import './StarshipProgress.css';

/**
 * Starship Progress Visualization
 * Each phase completion adds a component to the ship
 *
 * Ship Components:
 * Phase 1 - Hull (Foundation)
 * Phase 2 - Engine Core (Knowledge/Understanding)
 * Phase 3 - Shield Generator (Document Review/Protection)
 * Phase 4 - Navigation System (Application/Planning)
 * Phase 5 - Communication Array (Submission/Interaction)
 * Phase 6 - Command Bridge (Maintenance/Control)
 */

const StarshipProgress = ({ completedPhases = [], currentPhase = 1 }) => {
  const [hoveredComponent, setHoveredComponent] = useState(null);
  const [showAnimation, setShowAnimation] = useState(false);

  const shipComponents = [
    {
      id: 'hull',
      phase: 1,
      name: 'Hull Foundation',
      description: 'The core structure proving your eligibility',
      position: { x: 200, y: 250 },
      color: '#00ff41',
      completed: completedPhases.includes(1)
    },
    {
      id: 'engine',
      phase: 2,
      name: 'Knowledge Engine',
      description: 'Powered by understanding of C2PA specs',
      position: { x: 200, y: 320 },
      color: '#00ccff',
      completed: completedPhases.includes(2)
    },
    {
      id: 'shield',
      phase: 3,
      name: 'Document Shield',
      description: 'Protected by reviewed agreements',
      position: { x: 150, y: 200 },
      color: '#ff6b00',
      completed: completedPhases.includes(3)
    },
    {
      id: 'navigation',
      phase: 4,
      name: 'Navigation System',
      description: 'Guided by your application plan',
      position: { x: 200, y: 180 },
      color: '#ffcc00',
      completed: completedPhases.includes(4)
    },
    {
      id: 'comms',
      phase: 5,
      name: 'Communication Array',
      description: 'Connected through submission',
      position: { x: 250, y: 200 },
      color: '#ff00ff',
      completed: completedPhases.includes(5)
    },
    {
      id: 'bridge',
      phase: 6,
      name: 'Command Bridge',
      description: 'Controlled through maintenance',
      position: { x: 200, y: 150 },
      color: '#00ff41',
      completed: completedPhases.includes(6)
    }
  ];

  const completionPercentage = (completedPhases.length / 6) * 100;
  const isComplete = completedPhases.length === 6;

  useEffect(() => {
    if (completedPhases.length > 0) {
      setShowAnimation(true);
      const timer = setTimeout(() => setShowAnimation(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [completedPhases.length]);

  return (
    <div className="starship-progress-container">
      <div className="progress-header">
        <h2>🚀 Your C2PA Starship</h2>
        <div className="completion-badge">
          <span className="completion-text">{completionPercentage.toFixed(0)}% Complete</span>
          <span className="phase-counter">{completedPhases.length} / 6 Components</span>
        </div>
      </div>

      <div className="starship-viewport">
        <svg
          viewBox="0 0 400 450"
          className={`starship-svg ${isComplete ? 'complete' : ''} ${showAnimation ? 'pulse' : ''}`}
        >
          {/* Background stars */}
          <defs>
            <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="100%" stopColor="#00ff41" stopOpacity="0" />
            </radialGradient>

            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Starfield background */}
          <rect width="400" height="450" fill="#0a0a1a" />
          {[...Array(30)].map((_, i) => (
            <circle
              key={i}
              cx={Math.random() * 400}
              cy={Math.random() * 450}
              r={Math.random() * 1.5}
              fill="#ffffff"
              opacity={Math.random() * 0.8 + 0.2}
              className="star"
            />
          ))}

          {/* Grid lines for tech feel */}
          <line x1="0" y1="150" x2="400" y2="150" stroke="#00ff41" strokeWidth="0.5" opacity="0.2" />
          <line x1="0" y1="250" x2="400" y2="250" stroke="#00ff41" strokeWidth="0.5" opacity="0.2" />
          <line x1="0" y1="350" x2="400" y2="350" stroke="#00ff41" strokeWidth="0.5" opacity="0.2" />
          <line x1="100" y1="0" x2="100" y2="450" stroke="#00ff41" strokeWidth="0.5" opacity="0.2" />
          <line x1="200" y1="0" x2="200" y2="450" stroke="#00ff41" strokeWidth="0.5" opacity="0.2" />
          <line x1="300" y1="0" x2="300" y2="450" stroke="#00ff41" strokeWidth="0.5" opacity="0.2" />

          {/* Component 1: Hull (Phase 1 - Foundation) */}
          <g
            className={`ship-component ${shipComponents[0].completed ? 'completed' : 'incomplete'}`}
            onMouseEnter={() => setHoveredComponent(shipComponents[0])}
            onMouseLeave={() => setHoveredComponent(null)}
          >
            {shipComponents[0].completed && (
              <>
                {/* Main hull body */}
                <path
                  d="M 180 280 L 160 260 L 160 240 L 180 220 L 220 220 L 240 240 L 240 260 L 220 280 Z"
                  fill={shipComponents[0].color}
                  fillOpacity="0.3"
                  stroke={shipComponents[0].color}
                  strokeWidth="2"
                  filter="url(#glow)"
                />
                {/* Hull details */}
                <rect x="190" y="235" width="20" height="30" fill={shipComponents[0].color} opacity="0.5" />
                <circle cx="200" cy="250" r="5" fill={shipComponents[0].color} />
              </>
            )}
            {!shipComponents[0].completed && (
              <>
                <path
                  d="M 180 280 L 160 260 L 160 240 L 180 220 L 220 220 L 240 240 L 240 260 L 220 280 Z"
                  fill="none"
                  stroke="#333"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
                <text x="200" y="255" textAnchor="middle" fill="#666" fontSize="24">?</text>
              </>
            )}
          </g>

          {/* Component 2: Engine (Phase 2 - Knowledge) */}
          <g
            className={`ship-component ${shipComponents[1].completed ? 'completed' : 'incomplete'}`}
            onMouseEnter={() => setHoveredComponent(shipComponents[1])}
            onMouseLeave={() => setHoveredComponent(null)}
          >
            {shipComponents[1].completed && (
              <>
                {/* Engine core */}
                <ellipse cx="200" cy="320" rx="25" ry="15" fill={shipComponents[1].color} fillOpacity="0.4" filter="url(#glow)" />
                {/* Engine exhaust */}
                <path
                  d="M 185 330 L 180 345 L 190 340 L 185 355 L 195 345 Z"
                  fill={shipComponents[1].color}
                  opacity="0.6"
                >
                  <animate attributeName="opacity" values="0.3;0.8;0.3" dur="1s" repeatCount="indefinite" />
                </path>
                <path
                  d="M 215 330 L 220 345 L 210 340 L 215 355 L 205 345 Z"
                  fill={shipComponents[1].color}
                  opacity="0.6"
                >
                  <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1s" repeatCount="indefinite" />
                </path>
                {/* Engine glow */}
                <circle cx="200" cy="320" r="8" fill={shipComponents[1].color}>
                  <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite" />
                </circle>
              </>
            )}
            {!shipComponents[1].completed && (
              <>
                <ellipse cx="200" cy="320" rx="25" ry="15" fill="none" stroke="#333" strokeWidth="2" strokeDasharray="5,5" />
                <text x="200" y="325" textAnchor="middle" fill="#666" fontSize="20">?</text>
              </>
            )}
          </g>

          {/* Component 3: Shield (Phase 3 - Documents) */}
          <g
            className={`ship-component ${shipComponents[2].completed ? 'completed' : 'incomplete'}`}
            onMouseEnter={() => setHoveredComponent(shipComponents[2])}
            onMouseLeave={() => setHoveredComponent(null)}
          >
            {shipComponents[2].completed && (
              <>
                {/* Shield bubble */}
                <ellipse
                  cx="200"
                  cy="250"
                  rx="60"
                  ry="70"
                  fill="none"
                  stroke={shipComponents[2].color}
                  strokeWidth="2"
                  opacity="0.5"
                  filter="url(#glow)"
                >
                  <animate attributeName="opacity" values="0.3;0.6;0.3" dur="3s" repeatCount="indefinite" />
                </ellipse>
                {/* Shield hexagons */}
                <path d="M 150 250 L 155 240 L 165 240 L 170 250 L 165 260 L 155 260 Z" fill={shipComponents[2].color} opacity="0.3" />
                <path d="M 230 250 L 235 240 L 245 240 L 250 250 L 245 260 L 235 260 Z" fill={shipComponents[2].color} opacity="0.3" />
              </>
            )}
            {!shipComponents[2].completed && (
              <ellipse cx="200" cy="250" rx="60" ry="70" fill="none" stroke="#333" strokeWidth="1" strokeDasharray="10,5" opacity="0.3" />
            )}
          </g>

          {/* Component 4: Navigation (Phase 4 - Application) */}
          <g
            className={`ship-component ${shipComponents[3].completed ? 'completed' : 'incomplete'}`}
            onMouseEnter={() => setHoveredComponent(shipComponents[3])}
            onMouseLeave={() => setHoveredComponent(null)}
          >
            {shipComponents[3].completed && (
              <>
                {/* Nav dish */}
                <ellipse cx="200" cy="210" rx="20" ry="8" fill={shipComponents[3].color} fillOpacity="0.4" />
                <line x1="200" y1="210" x2="200" y2="225" stroke={shipComponents[3].color} strokeWidth="2" />
                {/* Nav beam */}
                <line x1="200" y1="210" x2="200" y2="150" stroke={shipComponents[3].color} strokeWidth="1" opacity="0.4">
                  <animate attributeName="opacity" values="0.2;0.6;0.2" dur="2s" repeatCount="indefinite" />
                </line>
                {/* Nav pulse */}
                <circle cx="200" cy="210" r="3" fill={shipComponents[3].color}>
                  <animate attributeName="r" values="3;12;3" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="1;0;1" dur="2s" repeatCount="indefinite" />
                </circle>
              </>
            )}
            {!shipComponents[3].completed && (
              <>
                <ellipse cx="200" cy="210" rx="20" ry="8" fill="none" stroke="#333" strokeWidth="2" strokeDasharray="5,5" />
                <text x="200" y="215" textAnchor="middle" fill="#666" fontSize="16">?</text>
              </>
            )}
          </g>

          {/* Component 5: Communications (Phase 5 - Submission) */}
          <g
            className={`ship-component ${shipComponents[4].completed ? 'completed' : 'incomplete'}`}
            onMouseEnter={() => setHoveredComponent(shipComponents[4])}
            onMouseLeave={() => setHoveredComponent(null)}
          >
            {shipComponents[4].completed && (
              <>
                {/* Comm array */}
                <rect x="235" y="195" width="30" height="4" fill={shipComponents[4].color} opacity="0.6" />
                <rect x="235" y="203" width="30" height="4" fill={shipComponents[4].color} opacity="0.6" />
                <rect x="235" y="211" width="30" height="4" fill={shipComponents[4].color} opacity="0.6" />
                {/* Signal waves */}
                <path d="M 270 200 Q 280 200 285 195" stroke={shipComponents[4].color} strokeWidth="1" fill="none" opacity="0.4">
                  <animate attributeName="opacity" values="0;0.6;0" dur="1.5s" repeatCount="indefinite" />
                </path>
                <path d="M 270 205 Q 285 205 295 200" stroke={shipComponents[4].color} strokeWidth="1" fill="none" opacity="0.4">
                  <animate attributeName="opacity" values="0;0.6;0" dur="1.5s" begin="0.5s" repeatCount="indefinite" />
                </path>
              </>
            )}
            {!shipComponents[4].completed && (
              <>
                <rect x="235" y="195" width="30" height="20" fill="none" stroke="#333" strokeWidth="2" strokeDasharray="5,5" />
                <text x="250" y="209" textAnchor="middle" fill="#666" fontSize="16">?</text>
              </>
            )}
          </g>

          {/* Component 6: Command Bridge (Phase 6 - Maintenance) */}
          <g
            className={`ship-component ${shipComponents[5].completed ? 'completed' : 'incomplete'}`}
            onMouseEnter={() => setHoveredComponent(shipComponents[5])}
            onMouseLeave={() => setHoveredComponent(null)}
          >
            {shipComponents[5].completed && (
              <>
                {/* Bridge dome */}
                <path
                  d="M 180 180 Q 200 160 220 180 L 220 190 L 180 190 Z"
                  fill={shipComponents[5].color}
                  fillOpacity="0.4"
                  stroke={shipComponents[5].color}
                  strokeWidth="2"
                  filter="url(#glow)"
                />
                {/* Bridge windows */}
                <circle cx="190" cy="180" r="3" fill="#fff" opacity="0.8" />
                <circle cx="200" cy="175" r="3" fill="#fff" opacity="0.8" />
                <circle cx="210" cy="180" r="3" fill="#fff" opacity="0.8" />
                {/* Bridge antenna */}
                <line x1="200" y1="160" x2="200" y2="145" stroke={shipComponents[5].color} strokeWidth="1" />
                <circle cx="200" cy="145" r="2" fill={shipComponents[5].color}>
                  <animate attributeName="fill" values={`${shipComponents[5].color};#fff;${shipComponents[5].color}`} dur="1s" repeatCount="indefinite" />
                </circle>
              </>
            )}
            {!shipComponents[5].completed && (
              <>
                <path d="M 180 180 Q 200 160 220 180 L 220 190 L 180 190 Z" fill="none" stroke="#333" strokeWidth="2" strokeDasharray="5,5" />
                <text x="200" y="182" textAnchor="middle" fill="#666" fontSize="16">?</text>
              </>
            )}
          </g>

          {/* Complete ship effects */}
          {isComplete && (
            <>
              {/* Victory glow */}
              <ellipse cx="200" cy="250" rx="80" ry="100" fill="none" stroke="#00ff41" strokeWidth="3" opacity="0.6">
                <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
              </ellipse>
              {/* Completion stars */}
              <text x="150" y="140" fontSize="24" fill="#ffcc00">★</text>
              <text x="250" y="140" fontSize="24" fill="#ffcc00">★</text>
              <text x="120" y="250" fontSize="20" fill="#ffcc00">★</text>
              <text x="280" y="250" fontSize="20" fill="#ffcc00">★</text>
            </>
          )}

          {/* Current phase indicator */}
          {!isComplete && currentPhase <= 6 && (
            <g>
              <circle
                cx={shipComponents[currentPhase - 1]?.position.x || 200}
                cy={shipComponents[currentPhase - 1]?.position.y || 250}
                r="40"
                fill="none"
                stroke="#ffcc00"
                strokeWidth="2"
                strokeDasharray="5,5"
                opacity="0.5"
              >
                <animate attributeName="r" values="35;45;35" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;0.7;0.3" dur="2s" repeatCount="indefinite" />
              </circle>
            </g>
          )}
        </svg>

        {/* Hover tooltip */}
        {hoveredComponent && (
          <div className="component-tooltip">
            <h4>{hoveredComponent.name}</h4>
            <p>{hoveredComponent.description}</p>
            <span className="phase-label">Phase {hoveredComponent.phase}</span>
            <span className={`status-badge ${hoveredComponent.completed ? 'complete' : 'locked'}`}>
              {hoveredComponent.completed ? '✓ Complete' : '🔒 Locked'}
            </span>
          </div>
        )}
      </div>

      {/* Component legend */}
      <div className="component-legend">
        <h3>Starship Components</h3>
        <div className="legend-grid">
          {shipComponents.map((component) => (
            <div
              key={component.id}
              className={`legend-item ${component.completed ? 'completed' : 'incomplete'} ${currentPhase === component.phase ? 'current' : ''}`}
            >
              <div className="legend-icon" style={{ borderColor: component.color }}>
                {component.completed ? '✓' : component.phase}
              </div>
              <div className="legend-text">
                <span className="legend-name">{component.name}</span>
                <span className="legend-phase">Phase {component.phase}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Completion message */}
      {isComplete && (
        <div className="completion-message">
          <h2>🎉 Starship Complete!</h2>
          <p>Your C2PA Certification Starship is fully operational!</p>
          <p className="subtitle">All 6 phases completed. You're ready to launch! 🚀</p>
        </div>
      )}
    </div>
  );
};

export default StarshipProgress;
