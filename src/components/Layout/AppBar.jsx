import React from 'react';
import {
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Notifications,
  AccountCircle,
  KeyboardArrowDown,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AppBar = ({ drawerWidth = 240, onDrawerToggle }) => {
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = React.useState(null);

  // Function to get the current module title based on the route
  const getModuleTitle = () => {
    const path = location.pathname;
    
    // Admin routes
    if (path.includes('/admin/dashboard')) return 'Dashboard';
    if (path.includes('/admin/organization')) return 'Organization';
    if (path.includes('/admin/employees')) return 'Employees';
    if (path.includes('/admin/leaves')) return 'Leaves';
    if (path.includes('/admin/payroll')) return 'Payroll';
    
    // Employee routes
    if (path.includes('/employee/dashboard')) return 'Dashboard';
    if (path.includes('/employee/leave')) return 'Leave';
    if (path.includes('/employee/salary')) return 'Salary';
    
    // Default fallback
    return 'Dashboard';
  };

  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleUserMenuClose();
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <MuiAppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        zIndex: (theme) => theme.zIndex.drawer + 1,
        borderRadius: 0, // Remove rounded corners for sharp edges
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Left side - Menu toggle and Module title */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={onDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography
            variant="h5"
            component="div"
            sx={{
              fontSize: '1.25rem',
              fontWeight: 500,
              letterSpacing: '0.5px',
              color: 'common.white',
            }}
          >
            {getModuleTitle()}
          </Typography>
        </Box>

        {/* Right side - User menu and notifications */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Notifications */}
          <IconButton
            color="inherit"
            onClick={handleNotificationMenuOpen}
            sx={{ mr: 1 }}
          >
            <Badge badgeContent={3} color="error">
              <Notifications />
            </Badge>
          </IconButton>

          {/* User Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                fontSize: '0.875rem',
                bgcolor: 'secondary.main',
              }}
            >
              {getInitials(user?.name || 'User')}
            </Avatar>
            <Typography
              variant="body2"
              sx={{
                color: 'primary.contrastText',
                fontWeight: 500,
                display: { xs: 'none', sm: 'block' },
              }}
            >
              {user?.name || 'User'}
            </Typography>
            <IconButton
              color="inherit"
              onClick={handleUserMenuOpen}
              sx={{ p: 0.5 }}
            >
              <KeyboardArrowDown />
            </IconButton>
          </Box>
        </Box>

        {/* Notifications Menu */}
        <Menu
          anchorEl={notificationAnchorEl}
          open={Boolean(notificationAnchorEl)}
          onClose={handleNotificationMenuClose}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 300,
            },
          }}
        >
          <MenuItem onClick={handleNotificationMenuClose}>
            <Typography variant="body2">New employee registered</Typography>
          </MenuItem>
          <MenuItem onClick={handleNotificationMenuClose}>
            <Typography variant="body2">Leave request pending approval</Typography>
          </MenuItem>
          <MenuItem onClick={handleNotificationMenuClose}>
            <Typography variant="body2">Payroll processed successfully</Typography>
          </MenuItem>
        </Menu>

        {/* User Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleUserMenuClose}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 200,
            },
          }}
        >
          <MenuItem onClick={handleUserMenuClose}>
            <AccountCircle sx={{ mr: 1 }} />
            Profile
          </MenuItem>
          <MenuItem onClick={handleUserMenuClose}>
            Settings
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </MuiAppBar>
  );
};

export default AppBar; 