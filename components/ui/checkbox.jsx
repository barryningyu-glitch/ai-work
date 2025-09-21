import React from 'react';

export const Checkbox = ({ 
  checked = false, 
  onChange, 
  className = '',
  children,
  ...props 
}) => {
  const baseClasses = 'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded';
  const classes = `${baseClasses} ${className}`;

  return (
    <label className="flex items-center space-x-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange && onChange(e.target.checked)}
        className={classes}
        {...props}
      />
      {children && <span className="text-sm text-gray-700">{children}</span>}
    </label>
  );
};

export default Checkbox;