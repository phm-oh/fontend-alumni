// src/components/BulkShipping.jsx - จัดการสถานะการจัดส่ง + กรอก tracking number ได้
import React, { useState, useEffect } from 'react';

const BulkShipping = ({ user, onLogout, onNavigate }) => {
  const [alumni, setAlumni] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedAlumni, setSelectedAlumni] = useState(null); // 🔥 เพิ่มสำหรับ single edit
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [filters, setFilters] = useState({
    shippingStatus: 'รอการจัดส่ง',
    department: '',
    graduationYear: '',
    search: ''
  });
  const [bulkAction, setBulkAction] = useState({
    action: '',
    newStatus: '',
    notes: ''
  });
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showSingleModal, setShowSingleModal] = useState(false); // 🔥 เพิ่ม single edit modal
  const [singleForm, setSingleForm] = useState({ // 🔥 เพิ่ม single form
    shippingStatus: '',
    trackingNumber: '',
    notes: ''
  });

  const shippingStatusOptions = [
    { value: '', label: 'ทุกสถานะ' },
    { value: 'รอการจัดส่ง', label: 'รอการจัดส่ง' },
    { value: 'กำลังจัดส่ง', label: 'กำลังจัดส่ง' },
    { value: 'จัดส่งแล้ว', label: 'จัดส่งแล้ว' }
  ];

  useEffect(() => {
    fetchAlumni();
  }, [filters]);

  const fetchAlumni = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      
      const queryParams = new URLSearchParams();
      queryParams.append('limit', '50');

      if (filters.shippingStatus) {
        queryParams.append('shippingStatus', filters.shippingStatus);
      }
      if (filters.search.trim()) {
        queryParams.append('search', filters.search.trim());
      }
      if (filters.department) {
        queryParams.append('department', filters.department);
      }
      if (filters.graduationYear) {
        queryParams.append('graduationYear', filters.graduationYear);
      }

      const url = `${import.meta.env.VITE_API_URL}/api/alumni/shipping-list?${queryParams.toString()}`;
      
      const response = await fetch(url, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const alumniData = data.data || data.alumni || [];
        setAlumni(alumniData);
        console.log('📦 Bulk shipping alumni loaded:', alumniData.length);
      } else {
        console.error('Failed to fetch alumni:', response.status);
        setAlumni([]);
      }
    } catch (error) {
      console.error('Error fetching alumni:', error);
      setAlumni([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.length === alumni.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(alumni.map(item => item._id));
    }
  };

  const handleSelectItem = (itemId) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  // 🔥 เพิ่มฟังก์ชันสำหรับแก้ไขรายบุคคล
  const handleSingleEdit = (alumni) => {
    setSelectedAlumni(alumni);
    setSingleForm({
      shippingStatus: alumni.shippingStatus || 'รอการจัดส่ง',
      trackingNumber: alumni.trackingNumber || '',
      notes: ''
    });
    setShowSingleModal(true);
  };

  // 🔥 ฟังก์ชันอัปเดตรายบุคคล (ใช้ Single API)
  const handleSingleUpdate = async () => {
    if (!selectedAlumni) return;

    if (!singleForm.shippingStatus) {
      showToast('กรุณาเลือกสถานะการจัดส่ง', 'error');
      return;
    }

    setProcessing(true);
    try {
      const token = localStorage.getItem('adminToken');
      
      const requestData = {
        shippingStatus: singleForm.shippingStatus,
        trackingNumber: singleForm.trackingNumber?.trim() || '',
        notes: singleForm.notes?.trim() || ''
      };

      console.log('🔄 Single update with data:', requestData);
      console.log('🔗 API URL:', `${import.meta.env.VITE_API_URL}/api/alumni/${selectedAlumni._id}/shipping`);
      
      // ✅ ใช้ Single API สำหรับ tracking number
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/alumni/${selectedAlumni._id}/shipping`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      console.log('📡 Single update response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Single update response:', result);
        
        showToast('อัปเดตสถานะการจัดส่งสำเร็จ', 'success');
        
        // Reset และปิด modal
        setShowSingleModal(false);
        setSelectedAlumni(null);
        
        // Refresh data
        fetchAlumni();
      } else {
        const errorData = await response.json();
        console.error('❌ Single update failed:', errorData);
        throw new Error(errorData.message || 'ไม่สามารถอัปเดตสถานะได้');
      }
    } catch (error) {
      console.error('❌ Error updating single shipping:', error);
      showToast(`เกิดข้อผิดพลาดในการอัปเดต: ${error.message}`, 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkAction = (action) => {
    if (selectedItems.length === 0) {
      showToast('กรุณาเลือกรายการที่ต้องการดำเนินการ', 'error');
      return;
    }

    setBulkAction({
      action,
      newStatus: action === 'updateStatus' ? 'กำลังจัดส่ง' : 
                action === 'markDelivered' ? 'จัดส่งแล้ว' : '',
      notes: ''
    });
    setShowBulkModal(true);
  };

  // ฟังก์ชันอัปเดตหลายคน (ใช้ Bulk API)
  const processBulkAction = async () => {
    setProcessing(true);
    try {
      const token = localStorage.getItem('adminToken');
      
      const endpoint = `${import.meta.env.VITE_API_URL}/api/alumni/bulk-shipping`;
      
      let requestBody = {
        alumniIds: selectedItems,
        notes: bulkAction.notes || `${bulkAction.action} - ${new Date().toLocaleDateString('th-TH')}`
      };

      switch (bulkAction.action) {
        case 'updateStatus':
          requestBody.shippingStatus = bulkAction.newStatus;
          break;
        case 'markDelivered':
          requestBody.shippingStatus = 'จัดส่งแล้ว';
          break;
        default:
          throw new Error('การดำเนินการไม่ถูกต้อง');
      }

      console.log('🔄 Bulk shipping request:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📡 Bulk update response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Bulk update response:', result);
        showToast(`อัปเดต ${selectedItems.length} รายการสำเร็จ`, 'success');
        
        setSelectedItems([]);
        setShowBulkModal(false);
        fetchAlumni();
      } else {
        const errorData = await response.json();
        console.error('❌ Bulk update failed:', errorData);
        throw new Error(errorData.message || 'ไม่สามารถดำเนินการได้');
      }
    } catch (error) {
      console.error('Error processing bulk action:', error);
      showToast(`เกิดข้อผิดพลาด: ${error.message}`, 'error');
    } finally {
      setProcessing(false);
    }
  };

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

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'รอการจัดส่ง': 'status-badge yellow',
      'กำลังจัดส่ง': 'status-badge blue', 
      'จัดส่งแล้ว': 'status-badge green'
    };
    return statusMap[status] || 'status-badge gray';
  };

  return (
    <div className="admin-layout">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-container">
          <div>
            <button 
              className="btn-back"
              onClick={() => onNavigate('admin-shipping-dashboard')}
            >
              ← กลับแดชบอร์ด
            </button>
            <h1 className="admin-header-title">📊 จัดการสถานะการจัดส่ง</h1>
            <p className="admin-header-subtitle">อัปเดตสถานะและเลขติดตามรายบุคคลหรือหลายคนพร้อมกัน</p>
          </div>
          <div className="admin-header-user">
            <span className="admin-user-info">
              สวัสดี, {user?.username || user?.name || user?.email || 'ผู้ดูแลระบบ'}
            </span>
            <button onClick={onLogout} className="admin-logout-btn">
              ออกจากระบบ
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="admin-main">
        {/* คำแนะนำ */}
        <div className="info-banner" style={{
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{ fontSize: '24px' }}>💡</div>
          <div>
            <strong>หน้านี้สำหรับจัดการสถานะการจัดส่ง</strong><br/>
            • คลิก "แก้ไข" ที่แต่ละรายการเพื่อเพิ่ม tracking number รายบุคคล<br/>
            • เลือกหลายรายการเพื่ออัปเดตสถานะพร้อมกัน<br/>
            • หากต้องการดูสถานะอย่างเดียว ให้ไปที่ 
            <button 
              onClick={() => onNavigate('admin-shipping-tracker')}
              style={{
                background: 'none',
                border: 'none',
                color: '#007bff',
                textDecoration: 'underline',
                cursor: 'pointer',
                marginLeft: '4px'
              }}
            >
              📦 ติดตามการจัดส่ง
            </button>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedItems.length > 0 && (
          <div className="bulk-actions">
            <div className="bulk-actions-info">
              <span>เลือกแล้ว {selectedItems.length} รายการ</span>
            </div>
            <div className="bulk-actions-buttons">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleBulkAction('updateStatus')}
              >
                📦 อัปเดตสถานะ
              </button>
              <button
                className="btn btn-success btn-sm"
                onClick={() => handleBulkAction('markDelivered')}
              >
                ✅ จัดส่งเสร็จสิ้น
              </button>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setSelectedItems([])}
              >
                ล้างการเลือก
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="admin-filters">
          <div className="admin-filters-grid">
            <div className="admin-filter-group">
              <label className="admin-filter-label">ค้นหา</label>
              <input
                type="text"
                placeholder="ชื่อ, นามสกุล, หรือเบอร์โทร"
                className="admin-filter-input"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>
            
            <div className="admin-filter-group">
              <label className="admin-filter-label">สถานะการจัดส่ง</label>
              <select
                className="admin-filter-input"
                value={filters.shippingStatus}
                onChange={(e) => setFilters({...filters, shippingStatus: e.target.value})}
              >
                {shippingStatusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="admin-filter-group">
              <label className="admin-filter-label">สาขาวิชา</label>
              <select
                className="admin-filter-input"
                value={filters.department}
                onChange={(e) => setFilters({...filters, department: e.target.value})}
              >
                <option value="">ทุกสาขา</option>
                <option value="คอมพิวเตอร์ธุรกิจ">คอมพิวเตอร์ธุรกิจ</option>
                <option value="การบัญชี">การบัญชี</option>
                <option value="การตลาด">การตลาด</option>
                <option value="อิเล็กทรอนิกส์">อิเล็กทรอนิกส์</option>
              </select>
            </div>
            
            <div className="admin-filter-group">
              <button
                onClick={() => setFilters({
                  shippingStatus: 'รอการจัดส่ง',
                  department: '',
                  graduationYear: '',
                  search: ''
                })}
                className="admin-clear-btn"
              >
                ล้างตัวกรอง
              </button>
            </div>
          </div>
        </div>

        {/* Alumni Table */}
        <div className="admin-table-container">
          {loading ? (
            <div className="admin-loading">
              <div className="spinner"></div>
              <p className="admin-loading-text">กำลังโหลดข้อมูล...</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>
                    <input
                      type="checkbox"
                      checked={selectedItems.length === alumni.length && alumni.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>ชื่อ-นามสกุล</th>
                  <th>สาขา/ปี</th>
                  <th>สถานะ</th>
                  <th>เลขติดตาม</th>
                  <th>วันที่อัปเดต</th>
                  <th>การดำเนินการ</th>
                </tr>
              </thead>
              <tbody>
                {alumni.length > 0 ? (
                  alumni.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item._id)}
                          onChange={() => handleSelectItem(item._id)}
                        />
                      </td>
                      <td>
                        <div className="alumni-name">
                          {item.firstName} {item.lastName}
                        </div>
                        <div className="alumni-contact">{item.phone}</div>
                      </td>
                      <td>
                        <div className="alumni-education">
                          {item.department}
                        </div>
                        <div className="alumni-year">รุ่น {item.graduationYear}</div>
                      </td>
                      <td>
                        <span className={getStatusBadgeClass(item.shippingStatus)}>
                          {item.shippingStatus || 'ไม่ระบุ'}
                        </span>
                      </td>
                      <td>
                        {item.trackingNumber ? (
                          <div className="tracking-number">
                            🏷️ {item.trackingNumber}
                          </div>
                        ) : (
                          <span className="no-tracking">ยังไม่มี</span>
                        )}
                      </td>
                      <td>
                        {new Date(item.updatedAt).toLocaleDateString('th-TH')}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => handleSingleEdit(item)}
                        >
                          ✏️ แก้ไข
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                      <div className="admin-loading-text">
                        {Object.values(filters).some(v => v) 
                          ? 'ไม่พบข้อมูลที่ตรงกับการค้นหา' 
                          : 'ยังไม่มีรายการที่ต้องจัดส่ง'
                        }
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* 🔥 Single Edit Modal - แก้ไขรายบุคคล */}
      {showSingleModal && (
        <div className="modal-backdrop">
          <div className="modal-container">
            <div className="modal-header">
              <h2 className="modal-title">
                ✏️ แก้ไขการจัดส่ง: {selectedAlumni?.firstName} {selectedAlumni?.lastName}
              </h2>
              <button
                onClick={() => setShowSingleModal(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>

            <div className="modal-content">
              <div className="single-form">
                <div className="form-group">
                  <label>สถานะการจัดส่ง</label>
                  <select
                    value={singleForm.shippingStatus}
                    onChange={(e) => setSingleForm({...singleForm, shippingStatus: e.target.value})}
                    className="form-select"
                  >
                    <option value="รอการจัดส่ง">รอการจัดส่ง</option>
                    <option value="กำลังจัดส่ง">กำลังจัดส่ง</option>
                    <option value="จัดส่งแล้ว">จัดส่งแล้ว</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>เลขติดตาม (Tracking Number)</label>
                  <input
                    type="text"
                    placeholder="เช่น: EMS123456789TH"
                    value={singleForm.trackingNumber}
                    onChange={(e) => setSingleForm({...singleForm, trackingNumber: e.target.value})}
                    className="form-input"
                  />
                  <div className="form-note">
                    💡 ใส่เลขติดตามพัสดุเพื่อให้ผู้รับสามารถติดตามได้
                  </div>
                </div>

                <div className="form-group">
                  <label>หมายเหตุ</label>
                  <textarea
                    placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)"
                    rows="3"
                    value={singleForm.notes}
                    onChange={(e) => setSingleForm({...singleForm, notes: e.target.value})}
                    className="form-textarea"
                  />
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-primary"
                onClick={handleSingleUpdate}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <div className="spinner" style={{ width: '16px', height: '16px', marginRight: '8px' }}></div>
                    กำลังบันทึก...
                  </>
                ) : (
                  '💾 บันทึกการแก้ไข'
                )}
              </button>
              <button
                className="btn btn-outline"
                onClick={() => setShowSingleModal(false)}
                disabled={processing}
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Action Modal */}
      {showBulkModal && (
        <div className="modal-backdrop">
          <div className="modal-container">
            <div className="modal-header">
              <h2 className="modal-title">
                📊 จัดการ {selectedItems.length} รายการ
              </h2>
              <button
                onClick={() => setShowBulkModal(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>

            <div className="modal-content">
              {bulkAction.action === 'updateStatus' && (
                <div className="bulk-form">
                  <div className="form-group">
                    <label>เปลี่ยนสถานะเป็น</label>
                    <select
                      value={bulkAction.newStatus}
                      onChange={(e) => setBulkAction({...bulkAction, newStatus: e.target.value})}
                      className="form-select"
                    >
                      <option value="รอการจัดส่ง">รอการจัดส่ง</option>
                      <option value="กำลังจัดส่ง">กำลังจัดส่ง</option>
                      <option value="จัดส่งแล้ว">จัดส่งแล้ว</option>
                    </select>
                  </div>
                </div>
              )}

              {bulkAction.action === 'markDelivered' && (
                <div className="bulk-form">
                  <p>ทำเครื่องหมายว่าจัดส่งเสร็จสิ้นสำหรับ {selectedItems.length} รายการ</p>
                  <div className="form-note">
                    💡 ระบบจะอัปเดตสถานะเป็น "จัดส่งแล้ว"
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>หมายเหตุ</label>
                <textarea
                  placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)"
                  rows="3"
                  value={bulkAction.notes}
                  onChange={(e) => setBulkAction({...bulkAction, notes: e.target.value})}
                  className="form-textarea"
                />
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-primary"
                onClick={processBulkAction}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <div className="spinner" style={{ width: '16px', height: '16px', marginRight: '8px' }}></div>
                    กำลังดำเนินการ...
                  </>
                ) : (
                  'ยืนยันการดำเนินการ'
                )}
              </button>
              <button
                className="btn btn-outline"
                onClick={() => setShowBulkModal(false)}
                disabled={processing}
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkShipping;