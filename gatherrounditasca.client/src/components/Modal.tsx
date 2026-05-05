import React, { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = '720px',
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1.25rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--it-bg-elev)',
          borderRadius: 'var(--it-radius-lg)',
          border: '1.5px solid var(--it-border)',
          maxWidth,
          width: '100%',
          maxHeight: '85vh',
          overflow: 'auto',
          boxShadow: 'var(--it-shadow-lg)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div
            style={{
              padding: '1.5rem',
              borderBottom: '1.5px solid var(--it-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: '1.35rem',
                fontWeight: 800,
                color: 'var(--it-text)',
              }}
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: 'var(--it-text-muted)',
                padding: 0,
              }}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        )}
        <div style={{ padding: '1.5rem' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
