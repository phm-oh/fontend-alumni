// src/pages/AdminSystem.jsx - Complete Admin System (Updated with ShippingReports)
import React, { useState } from 'react';

// Import Admin Components ที่เราทำไว้แล้ว
import AdminLogin from '../components/AdminLogin';
import AdminDashboard from '../components/AdminDashboard';
import AlumniManagement from '../components/AlumniManagement';
import AlumniDetail from '../components/AlumniDetail';
import ProtectedRoute from '../components/ProtectedRoute';

// 🔥 Import Shipping System Components
import ShippingDashboard from '../components/ShippingDashboard';
import ShippingQueue from '../components/ShippingQueue';
import ShippingTracker from '../components/ShippingTracker';
import BulkShipping from '../components/BulkShipping';
import LabelPrinter from '../components/LabelPrinter';

// 🚀 เพิ่มใหม่: Import ShippingReports
import ShippingReports from '../components/ShippingReports';

const AdminSystem = ({ currentPage, adminUser, onLogin, onLogout, navigate }) => {
  const [selectedAlumniId, setSelectedAlumniId] = useState(null);
  
  // 🔥 State สำหรับ Label Printer
  const [labelPrinterConfig, setLabelPrinterConfig] = useState({
    isOpen: false,
    selectedAlumni: [],
    labelType: 'minimal'
  });

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

  // 🔥 Shipping Navigation Handler
  const handleShippingNavigate = (page) => {
    if (navigate) {
      navigate(page);
    }
  };

  // 🔥 Label Printer Handlers
  const handleOpenLabelPrinter = (selectedAlumni, labelType) => {
    setLabelPrinterConfig({
      isOpen: true,
      selectedAlumni,
      labelType
    });
  };

  const handleCloseLabelPrinter = () => {
    setLabelPrinterConfig({
      isOpen: false,
      selectedAlumni: [],
      labelType: 'minimal'
    });
  };

  // Render different admin pages based on currentPage
  const renderAdminPage = () => {
    // 🔥 Common props สำหรับ Shipping System
    const commonProps = {
      user: adminUser,
      onLogout,
      onNavigate: handleShippingNavigate
    };

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
              onNavigate={navigate}  // เพิ่ม onNavigate
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

      // 🔥 Shipping System Pages
      case 'admin-shipping-dashboard':
        return (
          <ProtectedRoute onNotAuthenticated={() => onLogin(null)}>
            <ShippingDashboard {...commonProps} />
          </ProtectedRoute>
        );

      // 🚀 เพิ่มใหม่: ShippingReports
      case 'admin-shipping-reports':
        return (
          <ProtectedRoute onNotAuthenticated={() => onLogin(null)}>
            <ShippingReports {...commonProps} />
          </ProtectedRoute>
        );

      case 'admin-shipping-queue':
        return (
          <ProtectedRoute onNotAuthenticated={() => onLogin(null)}>
            <ShippingQueue {...commonProps} />
          </ProtectedRoute>
        );

      case 'admin-shipping-tracker':
        return (
          <ProtectedRoute onNotAuthenticated={() => onLogin(null)}>
            <ShippingTracker {...commonProps} />
          </ProtectedRoute>
        );

      case 'admin-bulk-shipping':
        return (
          <ProtectedRoute onNotAuthenticated={() => onLogin(null)}>
            <BulkShipping {...commonProps} />
          </ProtectedRoute>
        );

      // 🔥 Financial System (Coming Soon)
      case 'admin-financial':
        return (
          <ProtectedRoute onNotAuthenticated={() => onLogin(null)}>
            <div className="admin-layout">
              <header className="admin-header">
                <div className="admin-header-container">
                  <div>
                    <button 
                      className="btn-back"
                      onClick={() => navigate('admin-dashboard')}
                    >
                      ← กลับแดชบอร์ด
                    </button>
                    <h1 className="admin-header-title">💰 ระบบการเงิน</h1>
                    <p className="admin-header-subtitle">กำลังพัฒนา...</p>
                  </div>
                  <div className="admin-header-user">
                    <span className="admin-user-info">
                      สวัสดี, {adminUser?.username || adminUser?.name || 'ผู้ดูแลระบบ'}
                    </span>
                    <button onClick={onLogout} className="admin-logout-btn">
                      ออกจากระบบ
                    </button>
                  </div>
                </div>
              </header>
              <main className="admin-main">
                <div className="coming-soon">
                  <div className="coming-soon-icon">🚧</div>
                  <h2>ระบบการเงินกำลังพัฒนา</h2>
                  <p>ฟีเจอร์นี้จะเปิดใช้งานในเร็วๆ นี้</p>
                  <div className="coming-soon-features">
                    <h3>ฟีเจอร์ที่กำลังพัฒนา:</h3>
                    <ul>
                      <li>📊 แดชบอร์ดการเงิน</li>
                      <li>💸 จัดการรายจ่าย</li>
                      <li>📈 รายงานการเงิน</li>
                      <li>📋 สรุปรายรับ-รายจ่าย</li>
                    </ul>
                  </div>
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate('admin-dashboard')}
                  >
                    กลับแดชบอร์ด
                  </button>
                </div>
              </main>
            </div>
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
                onNavigate={navigate}  // เพิ่ม onNavigate
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

      {/* 🔥 Label Printer Modal */}
      {labelPrinterConfig.isOpen && (
        <LabelPrinter
          isOpen={labelPrinterConfig.isOpen}
          selectedAlumni={labelPrinterConfig.selectedAlumni}
          labelType={labelPrinterConfig.labelType}
          onClose={handleCloseLabelPrinter}
          onPrintComplete={(alumniIds) => {
            console.log('Print completed for:', alumniIds);
            handleCloseLabelPrinter();
          }}
        />
      )}

      {/* 🔥 Enhanced Admin Navigation (Fixed Position) */}
      {adminUser && currentPage.startsWith('admin') && navigate && (
        <div className="admin-nav-fixed">
          {/* หมวดหลัก */}
          <div className="nav-section">
            <h4 className="nav-section-title">หลัก</h4>
            <button
              onClick={() => navigate('admin-dashboard')}
              className={`admin-nav-btn ${currentPage === 'admin-dashboard' ? 'active' : ''}`}
            >
              📊 แดชบอร์ด
            </button>
            <button
              onClick={() => navigate('admin-alumni')}
              className={`admin-nav-btn ${currentPage === 'admin-alumni' ? 'active' : ''}`}
            >
              👥 จัดการศิษย์เก่า
            </button>
          </div>

          {/* หมวดการจัดส่ง */}
          <div className="nav-section">
            <h4 className="nav-section-title">การจัดส่ง</h4>
            <button
              onClick={() => navigate('admin-shipping-dashboard')}
              className={`admin-nav-btn ${currentPage === 'admin-shipping-dashboard' ? 'active' : ''}`}
            >
              📦 แดชบอร์ดการจัดส่ง
            </button>
            {/* 🚀 เพิ่มปุ่มรายงานการจัดส่ง */}
            <button
              onClick={() => navigate('admin-shipping-reports')}
              className={`admin-nav-btn ${currentPage === 'admin-shipping-reports' ? 'active' : ''}`}
            >
              📊 รายงานการจัดส่ง
            </button>
            <button
              onClick={() => navigate('admin-shipping-queue')}
              className={`admin-nav-btn ${currentPage === 'admin-shipping-queue' ? 'active' : ''}`}
            >
              📋 คิวการจัดส่ง
            </button>
            <button
              onClick={() => navigate('admin-shipping-tracker')}
              className={`admin-nav-btn ${currentPage === 'admin-shipping-tracker' ? 'active' : ''}`}
            >
              📦 ติดตามการจัดส่ง
            </button>
            <button
              onClick={() => navigate('admin-bulk-shipping')}
              className={`admin-nav-btn ${currentPage === 'admin-bulk-shipping' ? 'active' : ''}`}
            >
              📊 จัดส่งแบบกลุ่ม
            </button>
          </div>

          {/* หมวดการเงิน */}
          <div className="nav-section">
            <h4 className="nav-section-title">การเงิน</h4>
            <button
              onClick={() => navigate('admin-financial')}
              className={`admin-nav-btn ${currentPage === 'admin-financial' ? 'active' : ''} disabled`}
              title="กำลังพัฒนา..."
            >
              💰 ระบบการเงิน
              <span className="coming-soon-badge">กำลังพัฒนา</span>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="nav-section">
            <h4 className="nav-section-title">การดำเนินการด่วน</h4>
            <button
              onClick={() => navigate('admin-shipping-queue')}
              className="admin-nav-btn quick-action"
            >
              🏷️ ปริ้น Label
            </button>
            <button
              onClick={() => navigate('admin-shipping-tracker')}
              className="admin-nav-btn quick-action"
            >
              📦 อัปเดตการจัดส่ง
            </button>
            {/* 🚀 เพิ่มปุ่มด่วนสำหรับรายงาน */}
            <button
              onClick={() => navigate('admin-shipping-reports')}
              className="admin-nav-btn quick-action"
            >
              📊 รายงานการจัดส่ง
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminSystem;