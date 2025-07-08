import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    
    if (token) {
      // Récupérer les informations de l'utilisateur
      fetchUserProfile();
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const user = await response.json();
        setUserRole(user.role);
        setUserProfile(user);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUserRole(null);
    setUserProfile(null);
    navigate('/login');
  };

  return (
    <header>
      <div className="header-container">
        <div className="header-content">
          {/* Logo */}
          <Link to="/" className="logo">
            <h1>StudiLink</h1>
          </Link>

          {/* Navigation */}
          <nav className="nav-menu">
            <Link to="/">Home</Link>
            <Link to="/offers">Job Offers</Link>
            
            {isAuthenticated && userRole === 'employer' && (
              <Link to="/create-offer" className="publish-button">
                Post a Job
              </Link>
            )}
          </nav>

          {/* Actions utilisateur */}
          <div className="user-actions">
            {isAuthenticated ? (
              <>
                {userRole === 'admin' && (
                  <Link to="/admin" className="admin-button">
                    Admin Dashboard
                  </Link>
                )}
                <Link to="/profile" className="profile-button">
                  <div className="profile-avatar">
                    {userProfile?.avatar ? (
                      <img src={userProfile.avatar} alt="Avatar" />
                    ) : (
                      <div className="avatar-placeholder">
                        {userProfile?.firstName?.charAt(0) || userProfile?.email?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                  <span>My Profile</span>
                </Link>
                <button onClick={handleLogout} className="logout-button">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="login-button">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
