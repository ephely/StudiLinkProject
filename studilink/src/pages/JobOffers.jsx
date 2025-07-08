import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function JobOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    job_type: '',
    location: '',
    remote_option: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchOffers();
  }, [filters, pagination.page]);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...filters,
        page: pagination.page,
        limit: 10
      });
      
      const response = await fetch(`http://localhost:3001/job-offers?${params}`);
      const data = await response.json();
      
      setOffers(data.offers);
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total,
        pages: data.pagination.pages
      }));
    } catch (error) {
      console.error('Error loading offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
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
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="offers-container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="section-title">Student Job Offers</h1>
          <p className="section-subtitle">
            Find the student job that suits you among {pagination.total} available offers
          </p>
        </div>

        {/* Filtres */}
        <div className="filters-section">
          <form onSubmit={handleSearch} className="filters-form">
            <div className="filters-grid">
              {/* Recherche */}
              <div className="filter-group">
                <label className="filter-label">Search</label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Title, company, description..."
                  className="filter-input"
                />
              </div>

              {/* Type de job */}
              <div className="filter-group">
                <label className="filter-label">Contract Type</label>
                <select
                  value={filters.job_type}
                  onChange={(e) => handleFilterChange('job_type', e.target.value)}
                  className="filter-select"
                >
                  <option value="">All types</option>
                  <option value="internship">Internship</option>
                  <option value="part_time">Part-time</option>
                  <option value="full_time">Full-time</option>
                  <option value="freelance">Freelance</option>
                </select>
              </div>

              {/* Localisation */}
              <div className="filter-group">
                <label className="filter-label">Location</label>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  placeholder="City, region..."
                  className="filter-input"
                />
              </div>

              {/* Remote */}
              <div className="filter-group">
                <label className="filter-label">Work Mode</label>
                <select
                  value={filters.remote_option}
                  onChange={(e) => handleFilterChange('remote_option', e.target.value)}
                  className="filter-select"
                >
                  <option value="">All modes</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="on_site">On-site</option>
                </select>
              </div>
            </div>

            <div className="filters-actions">
              <button type="submit" className="search-button">
                Search
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setFilters({
                    job_type: '',
                    location: '',
                    remote_option: '',
                    search: ''
                  });
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="reset-button"
              >
                Reset Filters
              </button>
            </div>
          </form>
        </div>

        {/* Résultats */}
        <div>
          {offers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3 className="empty-title">No offers found</h3>
              <p className="empty-description">
                Try modifying your search criteria
              </p>
            </div>
          ) : (
            <>
              <div className="offers-grid">
                {offers.map((offer) => (
                  <div key={offer.id} className="offer-card">
                    <div className="offer-header">
                      <div className="offer-info">
                        <h3 className="offer-title">{offer.title}</h3>
                        <p className="offer-company">{offer.company}</p>
                        <div className="offer-meta">
                          <span>📍 {offer.location}</span>
                          <span>💼 {getJobTypeLabel(offer.job_type)}</span>
                          {offer.duration && (
                            <span>⏱️ {offer.duration}</span>
                          )}
                          {offer.remote_option && (
                            <span>🏠 {getRemoteLabel(offer.remote_option)}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="offer-salary">
                        <div className="salary-amount">
                          {formatSalary(offer.salary_min, offer.salary_max, offer.salary_currency)}
                        </div>
                        <div className="offer-date">
                          Publié le {new Date(offer.created_at).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>

                    <p className="offer-description line-clamp-3">
                      {offer.description}
                    </p>

                    <div className="offer-footer">
                      <div className="offer-tags">
                        {offer.job_type === 'internship' && (
                          <span className="tag tag-internship">Stage</span>
                        )}
                        {offer.job_type === 'part_time' && (
                          <span className="tag tag-part-time">Temps partiel</span>
                        )}
                        {offer.remote_option === 'remote' && (
                          <span className="tag tag-remote">Télétravail</span>
                        )}
                      </div>

                      <Link to={`/offers/${offer.id}`} className="view-offer-button">
                        Voir l'offre
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="pagination">
                  <nav className="pagination-nav">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                      disabled={pagination.page === 1}
                      className="pagination-button"
                    >
                      Précédent
                    </button>
                    
                    {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setPagination(prev => ({ ...prev, page }))}
                          className={`pagination-button ${page === pagination.page ? 'active' : ''}`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.pages, prev.page + 1) }))}
                      disabled={pagination.page === pagination.pages}
                      className="pagination-button"
                    >
                      Suivant
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
