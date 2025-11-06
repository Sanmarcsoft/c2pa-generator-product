/**
 * RocketProgressChart - Usage Examples
 *
 * This file demonstrates how to use the RocketProgressChart component
 * in various scenarios within the Trusteddit C2PA Certification Platform.
 */

import React, { useState } from 'react';
import RocketProgressChart from './RocketProgressChart';

// ============================================
// Example 1: Basic Usage
// ============================================

export const BasicExample = () => {
  const phases = [
    {
      id: 'phase-1',
      number: 1,
      name: 'Preparation & Registration',
      status: 'completed',
      completedTasks: 3,
      totalTasks: 3
    },
    {
      id: 'phase-2',
      number: 2,
      name: 'Knowledge Assessment',
      status: 'in-progress',
      completedTasks: 1,
      totalTasks: 2
    },
    {
      id: 'phase-3',
      number: 3,
      name: 'Document Review',
      status: 'pending',
      completedTasks: 0,
      totalTasks: 5
    },
    {
      id: 'phase-4',
      number: 4,
      name: 'Application Submission',
      status: 'pending',
      completedTasks: 0,
      totalTasks: 4
    },
    {
      id: 'phase-5',
      number: 5,
      name: 'Audit & Review',
      status: 'pending',
      completedTasks: 0,
      totalTasks: 3
    },
    {
      id: 'phase-6',
      number: 6,
      name: 'Certification & Maintenance',
      status: 'pending',
      completedTasks: 0,
      totalTasks: 2
    }
  ];

  return (
    <RocketProgressChart
      currentPhase="phase-2"
      phases={phases}
    />
  );
};

// ============================================
// Example 2: With Click Handler
// ============================================

export const InteractiveExample = () => {
  const [selectedPhase, setSelectedPhase] = useState(null);

  const phases = [
    { id: 'phase-1', number: 1, name: 'Preparation & Registration', status: 'completed' },
    { id: 'phase-2', number: 2, name: 'Knowledge Assessment', status: 'completed' },
    { id: 'phase-3', number: 3, name: 'Document Review', status: 'in-progress' },
    { id: 'phase-4', number: 4, name: 'Application Submission', status: 'pending' },
    { id: 'phase-5', number: 5, name: 'Audit & Review', status: 'pending' },
    { id: 'phase-6', number: 6, name: 'Certification & Maintenance', status: 'pending' }
  ];

  const handlePhaseClick = (phase) => {
    setSelectedPhase(phase);
    console.log('Phase clicked:', phase);
    // Open modal or navigate to phase details page
  };

  return (
    <div>
      <RocketProgressChart
        currentPhase="phase-3"
        phases={phases}
        onPhaseClick={handlePhaseClick}
      />
      {selectedPhase && (
        <div style={{ marginTop: '1rem', padding: '1rem', border: '2px solid #00FF00' }}>
          <h3>Selected Phase: {selectedPhase.name}</h3>
          <p>Status: {selectedPhase.status}</p>
        </div>
      )}
    </div>
  );
};

// ============================================
// Example 3: Dynamic Progress (API Integration)
// ============================================

export const DynamicProgressExample = () => {
  const [currentPhase, setCurrentPhase] = useState('phase-1');
  const [phases, setPhases] = useState([
    { id: 'phase-1', number: 1, name: 'Preparation & Registration', status: 'in-progress', completedTasks: 0, totalTasks: 3 },
    { id: 'phase-2', number: 2, name: 'Knowledge Assessment', status: 'pending', completedTasks: 0, totalTasks: 2 },
    { id: 'phase-3', number: 3, name: 'Document Review', status: 'pending', completedTasks: 0, totalTasks: 5 },
    { id: 'phase-4', number: 4, name: 'Application Submission', status: 'pending', completedTasks: 0, totalTasks: 4 },
    { id: 'phase-5', number: 5, name: 'Audit & Review', status: 'pending', completedTasks: 0, totalTasks: 3 },
    { id: 'phase-6', number: 6, name: 'Certification & Maintenance', status: 'pending', completedTasks: 0, totalTasks: 2 }
  ]);

  // Simulate API call to fetch progress
  const fetchProgress = async () => {
    try {
      const response = await fetch('/api/progress');
      const data = await response.json();
      setCurrentPhase(data.currentPhase);
      setPhases(data.phases);
    } catch (error) {
      console.error('Failed to fetch progress:', error);
    }
  };

  // Simulate task completion
  const completeTask = () => {
    setPhases(prevPhases => {
      const newPhases = [...prevPhases];
      const currentPhaseIndex = parseInt(currentPhase.split('-')[1]) - 1;
      const phase = newPhases[currentPhaseIndex];

      if (phase.completedTasks < phase.totalTasks) {
        phase.completedTasks += 1;

        // If phase complete, move to next phase
        if (phase.completedTasks === phase.totalTasks) {
          phase.status = 'completed';
          if (currentPhaseIndex < 5) {
            newPhases[currentPhaseIndex + 1].status = 'in-progress';
            setCurrentPhase(`phase-${currentPhaseIndex + 2}`);
          }
        }
      }

      return newPhases;
    });
  };

  return (
    <div>
      <RocketProgressChart
        currentPhase={currentPhase}
        phases={phases}
      />
      <div style={{ marginTop: '1rem', textAlign: 'center' }}>
        <button
          onClick={completeTask}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#00FF00',
            color: '#0a0a0a',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Complete Task
        </button>
      </div>
    </div>
  );
};

// ============================================
// Example 4: All Phases Complete (Go Status)
// ============================================

export const CompletedExample = () => {
  const phases = [
    { id: 'phase-1', number: 1, name: 'Preparation & Registration', status: 'go' },
    { id: 'phase-2', number: 2, name: 'Knowledge Assessment', status: 'go' },
    { id: 'phase-3', number: 3, name: 'Document Review', status: 'go' },
    { id: 'phase-4', number: 4, name: 'Application Submission', status: 'go' },
    { id: 'phase-5', number: 5, name: 'Audit & Review', status: 'go' },
    { id: 'phase-6', number: 6, name: 'Certification & Maintenance', status: 'completed' }
  ];

  return (
    <RocketProgressChart
      currentPhase="phase-6"
      phases={phases}
    />
  );
};

// ============================================
// Example 5: Integration with Progress Page
// ============================================

export const ProgressPageIntegration = () => {
  // This would be part of IntegratedProgressPage component
  return (
    <div style={{ display: 'flex', gap: '2rem', height: '100vh' }}>
      {/* Left Panel - Rocket Progress Chart */}
      <div style={{ flex: '1', padding: '2rem' }}>
        <h2 style={{ color: '#00FF00', marginBottom: '1rem' }}>
          Your Certification Journey
        </h2>
        <RocketProgressChart
          currentPhase="phase-3"
          phases={[
            { id: 'phase-1', number: 1, name: 'Preparation & Registration', status: 'completed', completedTasks: 3, totalTasks: 3 },
            { id: 'phase-2', number: 2, name: 'Knowledge Assessment', status: 'completed', completedTasks: 2, totalTasks: 2 },
            { id: 'phase-3', number: 3, name: 'Document Review', status: 'in-progress', completedTasks: 2, totalTasks: 5 },
            { id: 'phase-4', number: 4, name: 'Application Submission', status: 'pending', completedTasks: 0, totalTasks: 4 },
            { id: 'phase-5', number: 5, name: 'Audit & Review', status: 'pending', completedTasks: 0, totalTasks: 3 },
            { id: 'phase-6', number: 6, name: 'Certification & Maintenance', status: 'pending', completedTasks: 0, totalTasks: 2 }
          ]}
          onPhaseClick={(phase) => console.log('Open details for:', phase.name)}
        />
      </div>

      {/* Right Panel - Chat & Upload Components */}
      <div style={{ flex: '1', padding: '2rem', background: '#1a1a1a' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ color: '#00FFFF' }}>AI Assistant Chat</h3>
          {/* ChatComponent would go here */}
          <div style={{ height: '300px', border: '2px solid #00FFFF', padding: '1rem' }}>
            Chat interface...
          </div>
        </div>

        <div>
          <h3 style={{ color: '#FFB000' }}>Document Upload</h3>
          {/* DocumentUpload would go here */}
          <div style={{ height: '200px', border: '2px solid #FFB000', padding: '1rem' }}>
            Upload interface...
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// Props Interface Documentation
// ============================================

/**
 * Phase Object Interface:
 *
 * @typedef {Object} Phase
 * @property {string} id - Unique phase identifier (e.g., 'phase-1', 'phase-2')
 * @property {number} number - Phase number (1-6)
 * @property {string} name - Display name of the phase
 * @property {'pending'|'in-progress'|'completed'|'go'} status - Current phase status
 * @property {number} [completedTasks] - Number of completed tasks (optional)
 * @property {number} [totalTasks] - Total number of tasks in phase (optional)
 */

/**
 * RocketProgressChart Props:
 *
 * @typedef {Object} RocketProgressChartProps
 * @property {string} currentPhase - Current active phase ID (e.g., 'phase-3')
 * @property {Phase[]} phases - Array of 6 phase objects
 * @property {(phase: Phase) => void} [onPhaseClick] - Optional callback when milestone clicked
 */
