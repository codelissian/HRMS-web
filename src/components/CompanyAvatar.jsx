import React from 'react';
import {
  Avatar,
  Box,
  Typography,
  Chip,
} from '@mui/material';
import { Business } from '@mui/icons-material';
import { useBranch } from '../context/BranchContext';

const CompanyAvatar = () => {
  const { selectedBranch } = useBranch();

  const getBranchInitials = (name) => {
    if (!name) return 'CO';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 3,
        px: 2,
        borderBottom: 1,
        borderColor: 'divider',
        backgroundColor: 'background.paper',
      }}
    >
      <Avatar
        sx={{
          width: 64,
          height: 64,
          fontSize: '1.5rem',
          fontWeight: 'bold',
          bgcolor: 'primary.main',
          mb: 2,
        }}
      >
        <Business sx={{ fontSize: 32 }} />
      </Avatar>
      
      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          color: 'text.primary',
          textAlign: 'center',
          mb: 1,
        }}
      >
        {selectedBranch?.name || 'Company Name'}
      </Typography>
      
      <Chip
        label={selectedBranch?.code || 'BRANCH'}
        size="small"
        color="primary"
        variant="outlined"
        sx={{
          fontSize: '0.75rem',
          height: 24,
        }}
      />
      
      {selectedBranch && (
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            textAlign: 'center',
            mt: 1,
            display: 'block',
          }}
        >
          {selectedBranch.address?.split(',')[0] || 'Branch Location'}
        </Typography>
      )}
    </Box>
  );
};

export default CompanyAvatar; 