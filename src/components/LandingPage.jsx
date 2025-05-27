// src/components/LandingPage.jsx - Landing Page with Clickable Cards
import React from "react";
import { config } from "../utils/config";
import SafeImage from "./SafeImage";

const LandingPage = ({ onNavigate }) => {
  // Set hero background image dynamically
  const heroStyle = {
    backgroundImage: `url(${config.cloudinary_hero_url})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  };

  return (
    <div className="page landing-page">
      <div className="hero-section" style={heroStyle}>
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">{config.appName}</h1>
            <h2 className="college-name">{config.collegeName}</h2>
            <p className="hero-subtitle">
              เชื่อมโยงสายใยศิษย์เก่า สืบสานประเพณี และร่วมพัฒนาสถาบัน
            </p>
            <div className="hero-actions">
              <button
                className="btn btn-primary btn-large"
                onClick={() => onNavigate("register")}
              >
                ลงทะเบียนศิษย์เก่า
              </button>
              <button
                className="btn btn-outline btn-large"
                onClick={() => onNavigate("check-status")}
              >
                ตรวจสอบสถานะ
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="features-section">
        <div className="container">
          <h2 className="section-title">
            ชมรมศิษย์เก่าวิทยาลัยอาชีวศึกษาอุดรธานี
          </h2>
          <div className="features-grid">
            {/* Card 1: ลงทะเบียนออนไลน์ - ให้กดได้ */}
            <div 
              className="feature-card clickable-card" 
              onClick={() => onNavigate("register")}
              style={{ cursor: 'pointer' }}
            >
              <div className="feature-icon">🎓</div>
              <h3>ลงทะเบียนออนไลน์</h3>
              <p>ลงทะเบียนเป็นสมาชิกศิษย์เก่าได้ง่ายๆ ผ่านระบบออนไลน์</p>
            </div>

            {/* Card 2: บริจาค - ปกติ */}
            <div className="feature-card">
              <div className="feature-icon">📚💝🙏🎁</div>
              <h3>บริจาค</h3>
              <p>
                บริจาคทุนการศึกษา พัฒนาสถานศึกษา สถานที่
                เครื่องมือในการเรียนการสอน{" "}
              </p>
            </div>

            {/* Card 3: เครือข่ายศิษย์เก่า - ปกติ */}
            <div className="feature-card">
              <div className="feature-icon">🤝</div>
              <h3>เครือข่ายศิษย์เก่า</h3>
              <p>เชื่อมต่อและสร้างเครือข่ายกับศิษย์เก่าคนอื่นๆ</p>
            </div>

            {/* Card 4: ตรวจสอบสถานะ - ให้กดได้ */}
            <div 
              className="feature-card clickable-card" 
              onClick={() => onNavigate("check-status")}
              style={{ cursor: 'pointer' }}
            >
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
                <h3>ค่าสมาชิก</h3>
                <div className="price">{config.membershipFee} บาท</div>
                <p>รวมลงทะเบียนเป็นสมาชิกชมรมศิษย์เก่า</p>
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
                src={config.cloudinary_gift_url}
                alt="ของที่ระลึกสำหรับสมาชิก"
                className="gift-image"
                fallback={
                  <div className="gift-placeholder">🎁 ของที่ระลึก</div>
                }
              />
              <p>ของที่ระลึกพิเศษสำหรับสมาชิกศิษย์เก่า</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;