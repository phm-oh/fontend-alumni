// src/components/AlumniManagement.jsx
import React, { useState, useEffect } from 'react';

const AlumniManagement = ({ user, onLogout, onViewDetail }) => {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');

  useEffect(() => {
    fetchAlumni();
  }, [currentPage, searchTerm, filterStatus, filterDepartment]);

  const fetchAlumni = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(filterStatus && { status: filterStatus }),
        ...(filterDepartment && { department: filterDepartment })
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/alumni?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      setAlumni(data.data || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching alumni:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (alumniId, newStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`${import.meta.env.VITE_API_URL}/api/alumni/${alumniId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      fetchAlumni(); // Refresh data
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterStatus('');
    setFilterDepartment('');
    setCurrentPage(1);
  };

  const getStatusSelectClass = (status) => {
    switch (status) {
      case 'อนุมัติ': return 'status-select approved';
      case 'รอตรวจสอบ': return 'status-select pending';
      case 'ปฏิเสธ': return 'status-select rejected';
      default: return 'status-select pending';
    }
  };

  return (
    <div className="admin-layout">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-container">
          <div>
            <h1 className="admin-header-title">จัดการศิษย์เก่า</h1>
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
        {/* Filters */}
        <div className="admin-filters">
          <div className="admin-filters-grid">
            <div className="admin-filter-group">
              <label className="admin-filter-label">ค้นหา</label>
              <input
                type="text"
                placeholder="ชื่อ, นามสกุล, หรือเลขบัตรประชาชน"
                className="admin-filter-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="admin-filter-group">
              <label className="admin-filter-label">สถานะ</label>
              <select
                className="admin-filter-input"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">ทุกสถานะ</option>
                <option value="รอตรวจสอบ">รอตรวจสอบ</option>
                <option value="อนุมัติ">อนุมัติ</option>
                <option value="ปฏิเสธ">ปฏิเสธ</option>
              </select>
            </div>
            
            <div className="admin-filter-group">
              <label className="admin-filter-label">สาขาวิชา</label>
              <select
                className="admin-filter-input"
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
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
                onClick={handleClearFilters}
                className="admin-clear-btn"
                style={{ width: '100%' }}
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
            <>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ชื่อ-นามสกุล</th>
                    <th>สาขา</th>
                    <th>ปีที่จบ</th>
                    <th>สถานะ</th>
                    <th>การจัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {alumni.length > 0 ? (
                    alumni.map((item) => (
                      <tr key={item._id}>
                        <td>
                          <div className="alumni-name">
                            {item.firstName} {item.lastName}
                          </div>
                          <div className="alumni-contact">{item.phone}</div>
                        </td>
                        <td>{item.department}</td>
                        <td>{item.graduationYear}</td>
                        <td>
                          <select
                            value={item.status}
                            onChange={(e) => updateStatus(item._id, e.target.value)}
                            className={getStatusSelectClass(item.status)}
                          >
                            <option value="รอตรวจสอบ">รอตรวจสอบ</option>
                            <option value="อนุมัติ">อนุมัติ</option>
                            <option value="ปฏิเสธ">ปฏิเสธ</option>
                          </select>
                        </td>
                        <td>
                          <button
                            onClick={() => onViewDetail(item)}
                            className="action-btn"
                          >
                            ดูรายละเอียด
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                        <div className="admin-loading-text">
                          {searchTerm || filterStatus || filterDepartment 
                            ? 'ไม่พบข้อมูลที่ตรงกับการค้นหา' 
                            : 'ยังไม่มีข้อมูลศิษย์เก่า'
                          }
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="admin-pagination">
                  <div className="pagination-info">
                    <p>หน้า {currentPage} จาก {totalPages}</p>
                  </div>
                  <div className="pagination-controls">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="pagination-btn"
                    >
                      ก่อนหน้า
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="pagination-btn"
                    >
                      ถัดไป
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default AlumniManagement;