import React from 'react';

export const Slider = ({ 
  value = 0, 
  onChange, 
  min = 0, 
  max = 100, 
  step = 1, 
  className = '',
  ...props 
}) => {
  const baseClasses = 'w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider';
  const classes = `${baseClasses} ${className}`;

  return (
    <div className="relative">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange && onChange(Number(e.target.value))}
        className={classes}
        {...props}
      />
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default Slider;