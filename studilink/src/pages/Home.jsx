import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [recentOffers, setRecentOffers] = useState([]);
  const [stats, setStats] = useState({
    totalOffers: 0,
    totalCompanies: 0,
    totalStudents: 0,
  });

  useEffect(() => {
    fetchRecentOffers();
    fetchStats();
  }, []);

  const fetchRecentOffers = async () => {
    try {
      const response = await fetch('http://localhost:3001/job-offers?limit=3');
      if (response.ok) {
        const data = await response.json();
        setRecentOffers(data.offers);
      }
    } catch (error) {
      console.error('Error loading recent offers:', error);
    }
  };

  const fetchStats = async () => {
    // Pour l'instant, on utilise des données fictives
    // Dans une vraie application, on ferait un appel API
    setStats({
      totalOffers: 5,
      totalCompanies: 5,
      totalStudents: 13,
    });
  };

  const getJobTypeLabel = (type) => {
    const types = {
      internship: 'Internship',
      part_time: 'Part-time',
      full_time: 'Full-time',
      freelance: 'Freelance',
    };
    return types[type] || type;
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <h1 className="hero-title">
            Find the student job of your dreams
          </h1>
          <p className="hero-subtitle">
            Internships, part-time, freelance... StudiLink connects students to
            the best professional opportunities.
          </p>
          <div className="hero-buttons">
            <Link to="/offers" className="hero-primary-button">
              View Jobs
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">{stats.totalOffers}+</div>
              <div className="stat-label">Job Offers</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{stats.totalCompanies}+</div>
              <div className="stat-label">Partner Companies</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{stats.totalStudents}+</div>
              <div className="stat-label">Active Students</div>
            </div>
          </div>
        </div>
      </section>

      {/* Offres récentes */}
      <section className="offers-section">
        <div className="offers-container">
          <div className="section-header">
            <h2 className="section-title">Recent Offers</h2>
            <p className="section-subtitle">
              Discover the latest opportunities posted by our partner companies
            </p>
          </div>

          <div className="offers-grid">
            {recentOffers.length > 0 ? (
              recentOffers.map((offer) => (
                <div key={offer.id} className="offer-card">
                  <div className="offer-header">
                    <div className="offer-info">
                      <h3 className="offer-title">{offer.title}</h3>
                      <p className="offer-company">{offer.company}</p>
                      <div className="offer-meta">
                        <span>📍 {offer.location}</span>
                        <span>💼 {getJobTypeLabel(offer.job_type)}</span>
                      </div>
                    </div>
                  </div>

                  <p className="offer-description line-clamp-3">
                    {offer.description}
                  </p>

                  <Link
                    to={`/offers/${offer.id}`}
                    className="view-offer-button"
                  >
                    View Job
                  </Link>
                </div>
              ))
            ) : (
              <p>No recent offers for the moment.</p>
            )}
          </div>

          <div className="text-center">
            <Link to="/offers" className="view-all-button">
              View All Jobs
            </Link>
          </div>
        </div>
      </section>

      {/* Fonctionnalités */}
      <section className="features-section">
        <div className="features-container">
          <div className="section-header">
            <h2 className="section-title">Why Choose StudiLink?</h2>
            <p className="section-subtitle">
              Our platform offers simple and effective tools to connect students
              and employers
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">🔍</div>
              <h3 className="feature-title">Easy Search</h3>
              <p className="feature-description">
                Quickly find offers that match your skills and location
              </p>
            </div>

            <div className="feature-item">
              <div className="feature-icon">📱</div>
              <h3 className="feature-title">Simple Application</h3>
              <p className="feature-description">
                Apply in just a few clicks with your CV and cover letter
              </p>
            </div>

            <div className="feature-item">
              <div className="feature-icon">💼</div>
              <h3 className="feature-title">Varied Opportunities</h3>
              <p className="feature-description">
                Internships, part-time, freelance... Find the format that suits
                you
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="cta-section">
        <div className="cta-container">
          <h2 className="cta-title">Ready to find your next student job?</h2>
          <p className="cta-subtitle">
            Join thousands of students who have already found their opportunity
            on StudiLink
          </p>
          <div className="cta-buttons">
            <Link to="/offers" className="hero-primary-button">
              Start Searching
            </Link>
            <Link to="/register" className="hero-secondary-button">
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
