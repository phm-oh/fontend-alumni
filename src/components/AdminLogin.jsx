// src/components/AdminLogin.jsx
import React, { useState } from 'react';

const AdminLogin = ({ onLogin, onBackToPublic }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.user));
        onLogin(data.user);
      } else {
        setError(data.message || 'เข้าสู่ระบบไม่สำเร็จ');
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-login-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
              />
            </svg>
          </div>
          <h2 className="admin-login-title">ระบบผู้ดูแล</h2>
          <p className="admin-login-subtitle">{import.meta.env.VITE_COLLEGE_NAME}</p>
        </div>

        {error && (
          <div className="admin-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="username">ชื่อผู้ใช้</label>
            <input
              type="text"
              id="username"
              name="username"
              required
              value={formData.username}
              onChange={handleInputChange}
              placeholder="กรอกชื่อผู้ใช้"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">รหัสผ่าน</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              value={formData.password}
              onChange={handleInputChange}
              placeholder="กรอกรหัสผ่าน"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-large"
            style={{ width: '100%', marginTop: 'var(--spacing-lg)' }}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: '16px', height: '16px', marginRight: 'var(--spacing-sm)' }}></div>
                กำลังเข้าสู่ระบบ...
              </>
            ) : (
              'เข้าสู่ระบบ'
            )}
          </button>
        </form>

        <div className="admin-login-footer">
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              onBackToPublic();
            }}
            className="admin-login-back"
          >
            ← กลับไปหน้าลงทะเบียน
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;