import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function ApplicationView() {
  const { id } = useParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApplications();
  }, [id]);

  const fetchApplications = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/job-offers/${id}/applications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      } else {
        setError('Error loading applications');
      }
    } catch (e) {
      setError('Error loading applications');
    }
    setLoading(false);
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/applications/${appId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        setApplications((prev) =>
          prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
        );
      } else {
        alert('Error updating status');
      }
    } catch (e) {
      alert('Error updating status');
    }
  };

  if (loading) return <div className="loading-container">Loading...</div>;
  if (error) return <div className="empty-state">{error}</div>;

  return (
    <div className="offers-container">
      <div className="section-header">
        <h2 className="section-title">Applications for this Offer</h2>
        <Link to="/profile" className="view-offer-button">Back to Dashboard</Link>
      </div>
      {applications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3 className="empty-title">No Applications</h3>
        </div>
      ) : (
        <div className="offers-grid">
          {applications.map((app) => (
            <div key={app.id} className="offer-card">
              <div className="offer-header">
                <div className="offer-info">
                  <h3 className="offer-title">{app.first_name} {app.last_name}</h3>
                  <p className="offer-company">{app.email}</p>
                  <div className="offer-meta">
                    <span>📍 {app.location}</span>
                    <span>💼 {app.skills}</span>
                  </div>
                </div>
                <div className="offer-salary">
                  <div className="tag" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
                    {app.status}
                  </div>
                </div>
              </div>
              {app.cover_letter && (
                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Cover Letter:</h4>
                  <p className="offer-description line-clamp-3">{app.cover_letter}</p>
                </div>
              )}
              <div className="offer-footer">
                <button onClick={() => handleStatusChange(app.id, 'accepted')} className="edit-offer-button">Accept</button>
                <button onClick={() => handleStatusChange(app.id, 'rejected')} className="delete-account-button" style={{ marginLeft: '0.5rem' }}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 