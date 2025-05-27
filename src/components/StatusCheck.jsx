// src/components/StatusCheck.jsx - Status Check Component
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
      console.log('Checking status at:', `${config.apiUrl}/api/alumni/check-status`);
      
      const response = await fetch(`${config.apiUrl}/api/alumni/check-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idCard: currentIdCard }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
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

  return (
    <div className="page status-check-page">
      <div className="container">
        <div className="page-header">
          <button 
            className="btn-back"
            onClick={() => onNavigate('home')}
          >
            ← กลับหน้าหลัก
          </button>
          <div className="header-logo">

          </div>
          <h1>ตรวจสอบสถานะ</h1>
          <h2>{config.collegeName}</h2>
          <p>กรอกเลขบัตรประชาชนเพื่อตรวจสอบสถานะการลงทะเบียน</p>
        </div>

        <div className="search-section">
          <div className="form-group">
            <label>เลขบัตรประชาชน (13 หลัก)</label>
            <input
              type="text"
              value={idCard}
              onChange={(e) => setIdCard(e.target.value)}
              placeholder="1234567890123"
              maxLength="13"
              className={error ? 'error' : ''}
            />
            {error && <span className="error-text">{error}</span>}
          </div>

          <button 
            className="btn btn-primary"
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? 'กำลังค้นหา...' : 'ตรวจสอบสถานะ'}
          </button>
        </div>

        {result && (
          <div className="result-section">
            <h2>ผลการค้นหา</h2>
            <div className="result-card">
              <div className="result-header">
                <div className="member-info">
                  <h3>{result.firstName} {result.lastName}</h3>
                  <p>แผนก{result.department} รุ่น {result.graduationYear}</p>
                </div>
                <span className={getStatusBadgeClass(result.status)}>
                  {result.status}
                </span>
              </div>
              
              <div className="result-details">
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">ตำแหน่ง:</span>
                    <span>{result.position || 'สมาชิกสามัญ'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">วันที่ลงทะเบียน:</span>
                    <span>{new Date(result.registrationDate || result.createdAt).toLocaleDateString('th-TH')}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">วิธีการชำระ:</span>
                    <span>{result.paymentMethod}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">การจัดส่ง:</span>
                    <span>{result.deliveryOption}</span>
                  </div>
                  {result.paymentDate && (
                    <div className="detail-item">
                      <span className="label">วันที่ชำระเงิน:</span>
                      <span>{new Date(result.paymentDate).toLocaleDateString('th-TH')}</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <span className="label">จำนวนเงิน:</span>
                    <span>{result.totalAmount} บาท</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusCheck;