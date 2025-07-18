import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

export default function JobOfferDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [application, setApplication] = useState({
    cover_letter: '',
    resume_url: ''
  });
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    fetchOffer();
    fetchUserProfile();
  }, [id]);

  const fetchOffer = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/job-offers/${id}`);
      if (!response.ok) {
        throw new Error('Job offer not found');
      }
      const data = await response.json();
      setOffer(data);
    } catch (error) {
      console.error('Error loading job offer:', error);
      navigate('/offers');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:3001/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const profile = await response.json();
        setUserProfile(profile);
        // Utiliser automatiquement le CV du profil s'il existe
        if (profile.cv_url) {
          setApplication(prev => ({
            ...prev,
            resume_url: `http://localhost:3001${profile.cv_url}`
          }));
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setApplying(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in to apply');
        navigate('/login');
        return;
      }

      const response = await fetch(`http://localhost:3001/job-offers/${id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(application)
      });

      if (response.ok) {
        alert('Application sent successfully!');
        setShowApplicationForm(false);
        setApplication({ cover_letter: '', resume_url: '' });
      } else {
        const error = await response.json();
        alert(error.error || 'Error sending application');
      }
    } catch (error) {
      console.error('Error applying:', error);
      alert('Error sending application');
    } finally {
      setApplying(false);
    }
  };

  const formatSalary = (min, max, currency) => {
    if (!min && !max) return 'Salary not specified';
    if (min && max) return `${min} - ${max} ${currency}`;
    if (min) return `From ${min} ${currency}`;
    if (max) return `Up to ${max} ${currency}`;
  };

  const getJobTypeLabel = (type) => {
    const types = {
      internship: 'Internship',
      part_time: 'Part-time',
      full_time: 'Full-time',
      freelance: 'Freelance'
    };
    return types[type] || type;
  };

  const getRemoteLabel = (option) => {
    const options = {
      remote: 'Remote',
      hybrid: 'Hybrid',
      on_site: 'On-site'
    };
    return options[option] || option;
  };

  if (loading) {
    return (
      <div className="job-detail-loading">
        <div className="job-detail-spinner"></div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="job-detail-error">
        <div className="job-detail-error-content">
          <h2 className="job-detail-error-title">Job offer not found</h2>
          <Link to="/offers" className="job-detail-error-link">
            Back to job offers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="job-detail">
      <div className="job-detail-container">

        {/* Header de l'offre */}
        <div className="job-detail-header">
          <div className="job-detail-header-main">
            <div className="job-detail-header-info">
              <h1 className="job-detail-title">
                {offer.title}
              </h1>
              <p className="job-detail-company">
                {offer.company}
              </p>
              
              <div className="job-detail-meta">
                <div className="job-detail-meta-item">
                  <span className="job-detail-meta-icon">📍</span>
                  <span>{offer.location}</span>
                </div>
                <div className="job-detail-meta-item">
                  <span className="job-detail-meta-icon">💼</span>
                  <span>{getJobTypeLabel(offer.job_type)}</span>
                </div>
                {offer.duration && (
                  <div className="job-detail-meta-item">
                    <span className="job-detail-meta-icon">⏱️</span>
                    <span>{offer.duration}</span>
                  </div>
                )}
                {offer.remote_option && (
                  <div className="job-detail-meta-item">
                    <span className="job-detail-meta-icon">🏠</span>
                    <span>{getRemoteLabel(offer.remote_option)}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="job-detail-salary">
              <div className="job-detail-salary-amount">
                {formatSalary(offer.salary_min, offer.salary_max, offer.salary_currency)}
              </div>
              <div className="job-detail-salary-date">
                Published on {new Date(offer.created_at).toLocaleDateString('fr-FR')}
              </div>
            </div>
          </div>

          <div className="job-detail-actions">
            <button
              onClick={() => setShowApplicationForm(true)}
              className="job-detail-apply-btn"
            >
              Apply Now
            </button>
            
            {offer.application_url && (
              <a
                href={offer.application_url}
                target="_blank"
                rel="noopener noreferrer"
                className="job-detail-external-btn"
              >
                Apply on Website
              </a>
            )}
          </div>
        </div>

        {/* Contenu détaillé */}
        <div className="job-detail-content">
          <div className="job-detail-main">
            <div className="job-detail-section">
              <h2 className="job-detail-section-title">Job Description</h2>
              <div className="job-detail-section-content">
                <p className="job-detail-description">{offer.description}</p>
              </div>
            </div>

            {offer.requirements && (
              <div className="job-detail-section">
                <h2 className="job-detail-section-title">Requirements</h2>
                <div className="job-detail-section-content">
                  <p className="job-detail-description">{offer.requirements}</p>
                </div>
              </div>
            )}

            {offer.benefits && (
              <div className="job-detail-section">
                <h2 className="job-detail-section-title">Benefits</h2>
                <div className="job-detail-section-content">
                  <p className="job-detail-description">{offer.benefits}</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="job-detail-sidebar">
            {/* Informations de contact */}
            <div className="job-detail-sidebar-card">
              <h3 className="job-detail-sidebar-title">Contact</h3>
              <div className="job-detail-contact">
                {offer.contact_email && (
                  <div className="job-detail-contact-item">
                    <span className="job-detail-contact-icon">📧</span>
                    <a href={`mailto:${offer.contact_email}`} className="job-detail-contact-link">
                      {offer.contact_email}
                    </a>
                  </div>
                )}
                {offer.contact_phone && (
                  <div className="job-detail-contact-item">
                    <span className="job-detail-contact-icon">📞</span>
                    <a href={`tel:${offer.contact_phone}`} className="job-detail-contact-link">
                      {offer.contact_phone}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="job-detail-sidebar-card">
              <h3 className="job-detail-sidebar-title">Information</h3>
              <div className="job-detail-tags">
                <span className="job-detail-tag job-detail-tag-blue">
                  {getJobTypeLabel(offer.job_type)}
                </span>
                {offer.remote_option && (
                  <span className="job-detail-tag job-detail-tag-purple">
                    {getRemoteLabel(offer.remote_option)}
                  </span>
                )}
                {offer.duration && (
                  <span className="job-detail-tag job-detail-tag-green">
                    {offer.duration}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal candidature */}
        {showApplicationForm && (
          <div className="job-detail-modal-overlay">
            <div className="job-detail-modal">
              <div className="job-detail-modal-content">
                <div className="job-detail-modal-header">
                  <h2 className="job-detail-modal-title">
                    Apply to {offer.title}
                  </h2>
                  <button
                    onClick={() => setShowApplicationForm(false)}
                    className="job-detail-modal-close"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleApply} className="job-detail-form">
                  <div className="job-detail-form-group">
                    <label className="job-detail-form-label">
                      Cover Letter
                    </label>
                    <textarea
                      value={application.cover_letter}
                      onChange={(e) => setApplication(prev => ({ ...prev, cover_letter: e.target.value }))}
                      rows={6}
                      className="job-detail-form-textarea"
                      placeholder="Introduce yourself and explain why you are interested in this position..."
                      required
                    />
                  </div>

                  <div className="job-detail-form-group">
                    <label className="job-detail-form-label">
                      Resume/CV Link
                    </label>
                    <input
                      type="url"
                      value={application.resume_url}
                      onChange={(e) => setApplication(prev => ({ ...prev, resume_url: e.target.value }))}
                      className="job-detail-form-input"
                      placeholder="https://..."
                    />
                    {userProfile?.cv_url && (
                      <p className="job-detail-form-help">
                        ✓ Your profile CV will be automatically included
                      </p>
                    )}
                  </div>

                  <div className="job-detail-form-actions">
                    <button
                      type="button"
                      onClick={() => setShowApplicationForm(false)}
                      className="job-detail-form-cancel"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={applying}
                      className="job-detail-form-submit"
                    >
                      {applying ? 'Sending...' : 'Send Application'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 