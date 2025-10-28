/**
 * Base Skeleton Component
 * Provides primitive skeleton loading UI with pulse animation
 */

export default function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
  rounded = 'md'
}) {
  const baseClasses = 'animate-pulse bg-slate-200';

  const variantClasses = {
    rectangular: '',
    circular: 'rounded-full',
    text: 'h-4',
  };

  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full',
  };

  const widthStyle = width ? { width } : {};
  const heightStyle = height ? { height } : {};

  return (
    <div
      className={`
        ${baseClasses}
        ${variantClasses[variant] || ''}
        ${variant === 'circular' ? '' : roundedClasses[rounded]}
        ${className}
      `}
      style={{ ...widthStyle, ...heightStyle }}
    />
  );
}
