import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  AttachMoney,
  TrendingUp,
  AccountBalance,
  Receipt,
} from '@mui/icons-material';

const SalarySection = ({ employee }) => {
  const [payslipOpen, setPayslipOpen] = useState(false);

  // Calculate salary breakdown
  const basicSalary = employee.salary * 0.5; // 50% of CTC
  const hra = basicSalary * 0.4; // 40% of Basic
  const da = basicSalary * 0.1; // 10% of Basic
  const allowances = employee.salary * 0.2; // 20% of CTC
  const deductions = employee.salary * 0.1; // 10% of CTC
  const netSalary = employee.salary - deductions;

  const salaryBreakdown = [
    { component: 'Basic Salary', amount: basicSalary, type: 'earning' },
    { component: 'House Rent Allowance (HRA)', amount: hra, type: 'earning' },
    { component: 'Dearness Allowance (DA)', amount: da, type: 'earning' },
    { component: 'Other Allowances', amount: allowances, type: 'earning' },
    { component: 'Sub Total', amount: basicSalary + hra + da + allowances, type: 'earning' },
    { component: 'Provident Fund (PF)', amount: deductions * 0.6, type: 'deduction' },
    { component: 'Professional Tax', amount: deductions * 0.2, type: 'deduction' },
    { component: 'Income Tax', amount: deductions * 0.2, type: 'deduction' },
    { component: 'Total Deductions', amount: deductions, type: 'deduction' },
  ];

  const handlePayslipPreview = () => {
    setPayslipOpen(true);
  };

  const handleClosePayslip = () => {
    setPayslipOpen(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AttachMoney sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" gutterBottom>
                {formatCurrency(employee.salary)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cost to Company (CTC)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AccountBalance sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" gutterBottom>
                {formatCurrency(basicSalary)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Basic Salary
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUp sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" gutterBottom>
                {formatCurrency(allowances)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Allowances
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Receipt sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" gutterBottom>
                {formatCurrency(netSalary)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Net Salary
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Salary Breakdown */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Monthly Salary Breakdown
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Receipt />}
            onClick={handlePayslipPreview}
          >
            View Payslip
          </Button>
        </Box>
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Component</TableCell>
                  <TableCell align="right">Amount (₹)</TableCell>
                  <TableCell>Type</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {salaryBreakdown.map((item, index) => (
                  <TableRow 
                    key={index} 
                    hover
                    sx={{
                      backgroundColor: item.component.includes('Sub Total') || item.component.includes('Total') 
                        ? 'action.hover' 
                        : 'inherit',
                      fontWeight: item.component.includes('Sub Total') || item.component.includes('Total') 
                        ? 'bold' 
                        : 'normal',
                    }}
                  >
                    <TableCell 
                      sx={{ 
                        fontWeight: item.component.includes('Sub Total') || item.component.includes('Total') 
                          ? 'bold' 
                          : 'normal' 
                      }}
                    >
                      {item.component}
                    </TableCell>
                    <TableCell 
                      align="right"
                      sx={{ 
                        fontWeight: item.component.includes('Sub Total') || item.component.includes('Total') 
                          ? 'bold' 
                          : 'normal',
                        color: item.type === 'deduction' ? 'error.main' : 'inherit',
                      }}
                    >
                      {item.type === 'deduction' ? '-' : ''}{formatCurrency(item.amount)}
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="caption"
                        sx={{
                          color: item.type === 'earning' ? 'success.main' : 'error.main',
                          fontWeight: 500,
                          textTransform: 'uppercase',
                        }}
                      >
                        {item.type}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow sx={{ backgroundColor: 'primary.light', fontWeight: 'bold' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    Net Payable
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(netSalary)}
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'success.main',
                        fontWeight: 500,
                        textTransform: 'uppercase',
                      }}
                    >
                      Net
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      {/* Payslip Preview Dialog */}
      <Dialog
        open={payslipOpen}
        onClose={handleClosePayslip}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">
            Payslip Preview - {employee.name}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2 }}>
            {/* Payslip Header */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h5" gutterBottom>
                COMPANY NAME
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Payslip for the month of {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Employee Details */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">Employee Name</Typography>
                <Typography variant="body1">{employee.name}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">Employee ID</Typography>
                <Typography variant="body1">{employee.id}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">Designation</Typography>
                <Typography variant="body1">{employee.position}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">Department</Typography>
                <Typography variant="body1">{employee.department}</Typography>
              </Grid>
            </Grid>

            <Divider sx={{ mb: 3 }} />

            {/* Salary Details */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Earnings</Typography>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>Basic Salary</TableCell>
                      <TableCell align="right">{formatCurrency(basicSalary)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>HRA</TableCell>
                      <TableCell align="right">{formatCurrency(hra)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>DA</TableCell>
                      <TableCell align="right">{formatCurrency(da)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Allowances</TableCell>
                      <TableCell align="right">{formatCurrency(allowances)}</TableCell>
                    </TableRow>
                    <TableRow sx={{ fontWeight: 'bold' }}>
                      <TableCell>Total Earnings</TableCell>
                      <TableCell align="right">{formatCurrency(basicSalary + hra + da + allowances)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Deductions</Typography>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>PF</TableCell>
                      <TableCell align="right">-{formatCurrency(deductions * 0.6)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Professional Tax</TableCell>
                      <TableCell align="right">-{formatCurrency(deductions * 0.2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Income Tax</TableCell>
                      <TableCell align="right">-{formatCurrency(deductions * 0.2)}</TableCell>
                    </TableRow>
                    <TableRow sx={{ fontWeight: 'bold' }}>
                      <TableCell>Total Deductions</TableCell>
                      <TableCell align="right">-{formatCurrency(deductions)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Net Pay */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Net Pay: {formatCurrency(netSalary)}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePayslip}>Close</Button>
          <Button variant="contained" onClick={handleClosePayslip}>
            Download PDF
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SalarySection; 