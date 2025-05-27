// src/pages/AdminSystem.jsx - Complete Admin System
import React, { useState } from 'react';

// Import Admin Components ที่เราทำไว้แล้ว
import AdminLogin from '../components/AdminLogin';
import AdminDashboard from '../components/AdminDashboard';
import AlumniManagement from '../components/AlumniManagement';
import AlumniDetail from '../components/AlumniDetail';
import ProtectedRoute from '../components/ProtectedRoute';

const AdminSystem = ({ currentPage, adminUser, onLogin, onLogout, navigate }) => {
  const [selectedAlumniId, setSelectedAlumniId] = useState(null);

  // Admin Functions
  const handleViewAlumniDetail = (alumni) => {
    setSelectedAlumniId(alumni._id);
  };

  const handleCloseAlumniDetail = () => {
    setSelectedAlumniId(null);
  };

  const handleAlumniUpdate = () => {
    // Refresh callback - สำหรับอัปเดตข้อมูลหลังแก้ไข
    console.log('Alumni data updated');
  };

  const handleBackToPublic = () => {
    // Navigate back to public pages
    if (navigate) {
      navigate('home');
    } else {
      window.location.href = '/';
    }
  };

  // Render different admin pages based on currentPage
  const renderAdminPage = () => {
    switch (currentPage) {
      case 'admin-login':
        return (
          <AdminLogin 
            onLogin={onLogin}
            onBackToPublic={handleBackToPublic}
          />
        );

      case 'admin-dashboard':
        return (
          <ProtectedRoute onNotAuthenticated={() => onLogin(null)}>
            <AdminDashboard 
              user={adminUser}
              onLogout={onLogout}
            />
          </ProtectedRoute>
        );

      case 'admin-alumni':
        return (
          <ProtectedRoute onNotAuthenticated={() => onLogin(null)}>
            <AlumniManagement 
              user={adminUser}
              onLogout={onLogout}
              onViewDetail={handleViewAlumniDetail}
            />
          </ProtectedRoute>
        );

      default:
        // Default to dashboard if logged in, otherwise login
        if (adminUser) {
          return (
            <ProtectedRoute onNotAuthenticated={() => onLogin(null)}>
              <AdminDashboard 
                user={adminUser}
                onLogout={onLogout}
              />
            </ProtectedRoute>
          );
        } else {
          return (
            <AdminLogin 
              onLogin={onLogin}
              onBackToPublic={handleBackToPublic}
            />
          );
        }
    }
  };

  return (
    <>
      {/* Main Admin Page */}
      {renderAdminPage()}

      {/* Alumni Detail Modal */}
      {selectedAlumniId && (
        <AlumniDetail
          alumniId={selectedAlumniId}
          onClose={handleCloseAlumniDetail}
          onUpdate={handleAlumniUpdate}
        />
      )}

      {/* Admin Navigation (Fixed Position) */}
      {adminUser && currentPage.startsWith('admin') && navigate && (
        <div className="admin-nav-fixed">
          <button
            onClick={() => navigate('admin-dashboard')}
            className={`admin-nav-btn ${currentPage === 'admin-dashboard' ? 'active' : ''}`}
          >
            แดชบอร์ด
          </button>
          <button
            onClick={() => navigate('admin-alumni')}
            className={`admin-nav-btn ${currentPage === 'admin-alumni' ? 'active' : ''}`}
          >
            จัดการศิษย์เก่า
          </button>
        </div>
      )}
    </>
  );
};

export default AdminSystem;