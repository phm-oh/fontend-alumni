// src/utils/config.js - Configuration & Utilities (No JSX)

// Environment configuration
export const config = {
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
  allowedFileTypes: import.meta.env.VITE_ALLOWED_FILE_TYPES?.split(',') || ['image/jpeg', 'image/png', 'application/pdf']
};

// API utility function
export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  const requestConfig = {
    headers: defaultHeaders,
    ...options,
  };

  // Remove Content-Type for FormData
  if (options.body instanceof FormData) {
    delete requestConfig.headers['Content-Type'];
  }

  try {
    const response = await fetch(`${config.apiUrl}${endpoint}`, requestConfig);
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

// Mock data for dropdowns
export const mockData = {
  graduationYears: (() => {
    const currentBuddhistYear = new Date().getFullYear() + 543; // Convert to Buddhist year
    return Array.from({ length: 90 }, (_, i) => currentBuddhistYear - i);
  })(),
  departments: [
    'สาขาวิชาการบัญชี',
    'สาขาวิชาการตลาด', 
    'สาขาวิชาธุรกิจค้าปลีก',
    'อาหารและโภชนาการ',
    'สาขาวิชาคอมพิวเตอร์ธุรกิจ',
    'สาขาวิชาการจัดการธุรกิจดิจิทัล',
    'สาขาวิชาการโรงแรม',
    'สาขาวิชาการจัดการสำนักงาน',
    'สาขาวิชาการจัดการท่องเที่ยว',
    'สาขาวิชาธุรกิจการบิน/บริการภาคพื้น',
    'สาขาวิชาผ้าและเครื่องแต่งกาย',
    'สาขาวิชาการจัดการโลจิสติกส์และซัพพลายเชน',
    'สาขาวิชาเทคโนโลยีสารสนเทศ',
    'สาขาวิชาการออกแบบ',
    'สาขาวิชาคอมพิวเตอร์กราฟิก',
    'สาขาวิชาภาษาต่างประเทศ',
    'สาขาวิชาคหกรรมศาสตร์',
    'อื่น ๆ' ,// Add more departments as needed
  ]
};