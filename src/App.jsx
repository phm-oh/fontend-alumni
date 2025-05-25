// src/App.jsx - Complete Main Application
import React, { useState, useEffect, createContext, useContext } from 'react';
import './styles/App.css';

// Import utilities
import { config } from './utils/config';
import SafeImage from './components/SafeImage';

// Import Public Components
import LandingPage from './components/LandingPage';
import AlumniRegistration from './components/AlumniRegistration';
import StatusCheck from './components/StatusCheck';

// Import Admin System
import AdminSystem from './pages/AdminSystem';

// App Context for global state
const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

// Navigation Component
const Navigation = ({ currentPage, navigate, adminUser, onAdminLogout }) => {
  const isAdminPage = currentPage.startsWith('admin');
  
  return (
    <nav className="navbar">
      <div className="container">
        <div className="nav-brand">
          {config.imageLogo && (
            <SafeImage 
              src={config.imageLogo} 
              alt="โลโก้" 
              className="nav-logo"
              fallback={<div className="nav-logo-placeholder">🏫</div>}
            />
          )}
          <div className="nav-text">
            <h1 onClick={() => navigate('home')} style={{ cursor: 'pointer' }}>
              {config.appName}
            </h1>
            <span>{config.collegeName}</span>
          </div>
        </div>
        
        <div className="nav-menu">
          {/* Public Navigation */}
          {!isAdminPage && (
            <>
              <button 
                onClick={() => navigate('home')} 
                className={currentPage === 'home' ? 'active' : ''}
              >
                หน้าหลัก
              </button>
              <button 
                onClick={() => navigate('register')} 
                className={currentPage === 'register' ? 'active' : ''}
              >
                ลงทะเบียน
              </button>
              <button 
                onClick={() => navigate('check-status')} 
                className={currentPage === 'check-status' ? 'active' : ''}
              >
                ตรวจสอบสถานะ
              </button>
              <button 
                onClick={() => navigate('admin-login')} 
                className="btn-login"
              >
                ระบบผู้ดูแล
              </button>
            </>
          )}

          {/* Admin Navigation */}
          {isAdminPage && (
            <>
              <button
                onClick={() => navigate('admin-dashboard')}
                className={currentPage === 'admin-dashboard' ? 'active' : ''}
              >
                แดชบอร์ด
              </button>
              <button
                onClick={() => navigate('admin-alumni')}
                className={currentPage === 'admin-alumni' ? 'active' : ''}
              >
                จัดการศิษย์เก่า
              </button>
              {adminUser && (
                <>
                  <span className="admin-user-info">
                    สวัสดี, {adminUser.username || adminUser.name || adminUser.email}
                  </span>
                  <button
                    onClick={() => navigate('home')}
                    className="btn btn-outline"
                  >
                    กลับหน้าหลัก
                  </button>
                  <button
                    onClick={onAdminLogout}
                    className="admin-logout-btn"
                  >
                    ออกจากระบบ
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

// Footer Component
const Footer = () => (
  <footer className="footer">
    <div className="container">
      <div className="footer-content">
        <div className="footer-section">
          <h3>{config.collegeName}</h3>
          <p>สมาคมศิษย์เก่า</p>
          <p>{config.collegeAddress}</p>
          <p>โทร: {config.collegePhone}</p>
        </div>
        <div className="footer-section">
          <h4>ติดต่อเรา</h4>
          <p>โทร: {config.collegePhone}</p>
          <p>อีเมล: alumni@utc.ac.th</p>
          <p>เว็บไซต์: www.utc.ac.th</p>
        </div>
        <div className="footer-section">
          <h4>ลิงก์ที่เป็นประโยชน์</h4>
          <p>เว็บไซต์วิทยาลัย</p>
          <p>Facebook Page</p>
          <p>ระบบจัดการสมาชิก</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2025 {config.collegeName} สงวนลิขสิทธิ์</p>
        <p>พัฒนาโดย: {config.devName}</p>
      </div>
    </div>
  </footer>
);

// Main App Component
const App = () => {
  // Page Navigation State
  const [currentPage, setCurrentPage] = useState('home');
  const [loading, setLoading] = useState(false);
  
  // Public App State
  const [registeredIdCard, setRegisteredIdCard] = useState('');
  
  // Admin State
  const [adminUser, setAdminUser] = useState(null);

  // Check for existing admin session on app load
  useEffect(() => {
    const savedUser = localStorage.getItem('adminUser');
    const token = localStorage.getItem('adminToken');
    
    if (savedUser && token) {
      try {
        const user = JSON.parse(savedUser);
        setAdminUser(user);
        // If already logged in and on home page, go to admin dashboard
        if (currentPage === 'home') {
          setCurrentPage('admin-dashboard');
        }
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('adminUser');
        localStorage.removeItem('adminToken');
      }
    }
  }, []);

  // Navigation function
  const navigate = (page, idCard = '') => {
    setCurrentPage(page);
    if (idCard) {
      setRegisteredIdCard(idCard);
    }
    window.scrollTo(0, 0);
  };

  // Admin Functions
  const handleAdminLogin = (user) => {
    setAdminUser(user);
    navigate('admin-dashboard');
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setAdminUser(null);
    navigate('home');
  };

  // Context value
  const contextValue = {
    // Navigation
    navigate,
    currentPage,
    
    // Config
    config,
    
    // Public App
    setIdCard: setRegisteredIdCard,
    registeredIdCard,
    
    // Admin
    adminUser,
    setAdminUser,
    
    // State management
    loading,
    setLoading
  };

  // Loading Screen
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>กำลังโหลด...</p>
      </div>
    );
  }

  // Determine if current page is admin
  const isAdminPage = currentPage.startsWith('admin');

  return (
    <AppContext.Provider value={contextValue}>
      <div className="app">
        {/* Navigation */}
        <Navigation 
          currentPage={currentPage}
          navigate={navigate}
          adminUser={adminUser}
          onAdminLogout={handleAdminLogout}
        />

        {/* Main Content */}
        <main className="main-content">
          {/* Public Pages */}
          {!isAdminPage && (
            <>
              {currentPage === 'home' && <LandingPage onNavigate={navigate} />}
              {currentPage === 'register' && <AlumniRegistration onNavigate={navigate} />}
              {currentPage === 'check-status' && (
                <StatusCheck 
                  onNavigate={navigate} 
                  initialIdCard={registeredIdCard} 
                />
              )}
            </>
          )}

          {/* Admin System */}
          {isAdminPage && (
            <AdminSystem 
              currentPage={currentPage}
              adminUser={adminUser}
              onLogin={handleAdminLogin}
              onLogout={handleAdminLogout}
              navigate={navigate}
            />
          )}
        </main>

        {/* Footer - Show only for public pages */}
        {!isAdminPage && <Footer />}
      </div>
    </AppContext.Provider>
  );
};

export default App;