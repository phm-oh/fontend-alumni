// src/utils/config.js - Multiple Google Drive Methods + Donation Icons

// ฟังก์ชันทดสอบการโหลดรูปภาพ
const testImageLoad = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
    // Timeout after 5 seconds
    setTimeout(() => resolve(false), 5000);
  });
};

// ฟังก์ชันลองโหลดรูปหลายวิธี
const tryMultipleImageSources = async (sources) => {
  for (const source of sources) {
    console.log(`Trying image source: ${source}`);
    const isWorking = await testImageLoad(source);
    if (isWorking) {
      console.log(`✅ Image loaded successfully: ${source}`);
      return source;
    }
    console.log(`❌ Failed to load: ${source}`);
  }
  console.log('❌ All image sources failed');
  return null;
};

// สร้าง Google Drive URLs หลายรูปแบบ
const createGoogleDriveUrls = (fileId) => {
  return [
    // Method 1: Thumbnail API
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`,
    
    // Method 2: Google User Content
    `https://lh3.googleusercontent.com/d/${fileId}`,
    
    // Method 3: Direct download
    `https://drive.google.com/uc?export=download&id=${fileId}`,
    
    // Method 4: View export
    `https://drive.google.com/uc?export=view&id=${fileId}`,
    
    // Method 5: Docs viewer
    `https://docs.google.com/uc?export=download&id=${fileId}`,
    
    // Method 6: Alternative Google APIs
    `https://lh4.googleusercontent.com/d/${fileId}`,
    `https://lh5.googleusercontent.com/d/${fileId}`,
    `https://lh6.googleusercontent.com/d/${fileId}`
  ];
};

// Environment configuration
export const config = {
  apiUrl: import.meta.env.VITE_API_URL,
  appName: import.meta.env.VITE_APP_NAME,
  collegeName: import.meta.env.VITE_COLLEGE_NAME,
  collegeAddress: import.meta.env.VITE_COLLEGE_ADDRESS,
  collegePhone: import.meta.env.VITE_COLLEGE_PHONE,
  devName: import.meta.env.VITE_DEV_NAME,
  
  // Google Drive File IDs
  logoFileId: import.meta.env.VITE_IMAGE_LOGO_FILE_ID,
  giftFileId: import.meta.env.VITE_IMAGE_GIFT_FILE_ID,
  
  // ตั้งค่า URLs เริ่มต้น (จะถูกแทนที่หลังจากทดสอบ)
  imageLogo: import.meta.env.VITE_IMAGE_LOGO,
  imageGift: import.meta.env.VITE_IMAGE_GIFT,
  
  // Backup URLs
  imageLogoBackup: import.meta.env.VITE_IMAGE_LOGO_BACKUP,
  imageGiftBackup: import.meta.env.VITE_IMAGE_GIFT_BACKUP,
  
  // ข้อมูลธนาคาร
  bankName: import.meta.env.VITE_BANK_NAME,
  bankAccount: import.meta.env.VITE_BANK_ACCOUNT,
  bankAccountName: import.meta.env.VITE_BANK_ACCOUNT_NAME,
  bankBranch: import.meta.env.VITE_BANK_BRANCH,
  
  // ค่าธรรมเนียม
  membershipFee: parseInt(import.meta.env.VITE_MEMBERSHIP_FEE),
  shippingFee: parseInt(import.meta.env.VITE_SHIPPING_FEE),
  
  // การอัปโหลดไฟล์
  maxFileSize: parseInt(import.meta.env.VITE_MAX_FILE_SIZE),
  allowedFileTypes: import.meta.env.VITE_ALLOWED_FILE_TYPES?.split(',') || ['image/jpeg', 'image/png', 'application/pdf']
};

// ทดสอบและหา URL ที่ใช้งานได้สำหรับรูปภาพ
const initializeImages = async () => {
  console.log('🔍 Initializing Google Drive images...');
  
  // ทดสอบ Logo
  if (config.logoFileId) {
    const logoSources = createGoogleDriveUrls(config.logoFileId);
    const workingLogoUrl = await tryMultipleImageSources(logoSources);
    if (workingLogoUrl) {
      config.imageLogo = workingLogoUrl;
    } else {
      console.warn('⚠️  No working logo URL found, using backup');
      config.imageLogo = config.imageLogoBackup;
    }
  }
  
  // ทดสอบ Gift Image
  if (config.giftFileId) {
    const giftSources = createGoogleDriveUrls(config.giftFileId);
    const workingGiftUrl = await tryMultipleImageSources(giftSources);
    if (workingGiftUrl) {
      config.imageGift = workingGiftUrl;
    } else {
      console.warn('⚠️  No working gift URL found, using backup');  
      config.imageGift = config.imageGiftBackup;
    }
  }
  
  console.log('✅ Image initialization complete:', {
    logo: config.imageLogo,
    gift: config.imageGift
  });
};

// เรียกใช้การตั้งค่ารูปภาพ
initializeImages();

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
    const currentBuddhistYear = new Date().getFullYear() + 543;
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
    'อื่น ๆ'
  ]
};

// ไอคอนสำหรับการบริจาค/สนับสนุน (แทนที่ไอคอนบัตรเครดิต 💳)
export const donationIcons = {
  // ไอคอนหลัก - การให้และการทำบุญ
  heart: "❤️",           // หัวใจ - ความรัก
  gift: "🎁",            // ของขวัญ - การให้
  handshake: "🤝",       // จับมือ - ความร่วมมือ
  pray: "🙏",           // ไหว้ - ความขอบคุณ
  lotus: "🪷",          // ดอกบัว - การทำบุญ
  
  // ไอคอนการศึกษา
  graduate: "🎓",        // หมวกจบ - การศึกษา
  books: "📚",           // หนังสือ - ความรู้
  school: "🏫",          // โรงเรียน - สถาบัน
  pencil: "✏️",         // ดินสอ - การเรียน
  apple: "🍎",          // แอปเปิล - ครู
  
  // ไอคอนความสำเร็จ
  star: "⭐",           // ดาว - ความเป็นเลิศ
  medal: "🏅",          // เหรียญ - ความสำเร็จ
  trophy: "🏆",         // ถ้วยรางวัล - ชัยชนะ
  crown: "👑",          // มงกุฎ - เกียรติยศ
  gem: "💎",           // เพชร - สิ่งมีค่า
  
  // ไอคอนธรรมชาติและความหวัง
  rainbow: "🌈",        // รุ้ง - ความหวัง
  seedling: "🌱",       // ต้นกล้า - การเติบโต
  sunrise: "🌅",        // พระอาทิตย์ขึ้น - จุดเริ่มต้นใหม่
  tree: "🌳",          // ต้นไม้ - การเติบโต
  flower: "🌸",        // ดอกไม้ - ความงาม
  
  // ไอคอนศาสนาและจิตวิญญาณ
  temple: "🛕",         // วัด - ศาสนา
  candle: "🕯️",        // เทียน - แสงสว่าง
  dove: "🕊️",          // นกพิราบ - สันติภาพ
  infinity: "♾️",      // อนันต์ - ความเป็นนิรันดร์
  
  // ไอคอนชุมชนและสังคม
  people: "👥",         // คนกลุ่ม - ชุมชน
  family: "👨‍👩‍👧‍👦",        // ครอบครัว - ความอบอุ่น
  earth: "🌍",         // โลก - สิ่งแวดล้อม
  house: "🏠"          // บ้าน - ที่อยู่อาศัย
};

// ฟังก์ชันสำหรับสุ่มไอคอนบริจาค
export const getRandomDonationIcon = () => {
  const iconKeys = Object.keys(donationIcons);
  const randomKey = iconKeys[Math.floor(Math.random() * iconKeys.length)];
  return donationIcons[randomKey];
};

// ฟังก์ชันเลือกไอคอนตามหมวดหมู่
export const getDonationIconByCategory = (category = 'education') => {
  const categories = {
    education: [donationIcons.graduate, donationIcons.books, donationIcons.school, donationIcons.pencil],
    giving: [donationIcons.heart, donationIcons.gift, donationIcons.handshake, donationIcons.pray],
    success: [donationIcons.star, donationIcons.medal, donationIcons.trophy, donationIcons.crown],
    nature: [donationIcons.rainbow, donationIcons.seedling, donationIcons.tree, donationIcons.flower],
    spiritual: [donationIcons.lotus, donationIcons.temple, donationIcons.candle, donationIcons.dove]
  };
  
  const categoryIcons = categories[category] || categories.education;
  return categoryIcons[Math.floor(Math.random() * categoryIcons.length)];
};

export default config;