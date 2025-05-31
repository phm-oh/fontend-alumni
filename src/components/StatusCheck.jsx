// src/components/StatusCheck.jsx - Beautiful Version with Modern CSS
import React, { useState, useEffect } from 'react';
import { config } from '../utils/config';
import SafeImage from './SafeImage';

const StatusCheck = ({ onNavigate, initialIdCard = '' }) => {
  const [idCard, setIdCard] = useState(initialIdCard);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto search if initialIdCard is provided
  useEffect(() => {
    if (initialIdCard && initialIdCard.length === 13) {
      handleSubmit();
    }
  }, [initialIdCard]);

  const handleSubmit = async () => {
    const currentIdCard = idCard || initialIdCard;
    
    if (!currentIdCard.trim()) {
      setError('กรุณากรอกเลขบัตรประชาชน');
      return;
    }

    if (!/^\d{13}$/.test(currentIdCard)) {
      setError('เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Checking status at:', `${config.apiUrl}/api/status/check`);
      
      const response = await fetch(`${config.apiUrl}/api/status/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idCard: currentIdCard }),
      });

      const data = await response.json();
      console.log('Status check response:', data);

      if (response.ok && data.success) {
        console.log('Alumni data received:', data.data);
        setResult(data.data);
      } else {
        throw new Error(data.message || 'ไม่พบข้อมูลการลงทะเบียน');
      }
    } catch (error) {
      console.error('Status Check Error:', error);
      setError(error.message);
      setResult(null);
      
      // ถ้าเป็น network error
      if (error.message.includes('fetch')) {
        setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบว่า backend ทำงานอยู่');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'รอตรวจสอบ': 'pending',
      'อนุมัติแล้ว': 'approved', 
      'อนุมัติ': 'approved',
      'รอการชำระเงิน': 'waiting-payment',
      'ยกเลิก': 'cancelled',
      'ปฏิเสธ': 'cancelled'
    };
    return `status-badge ${statusMap[status] || 'pending'}`;
  };

  const getShippingStatusClass = (status) => {
    const statusMap = {
      'รอการจัดส่ง': 'shipping-pending',
      'กำลังจัดส่ง': 'shipping-progress', 
      'จัดส่งแล้ว': 'shipping-delivered'
    };
    return statusMap[status] || 'shipping-pending';
  };

  const getShippingMessage = (result) => {
    const status = result.shippingStatus || 'รอการจัดส่ง';
    
    switch (status) {
      case 'รอการจัดส่ง':
        return {
          icon: '📦',
          text: 'ของที่ระลึกของคุณอยู่ในคิวการจัดส่ง เจ้าหน้าที่จะดำเนินการจัดส่งเร็วๆ นี้',
          type: 'pending'
        };
      
      case 'กำลังจัดส่ง':
        return {
          icon: '🚚',
          text: `ของที่ระลึกกำลังจัดส่งไปยังที่อยู่ของคุณ${result.trackingNumber ? ` ใช้เลขติดตาม ${result.trackingNumber} เพื่อติดตามสถานะ` : ''}`,
          type: 'progress'
        };
      
      case 'จัดส่งแล้ว':
        return {
          icon: '✅',
          text: `ของที่ระลึกจัดส่งเรียบร้อยแล้ว หากยังไม่ได้รับ กรุณาติดต่อเจ้าหน้าที่${result.trackingNumber ? ` (เลขติดตาม: ${result.trackingNumber})` : ''}`,
          type: 'delivered'
        };
      
      default:
        return null;
    }
  };

  return (
    <div className="page status-check-page">
      <div className="container">
        {/* Header Section */}
        <div className="page-header">
          <button 
            className="btn-back"
            onClick={() => onNavigate('home')}
          >
            ← กลับหน้าหลัก
          </button>
          
          <div className="header-content">
           
            
            <div className="header-text">
              <h1 className="main-title">ตรวจสอบสถานะ</h1>
              <h2 className="college-name">{config.collegeName}</h2>
              <p className="subtitle">กรอกเลขบัตรประชาชนเพื่อตรวจสอบสถานะการลงทะเบียน</p>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="search-section">
          <div className="search-container">
            <div className="search-form">
              <div className="form-group">
                <label className="form-label">เลขบัตรประชาชน (13 หลัก)</label>
                <input
                  type="text"
                  value={idCard}
                  onChange={(e) => setIdCard(e.target.value)}
                  placeholder="1234567890123"
                  maxLength="13"
                  className={`form-input ${error ? 'error' : ''}`}
                />
                {error && <span className="error-text">{error}</span>}
              </div>

              <button 
                className="btn btn-primary btn-large"
                disabled={loading}
                onClick={handleSubmit}
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    กำลังค้นหา...
                  </>
                ) : (
                  <>
                    🔍 ตรวจสอบสถานะ
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Result Section */}
        {result && (
          <div className="result-section">
            <h2 className="result-title">📋 ผลการค้นหา</h2>
            <div className="result-card">
              {/* Member Header */}
              <div className="result-header">
                <div className="member-info">
                  <div className="member-avatar">
                    {result.firstName?.[0]}{result.lastName?.[0]}
                  </div>
                  <div className="member-details">
                    <h3 className="member-name">{result.firstName} {result.lastName}</h3>
                    <p className="member-department">แผนก{result.department} รุ่น {result.graduationYear}</p>
                    <p className="member-position">{result.position || 'สมาชิกสามัญ'}</p>
                  </div>
                </div>
                <div className="status-container">
                  <span className={getStatusBadgeClass(result.status)}>
                    {result.status}
                  </span>
                </div>
              </div>
              
              {/* Details Grid */}
              <div className="result-details">
                <div className="detail-grid">
                  <div className="detail-item">
                    <div className="detail-icon">📅</div>
                    <div className="detail-content">
                      <span className="detail-label">วันที่ลงทะเบียน</span>
                      <span className="detail-value">
                        {new Date(result.registrationDate || result.createdAt).toLocaleDateString('th-TH')}
                      </span>
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-icon">💳</div>
                    <div className="detail-content">
                      <span className="detail-label">วิธีการชำระ</span>
                      <span className="detail-value">{result.paymentMethod}</span>
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-icon">📦</div>
                    <div className="detail-content">
                      <span className="detail-label">การจัดส่ง</span>
                      <span className="detail-value">{result.deliveryOption}</span>
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-icon">💰</div>
                    <div className="detail-content">
                      <span className="detail-label">จำนวนเงิน</span>
                      <span className="detail-value">{result.totalAmount} บาท</span>
                    </div>
                  </div>

                  {result.paymentDate && (
                    <div className="detail-item">
                      <div className="detail-icon">✅</div>
                      <div className="detail-content">
                        <span className="detail-label">วันที่ชำระเงิน</span>
                        <span className="detail-value">
                          {new Date(result.paymentDate).toLocaleDateString('th-TH')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping Information */}
              {result.deliveryOption === 'จัดส่งทางไปรษณีย์' && result.status === 'อนุมัติ' && (
                <div className="shipping-section">
                  <h4 className="shipping-title">🚚 ข้อมูลการจัดส่ง</h4>
                  
                  <div className="shipping-status-container">
                    <div className="shipping-status-item">
                      <span className="shipping-label">สถานะการจัดส่ง:</span>
                      <span className={`shipping-status-badge ${getShippingStatusClass(result.shippingStatus)}`}>
                        {result.shippingStatus || 'รอการจัดส่ง'}
                      </span>
                    </div>
                    
                    {result.trackingNumber && (
                      <div className="tracking-container">
                        <div className="tracking-item">
                          <span className="tracking-label">🏷️ เลขติดตาม:</span>
                          <span className="tracking-number">
                            {result.trackingNumber}
                            <button 
                              className="tracking-button"
                              onClick={() => window.open(`https://track.thailandpost.co.th/?trackNumber=${result.trackingNumber}`, '_blank')}
                              title="ติดตามพัสดุ"
                            >
                              ติดตาม
                            </button>
                          </span>
                        </div>
                      </div>
                    )}

                    {result.shippedDate && (
                      <div className="shipping-status-item">
                        <span className="shipping-label">วันที่จัดส่ง:</span>
                        <span className="shipping-value">
                          {new Date(result.shippedDate).toLocaleDateString('th-TH')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Shipping Message */}
                  {(() => {
                    const message = getShippingMessage(result);
                    if (!message) return null;
                    
                    return (
                      <div className={`shipping-message ${message.type}`}>
                        <div className="message-icon">{message.icon}</div>
                        <div className="message-text">{message.text}</div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Beautiful CSS Styles */}
      <style jsx>{`
        .status-check-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px 0;
        }

        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 0 20px;
        }

        /* Header Section */
        .page-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .btn-back {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 25px;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.3s ease;
          cursor: pointer;
          margin-bottom: 30px;
          backdrop-filter: blur(10px);
        }

        .btn-back:hover {
          background: rgba(255, 255, 255, 0.3);
          border-color: rgba(255, 255, 255, 0.5);
          transform: translateY(-2px);
        }

        .header-content {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 40px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .header-logo {
          margin-bottom: 20px;
        }

        .logo-image {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          border: 4px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .logo-placeholder {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          margin: 0 auto;
          border: 4px solid rgba(255, 255, 255, 0.3);
        }

        .main-title {
          font-size: 36px;
          font-weight: 700;
          color: white;
          margin: 0 0 10px 0;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }

        .college-name {
          font-size: 24px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.9);
          margin: 0 0 15px 0;
          text-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
        }

        .subtitle {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.8);
          margin: 0;
          line-height: 1.6;
        }

        /* Search Section */
        .search-section {
          margin-bottom: 40px;
        }

        .search-container {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .search-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
          align-items: center;
        }

        .form-group {
          width: 100%;
          max-width: 400px;
        }

        .form-label {
          display: block;
          font-size: 16px;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 8px;
          text-align: left;
        }

        .form-input {
          width: 100%;
          padding: 16px 20px;
          border: 2px solid #e1e8ed;
          border-radius: 12px;
          font-size: 18px;
          text-align: center;
          transition: all 0.3s ease;
          background: white;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        .form-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
        }

        .form-input.error {
          border-color: #e74c3c;
          box-shadow: 0 0 0 4px rgba(231, 76, 60, 0.1);
        }

        .error-text {
          display: block;
          color: #e74c3c;
          font-size: 14px;
          margin-top: 8px;
          font-weight: 500;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 16px 32px;
          border: none;
          border-radius: 25px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .btn-large {
          padding: 18px 40px;
          font-size: 18px;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Result Section */
        .result-section {
          animation: slideUp 0.5s ease;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .result-title {
          font-size: 24px;
          font-weight: 600;
          color: white;
          margin-bottom: 20px;
          text-align: center;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }

        .result-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.3);
          overflow: hidden;
        }

        /* Member Header */
        .result-header {
          padding: 30px;
          background: linear-gradient(135deg, #f8f9fa, #e9ecef);
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }

        .member-info {
          display: flex;
          gap: 20px;
          align-items: center;
        }

        .member-avatar {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 24px;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
          border: 4px solid white;
        }

        .member-name {
          font-size: 24px;
          font-weight: 700;
          color: #2c3e50;
          margin: 0 0 8px 0;
        }

        .member-department {
          font-size: 16px;
          color: #6c757d;
          margin: 4px 0;
          font-weight: 500;
        }

        .member-position {
          font-size: 14px;
          color: #6c757d;
          margin: 4px 0;
        }

        .status-badge {
          padding: 8px 20px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
        }

        .status-badge.approved {
          background: linear-gradient(135deg, #28a745, #20c997);
          color: white;
        }

        .status-badge.pending {
          background: linear-gradient(135deg, #ffc107, #fd7e14);
          color: #000;
        }

        .status-badge.waiting-payment {
          background: linear-gradient(135deg, #17a2b8, #007bff);
          color: white;
        }

        .status-badge.cancelled {
          background: linear-gradient(135deg, #dc3545, #c82333);
          color: white;
        }

        /* Detail Grid */
        .result-details {
          padding: 30px;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 20px;
          background: linear-gradient(135deg, #f8f9fa, #e9ecef);
          border-radius: 12px;
          border-left: 4px solid #667eea;
          transition: all 0.3s ease;
        }

        .detail-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .detail-icon {
          font-size: 24px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .detail-content {
          flex: 1;
        }

        .detail-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #6c757d;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }

        .detail-value {
          display: block;
          font-size: 16px;
          font-weight: 600;
          color: #2c3e50;
        }

        /* Shipping Section */
        .shipping-section {
          padding: 30px;
          background: linear-gradient(135deg, #e3f2fd, #bbdefb);
          border-top: 1px solid rgba(0, 0, 0, 0.1);
        }

        .shipping-title {
          font-size: 20px;
          font-weight: 600;
          color: #1565c0;
          margin: 0 0 20px 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .shipping-status-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 20px;
        }

        .shipping-status-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .shipping-label {
          font-weight: 600;
          color: #495057;
          min-width: 120px;
        }

        .shipping-value {
          color: #2c3e50;
          font-weight: 500;
        }

        .shipping-status-badge {
          padding: 6px 16px;
          border-radius: 15px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .shipping-status-badge.shipping-pending {
          background: linear-gradient(135deg, #ffc107, #fd7e14);
          color: #000;
        }

        .shipping-status-badge.shipping-progress {
          background: linear-gradient(135deg, #007bff, #0056b3);
          color: white;
        }

        .shipping-status-badge.shipping-delivered {
          background: linear-gradient(135deg, #28a745, #20c997);
          color: white;
        }

        .tracking-container {
          grid-column: 1 / -1;
        }

        .tracking-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .tracking-label {
          font-weight: 600;
          color: #495057;
        }

        .tracking-number {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: monospace;
          font-weight: 600;
          color: #2c3e50;
        }

        .tracking-button {
          padding: 6px 12px;
          background: linear-gradient(135deg, #007bff, #0056b3);
          color: white;
          border: none;
          border-radius: 15px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
        }

        .tracking-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.4);
        }

        .shipping-message {
          padding: 20px;
          border-radius: 12px;
          display: flex;
          align-items: flex-start;
          gap: 15px;
          font-size: 14px;
          line-height: 1.6;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        .shipping-message.pending {
          background: linear-gradient(135deg, #fff3cd, #ffeaa7);
          border-left: 4px solid #ffc107;
        }

        .shipping-message.progress {
          background: linear-gradient(135deg, #cce7ff, #b3d7ff);
          border-left: 4px solid #007bff;
        }

        .shipping-message.delivered {
          background: linear-gradient(135deg, #d4edda, #c3e6cb);
          border-left: 4px solid #28a745;
        }

        .message-icon {
          font-size: 24px;
          flex-shrink: 0;
        }

        .message-text {
          color: #2c3e50;
          font-weight: 500;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .container {
            padding: 0 15px;
          }

          .header-content {
            padding: 30px 20px;
          }

          .search-container {
            padding: 30px 20px;
          }

          .result-header {
            flex-direction: column;
            gap: 20px;
            text-align: center;
          }

          .member-info {
            flex-direction: column;
            text-align: center;
          }

          .detail-grid {
            grid-template-columns: 1fr;
          }

          .shipping-status-item,
          .tracking-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .shipping-message {
            flex-direction: column;
            text-align: center;
          }

          .tracking-number {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default StatusCheck;