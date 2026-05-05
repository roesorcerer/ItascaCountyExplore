import React, { ReactNode, CSSProperties } from 'react';

interface CardProps {
  children: ReactNode;
  style?: CSSProperties;
  clickable?: boolean;
  onClick?: () => void;
  className?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  clickable = false,
  onClick,
  className = '',
}) => {
  return (
    <div
      className={`it-card ${className}`.trim()}
      onClick={onClick}
      style={{
        background: 'var(--it-bg-elev)',
        borderRadius: 'var(--it-radius-lg)',
        border: '1.5px solid var(--it-border)',
        overflow: 'hidden',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        cursor: clickable ? 'pointer' : 'default',
        ...style,
      }}
      onMouseEnter={(e) => {
        if (clickable) {
          e.currentTarget.style.transform = 'translateY(-6px)';
          e.currentTarget.style.boxShadow = 'var(--it-shadow-lg)';
          e.currentTarget.style.borderColor = 'var(--it-primary)';
        }
      }}
      onMouseLeave={(e) => {
        if (clickable) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.borderColor = 'var(--it-border)';
        }
      }}
    >
      {children}
    </div>
  );
};

export default Card;
