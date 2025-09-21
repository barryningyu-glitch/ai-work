import React from 'react';

export const Button = ({ children, onClick, type = 'button', variant = 'default', size = 'md', className = '', ...props }) => {
  const baseClasses = 'matrix-btn font-medium transition-all duration-300 focus:outline-none relative overflow-hidden';
  
  const variants = {
    default: 'matrix-btn-default',
    primary: 'matrix-btn-primary', 
    secondary: 'matrix-btn-secondary',
    outline: 'matrix-btn-outline',
    ghost: 'matrix-btn-ghost',
    destructive: 'matrix-btn-destructive'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
};

export default Button;