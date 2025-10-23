import React, { useState } from 'react';
import './OnboardingWizard.css';

const OnboardingWizard = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({
    aiProvider: 'none',
    openwebuiUrl: '',
    githubToken: '',
    githubRepos: []
  });

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const completeOnboarding = async () => {
    try {
      // Save settings to backend
      await fetch('/api/settings/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aiProvider: config.aiProvider,
          openwebuiUrl: config.openwebuiUrl,
          githubConfigured: config.githubToken ? true : false
        })
      });

      // If GitHub token is provided, authenticate
      if (config.githubToken) {
        await fetch('/api/github/auth/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: config.githubToken })
        });

        // Index repositories if provided
        for (const repo of config.githubRepos) {
          if (repo.owner && repo.name) {
            await fetch('/api/github/repos/index', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ owner: repo.owner, repo: repo.name })
            });
          }
        }
      }

      // Call onComplete callback
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      alert('Failed to complete onboarding. Please try again.');
    }
  };

  const addRepository = () => {
    setConfig({
      ...config,
      githubRepos: [...config.githubRepos, { owner: '', name: '' }]
    });
  };

  const updateRepository = (index, field, value) => {
    const newRepos = [...config.githubRepos];
    newRepos[index][field] = value;
    setConfig({ ...config, githubRepos: newRepos });
  };

  const removeRepository = (index) => {
    const newRepos = config.githubRepos.filter((_, i) => i !== index);
    setConfig({ ...config, githubRepos: newRepos });
  };

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-wizard">
        <div className="wizard-header">
          <h1 className="pixel-text">🎮 Welcome to C2PA Generator Assistant!</h1>
          <div className="progress-bar">
            <div className="progress-step">{step} / 4</div>
          </div>
        </div>

        <div className="wizard-content">
          {step === 1 && (
            <div className="wizard-step">
              <h2>👋 Getting Started</h2>
              <p className="description">
                Let's get your C2PA Certification Assistant configured!
              </p>
              <div className="info-box">
                <h3>What you'll set up:</h3>
                <ul>
                  <li>✅ AI Provider (OpenWebUI or OpenAI)</li>
                  <li>✅ GitHub Integration (optional)</li>
                  <li>✅ Repository Indexing (optional)</li>
                  <li>✅ Ready to certify!</li>
                </ul>
              </div>
              <p className="note">
                💡 Don't worry - you can skip any step and configure it later in Settings.
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="wizard-step">
              <h2>🤖 AI Provider Setup</h2>
              <p className="description">
                Choose your AI provider for intelligent assistance.
              </p>

              <div className="option-group">
                <label className="option-card">
                  <input
                    type="radio"
                    name="aiProvider"
                    value="openwebui"
                    checked={config.aiProvider === 'openwebui'}
                    onChange={(e) => setConfig({ ...config, aiProvider: e.target.value })}
                  />
                  <div className="option-content">
                    <h3>🏠 OpenWebUI (Recommended)</h3>
                    <p>Run AI models locally - free and private</p>
                  </div>
                </label>

                {config.aiProvider === 'openwebui' && (
                  <div className="config-input">
                    <label>OpenWebUI API URL:</label>
                    <input
                      type="text"
                      placeholder="http://localhost:3000/api"
                      value={config.openwebuiUrl}
                      onChange={(e) => setConfig({ ...config, openwebuiUrl: e.target.value })}
                    />
                    <small>
                      Need to install OpenWebUI?{' '}
                      <a href="https://docs.openwebui.com/" target="_blank" rel="noopener noreferrer">
                        See installation guide
                      </a>
                    </small>
                  </div>
                )}

                <label className="option-card">
                  <input
                    type="radio"
                    name="aiProvider"
                    value="openai"
                    checked={config.aiProvider === 'openai'}
                    onChange={(e) => setConfig({ ...config, aiProvider: e.target.value })}
                  />
                  <div className="option-content">
                    <h3>☁️ OpenAI API</h3>
                    <p>Cloud-based AI (requires API key)</p>
                  </div>
                </label>

                {config.aiProvider === 'openai' && (
                  <div className="config-input">
                    <p className="warning">
                      ⚠️ Configure OpenAI API key in your environment variables or backend/config/secrets.json
                    </p>
                  </div>
                )}

                <label className="option-card">
                  <input
                    type="radio"
                    name="aiProvider"
                    value="none"
                    checked={config.aiProvider === 'none'}
                    onChange={(e) => setConfig({ ...config, aiProvider: e.target.value })}
                  />
                  <div className="option-content">
                    <h3>📋 Fallback Mode</h3>
                    <p>Rule-based responses (no AI required)</p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="wizard-step">
              <h2>🐙 GitHub Integration (Optional)</h2>
              <p className="description">
                Connect GitHub to enable code search with RAG (Retrieval-Augmented Generation).
              </p>

              <div className="config-input">
                <label>GitHub Personal Access Token:</label>
                <input
                  type="password"
                  placeholder="ghp_..."
                  value={config.githubToken}
                  onChange={(e) => setConfig({ ...config, githubToken: e.target.value })}
                />
                <small>
                  <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer">
                    Create a token
                  </a>{' '}
                  with 'repo' or 'public_repo' scope
                </small>
              </div>

              <div className="info-box">
                <p>
                  <strong>Why connect GitHub?</strong>
                </p>
                <ul>
                  <li>Search your codebase directly from the chat</li>
                  <li>Get code snippets with context</li>
                  <li>Link to specific files and line numbers</li>
                </ul>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="wizard-step">
              <h2>📦 Index Repositories (Optional)</h2>
              <p className="description">
                Add repositories to index for AI-powered code search.
              </p>

              {config.githubToken ? (
                <>
                  <div className="repos-list">
                    {config.githubRepos.map((repo, index) => (
                      <div key={index} className="repo-input-group">
                        <input
                          type="text"
                          placeholder="owner"
                          value={repo.owner}
                          onChange={(e) => updateRepository(index, 'owner', e.target.value)}
                        />
                        <span>/</span>
                        <input
                          type="text"
                          placeholder="repo-name"
                          value={repo.name}
                          onChange={(e) => updateRepository(index, 'name', e.target.value)}
                        />
                        <button
                          className="btn-remove"
                          onClick={() => removeRepository(index)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  <button className="btn-secondary" onClick={addRepository}>
                    + Add Repository
                  </button>

                  <div className="info-box">
                    <p>
                      Example: <code>smsmatt/c2pa-generator-product</code>
                    </p>
                  </div>
                </>
              ) : (
                <div className="warning-box">
                  <p>⚠️ GitHub token not configured. Go back to Step 3 to add it.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="wizard-footer">
          <button
            className="btn-secondary"
            onClick={handleSkip}
          >
            Skip Setup
          </button>

          <div className="button-group">
            {step > 1 && (
              <button className="btn-secondary" onClick={handleBack}>
                ← Back
              </button>
            )}
            <button className="btn-primary" onClick={handleNext}>
              {step === 4 ? 'Complete Setup' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
