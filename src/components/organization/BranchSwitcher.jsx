import React, { useState } from 'react';
import {
  Box,
  FormControl,
  Select,
  MenuItem,
  Typography,
  Chip,
  Tooltip,
} from '@mui/material';
import { Business, KeyboardArrowDown } from '@mui/icons-material';
import { useBranch } from '../../context/BranchContext';
import { useBranches } from '../../hooks/useBranches';

const BranchSwitcher = () => {
  const { selectedBranch, setSelectedBranch } = useBranch();
  const { getActiveBranches } = useBranches();
  const [open, setOpen] = useState(false);

  const activeBranches = getActiveBranches();

  const handleBranchChange = (event) => {
    const branchId = event.target.value;
    const branch = activeBranches.find(b => b.id === branchId);
    if (branch) {
      setSelectedBranch(branch);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  if (activeBranches.length === 0) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
      <Business sx={{ mr: 1, color: 'primary.contrastText' }} />
      <FormControl size="small" sx={{ minWidth: 200 }}>
        <Select
          value={selectedBranch?.id || ''}
          onChange={handleBranchChange}
          onClose={handleClose}
          onOpen={handleOpen}
          open={open}
          displayEmpty
          sx={{
            color: 'primary.contrastText',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 255, 255, 0.3)',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 255, 255, 0.5)',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 255, 255, 0.8)',
            },
            '& .MuiSelect-icon': {
              color: 'primary.contrastText',
            },
          }}
          IconComponent={KeyboardArrowDown}
          renderValue={(value) => {
            if (!value) {
              return (
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Select Branch
                </Typography>
              );
            }
            const branch = activeBranches.find(b => b.id === value);
            return (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: 'primary.contrastText', mr: 1 }}>
                  {branch?.name}
                </Typography>
                <Chip
                  label={branch?.code}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.7rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'primary.contrastText',
                  }}
                />
              </Box>
            );
          }}
        >
          {activeBranches.map((branch) => (
            <MenuItem key={branch.id} value={branch.id}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <Box>
                  <Typography variant="body2">{branch.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {branch.address}
                  </Typography>
                </Box>
                <Chip
                  label={branch.code}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.7rem',
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                  }}
                />
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default BranchSwitcher; 