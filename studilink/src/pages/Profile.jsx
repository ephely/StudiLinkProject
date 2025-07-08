import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    fetchProfile();
    fetchApplications();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Error loading profile');
      }

      const data = await response.json();
      setProfile(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/applications/student', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      pending: { label: 'Pending', color: '#f59e0b', bgColor: '#fef3c7' },
      accepted: { label: 'Accepted', color: '#059669', bgColor: '#d1fae5' },
      rejected: { label: 'Rejected', color: '#dc2626', bgColor: '#fee2e2' },
      withdrawn: { label: 'Withdrawn', color: '#6b7280', bgColor: '#f3f4f6' }
    };
    return statusMap[status] || statusMap.pending;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const downloadCV = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/profile/${userId}/cv`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download CV');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = profile.cv_filename || 'cv.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading CV:', error);
      alert('Error downloading CV');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="offers-container">
        <div className="empty-state">
          <div className="empty-icon">⚠️</div>
          <h3 className="empty-title">Erreur</h3>
          <p className="empty-description">{error}</p>
          <Link to="/login" className="view-offer-button">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="offers-container">
        <div className="empty-state">
          <div className="empty-icon">👤</div>
          <h3 className="empty-title">Profile Not Found</h3>
          <p className="empty-description">
            Unable to load your profile. Please sign in again.
          </p>
          <Link to="/login" className="view-offer-button">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="offers-container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="section-title">My Profile</h1>
          <p className="section-subtitle">
            Manage your personal information and track your applications
          </p>
        </div>

        {/* Tabs */}
        <div className="filters-section">
          <div className="filters-actions" style={{ justifyContent: 'flex-start', gap: '1rem' }}>
            <button
              onClick={() => setActiveTab('profile')}
              className={`pagination-button ${activeTab === 'profile' ? 'active' : ''}`}
              style={{ border: 'none', background: activeTab === 'profile' ? '#00c946' : '#f3f4f6' }}
            >
              Personal Information
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`pagination-button ${activeTab === 'applications' ? 'active' : ''}`}
              style={{ border: 'none', background: activeTab === 'applications' ? '#00c946' : '#f3f4f6' }}
            >
              My Applications ({applications.length})
            </button>
          </div>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="offers-grid" style={{ gridTemplateColumns: '1fr 2fr' }}>
            {/* Avatar et infos de base */}
            <div className="offer-card">
              <div className="text-center mb-6">
                {profile.avatar_url ? (
                  <img
                    src={`http://localhost:3001${profile.avatar_url}`}
                    alt="Avatar"
                    style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      margin: '0 auto 1rem'
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%',
                      backgroundColor: '#e5e7eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '3rem',
                      margin: '0 auto 1rem'
                    }}
                  >
                    👤
                  </div>
                )}
                <h2 className="offer-title">
                  {profile.first_name} {profile.last_name}
                </h2>
                <p className="offer-company">{profile.email}</p>
                {profile.role && (
                  <span className="tag tag-internship" style={{ marginTop: '0.5rem' }}>
                    {profile.role === 'employer' ? 'Employer' : 'Student'}
                  </span>
                )}
              </div>

              <div className="offer-meta" style={{ flexDirection: 'column', gap: '0.5rem' }}>
                {profile.location && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>📍</span>
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.skills && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>💼</span>
                    <span>{profile.skills}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bio et actions */}
            <div className="offer-card">
              <h3 className="offer-title mb-4">About Me</h3>
              {profile.bio ? (
                <p className="offer-description" style={{ whiteSpace: 'pre-wrap' }}>
                  {profile.bio}
                </p>
              ) : (
                <p className="offer-description" style={{ color: '#6b7280', fontStyle: 'italic' }}>
                  No bio provided
                </p>
              )}

              <div className="offer-footer" style={{ marginTop: '2rem' }}>
                <Link to="/profile/update" className="view-offer-button">
                  Edit Profile
                </Link>
              </div>

              {/* CV Section */}
              {profile.cv_url && (
                <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem', border: '1px solid #e5e7eb' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                    Resume/CV
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>📄</span>
                    <span style={{ fontSize: '0.875rem', color: '#374151' }}>
                      {profile.cv_filename || 'Resume'}
                    </span>
                  </div>
                  <button
                    onClick={() => downloadCV(profile.id)}
                    className="view-offer-button"
                    style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                  >
                    Download CV
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div>
            {applications.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📝</div>
                <h3 className="empty-title">No Applications</h3>
                <p className="empty-description">
                  You haven't applied to any job offers yet
                </p>
                <Link to="/offers" className="view-offer-button">
                  View Jobs
                </Link>
              </div>
            ) : (
              <div className="offers-grid">
                {applications.map((application) => {
                  const status = getStatusLabel(application.status);
                  return (
                    <div key={application.id} className="offer-card">
                      <div className="offer-header">
                        <div className="offer-info">
                          <h3 className="offer-title">{application.title}</h3>
                          <p className="offer-company">{application.company}</p>
                          <div className="offer-meta">
                            <span>📍 {application.location}</span>
                            <span>📅 {formatDate(application.applied_at)}</span>
                          </div>
                        </div>
                        
                        <div className="offer-salary">
                          <div
                            className="tag"
                            style={{
                              backgroundColor: status.bgColor,
                              color: status.color,
                              fontSize: '0.875rem',
                              padding: '0.5rem 1rem'
                            }}
                          >
                            {status.label}
                          </div>
                        </div>
                      </div>

                      {application.cover_letter && (
                        <div style={{ marginBottom: '1rem' }}>
                          <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                            Cover Letter:
                          </h4>
                          <p className="offer-description line-clamp-3">
                            {application.cover_letter}
                          </p>
                        </div>
                      )}

                      {application.employer_notes && (
                        <div style={{ 
                          marginBottom: '1rem', 
                          padding: '1rem', 
                          backgroundColor: '#f9fafb', 
                          borderRadius: '0.375rem',
                          border: '1px solid #e5e7eb'
                        }}>
                          <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                            Employer Notes:
                          </h4>
                          <p className="offer-description">
                            {application.employer_notes}
                          </p>
                        </div>
                      )}

                      <div className="offer-footer">
                        <Link to={`/offers/${application.job_offer_id}`} className="view-offer-button">
                          View Job
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
