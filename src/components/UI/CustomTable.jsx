import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Box,
  Typography,
  Chip,
} from '@mui/material';

const CustomTable = ({
  columns,
  data,
  page,
  rowsPerPage,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  loading = false,
  emptyMessage = 'No data available',
}) => {
  const handleChangePage = (event, newPage) => {
    onPageChange(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    onRowsPerPageChange(parseInt(event.target.value, 10));
  };

  const renderCell = (column, row) => {
    const value = row[column.field];

    if (column.render) {
      return column.render(value, row);
    }

    if (column.type === 'chip') {
      const chipColor = typeof column.chipColor === 'function' 
        ? column.chipColor(value) 
        : (column.chipColor || 'default');
      
      return (
        <Chip
          label={value}
          color={chipColor}
          size="small"
          variant="outlined"
        />
      );
    }

    if (column.type === 'date') {
      return new Date(value).toLocaleDateString();
    }

    if (column.type === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(value);
    }

    return value;
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Paper elevation={1} sx={{ width: '100%', margin: 0, padding: 0 }}>
      <TableContainer>
        <Table sx={{ width: '100%', tableLayout: 'auto' }}>
          <TableHead>
            <TableRow>
                                                              {columns.map((column) => (
                 <TableCell
                   key={column.field}
                   align={column.align || 'left'}
                   sx={{
                     fontWeight: 'bold',
                     backgroundColor: 'background.default',
                     padding: '12px 16px',
                     borderBottom: '1px solid rgba(156, 136, 255, 0.1)',
                   }}
                 >
                   {column.headerName}
                 </TableCell>
               ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                                                  <TableCell 
                   colSpan={columns.length} 
                   align="center"
                   sx={{
                     padding: '40px 16px',
                     borderBottom: '1px solid rgba(156, 136, 255, 0.05)',
                   }}
                 >
                  <Typography variant="body2" color="text.secondary">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow key={row.id || index} hover>
                                                        {columns.map((column) => (
                     <TableCell
                       key={column.field}
                       align={column.align || 'left'}
                       sx={{
                         padding: '12px 16px',
                         borderBottom: '1px solid rgba(156, 136, 255, 0.05)',
                       }}
                     >
                       {renderCell(column, row)}
                     </TableCell>
                   ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {totalCount > 0 && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}
    </Paper>
  );
};

export default CustomTable; 