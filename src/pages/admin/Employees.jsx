import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Chip,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  FilterList,
  Visibility,
} from '@mui/icons-material';
import CustomTable from '../../components/UI/CustomTable';
import CustomForm from '../../components/UI/CustomForm';
import { useBranch } from '../../context/BranchContext';

const Employees = () => {
  const navigate = useNavigate();
  const { selectedBranch } = useBranch();
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadEmployees();
    initializeDummyData();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [employees, searchTerm, statusFilter, selectedBranch]);

  const initializeDummyData = () => {
    // Initialize with dummy data if no employees exist
    const existingEmployees = JSON.parse(localStorage.getItem('hrms_employees') || '[]');
    if (existingEmployees.length === 0) {
      const dummyEmployees = [
                 {
           id: '1',
           name: 'John Doe',
           email: 'john.doe@company.com',
           phone: '+1 (555) 123-4567',
           department: 'Engineering',
           position: 'Senior Developer',
           salary: 85000,
           hireDate: '2023-01-15',
           status: 'active',
           branchId: '1', // Head Office
           address: '123 Main St, City, State 12345',
           education: 'Bachelor of Computer Science',
           dateOfBirth: '1990-05-15',
           gender: 'Male',
           emergencyContact: 'Jane Doe (Spouse) - +1 (555) 987-6543',
           createdAt: '2023-01-15T00:00:00.000Z',
         },
                 {
           id: '2',
           name: 'Jane Smith',
           email: 'jane.smith@company.com',
           phone: '+1 (555) 234-5678',
           department: 'Marketing',
           position: 'Marketing Manager',
           salary: 75000,
           hireDate: '2023-03-20',
           status: 'active',
           branchId: '2', // North Branch
           address: '456 Oak Ave, City, State 12345',
           education: 'MBA in Marketing',
           dateOfBirth: '1988-08-22',
           gender: 'Female',
           emergencyContact: 'Mike Smith (Spouse) - +1 (555) 876-5432',
           createdAt: '2023-03-20T00:00:00.000Z',
         },
                 {
           id: '3',
           name: 'Mike Johnson',
           email: 'mike.johnson@company.com',
           phone: '+1 (555) 345-6789',
           department: 'HR',
           position: 'HR Specialist',
           salary: 65000,
           hireDate: '2023-06-10',
           status: 'active',
           branchId: '3', // South Branch
           address: '789 Pine Rd, City, State 12345',
           education: 'Bachelor of Business Administration',
           dateOfBirth: '1992-12-03',
           gender: 'Male',
           emergencyContact: 'Sarah Johnson (Spouse) - +1 (555) 765-4321',
           createdAt: '2023-06-10T00:00:00.000Z',
         },
      ];
      localStorage.setItem('hrms_employees', JSON.stringify(dummyEmployees));
      setEmployees(dummyEmployees);
    }
  };

  const loadEmployees = () => {
    const storedEmployees = JSON.parse(localStorage.getItem('hrms_employees') || '[]');
    setEmployees(storedEmployees);
  };

  const filterEmployees = () => {
    let filtered = employees.filter(employee =>
      employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filter by selected branch
    if (selectedBranch) {
      filtered = filtered.filter(employee => employee.branchId === selectedBranch.id);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(employee => employee.status === statusFilter);
    }

    setFilteredEmployees(filtered);
  };

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setOpenDialog(true);
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setOpenDialog(true);
  };

  const handleViewProfile = (employee) => {
    navigate(`/admin/employees/${employee.id}`);
  };

  const handleDeleteEmployee = (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      const updatedEmployees = employees.filter(emp => emp.id !== employeeId);
      localStorage.setItem('hrms_employees', JSON.stringify(updatedEmployees));
      setEmployees(updatedEmployees);
      setAlert({
        type: 'success',
        message: 'Employee deleted successfully'
      });
    }
  };

  const handleSaveEmployee = (formData) => {
    setLoading(true);
    
    try {
      let updatedEmployees;
      
      if (editingEmployee) {
        // Update existing employee
        updatedEmployees = employees.map(emp =>
          emp.id === editingEmployee.id ? { ...emp, ...formData } : emp
        );
      } else {
        // Add new employee
        const newEmployee = {
          ...formData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          status: 'active',
          address: formData.address || 'Not specified',
          education: formData.education || 'Not specified',
          dateOfBirth: formData.dateOfBirth || 'Not specified',
          gender: formData.gender || 'Not specified',
          emergencyContact: formData.emergencyContact || 'Not specified',
        };
        updatedEmployees = [...employees, newEmployee];
      }
      
      localStorage.setItem('hrms_employees', JSON.stringify(updatedEmployees));
      setEmployees(updatedEmployees);
      setOpenDialog(false);
      setAlert({
        type: 'success',
        message: `Employee ${editingEmployee ? 'updated' : 'added'} successfully`
      });
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'An error occurred while saving employee'
      });
    } finally {
      setLoading(false);
    }
  };



  const employeeFields = [
    { name: 'name', type: 'text', label: 'Full Name', required: true },
    { name: 'email', type: 'email', label: 'Email Address', required: true },
    { name: 'phone', type: 'text', label: 'Phone Number', required: true },
    { name: 'department', type: 'text', label: 'Department', required: true },
    { name: 'position', type: 'text', label: 'Position', required: true },
    { name: 'salary', type: 'number', label: 'Salary', required: true },
    { name: 'hireDate', type: 'date', label: 'Hire Date', required: true },
    { name: 'address', type: 'text', label: 'Address', required: false },
    { name: 'education', type: 'text', label: 'Education', required: false },
    { name: 'dateOfBirth', type: 'date', label: 'Date of Birth', required: false },
    { name: 'gender', type: 'select', label: 'Gender', required: false, options: [
      { value: 'Male', label: 'Male' },
      { value: 'Female', label: 'Female' },
      { value: 'Other', label: 'Other' },
    ]},
    { name: 'emergencyContact', type: 'text', label: 'Emergency Contact', required: false },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      required: true,
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'terminated', label: 'Terminated' },
      ],
    },
  ];

  const columns = [
    { field: 'name', headerName: 'Name' },
    { field: 'email', headerName: 'Email' },
    { field: 'department', headerName: 'Department' },
    { field: 'position', headerName: 'Position' },
    { field: 'salary', headerName: 'Salary', type: 'currency' },
    { field: 'hireDate', headerName: 'Hire Date', type: 'date' },
    {
      field: 'status',
      headerName: 'Status',
      type: 'chip',
      chipColor: (value) => {
        switch (value) {
          case 'active': return 'success';
          case 'inactive': return 'warning';
          case 'terminated': return 'error';
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
            onClick={() => handleViewProfile(row)}
            color="info"
            title="View Details"
          >
            <Visibility />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleEditEmployee(row)}
            color="primary"
            title="Edit"
          >
            <Edit />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDeleteEmployee(row.id)}
            color="error"
            title="Delete"
          >
            <Delete />
          </IconButton>
        </Box>
      ),
    },
  ];

  const ProfileDialog = ({ employee, open, onClose }) => {
    if (!employee) return null;

    const attendanceData = generateAttendanceData(employee.id);
    const presentDays = attendanceData.filter(a => a.status === 'present').length;
    const totalDays = attendanceData.length;
    const attendanceRate = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0;

    return (
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5">Employee Profile</Typography>
            <IconButton onClick={onClose}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={profileTab} onChange={(e, newValue) => setProfileTab(newValue)}>
              <Tab label="Basic Info" />
              <Tab label="Attendance" />
            </Tabs>
          </Box>

          {profileTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Avatar
                      sx={{ width: 100, height: 100, mx: 'auto', mb: 2, bgcolor: 'primary.main' }}
                    >
                      <Person sx={{ fontSize: 50 }} />
                    </Avatar>
                    <Typography variant="h6" gutterBottom>
                      {employee.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {employee.position}
                    </Typography>
                    <Chip
                      label={employee.status}
                      color={employee.status === 'active' ? 'success' : 'warning'}
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Personal Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <List dense>
                          <ListItem>
                            <ListItemIcon>
                              <Email color="primary" />
                            </ListItemIcon>
                            <ListItemText primary="Email" secondary={employee.email} />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <Phone color="primary" />
                            </ListItemIcon>
                            <ListItemText primary="Phone" secondary={employee.phone} />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <Work color="primary" />
                            </ListItemIcon>
                            <ListItemText primary="Department" secondary={employee.department} />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <AttachMoney color="primary" />
                            </ListItemIcon>
                            <ListItemText primary="Salary" secondary={`$${employee.salary?.toLocaleString()}`} />
                          </ListItem>
                        </List>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <List dense>
                          <ListItem>
                            <ListItemIcon>
                              <CalendarToday color="primary" />
                            </ListItemIcon>
                            <ListItemText primary="Hire Date" secondary={new Date(employee.hireDate).toLocaleDateString()} />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <LocationOn color="primary" />
                            </ListItemIcon>
                            <ListItemText primary="Address" secondary={employee.address || 'Not specified'} />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <School color="primary" />
                            </ListItemIcon>
                            <ListItemText primary="Education" secondary={employee.education || 'Not specified'} />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <Cake color="primary" />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Date of Birth" 
                              secondary={employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : 'Not specified'} 
                            />
                          </ListItem>
                        </List>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {profileTab === 1 && (
            <Box>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary" gutterBottom>
                        {presentDays}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Days Present
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="warning.main" gutterBottom>
                        {totalDays - presentDays}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Days Absent
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main" gutterBottom>
                        {attendanceRate}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Attendance Rate
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Attendance History (Last 30 Days)
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Check In</TableCell>
                          <TableCell>Check Out</TableCell>
                          <TableCell>Hours</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {attendanceData.map((record, index) => (
                          <TableRow key={index}>
                            <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                            <TableCell>{record.checkIn}</TableCell>
                            <TableCell>{record.checkOut}</TableCell>
                            <TableCell>{record.hours}</TableCell>
                            <TableCell>
                              <Chip
                                icon={record.status === 'present' ? <CheckCircle /> : <Cancel />}
                                label={record.status === 'present' ? 'Present' : 'Absent'}
                                color={record.status === 'present' ? 'success' : 'error'}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleEditEmployee(employee)} variant="contained">
            Edit Employee
          </Button>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, px: 3, pt: 3 }}>
        <Box>
          {selectedBranch && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Branch: {selectedBranch.name} ({selectedBranch.code})
            </Typography>
          )}
        </Box>
      </Box>

      {alert && (
        <Alert severity={alert.type} sx={{ mb: 2, mx: 3 }} onClose={() => setAlert(null)}>
          {alert.message}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, px: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flex: 1, maxWidth: 'calc(100% - 200px)' }}>
          <TextField
            size="small"
            placeholder="Search employees by name, email, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            sx={{ maxWidth: 220 }}
          />
          <FormControl size="small" sx={{ maxWidth: 220 }}>
            <InputLabel>Status Filter</InputLabel>
            <Select
              value={statusFilter}
              label="Status Filter"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="terminated">Terminated</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddEmployee}
        >
          Add Employee
        </Button>
      </Box>

      <Box sx={{ width: '100%', overflow: 'hidden' }}>
        <CustomTable
          columns={columns}
          data={filteredEmployees.slice(page * rowsPerPage, (page + 1) * rowsPerPage)}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={filteredEmployees.length}
          onPageChange={setPage}
          onRowsPerPageChange={setRowsPerPage}
          emptyMessage="No employees found"
        />
      </Box>

      {/* Add/Edit Employee Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
        </DialogTitle>
        <DialogContent>
          <CustomForm
            fields={employeeFields}
            values={editingEmployee || {}}
            errors={{}}
            onChange={(e) => {
              if (editingEmployee) {
                setEditingEmployee({
                  ...editingEmployee,
                  [e.target.name]: e.target.value,
                });
              }
            }}
            onSubmit={handleSaveEmployee}
            submitText={editingEmployee ? 'Update Employee' : 'Add Employee'}
            loading={loading}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>


    </Box>
  );
};

export default Employees; 