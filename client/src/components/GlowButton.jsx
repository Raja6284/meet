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
        <div className="absolute -inset-[1px] rounded-2xl bg-[conic-gradient(from_var(--glow-angle),#7c3aed,#6366f1,#8b5cf6,#a78bfa,#7c3aed)] opacity-60 blur-[1px] group-hover:opacity-100 group-hover:blur-[2px] transition-all duration-300 glow-spin" />
        <button
          ref={btnRef}
          onClick={handleClick}
          disabled={disabled}
          className={`${baseClasses} relative bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white shadow-[0_8px_32px_rgba(99,102,241,0.35)] hover:shadow-[0_8px_40px_rgba(99,102,241,0.5)] hover:-translate-y-[1px]`}
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
      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-[rgba(99,102,241,0.3)] to-[rgba(139,92,246,0.3)] opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
      <button
        ref={btnRef}
        onClick={handleClick}
        disabled={disabled}
        className={`${baseClasses} relative bg-[rgba(10,10,10,0.8)] backdrop-blur-sm text-white border border-white/10 hover:bg-[rgba(99,102,241,0.1)] hover:border-white/20 hover:-translate-y-[1px]`}
        {...props}
      >
        {children}
      </button>
    </div>
  );
}
