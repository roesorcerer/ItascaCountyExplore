import React, { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'accent' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  icon?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      children,
      icon,
      loading = false,
      fullWidth = false,
      disabled = false,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={`it-btn it-btn-${variant} ${className}`.trim()}
        disabled={disabled || loading}
        style={{
          width: fullWidth ? '100%' : undefined,
          opacity: disabled || loading ? 0.6 : 1,
          ...props.style,
        }}
        {...props}
      >
        {loading ? (
          <span style={{ display: 'inline-block', marginRight: '0.5rem' }}>
            🔄
          </span>
        ) : icon ? (
          <span style={{ display: 'inline-flex', marginRight: '0.5rem' }}>
            {icon}
          </span>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
