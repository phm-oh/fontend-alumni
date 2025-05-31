// src/components/LabelPrinter.jsx - แก้ไขการปริ้น Label
import React, { useState, useEffect } from 'react';

const LabelPrinter = ({ 
  isOpen, 
  onClose, 
  selectedAlumni = [], 
  labelType = 'minimal',
  onPrintComplete 
}) => {
  const [previewData, setPreviewData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    if (isOpen && selectedAlumni.length > 0) {
      fetchAlumniDetails();
    }
  }, [isOpen, selectedAlumni]);

  const fetchAlumniDetails = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      
      // ดึงรายละเอียดของศิษย์เก่าที่เลือก
      const promises = selectedAlumni.map(id => 
        fetch(`${import.meta.env.VITE_API_URL}/api/alumni/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json())
      );

      const results = await Promise.all(promises);
      const alumniData = results.map(result => result.data || result).filter(Boolean);
      
      setPreviewData(alumniData);
    } catch (error) {
      console.error('Error fetching alumni details:', error);
      showToast('ไม่สามารถโหลดข้อมูลสำหรับปริ้นได้', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 🔥 แก้ไขการปริ้น - เปิดหน้าใหม่จริงๆ
  const handlePrint = async () => {
    if (previewData.length === 0) return;

    setPrinting(true);
    try {
      const token = localStorage.getItem('adminToken');
      
      let printUrl = '';
      let method = 'GET';
      let requestBody = null;

      // 🔥 เลือก endpoint และ method ตามประเภท label
      switch (labelType) {
        case 'minimal':
          if (selectedAlumni.length === 1) {
            // Single minimal label
            printUrl = `${import.meta.env.VITE_API_URL}/api/shipping/labels/minimal/${selectedAlumni[0]}?format=html`;
            method = 'GET';
          } else {
            // Multiple minimal labels - ต้องใช้ bulk endpoint
            printUrl = `${import.meta.env.VITE_API_URL}/api/shipping/labels/bulk`;
            method = 'POST';
            requestBody = { 
              alumniIds: selectedAlumni, 
              format: 'html',
              type: 'minimal' 
            };
          }
          break;
        
        case '4up':
          // 4-up labels (สูงสุด 4 คน)
          printUrl = `${import.meta.env.VITE_API_URL}/api/shipping/labels/4up?format=html`;
          method = 'POST';
          requestBody = { 
            alumniIds: selectedAlumni.slice(0, 4) // เอาแค่ 4 คนแรก
          };
          break;
        
        case 'single':
          if (selectedAlumni.length === 1) {
            // Single full label
            printUrl = `${import.meta.env.VITE_API_URL}/api/shipping/labels/single/${selectedAlumni[0]}?format=html`;
            method = 'GET';
          } else {
            // Multiple full labels
            printUrl = `${import.meta.env.VITE_API_URL}/api/shipping/labels/bulk`;
            method = 'POST';
            requestBody = { 
              alumniIds: selectedAlumni, 
              format: 'html',
              type: 'single' 
            };
          }
          break;
        
        default:
          throw new Error('ประเภท label ไม่ถูกต้อง');
      }

      console.log('🖨️ Printing:', { printUrl, method, requestBody, labelType });

      // 🔥 เรียก API และรับ HTML
      const fetchOptions = {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          ...(method === 'POST' && { 'Content-Type': 'application/json' })
        },
        ...(requestBody && { body: JSON.stringify(requestBody) })
      };

      const response = await fetch(printUrl, fetchOptions);

      if (response.ok) {
        // 🔥 รับ HTML content
        const htmlContent = await response.text();
        
        // 🔥 เปิดหน้าต่างใหม่และแสดง HTML
        const printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes');
        
        if (printWindow) {
          printWindow.document.open();
          printWindow.document.write(htmlContent);
          printWindow.document.close();
          
          // 🔥 รอให้โหลดเสร็จแล้วเปิด print dialog
          printWindow.onload = () => {
            // ให้เวลา render เสร็จ
            setTimeout(() => {
              printWindow.print();
              // ไม่ปิดหน้าต่างทันที ให้ user ดูได้
            }, 500);
          };
          
          showToast(`เปิดหน้าปริ้น label ${previewData.length} รายการแล้ว`, 'success');
        } else {
          throw new Error('ไม่สามารถเปิดหน้าต่างปริ้นได้ (popup ถูกบล็อก)');
        }
        
        // 🔥 อัปเดตสถานะการจัดส่งหลังปริ้น (optional)
        if (onPrintComplete) {
          onPrintComplete(selectedAlumni);
        }
        
        onClose();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'ไม่สามารถสร้าง label ได้');
      }
    } catch (error) {
      console.error('Error printing labels:', error);
      showToast(`เกิดข้อผิดพลาด: ${error.message}`, 'error');
    } finally {
      setPrinting(false);
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

  const getLabelTypeName = () => {
    switch (labelType) {
      case 'minimal': return 'Label เล็ก (A6)';
      case '4up': return 'Label A4 (4 ใบต่อหน้า)';
      case 'single': return 'Label เต็ม (A4)';
      default: return 'Label';
    }
  };

  // 🔥 Preview Component ที่แสดงตัวอย่างได้ดีขึ้น
  const LabelPreview = ({ alumni, type }) => {
    const labelStyle = {
      minimal: {
        width: '100%',
        maxWidth: '300px',
        border: '2px dashed #007bff',
        padding: '12px',
        margin: '8px',
        fontSize: '12px',
        lineHeight: '1.4',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
      },
      '4up': {
        width: '48%',
        border: '2px dashed #28a745',
        padding: '10px',
        margin: '1%',
        fontSize: '11px',
        lineHeight: '1.3',
        display: 'inline-block',
        verticalAlign: 'top',
        backgroundColor: '#f8fff8',
        borderRadius: '6px'
      },
      single: {
        width: '100%',
        maxWidth: '400px',
        border: '2px dashed #17a2b8',
        padding: '16px',
        margin: '8px',
        fontSize: '14px',
        lineHeight: '1.5',
        backgroundColor: '#f0f8ff',
        borderRadius: '8px'
      }
    };

    return (
      <div style={labelStyle[type] || labelStyle.minimal} className="label-preview">
        <div style={{ 
          fontWeight: 'bold', 
          marginBottom: '8px',
          color: '#333',
          borderBottom: '1px solid #ddd',
          paddingBottom: '4px'
        }}>
          📦 {alumni.firstName} {alumni.lastName}
        </div>
        <div style={{ 
          marginBottom: '6px', 
          fontSize: type === '4up' ? '10px' : '12px',
          color: '#666'
        }}>
          🎓 {alumni.department} รุ่น {alumni.graduationYear}
        </div>
        <div style={{ 
          marginBottom: '6px',
          fontSize: type === '4up' ? '10px' : '12px'
        }}>
          📞 {alumni.phone}
        </div>
        <div style={{ 
          fontSize: type === '4up' ? '9px' : type === 'minimal' ? '10px' : '12px',
          color: '#555',
          borderTop: '1px solid #eee',
          paddingTop: '6px',
          marginTop: '8px',
          lineHeight: '1.3'
        }}>
          📍 {alumni.address?.length > (type === '4up' ? 50 : type === 'minimal' ? 70 : 100)
            ? `${alumni.address.substring(0, type === '4up' ? 50 : type === 'minimal' ? 70 : 100)}...`
            : alumni.address}
        </div>
        {type !== '4up' && (
          <div style={{
            marginTop: '8px',
            fontSize: '9px',
            color: '#999',
            textAlign: 'center',
            fontStyle: 'italic'
          }}>
            สมาคมศิษย์เก่า วิทยาลัยอาชีวศึกษาอุดรธานี
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" style={{ zIndex: 1500 }}>
      <div className="modal-container" style={{ maxWidth: '900px', maxHeight: '90vh' }}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">🏷️ ปริ้น Label การจัดส่ง</h2>
          <button onClick={onClose} className="modal-close">×</button>
        </div>

        {/* Content */}
        <div className="modal-content" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Info */}
          <div className="label-info" style={{
            backgroundColor: '#f8f9fa',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #dee2e6'
          }}>
            <div className="label-info-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px'
            }}>
              <div className="label-info-item">
                <span className="label-info-label" style={{ fontWeight: 'bold', color: '#495057' }}>ประเภท:</span>
                <span className="label-info-value" style={{ marginLeft: '8px', color: '#007bff' }}>
                  {getLabelTypeName()}
                </span>
              </div>
              <div className="label-info-item">
                <span className="label-info-label" style={{ fontWeight: 'bold', color: '#495057' }}>จำนวน:</span>
                <span className="label-info-value" style={{ marginLeft: '8px', color: '#28a745', fontWeight: 'bold' }}>
                  {previewData.length} รายการ
                </span>
              </div>
              <div className="label-info-item">
                <span className="label-info-label" style={{ fontWeight: 'bold', color: '#495057' }}>กระดาษ:</span>
                <span className="label-info-value" style={{ marginLeft: '8px', color: '#17a2b8' }}>
                  {labelType === '4up' ? 'A4 (แนวนอน)' : labelType === 'minimal' ? 'A6' : 'A4'}
                </span>
              </div>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="admin-loading" style={{ textAlign: 'center', padding: '40px' }}>
              <div className="spinner"></div>
              <p className="admin-loading-text">กำลังโหลดข้อมูลสำหรับปริ้น...</p>
            </div>
          )}

          {/* Preview */}
          {!loading && previewData.length > 0 && (
            <div className="label-preview-container">
              <h3 style={{ marginBottom: '16px', color: '#495057' }}>📋 ตัวอย่าง Label</h3>
              <div className="label-preview-grid" style={{
                display: labelType === '4up' ? 'block' : 'flex',
                flexDirection: labelType === '4up' ? 'row' : 'column',
                flexWrap: 'wrap',
                justifyContent: labelType === '4up' ? 'flex-start' : 'center'
              }}>
                {previewData.slice(0, labelType === '4up' ? 4 : 3).map((alumni) => (
                  <LabelPreview 
                    key={alumni._id}
                    alumni={alumni}
                    type={labelType}
                  />
                ))}
                {previewData.length > (labelType === '4up' ? 4 : 3) && (
                  <div style={{
                    padding: '20px',
                    textAlign: 'center',
                    color: '#6c757d',
                    fontStyle: 'italic',
                    fontSize: '14px'
                  }}>
                    ... และอีก {previewData.length - (labelType === '4up' ? 4 : 3)} รายการ
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && previewData.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#6c757d'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
              <p>ไม่พบข้อมูลสำหรับปริ้น</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="modal-actions">
          <button
            className="btn btn-primary"
            onClick={handlePrint}
            disabled={loading || printing || previewData.length === 0}
            style={{
              backgroundColor: printing ? '#6c757d' : '#007bff',
              borderColor: printing ? '#6c757d' : '#007bff',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            {printing ? (
              <>
                <div className="spinner" style={{ 
                  width: '16px', 
                  height: '16px', 
                  marginRight: '8px',
                  display: 'inline-block'
                }}></div>
                กำลังเปิดหน้าปริ้น...
              </>
            ) : (
              <>
                🖨️ ปริ้น {previewData.length} รายการ
              </>
            )}
          </button>
          <button
            className="btn btn-outline"
            onClick={onClose}
            disabled={printing}
            style={{ padding: '12px 24px', fontSize: '16px' }}
          >
            ยกเลิก
          </button>
        </div>

        {/* Tips */}
        <div className="label-tips" style={{
          backgroundColor: '#fff3cd',
          padding: '16px',
          borderRadius: '8px',
          marginTop: '16px',
          border: '1px solid #ffeaa7'
        }}>
          <h4 style={{ color: '#856404', marginBottom: '12px' }}>💡 คำแนะนำการปริ้น:</h4>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#856404', lineHeight: '1.6' }}>
            <li>Label เล็ก (A6) เหมาะสำหรับซองธรรมดา</li>
            <li>Label A4 (4 ใบต่อหน้า) ประหยัดกระดาษ วางกระดาษแนวนอน</li>
            <li>ตรวจสอบที่อยู่ให้ถูกต้องก่อนปริ้น</li>
            <li>ใช้กระดาษสติ๊กเกอร์สำหรับผลลัพธ์ที่ดี</li>
            <li>หากปุ่ม popup ถูกบล็อก กรุณาอนุญาต popup ในเบราว์เซอร์</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LabelPrinter;