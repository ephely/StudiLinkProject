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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Job offer not found</h2>
          <Link to="/offers" className="text-blue-600 hover:text-blue-800">
            Back to job offers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <Link to="/offers" className="hover:text-gray-700">
                Job Offers
              </Link>
            </li>
            <li>/</li>
            <li className="text-gray-900">{offer.title}</li>
          </ol>
        </nav>

        {/* Header de l'offre */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {offer.title}
              </h1>
              <p className="text-xl text-gray-600 mb-4">
                {offer.company}
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center">
                  <span className="text-gray-500 mr-2">📍</span>
                  <span>{offer.location}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-500 mr-2">💼</span>
                  <span>{getJobTypeLabel(offer.job_type)}</span>
                </div>
                {offer.duration && (
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-2">⏱️</span>
                    <span>{offer.duration}</span>
                  </div>
                )}
                {offer.remote_option && (
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-2">🏠</span>
                    <span>{getRemoteLabel(offer.remote_option)}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {formatSalary(offer.salary_min, offer.salary_max, offer.salary_currency)}
              </div>
              <div className="text-sm text-gray-500">
                Published on {new Date(offer.created_at).toLocaleDateString('en-US')}
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => setShowApplicationForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Apply Now
            </button>
            
            {offer.application_url && (
              <a
                href={offer.application_url}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-50 transition-colors font-medium"
              >
                Apply on Website
              </a>
            )}
          </div>
        </div>

        {/* Contenu détaillé */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Description principale */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Description</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{offer.description}</p>
              </div>
            </div>

            {offer.requirements && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Requirements</h2>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{offer.requirements}</p>
                </div>
              </div>
            )}

            {offer.benefits && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Benefits</h2>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{offer.benefits}</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Informations de contact */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact</h3>
              <div className="space-y-3">
                {offer.contact_email && (
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-2">📧</span>
                    <a href={`mailto:${offer.contact_email}`} className="text-blue-600 hover:text-blue-800">
                      {offer.contact_email}
                    </a>
                  </div>
                )}
                {offer.contact_phone && (
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-2">📞</span>
                    <a href={`tel:${offer.contact_phone}`} className="text-blue-600 hover:text-blue-800">
                      {offer.contact_phone}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Information</h3>
              <div className="flex flex-wrap gap-2">
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {getJobTypeLabel(offer.job_type)}
                </span>
                {offer.remote_option && (
                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                    {getRemoteLabel(offer.remote_option)}
                  </span>
                )}
                {offer.duration && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    {offer.duration}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal de candidature */}
        {showApplicationForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Apply to {offer.title}
                  </h2>
                  <button
                    onClick={() => setShowApplicationForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleApply} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cover Letter
                    </label>
                    <textarea
                      value={application.cover_letter}
                      onChange={(e) => setApplication(prev => ({ ...prev, cover_letter: e.target.value }))}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Introduce yourself and explain why you are interested in this position..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resume/CV Link
                    </label>
                    <input
                      type="url"
                      value={application.resume_url}
                      onChange={(e) => setApplication(prev => ({ ...prev, resume_url: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://..."
                    />
                    {userProfile?.cv_url && (
                      <p className="text-sm text-green-600 mt-1">
                        ✓ Your profile CV will be automatically included
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowApplicationForm(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={applying}
                      className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
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