// src/components/AdminDashboard.jsx - แก้ปัญหาข้อมูลไม่ตรง
import React, { useState, useEffect } from "react";

const AdminDashboard = ({ user, onLogout, onNavigate }) => {
  const [stats, setStats] = useState(null);
  const [shippingStats, setShippingStats] = useState(null); // 🔥 เพิ่มสถิติการจัดส่ง
  const [recentAlumni, setRecentAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [navVisible, setNavVisible] = useState(true); // 🔥 Toggle navigation

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      // ดึงสถิติทั่วไป
      const statsRes = await fetch(
        `${import.meta.env.VITE_API_URL}/api/alumni/statistics`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        console.log("Stats data received:", statsData);

        const parsedStats = {
          total: statsData.data?.totalAlumni || 0,
          pending: statsData.data?.statusStats?.pending || 0,
          approved: statsData.data?.statusStats?.approved || 0,
          rejected: statsData.data?.statusStats?.cancelled || 0,
        };

        setStats(parsedStats);
      }

      // 🔥 ดึงสถิติการจัดส่งแยกต่างหาก
      const shippingRes = await fetch(
        // `${import.meta.env.VITE_API_URL}/api/shipping/statistics`,
        `${import.meta.env.VITE_API_URL}/api/alumni/shipping-statistics`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (shippingRes.ok) {
        const shippingData = await shippingRes.json();
        setShippingStats(
          shippingData.data || {
            needShipping: 0, // อนุมัติแล้ว + เลือกจัดส่ง
            pending: 0, // รอการจัดส่ง
            shipping: 0, // กำลังจัดส่ง
            delivered: 0, // จัดส่งแล้ว
          }
        );
      } else {
        // 🔥 ถ้าไม่มี API shipping ให้คำนวณเอง
        await calculateShippingStats(token);
      }

      // ดึงข้อมูลศิษย์เก่าล่าสุด
      const alumniRes = await fetch(
        `${import.meta.env.VITE_API_URL}/api/alumni?limit=5`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (alumniRes.ok) {
        const alumniData = await alumniRes.json();
        const sortedAlumni = (alumniData.data || [])
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);

        setRecentAlumni(sortedAlumni);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 คำนวณสถิติการจัดส่งเอง ถ้าไม่มี API
  const calculateShippingStats = async (token) => {
    try {
      // ดึงข้อมูลคนที่อนุมัติแล้ว
      const approvedRes = await fetch(
        `${import.meta.env.VITE_API_URL}/api/alumni?status=อนุมัติ&limit=100`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (approvedRes.ok) {
        const approvedData = await approvedRes.json();
        const approvedAlumni = approvedData.data || [];

        const shippingStats = {
          needShipping: approvedAlumni.filter(
            (a) => a.deliveryOption === "จัดส่งทางไปรษณีย์"
          ).length,
          pending: approvedAlumni.filter(
            (a) =>
              a.deliveryOption === "จัดส่งทางไปรษณีย์" &&
              (a.shippingStatus === "รอการจัดส่ง" || !a.shippingStatus)
          ).length,
          shipping: approvedAlumni.filter(
            (a) => a.shippingStatus === "กำลังจัดส่ง"
          ).length,
          delivered: approvedAlumni.filter(
            (a) => a.shippingStatus === "จัดส่งแล้ว"
          ).length,
        };

        setShippingStats(shippingStats);
      }
    } catch (error) {
      console.error("Error calculating shipping stats:", error);
      setShippingStats({
        needShipping: 0,
        pending: 0,
        shipping: 0,
        delivered: 0,
      });
    }
  };

  const StatCard = ({
    title,
    value,
    icon,
    color = "blue",
    change,
    onClick,
    subtitle,
  }) => (
    <div
      className={`stat-card ${onClick ? "clickable" : ""}`}
      onClick={onClick}
    >
      <div className="stat-card-header">
        <div>
          <p className="stat-card-title">{title}</p>
          <p className="stat-card-value">{value}</p>
          {subtitle && <p className="stat-card-subtitle">{subtitle}</p>}
          {change && (
            <p
              className={`stat-card-change ${
                change > 0 ? "positive" : "negative"
              }`}
            >
              {change > 0 ? "+" : ""}
              {change}%
            </p>
          )}
        </div>
        <div className={`stat-card-icon ${color}`}>{icon}</div>
      </div>
    </div>
  );

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "อนุมัติ":
        return "status-select approved";
      case "รอตรวจสอบ":
        return "status-select pending";
      case "ปฏิเสธ":
        return "status-select rejected";
      default:
        return "status-select pending";
    }
  };

  // 🔥 Quick Action Functions
 const handleQuickAction = (action) => {
  switch (action) {
    case "shipping-queue":
      onNavigate && onNavigate("admin-shipping-queue");
      break;
    case "shipping-tracker":
      onNavigate && onNavigate("admin-shipping-tracker");
      break;
    case "shipping-dashboard":
      onNavigate && onNavigate("admin-shipping-dashboard");
      break;
    
    // 🚀 เพิ่มใหม่: case สำหรับรายงานการจัดส่ง
    case "shipping-reports":
      console.log("🚀 Going to shipping reports!");
      onNavigate && onNavigate("admin-shipping-reports");
      break;
      
    default:
      console.log("Unknown action:", action);
  }
};

  if (loading) {
    return (
      <div className="admin-layout">
        <div className="admin-loading">
          <div className="spinner"></div>
          <p className="admin-loading-text">กำลังโหลดข้อมูล...</p>
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
            <h1 className="admin-header-title">
              📊 ระบบจัดการศิษย์เก่า - แดชบอร์ด
            </h1>
            <p className="admin-header-subtitle">ภาพรวมระบบและกิจกรรมล่าสุด</p>
          </div>
          <div className="admin-header-user">
            <span className="admin-user-info">
              สวัสดี,{" "}
              {user?.username || user?.name || user?.email || "ผู้ดูแลระบบ"}
            </span>
            <button onClick={onLogout} className="admin-logout-btn">
              ออกจากระบบ
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="admin-main">
        {/* 🔥 Quick Actions */}
        <div className="dashboard-quick-actions">
          <h2 className="dashboard-section-title">⚡ การดำเนินการด่วน</h2>
          <div className="quick-actions-grid">
            <button
              className="quick-action-btn shipping"
              onClick={() => handleQuickAction("shipping-queue")}
            >
              <div className="quick-action-icon">📋</div>
              <div className="quick-action-text">
                <h3>คิวการจัดส่ง</h3>
                <p>{shippingStats?.pending || 0} รายการรออยู่</p>
              </div>
            </button>
            <button
              className="quick-action-btn tracker"
              onClick={() => handleQuickAction("shipping-tracker")}
            >
              <div className="quick-action-icon">📦</div>
              <div className="quick-action-text">
                <h3>อัปเดตการจัดส่ง</h3>
                <p>ติดตามและอัปเดตสถานะ</p>
              </div>
            </button>
            <button
              className="quick-action-btn analytics"
              onClick={() => handleQuickAction("shipping-reports")}
            >
              <div className="quick-action-icon">📊</div>
              <div className="quick-action-text">
                <h3>รายงานการจัดส่ง</h3>
                <p>สถิติและภาพรวม</p>
              </div>
            </button>
          </div>
        </div>

        {/* 🔥 สถิติหลัก - แยกชัดเจน */}
        <div className="dashboard-stats-section">
          <h2 className="dashboard-section-title">📈 สถิติการลงทะเบียน</h2>
          <div className="dashboard-stats">
            <StatCard
              title="จำนวนศิษย์เก่าทั้งหมด"
              value={stats?.total || 0}
              subtitle="ลงทะเบียนแล้ว"
              icon={
                <svg
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              }
              color="blue"
            />
            <StatCard
              title="รอตรวจสอบ"
              value={stats?.pending || 0}
              subtitle="ต้องดำเนินการ"
              icon={
                <svg
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
              color="yellow"
            />
            <StatCard
              title="อนุมัติแล้ว"
              value={stats?.approved || 0}
              subtitle="เป็นสมาชิกแล้ว"
              icon={
                <svg
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
              color="green"
            />
            <StatCard
              title="ปฏิเสธ"
              value={stats?.rejected || 0}
              subtitle="ไม่ผ่านการอนุมัติ"
              icon={
                <svg
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
              color="red"
            />
          </div>
        </div>

        {/* 🔥 สถิติการจัดส่ง - ใหม่ */}
        <div className="dashboard-stats-section">
          <h2 className="dashboard-section-title">📦 สถิติการจัดส่ง</h2>
          <div className="dashboard-stats">
            <StatCard
              title="ต้องจัดส่ง"
              value={shippingStats?.needShipping || 0}
              subtitle="เลือกจัดส่งทางไปรษณีย์"
              icon={
                <svg
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              }
              color="blue"
              onClick={() => handleQuickAction("shipping-dashboard")}
            />
            <StatCard
              title="รอการจัดส่ง"
              value={shippingStats?.pending || 0}
              subtitle="พร้อมจัดส่ง"
              icon={
                <svg
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
              color="yellow"
              onClick={() => handleQuickAction("shipping-queue")}
            />
            <StatCard
              title="กำลังจัดส่ง"
              value={shippingStats?.shipping || 0}
              subtitle="อยู่ระหว่างการขนส่ง"
              icon={
                <svg
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
              color="blue"
              onClick={() => handleQuickAction("shipping-tracker")}
            />
            <StatCard
              title="จัดส่งแล้ว"
              value={shippingStats?.delivered || 0}
              subtitle="ส่งถึงแล้ว"
              icon={
                <svg
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
              color="green"
            />
          </div>
        </div>

        {/* Recent Alumni Table */}
        <div className="admin-table-container">
          <div className="admin-table-header">
            <h2 className="admin-table-title">
              👥 ศิษย์เก่าที่ลงทะเบียนล่าสุด
            </h2>
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>ชื่อ-นามสกุล</th>
                <th>สาขา</th>
                <th>ปีที่จบ</th>
                <th>สถานะ</th>
                <th>การจัดส่ง</th>
                <th>วันที่ลงทะเบียน</th>
              </tr>
            </thead>
            <tbody>
              {recentAlumni.length > 0 ? (
                recentAlumni.map((alumni) => (
                  <tr key={alumni._id}>
                    <td>
                      <div className="alumni-name">
                        {alumni.firstName} {alumni.lastName}
                      </div>
                      <div className="alumni-contact">{alumni.phone}</div>
                    </td>
                    <td>{alumni.department}</td>
                    <td>{alumni.graduationYear}</td>
                    <td>
                      <span className={getStatusBadgeClass(alumni.status)}>
                        {alumni.status}
                      </span>
                    </td>
                    <td>
                      <div className="shipping-info">
                        <div>{alumni.deliveryOption || "รับที่วิทยาลัย"}</div>
                        {alumni.deliveryOption === "จัดส่งทางไปรษณีย์" && (
                          <div className="shipping-status">
                            <span
                              className={`status-badge ${
                                alumni.shippingStatus === "จัดส่งแล้ว"
                                  ? "green"
                                  : alumni.shippingStatus === "กำลังจัดส่ง"
                                  ? "blue"
                                  : "yellow"
                              }`}
                            >
                              {alumni.shippingStatus || "รอการจัดส่ง"}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      {new Date(alumni.createdAt).toLocaleDateString("th-TH")}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    style={{
                      textAlign: "center",
                      padding: "var(--spacing-2xl)",
                    }}
                  >
                    <div className="admin-loading-text">
                      ยังไม่มีข้อมูลศิษย์เก่า
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* 🔥 Navigation Toggle */}
      {onNavigate && (
        <button
          className="admin-nav-toggle"
          onClick={() => setNavVisible(!navVisible)}
          title={navVisible ? "ซ่อนเมนู" : "แสดงเมนู"}
        >
          {navVisible ? "✕" : "☰"}
        </button>
      )}
    </div>
  );
};

export default AdminDashboard;
