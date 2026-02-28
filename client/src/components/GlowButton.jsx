import { useRef, useCallback } from 'react';

/**
 * A premium 3D button with glow border, press effect, and optional conic-gradient spinning border.
 */
export default function GlowButton({
  children,
  onClick,
  disabled = false,
  variant = 'primary', // 'primary' | 'secondary'
  className = '',
  size = 'md',
  fullWidth = false,
  ...props
}) {
  const btnRef = useRef(null);

  const handleClick = useCallback((e) => {
    if (disabled) return;
    onClick?.(e);
  }, [disabled, onClick]);

  const sizeClasses = {
    sm: 'px-5 py-2.5 text-sm gap-2',
    md: 'px-8 py-3.5 text-base gap-2.5',
    lg: 'px-10 py-4 text-lg gap-3',
  };

  const baseClasses = `
    relative font-semibold rounded-2xl
    flex items-center justify-center
    transition-all duration-200 ease-out
    select-none cursor-pointer
    active:scale-[0.97] active:translate-y-[1px]
    disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 disabled:active:translate-y-0
    ${fullWidth ? 'w-full' : ''}
    ${sizeClasses[size]}
    ${className}
  `;

  if (variant === 'primary') {
    return (
      <div className={`relative group ${fullWidth ? 'w-full' : 'inline-flex'}`}>
        {/* Animated conic-gradient border */}
        <div className="absolute -inset-[1px] rounded-2xl bg-[conic-gradient(from_var(--glow-angle),#6d28d9,#7c3aed,#9b87f5,#7c3aed,#6d28d9)] opacity-50 blur-[1px] group-hover:opacity-90 group-hover:blur-[2px] transition-all duration-300 glow-spin" />
        <button
          ref={btnRef}
          onClick={handleClick}
          disabled={disabled}
          className={`${baseClasses} relative text-white hover:-translate-y-[1px]`}
          style={{ background: 'linear-gradient(135deg, #6d28d9, #7c3aed)', boxShadow: '0 8px 32px rgba(124,58,237,0.35)' }}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 40px rgba(124,58,237,0.5)'; e.currentTarget.style.background = 'linear-gradient(135deg, #7c3aed, #8b5cf6)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,58,237,0.35)'; e.currentTarget.style.background = 'linear-gradient(135deg, #6d28d9, #7c3aed)'; }}
          {...props}
        >
          {children}
        </button>
      </div>
    );
  }

  // Secondary / outlined
  return (
    <div className={`relative group ${fullWidth ? 'w-full' : 'inline-flex'}`}>
      <div className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(124,58,237,0.15))' }} />
      <button
        ref={btnRef}
        onClick={handleClick}
        disabled={disabled}
        className={`${baseClasses} relative bg-[rgba(10,10,10,0.8)] backdrop-blur-sm hover:-translate-y-[1px]`}
        style={{ color: '#c4b5fd', border: '1px solid rgba(124, 58, 237, 0.5)' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(124,58,237,0.1)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(10,10,10,0.8)'; }}
        {...props}
      >
        {children}
      </button>
    </div>
  );
}
