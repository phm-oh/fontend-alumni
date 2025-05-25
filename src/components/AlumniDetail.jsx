// src/components/AlumniDetail.jsx
import React, { useState, useEffect } from 'react';

const AlumniDetail = ({ alumniId, onClose, onUpdate }) => {
  const [alumni, setAlumni] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  useEffect(() => {
    if (alumniId) {
      fetchAlumniDetail();
    }
  }, [alumniId]);

  const fetchAlumniDetail = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      console.log('Fetching alumni detail for ID:', alumniId); // Debug log
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/alumni/${alumniId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Alumni detail received:', data); // Debug log
        
        // Handle different response formats
        const alumniData = data.data || data;
        setAlumni(alumniData);
      } else {
        console.error('Failed to fetch alumni detail:', response.status);
        const errorData = await response.json();
        console.error('Error data:', errorData);
      }
    } catch (error) {
      console.error('Error fetching alumni detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/alumni/${alumniId}/status`, {
        method: 'PATCH', // เปลี่ยนจาก PUT เป็น PATCH
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        setAlumni({...alumni, status: newStatus});
        onUpdate();
        showToast(`อัปเดตสถานะเป็น "${newStatus}" แล้ว`, 'success');
      } else {
        const errorData = await response.json();
        console.error('Failed to update status:', errorData);
        showToast('ไม่สามารถอัปเดตสถานะได้', 'error');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showToast('เกิดข้อผิดพลาดในการอัปเดตสถานะ', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const updatePosition = async (newPosition) => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/alumni/${alumniId}/position`, {
        method: 'PATCH', // เปลี่ยนจาก PUT เป็น PATCH
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ position: newPosition })
      });
      
      if (response.ok) {
        setAlumni({...alumni, position: newPosition});
        onUpdate();
        showToast(`อัปเดตตำแหน่งเป็น "${newPosition}" แล้ว`, 'success');
      } else {
        const errorData = await response.json();
        console.error('Failed to update position:', errorData);
        showToast('ไม่สามารถอัปเดตตำแหน่งได้', 'error');
      }
    } catch (error) {
      console.error('Error updating position:', error);
      showToast('เกิดข้อผิดพลาดในการอัปเดตตำแหน่ง', 'error');
    } finally {
      setUpdating(false);
    }
  };

  // Simple toast function
  const showToast = (message, type = 'info') => {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      z-index: 10000;
      animation: slideIn 0.3s ease;
      ${type === 'success' ? 'background: #28a745;' : 
        type === 'error' ? 'background: #dc3545;' : 
        'background: #17a2b8;'}
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 3000);
  };

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  if (loading) {
    return (
      <div className="modal-backdrop">
        <div className="admin-loading">
          <div className="spinner"></div>
          <p className="admin-loading-text">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (!alumni) {
    return null;
  }

  return (
    <>
      <div className="modal-backdrop">
        <div className="modal-container">
          {/* Header */}
          <div className="modal-header">
            <h2 className="modal-title">รายละเอียดศิษย์เก่า</h2>
            <button
              onClick={onClose}
              className="modal-close"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="modal-content">
            <div className="modal-grid">
              {/* Profile Section */}
              <div>
                <div className="profile-section">
                  <h3>ข้อมูลส่วนตัว</h3>
                  
                  {/* Profile Image */}
                  {alumni.profileImageUrl && (
                    <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                      <img
                        src={alumni.profileImageUrl}
                        alt="รูปประจำตัว"
                        className="profile-image"
                        onClick={() => openImageModal(alumni.profileImageUrl)}
                      />
                      <p className="profile-image-hint">คลิกเพื่อดูขนาดใหญ่</p>
                    </div>
                  )}

                  <div className="profile-info">
                    <div className="profile-field">
                      <label>ชื่อ-นามสกุล</label>
                      <p>{alumni.firstName} {alumni.lastName}</p>
                    </div>
                    <div className="profile-field">
                      <label>เลขบัตรประชาชน</label>
                      <p>{alumni.idCard}</p>
                    </div>
                    <div className="profile-field">
                      <label>เบอร์โทร</label>
                      <p>{alumni.phone}</p>
                    </div>
                    <div className="profile-field">
                      <label>อีเมล</label>
                      <p>{alumni.email}</p>
                    </div>
                  </div>
                </div>

                {/* Status and Position Controls */}
                <div className="control-section">
                  <h3>จัดการสถานะ</h3>
                  
                  <div className="control-group">
                    <div className="control-field">
                      <label>สถานะ</label>
                      <select
                        value={alumni.status || 'รอตรวจสอบ'}
                        onChange={(e) => updateStatus(e.target.value)}
                        disabled={updating}
                        className="control-select"
                      >
                        <option value="รอตรวจสอบ">รอตรวจสอบ</option>
                        <option value="อนุมัติ">อนุมัติ</option>
                        <option value="ปฏิเสธ">ปฏิเสธ</option>
                      </select>
                    </div>

                    <div className="control-field">
                      <label>ตำแหน่งในสมาคม</label>
                      <select
                        value={alumni.position || 'สมาชิกสามัญ'}
                        onChange={(e) => updatePosition(e.target.value)}
                        disabled={updating}
                        className="control-select"
                      >
                        <option value="สมาชิกสามัญ">สมาชิกสามัญ</option>
                        <option value="สมาชิกกิตติมศักดิ์">สมาชิกกิตติมศักดิ์</option>
                        <option value="กรรมการ">กรรมการ</option>
                        <option value="รองประธาน">รองประธาน</option>
                        <option value="ประธาน">ประธาน</option>
                      </select>
                    </div>

                    {updating && (
                      <div className="updating-indicator">
                        <div className="updating-spinner"></div>
                        <p className="updating-text">กำลังอัปเดต...</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Details Section */}
              <div>
                {/* Education Info */}
                <div className="detail-section">
                  <h3>ข้อมูลการศึกษา</h3>
                  <div className="detail-grid">
                    <div className="detail-field">
                      <label>สาขาวิชา</label>
                      <p>{alumni.department}</p>
                    </div>
                    <div className="detail-field">
                      <label>ปีที่จบการศึกษา</label>
                      <p>{alumni.graduationYear}</p>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="detail-section">
                  <h3>ที่อยู่</h3>
                  <p>{alumni.address}</p>
                </div>

                {/* Work Info */}
                <div className="detail-section">
                  <h3>ข้อมูลการทำงาน</h3>
                  <div className="detail-grid">
                    <div className="detail-field">
                      <label>อาชีพปัจจุบัน</label>
                      <p>{alumni.currentJob}</p>
                    </div>
                    <div className="detail-field">
                      <label>สถานที่ทำงาน</label>
                      <p>{alumni.workplace}</p>
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                <div className="detail-section">
                  <h3>ข้อมูลติดต่อ</h3>
                  <div className="detail-grid">
                    <div className="detail-field">
                      <label>Facebook ID</label>
                      <p>{alumni.facebookId || 'ไม่ระบุ'}</p>
                    </div>
                    <div className="detail-field">
                      <label>Line ID</label>
                      <p>{alumni.lineId || 'ไม่ระบุ'}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="detail-section">
                  <h3>ข้อมูลการชำระเงิน</h3>
                  <div className="detail-grid">
                    <div className="detail-field">
                      <label>ยอดเงินรวม</label>
                      <p>{alumni.totalAmount} บาท</p>
                    </div>
                    <div className="detail-field">
                      <label>วันที่ลงทะเบียน</label>
                      <p>{new Date(alumni.createdAt).toLocaleDateString('th-TH')}</p>
                    </div>
                  </div>

                  {/* Payment Proof */}
                  {alumni.paymentProofUrl && (
                    <div className="payment-proof">
                      <label>หลักฐานการชำระเงิน</label>
                      <img
                        src={alumni.paymentProofUrl}
                        alt="หลักฐานการชำระเงิน"
                        onClick={() => openImageModal(alumni.paymentProofUrl)}
                      />
                      <p className="payment-proof-hint">คลิกเพื่อดูขนาดใหญ่</p>
                    </div>
                  )}
                </div>

                {/* History */}
                {alumni.statusHistory && alumni.statusHistory.length > 0 && (
                  <div className="detail-section">
                    <h3>ประวัติการอัปเดต</h3>
                    <div className="history-list">
                      {alumni.statusHistory.map((history, index) => (
                        <div key={index} className="history-item">
                          <span className="history-status">{history.status}</span>
                          <span className="history-date">
                            {new Date(history.updatedAt).toLocaleString('th-TH')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div className="image-modal-backdrop">
          <div className="image-modal-container">
            <button
              onClick={() => setShowImageModal(false)}
              className="image-modal-close"
            >
              ×
            </button>
            <img
              src={selectedImage}
              alt="ภาพขนาดใหญ่"
              className="image-modal-img"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default AlumniDetail;