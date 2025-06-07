// 📁 ShippingReports.jsx - แก้ไข Export Function ให้ส่ง Token ✅
import React, { useState, useEffect } from 'react';
import "./ShippingReports.css"
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  FileDownload,
  Search,
  FilterList,
  LocalShipping,
  CheckCircle,
  Schedule,
  Cancel
} from '@mui/icons-material';

// 🚀 แก้: รับ props ที่ส่งมาจาก AdminSystem
const ShippingReports = ({ user, onLogout, onNavigate }) => {
  // 🔍 เพิ่ม console.log เพื่อ debug
  console.log("🚀 ShippingReports component loaded!");
  console.log("📋 Props received:", { user: !!user, onLogout: !!onLogout, onNavigate: !!onNavigate });

  // State สำหรับข้อมูล
  const [shippingData, setShippingData] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State สำหรับ Filters
  const [filters, setFilters] = useState({
    shippingStatus: '',
    department: '',
    graduationYear: '',
    search: ''
  });

  // State สำหรับ Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // ดึงข้อมูลจาก API
  const fetchShippingData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        )
      });

      // 🚀 แก้: ใช้ VITE_API_URL และ adminToken
      const apiUrl = `${import.meta.env.VITE_API_URL}/api/shipping/reports/detailed?${queryParams}`;
      
    
      const token = localStorage.getItem('adminToken'); 
      
      console.log("📡 Fetching from:", apiUrl);
      console.log("🔑 Using token:", token ? "Token exists" : "No token");

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log("📡 Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ API Error:", errorText);
        throw new Error(`เกิดข้อผิดพลาดในการดึงข้อมูล: ${response.status}`);
      }

      const data = await response.json();
      console.log("📊 Data received:", data);
      
      setShippingData(data.data?.shipments || []);
      setStatistics(data.data?.statistics);
      setTotalCount(data.data?.totalShipments || 0);
    } catch (err) {
      console.error("❌ fetchShippingData error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // เรียกข้อมูลเมื่อ component mount หรือ filters เปลี่ยน
  useEffect(() => {
    console.log("🔄 useEffect triggered - fetching data...");
    fetchShippingData();
  }, [page, rowsPerPage, filters]);

  // Handle filter change
  const handleFilterChange = (field, value) => {
    console.log(`🔍 Filter changed: ${field} = ${value}`);
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(0); // Reset to first page
  };

  // 🔥 แก้ไข Handle export - ใช้ fetch + blob download แทน window.open
  const handleExport = async (exportType) => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams({
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        ),
        fileName: `${exportType}-${new Date().toISOString().split('T')[0]}.xlsx`
      });

      // 🚀 สร้าง endpoint URL
      const endpoint = exportType === 'shipping-list' 
        ? `${import.meta.env.VITE_API_URL}/api/shipping/export/shipping-list`
        : `${import.meta.env.VITE_API_URL}/api/shipping/export/excel`;

      const url = `${endpoint}?${queryParams}`;
      console.log("📤 Exporting to:", url);

      // 🔥 ใช้ fetch แทน window.open พร้อมส่ง token
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}` // ✅ ส่ง token ไปด้วย!
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Export error response:", errorText);
        throw new Error(`Export failed: ${response.status} - ${errorText}`);
      }

      // 🔥 แปลง response เป็น blob
      const blob = await response.blob();
      
      // 🔥 สร้าง download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${exportType}-${new Date().toISOString().split('T')[0]}.xlsx`;
      
      // 🔥 ทำการ download
      document.body.appendChild(a);
      a.click();
      
      // 🔥 ทำความสะอาด
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
      
      console.log("✅ Export completed successfully!");
      
    } catch (err) {
      console.error("❌ Export error:", err);
      setError(`เกิดข้อผิดพลาดในการ Export: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 เพิ่มฟังก์ชันสำหรับ export รายงานสมาชิกทั้งหมด
  const handleMemberExport = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('adminToken');
      const url = `${import.meta.env.VITE_API_URL}/api/alumni/export/all-members-excel`;
      
      console.log("📤 Exporting all members to:", url);
      
      const response = await fetch(url, {
        method: 'GET', 
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Member export error response:", errorText);
        throw new Error(`Export failed: ${response.status} - ${errorText}`);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `รายงานสมาชิกทั้งหมด-${new Date().toISOString().split('T')[0]}.xlsx`;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
      
      console.log("✅ Member export completed successfully!");
      
    } catch (err) {
      console.error("❌ Member export error:", err);
      setError(`เกิดข้อผิดพลาดในการ Export รายงานสมาชิก: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // สร้าง Status Chip
  const getStatusChip = (status) => {
    const statusConfig = {
      'รอการจัดส่ง': { color: 'warning', icon: <Schedule /> },
      'กำลังจัดส่ง': { color: 'info', icon: <LocalShipping /> },
      'จัดส่งแล้ว': { color: 'success', icon: <CheckCircle /> },
      'ไม่ต้องจัดส่ง': { color: 'default', icon: <Cancel /> }
    };

    const config = statusConfig[status] || { color: 'default', icon: null };
    return (
      <Chip
        label={status}
        color={config.color}
        icon={config.icon}
        size="small"
        className="status-chip"
      />
    );
  };

  return (
    <div className="shipping-reports-container">
      {/* 🚀 เพิ่ม Header Section แบบ Admin */}
      <header className="admin-header">
        <div className="admin-header-container">
          <div>
            <h1 className="admin-header-title">📊 รายงานการจัดส่ง</h1>
            <p className="admin-header-subtitle">
              จัดการและติดตามการจัดส่งบัตรสมาชิกศิษย์เก่า
            </p>
          </div>
          <div className="admin-header-user">
            {/* 🚀 เพิ่มปุ่มกลับ */}
            <button 
              onClick={() => onNavigate && onNavigate('admin-dashboard')}
              className="btn btn-outline btn-sm"
              style={{ marginRight: '12px' }}
            >
              ← กลับแดชบอร์ด
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
        {/* Debug Info */}
        <div style={{ 
          background: '#f0f0f0', 
          padding: '12px', 
          marginBottom: '16px', 
          borderRadius: '4px',
          fontSize: '12px',
          color: '#666'
        }}>
          🔍 Debug: Component loaded | API: {import.meta.env.VITE_API_URL} | Token: {localStorage.getItem('adminToken') ? '✅' : '❌'}
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <Grid container spacing={3} className="stats-grid">
            <Grid item xs={12} sm={6} md={3}>
              <Card className="stat-card warning">
                <CardContent>
                  <Box className="stat-content">
                    <Schedule className="stat-icon" />
                    <Box>
                      <Typography variant="h4">
                        {statistics.statusBreakdown?.['รอการจัดส่ง'] || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        รอการจัดส่ง
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card className="stat-card info">
                <CardContent>
                  <Box className="stat-content">
                    <LocalShipping className="stat-icon" />
                    <Box>
                      <Typography variant="h4">
                        {statistics.statusBreakdown?.['กำลังจัดส่ง'] || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        กำลังจัดส่ง
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card className="stat-card success">
                <CardContent>
                  <Box className="stat-content">
                    <CheckCircle className="stat-icon" />
                    <Box>
                      <Typography variant="h4">
                        {statistics.statusBreakdown?.['จัดส่งแล้ว'] || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        จัดส่งแล้ว
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card className="stat-card primary">
                <CardContent>
                  <Box className="stat-content">
                    <FilterList className="stat-icon" />
                    <Box>
                      <Typography variant="h4">{totalCount}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        ทั้งหมด
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Filters */}
        <Card className="filter-card">
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🔍 ตัวกรองข้อมูล
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  select
                  label="สถานะการจัดส่ง"
                  value={filters.shippingStatus}
                  onChange={(e) => handleFilterChange('shippingStatus', e.target.value)}
                  size="small"
                >
                  <MenuItem value="">ทั้งหมด</MenuItem>
                  <MenuItem value="รอการจัดส่ง">รอการจัดส่ง</MenuItem>
                  <MenuItem value="กำลังจัดส่ง">กำลังจัดส่ง</MenuItem>
                  <MenuItem value="จัดส่งแล้ว">จัดส่งแล้ว</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  select
                  label="แผนกวิชา"
                  value={filters.department}
                  onChange={(e) => handleFilterChange('department', e.target.value)}
                  size="small"
                >
                  <MenuItem value="">ทั้งหมด</MenuItem>
                  <MenuItem value="เทคโนโลยีสารสนเทศ">เทคโนโลยีสารสนเทศ</MenuItem>
                  <MenuItem value="การบัญชี">การบัญชี</MenuItem>
                  <MenuItem value="การตลาด">การตลาด</MenuItem>
                  <MenuItem value="ช่างยนต์">ช่างยนต์</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  select
                  label="ปีการศึกษา"
                  value={filters.graduationYear}
                  onChange={(e) => handleFilterChange('graduationYear', e.target.value)}
                  size="small"
                >
                  <MenuItem value="">ทั้งหมด</MenuItem>
                  <MenuItem value="2567">2567</MenuItem>
                  <MenuItem value="2566">2566</MenuItem>
                  <MenuItem value="2565">2565</MenuItem>
                  <MenuItem value="2564">2564</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="ค้นหา"
                  placeholder="ชื่อ, เลขบัตร, เลขติดตาม"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  size="small"
                  InputProps={{
                    startAdornment: <Search className="search-icon" />
                  }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Export Buttons */}
        <Card className="export-card">
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📤 ส่งออกข้อมูล
            </Typography>
            
            <Box className="export-buttons">
              <Button
                variant="contained"
                startIcon={<FileDownload />}
                onClick={() => handleExport('shipping-list')}
                className="export-btn primary"
                disabled={loading}
              >
                📋 รายชื่อที่ต้องจัดส่ง
              </Button>
              
              <Button
                variant="contained"
                startIcon={<FileDownload />}
                onClick={() => handleExport('shipping-report')}
                className="export-btn success"
                disabled={loading}
              >
                📊 รายงานการจัดส่งทั้งหมด
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<FileDownload />}
                onClick={handleMemberExport}
                className="export-btn info"
                disabled={loading}
              >
                👥 รายงานสมาชิกทั้งหมด
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Data Table */}
        <Card className="table-card">
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📋 รายการการจัดส่ง
            </Typography>

            {loading ? (
              <Box className="loading-container">
                <CircularProgress />
                <Typography>กำลังโหลดข้อมูล...</Typography>
              </Box>
            ) : (
              <>
                <TableContainer component={Paper} className="table-container">
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>ลำดับ</TableCell>
                        <TableCell>ชื่อ-นามสกุล</TableCell>
                        <TableCell>แผนกวิชา</TableCell>
                        <TableCell>ปี</TableCell>
                        <TableCell>เบอร์โทร</TableCell>
                        <TableCell>สถานะ</TableCell>
                        <TableCell>เลขติดตาม</TableCell>
                        <TableCell>วันที่จัดส่ง</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {shippingData.map((item, index) => (
                        <TableRow key={item._id} hover>
                          <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                          <TableCell className="name-cell">
                            <Typography variant="body2" fontWeight="medium">
                              {`${item.firstName} ${item.lastName}`}
                            </Typography>
                          </TableCell>
                          <TableCell>{item.department}</TableCell>
                          <TableCell>{item.graduationYear}</TableCell>
                          <TableCell>{item.phone}</TableCell>
                          <TableCell>
                            {getStatusChip(item.shippingStatus)}
                          </TableCell>
                          <TableCell>
                            {item.trackingNumber || '-'}
                          </TableCell>
                          <TableCell>
                            {item.shippedDate 
                              ? new Date(item.shippedDate).toLocaleDateString('th-TH')
                              : '-'
                            }
                          </TableCell>
                        </TableRow>
                      ))}

                      {shippingData.length === 0 && !loading && (
                        <TableRow>
                          <TableCell colSpan={8} align="center">
                            <Typography color="text.secondary">
                              ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                <TablePagination
                  component="div"
                  count={totalCount}
                  page={page}
                  onPageChange={(e, newPage) => setPage(newPage)}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                  rowsPerPageOptions={[10, 25, 50, 100]}
                  labelRowsPerPage="จำนวนต่อหน้า:"
                  labelDisplayedRows={({ from, to, count }) =>
                    `${from}-${to} จาก ${count !== -1 ? count : `มากกว่า ${to}`}`
                  }
                />
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ShippingReports;