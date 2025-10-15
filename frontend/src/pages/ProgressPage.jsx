import { useState, useEffect } from 'react';
import StarshipProgress from '../components/StarshipProgress';
import './ProgressPage.css';

function ProgressPage() {
  const [phases, setPhases] = useState([
    { id: 1, name: 'Introduction & Prerequisites', status: 'pending', progress: 0 },
    { id: 2, name: 'Understanding Requirements', status: 'pending', progress: 0 },
    { id: 3, name: 'Document Review', status: 'pending', progress: 0 },
    { id: 4, name: 'Application Preparation', status: 'pending', progress: 0 },
    { id: 5, name: 'Submission & Follow-up', status: 'pending', progress: 0 },
    { id: 6, name: 'Certification Maintenance', status: 'pending', progress: 0 }
  ]);
  const [completedPhases, setCompletedPhases] = useState([]);
  const [currentPhase, setCurrentPhase] = useState(1);
  const [overallProgress, setOverallProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      // Try to fetch from adventure progress first
      const adventureResponse = await fetch('/api/adventure/progress');
      const adventureData = await adventureResponse.json();

      if (adventureData.success && adventureData.progress) {
        const { currentChapter, completedCheckpoints } = adventureData.progress;

        // Determine completed phases based on chapter progress
        const completed = [];
        if (currentChapter >= 1) completed.push(1);
        if (currentChapter >= 2) completed.push(2);
        if (currentChapter >= 3) completed.push(3);
        if (currentChapter >= 4) completed.push(4);
        if (currentChapter >= 5) completed.push(5);
        if (currentChapter >= 6) completed.push(6);

        setCompletedPhases(completed);
        setCurrentPhase(currentChapter);

        // Update phases array with status and progress
        const updatedPhases = phases.map(phase => {
          if (completed.includes(phase.id)) {
            return { ...phase, status: 'completed', progress: 100 };
          } else if (phase.id === currentChapter) {
            return { ...phase, status: 'in-progress', progress: 50 };
          } else {
            return { ...phase, status: 'pending', progress: 0 };
          }
        });

        setPhases(updatedPhases);
        setOverallProgress(Math.round((completed.length / 6) * 100));
      } else {
        // Fallback: check Phase 1 progress
        const phase1Response = await fetch('/api/phase1/status');
        const phase1Data = await phase1Response.json();

        if (phase1Data.success && phase1Data.progress > 0) {
          const updatedPhases = [...phases];
          updatedPhases[0] = {
            ...updatedPhases[0],
            status: phase1Data.progress === 100 ? 'completed' : 'in-progress',
            progress: phase1Data.progress
          };

          setPhases(updatedPhases);
          setOverallProgress(Math.round(phase1Data.progress / 6));

          if (phase1Data.progress === 100) {
            setCompletedPhases([1]);
            setCurrentPhase(2);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="progress-page">
      <h1 className="page-title">CERTIFICATION PROGRESS</h1>

      <div className="company-info retro-card">
        <h2>SANMARCSOFT LLC</h2>
        <p className="text-cyan">Generator Product Certification Journey</p>
      </div>

      {/* Starship Progress Visualization */}
      <StarshipProgress
        completedPhases={completedPhases}
        currentPhase={currentPhase}
      />

      <div className="phases-progress">
        {phases.map((phase) => (
          <div key={phase.id} className="phase-progress-item retro-card">
            <div className="phase-header">
              <h3>PHASE {phase.id}: {phase.name}</h3>
              <span className={`status-badge ${phase.status}`}>
                {phase.status.toUpperCase()}
              </span>
            </div>
            <div className="retro-progress-bar">
              <div
                className="retro-progress-bar-fill"
                style={{ width: `${phase.progress}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <div className="overall-progress retro-card">
        <h2>OVERALL COMPLETION</h2>
        <div className="retro-progress-bar" style={{ height: '30px' }}>
          <div className="retro-progress-bar-fill" style={{ width: `${overallProgress}%` }}></div>
        </div>
        <p className="progress-text">{overallProgress}% Complete</p>
      </div>
    </div>
  );
}

export default ProgressPage;
