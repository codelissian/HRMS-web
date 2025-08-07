import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
} from '@mui/material';
import {
  AttachMoney,
  TrendingUp,
  AccountBalance,
  Receipt,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Salary = () => {
  const { user } = useAuth();
  const [payrolls, setPayrolls] = useState([]);
  const [currentSalary, setCurrentSalary] = useState(null);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    loadSalaryData();
  }, [user]);

  const loadSalaryData = () => {
    if (!user) return;
    
    const allPayrolls = JSON.parse(localStorage.getItem('hrms_payroll') || '[]');
    const employeePayrolls = allPayrolls.filter(payroll => payroll.employeeId === user.id);
    setPayrolls(employeePayrolls);

    // Get current salary from employee data
    const employees = JSON.parse(localStorage.getItem('hrms_employees') || '[]');
    const employee = employees.find(emp => emp.id === user.id);
    if (employee) {
      setCurrentSalary(employee.salary || 0);
    }
  };

  const getSalaryStats = () => {
    const totalEarnings = payrolls.reduce((sum, payroll) => sum + (payroll.amount || 0), 0);
    const averageSalary = payrolls.length > 0 ? totalEarnings / payrolls.length : 0;
    const totalPayrolls = payrolls.length;

    return { totalEarnings, averageSalary, totalPayrolls };
  };

  const stats = getSalaryStats();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  return (
    <Box sx={{ p: 3 }}>

      {alert && (
        <Alert severity={alert.type} sx={{ mb: 2 }} onClose={() => setAlert(null)}>
          {alert.message}
        </Alert>
      )}

      {/* Salary Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AttachMoney color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" component="div">
                {formatCurrency(currentSalary)}
              </Typography>
              <Typography color="textSecondary">
                Current Salary
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUp color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" component="div">
                {formatCurrency(stats.totalEarnings)}
              </Typography>
              <Typography color="textSecondary">
                Total Earnings
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AccountBalance color="info" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" component="div">
                {formatCurrency(stats.averageSalary)}
              </Typography>
              <Typography color="textSecondary">
                Average Salary
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Receipt color="warning" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" component="div">
                {stats.totalPayrolls}
              </Typography>
              <Typography color="textSecondary">
                Total Payslips
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Salary Breakdown */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Salary Structure
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Basic Salary
                    </Typography>
                    <Typography variant="h6">
                      {formatCurrency(currentSalary * 0.7)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      House Rent Allowance
                    </Typography>
                    <Typography variant="h6">
                      {formatCurrency(currentSalary * 0.2)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Transport Allowance
                    </Typography>
                    <Typography variant="h6">
                      {formatCurrency(currentSalary * 0.05)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Medical Allowance
                    </Typography>
                    <Typography variant="h6">
                      {formatCurrency(currentSalary * 0.05)}
                    </Typography>
                  </Grid>
                </Grid>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">
                    Total Gross Salary
                  </Typography>
                  <Typography variant="h5" color="primary">
                    {formatCurrency(currentSalary)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Payslips */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Payslips
              </Typography>
              {payrolls.length === 0 ? (
                <Box sx={{ textAlign: 'center', mt: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No payslips available
                  </Typography>
                </Box>
              ) : (
                <Box>
                  {payrolls.slice(0, 5).map((payroll) => (
                    <Box key={payroll.id} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1">
                          {payroll.month} {payroll.year}
                        </Typography>
                        <Chip
                          label={payroll.status}
                          color={payroll.status === 'processed' ? 'success' : 'warning'}
                          size="small"
                        />
                      </Box>
                      <Typography variant="h6" color="primary">
                        {formatCurrency(payroll.amount)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Processed on {new Date(payroll.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Payroll History */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Payroll History
          </Typography>
          {payrolls.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                No payroll records found
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Month/Year</TableCell>
                    <TableCell>Basic Salary</TableCell>
                    <TableCell>Allowances</TableCell>
                    <TableCell>Deductions</TableCell>
                    <TableCell>Net Amount</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payrolls.map((payroll) => (
                    <TableRow key={payroll.id}>
                      <TableCell>
                        {payroll.month} {payroll.year}
                      </TableCell>
                      <TableCell>{formatCurrency(payroll.basicSalary)}</TableCell>
                      <TableCell>{formatCurrency(payroll.allowances)}</TableCell>
                      <TableCell>{formatCurrency(payroll.deductions)}</TableCell>
                      <TableCell>
                        <Typography variant="subtitle1" color="primary" fontWeight="bold">
                          {formatCurrency(payroll.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={payroll.status}
                          color={payroll.status === 'processed' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Salary; 