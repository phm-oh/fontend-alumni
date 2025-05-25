// src/components/SafeImage.jsx - Safe Image Component with Error Handling
import React, { useState } from 'react';

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

export default SafeImage;