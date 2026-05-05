import React, { useState, useRef, useEffect } from 'react';

interface FAQItemProps {
  question: string;
  answer: string;
}

const ChevronDownIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" style={{ transition: 'transform 0.3s ease' }}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [open]);

  return (
    <div style={{
      borderBottom: '1px solid var(--it-border)',
      paddingBlock: '1rem',
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          background: 'none',
          border: 'none',
          padding: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          cursor: 'pointer',
          fontSize: '1rem',
          fontWeight: 700,
          color: 'var(--it-text)',
          textAlign: 'left',
        }}
      >
        {question}
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          color: 'var(--it-primary)',
          flexShrink: 0,
          transform: open ? 'rotate(180deg)' : 'rotate(0)',
          transition: 'transform 0.3s ease',
        }}>
          <ChevronDownIcon />
        </span>
      </button>

      <div
        ref={contentRef}
        style={{
          maxHeight: open ? `${height}px` : '0',
          overflow: 'hidden',
          transition: 'max-height 0.3s ease',
        }}
      >
        <p style={{ color: 'var(--it-text-muted)', lineHeight: 1.7, margin: '1rem 0 0', paddingRight: '2rem' }}>
          {answer}
        </p>
      </div>
    </div>
  );
};

export default FAQItem;
