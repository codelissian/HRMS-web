import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import CustomForm from '../UI/CustomForm';

const BranchForm = ({ open, onClose, branch = null, onSubmit, loading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    phone: '',
    email: '',
    manager: '',
    status: 'active',
  });

  useEffect(() => {
    if (branch) {
      setFormData({
        name: branch.name || '',
        code: branch.code || '',
        address: branch.address || '',
        phone: branch.phone || '',
        email: branch.email || '',
        manager: branch.manager || '',
        status: branch.status || 'active',
      });
    } else {
      setFormData({
        name: '',
        code: '',
        address: '',
        phone: '',
        email: '',
        manager: '',
        status: 'active',
      });
    }
  }, [branch, open]);

  const handleSubmit = (data) => {
    onSubmit(data);
  };

  const branchFields = [
    { name: 'name', type: 'text', label: 'Branch Name', required: true },
    { name: 'code', type: 'text', label: 'Branch Code', required: true },
    { name: 'address', type: 'text', label: 'Address', required: true },
    { name: 'phone', type: 'text', label: 'Phone Number', required: true },
    { name: 'email', type: 'email', label: 'Email Address', required: true },
    { name: 'manager', type: 'text', label: 'Branch Manager', required: true },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      required: true,
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ],
    },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">
            {branch ? 'Edit Branch' : 'Add New Branch'}
          </Typography>
          <Button
            onClick={onClose}
            sx={{ minWidth: 'auto', p: 1 }}
            color="inherit"
          >
            <Close />
          </Button>
        </Box>
      </DialogTitle>
      <DialogContent>
        <CustomForm
          fields={branchFields}
          values={formData}
          errors={{}}
          onChange={(e) => {
            setFormData({
              ...formData,
              [e.target.name]: e.target.value,
            });
          }}
          onSubmit={handleSubmit}
          submitText={branch ? 'Update Branch' : 'Add Branch'}
          loading={loading}
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BranchForm; 