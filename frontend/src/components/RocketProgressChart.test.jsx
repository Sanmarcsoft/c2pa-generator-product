import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RocketProgressChart from './RocketProgressChart';

describe('RocketProgressChart', () => {
  const mockPhases = [
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
      status: 'completed',
      completedTasks: 2,
      totalTasks: 2
    },
    {
      id: 'phase-3',
      number: 3,
      name: 'Document Review',
      status: 'in-progress',
      completedTasks: 2,
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

  it('renders without crashing', () => {
    render(<RocketProgressChart currentPhase="phase-3" phases={mockPhases} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays correct ARIA attributes', () => {
    render(<RocketProgressChart currentPhase="phase-3" phases={mockPhases} />);
    const progressbar = screen.getByRole('progressbar');

    expect(progressbar).toHaveAttribute('aria-valuemin', '1');
    expect(progressbar).toHaveAttribute('aria-valuemax', '6');
    expect(progressbar).toHaveAttribute('aria-valuenow', '3');
  });

  it('renders all 6 phase milestones', () => {
    render(<RocketProgressChart currentPhase="phase-3" phases={mockPhases} />);
    const milestones = screen.getAllByRole('button');

    expect(milestones).toHaveLength(6);
  });

  it('displays correct phase statuses', () => {
    render(<RocketProgressChart currentPhase="phase-3" phases={mockPhases} />);

    expect(screen.getByLabelText(/Phase 1.*Completed/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phase 2.*Completed/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phase 3.*In Progress/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phase 4.*Pending/)).toBeInTheDocument();
  });

  it('calls onPhaseClick when milestone is clicked', () => {
    const mockOnPhaseClick = jest.fn();
    render(
      <RocketProgressChart
        currentPhase="phase-3"
        phases={mockPhases}
        onPhaseClick={mockOnPhaseClick}
      />
    );

    const phase1Milestone = screen.getByLabelText(/Phase 1/);
    fireEvent.click(phase1Milestone);

    expect(mockOnPhaseClick).toHaveBeenCalledWith(mockPhases[0]);
  });

  it('supports keyboard navigation with Enter key', () => {
    const mockOnPhaseClick = jest.fn();
    render(
      <RocketProgressChart
        currentPhase="phase-3"
        phases={mockPhases}
        onPhaseClick={mockOnPhaseClick}
      />
    );

    const phase2Milestone = screen.getByLabelText(/Phase 2/);
    fireEvent.keyDown(phase2Milestone, { key: 'Enter', code: 'Enter' });

    expect(mockOnPhaseClick).toHaveBeenCalledWith(mockPhases[1]);
  });

  it('supports keyboard navigation with Space key', () => {
    const mockOnPhaseClick = jest.fn();
    render(
      <RocketProgressChart
        currentPhase="phase-3"
        phases={mockPhases}
        onPhaseClick={mockOnPhaseClick}
      />
    );

    const phase3Milestone = screen.getByLabelText(/Phase 3/);
    fireEvent.keyDown(phase3Milestone, { key: ' ', code: 'Space' });

    expect(mockOnPhaseClick).toHaveBeenCalledWith(mockPhases[2]);
  });

  it('displays rocket icon with correct aria label', () => {
    render(<RocketProgressChart currentPhase="phase-3" phases={mockPhases} />);

    expect(screen.getByRole('img', { name: /Progress rocket at Phase 3/ })).toBeInTheDocument();
  });

  it('applies correct CSS classes for phase statuses', () => {
    const { container } = render(
      <RocketProgressChart currentPhase="phase-3" phases={mockPhases} />
    );

    expect(container.querySelector('.milestone-marker.completed')).toBeInTheDocument();
    expect(container.querySelector('.milestone-marker.in-progress')).toBeInTheDocument();
    expect(container.querySelector('.milestone-marker.pending')).toBeInTheDocument();
  });

  it('renders CRT visual effects', () => {
    const { container } = render(
      <RocketProgressChart currentPhase="phase-3" phases={mockPhases} />
    );

    expect(container.querySelector('.crt-scanlines')).toBeInTheDocument();
    expect(container.querySelector('.crt-vignette')).toBeInTheDocument();
  });

  it('handles default props when none provided', () => {
    render(<RocketProgressChart />);
    const progressbar = screen.getByRole('progressbar');

    expect(progressbar).toHaveAttribute('aria-valuenow', '1');
  });

  it('displays task progress in tooltips', () => {
    render(<RocketProgressChart currentPhase="phase-3" phases={mockPhases} />);

    const tooltips = screen.getAllByRole('tooltip');
    expect(tooltips[2]).toHaveTextContent('Tasks: 2 / 5');
  });

  it('renders phase names correctly', () => {
    render(<RocketProgressChart currentPhase="phase-3" phases={mockPhases} />);

    expect(screen.getByText('Preparation & Registration')).toBeInTheDocument();
    expect(screen.getByText('Knowledge Assessment')).toBeInTheDocument();
    expect(screen.getByText('Document Review')).toBeInTheDocument();
  });

  it('updates rocket position when currentPhase changes', () => {
    const { rerender } = render(
      <RocketProgressChart currentPhase="phase-2" phases={mockPhases} />
    );

    let rocketImg = screen.getByRole('img', { name: /Progress rocket/ });
    expect(rocketImg).toHaveAttribute('aria-label', expect.stringContaining('phase 2'));

    rerender(<RocketProgressChart currentPhase="phase-5" phases={mockPhases} />);

    rocketImg = screen.getByRole('img', { name: /Progress rocket/ });
    expect(rocketImg).toHaveAttribute('aria-label', expect.stringContaining('phase 5'));
  });
});
