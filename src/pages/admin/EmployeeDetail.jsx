import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import EmployeeDetailHeader from '../../components/employees/EmployeeDetailHeader';
import AttendanceSection from '../../components/employees/AttendanceSection';
import LeaveSection from '../../components/employees/LeaveSection';
import SalarySection from '../../components/employees/SalarySection';
import DocumentList from '../../components/employees/DocumentList';

const EmployeeDetail = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    loadEmployeeData();
  }, [employeeId]);

  const loadEmployeeData = () => {
    setLoading(true);
    try {
      const employees = JSON.parse(localStorage.getItem('hrms_employees') || '[]');
      const foundEmployee = employees.find(emp => emp.id === employeeId);
      
      if (foundEmployee) {
        setEmployee(foundEmployee);
        setError(null);
      } else {
        setError('Employee not found');
      }
    } catch (error) {
      setError('Error loading employee data');
      console.error('Error loading employee:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleBackToList = () => {
    navigate('/admin/employees');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Employee not found or data unavailable
          </Typography>
        </Box>
      </Container>
    );
  }

  if (!employee) {
    return null;
  }

  const tabLabels = ['Profile', 'Attendance', 'Leaves', 'Salary', 'Documents'];

  return (
    <Container maxWidth="xl" sx={{ mt: 3, mb: 3 }}>
      {/* Header with back button */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Box
          component="button"
          onClick={handleBackToList}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 1,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: 'primary.main',
            '&:hover': {
              backgroundColor: 'action.hover',
              borderRadius: 1,
            },
            mr: 2,
          }}
        >
          <ArrowBack />
          <Typography variant="body2">Back to Employee List</Typography>
        </Box>
      </Box>

      {/* Employee Header */}
      <EmployeeDetailHeader employee={employee} />

      {/* Tabs */}
      <Paper sx={{ mt: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              minHeight: 64,
              textTransform: 'none',
              fontSize: '0.95rem',
              fontWeight: 500,
            },
          }}
        >
          {tabLabels.map((label, index) => (
            <Tab key={index} label={label} />
          ))}
        </Tabs>

        {/* Tab Content */}
        <Box sx={{ p: 3 }}>
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Profile Information
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Personal Information
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Full Name</Typography>
                      <Typography variant="body1">{employee.name}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Email</Typography>
                      <Typography variant="body1">{employee.email}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Phone</Typography>
                      <Typography variant="body1">{employee.phone}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Date of Birth</Typography>
                      <Typography variant="body1">{employee.dateOfBirth || 'Not specified'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Gender</Typography>
                      <Typography variant="body1">{employee.gender || 'Not specified'}</Typography>
                    </Box>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Employment Information
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Department</Typography>
                      <Typography variant="body1">{employee.department}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Position</Typography>
                      <Typography variant="body1">{employee.position}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Join Date</Typography>
                      <Typography variant="body1">{employee.hireDate}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Status</Typography>
                      <Typography variant="body1" sx={{ 
                        color: employee.status === 'active' ? 'success.main' : 'warning.main',
                        fontWeight: 500,
                      }}>
                        {employee.status}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Education</Typography>
                      <Typography variant="body1">{employee.education || 'Not specified'}</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
              {employee.address && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Address
                  </Typography>
                  <Typography variant="body1">{employee.address}</Typography>
                </Box>
              )}
              {employee.emergencyContact && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Emergency Contact
                  </Typography>
                  <Typography variant="body1">{employee.emergencyContact}</Typography>
                </Box>
              )}
            </Box>
          )}
          
          {activeTab === 1 && (
            <AttendanceSection employeeId={employeeId} />
          )}
          
          {activeTab === 2 && (
            <LeaveSection employeeId={employeeId} />
          )}
          
          {activeTab === 3 && (
            <SalarySection employee={employee} />
          )}
          
          {activeTab === 4 && (
            <DocumentList employeeId={employeeId} />
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default EmployeeDetail; 