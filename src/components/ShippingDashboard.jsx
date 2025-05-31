// src/components/ShippingDashboard.jsx - แก้ Statistics API ให้ถูกต้อง
import React, { useState, useEffect } from 'react';

const ShippingDashboard = ({ user, onLogout, onNavigate }) => {
  const [stats, setStats] = useState({
    pending: 0,      // รอการจัดส่ง
    shipping: 0,     // กำลังจัดส่ง  
    delivered: 0,    // จัดส่งแล้ว
    overdue: 0       // ค้างนาน > 7 วัน
  });
  const [monthlyChart, setMonthlyChart] = useState([]);
  const [urgentList, setUrgentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchShippingData();
  }, []);

  const fetchShippingData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('adminToken');
      
      console.log('🔍 Fetching shipping statistics from correct API...');
      
      // 🔥 แก้: ใช้ shipping-statistics API ที่ถูกต้อง
      await fetchShippingStatistics(token);
      
      // ดึงรายการด่วน (ค้างนาน > 7 วัน)
      await fetchUrgentShipments(token);

      // ดึงข้อมูลกราฟรายเดือนจริง
      await fetchRealMonthlyChart(token);

    } catch (error) {
      console.error('❌ Error fetching shipping data:', error);
      setError('ไม่สามารถโหลดข้อมูลการจัดส่งได้');
    } finally {
      setLoading(false);
    }
  };

  // 🔥 แก้: ใช้ shipping-statistics API ตาม backend จริง + เพิ่ม debug
  const fetchShippingStatistics = async (token) => {
    try {
      console.log('📊 Fetching shipping statistics from:', `${import.meta.env.VITE_API_URL}/api/alumni/shipping-statistics`);
      
      const statsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/alumni/shipping-statistics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        console.log('📊 RAW shipping statistics response:', JSON.stringify(statsData, null, 2));
        
        // 🔥 เพิ่มการ debug เพื่อดู structure ของ response
        if (statsData.success) {
          console.log('✅ API Success:', statsData.data);
        } else {
          console.log('❌ API Failed:', statsData.message);
        }
        
        // 🔥 แปลงข้อมูลให้ยืดหยุ่นมากขึ้น - ลองหลายรูปแบบ
        let shippingStats = {
          pending: 0,
          shipping: 0,
          delivered: 0,
          overdue: 0
        };

        // ลองหลายรูปแบบ response
        const data = statsData.data || statsData;
        
        // รูปแบบที่ 1: object keys เป็นภาษาอังกฤษ
        if (data.pending !== undefined) {
          shippingStats.pending = data.pending || 0;
          shippingStats.shipping = data.shipping || 0;
          shippingStats.delivered = data.delivered || 0;
          shippingStats.overdue = data.overdue || 0;
        }
        // รูปแบบที่ 2: object keys เป็นภาษาไทย
        else if (data['รอการจัดส่ง'] !== undefined) {
          shippingStats.pending = data['รอการจัดส่ง'] || 0;
          shippingStats.shipping = data['กำลังจัดส่ง'] || 0;
          shippingStats.delivered = data['จัดส่งแล้ว'] || 0;
          shippingStats.overdue = data['ค้างนาน'] || 0;
        }
        // รูปแบบที่ 3: array format
        else if (Array.isArray(data)) {
          console.log('📊 Response is array format:', data);
          // คำนวณจาก array
          data.forEach(item => {
            if (item.status === 'รอการจัดส่ง') shippingStats.pending += item.count || 1;
            if (item.status === 'กำลังจัดส่ง') shippingStats.shipping += item.count || 1;
            if (item.status === 'จัดส่งแล้ว') shippingStats.delivered += item.count || 1;
          });
        }
        // รูปแบบที่ 4: ถ้าไม่ตรงรูปแบบไหนเลย ให้คำนวณเอง
        else {
          console.warn('⚠️ Unknown statistics format, calculating manually...');
          await calculateRealShippingStats(token);
          return;
        }
        
        console.log('📊 Final parsed shipping stats:', shippingStats);
        setStats(shippingStats);
      } else {
        console.warn('⚠️ Shipping statistics API failed with status:', statsRes.status);
        // ถ้า API ไม่ทำงาน ให้คำนวณเอง
        await calculateRealShippingStats(token);
      }
    } catch (error) {
      console.error('❌ Error fetching shipping statistics:', error);
      // Fallback: คำนวณเอง
      await calculateRealShippingStats(token);
    }
  };

  // 🔥 สำรอง: คำนวณสถิติการจัดส่งจากข้อมูลจริง (ใช้ shipping-list)
  const calculateRealShippingStats = async (token) => {
    try {
      console.log('🧮 Calculating shipping stats manually from shipping-list...');
      
      // ดึงข้อมูลจาก shipping-list API
      const alumniRes = await fetch(`${import.meta.env.VITE_API_URL}/api/alumni/shipping-list?limit=1000`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (alumniRes.ok) {
        const alumniData = await alumniRes.json();
        const shippingAlumni = alumniData.data || [];
        
        console.log('👥 Alumni with shipping needs:', shippingAlumni.length);
        
        // คำนวณสถิติจริง
        const shippingStats = {
          pending: 0,
          shipping: 0,
          delivered: 0,
          overdue: 0
        };
        
        const currentDate = new Date();
        const sevenDaysAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        shippingAlumni.forEach(alumni => {
          const shippingStatus = alumni.shippingStatus || 'รอการจัดส่ง';
          const createdDate = new Date(alumni.createdAt);
          
          switch (shippingStatus) {
            case 'รอการจัดส่ง':
              shippingStats.pending++;
              // เช็คว่าค้างนานเกิน 7 วันไหม
              if (createdDate < sevenDaysAgo) {
                shippingStats.overdue++;
              }
              break;
            case 'กำลังจัดส่ง':
              shippingStats.shipping++;
              break;
            case 'จัดส่งแล้ว':
              shippingStats.delivered++;
              break;
          }
        });
        
        console.log('📊 Calculated shipping stats:', shippingStats);
        setStats(shippingStats);
      } else {
        throw new Error('ไม่สามารถดึงข้อมูลศิษย์เก่าได้');
      }
    } catch (error) {
      console.error('❌ Error calculating shipping stats:', error);
      // ถ้าคำนวณไม่ได้ ให้ใช้ค่าเริ่มต้น
      setStats({
        pending: 0,
        shipping: 0,
        delivered: 0,
        overdue: 0
      });
    }
  };

  // ดึงข้อมูลกราฟรายเดือนจากข้อมูลจริง
  const fetchRealMonthlyChart = async (token) => {
    try {
      console.log('📈 Fetching monthly chart data...');
      
      // ดึงข้อมูลศิษย์เก่าที่จัดส่งแล้วทั้งหมด
      const deliveredRes = await fetch(`${import.meta.env.VITE_API_URL}/api/alumni/shipping-list?shippingStatus=จัดส่งแล้ว&limit=1000`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (deliveredRes.ok) {
        const deliveredData = await deliveredRes.json();
        const deliveredAlumni = deliveredData.data || [];
        
        console.log('📦 Delivered alumni found:', deliveredAlumni.length);
        
        // สร้างข้อมูลรายเดือน 12 เดือนล่าสุด
        const currentDate = new Date();
        const monthlyData = [];
        
        for (let i = 11; i >= 0; i--) {
          const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
          const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 1);
          
          const monthName = targetDate.toLocaleDateString('th-TH', { 
            month: 'short',
            year: '2-digit' 
          });
          
          // นับจำนวนคนที่จัดส่งในเดือนนั้น
          const countInMonth = deliveredAlumni.filter(alumni => {
            if (!alumni.shippedDate && !alumni.updatedAt) return false;
            
            const dateToCheck = new Date(alumni.shippedDate || alumni.updatedAt);
            return dateToCheck >= targetDate && dateToCheck < nextMonth;
          }).length;
          
          monthlyData.push({
            month: monthName,
            count: countInMonth,
            year: targetDate.getFullYear(),
            targetDate: targetDate
          });
        }
        
        console.log('📈 Monthly chart data:', monthlyData);
        setMonthlyChart(monthlyData);
        
      } else {
        console.warn('⚠️ Cannot fetch delivered alumni, using registration dates instead...');
        // ถ้าไม่มีข้อมูล delivered ให้ใช้วันที่ลงทะเบียนแทน
        await fetchMonthlyRegistrationChart(token);
      }
      
    } catch (error) {
      console.error('❌ Error fetching monthly chart:', error);
      // ถ้าเกิดข้อผิดพลาด ให้ใช้ข้อมูลการลงทะเบียนแทน
      await fetchMonthlyRegistrationChart(token);
    }
  };

  // สำรองกรณีไม่มีข้อมูลการจัดส่ง ใช้ข้อมูลการลงทะเบียนแทน
  const fetchMonthlyRegistrationChart = async (token) => {
    try {
      console.log('📊 Using registration data as fallback for monthly chart...');
      
      const alumniRes = await fetch(`${import.meta.env.VITE_API_URL}/api/alumni/shipping-list?limit=1000`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (alumniRes.ok) {
        const alumniData = await alumniRes.json();
        const allAlumni = alumniData.data || [];
        
        const currentDate = new Date();
        const monthlyData = [];
        
        for (let i = 11; i >= 0; i--) {
          const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
          const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 1);
          
          const monthName = targetDate.toLocaleDateString('th-TH', { 
            month: 'short',
            year: '2-digit' 
          });
          
          // นับจำนวนคนที่ลงทะเบียนในเดือนนั้น
          const countInMonth = allAlumni.filter(alumni => {
            const createdDate = new Date(alumni.createdAt);
            return createdDate >= targetDate && createdDate < nextMonth;
          }).length;
          
          monthlyData.push({
            month: monthName,
            count: countInMonth,
            year: targetDate.getFullYear()
          });
        }
        
        console.log('📊 Registration-based monthly data:', monthlyData);
        setMonthlyChart(monthlyData);
      }
    } catch (error) {
      console.error('❌ Error fetching registration chart:', error);
      setMonthlyChart([]);
    }
  };

  // ดึงรายการด่วน (ค้างนาน > 7 วัน)
  const fetchUrgentShipments = async (token) => {
    try {
      console.log('🚨 Fetching urgent shipments...');
      
      // ดึงข้อมูลคนที่รอการจัดส่ง
      const urgentRes = await fetch(`${import.meta.env.VITE_API_URL}/api/alumni/shipping-list?shippingStatus=รอการจัดส่ง&limit=100`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (urgentRes.ok) {
        const urgentData = await urgentRes.json();
        const allShippingAlumni = urgentData.data || [];
        
        // กรองเฉพาะที่ค้างนาน > 7 วัน
        const currentDate = new Date();
        const sevenDaysAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        const urgentList = allShippingAlumni
          .filter(alumni => {
            const createdDate = new Date(alumni.createdAt);
            return createdDate < sevenDaysAgo;
          })
          .map(alumni => {
            const createdDate = new Date(alumni.createdAt);
            const daysPending = Math.floor((currentDate - createdDate) / (1000 * 60 * 60 * 24));
            return { ...alumni, daysPending };
          })
          .sort((a, b) => b.daysPending - a.daysPending) // เรียงจากค้างนานที่สุด
          .slice(0, 10); // เอาแค่ 10 อันดับแรก
        
        console.log('🚨 Urgent shipments found:', urgentList.length);
        setUrgentList(urgentList);
      }
    } catch (error) {
      console.error('❌ Error fetching urgent shipments:', error);
      setUrgentList([]);
    }
  };

  const StatCard = ({ title, value, icon, color = "blue", onClick, subtitle }) => (
    <div className={`stat-card ${onClick ? 'clickable' : ''}`} onClick={onClick}>
      <div className="stat-card-header">
        <div>
          <p className="stat-card-title">{title}</p>
          <p className="stat-card-value">{value}</p>
          {subtitle && <p className="stat-card-subtitle">{subtitle}</p>}
        </div>
        <div className={`stat-card-icon ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  // Refresh Button
  const handleRefresh = () => {
    console.log('🔄 Refreshing shipping dashboard...');
    fetchShippingData();
  };

  if (loading) {
    return (
      <div className="admin-layout">
        <div className="admin-loading">
          <div className="spinner"></div>
          <p className="admin-loading-text">กำลังโหลดข้อมูลการจัดส่งจากฐานข้อมูล...</p>
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
            <h1 className="admin-header-title">📦 ระบบการจัดส่ง</h1>
            <p className="admin-header-subtitle">
              จัดการการส่งบัตรสมาชิกศิษย์เก่า 
              <span style={{ fontSize: '12px', color: '#28a745', marginLeft: '8px' }}>
                ✅ ข้อมูลจาก shipping-statistics API
              </span>
            </p>
            {error && (
              <p style={{ color: '#dc3545', fontSize: '14px', marginTop: '4px' }}>
                ⚠️ {error}
              </p>
            )}
          </div>
          <div className="admin-header-user">
            <button 
              onClick={handleRefresh}
              className="btn btn-outline btn-sm"
              style={{ marginRight: '12px' }}
            >
              🔄 รีเฟรช
            </button>
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
        {/* Quick Actions */}
        <div className="shipping-actions" style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '24px',
          flexWrap: 'wrap'
        }}>
          <button 
            className="btn btn-primary"
            onClick={() => onNavigate('admin-shipping-queue')}
          >
            📋 คิวการจัดส่ง ({stats.pending})
          </button>
          <button 
            className="btn btn-outline"
            onClick={() => onNavigate('admin-shipping-tracker')}
          >
            📦 ติดตามการจัดส่ง
          </button>
          <button 
            className="btn btn-outline"
            onClick={() => onNavigate('admin-bulk-shipping')}
          >
            📊 จัดการสถานะการจัดส่ง
          </button>
          {stats.overdue > 0 && (
            <button 
              className="btn btn-warning"
              onClick={() => onNavigate('admin-shipping-queue')}
            >
              🚨 รายการด่วน ({stats.overdue})
            </button>
          )}
        </div>

        {/* Stats Grid */}
        <div className="dashboard-stats">
          <StatCard
            title="รอการจัดส่ง"
            value={stats.pending}
            subtitle="รายการที่พร้อมส่ง"
            icon={
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            }
            color="yellow"
            onClick={() => onNavigate('admin-shipping-queue')}
          />
          <StatCard
            title="กำลังจัดส่ง"
            value={stats.shipping}
            subtitle="อยู่ระหว่างการขนส่ง"
            icon={
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="blue"
            onClick={() => onNavigate('admin-shipping-tracker')}
          />
          <StatCard
            title="จัดส่งแล้ว"
            value={stats.delivered}
            subtitle="ส่งถึงแล้ว"
            icon={
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="green"
          />
          <StatCard
            title="ค้างนาน"
            value={stats.overdue}
            subtitle="เกิน 7 วันแล้ว"
            icon={
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="red"
            onClick={() => onNavigate('admin-shipping-queue')}
          />
        </div>

        {/* Charts Section */}
        <div className="shipping-charts-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
          marginTop: '32px'
        }}>
          {/* Monthly Chart */}
          <div className="chart-container" style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0'
          }}>
            <div className="chart-header">
              <h3 className="chart-title">📈 การจัดส่งรายเดือน</h3>
              <p className="chart-subtitle">12 เดือนล่าสุด (ข้อมูลจาก API)</p>
            </div>
            <div className="chart-content">
              {monthlyChart.length > 0 ? (
                <div className="simple-bar-chart" style={{
                  display: 'flex',
                  alignItems: 'end',
                  gap: '8px',
                  height: '200px',
                  padding: '16px 0'
                }}>
                  {monthlyChart.map((item, index) => {
                    const maxCount = Math.max(...monthlyChart.map(m => m.count), 1); // ป้องกันหาร 0
                    const heightPercentage = (item.count / maxCount) * 100;
                    
                    return (
                      <div key={index} className="chart-bar-group" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        flex: 1
                      }}>
                        <div className="chart-bar-container" style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          height: '160px',
                          justifyContent: 'end'
                        }}>
                          <span className="chart-bar-value" style={{
                            fontSize: '12px',
                            fontWeight: 'bold',
                            marginBottom: '4px',
                            color: item.count > 0 ? '#333' : '#999'
                          }}>
                            {item.count}
                          </span>
                          <div 
                            className="chart-bar"
                            style={{ 
                              height: `${Math.max(heightPercentage, 2)}%`, // ขั้นต่ำ 2% เพื่อให้เห็น
                              backgroundColor: item.count > 0 ? '#007bff' : '#e9ecef',
                              width: '24px',
                              borderRadius: '4px 4px 0 0',
                              minHeight: '4px'
                            }}
                          />
                        </div>
                        <span className="chart-bar-label" style={{
                          fontSize: '11px',
                          marginTop: '8px',
                          color: '#666'
                        }}>
                          {item.month}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="chart-empty" style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: '#6c757d'
                }}>
                  <p>ยังไม่มีข้อมูลการจัดส่ง</p>
                </div>
              )}
            </div>
          </div>

          {/* Urgent List */}
          <div className="urgent-container" style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0'
          }}>
            <div className="urgent-header">
              <h3 className="urgent-title">🚨 รายการด่วน</h3>
              <p className="urgent-subtitle">ค้างเกิน 7 วัน (จาก API)</p>
            </div>
            <div className="urgent-content">
              {urgentList.length > 0 ? (
                <div className="urgent-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {urgentList.map((item) => (
                    <div key={item._id} className="urgent-item" style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px',
                      marginBottom: '8px',
                      backgroundColor: '#fff3cd',
                      borderRadius: '8px',
                      border: '1px solid #ffeaa7'
                    }}>
                      <div className="urgent-item-info">
                        <h4 className="urgent-item-name" style={{
                          margin: 0,
                          fontSize: '14px',
                          fontWeight: 'bold',
                          color: '#333'
                        }}>
                          {item.firstName} {item.lastName}
                        </h4>
                        <p className="urgent-item-detail" style={{
                          margin: '2px 0',
                          fontSize: '12px',
                          color: '#666'
                        }}>
                          {item.department} • รุ่น {item.graduationYear}
                        </p>
                        <p className="urgent-item-phone" style={{
                          margin: 0,
                          fontSize: '12px',
                          color: '#666'
                        }}>
                          📞 {item.phone}
                        </p>
                      </div>
                      <div className="urgent-item-days">
                        <span className="urgent-days-badge" style={{
                          backgroundColor: item.daysPending > 14 ? '#dc3545' : '#fd7e14',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {item.daysPending} วัน
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="urgent-empty" style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: '#28a745'
                }}>
                  <div className="urgent-empty-icon" style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>ไม่มีรายการค้างนาน</p>
                  <p className="urgent-empty-subtitle" style={{ 
                    margin: '4px 0 0 0', 
                    fontSize: '14px', 
                    color: '#6c757d' 
                  }}>
                    งานล่าสุดทุกอย่าง!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Info */}
        <div style={{
          marginTop: '32px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '12px',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ marginBottom: '16px', color: '#495057' }}>📋 สรุปข้อมูลการจัดส่ง</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            <div>
              <strong>รวมทั้งหมด:</strong> {stats.pending + stats.shipping + stats.delivered} รายการ
            </div>
            <div>
              <strong>ความสำเร็จ:</strong> {stats.delivered > 0 
                ? `${((stats.delivered / (stats.pending + stats.shipping + stats.delivered)) * 100).toFixed(1)}%`
                : '0%'
              }
            </div>
            <div>
              <strong>รายการปัญหา:</strong> {stats.overdue} รายการ
            </div>
            <div>
              <strong>อัปเดตล่าสุด:</strong> {new Date().toLocaleString('th-TH')}
            </div>
          </div>
          <div style={{ marginTop: '12px', fontSize: '13px', color: '#6c757d' }}>
            ✅ ข้อมูลจาก <code>/api/alumni/shipping-statistics</code> และ <code>/api/alumni/shipping-list</code>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ShippingDashboard;