import React, { useState, useEffect } from 'react';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [jobOffers, setJobOffers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetchStats();
    fetchJobOffers();
    fetchUsers();
  }, []);

  {/* Récupération des statistiques globales */}
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/admin/stats', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  {/* Récupération offres d'emploi */}
  const fetchJobOffers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/admin/job-offers', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setJobOffers(data);
      }
    } catch (error) {
      console.error('Error loading job offers:', error);
    } finally {
      setLoading(false);
    }
  };

  {/* Récupération utilisateurs */}
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/admin/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  {/* Activation/Désactivation offre */}
  const toggleJobOfferStatus = async (offerId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:3001/admin/job-offers/${offerId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ is_active: !currentStatus }),
        },
      );

      if (response.ok) {
        // Mettre à jour la liste des offres
        fetchJobOffers();
      }
    } catch (error) {
      console.error('Error updating job offer status:', error);
    }
  };

  {/* Changement de rôle utilisateur */}
  const updateUserRole = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:3001/admin/users/${userId}/role`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role: newRole }),
        },
      );

      if (response.ok) {
        // Mettre à jour la liste des utilisateurs
        fetchUsers();
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  {/* Formatage des labels */}
  const getJobTypeLabel = (type) => {
    const types = {
      internship: 'Internship',
      part_time: 'Part-time',
      full_time: 'Full-time',
      freelance: 'Freelance',
    };
    return types[type] || type;
  };

  const getRoleLabel = (role) => {
    const roles = {
      student: 'Student',
      employer: 'Employer',
      admin: 'Admin',
    };
    return roles[role] || role;
  };

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <div className="admin-dashboard-loading-center">
          <div className="admin-spinner"></div>
          <p className="admin-loading-text">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-container">
        {/* Header */}
        <div className="admin-header">
          <h1 className="admin-title">Admin Dashboard</h1>
          <p className="admin-subtitle">
            Manage job offers, users, and view platform statistics
          </p>
        </div>

        {/* Navigation tabs */}
        <div className="admin-tabs">
          <nav className="admin-tabs-nav">
            {/* Onglets de navigation */}
            <button
              onClick={() => setActiveTab('stats')}
              className={`admin-tab-btn${activeTab === 'stats' ? ' active' : ''}`}
            >
              Statistics
            </button>
            <button
              onClick={() => setActiveTab('job-offers')}
              className={`admin-tab-btn${activeTab === 'job-offers' ? ' active' : ''}`}
            >
              Job Offers
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`admin-tab-btn${activeTab === 'users' ? ' active' : ''}`}
            >
              Users
            </button>
          </nav>
        </div>

        {/* Content */}
        {/* Stats */}
        {activeTab === 'stats' && stats && (
          <div className="admin-stats-grid">
            {/* Cartes de statistiques */}
            <div className="admin-card">
              <div className="admin-card-icon admin-card-icon-blue">👥</div>
              <div className="admin-card-content">
                <div className="admin-card-label">Total Users</div>
                <div className="admin-card-value">{stats.total_users.count}</div>
              </div>
            </div>
            <div className="admin-card">
              <div className="admin-card-icon admin-card-icon-green">💼</div>
              <div className="admin-card-content">
                <div className="admin-card-label">Employers</div>
                <div className="admin-card-value">{stats.total_employers.count}</div>
              </div>
            </div>
            <div className="admin-card">
              <div className="admin-card-icon admin-card-icon-purple">🎓</div>
              <div className="admin-card-content">
                <div className="admin-card-label">Students</div>
                <div className="admin-card-value">{stats.total_students.count}</div>
              </div>
            </div>
            <div className="admin-card">
              <div className="admin-card-icon admin-card-icon-yellow">📋</div>
              <div className="admin-card-content">
                <div className="admin-card-label">Job Offers</div>
                <div className="admin-card-value">{stats.total_job_offers.count}</div>
              </div>
            </div>
            <div className="admin-card">
              <div className="admin-card-icon admin-card-icon-green">✅</div>
              <div className="admin-card-content">
                <div className="admin-card-label">Active Offers</div>
                <div className="admin-card-value">{stats.active_job_offers.count}</div>
              </div>
            </div>
            <div className="admin-card">
              <div className="admin-card-icon admin-card-icon-indigo">📝</div>
              <div className="admin-card-content">
                <div className="admin-card-label">Applications</div>
                <div className="admin-card-value">{stats.total_applications.count}</div>
              </div>
            </div>
            <div className="admin-card">
              <div className="admin-card-icon admin-card-icon-orange">⏳</div>
              <div className="admin-card-content">
                <div className="admin-card-label">Pending Apps</div>
                <div className="admin-card-value">{stats.pending_applications.count}</div>
              </div>
            </div>
          </div>
        )}

        {/* Gestion des offres */}
        {activeTab === 'job-offers' && (
          <div className="admin-section">
            <div className="admin-section-header">
              <h3 className="admin-section-title">Job Offers Management</h3>
              <p className="admin-section-desc">Manage all job offers on the platform</p>
            </div>
            <ul className="admin-list">
              
              {jobOffers.map((offer) => (
                <li key={offer.id} className="admin-list-item">
                  <div className="admin-list-main">
                    <div className="admin-list-title">{offer.title}</div>
                    <div className={`admin-badge${offer.is_active ? ' active' : ' inactive'}`}>{offer.is_active ? 'Active' : 'Inactive'}</div>
                  </div>
                  <div className="admin-list-details">
                    <span>{offer.company}</span>
                    <span>•</span>
                    <span>{offer.location}</span>
                    <span>•</span>
                    <span>{getJobTypeLabel(offer.job_type)}</span>
                    <span>•</span>
                    <span>{offer.applications_count} applications</span>
                  </div>
                  <div className="admin-list-meta">Posted by: {offer.employer_first_name} {offer.employer_last_name} ({offer.employer_email})</div>
                  <button
                    onClick={() => toggleJobOfferStatus(offer.id, offer.is_active)}
                    className={`admin-action-btn${offer.is_active ? ' deactivate' : ' activate'}`}
                  >
                    {offer.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Gestion utilisateurs */}
        {activeTab === 'users' && (
          <div className="admin-section">
            <div className="admin-section-header">
              <h3 className="admin-section-title">Users Management</h3>
              <p className="admin-section-desc">Manage user roles and permissions</p>
            </div>
            <ul className="admin-list">
            
              {users.map((user) => (
                <li key={user.id} className="admin-list-item">
                  <div className="admin-list-main">
                    <div className="admin-list-title">{user.first_name} {user.last_name}</div>
                    <div className={`admin-badge role-${user.role}`}>{getRoleLabel(user.role)}</div>
                  </div>
                  <div className="admin-list-details">
                    <span className="admin-list-email">{user.email}</span>
                    <span>•</span>
                    <span>Joined: {new Date(user.created_at).toLocaleDateString()}</span>
                  </div>
                  <select
                    value={user.role}
                    onChange={(e) => updateUserRole(user.id, e.target.value)}
                    className="admin-role-select"
                  >
                    <option value="student">Student</option>
                    <option value="employer">Employer</option>
                    <option value="admin">Admin</option>
                  </select>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
