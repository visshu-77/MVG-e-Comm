import React, { useEffect } from 'react';

const Toast = ({ message, visible, onClose }) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        left: 20,
        bottom: 20,
        zIndex: 1000,
        minWidth: 180,
        maxWidth: 260,
        background: '#fff',
        color: '#222',
        borderRadius: 6,
        border: '1px solid #e5e7eb', // subtle border
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        padding: '10px 16px',
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        animation: 'toast-in 0.3s',
      }}
    >
      <span role="img" aria-label="info" style={{fontSize: 16}}>🔔</span>
      <span>{message}</span>
    </div>
  );
};

export default Toast; 