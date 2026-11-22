import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { authFetch } = useAuth();

  const [reportData, setReportData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsageReport = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await authFetch('/api/admin/usage-report');
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || 'Failed to fetch usage report');
      }

      setReportData(json.data || []);
      setSummary(json.summary || null);
    } catch (err) {
      setError(err.message || 'Error loading administrative usage report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsageReport();
  }, []);

  const filteredUsers = reportData.filter((user) => {
    const term = searchTerm.toLowerCase();
    return (
      (user.name && user.name.toLowerCase().includes(term)) ||
      (user.email && user.email.toLowerCase().includes(term)) ||
      (user.role && user.role.toLowerCase().includes(term))
    );
  });

  return (
    <div>
      <div className="card-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2>System Usage & AI Consumption Analytics</h2>
          <p className="card-subtitle">
            Aggregation report showing AI usage breakdown across all registered platform users.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={fetchUsageReport}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : '🔄 Refresh Report'}
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Analytics Summary Stats */}
      {summary && (
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-title">Active Users</span>
            <span className="stat-value">{summary.activeUsersCount}</span>
          </div>

          <div className="stat-card">
            <span className="stat-title">Total Generations</span>
            <span className="stat-value">{summary.totalGenerations}</span>
          </div>

          <div className="stat-card">
            <span className="stat-title">Resumes Generated</span>
            <span className="stat-value">{summary.totalResumes}</span>
          </div>

          <div className="stat-card">
            <span className="stat-title">Interviews Generated</span>
            <span className="stat-value">{summary.totalInterviews}</span>
          </div>
        </div>
      )}

      {/* Data Table Card */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Per-User Consumption Aggregation</h3>
            <p className="card-subtitle">
              Calculated via MongoDB <code>$group</code>, <code>$lookup</code>, and <code>$sort</code> pipeline.
            </p>
          </div>
          <div>
            <input
              type="text"
              className="form-control"
              placeholder="Filter by name, email, role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ minWidth: '260px', padding: '0.45rem 0.8rem', fontSize: '0.875rem' }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div className="spinner spinner-dark" style={{ width: '2rem', height: '2rem' }}></div>
            <p style={{ marginTop: '0.75rem', color: 'var(--text-muted)' }}>Running aggregation pipeline on database...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
            No user generation activity recorded yet.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Role</th>
                  <th>Total Gens</th>
                  <th>Resumes</th>
                  <th>Interviews</th>
                  <th>Last Generated</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((item) => {
                  const lastGen = item.lastGeneratedAt
                    ? new Date(item.lastGeneratedAt).toLocaleString(undefined, {
                        dateStyle: 'short',
                        timeStyle: 'short'
                      })
                    : 'N/A';

                  return (
                    <tr key={item.userId}>
                      <td>
                        <strong>{item.name}</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.email}</div>
                      </td>
                      <td>
                        <span
                          className={`output-badge ${item.role === 'admin' ? 'interview' : 'resume'}`}
                          style={{ fontSize: '0.725rem' }}
                        >
                          {item.role}
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--primary)' }}>{item.totalGenerations}</strong>
                      </td>
                      <td>{item.resumeCount}</td>
                      <td>{item.interviewCount}</td>
                      <td style={{ fontSize: '0.825rem', color: 'var(--text-sub)' }}>{lastGen}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
