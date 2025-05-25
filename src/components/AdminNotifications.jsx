// src/components/AdminNotifications.jsx - Admin Notification System
import React, { useState, useEffect } from 'react';
import { config } from '../utils/config';

// Toast Notification Component
const AdminToast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 10000); // แสดง 10 วินาที สำหรับ admin notification

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`admin-toast ${type}`} style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '16px 24px',
      borderRadius: '8px',
      color: 'white',
      fontWeight: '500',
      zIndex: 10000,
      maxWidth: '400px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
      animation: 'slideIn 0.3s ease',
      backgroundColor: type === 'success' ? '#28a745' : 
                      type === 'error' ? '#dc3545' : 
                      type === 'info' ? '#17a2b8' : '#ffc107'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, marginRight: '12px' }}>
          <div style={{ fontSize: '14px', marginBottom: '4px', opacity: 0.9 }}>
            การแจ้งเตือนใหม่
          </div>
          <div style={{ fontSize: '16px', lineHeight: '1.4' }}>
            {message}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '0',
            opacity: 0.7
          }}
        >
          ×
        </button>
      </div>
      
      {/* Progress bar */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        height: '3px',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        animation: 'progress 10s linear'
      }} />
    </div>
  );
};

// Notification Bell Icon Component
const NotificationBell = ({ unreadCount, onClick }) => {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'relative',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '8px',
        borderRadius: '8px',
        transition: 'all 0.3s ease',
        color: 'var(--text-secondary)'
      }}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = 'var(--bg-light)';
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = 'transparent';
      }}
    >
      {/* Bell Icon */}
      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      
      {/* Badge */}
      {unreadCount > 0 && (
        <div style={{
          position: 'absolute',
          top: '4px',
          right: '4px',
          backgroundColor: '#dc3545',
          color: 'white',
          borderRadius: '50%',
          width: '18px',
          height: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '11px',
          fontWeight: 'bold',
          animation: unreadCount > 0 ? 'pulse 2s infinite' : 'none'
        }}>
          {unreadCount > 99 ? '99+' : unreadCount}
        </div>
      )}
    </button>
  );
};

// Notification Modal Component
const NotificationModal = ({ isOpen, onClose, notifications, onMarkAsRead, onMarkAllAsRead, onDeleteNotification }) => {
  if (!isOpen) return null;

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'เพิ่งแล้ว';
    if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
    if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
    return `${days} วันที่แล้ว`;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_registration':
        return '👥';
      case 'payment_uploaded':
        return '💳';
      case 'status_updated':
        return '📋';
      case 'position_updated':
        return '👤';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'new_registration':
        return '#28a745';
      case 'payment_uploaded':
        return '#ffc107';
      case 'status_updated':
        return '#17a2b8';
      case 'position_updated':
        return '#6f42c1';
      default:
        return '#6c757d';
    }
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 1500 }}>
      <div className="modal-container" style={{ maxWidth: '600px', maxHeight: '80vh' }}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">การแจ้งเตือน</h2>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {notifications.length > 0 && (
              <button
                onClick={onMarkAllAsRead}
                style={{
                  background: 'var(--primary-color)',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                อ่านทั้งหมด
              </button>
            )}
            <button onClick={onClose} className="modal-close">×</button>
          </div>
        </div>

        {/* Content */}
        <div className="modal-content" style={{ padding: 0, maxHeight: '500px', overflowY: 'auto' }}>
          {notifications.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: 'var(--spacing-2xl)', 
              color: 'var(--text-muted)' 
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔔</div>
              <p>ไม่มีการแจ้งเตือน</p>
            </div>
          ) : (
            <div>
              {notifications.map((notification) => {
                const isRead = notification.readBy?.some(read => read.user);
                
                return (
                  <div
                    key={notification._id}
                    style={{
                      padding: '16px',
                      borderBottom: '1px solid var(--border-color)',
                      backgroundColor: isRead ? 'transparent' : 'rgba(59, 130, 246, 0.05)',
                      display: 'flex',
                      gap: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => !isRead && onMarkAsRead(notification._id)}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'var(--bg-light)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = isRead ? 'transparent' : 'rgba(59, 130, 246, 0.05)';
                    }}
                  >
                    {/* Icon */}
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: getNotificationColor(notification.type),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      flexShrink: 0
                    }}>
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ 
                        fontWeight: isRead ? 'normal' : 'bold',
                        fontSize: '14px',
                        marginBottom: '4px',
                        color: 'var(--text-primary)'
                      }}>
                        {notification.title}
                      </div>
                      <div style={{ 
                        fontSize: '13px',
                        color: 'var(--text-secondary)',
                        lineHeight: '1.4',
                        marginBottom: '6px'
                      }}>
                        {notification.message}
                      </div>
                      <div style={{ 
                        fontSize: '12px',
                        color: 'var(--text-muted)'
                      }}>
                        {formatTimeAgo(notification.createdAt)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {!isRead && (
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: '#dc3545'
                        }} />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteNotification(notification._id);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '4px',
                          fontSize: '16px'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Admin Notifications Hook
export const useAdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      const response = await fetch(`${config.apiUrl}/api/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Show toast notification
  const showToast = (message, type = 'info') => {
    const id = Date.now();
    const newToast = { id, message, type };
    setToasts(prev => [...prev, newToast]);
  };

  // Remove toast
  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Mark as read
  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`${config.apiUrl}/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      await fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`${config.apiUrl}/api/notifications/mark-all-read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      await fetchNotifications();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`${config.apiUrl}/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      await fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Auto fetch notifications
  useEffect(() => {
    fetchNotifications();
    
    // Poll every 30 seconds for new notifications
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Check for new notifications and show toast
  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[0];
      const createdAt = new Date(latestNotification.createdAt);
      const now = new Date();
      const diffMinutes = (now - createdAt) / (1000 * 60);

      // ถ้าเป็น notification ใหม่ (สร้างไม่เกิน 1 นาที)
      if (diffMinutes < 1 && !latestNotification.readBy?.length) {
        showToast(latestNotification.message, 'info');
      }
    }
  }, [notifications]);

  return {
    notifications,
    unreadCount,
    loading,
    toasts,
    showToast,
    removeToast,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchNotifications
  };
};

// Main Component Export
export default {
  AdminToast,
  NotificationBell,
  NotificationModal,
  useAdminNotifications
};