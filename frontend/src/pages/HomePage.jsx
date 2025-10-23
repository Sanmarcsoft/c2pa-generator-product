import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './HomePage.css';

function HomePage() {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    setTimeout(() => setShowContent(true), 300);
  }, []);

  return (
    <div className={`home-page ${showContent ? 'show' : ''}`}>
      <section className="hero-section">
        <div className="hero-avatar floating">
          <svg width="200" height="200" viewBox="0 0 200 200">
            {/* Simple vector character */}
            <circle cx="100" cy="70" r="30" fill="none" stroke="var(--neon-cyan)" strokeWidth="3" className="pulse" />
            <line x1="100" y1="100" x2="100" y2="140" stroke="var(--neon-green)" strokeWidth="3" />
            <line x1="100" y1="110" x2="70" y2="130" stroke="var(--neon-green)" strokeWidth="3" />
            <line x1="100" y1="110" x2="130" y2="130" stroke="var(--neon-green)" strokeWidth="3" />
            <line x1="100" y1="140" x2="80" y2="170" stroke="var(--neon-green)" strokeWidth="3" />
            <line x1="100" y1="140" x2="120" y2="170" stroke="var(--neon-green)" strokeWidth="3" />
            {/* Eyes */}
            <circle cx="90" cy="65" r="3" fill="var(--neon-cyan)" />
            <circle cx="110" cy="65" r="3" fill="var(--neon-cyan)" />
            {/* Smile */}
            <path d="M 85 75 Q 100 85 115 75" fill="none" stroke="var(--neon-cyan)" strokeWidth="2" />
          </svg>
        </div>

        <h1 className="hero-title">WELCOME TO C2PA GENERATOR</h1>
        <h2 className="hero-subtitle text-cyan">CERTIFICATION ASSISTANT</h2>

        <p className="hero-text">
          Your 8-bit AI companion for navigating the C2PA Generator Product certification process.
          Let's level up your content provenance game!
        </p>

        <div className="hero-actions">
          <Link to="/chat" className="hero-button primary">
            START CHAT
          </Link>
          <Link to="/progress" className="hero-button">
            VIEW PROGRESS
          </Link>
        </div>
      </section>

      <section className="features-section">
        <h2 className="section-title">FEATURES</h2>

        <div className="features-grid">
          <div className="feature-card retro-card">
            <h3>🎮 AI ASSISTANT</h3>
            <p>
              Interactive AI guide with retro personality that helps you through every step
              of the certification process.
            </p>
          </div>

          <div className="feature-card retro-card">
            <h3>📄 DOCUMENT MANAGEMENT</h3>
            <p>
              Upload, review, annotate, and download all certification documents in one place.
            </p>
          </div>

          <div className="feature-card retro-card">
            <h3>📊 PROGRESS TRACKING</h3>
            <p>
              Visual dashboard showing your certification progress through all 6 phases.
            </p>
          </div>

          <div className="feature-card retro-card">
            <h3>✅ CHECKLIST SYSTEM</h3>
            <p>
              Interactive task lists to ensure you complete all requirements.
            </p>
          </div>

          <div className="feature-card retro-card">
            <h3>🎯 PHASE-BY-PHASE</h3>
            <p>
              6 structured phases from introduction to certification maintenance.
            </p>
          </div>

          <div className="feature-card retro-card">
            <h3>🔒 SECURE</h3>
            <p>
              All your data stored securely with local-first architecture.
            </p>
          </div>
        </div>
      </section>

      <section className="phases-section">
        <h2 className="section-title">CERTIFICATION PHASES</h2>

        <div className="phases-list">
          {[
            { num: 1, name: 'Introduction & Prerequisites', icon: '🎯' },
            { num: 2, name: 'Understanding Requirements', icon: '📚' },
            { num: 3, name: 'Document Review', icon: '📄' },
            { num: 4, name: 'Application Preparation', icon: '✏️' },
            { num: 5, name: 'Submission & Follow-up', icon: '📤' },
            { num: 6, name: 'Certification Maintenance', icon: '🏆' }
          ].map((phase) => (
            <div key={phase.num} className="phase-item retro-card">
              <span className="phase-number">{phase.icon} PHASE {phase.num}</span>
              <span className="phase-name">{phase.name}</span>
            </div>
          ))}
        </div>

        <div className="cta-section">
          <Link to="/chat" className="cta-button">
            BEGIN YOUR JOURNEY
          </Link>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
