import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, authFetch } = useAuth();

  const [targetRole, setTargetRole] = useState('');
  const [hasProfile, setHasProfile] = useState(true);
  const [profileSkills, setProfileSkills] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [generating, setGenerating] = useState(false);
  const [activeGenerationType, setActiveGenerationType] = useState(null); // 'resume' | 'interview'
  const [currentResult, setCurrentResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [rateLimitInfo, setRateLimitInfo] = useState(null);
  const [copied, setCopied] = useState(false);

  // Check user profile on load
  useEffect(() => {
    let isMounted = true;
    const checkProfile = async () => {
      try {
        setLoadingProfile(true);
        const res = await authFetch('/api/profile');
        const json = await res.json();

        if (isMounted) {
          if (!json.data || !json.data.skills || json.data.skills.length === 0) {
            setHasProfile(false);
          } else {
            setHasProfile(true);
            setProfileSkills(json.data.skills);
          }
        }
      } catch (err) {
        console.error('Error fetching profile status:', err);
      } finally {
        if (isMounted) setLoadingProfile(false);
      }
    };

    checkProfile();
    return () => {
      isMounted = false;
    };
  }, [authFetch]);

  // Generate resume content
  const handleGenerateResume = async () => {
    if (!targetRole.trim()) {
      setErrorMsg('Please specify a target role before generating resume content');
      return;
    }

    try {
      setErrorMsg('');
      setRateLimitInfo(null);
      setGenerating(true);
      setActiveGenerationType('resume');

      const res = await authFetch('/api/generate/resume', {
        method: 'POST',
        body: JSON.stringify({ targetRole: targetRole.trim() })
      });

      const json = await res.json();

      if (res.status === 429) {
        setRateLimitInfo(json);
        setErrorMsg(json.message || 'Daily generation quota reached (10/10).');
        return;
      }

      if (!res.ok) {
        throw new Error(json.message || 'Failed to generate resume content');
      }

      setCurrentResult(json.data);
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred during resume generation');
    } finally {
      setGenerating(false);
      setActiveGenerationType(null);
    }
  };

  // Generate interview questions
  const handleGenerateInterview = async () => {
    if (!targetRole.trim()) {
      setErrorMsg('Please specify a target role before generating mock interview questions');
      return;
    }

    try {
      setErrorMsg('');
      setRateLimitInfo(null);
      setGenerating(true);
      setActiveGenerationType('interview');

      const res = await authFetch('/api/generate/interview', {
        method: 'POST',
        body: JSON.stringify({ targetRole: targetRole.trim() })
      });

      const json = await res.json();

      if (res.status === 429) {
        setRateLimitInfo(json);
        setErrorMsg(json.message || 'Daily generation quota reached (10/10).');
        return;
      }

      if (!res.ok) {
        throw new Error(json.message || 'Failed to generate interview questions');
      }

      setCurrentResult(json.data);
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred during interview generation');
    } finally {
      setGenerating(false);
      setActiveGenerationType(null);
    }
  };

  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sampleRoles = [
    'Senior Full Stack Engineer',
    'Frontend React Specialist',
    'Cloud / DevOps Engineer',
    'Backend Node.js Architect',
    'Product Engineering Lead'
  ];

  return (
    <div>
      {/* Top Banner */}
      <div className="card-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2>AI Career Assistant Dashboard</h2>
          <p className="card-subtitle">
            Welcome, <strong>{user?.name}</strong>! Craft tailored resume bullet points and master role-specific interview frameworks in seconds.
          </p>
        </div>
      </div>

      {!loadingProfile && !hasProfile && (
        <div className="alert alert-warning" style={{ justifyContent: 'space-between' }}>
          <div>
            <strong>⚠️ Profile Incomplete:</strong> Please complete your profile with your education, skills, and experience to unlock AI-powered resume and interview generation.
          </div>
          <Link to="/profile" className="btn btn-primary btn-sm" style={{ whiteSpace: 'nowrap' }}>
            Set Up Profile →
          </Link>
        </div>
      )}

      {rateLimitInfo && (
        <div className="alert alert-danger">
          <strong>⛔ Rate Limit Exceeded:</strong> {rateLimitInfo.message}
        </div>
      )}

      {errorMsg && !rateLimitInfo && (
        <div className="alert alert-danger">{errorMsg}</div>
      )}

      {/* Generator Card */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Target Role & Generation Hub</h3>
            <p className="card-subtitle">
              Specify your target job position. The assistant will cross-reference your profile's {profileSkills.length} skills with industry requirements.
            </p>
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Quota: Max 10 requests / 24h
          </span>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="targetRole">
            What role are you targeting?
          </label>
          <input
            id="targetRole"
            type="text"
            className="form-control"
            placeholder="e.g. Senior Full Stack Engineer, Cloud Architect, Technical Lead..."
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '0.5rem' }}>
            Quick select:
          </span>
          <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.35rem' }}>
            {sampleRoles.map((role) => (
              <button
                key={role}
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.785rem', padding: '0.2rem 0.55rem' }}
                onClick={() => setTargetRole(role)}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          <button
            type="button"
            className="btn btn-primary"
            disabled={generating}
            onClick={handleGenerateResume}
          >
            {generating && activeGenerationType === 'resume' ? (
              <>
                <span className="spinner"></span> Generating Resume Content...
              </>
            ) : (
              '📄 Generate Tailored Resume Content'
            )}
          </button>

          <button
            type="button"
            className="btn btn-accent"
            disabled={generating}
            onClick={handleGenerateInterview}
          >
            {generating && activeGenerationType === 'interview' ? (
              <>
                <span className="spinner"></span> Generating Mock Interview...
              </>
            ) : (
              '🎯 Generate Mock Interview Questions'
            )}
          </button>
        </div>
      </div>

      {/* Output Presentation Area */}
      {currentResult && (
        <div className="card ai-output-container">
          <div className="ai-output-header">
            <div>
              <span className={`output-badge ${currentResult.type}`}>
                {currentResult.type === 'resume' ? 'Tailored Resume Output' : 'Mock Interview Framework'}
              </span>
              <h3 style={{ marginTop: '0.35rem' }}>
                Target: {currentResult.targetRole}
              </h3>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleCopyText(JSON.stringify(currentResult.outputContent, null, 2))}
            >
              {copied ? '✓ Copied!' : '📋 Copy All'}
            </button>
          </div>

          {/* Render Resume Output */}
          {currentResult.type === 'resume' && (
            <div>
              {currentResult.outputContent.professionalSummary && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '1rem', color: 'var(--text-sub)', marginBottom: '0.5rem' }}>
                    Executive Professional Summary
                  </h4>
                  <div className="resume-summary-box">
                    {currentResult.outputContent.professionalSummary}
                  </div>
                </div>
              )}

              {currentResult.outputContent.experienceBullets && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '1rem', color: 'var(--text-sub)', marginBottom: '0.5rem' }}>
                    Quantified Achievement Bullet Points (XYZ Formula)
                  </h4>
                  <ul className="bullet-points-list">
                    {currentResult.outputContent.experienceBullets.map((bullet, idx) => (
                      <li key={idx} className="bullet-point-item">
                        <span className="bullet-point-icon">✓</span>
                        <div style={{ flex: 1 }}>{bullet}</div>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                          onClick={() => handleCopyText(bullet)}
                        >
                          Copy
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {currentResult.outputContent.actionableTips && (
                <div className="alert alert-info" style={{ display: 'block' }}>
                  <strong>💡 Recruiter Tips for "{currentResult.targetRole}":</strong>
                  <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem' }}>
                    {currentResult.outputContent.actionableTips.map((tip, i) => (
                      <li key={i} style={{ marginBottom: '0.35rem' }}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Render Interview Output */}
          {currentResult.type === 'interview' && (
            <div>
              {currentResult.outputContent.overview && (
                <p style={{ color: 'var(--text-sub)', marginBottom: '1.25rem', fontSize: '0.95rem' }}>
                  {currentResult.outputContent.overview}
                </p>
              )}

              {Array.isArray(currentResult.outputContent.questions) && (
                <div>
                  {currentResult.outputContent.questions.map((q, index) => (
                    <div key={q.id || index} className="question-card">
                      <div className="question-card-top">
                        <span className="question-category">
                          Question #{index + 1} &bull; {q.category || 'Competency'}
                        </span>
                      </div>

                      <div className="question-text">{q.question}</div>

                      {q.suggestedFramework && (
                        <div>
                          <span className="framework-badge">
                            📐 Framework: {q.suggestedFramework}
                          </span>
                        </div>
                      )}

                      {q.sampleAnswerGuidance && (
                        <div className="guidance-box" style={{ marginBottom: '0.5rem' }}>
                          <strong>Suggested Answer Strategy:</strong> {q.sampleAnswerGuidance}
                        </div>
                      )}

                      {q.evaluatorFocus && (
                        <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          🎯 Evaluator evaluates: {q.evaluatorFocus}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
