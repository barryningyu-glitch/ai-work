import React, { useState, useRef, useEffect } from 'react';

export const Select = ({ children, value, onValueChange, className = '', ...props }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || '');
  const selectRef = useRef(null);

  useEffect(() => {
    setSelectedValue(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (newValue) => {
    setSelectedValue(newValue);
    setIsOpen(false);
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  return (
    <div ref={selectRef} className={`relative ${className}`} {...props}>
      {React.Children.map(children, child => {
        if (child.type === SelectTrigger) {
          return React.cloneElement(child, {
            onClick: () => setIsOpen(!isOpen),
            selectedValue,
            isOpen
          });
        }
        if (child.type === SelectContent) {
          return React.cloneElement(child, {
            isOpen,
            onSelect: handleSelect,
            selectedValue
          });
        }
        return child;
      })}
    </div>
  );
};

export const SelectContent = ({ children, isOpen, onSelect, selectedValue, ...props }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 right-0 z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto" {...props}>
      {React.Children.map(children, child => {
        if (child.type === SelectItem) {
          return React.cloneElement(child, {
            onSelect,
            isSelected: child.props.value === selectedValue
          });
        }
        return child;
      })}
    </div>
  );
};

export const SelectItem = ({ children, value, onSelect, isSelected, ...props }) => {
  return (
    <div
      className={`px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white ${isSelected ? 'bg-blue-50 text-blue-600 dark:bg-green-900 dark:text-green-400' : ''}`}
      onClick={() => onSelect && onSelect(value)}
      {...props}
    >
      {children}
    </div>
  );
};

export const SelectTrigger = ({ children, className = '', onClick, selectedValue, isOpen, ...props }) => {
  return (
    <div 
      className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-green-500 focus:border-blue-500 dark:focus:border-green-500 bg-white dark:bg-gray-800 dark:text-white cursor-pointer flex items-center justify-between ${className}`} 
      onClick={onClick}
      {...props}
    >
      <div className="flex-1">
        {React.Children.map(children, child => {
          if (child.type === SelectValue) {
            return React.cloneElement(child, { selectedValue });
          }
          return child;
        })}
      </div>
      <svg 
        className={`w-4 h-4 transition-transform dark:text-white ${isOpen ? 'rotate-180' : ''}`} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
};

export const SelectValue = ({ placeholder, selectedValue, className = '', ...props }) => {
  return (
    <span className={`${selectedValue ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'} ${className}`} {...props}>
      {selectedValue || placeholder}
    </span>
  );
};

export default Select;