// src/components/ProtectedRoute.jsx - Updated to fix white screen
import React, { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin';

const ProtectedRoute = ({ children, onNotAuthenticated, onBackToPublic }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    const token = localStorage.getItem('adminToken');
    const savedUser = localStorage.getItem('adminUser');

    if (!token || !savedUser) {
      setLoading(false);
      return;
    }

    try {
      // Verify token with backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setAuthenticated(true);
      } else {
        // Token invalid, clear storage
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
      // On error, clear storage
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-layout">
        <div className="admin-loading">
          <div className="spinner"></div>
          <p className="admin-loading-text">กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    // ✅ แก้ตรงนี้: แทนที่จะ return null ให้แสดง AdminLogin
    return (
      <AdminLogin 
        onLogin={(user) => {
          setUser(user);
          setAuthenticated(true);
          if (onNotAuthenticated) {
            onNotAuthenticated();
          }
        }}
        onBackToPublic={onBackToPublic || (() => window.location.href = '/')}
      />
    );
  }

  // Clone children and pass user data
  return React.cloneElement(children, { user });
};

export default ProtectedRoute;