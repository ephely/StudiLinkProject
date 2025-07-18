import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('token'),
  );
  const [userProfile, setUserProfile] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch('http://localhost:3001/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const user = await response.json();
        setUserProfile(user);
        setUserRole(user.role);
      } else {
        setUserProfile(null);
        setUserRole(null);
      }
    } catch {
      setUserProfile(null);
      setUserRole(null);
    }
  };

  useEffect(() => {
    const syncAuth = () => {
      const token = localStorage.getItem('token');
      setIsAuthenticated(!!token);
      if (token) {
        fetchUserProfile(token);
      } else {
        setUserProfile(null);
        setUserRole(null);
      }
    };
    syncAuth();
    window.addEventListener('storage', syncAuth);
    return () => window.removeEventListener('storage', syncAuth);
  }, []);

  const login = async (token) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
    await fetchUserProfile(token);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUserProfile(null);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, userProfile, userRole, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
