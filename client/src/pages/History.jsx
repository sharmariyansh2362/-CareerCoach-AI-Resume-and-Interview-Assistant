import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const History = () => {
  const { authFetch } = useAuth();

  const [history, setHistory] = useState([]);
  const [filterType, setFilterType] = useState('all'); // 'all' | 'resume' | 'interview'
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await authFetch('/api/generate/history');
        const json = await res.json();

        if (json.success && isMounted) {
          setHistory(json.data || []);
        } else if (!json.success && isMounted) {
          setError(json.message || 'Failed to fetch history');
        }
      } catch (err) {
        if (isMounted) setError(err.message || 'Error fetching generation history');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchHistory();
    return () => {
      isMounted = false;
    };
  }, [authFetch]);

  const handleCopy = (id, content) => {
    navigator.clipboard.writeText(JSON.stringify(content, null, 2));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter items
  const filteredHistory = history.filter((item) => {
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.targetRole.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <div className="spinner spinner-dark" style={{ width: '2rem', height: '2rem' }}></div>
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Retrieving your AI generation history...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="card-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2>Generation History & Saved Artifacts</h2>
          <p className="card-subtitle">
            Browse and review your tailored resumes and mock interview question sets saved across all sessions.
          </p>
        </div>
        <Link to="/dashboard" className="btn btn-primary btn-sm">
          + New Generation
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Filters */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className={`btn btn-sm ${filterType === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilterType('all')}
            >
              All Types ({history.length})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${filterType === 'resume' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilterType('resume')}
            >
              Resumes ({history.filter((h) => h.type === 'resume').length})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${filterType === 'interview' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilterType('interview')}
            >
              Interviews ({history.filter((h) => h.type === 'interview').length})
            </button>
          </div>

          <div style={{ minWidth: '240px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search by role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: '0.45rem 0.75rem', fontSize: '0.875rem' }}
            />
          </div>
        </div>
      </div>

      {/* Results List */}
      {filteredHistory.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-sub)', marginBottom: '0.5rem' }}>
            No saved generations found {searchQuery || filterType !== 'all' ? 'matching your filters' : 'yet'}.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Head over to the Dashboard to create your first tailored resume bullet points or mock interview questions.
          </p>
          <Link to="/dashboard" className="btn btn-primary">
            Go to Generator Dashboard
          </Link>
        </div>
      ) : (
        <div>
          {filteredHistory.map((item) => {
            const formattedDate = new Date(item.createdAt).toLocaleString(undefined, {
              dateStyle: 'medium',
              timeStyle: 'short'
            });

            return (
              <div key={item._id} className="history-item">
                <div className="history-item-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className={`output-badge ${item.type}`}>
                      {item.type === 'resume' ? 'Resume' : 'Interview'}
                    </span>
                    <h3 style={{ fontSize: '1.15rem' }}>{item.targetRole}</h3>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className="history-meta">{formattedDate}</span>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleCopy(item._id, item.outputContent)}
                    >
                      {copiedId === item._id ? '✓ Copied' : '📋 Copy JSON'}
                    </button>
                  </div>
                </div>

                {/* Resume display */}
                {item.type === 'resume' && (
                  <div style={{ marginTop: '1rem' }}>
                    {item.outputContent?.professionalSummary && (
                      <div className="resume-summary-box" style={{ fontSize: '0.95rem', padding: '1rem' }}>
                        <strong>Professional Summary:</strong> {item.outputContent.professionalSummary}
                      </div>
                    )}

                    {Array.isArray(item.outputContent?.experienceBullets) && (
                      <ul className="bullet-points-list" style={{ gap: '0.5rem' }}>
                        {item.outputContent.experienceBullets.map((bullet, i) => (
                          <li key={i} className="bullet-point-item" style={{ padding: '0.65rem 0.85rem' }}>
                            <span className="bullet-point-icon">✓</span>
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* Interview display */}
                {item.type === 'interview' && (
                  <div style={{ marginTop: '1rem' }}>
                    {item.outputContent?.overview && (
                      <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                        {item.outputContent.overview}
                      </p>
                    )}

                    {Array.isArray(item.outputContent?.questions) && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {item.outputContent.questions.map((q, idx) => (
                          <div key={q.id || idx} className="question-card" style={{ marginBottom: 0 }}>
                            <div className="question-category" style={{ marginBottom: '0.25rem' }}>
                              #{idx + 1} {q.category}
                            </div>
                            <div style={{ fontWeight: 600, fontSize: '0.975rem', marginBottom: '0.4rem' }}>
                              {q.question}
                            </div>
                            {q.sampleAnswerGuidance && (
                              <div className="guidance-box" style={{ fontSize: '0.85rem' }}>
                                <strong>Guidance:</strong> {q.sampleAnswerGuidance}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default History;
