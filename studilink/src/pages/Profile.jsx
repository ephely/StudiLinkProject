import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [employerOffers, setEmployerOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    fetchProfile();
    fetchApplications();
    fetchEmployerOffers();
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

  {/* Récupération candidatures de l'utilisateur (student) */}
  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        'http://localhost:3001/applications/student',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  };

  {/* Récupération offres créées par l'employeur connecté */}
  const fetchEmployerOffers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/job-offers?mine=1', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setEmployerOffers(data.offers || []);
      }
    } catch (error) {
      // ignore
    }
  };

  {/* Formatage du statut et de la date */}
  const getStatusLabel = (status) => {
    const statusMap = {
      pending: { label: 'Pending', color: '#f59e0b', bgColor: '#fef3c7' },
      accepted: { label: 'Accepted', color: '#059669', bgColor: '#d1fae5' },
      rejected: { label: 'Rejected', color: '#dc2626', bgColor: '#fee2e2' },
      withdrawn: { label: 'Withdrawn', color: '#6b7280', bgColor: '#f3f4f6' },
    };
    return statusMap[status] || statusMap.pending;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  {/* Téléchargement du CV */}
  const downloadCV = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:3001/profile/${userId}/cv`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

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

  {/* Suppression du compte utilisateur */}
  const deleteAccount = async () => {
    if (
      !window.confirm(
        'Are you sure you want to delete your account? This action cannot be undone.',
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/profile/delete', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        localStorage.removeItem('token');
        window.location.href = '/';
      } else {
        const data = await response.json();
        alert(data.error || 'Error deleting account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Error deleting account');
    }
  };

  {/* Suppression d'une offre d'emploi */}
  const handleDeleteOffer = async (offerId) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:3001/job-offers/${offerId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.ok) {
        setEmployerOffers((prev) => prev.filter((o) => o.id !== offerId));
      } else {
        alert('Error deleting offer');
      }
    } catch (e) {
      alert('Error deleting offer');
    }
  };

  const handleEditOffer = (offerId) => {
    window.location.href = `/offers/${offerId}/edit`;
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
          <div
            className="filters-actions profile-filters-actions"
          >
            <button
              onClick={() => setActiveTab('profile')}
              className={`pagination-button ${
                activeTab === 'profile' ? 'active' : ''
              } profile-tab-btn`}
            >
              Personal Information
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`pagination-button ${
                activeTab === 'applications' ? 'active' : ''
              } applications-tab-btn`}
            >
              {profile.role === 'employer'
                ? 'Offers Dashboard'
                : `My Applications (${applications.length})`}
            </button>
          </div>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div
            className="offers-grid profile-grid"
          >
            {/* Avatar et infos de base */}
            <div className="offer-card">
              <div className="text-center mb-6">
                {profile.avatar_url ? (
                  <img
                    src={`http://localhost:3001${profile.avatar_url}`}
                    alt="Avatar"
                    className="profile-avatar-img"
                  />
                ) : (
                  <div className="profile-avatar-placeholder">👤</div>
                )}
                <h2 className="offer-title">
                  {profile.first_name} {profile.last_name}
                </h2>
                <p className="offer-company">{profile.email}</p>
                {profile.role && (
                  <span
                    className="tag tag-internship profile-role-tag"
                  >
                    {profile.role === 'employer' ? 'Employer' : 'Student'}
                  </span>
                )}
              </div>

              <div className="offer-meta profile-meta">
                {profile.location && (
                  <div className="profile-meta-item">
                    <span>📍</span>
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.skills && (
                  <div className="profile-meta-item">
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
                <p className="offer-description profile-bio">{profile.bio}</p>
              ) : (
                <p className="offer-description profile-bio-empty">
                  No bio provided
                </p>
              )}

              <div className="offer-footer profile-offer-footer">
                <Link to="/profile/update" className="view-offer-button">
                  Edit Profile
                </Link>
                <button
                  onClick={deleteAccount}
                  className="delete-account-button"
                >
                  Delete Account
                </button>
              </div>

              {/* CV Section */}
              {profile.cv_url && (
                <div className="profile-cv-section">
                  <h4 className="profile-cv-title">Resume/CV</h4>
                  <div className="profile-cv-meta">
                    <span className="profile-cv-icon">📄</span>
                    <span className="profile-cv-filename">
                      {profile.cv_filename || 'Resume'}
                    </span>
                  </div>
                  <button
                    onClick={() => downloadCV(profile.id)}
                    className="view-offer-button profile-cv-download"
                  >
                    Download CV
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' &&
          (profile.role === 'employer' ? (
            <div>
              <div className="section-header">
                <h3 className="section-title">Your Job Offers</h3>
                <Link
                  to="/create-offer"
                  className="view-offer-button profile-create-offer-btn"
                >
                  Post a Job
                </Link>
              </div>
              {employerOffers.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🗂️</div>
                  <h3 className="empty-title">No job offers yet</h3>
                  <p className="empty-description">
                    You haven't posted any job offers yet.
                  </p>
                </div>
              ) : (
                <div className="offers-grid">
                  {employerOffers.map((offer) => (
                    <div key={offer.id} className="offer-card">
                      <div className="offer-header">
                        <div className="offer-info">
                          <h3 className="offer-title">{offer.title}</h3>
                          <p className="offer-company">{offer.company}</p>
                          <div className="offer-meta">
                            <span>📍 {offer.location}</span>
                            <span>💼 {offer.job_type}</span>
                          </div>
                        </div>
                      </div>
                      <div className="offer-footer profile-offer-footer">
                        <Link
                          to={`/offers/${offer.id}/applications`}
                          className="view-offer-button"
                        >
                          View Applications
                        </Link>
                        <Link
                          to={`/offers/${offer.id}`}
                          className="view-offer-button"
                        >
                          View Offer
                        </Link>
                        <button
                          onClick={() => handleEditOffer(offer.id)}
                          className="edit-offer-button"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteOffer(offer.id)}
                          className="delete-account-button"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
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
                            <p className="offer-company">
                              {application.company}
                            </p>
                            <div className="offer-meta">
                              <span>📍 {application.location}</span>
                              <span>
                                📅 {formatDate(application.applied_at)}
                              </span>
                            </div>
                          </div>

                          <div className="offer-salary">
                            <div
                              className="tag application-status-tag"
                              style={{
                                backgroundColor: status.bgColor,
                                color: status.color,
                              }}
                            >
                              {status.label}
                            </div>
                          </div>
                        </div>

                        {application.cover_letter && (
                          <div className="application-cover-letter">
                            <h4 className="application-cover-title">
                              Cover Letter:
                            </h4>
                            <p className="offer-description line-clamp-3">
                              {application.cover_letter}
                            </p>
                          </div>
                        )}

                        {application.employer_notes && (
                          <div className="application-employer-notes">
                            <h4 className="application-notes-title">
                              Employer Notes:
                            </h4>
                            <p className="offer-description">
                              {application.employer_notes}
                            </p>
                          </div>
                        )}

                        <div className="offer-footer profile-offer-footer">
                          <Link
                            to={`/offers/${application.job_offer_id}`}
                            className="view-offer-button"
                          >
                            View Job
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}

export default Profile;
