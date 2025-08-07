import React, { createContext, useContext, useState, useEffect } from 'react';

const BranchContext = createContext();

export const useBranch = () => {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error('useBranch must be used within a BranchProvider');
  }
  return context;
};

export const BranchProvider = ({ children }) => {
  const [selectedBranch, setSelectedBranch] = useState(null);

  // Load selected branch from localStorage on mount
  useEffect(() => {
    const savedBranch = localStorage.getItem('hrms_selected_branch');
    if (savedBranch) {
      setSelectedBranch(JSON.parse(savedBranch));
    }
  }, []);

  // Save selected branch to localStorage whenever it changes
  useEffect(() => {
    if (selectedBranch) {
      localStorage.setItem('hrms_selected_branch', JSON.stringify(selectedBranch));
    }
  }, [selectedBranch]);

  const value = {
    selectedBranch,
    setSelectedBranch,
  };

  return (
    <BranchContext.Provider value={value}>
      {children}
    </BranchContext.Provider>
  );
}; 