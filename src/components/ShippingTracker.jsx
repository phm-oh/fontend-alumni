// src/components/ShippingTracker.jsx - หน้าเช็คสถานะการจัดส่งอย่างเดียว (Read-only)
import React, { useState } from 'react';

const ShippingTracker = ({ user, onLogout, onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // ค้นหาข้อมูลการจัดส่ง
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      showToast('กรุณากรอกชื่อหรือเลขบัตรประชาชน', 'error');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      
      // 🔥 ลองหลายวิธีค้นหา
      let results = [];
      
      // วิธีที่ 1: ใช้ shipping-list API
      console.log('🔍 Method 1: shipping-list API');
      results = await searchWithShippingAPI(token);
      
      // วิธีที่ 2: ถ้าไม่เจอ ลองใช้ alumni API
      if (results.length === 0) {
        console.log('🔄 Method 2: alumni API fallback');
        results = await searchWithAlumniAPI(token);
      }
      
      // วิธีที่ 3: ถ้ายังไม่เจอ ลองดึงทุกคนแล้วกรองเอง
      if (results.length === 0) {
        console.log('🔄 Method 3: manual filter');
        results = await searchWithManualFilter(token);
      }
      
      setSearchResults(results);
      
      if (results.length === 0) {
        showToast('ไม่พบข้อมูลที่ค้นหา - ลองค้นหาด้วยชื่อแทน', 'info');
      } else {
        showToast(`พบข้อมูล ${results.length} รายการ`, 'success');
      }
    } catch (error) {
      console.error('❌ Search error:', error);
      showToast('เกิดข้อผิดพลาดในการค้นหา', 'error');
    } finally {
      setLoading(false);
    }
  };

  // วิธีที่ 1: ใช้ shipping-list API
  const searchWithShippingAPI = async (token) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('search', searchTerm.trim());
      queryParams.append('limit', '50');

      const url = `${import.meta.env.VITE_API_URL}/api/alumni/shipping-list?${queryParams.toString()}`;
      console.log('🔍 Shipping API URL:', url);

      const response = await fetch(url, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('📥 Shipping API response:', data);
        return data.data || [];
      }
      return [];
    } catch (error) {
      console.error('❌ Shipping API error:', error);
      return [];
    }
  };

  // วิธีที่ 2: ใช้ alumni API แล้วกรอง
  const searchWithAlumniAPI = async (token) => {
    try {
      const fallbackParams = new URLSearchParams();
      fallbackParams.append('search', searchTerm.trim());
      fallbackParams.append('limit', '100');
      
      const fallbackUrl = `${import.meta.env.VITE_API_URL}/api/alumni?${fallbackParams.toString()}`;
      console.log('🔄 Alumni API URL:', fallbackUrl);
      
      const fallbackResponse = await fetch(fallbackUrl, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        console.log('📥 Alumni API response:', fallbackData);
        
        const allResults = fallbackData.data || [];
        
        // กรองเฉพาะคนที่มีการจัดส่ง
        const shippingResults = allResults.filter(alumni => 
          alumni.deliveryOption === 'จัดส่งทางไปรษณีย์' && 
          alumni.status === 'อนุมัติ'
        );
        
        console.log('📦 Filtered shipping results:', shippingResults.length);
        return shippingResults;
      }
      return [];
    } catch (error) {
      console.error('❌ Alumni API error:', error);
      return [];
    }
  };

  // วิธีที่ 3: ดึงทุกคนแล้วกรองเอง
  const searchWithManualFilter = async (token) => {
    try {
      console.log('🔄 Manual filter method - getting all shipping data...');
      
      // ดึงข้อมูลทุกสถานะการจัดส่ง
      const statusList = ['รอการจัดส่ง', 'กำลังจัดส่ง', 'จัดส่งแล้ว'];
      let allShippingData = [];
      
      for (const status of statusList) {
        try {
          const url = `${import.meta.env.VITE_API_URL}/api/alumni/shipping-list?shippingStatus=${status}&limit=100`;
          const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (response.ok) {
            const data = await response.json();
            const statusData = data.data || [];
            allShippingData = [...allShippingData, ...statusData];
            console.log(`📦 Got ${statusData.length} records for status: ${status}`);
          }
        } catch (error) {
          console.error(`❌ Error getting ${status}:`, error);
        }
      }
      
      console.log('📦 Total shipping records:', allShippingData.length);
      
      // กรองตามคำค้นหา
      const searchLower = searchTerm.toLowerCase().trim();
      const filteredResults = allShippingData.filter(alumni => {
        const firstName = (alumni.firstName || '').toLowerCase();
        const lastName = (alumni.lastName || '').toLowerCase();
        const fullName = `${firstName} ${lastName}`;
        const idCard = alumni.idCard || '';
        const phone = alumni.phone || '';
        
        return firstName.includes(searchLower) ||
               lastName.includes(searchLower) ||
               fullName.includes(searchLower) ||
               idCard.includes(searchTerm) ||
               phone.includes(searchTerm);
      });
      
      console.log('🎯 Manual filter results:', filteredResults.length);
      return filteredResults;
    } catch (error) {
      console.error('❌ Manual filter error:', error);
      return [];
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
      'จัดส่งแล้ว': 'status-badge green',
      'ไม่ต้องจัดส่ง': 'status-badge gray'
    };
    return statusMap[status] || 'status-badge gray';
  };

  const getDeliveryIcon = (option) => {
    return option === 'จัดส่งทางไปรษณีย์' ? '📮' : '🏫';
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
            <h1 className="admin-header-title">📦 ติดตามการจัดส่ง</h1>
            <p className="admin-header-subtitle">เช็คสถานะการจัดส่งของสมาชิก (อ่านอย่างเดียว)</p>
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
          backgroundColor: '#e7f3ff',
          border: '1px solid #b8daff',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{ fontSize: '24px' }}>ℹ️</div>
          <div>
            <strong>หน้านี้สำหรับเช็คสถานะการจัดส่งอย่างเดียว</strong><br/>
            หากต้องการแก้ไขสถานะหรือเพิ่มเลขติดตาม ให้ไปที่ 
            <button 
              onClick={() => onNavigate('admin-bulk-shipping')}
              style={{
                background: 'none',
                border: 'none',
                color: '#007bff',
                textDecoration: 'underline',
                cursor: 'pointer',
                marginLeft: '4px'
              }}
            >
              📊 จัดการสถานะการจัดส่ง
            </button>
          </div>
        </div>

        {/* Search Section */}
        <div className="search-section">
          <div className="search-container">
            <h2 className="search-title">🔍 ค้นหาข้อมูลการจัดส่ง</h2>
            <div className="search-form">
              <div className="search-input-group">
                <input
                  type="text"
                  placeholder="ค้นหาด้วยชื่อ, นามสกุล, หรือเลขบัตรประชาชน"
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  className="search-btn"
                  onClick={handleSearch}
                  disabled={loading}
                >
                  {loading ? 'กำลังค้นหา...' : 'ค้นหา'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="shipping-results">
          <h3 className="results-title">📋 ผลการค้นหา</h3>
          {searchResults.length > 0 ? (
            <div className="results-grid">
              {searchResults.map((alumni) => (
                <div key={alumni._id} className="shipping-card">
                  {/* ข้อมูลสมาชิก */}
                  <div className="card-header">
                    <div className="member-info">
                      <div className="member-avatar">
                        {alumni.firstName?.[0]}{alumni.lastName?.[0]}
                      </div>
                      <div className="member-details">
                        <h4>{alumni.firstName} {alumni.lastName}</h4>
                        <p>{alumni.department} • รุ่น {alumni.graduationYear}</p>
                        <p>📞 {alumni.phone}</p>
                      </div>
                    </div>
                    <div className="member-status">
                      <span className={getStatusBadgeClass(alumni.shippingStatus)}>
                        {alumni.shippingStatus || 'ไม่ระบุ'}
                      </span>
                    </div>
                  </div>

                  {/* ข้อมูลการจัดส่ง */}
                  <div className="card-body">
                    <div className="delivery-info">
                      <div className="delivery-option">
                        <span className="label">{getDeliveryIcon(alumni.deliveryOption)} การจัดส่ง:</span>
                        <span className="value">{alumni.deliveryOption}</span>
                      </div>

                      {alumni.deliveryOption === 'จัดส่งทางไปรษณีย์' && (
                        <>
                          <div className="delivery-address">
                            <span className="label">📍 ที่อยู่:</span>
                            <span className="value">{alumni.address}</span>
                          </div>

                          {alumni.trackingNumber && (
                            <div className="tracking-info">
                              <span className="label">🏷️ เลขติดตาม:</span>
                              <span className="value tracking-number">
                                {alumni.trackingNumber}
                                <button 
                                  className="tracking-link"
                                  onClick={() => window.open(`https://track.thailandpost.co.th/?trackNumber=${alumni.trackingNumber}`, '_blank')}
                                  title="ติดตามพัสดุ"
                                >
                                  ติดตาม
                                </button>
                              </span>
                            </div>
                          )}

                          {alumni.shippedDate && (
                            <div className="shipped-date">
                              <span className="label">📅 วันที่จัดส่ง:</span>
                              <span className="value">
                                {new Date(alumni.shippedDate).toLocaleDateString('th-TH')}
                              </span>
                            </div>
                          )}

                          {alumni.deliveryNotes && (
                            <div className="delivery-notes">
                              <span className="label">💬 หมายเหตุ:</span>
                              <span className="value">{alumni.deliveryNotes}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* ประวัติการจัดส่ง */}
                    {alumni.shippingHistory && alumni.shippingHistory.length > 0 && (
                      <div className="shipping-history">
                        <h5>📜 ประวัติการจัดส่ง</h5>
                        <div className="history-timeline">
                          {alumni.shippingHistory.slice(-3).reverse().map((history, index) => (
                            <div key={index} className="history-item">
                              <div className="history-date">
                                {new Date(history.updatedAt).toLocaleDateString('th-TH')}
                              </div>
                              <div className="history-status">
                                <span className={getStatusBadgeClass(history.shippingStatus)}>
                                  {history.shippingStatus}
                                </span>
                              </div>
                              {history.trackingNumber && (
                                <div className="history-tracking">
                                  🏷️ {history.trackingNumber}
                                </div>
                              )}
                              {history.notes && (
                                <div className="history-notes">
                                  💬 {history.notes}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* การดำเนินการ */}
                  <div className="card-footer">
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => onNavigate('admin-bulk-shipping')}
                    >
                      ✏️ แก้ไขสถานะ
                    </button>
                    <div className="last-updated">
                      อัปเดตล่าสุด: {new Date(alumni.updatedAt).toLocaleString('th-TH')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="results-empty">
              <div className="results-empty-icon">🔍</div>
              <p>กรอกชื่อหรือเลขบัตรประชาชนเพื่อค้นหา</p>
              <p className="results-empty-subtitle">ระบบจะแสดงข้อมูลการจัดส่งทั้งหมด</p>
            </div>
          )}
        </div>
      </main>

      {/* CSS Styles */}
      <style jsx>{`
        .shipping-results {
          margin-top: 24px;
        }

        .results-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
          gap: 24px;
          margin-top: 20px;
        }

        .shipping-card {
          background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          border: 1px solid #e8ecef;
          overflow: hidden;
          transition: all 0.3s ease;
          position: relative;
        }

        .shipping-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 30px rgba(0,0,0,0.12);
        }

        .card-header {
          padding: 24px;
          border-bottom: 1px solid #f1f3f5;
          background: linear-gradient(135deg, #fff 0%, #fafbfc 100%);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          position: relative;
        }

        .card-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #007bff, #0056b3);
          border-radius: 16px 16px 0 0;
        }

        .member-info {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }

        .member-avatar {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #007bff, #0056b3);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 18px;
          box-shadow: 0 4px 12px rgba(0,123,255,0.3);
          border: 3px solid white;
        }

        .member-details h4 {
          margin: 0 0 6px 0;
          font-size: 20px;
          font-weight: 600;
          color: #2c3e50;
          line-height: 1.2;
        }

        .member-details p {
          margin: 4px 0;
          font-size: 14px;
          color: #6c757d;
          line-height: 1.4;
        }

        .member-status {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
        }

        .card-body {
          padding: 24px;
          background: white;
        }

        .delivery-info {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .delivery-option,
        .delivery-address,
        .tracking-info,
        .shipped-date,
        .delivery-notes {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid #007bff;
        }

        .delivery-address {
          border-left-color: #28a745;
        }

        .tracking-info {
          border-left-color: #ffc107;
          background: linear-gradient(135deg, #fff3cd, #ffeaa7);
        }

        .shipped-date {
          border-left-color: #17a2b8;
        }

        .delivery-notes {
          border-left-color: #6c757d;
        }

        .label {
          font-weight: 600;
          color: #495057;
          min-width: 120px;
          flex-shrink: 0;
          font-size: 14px;
        }

        .value {
          flex: 1;
          color: #212529;
          font-size: 14px;
          line-height: 1.5;
        }

        .tracking-number {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .tracking-link {
          padding: 6px 12px;
          background: linear-gradient(135deg, #007bff, #0056b3);
          color: white;
          border: none;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0,123,255,0.3);
        }

        .tracking-link:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,123,255,0.4);
          background: linear-gradient(135deg, #0056b3, #004085);
        }

        .shipping-history {
          margin-top: 24px;
          padding-top: 20px;
          border-top: 2px solid #f1f3f5;
        }

        .shipping-history h5 {
          margin: 0 0 16px 0;
          font-size: 16px;
          font-weight: 600;
          color: #495057;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .history-timeline {
          display: flex;
          flex-direction: column;
          gap: 12px;
          position: relative;
        }

        .history-timeline::before {
          content: '';
          position: absolute;
          left: 24px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: linear-gradient(to bottom, #007bff, #28a745);
          border-radius: 1px;
        }

        .history-item {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: center;
          font-size: 13px;
          padding: 12px 16px 12px 48px;
          background: linear-gradient(135deg, #f8f9fa, #e9ecef);
          border-radius: 8px;
          position: relative;
          border: 1px solid #dee2e6;
        }

        .history-item::before {
          content: '';
          position: absolute;
          left: 16px;
          width: 16px;
          height: 16px;
          background: white;
          border: 3px solid #007bff;
          border-radius: 50%;
          box-shadow: 0 0 0 4px rgba(0,123,255,0.1);
        }

        .history-date {
          color: #495057;
          font-weight: 600;
          font-size: 12px;
        }

        .history-tracking,
        .history-notes {
          color: #6c757d;
          font-size: 12px;
          background: white;
          padding: 4px 8px;
          border-radius: 4px;
          border: 1px solid #dee2e6;
        }

        .card-footer {
          padding: 20px 24px;
          background: linear-gradient(135deg, #f8f9fa, #e9ecef);
          border-top: 1px solid #dee2e6;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .last-updated {
          font-size: 12px;
          color: #6c757d;
          font-style: italic;
        }

        .status-badge {
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          color: white;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          border: 2px solid white;
        }

        .status-badge.yellow { 
          background: linear-gradient(135deg, #ffc107, #e0a800);
          color: #000;
        }
        .status-badge.blue { 
          background: linear-gradient(135deg, #007bff, #0056b3);
        }
        .status-badge.green { 
          background: linear-gradient(135deg, #28a745, #1e7e34);
        }
        .status-badge.gray { 
          background: linear-gradient(135deg, #6c757d, #545b62);
        }

        .results-empty {
          text-align: center;
          padding: 60px 20px;
          color: #6c757d;
          background: linear-gradient(135deg, #f8f9fa, #e9ecef);
          border-radius: 16px;
          border: 2px dashed #dee2e6;
        }

        .results-empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
          opacity: 0.6;
        }

        .results-empty p {
          margin: 8px 0;
          font-size: 16px;
        }

        .results-empty-subtitle {
          font-size: 14px;
          opacity: 0.8;
        }

        .btn.btn-outline.btn-sm {
          padding: 8px 16px;
          background: linear-gradient(135deg, #ffffff, #f8f9fa);
          color: #007bff;
          border: 2px solid #007bff;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .btn.btn-outline.btn-sm:hover {
          background: linear-gradient(135deg, #007bff, #0056b3);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,123,255,0.3);
        }

        /* Search Section Styling */
        .search-section {
          margin-bottom: 32px;
        }

        .search-container {
          background: linear-gradient(135deg, #ffffff, #f8f9fa);
          padding: 32px;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          border: 1px solid #e8ecef;
        }

        .search-title {
          margin: 0 0 20px 0;
          font-size: 24px;
          font-weight: 600;
          color: #2c3e50;
          text-align: center;
        }

        .search-input-group {
          display: flex;
          gap: 12px;
          max-width: 600px;
          margin: 0 auto;
        }

        .search-input {
          flex: 1;
          padding: 12px 20px;
          border: 2px solid #dee2e6;
          border-radius: 25px;
          font-size: 16px;
          transition: all 0.3s ease;
          background: white;
        }

        .search-input:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 4px rgba(0,123,255,0.1);
        }

        .search-btn {
          padding: 12px 24px;
          background: linear-gradient(135deg, #007bff, #0056b3);
          color: white;
          border: none;
          border-radius: 25px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0,123,255,0.3);
        }

        .search-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,123,255,0.4);
        }

        .search-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .results-title {
          font-size: 20px;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* Info Banner Styling */
        .info-banner {
          background: linear-gradient(135deg, #e7f3ff, #cce7ff);
          border: 2px solid #b8daff;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 32px;
          display: flex;
          align-items: flex-start;
          gap: 16px;
          box-shadow: 0 2px 12px rgba(0,123,255,0.1);
        }

        .info-banner button {
          background: none;
          border: none;
          color: #007bff;
          text-decoration: underline;
          cursor: pointer;
          font-weight: 500;
          padding: 0;
          margin-left: 4px;
          transition: color 0.3s ease;
        }

        .info-banner button:hover {
          color: #0056b3;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .results-grid {
            grid-template-columns: 1fr;
          }
          
          .search-input-group {
            flex-direction: column;
          }
          
          .card-header {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;
          }
          
          .member-info {
            width: 100%;
          }
          
          .card-footer {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default ShippingTracker;