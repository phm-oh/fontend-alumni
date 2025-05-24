import React, { useState, useEffect, createContext, useContext } from 'react';
import './styles/App.css';

// App Context for global state
const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

// Environment variables (Vite uses import.meta.env)
const config = {
  apiUrl: import.meta.env.VITE_API_URL,
  appName: import.meta.env.VITE_APP_NAME,
  collegeName: import.meta.env.VITE_COLLEGE_NAME,
  collegeAddress: import.meta.env.VITE_COLLEGE_ADDRESS,
  collegePhone: import.meta.env.VITE_COLLEGE_PHONE,
  devName: import.meta.env.VITE_DEV_NAME,
  imageLogo: import.meta.env.VITE_IMAGE_LOGO,
  imageGift: import.meta.env.VITE_IMAGE_GIFT,
  bankName: import.meta.env.VITE_BANK_NAME,
  bankAccount: import.meta.env.VITE_BANK_ACCOUNT,
  bankAccountName: import.meta.env.VITE_BANK_ACCOUNT_NAME,
  bankBranch: import.meta.env.VITE_BANK_BRANCH,
  membershipFee: parseInt(import.meta.env.VITE_MEMBERSHIP_FEE),
  shippingFee: parseInt(import.meta.env.VITE_SHIPPING_FEE),
  maxFileSize: parseInt(import.meta.env.VITE_MAX_FILE_SIZE),
  allowedFileTypes: import.meta.env.VITE_ALLOWED_FILE_TYPES.split(',')
};

// API utility function
const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  const config = {
    headers: defaultHeaders,
    ...options,
  };

  // Remove Content-Type for FormData
  if (options.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'เกิดข้อผิดพลาด');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Image Error Handling Component
const SafeImage = ({ src, alt, className, fallback = null }) => {
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setLoading(false);
  };

  const handleImageLoad = () => {
    setLoading(false);
  };

  if (!src || imageError) {
    return fallback || <div className={`image-placeholder ${className}`}>{alt}</div>;
  }

  return (
    <>
      {loading && <div className={`image-loading ${className}`}>กำลังโหลด...</div>}
      <img
        src={src}
        alt={alt}
        className={className}
        onError={handleImageError}
        onLoad={handleImageLoad}
        style={{ display: loading ? 'none' : 'block' }}
      />
    </>
  );
};
const mockData = {
  graduationYears: Array.from({ length: 30 }, (_, i) => 2024 - i),
  departments: [
    'ช่างยนต์',
    'ช่างไฟฟ้า',
    'ช่างอิเล็กทรอนิกส์',
    'เทคนิคคอมพิวเตอร์',
    'ช่างก่อสร้าง',
    'การบัญชี',
    'การตลาด',
    'คอมพิวเตอร์ธุรกิจ',
    'การโรงแรม',
    'อาหารและโภชนาการ'
  ]
};

// Landing Page Component
const LandingPage = ({ onNavigate }) => {
  return (
    <div className="page landing-page">
      <div className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-logo">
              <SafeImage 
                src={config.imageLogo} 
                alt="โลโก้วิทยาลัย" 
                className="college-logo"
                fallback={<div className="college-logo-placeholder">🏫</div>}
              />
            </div>
            <h1 className="hero-title">{config.appName}</h1>
            <h2 className="college-name">{config.collegeName}</h2>
            <p className="hero-subtitle">
              เชื่อมโยงสายใยศิษย์เก่า สืบสานประเพณี และร่วมพัฒนาสถาบัน
            </p>
            <div className="hero-actions">
              <button 
                className="btn btn-primary btn-large"
                onClick={() => onNavigate('register')}
              >
                ลงทะเบียนศิษย์เก่า
              </button>
              <button 
                className="btn btn-outline btn-large"
                onClick={() => onNavigate('check-status')}
              >
                ตรวจสอบสถานะ
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="features-section">
        <div className="container">
          <h2 className="section-title">บริการของเรา</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎓</div>
              <h3>ลงทะเบียนออนไลน์</h3>
              <p>ลงทะเบียนเป็นสมาชิกศิษย์เก่าได้ง่ายๆ ผ่านระบบออนไลน์</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💳</div>
              <h3>ชำระเงินสะดวก</h3>
              <p>รองรับการชำระเงินหลายช่องทาง และตรวจสอบสถานะได้ตลอดเวลา</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🤝</div>
              <h3>เครือข่ายศิษย์เก่า</h3>
              <p>เชื่อมต่อและสร้างเครือข่ายกับศิษย์เก่าคนอื่นๆ</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>ตรวจสอบสถานะ</h3>
              <p>ตรวจสอบสถานะการลงทะเบียนและการชำระเงินได้ทันที</p>
            </div>
          </div>
        </div>
      </div>

      <div className="info-section">
        <div className="container">
          <div className="info-content">
            <div className="info-grid">
              <div className="info-card">
                <h3>ค่าสมาชิกประจำปี</h3>
                <div className="price">{config.membershipFee} บาท</div>
                <p>รวมบัตรสมาชิก และสิทธิประโยชน์ต่างๆ</p>
              </div>
              <div className="info-card">
                <h3>การจัดส่ง</h3>
                <div className="price">+{config.shippingFee} บาท</div>
                <p>สำหรับการจัดส่งทางไปรษณีย์</p>
              </div>
            </div>
            
            <div className="gift-preview">
              <h3>ของที่ระลึก</h3>
              <SafeImage 
                src={config.imageGift} 
                alt="ของที่ระลึกสำหรับสมาชิก" 
                className="gift-image"
                fallback={<div className="gift-placeholder">🎁 ของที่ระลึก</div>}
              />
              <p>ของที่ระลึกพิเศษสำหรับสมาชิกศิษย์เก่า</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Alumni Registration Component
const AlumniRegistration = ({ onNavigate }) => {
  const { setIdCard } = useAppContext();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    idCard: '',
    address: '',
    graduationYear: '',
    department: '',
    phone: '',
    email: '',
    currentJob: '',
    workplace: '',
    facebookId: '',
    lineId: '',
    paymentMethod: 'โอนเงิน',
    deliveryOption: 'รับที่วิทยาลัย',
    pdpaConsent: false
  });

  const [profileImage, setProfileImage] = useState(null);
  const [profilePreview, setProfilePreview] = useState('');
  const [paymentProof, setPaymentProof] = useState(null);
  const [paymentPreview, setPaymentPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!config.allowedFileTypes.includes(file.type)) {
      alert('กรุณาเลือกไฟล์ JPG, PNG หรือ PDF เท่านั้น');
      return;
    }

    // Validate file size
    if (file.size > config.maxFileSize) {
      alert('ขนาดไฟล์ต้องไม่เกิน 5MB');
      return;
    }

    if (fileType === 'profile') {
      setProfileImage(file);
      // Create preview for profile image
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setProfilePreview(e.target.result);
        reader.readAsDataURL(file);
      }
    } else if (fileType === 'payment') {
      setPaymentProof(file);
      // Create preview for payment proof
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setPaymentPreview(e.target.result);
        reader.readAsDataURL(file);
      } else {
        setPaymentPreview('');
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'กรุณากรอกชื่อ';
    if (!formData.lastName.trim()) newErrors.lastName = 'กรุณากรอกนามสกุล';
    
    if (!formData.idCard.trim()) {
      newErrors.idCard = 'กรุณากรอกเลขบัตรประชาชน';
    } else if (!/^\d{13}$/.test(formData.idCard)) {
      newErrors.idCard = 'เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก';
    }

    if (!formData.address.trim()) newErrors.address = 'กรุณากรอกที่อยู่';
    if (!formData.graduationYear) newErrors.graduationYear = 'กรุณาเลือกปีที่จบ';
    if (!formData.department) newErrors.department = 'กรุณาเลือกแผนกวิชา';
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'กรุณากรอกเบอร์โทรศัพท์';
    } else if (!/^0[0-9]{9}$/.test(formData.phone)) {
      newErrors.phone = 'เบอร์โทรศัพท์ไม่ถูกต้อง';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'กรุณากรอกอีเมล';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    }

    if (!formData.pdpaConsent) {
      newErrors.pdpaConsent = 'กรุณายินยอมการใช้ข้อมูลส่วนบุคคล';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Create FormData for file uploads
      const submitData = new FormData();
      
      // Add all form data
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });

      // Add profile image if exists
      if (profileImage) {
        submitData.append('profileImage', profileImage);
      }

      // Add payment proof if exists
      if (paymentProof) {
        submitData.append('paymentProof', paymentProof);
      }

      console.log('Submitting to:', `${config.apiUrl}/api/alumni/register`);
      
      // Submit to backend API
      const response = await fetch(`${config.apiUrl}/api/alumni/register`, {
        method: 'POST',
        body: submitData,
        // Don't set Content-Type header, browser will set it automatically for FormData
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert(`ลงทะเบียนสำเร็จ! 
รหัสสมาชิก: ${result.data._id}
กรุณาตรวจสอบอีเมลของท่าน`);
        
        // Navigate to status check with the ID card
        setIdCard(formData.idCard);
        onNavigate('check-status');
      } else {
        throw new Error(result.message || 'เกิดข้อผิดพลาดในการลงทะเบียน');
      }
    } catch (error) {
      console.error('Registration Error:', error);
      alert(`เกิดข้อผิดพลาด: ${error.message}`);
      
      // ถ้าเป็น network error อาจเป็นเพราะ backend ไม่ทำงาน
      if (error.message.includes('fetch')) {
        alert('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบว่า backend ทำงานอยู่ที่ ' + config.apiUrl);
      }
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = config.membershipFee + (formData.deliveryOption === 'จัดส่งทางไปรษณีย์' ? config.shippingFee : 0);

  return (
    <div className="page registration-page">
      <div className="container">
        <div className="page-header">
          <button 
            className="btn-back"
            onClick={() => onNavigate('home')}
          >
            ← กลับหน้าหลัก
          </button>
          <div className="header-logo">
            <SafeImage 
              src={config.imageLogo} 
              alt="โลโก้วิทยาลัย" 
              className="page-logo"
              fallback={<div className="page-logo-placeholder">🏫</div>}
            />
          </div>
          <h1>ลงทะเบียนศิษย์เก่า</h1>
          <h2>{config.collegeName}</h2>
          <p>กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง</p>
        </div>

        <div className="form-container">
          {/* Personal Information */}
          <div className="form-section">
            <h2>ข้อมูลส่วนตัว</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>ชื่อ *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={errors.firstName ? 'error' : ''}
                />
                {errors.firstName && <span className="error-text">{errors.firstName}</span>}
              </div>
              <div className="form-group">
                <label>นามสกุล *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={errors.lastName ? 'error' : ''}
                />
                {errors.lastName && <span className="error-text">{errors.lastName}</span>}
              </div>
            </div>

            <div className="form-group">
              <label>เลขบัตรประชาชน *</label>
              <input
                type="text"
                name="idCard"
                value={formData.idCard}
                onChange={handleInputChange}
                placeholder="13 หลัก"
                maxLength="13"
                className={errors.idCard ? 'error' : ''}
              />
              {errors.idCard && <span className="error-text">{errors.idCard}</span>}
            </div>

            <div className="form-group">
              <label>ที่อยู่ *</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows="3"
                className={errors.address ? 'error' : ''}
              />
              {errors.address && <span className="error-text">{errors.address}</span>}
            </div>

            {/* Profile Image Upload */}
            <div className="form-group">
              <label>รูปประจำตัว</label>
              <p className="field-description">
                อัพโหลดรูปถ่ายหน้าตรงชัดเจน สำหรับทำบัตรสมาชิก (ไม่บังคับ)
              </p>
              <input
                type="file"
                id="profileImage"
                accept="image/jpeg,image/png"
                onChange={(e) => handleFileChange(e, 'profile')}
                style={{ display: 'none' }}
              />
              <label htmlFor="profileImage" className="file-label">
                {profileImage ? profileImage.name : 'เลือกรูปประจำตัว (JPG, PNG)'}
              </label>
              {profilePreview && (
                <div className="file-preview">
                  <img src={profilePreview} alt="รูปประจำตัว" />
                </div>
              )}
            </div>
          </div>

          {/* Education Information */}
          <div className="form-section">
            <h2>ข้อมูลการศึกษา</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>ปีที่จบ *</label>
                <select
                  name="graduationYear"
                  value={formData.graduationYear}
                  onChange={handleInputChange}
                  className={errors.graduationYear ? 'error' : ''}
                >
                  <option value="">เลือกปีที่จบ</option>
                  {mockData.graduationYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                {errors.graduationYear && <span className="error-text">{errors.graduationYear}</span>}
              </div>
              <div className="form-group">
                <label>แผนกวิชา *</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className={errors.department ? 'error' : ''}
                >
                  <option value="">เลือกแผนกวิชา</option>
                  {mockData.departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                {errors.department && <span className="error-text">{errors.department}</span>}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="form-section">
            <h2>ข้อมูลการติดต่อ</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>เบอร์โทรศัพท์ *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="0xxxxxxxx"
                  className={errors.phone ? 'error' : ''}
                />
                {errors.phone && <span className="error-text">{errors.phone}</span>}
              </div>
              <div className="form-group">
                <label>อีเมล *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>อาชีพปัจจุบัน</label>
                <input
                  type="text"
                  name="currentJob"
                  value={formData.currentJob}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>สถานที่ทำงาน</label>
                <input
                  type="text"
                  name="workplace"
                  value={formData.workplace}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Facebook ID</label>
                <input
                  type="text"
                  name="facebookId"
                  value={formData.facebookId}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>LINE ID</label>
                <input
                  type="text"
                  name="lineId"
                  value={formData.lineId}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="form-section">
            <h2>การชำระเงิน</h2>
            
            <div className="payment-summary">
              <div className="fee-item">
                <span>ค่าสมาชิกประจำปี</span>
                <span>{config.membershipFee} บาท</span>
              </div>
              {formData.deliveryOption === 'จัดส่งทางไปรษณีย์' && (
                <div className="fee-item">
                  <span>ค่าจัดส่ง</span>
                  <span>{config.shippingFee} บาท</span>
                </div>
              )}
              <div className="fee-total">
                <span>รวมทั้งสิ้น</span>
                <span>{totalAmount} บาท</span>
              </div>
            </div>

            <div className="form-group">
              <label>วิธีการชำระเงิน *</label>
              <div className="radio-group">
                <label className="radio-item">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="โอนเงิน"
                    checked={formData.paymentMethod === 'โอนเงิน'}
                    onChange={handleInputChange}
                  />
                  <span>โอนเงิน</span>
                </label>
                <label className="radio-item">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="ชำระด้วยตนเอง"
                    checked={formData.paymentMethod === 'ชำระด้วยตนเอง'}
                    onChange={handleInputChange}
                  />
                  <span>ชำระด้วยตนเอง</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>วิธีการรับบัตรสมาชิก *</label>
              <div className="radio-group">
                <label className="radio-item">
                  <input
                    type="radio"
                    name="deliveryOption"
                    value="รับที่วิทยาลัย"
                    checked={formData.deliveryOption === 'รับที่วิทยาลัย'}
                    onChange={handleInputChange}
                  />
                  <span>รับที่วิทยาลัย (ฟรี)</span>
                </label>
                <label className="radio-item">
                  <input
                    type="radio"
                    name="deliveryOption"
                    value="จัดส่งทางไปรษณีย์"
                    checked={formData.deliveryOption === 'จัดส่งทางไปรษณีย์'}
                    onChange={handleInputChange}
                  />
                  <span>จัดส่งทางไปรษณีย์ (+{config.shippingFee} บาท)</span>
                </label>
              </div>
            </div>

            {formData.paymentMethod === 'โอนเงิน' && (
              <div className="payment-upload">
                <h3>ข้อมูลบัญชีสำหรับโอนเงิน</h3>
                <div className="bank-info">
                  <div className="bank-detail">
                    <span className="label">ธนาคาร:</span>
                    <span>{config.bankName}</span>
                  </div>
                  <div className="bank-detail">
                    <span className="label">สาขา:</span>
                    <span>{config.bankBranch}</span>
                  </div>
                  <div className="bank-detail">
                    <span className="label">เลขที่บัญชี:</span>
                    <span>{config.bankAccount}</span>
                  </div>
                  <div className="bank-detail">
                    <span className="label">ชื่อบัญชี:</span>
                    <span>{config.bankAccountName}</span>
                  </div>
                  <div className="bank-detail">
                    <span className="label">จำนวนเงิน:</span>
                    <span className="amount">{totalAmount} บาท</span>
                  </div>
                </div>
                
                <div className="file-upload">
                  <h4>อัปโหลดหลักฐานการชำระเงิน</h4>
                  <p className="field-description">
                    อัพโหลดสลิปโอนเงิน หรือหลักฐานการชำระเงิน
                  </p>
                  <input
                    type="file"
                    id="paymentProof"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange(e, 'payment')}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="paymentProof" className="file-label">
                    {paymentProof ? paymentProof.name : 'เลือกไฟล์หลักฐาน (JPG, PNG, PDF)'}
                  </label>
                  {paymentPreview && (
                    <div className="file-preview">
                      <img src={paymentPreview} alt="หลักฐานการชำระเงิน" />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* PDPA Consent */}
          <div className="form-section">
            <div className="consent-section">
              <label className="checkbox-item">
                <input
                  type="checkbox"
                  name="pdpaConsent"
                  checked={formData.pdpaConsent}
                  onChange={handleInputChange}
                />
                <span>
                  ข้าพเจ้ายินยอมให้สมาคมศิษย์เก่าใช้ข้อมูลส่วนบุคคลเพื่อวัตถุประสงค์ในการติดต่อสื่อสารและกิจกรรมของสมาคม *
                </span>
              </label>
              {errors.pdpaConsent && <span className="error-text">{errors.pdpaConsent}</span>}
            </div>
          </div>

          <div className="form-actions">
            <button 
              className="btn btn-primary btn-large"
              disabled={loading}
              onClick={handleSubmit}
            >
              {loading ? 'กำลังลงทะเบียน...' : 'ลงทะเบียน'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Status Check Component
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
      'รอการชำระเงิน': 'waiting-payment',
      'ยกเลิก': 'cancelled'
    };
    return `status-badge ${statusMap[status] || 'default'}`;
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
            <SafeImage 
              src={config.imageLogo} 
              alt="โลโก้วิทยาลัย" 
              className="page-logo"
              fallback={<div className="page-logo-placeholder">🏫</div>}
            />
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
                    <span>{result.position}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">วันที่ลงทะเบียน:</span>
                    <span>{new Date(result.registrationDate).toLocaleDateString('th-TH')}</span>
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

// Main App Component
const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [registeredIdCard, setRegisteredIdCard] = useState('');

  const navigate = (page, idCard = '') => {
    setCurrentPage(page);
    if (idCard) {
      setRegisteredIdCard(idCard);
    }
    window.scrollTo(0, 0);
  };

  const contextValue = {
    user,
    setUser,
    navigate,
    currentPage,
    config,
    setIdCard: setRegisteredIdCard
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>กำลังโหลด...</p>
      </div>
    );
  }

  return (
    <AppContext.Provider value={contextValue}>
      <div className="app">
        {/* Navigation */}
        <nav className="navbar">
          <div className="container">
            <div className="nav-brand">
              {config.imageLogo && (
                <img 
                  src={config.imageLogo} 
                  alt="โลโก้" 
                  className="nav-logo"
                />
              )}
              <div className="nav-text">
                <h1 onClick={() => navigate('home')}>{config.appName}</h1>
                <span>{config.collegeName}</span>
              </div>
            </div>
            <div className="nav-menu">
              <button 
                onClick={() => navigate('home')} 
                className={currentPage === 'home' ? 'active' : ''}
              >
                หน้าหลัก
              </button>
              <button 
                onClick={() => navigate('register')} 
                className={currentPage === 'register' ? 'active' : ''}
              >
                ลงทะเบียน
              </button>
              <button 
                onClick={() => navigate('check-status')} 
                className={currentPage === 'check-status' ? 'active' : ''}
              >
                ตรวจสอบสถานะ
              </button>
              {user ? (
                <button onClick={() => navigate('admin')} className="btn-admin">
                  ระบบจัดการ
                </button>
              ) : (
                <button onClick={() => navigate('login')} className="btn-login">
                  เข้าสู่ระบบ
                </button>
              )}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="main-content">
          {currentPage === 'home' && <LandingPage onNavigate={navigate} />}
          {currentPage === 'register' && <AlumniRegistration onNavigate={navigate} />}
          {currentPage === 'check-status' && <StatusCheck onNavigate={navigate} initialIdCard={registeredIdCard} />}
        </main>

        {/* Footer */}
        <footer className="footer">
          <div className="container">
            <div className="footer-content">
              <div className="footer-section">
                <h3>{config.collegeName}</h3>
                <p>สมาคมศิษย์เก่า</p>
                <p>{config.collegeAddress}</p>
                <p>โทร: {config.collegePhone}</p>
              </div>
              <div className="footer-section">
                <h4>ติดต่อเรา</h4>
                <p>โทร: {config.collegePhone}</p>
                <p>อีเมล: alumni@utc.ac.th</p>
                <p>เว็บไซต์: www.utc.ac.th</p>
              </div>
              <div className="footer-section">
                <h4>ลิงก์ที่เป็นประโยชน์</h4>
                <p>เว็บไซต์วิทยาลัย</p>
                <p>Facebook Page</p>
                <p>ระบบจัดการสมาชิก</p>
              </div>
            </div>
            <div className="footer-bottom">
              <p>&copy; 2025 {config.collegeName} สงวนลิขสิทธิ์</p>
              <p>พัฒนาโดย: {config.devName}</p>
            </div>
          </div>
        </footer>
      </div>
    </AppContext.Provider>
  );
};

export default App;