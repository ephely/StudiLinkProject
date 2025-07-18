import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreateJobOffer() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company: '',
    location: '',
    job_type: 'internship',
    duration: '',
    salary_min: '',
    salary_max: '',
    salary_currency: 'EUR',
    remote_option: 'on_site',
    requirements: '',
    benefits: '',
    contact_email: '',
    contact_phone: '',
    application_url: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in to post a job offer');
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:3001/job-offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Job offer published successfully!');
        navigate('/offers');
      } else {
        const error = await response.json();
        alert(error.error || 'Error publishing the offer');
      }
    } catch (error) {
      console.error('Error publishing:', error);
      alert('Error publishing the offer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-job">
      <div className="create-job-container">
        {/* Header */}
        <div className="create-job-header">
          <h1 className="create-job-title">
            Post a Job Offer
          </h1>
          <p className="create-job-subtitle">
            Create a job offer to attract the best students
          </p>
        </div>

        {/* Formulaire */}
        <div className="create-job-form-container">
          <form onSubmit={handleSubmit} className="create-job-form">
            {/* Informations de base */}
            <div className="create-job-section">
              <h2 className="create-job-section-title">Basic Information</h2>
              <div className="create-job-grid">
                <div className="create-job-field">
                  <label className="create-job-label">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="create-job-input"
                    placeholder="ex: Full Stack Web Developer"
                  />
                </div>

                <div className="create-job-field">
                  <label className="create-job-label">
                    Company *
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    required
                    className="create-job-input"
                    placeholder="ex: My Startup"
                  />
                </div>

                <div className="create-job-field">
                  <label className="create-job-label">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="create-job-input"
                    placeholder="ex: Paris, France"
                  />
                </div>

                <div className="create-job-field">
                  <label className="create-job-label">
                    Contract Type *
                  </label>
                  <select
                    name="job_type"
                    value={formData.job_type}
                    onChange={handleChange}
                    required
                    className="create-job-input"
                  >
                    <option value="internship">Internship</option>
                    <option value="part_time">Part-time</option>
                    <option value="full_time">Full-time</option>
                    <option value="freelance">Freelance</option>
                  </select>
                </div>

                <div className="create-job-field">
                  <label className="create-job-label">
                    Duration
                  </label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className="create-job-input"
                    placeholder="ex: 6 months, 1 year"
                  />
                </div>

                <div className="create-job-field">
                  <label className="create-job-label">
                    Work Mode
                  </label>
                  <select
                    name="remote_option"
                    value={formData.remote_option}
                    onChange={handleChange}
                    className="create-job-input"
                  >
                    <option value="on_site">On-site</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Rémunération */}
            <div className="create-job-section">
              <h2 className="create-job-section-title">Compensation</h2>
              <div className="create-job-grid create-job-grid-3">
                <div className="create-job-field">
                  <label className="create-job-label">
                    Minimum Salary
                  </label>
                  <input
                    type="number"
                    name="salary_min"
                    value={formData.salary_min}
                    onChange={handleChange}
                    className="create-job-input"
                    placeholder="ex: 1500"
                  />
                </div>

                <div className="create-job-field">
                  <label className="create-job-label">
                    Maximum Salary
                  </label>
                  <input
                    type="number"
                    name="salary_max"
                    value={formData.salary_max}
                    onChange={handleChange}
                    className="create-job-input"
                    placeholder="ex: 2500"
                  />
                </div>

                <div className="create-job-field">
                  <label className="create-job-label">
                    Currency
                  </label>
                  <select
                    name="salary_currency"
                    value={formData.salary_currency}
                    onChange={handleChange}
                    className="create-job-input"
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="create-job-section">
              <h2 className="create-job-section-title">Job Description</h2>
              <div className="create-job-field">
                <label className="create-job-label">
                  Detailed Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="create-job-textarea"
                  placeholder="Describe in detail the position, main missions, work environment..."
                />
              </div>
            </div>

            {/* Profil recherché */}
            <div className="create-job-section">
              <h2 className="create-job-section-title">Required Profile</h2>
              <div className="create-job-field">
                <label className="create-job-label">
                  Skills and Experience Required
                </label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  rows={4}
                  className="create-job-textarea"
                  placeholder="List technical skills, languages, desired experience..."
                />
              </div>
            </div>

            {/* Avantages */}
            <div className="create-job-section">
              <h2 className="create-job-section-title">Benefits</h2>
              <div className="create-job-field">
                <label className="create-job-label">
                  Benefits and Perks
                </label>
                <textarea
                  name="benefits"
                  value={formData.benefits}
                  onChange={handleChange}
                  rows={4}
                  className="create-job-textarea"
                  placeholder="Social benefits, training, career development, work environment..."
                />
              </div>
            </div>

            {/* Contact */}
            <div className="create-job-section">
              <h2 className="create-job-section-title">Contact Information</h2>
              <div className="create-job-grid">
                <div className="create-job-field">
                  <label className="create-job-label">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    name="contact_email"
                    value={formData.contact_email}
                    onChange={handleChange}
                    className="create-job-input"
                    placeholder="contact@company.com"
                  />
                </div>

                <div className="create-job-field">
                  <label className="create-job-label">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    name="contact_phone"
                    value={formData.contact_phone}
                    onChange={handleChange}
                    className="create-job-input"
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>

                <div className="create-job-field create-job-field-full">
                  <label className="create-job-label">
                    External Application Link (optional)
                  </label>
                  <input
                    type="url"
                    name="application_url"
                    value={formData.application_url}
                    onChange={handleChange}
                    className="create-job-input"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="create-job-actions">
              <button
                type="button"
                onClick={() => navigate('/offers')}
                className="create-job-cancel-btn"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="create-job-submit-btn"
              >
                {loading ? 'Publishing...' : 'Publish Offer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 