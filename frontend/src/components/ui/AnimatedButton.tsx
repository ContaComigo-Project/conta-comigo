import React from 'react';
import { Link } from 'react-router-dom';

interface AnimatedButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'type'> {
  to?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
  type?: 'button' | 'submit' | 'reset';
}

export function AnimatedButton({ to, icon, children, size = 'md', className = '', onClick, type, ...props }: AnimatedButtonProps) {
  const sizeClasses = {
    sm: 'px-4 py-2.5 text-sm rounded-xl',
    md: 'px-6 py-3 md:px-8 md:py-4 text-base md:text-lg rounded-md',
    lg: 'px-8 py-4 text-lg rounded-md',
  };

  const baseClasses = `font-semibold bg-gradient-primary text-white shadow-md transition-all duration-150 hover:-translate-y-1 hover:shadow-lg inline-flex items-center justify-center group overflow-hidden relative cursor-pointer ${sizeClasses[size]} ${className}`;

  const content = (
    <>
      <div className="absolute top-0 -left-full w-full h-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-all duration-500 group-hover:left-full"></div>
      <span className="relative z-10 flex items-center gap-2">
        {children}
        {icon && <span className="transition-transform group-hover:translate-x-1 flex items-center">{icon}</span>}
      </span>
    </>
  );

  if (to) {
    return (
      <Link to={to} onClick={onClick as React.MouseEventHandler<HTMLAnchorElement>} className={baseClasses}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type ?? 'button'} className={baseClasses} onClick={onClick as React.MouseEventHandler<HTMLButtonElement>} {...props}>
      {content}
    </button>
  );
}
