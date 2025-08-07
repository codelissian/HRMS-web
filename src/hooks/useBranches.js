import { useState, useEffect } from 'react';

const BRANCHES_STORAGE_KEY = 'hrms_branches';

export const useBranches = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load branches from localStorage
  const loadBranches = () => {
    try {
      const storedBranches = JSON.parse(localStorage.getItem(BRANCHES_STORAGE_KEY) || '[]');
      setBranches(storedBranches);
    } catch (error) {
      console.error('Error loading branches:', error);
      setBranches([]);
    }
  };

  // Initialize with dummy data if no branches exist
  const initializeDummyBranches = () => {
    const existingBranches = JSON.parse(localStorage.getItem(BRANCHES_STORAGE_KEY) || '[]');
    if (existingBranches.length === 0) {
      const dummyBranches = [
        {
          id: '1',
          name: 'Head Office',
          code: 'HO',
          address: '123 Main Street, Downtown, City 12345',
          phone: '+1 (555) 123-4567',
          email: 'headoffice@company.com',
          manager: 'John Smith',
          status: 'active',
          createdAt: '2023-01-01T00:00:00.000Z',
        },
        {
          id: '2',
          name: 'North Branch',
          code: 'NB',
          address: '456 North Ave, North District, City 12345',
          phone: '+1 (555) 234-5678',
          email: 'northbranch@company.com',
          manager: 'Jane Doe',
          status: 'active',
          createdAt: '2023-02-01T00:00:00.000Z',
        },
        {
          id: '3',
          name: 'South Branch',
          code: 'SB',
          address: '789 South Blvd, South District, City 12345',
          phone: '+1 (555) 345-6789',
          email: 'southbranch@company.com',
          manager: 'Mike Johnson',
          status: 'active',
          createdAt: '2023-03-01T00:00:00.000Z',
        },
      ];
      localStorage.setItem(BRANCHES_STORAGE_KEY, JSON.stringify(dummyBranches));
      setBranches(dummyBranches);
    }
  };

  // Add new branch
  const addBranch = (branchData) => {
    setLoading(true);
    try {
      const newBranch = {
        ...branchData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        status: 'active',
      };
      const updatedBranches = [...branches, newBranch];
      localStorage.setItem(BRANCHES_STORAGE_KEY, JSON.stringify(updatedBranches));
      setBranches(updatedBranches);
      return { success: true, data: newBranch };
    } catch (error) {
      console.error('Error adding branch:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Update existing branch
  const updateBranch = (branchId, branchData) => {
    setLoading(true);
    try {
      const updatedBranches = branches.map(branch =>
        branch.id === branchId ? { ...branch, ...branchData } : branch
      );
      localStorage.setItem(BRANCHES_STORAGE_KEY, JSON.stringify(updatedBranches));
      setBranches(updatedBranches);
      return { success: true };
    } catch (error) {
      console.error('Error updating branch:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Delete branch
  const deleteBranch = (branchId) => {
    setLoading(true);
    try {
      const updatedBranches = branches.filter(branch => branch.id !== branchId);
      localStorage.setItem(BRANCHES_STORAGE_KEY, JSON.stringify(updatedBranches));
      setBranches(updatedBranches);
      return { success: true };
    } catch (error) {
      console.error('Error deleting branch:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Get branch by ID
  const getBranchById = (branchId) => {
    return branches.find(branch => branch.id === branchId);
  };

  // Get active branches only
  const getActiveBranches = () => {
    return branches.filter(branch => branch.status === 'active');
  };

  useEffect(() => {
    loadBranches();
    initializeDummyBranches();
  }, []);

  return {
    branches,
    loading,
    addBranch,
    updateBranch,
    deleteBranch,
    getBranchById,
    getActiveBranches,
    loadBranches,
  };
}; 