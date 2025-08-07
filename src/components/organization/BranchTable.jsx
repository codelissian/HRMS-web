import React from 'react';
import {
  Box,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Edit,
  Delete,
  Visibility,
} from '@mui/icons-material';
import CustomTable from '../UI/CustomTable';

const BranchTable = ({
  branches,
  onEdit,
  onDelete,
  onView,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  loading = false,
}) => {
  const columns = [
    { field: 'name', headerName: 'Branch Name' },
    { field: 'code', headerName: 'Code' },
    { field: 'address', headerName: 'Address' },
    { field: 'phone', headerName: 'Phone' },
    { field: 'email', headerName: 'Email' },
    { field: 'manager', headerName: 'Manager' },
    {
      field: 'status',
      headerName: 'Status',
      type: 'chip',
      chipColor: (value) => {
        switch (value) {
          case 'active': return 'success';
          case 'inactive': return 'warning';
          default: return 'default';
        }
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      render: (value, row) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => onView(row)}
            color="info"
            title="View Details"
          >
            <Visibility />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => onEdit(row)}
            color="primary"
            title="Edit"
          >
            <Edit />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => onDelete(row.id)}
            color="error"
            title="Delete"
          >
            <Delete />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <CustomTable
      columns={columns}
      data={branches}
      page={page}
      rowsPerPage={rowsPerPage}
      totalCount={branches.length}
      onPageChange={onPageChange}
      onRowsPerPageChange={onRowsPerPageChange}
      loading={loading}
      emptyMessage="No branches found"
    />
  );
};

export default BranchTable; 