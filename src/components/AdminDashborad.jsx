// src/components/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';

const AdminDashboard = ({ user, onLogout }) => {
  const [stats, setStats] = useState(null);
  const [recentAlumni, setRecentAlumni] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      // Fetch statistics
      const statsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/alumni/statistics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statsData = await statsRes.json();
      
      // Fetch recent alumni
      const alumniRes = await fetch(`${import.meta.env.VITE_API_URL}/api/alumni?limit=5&sort=createdAt_desc`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const alumniData = await alumniRes.json();
      
      setStats(statsData);
      setRecentAlumni(alumniData.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color = "blue", change }) => (
    <div className="stat-card">
      <div className="stat-card-header">
        <div>
          <p className="stat-card-title">{title}</p>
          <p className={`stat-card-value`}>{value}</p>
          {change && (
            <p className={`stat-card-change ${change > 0 ? 'positive' : 'negative'}`}>
              {change > 0 ? '+' : ''}{change}%
            </p>
          )}
        </div>
        <div className={`stat-card-icon ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'อนุมัติ': return 'status-select approved';
      case 'รอตรวจสอบ': return 'status-select pending';
      case 'ปฏิเสธ': return 'status-select rejected';
      default: return 'status-select pending';
    }
  };

  if (loading) {
    return (
      <div className="admin-layout">
        <div className="admin-loading">
          <div className="spinner"></div>
          <p className="admin-loading-text">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-container">
          <div>
            <h1 className="admin-header-title">
              ระบบจัดการศิษย์เก่า - แดชบอร์ด
            </h1>
          </div>
          <div className="admin-header-user">
            <span className="admin-user-info">สวัสดี, {user.name}</span>
            <button
              onClick={onLogout}
              className="admin-logout-btn"
            >
              ออกจากระบบ
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="admin-main">
        {/* Stats Grid */}
        <div className="dashboard-stats">
          <StatCard
            title="จำนวนศิษย์เก่าทั้งหมด"
            value={stats?.total || 0}
            icon={
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            }
            color="blue"
          />
          <StatCard
            title="รอตรวจสอบ"
            value={stats?.pending || 0}
            icon={
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="yellow"
          />
          <StatCard
            title="อนุมัติแล้ว"
            value={stats?.approved || 0}
            icon={
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="green"
          />
          <StatCard
            title="ปฏิเสธ"
            value={stats?.rejected || 0}
            icon={
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="red"
          />
        </div>

        {/* Recent Alumni Table */}
        <div className="admin-table-container">
          <div className="admin-table-header">
            <h2 className="admin-table-title">ศิษย์เก่าที่ลงทะเบียนล่าสุด</h2>
          </div>
          
          <table className="admin-table">
            <thead>
              <tr>
                <th>ชื่อ-นามสกุล</th>
                <th>สาขา</th>
                <th>ปีที่จบ</th>
                <th>สถานะ</th>
                <th>วันที่ลงทะเบียน</th>
              </tr>
            </thead>
            <tbody>
              {recentAlumni.length > 0 ? (
                recentAlumni.map((alumni) => (
                  <tr key={alumni._id}>
                    <td>
                      <div className="alumni-name">
                        {alumni.firstName} {alumni.lastName}
                      </div>
                      <div className="alumni-contact">{alumni.phone}</div>
                    </td>
                    <td>{alumni.department}</td>
                    <td>{alumni.graduationYear}</td>
                    <td>
                      <span className={getStatusBadgeClass(alumni.status)}>
                        {alumni.status}
                      </span>
                    </td>
                    <td>
                      {new Date(alumni.createdAt).toLocaleDateString('th-TH')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                    <div className="admin-loading-text">ยังไม่มีข้อมูลศิษย์เก่า</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;