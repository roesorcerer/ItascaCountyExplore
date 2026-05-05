import React, { ReactNode } from 'react';

interface SectionHeadProps {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  centered?: boolean;
  maxWidth?: string;
}

const SectionHead: React.FC<SectionHeadProps> = ({
  eyebrow,
  title,
  subtitle,
  centered = true,
  maxWidth = '720px',
}) => {
  return (
    <div
      className="it-section__head"
      style={{
        textAlign: centered ? 'center' : 'left',
        maxWidth: centered ? maxWidth : undefined,
        margin: centered ? '0 auto 3rem' : '0 0 2rem',
      }}
    >
      {eyebrow && (
        <span className="it-section__eyebrow">{eyebrow}</span>
      )}
      {typeof title === 'string' ? (
        <h1
          style={{
            fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
            fontWeight: 800,
            margin: '0.5rem 0 1rem',
            letterSpacing: '-0.02em',
            color: 'var(--it-text)',
          }}
        >
          {title}
        </h1>
      ) : (
        title
      )}
      {subtitle && (
        <p
          style={{
            fontSize: '1.08rem',
            color: 'var(--it-text-muted)',
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionHead;
