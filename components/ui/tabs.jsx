import React, { useState } from 'react';

export const Tabs = ({ children, defaultValue, className = '' }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <div className={`tabs ${className}`}>
      {React.Children.map(children, child => 
        React.cloneElement(child, { activeTab, setActiveTab })
      )}
    </div>
  );
};

export const TabsList = ({ children, activeTab, setActiveTab, className = '' }) => {
  return (
    <div className={`flex border-b border-gray-200 ${className}`}>
      {React.Children.map(children, child => 
        React.cloneElement(child, { activeTab, setActiveTab })
      )}
    </div>
  );
};

export const TabsTrigger = ({ children, value, activeTab, setActiveTab, className = '' }) => {
  const isActive = activeTab === value;
  const baseClasses = 'px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer';
  const activeClasses = isActive 
    ? 'border-blue-500 text-blue-600' 
    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300';
  
  return (
    <button
      className={`${baseClasses} ${activeClasses} ${className}`}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ children, value, activeTab, className = '' }) => {
  if (activeTab !== value) return null;
  
  return (
    <div className={`mt-4 ${className}`}>
      {children}
    </div>
  );
};

export default Tabs;