// src/components/AlumniRegistration.jsx - Alumni Registration Form Component
import React, { useState } from "react";
import { config, mockData } from "../utils/config";

import { useAppContext } from "../App";

const AlumniRegistration = ({ onNavigate }) => {
  const { setIdCard } = useAppContext();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    idCard: "",
    address: "",
    graduationYear: "",
    department: "",
    phone: "",
    email: "",
    currentJob: "",
    workplace: "",
    facebookId: "",
    lineId: "",
    paymentMethod: "โอนเงิน",
    deliveryOption: "รับที่วิทยาลัย",
    pdpaConsent: false,
  });

  const [profileImage, setProfileImage] = useState(null);
  const [profilePreview, setProfilePreview] = useState("");
  const [paymentProof, setPaymentProof] = useState(null);
  const [paymentPreview, setPaymentPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!config.allowedFileTypes.includes(file.type)) {
      alert("กรุณาเลือกไฟล์ JPG, PNG หรือ PDF เท่านั้น");
      return;
    }

    // Validate file size
    if (file.size > config.maxFileSize) {
      alert("ขนาดไฟล์ต้องไม่เกิน 5MB");
      return;
    }

    if (fileType === "profile") {
      setProfileImage(file);
      // Create preview for profile image
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => setProfilePreview(e.target.result);
        reader.readAsDataURL(file);
      }
    } else if (fileType === "payment") {
      setPaymentProof(file);
      // Create preview for payment proof
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => setPaymentPreview(e.target.result);
        reader.readAsDataURL(file);
      } else {
        setPaymentPreview("");
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = "กรุณากรอกชื่อ";
    if (!formData.lastName.trim()) newErrors.lastName = "กรุณากรอกนามสกุล";

    if (!formData.idCard.trim()) {
      newErrors.idCard = "กรุณากรอกเลขบัตรประชาชน";
    } else if (!/^\d{13}$/.test(formData.idCard)) {
      newErrors.idCard = "เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก";
    }

    if (!formData.address.trim()) newErrors.address = "กรุณากรอกที่อยู่";
    if (!formData.graduationYear)
      newErrors.graduationYear = "กรุณาเลือกปีที่การศึกษา";
    if (!formData.department) newErrors.department = "กรุณาเลือกแผนกวิชา";

    if (!formData.phone.trim()) {
      newErrors.phone = "กรุณากรอกเบอร์โทรศัพท์";
    } else if (!/^0[0-9]{9}$/.test(formData.phone)) {
      newErrors.phone = "เบอร์โทรศัพท์ไม่ถูกต้อง";
    }

    // if (!formData.email.trim()) {
    //   newErrors.email = 'กรุณากรอกอีเมล';
    // } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    //   newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    // }

    if (
      formData.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      newErrors.email = "รูปแบบอีเมลไม่ถูกต้อง";
    }

    if (!formData.pdpaConsent) {
      newErrors.pdpaConsent = "กรุณายินยอมการใช้ข้อมูลส่วนบุคคล";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      // ✅ Clone form data เพื่อไม่เปลี่ยน state จริง
      const safeFormData = { ...formData };

      // ✅ Inject mock email ถ้ายังไม่กรอก
      if (!safeFormData.email || safeFormData.email.trim() === "") {
        safeFormData.email = "udvc@udvc.ac.th";
      }

      // ✅ สร้าง FormData สำหรับส่ง backend
      const submitData = new FormData();
      Object.keys(safeFormData).forEach((key) => {
        submitData.append(key, safeFormData[key]);
      });

      // ใส่ไฟล์
      if (profileImage) {
        submitData.append("profileImage", profileImage);
      }
      if (paymentProof) {
        submitData.append("paymentProof", paymentProof);
      }

      // ยิง request
      const response = await fetch(`${config.apiUrl}/api/alumni/register`, {
        method: "POST",
        body: submitData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showToast("ลงทะเบียนสำเร็จ! กรุณาตรวจสอบอีเมลของท่าน", "success");
        setIdCard(formData.idCard); // ใช้ของจริง ไม่ต้องใช้ safe
        onNavigate("check-status");
      } else {
        showToast(result.message || "เกิดข้อผิดพลาดในการลงทะเบียน", "error");
      }
    } catch (error) {
      console.error("Registration Error:", error);
      showToast("เกิดข้อผิดพลาด: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Toast notification function
  const showToast = (message, type = "info") => {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.style.animation = "slideIn 0.3s ease";
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = "slideOut 0.3s ease";
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 4000); // Show for 4 seconds for registration
  };

  const totalAmount =
    config.membershipFee +
    (formData.deliveryOption === "จัดส่งทางไปรษณีย์" ? config.shippingFee : 0);

  return (
    <div className="page registration-page">
      <div className="container">
        <div className="page-header">
          <button className="btn-back" onClick={() => onNavigate("home")}>
            ← กลับหน้าหลัก
          </button>
          <div className="header-logo"></div>
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
                  className={errors.firstName ? "error" : ""}
                />
                {errors.firstName && (
                  <span className="error-text">{errors.firstName}</span>
                )}
              </div>
              <div className="form-group">
                <label>นามสกุล *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={errors.lastName ? "error" : ""}
                />
                {errors.lastName && (
                  <span className="error-text">{errors.lastName}</span>
                )}
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
                className={errors.idCard ? "error" : ""}
              />
              {errors.idCard && (
                <span className="error-text">{errors.idCard}</span>
              )}
            </div>

            <div className="form-group">
              <label>ที่อยู่ *</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows="3"
                className={errors.address ? "error" : ""}
              />
              {errors.address && (
                <span className="error-text">{errors.address}</span>
              )}
            </div>

            {/* Profile Image Upload */}
            <div className="form-group">
              <label>รูปประจำตัว</label>
              <p className="field-description">
                อัพโหลดรูปถ่ายหน้าตรงชัดเจน (ไม่บังคับ)
              </p>
              <input
                type="file"
                id="profileImage"
                accept="image/jpeg,image/png"
                onChange={(e) => handleFileChange(e, "profile")}
                style={{ display: "none" }}
              />
              <label htmlFor="profileImage" className="file-label">
                {profileImage
                  ? profileImage.name
                  : "เลือกรูปประจำตัว (JPG, PNG)"}
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
                <label>ปีที่จบการศึกษา *</label>
                <select
                  name="graduationYear"
                  value={formData.graduationYear}
                  onChange={handleInputChange}
                  className={errors.graduationYear ? "error" : ""}
                >
                  <option value="">เลือกปีที่จบการศึกษา</option>
                  {mockData.graduationYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                {errors.graduationYear && (
                  <span className="error-text">{errors.graduationYear}</span>
                )}
              </div>
              <div className="form-group">
                <label>แผนกวิชา *</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className={errors.department ? "error" : ""}
                >
                  <option value="">เลือกแผนกวิชา</option>
                  {mockData.departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                {errors.department && (
                  <span className="error-text">{errors.department}</span>
                )}
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
                  className={errors.phone ? "error" : ""}
                />
                {errors.phone && (
                  <span className="error-text">{errors.phone}</span>
                )}
              </div>
              <div className="form-group">
                <label>อีเมล (ไม่จำเป็นต้องกรอก)</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? "error" : ""}
                />
                {errors.email && (
                  <span className="error-text">{errors.email}</span>
                )}
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
                <span>ค่าสมาชิก</span>
                <span>{config.membershipFee} บาท</span>
              </div>
              {formData.deliveryOption === "จัดส่งทางไปรษณีย์" && (
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
                    checked={formData.paymentMethod === "โอนเงิน"}
                    onChange={handleInputChange}
                  />
                  <span>โอนเงิน</span>
                </label>
                <label className="radio-item">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="ชำระด้วยตนเอง"
                    checked={formData.paymentMethod === "ชำระด้วยตนเอง"}
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
                    checked={formData.deliveryOption === "รับที่วิทยาลัย"}
                    onChange={handleInputChange}
                  />
                  <span>รับที่วิทยาลัย (ฟรี)</span>
                </label>
                <label className="radio-item">
                  <input
                    type="radio"
                    name="deliveryOption"
                    value="จัดส่งทางไปรษณีย์"
                    checked={formData.deliveryOption === "จัดส่งทางไปรษณีย์"}
                    onChange={handleInputChange}
                  />
                  <span>จัดส่งทางไปรษณีย์ (+{config.shippingFee} บาท)</span>
                </label>
              </div>
            </div>

            {formData.paymentMethod === "โอนเงิน" && (
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
                  <div className="bank-detail">
                    <p className="field-description">
                      หมายเหตุ : การโอนเงินสำหรับซื้อผลิตภัณฑ์
                      และสนับสนุนกิจกรรมพัฒนาวิทยาลัยฯ ชื่อบัญชี น.ส.ชุติภัทร
                      ชวาลไชย และ นางระพีพรรณ จันทรสา เลขที่บัญชี 443-3-30313-5
                      ธนาคารกรุงไทย สาขาเซ็นทรัลพลาซ่า อุดรธานี
                      สอบถามเพิ่มเติมที่ 089-9441040 (งานการเงิน)
                    </p>
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
                    onChange={(e) => handleFileChange(e, "payment")}
                    style={{ display: "none" }}
                  />
                  <label htmlFor="paymentProof" className="file-label">
                    {paymentProof
                      ? paymentProof.name
                      : "เลือกไฟล์หลักฐาน (JPG, PNG, PDF)"}
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
                  ข้าพเจ้ายินยอมให้สมาคมศิษย์เก่าใช้ข้อมูลส่วนบุคคลเพื่อวัตถุประสงค์ในการติดต่อสื่อสารและกิจกรรมของสมาคม
                  *
                </span>
              </label>
              {errors.pdpaConsent && (
                <span className="error-text">{errors.pdpaConsent}</span>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button
              className="btn btn-primary btn-large"
              disabled={loading}
              onClick={handleSubmit}
            >
              {loading ? "กำลังลงทะเบียน..." : "ลงทะเบียน"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlumniRegistration;
