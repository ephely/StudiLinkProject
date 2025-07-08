import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function UpdateProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    location: '',
    skills: '',
    bio: '',
    avatar: null,
    cv: null
  });

  useEffect(() => {
    fetchProfile();
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
      setFormData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        location: data.location || '',
        skills: data.skills || '',
        bio: data.bio || '',
        avatar: null
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fieldName = e.target.name;
      setFormData(prev => ({
        ...prev,
        [fieldName]: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      // Ajouter les champs texte
      Object.keys(formData).forEach(key => {
        if (key !== 'avatar' && formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Ajouter l'avatar s'il y en a un nouveau
      if (formData.avatar) {
        formDataToSend.append('avatar', formData.avatar);
      }

      // Ajouter le CV s'il y en a un nouveau
      if (formData.cv) {
        formDataToSend.append('cv', formData.cv);
      }

      const response = await fetch('http://localhost:3001/profile/update', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Error updating profile');
      }

      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="offers-container">
        <div className="empty-state">
          <div className="empty-icon">⚠️</div>
          <h3 className="empty-title">Error</h3>
          <p className="empty-description">Unable to load your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="offers-container">
      {/* Header */}
              <div className="mb-8">
          <h1 className="section-title">Edit My Profile</h1>
          <p className="section-subtitle">
            Update your personal information
          </p>
        </div>

      {/* Messages d'erreur et de succès */}
      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          border: '1px solid #fecaca',
          color: '#dc2626',
          padding: '1rem',
          borderRadius: '0.375rem',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          backgroundColor: '#d1fae5',
          border: '1px solid #a7f3d0',
          color: '#059669',
          padding: '1rem',
          borderRadius: '0.375rem',
          marginBottom: '1rem'
        }}>
          {success}
        </div>
      )}

      {/* Formulaire */}
      <div className="offer-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit}>
          {/* Avatar */}
          <div className="mb-6">
            <label className="form-label">Profile Photo</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
              {profile.avatar_url ? (
                <img
                  src={`http://localhost:3001${profile.avatar_url}`}
                  alt="Current Avatar"
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    backgroundColor: '#e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem'
                  }}
                >
                  👤
                </div>
              )}
              <input
                type="file"
                name="avatar"
                accept="image/*"
                onChange={handleFileChange}
                className="form-input"
                style={{ flex: 1 }}
              />
            </div>
          </div>

          {/* CV Upload */}
          <div className="mb-6">
            <label className="form-label">Resume/CV</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
              {profile.cv_url ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>📄</span>
                  <span style={{ fontSize: '0.875rem', color: '#374151' }}>
                    {profile.cv_filename || 'Current CV'}
                  </span>
                </div>
              ) : (
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '0.375rem',
                    backgroundColor: '#e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem'
                  }}
                >
                  📄
                </div>
              )}
              <input
                type="file"
                name="cv"
                accept=".pdf,image/*"
                onChange={handleFileChange}
                className="form-input"
                style={{ flex: 1 }}
              />
            </div>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
              Accepted formats: PDF, JPG, PNG (max 5MB)
            </p>
          </div>

          {/* Informations personnelles */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label className="form-label">First Name *</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="form-label">Last Name *</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="form-input"
              placeholder="City, Country"
            />
          </div>

          <div className="mb-4">
            <label className="form-label">Skills</label>
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleInputChange}
              className="form-input"
              placeholder="JavaScript, React, Node.js, etc."
            />
          </div>

          <div className="mb-6">
            <label className="form-label">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              className="form-input"
              rows="4"
              placeholder="Tell us about yourself, your experience, your goals..."
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="reset-button"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="search-button"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdateProfile; 