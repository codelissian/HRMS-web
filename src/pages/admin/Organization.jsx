import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert,
  Card,
  CardContent,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
} from '@mui/material';
import {
  Add,
  Search,
  Business,
  Email,
  Phone,
  LocationOn,
  Person,
  Close,
} from '@mui/icons-material';
import BranchTable from '../../components/organization/BranchTable';
import BranchForm from '../../components/organization/BranchForm';
import { useBranches } from '../../hooks/useBranches';

const Organization = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBranches, setFilteredBranches] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [editingBranch, setEditingBranch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { branches, addBranch, updateBranch, deleteBranch, loading: branchesLoading } = useBranches();

  useEffect(() => {
    filterBranches();
  }, [branches, searchTerm]);

  const filterBranches = () => {
    let filtered = branches.filter(branch =>
      branch.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.manager?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBranches(filtered);
  };

  const handleAddBranch = () => {
    setEditingBranch(null);
    setOpenDialog(true);
  };

  const handleEditBranch = (branch) => {
    setEditingBranch(branch);
    setOpenDialog(true);
  };

  const handleViewBranch = (branch) => {
    setSelectedBranch(branch);
    setOpenViewDialog(true);
  };

  const handleDeleteBranch = (branchId) => {
    if (window.confirm('Are you sure you want to delete this branch?')) {
      const result = deleteBranch(branchId);
      if (result.success) {
        setAlert({
          type: 'success',
          message: 'Branch deleted successfully'
        });
      } else {
        setAlert({
          type: 'error',
          message: 'Failed to delete branch'
        });
      }
    }
  };

  const handleSaveBranch = (formData) => {
    setLoading(true);
    
    try {
      let result;
      if (editingBranch) {
        result = updateBranch(editingBranch.id, formData);
      } else {
        result = addBranch(formData);
      }
      
      if (result.success) {
        setOpenDialog(false);
        setAlert({
          type: 'success',
          message: `Branch ${editingBranch ? 'updated' : 'added'} successfully`
        });
      } else {
        setAlert({
          type: 'error',
          message: `Failed to ${editingBranch ? 'update' : 'add'} branch`
        });
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'An error occurred while saving branch'
      });
    } finally {
      setLoading(false);
    }
  };

  const BranchViewDialog = ({ branch, open, onClose }) => {
    if (!branch) return null;

    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5">Branch Details</Typography>
            <IconButton onClick={onClose}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Avatar
                    sx={{ width: 100, height: 100, mx: 'auto', mb: 2, bgcolor: 'primary.main' }}
                  >
                    <Business sx={{ fontSize: 50 }} />
                  </Avatar>
                  <Typography variant="h6" gutterBottom>
                    {branch.name}
                  </Typography>
                  <Chip
                    label={branch.code}
                    color="primary"
                    sx={{ mb: 1 }}
                  />
                  <Chip
                    label={branch.status}
                    color={branch.status === 'active' ? 'success' : 'warning'}
                    sx={{ ml: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Branch Information
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <LocationOn color="primary" />
                      </ListItemIcon>
                      <ListItemText primary="Address" secondary={branch.address} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Phone color="primary" />
                      </ListItemIcon>
                      <ListItemText primary="Phone" secondary={branch.phone} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Email color="primary" />
                      </ListItemIcon>
                      <ListItemText primary="Email" secondary={branch.email} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Person color="primary" />
                      </ListItemIcon>
                      <ListItemText primary="Manager" secondary={branch.manager} />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleEditBranch(branch)} variant="contained">
            Edit Branch
          </Button>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, px: 3, pt: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flex: 1, maxWidth: 'calc(100% - 200px)' }}>
          <TextField
            size="small"
            placeholder="Search branches by name, code, address, or manager..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            sx={{ maxWidth: 220 }}
          />
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddBranch}
        >
          Add Branch
        </Button>
      </Box>

      {alert && (
        <Alert severity={alert.type} sx={{ mb: 2, mx: 3 }} onClose={() => setAlert(null)}>
          {alert.message}
        </Alert>
      )}

      <Box sx={{ width: '100%', overflow: 'hidden' }}>
        <BranchTable
          branches={filteredBranches.slice(page * rowsPerPage, (page + 1) * rowsPerPage)}
          onEdit={handleEditBranch}
          onDelete={handleDeleteBranch}
          onView={handleViewBranch}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={setRowsPerPage}
          loading={branchesLoading}
        />
      </Box>

      {/* Add/Edit Branch Dialog */}
      <BranchForm
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        branch={editingBranch}
        onSubmit={handleSaveBranch}
        loading={loading}
      />

      {/* View Branch Dialog */}
      <BranchViewDialog
        branch={selectedBranch}
        open={openViewDialog}
        onClose={() => setOpenViewDialog(false)}
      />
    </Box>
  );
};

export default Organization; 