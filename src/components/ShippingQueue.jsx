// src/components/ShippingQueue.jsx - แก้ API ให้ถูกต้องตาม backend
import React, { useState, useEffect } from 'react';
import LabelPrinter from './LabelPrinter';

const ShippingQueue = ({ user, onLogout, onNavigate }) => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [filters, setFilters] = useState({
    department: '',
    graduationYear: '',
    search: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // State สำหรับ LabelPrinter
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [labelType, setLabelType] = useState('minimal');
  const [currentPrintBatch, setCurrentPrintBatch] = useState([]);
  const [printQueue, setPrintQueue] = useState([]);
  const [showBatchModal, setShowBatchModal] = useState(false);

  useEffect(() => {
    fetchShippingQueue();
  }, [currentPage, filters]);

  const fetchShippingQueue = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      
      // 🔥 แก้: ใช้ shipping-list API
      const queryParams = new URLSearchParams();
      queryParams.append('page', currentPage.toString());
      queryParams.append('limit', '10');
      queryParams.append('shippingStatus', 'รอการจัดส่ง'); // ใช้ shippingStatus แทน status

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
      console.log('🔍 Fetching shipping queue:', url);

      const response = await fetch(url, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('📦 Queue data received:', data);
        
        // ข้อมูลจาก shipping-list API ควรจะกรองมาแล้ว
        const queueData = data.data || [];
        const totalPages = data.totalPages || Math.ceil((data.total || queueData.length) / 10);
        
        setQueue(queueData);
        setTotalPages(totalPages);
        
        console.log(`📋 Shipping queue: ${queueData.length} items ready to ship`);
      } else {
        console.error('❌ Failed to fetch shipping queue:', response.status);
        setQueue([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('❌ Error fetching shipping queue:', error);
      setQueue([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.length === queue.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(queue.map(item => item._id));
    }
  };

  const handleSelectItem = (itemId) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  // 🔥 แก้: ใช้ bulk-shipping API
  const handleBulkUpdateStatus = async (newStatus) => {
    if (selectedItems.length === 0) {
      showToast('กรุณาเลือกรายการที่ต้องการอัปเดต', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/alumni/bulk-shipping`, {
        method: 'POST', // เปลี่ยนจาก PATCH เป็น POST
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          alumniIds: selectedItems, // ถูกแล้ว
          shippingStatus: newStatus, // ไม่ต้องใส่ใน shippingData
          notes: `อัปเดตจาก Shipping Queue - ${new Date().toLocaleDateString('th-TH')}`
        })
      });

      if (response.ok) {
        const result = await response.json();
        showToast(`อัปเดตสถานะ ${selectedItems.length} รายการแล้ว`, 'success');
        setSelectedItems([]);
        fetchShippingQueue(); // รีเฟรชข้อมูล
      } else {
        const errorData = await response.json();
        showToast(errorData.message || 'ไม่สามารถอัปเดตสถานะได้', 'error');
        console.error('Bulk update error:', errorData);
      }
    } catch (error) {
      console.error('Error updating bulk status:', error);
      showToast('เกิดข้อผิดพลาดในการอัปเดตสถานะ', 'error');
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

  const handleClearFilters = () => {
    setFilters({
      department: '',
      graduationYear: '',
      search: ''
    });
    setCurrentPage(1);
  };

  // 🔥 แก้ไขการปริ้น Label ให้จัดการ 5+ รายการได้
  const handlePrintLabels = (type) => {
    if (selectedItems.length === 0) {
      showToast('กรุณาเลือกรายการที่ต้องการปริ้น label', 'error');
      return;
    }

    console.log('🖨️ Print request:', { type, count: selectedItems.length });

    // เช็คว่าถ้าเป็น 4up และเลือกมากกว่า 4
    if (type === '4up' && selectedItems.length > 4) {
      handleBatchPrint(type);
      return;
    }

    // ปกติ
    setCurrentPrintBatch(selectedItems);
    setLabelType(type);
    setShowLabelModal(true);
  };

  // 🔥 จัดการการปริ้นแบบ batch สำหรับ 4up
  const handleBatchPrint = (type) => {
    const batches = [];
    const itemsCopy = [...selectedItems];

    // แบ่งเป็น batch ละ 4
    while (itemsCopy.length > 0) {
      const batch = itemsCopy.splice(0, 4);
      batches.push(batch);
    }

    console.log('📦 Created batches:', batches);

    if (batches.length === 1) {
      // ถ้ามีแค่ batch เดียว ปริ้นปกติ
      setCurrentPrintBatch(batches[0]);
      setLabelType(type);
      setShowLabelModal(true);
    } else {
      // ถ้ามีหลาย batch ให้เลือก
      setPrintQueue(batches);
      setLabelType(type);
      setShowBatchModal(true);
    }
  };

  // 🔥 ปริ้นทีละ batch
  const handlePrintBatch = async (batchIndex) => {
    const batch = printQueue[batchIndex];
    if (!batch || batch.length === 0) return;

    console.log(`🖨️ Printing batch ${batchIndex + 1}:`, batch);

    setCurrentPrintBatch(batch);
    setShowBatchModal(false);
    setShowLabelModal(true);
  };

  // 🔥 ปริ้นทุก batch ทีเดียว - แก้ไขให้ทำงานถูกต้อง
  const handlePrintAllBatches = async () => {
    showToast(`กำลังเปิดหน้าปริ้น ${printQueue.length} ชุด`, 'info');
    setShowBatchModal(false);

    // เปิดหน้าปริ้นทุกชุดพร้อมกัน (ไม่ต้อง await)
    let successCount = 0;
    
    printQueue.forEach((batch, index) => {
      console.log(`🖨️ Opening print window for batch ${index + 1}/${printQueue.length}:`, batch);
      
      // เปิดทีละหน้าต่างโดยไม่ await
      setTimeout(() => {
        printBatchDirectly(batch, index + 1)
          .then(() => {
            successCount++;
            console.log(`✅ Batch ${index + 1} opened successfully`);
            
            // เช็คว่าเปิดครบทุกชุดแล้วหรือยัง
            if (successCount === printQueue.length) {
              showToast(`เปิดหน้าปริ้นครบ ${printQueue.length} ชุดแล้ว`, 'success');
            }
          })
          .catch((error) => {
            console.error(`❌ Failed to open batch ${index + 1}:`, error);
            showToast(`เกิดข้อผิดพลาดในชุดที่ ${index + 1}`, 'error');
          });
      }, index * 800); // เว้นระยะห่าง 800ms ระหว่างการเปิดแต่ละหน้าต่าง
    });

    // ล้างข้อมูลหลังจากส่งคำสั่งปริ้นทั้งหมดแล้ว
    setTimeout(() => {
      setPrintQueue([]);
      setSelectedItems([]);
    }, printQueue.length * 800 + 1000);
  };

  // 🔥 ฟังก์ชันปริ้น batch โดยตรง (แก้ให้ return Promise)
  const printBatchDirectly = async (batch, batchNumber) => {
    return new Promise(async (resolve, reject) => {
      try {
        const token = localStorage.getItem('adminToken');
        
        let printUrl = `${import.meta.env.VITE_API_URL}/api/shipping/labels/4up?format=html`;
        
        const response = await fetch(printUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            alumniIds: batch.slice(0, 4) // ป้องกันเกิน 4
          })
        });

        if (response.ok) {
          const htmlContent = await response.text();
          
          // เปิดหน้าต่างใหม่
          const printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes');
          
          if (printWindow) {
            printWindow.document.open();
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            
            // เปลี่ยน title ให้เห็นว่าเป็น batch ไหน
            printWindow.document.title = `Label Batch ${batchNumber} (${batch.length} รายการ)`;
            
            printWindow.onload = () => {
              setTimeout(() => {
                printWindow.print();
                resolve(); // เสร็จแล้ว
              }, 500);
            };
            
            // ถ้าไม่มี onload ให้ resolve หลัง 1 วินาที
            setTimeout(() => {
              resolve();
            }, 1000);
            
            console.log(`✅ Opened print window for batch ${batchNumber}`);
          } else {
            reject(new Error('ไม่สามารถเปิดหน้าต่างปริ้นได้ (popup ถูกบล็อก)'));
          }
        } else {
          reject(new Error(`ไม่สามารถปริ้น batch ${batchNumber} ได้`));
        }
      } catch (error) {
        console.error(`❌ Error printing batch ${batchNumber}:`, error);
        reject(error);
      }
    });
  };

  // 🔥 เพิ่มฟังก์ชันสำหรับ single label
  const handlePrintSingleLabel = (alumniId, type = 'minimal') => {
    console.log('🖨️ Printing single label:', { alumniId, type });
    setCurrentPrintBatch([alumniId]);
    setLabelType(type);
    setShowLabelModal(true);
  };

  // 🔥 Callback เมื่อปริ้นเสร็จ
  const handlePrintComplete = (printedIds) => {
    console.log('✅ Print completed for:', printedIds);
    
    // ถ้ายังมี queue อยู่ ไม่ต้องล้าง selectedItems
    if (printQueue.length === 0) {
      setSelectedItems([]);
    }
  };

  // 🔥 แสดงข้อมูลรายการที่เลือก
  const getSelectedItemsInfo = () => {
    if (selectedItems.length === 0) return '';
    
    if (selectedItems.length <= 4) {
      return `${selectedItems.length} รายการ`;
    } else {
      const batches = Math.ceil(selectedItems.length / 4);
      return `${selectedItems.length} รายการ (แบ่ง ${batches} ชุด)`;
    }
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
            <h1 className="admin-header-title">📋 คิวการจัดส่ง</h1>
            <p className="admin-header-subtitle">รายชื่อที่พร้อมจัดส่ง</p>
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
        {/* 🔥 Enhanced Bulk Actions - แสดงข้อมูลที่ดีขึ้น */}
        {selectedItems.length > 0 && (
          <div className="bulk-actions">
            <div className="bulk-actions-info">
              <span>เลือกแล้ว {getSelectedItemsInfo()}</span>
              {selectedItems.length > 4 && (
                <span className="bulk-info-note">
                  💡 Label A4 จะแบ่งเป็น {Math.ceil(selectedItems.length / 4)} ชุด
                </span>
              )}
            </div>
            <div className="bulk-actions-buttons">
              <button
                className="btn btn-outline btn-sm"
                onClick={() => handlePrintLabels('4up')}
              >
                📄 ปริ้น Label A4
                {selectedItems.length > 4 && (
                  <span className="batch-count">
                    ({Math.ceil(selectedItems.length / 4)} ชุด)
                  </span>
                )}
              </button>
              <button
                className="btn btn-success btn-sm"
                onClick={() => handleBulkUpdateStatus('กำลังจัดส่ง')}
              >
                📦 อัปเดตเป็น "กำลังจัดส่ง"
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
              <label className="admin-filter-label">ปีที่จบ</label>
              <select
                className="admin-filter-input"
                value={filters.graduationYear}
                onChange={(e) => setFilters({...filters, graduationYear: e.target.value})}
              >
                <option value="">ทุกปี</option>
                <option value="2567">2567</option>
                <option value="2566">2566</option>
                <option value="2565">2565</option>
                <option value="2564">2564</option>
                <option value="2563">2563</option>
              </select>
            </div>
            
            <div className="admin-filter-group">
              <button
                onClick={handleClearFilters}
                className="admin-clear-btn"
              >
                ล้างตัวกรอง
              </button>
            </div>
          </div>
        </div>

        {/* Queue Table */}
        <div className="admin-table-container">
          {loading ? (
            <div className="admin-loading">
              <div className="spinner"></div>
              <p className="admin-loading-text">กำลังโหลดคิวการจัดส่ง...</p>
            </div>
          ) : (
            <>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: '50px' }}>
                      <input
                        type="checkbox"
                        checked={selectedItems.length === queue.length && queue.length > 0}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th>ชื่อ-นามสกุล</th>
                    <th>สาขา/ปี</th>
                    <th>ที่อยู่</th>
                    <th>เบอร์โทร</th>
                    <th>วันที่อนุมัติ</th>
                    <th>การจัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {queue.length > 0 ? (
                    queue.map((item) => (
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
                          <div className="alumni-id">
                            ID: {item.idCard?.substring(0, 4)}****{item.idCard?.substring(9)}
                          </div>
                        </td>
                        <td>
                          <div className="alumni-education">
                            {item.department}
                          </div>
                          <div className="alumni-year">รุ่น {item.graduationYear}</div>
                        </td>
                        <td>
                          <div className="alumni-address">
                            {item.address?.length > 50 
                              ? `${item.address.substring(0, 50)}...` 
                              : item.address}
                          </div>
                        </td>
                        <td>
                          <div className="alumni-contact">{item.phone}</div>
                        </td>
                        <td>
                          {item.statusHistory?.length > 0 
                            ? new Date(item.statusHistory.find(h => h.status === 'อนุมัติ')?.updatedAt || item.updatedAt).toLocaleDateString('th-TH')
                            : new Date(item.updatedAt).toLocaleDateString('th-TH')
                          }
                        </td>
                        <td>
                          <div className="table-actions">
                            <button
                              className="action-btn action-btn-sm"
                              onClick={() => handlePrintSingleLabel(item._id, 'minimal')}
                              title="ปริ้น Label เล็ก"
                            >
                              🏷️ Label
                            </button>
                          </div>
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

      {/* 🔥 LabelPrinter Modal */}
      {showLabelModal && (
        <LabelPrinter
          isOpen={showLabelModal}
          onClose={() => setShowLabelModal(false)}
          selectedAlumni={currentPrintBatch}
          labelType={labelType}
          onPrintComplete={handlePrintComplete}
        />
      )}

      {/* 🔥 Batch Selection Modal - ใหม่! */}
      {showBatchModal && (
        <div className="modal-backdrop">
          <div className="modal-container">
            <div className="modal-header">
              <h2 className="modal-title">📦 เลือกวิธีการปริ้น</h2>
              <button
                onClick={() => setShowBatchModal(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>

            <div className="modal-content">
              <div className="batch-info">
                <p className="batch-summary">
                  <strong>เลือกไว้ {selectedItems.length} รายการ</strong><br/>
                  จะแบ่งเป็น <strong>{printQueue.length} ชุด</strong> (ชุดละ 4 คน)
                </p>
                
                {/* 🔥 เพิ่มข้อความเตือน */}
                <div className="batch-warning" style={{
                  backgroundColor: '#fff3cd',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #ffeaa7',
                  marginTop: '12px'
                }}>
                  <div style={{ color: '#856404', fontSize: '14px' }}>
                    <strong>📋 รายละเอียดการแบ่งชุด:</strong>
                    <ul style={{ margin: '8px 0', paddingLeft: '20px', lineHeight: '1.6' }}>
                      {printQueue.map((batch, index) => (
                        <li key={index}>
                          <strong>ชุดที่ {index + 1}:</strong> {batch.length} รายการ
                          {batch.length === 4 ? ' (เต็ม)' : ' (ไม่เต็ม)'}
                        </li>
                      ))}
                    </ul>
                    <p style={{ margin: '8px 0 0 0', fontSize: '13px', fontStyle: 'italic' }}>
                      💡 Label A4 (4-up) จำกัดแค่ 4 รายการต่อชุด เพื่อให้พอดีกับกระดาษ A4
                    </p>
                  </div>
                </div>
              </div>

              <div className="batch-options">
                <h3>เลือกวิธีการ:</h3>
                
                <button
                  className="btn btn-primary btn-large"
                  onClick={handlePrintAllBatches}
                  style={{ marginBottom: '16px', width: '100%' }}
                >
                  🖨️ ปริ้นทุกชุดพร้อมกัน ({printQueue.length} หน้าต่าง)
                  <div style={{ fontSize: '12px', fontWeight: 'normal', marginTop: '4px' }}>
                    แต่ละหน้าต่างจะเปิดห่างกัน 0.8 วินาที
                  </div>
                </button>

                <div className="batch-list">
                  <h4>หรือเลือกปริ้นทีละชุด:</h4>
                  {printQueue.map((batch, index) => (
                    <div key={index} className="batch-item" style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px',
                      marginBottom: '8px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      border: '1px solid #dee2e6'
                    }}>
                      <div className="batch-info">
                        <strong>ชุดที่ {index + 1}</strong>
                        <span className="batch-count" style={{ marginLeft: '8px', color: '#666' }}>
                          ({batch.length} คน{batch.length === 4 ? ' - เต็ม' : ' - ไม่เต็ม'})
                        </span>
                      </div>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => handlePrintBatch(index)}
                      >
                        ปริ้นชุดนี้
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-outline"
                onClick={() => setShowBatchModal(false)}
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

export default ShippingQueue;