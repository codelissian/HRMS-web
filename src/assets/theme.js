import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5', // Indigo Blue
      light: '#757de8',
      dark: '#002984',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#303f9f', // Darker Indigo
      light: '#666ad1',
      dark: '#001970',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f1f2f6', // Light Gray
      paper: '#ffffff',
    },
    text: {
      primary: '#1c1c1c', // Dark text for light mode
      secondary: '#666666',
    },
    divider: 'rgba(63, 81, 181, 0.12)',
    action: {
      hover: 'rgba(63, 81, 181, 0.08)',
      selected: 'rgba(63, 81, 181, 0.16)',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
      color: '#1c1c1c',
    },
    h2: {
      fontWeight: 600,
      color: '#1c1c1c',
    },
    h3: {
      fontWeight: 600,
      color: '#1c1c1c',
    },
    h4: {
      fontWeight: 600,
      color: '#1c1c1c',
    },
    h5: {
      fontWeight: 600,
      color: '#1c1c1c',
    },
    h6: {
      fontWeight: 600,
      color: '#1c1c1c',
    },
    body1: {
      color: '#1c1c1c',
    },
    body2: {
      color: '#666666',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
          '&:hover': {
            boxShadow: '0 2px 8px rgba(63, 81, 181, 0.3)',
          },
        },
        contained: {
          '&:hover': {
            backgroundColor: '#002984',
          },
        },
        outlined: {
          borderColor: '#3f51b5',
          color: '#3f51b5',
          '&:hover': {
            backgroundColor: 'rgba(63, 81, 181, 0.08)',
            borderColor: '#002984',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(63, 81, 181, 0.1)',
          border: '1px solid rgba(63, 81, 181, 0.08)',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(63, 81, 181, 0.15)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 8,
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(63, 81, 181, 0.1)',
        },
        elevation2: {
          boxShadow: '0 4px 16px rgba(63, 81, 181, 0.12)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#3f51b5',
          color: '#ffffff',
          boxShadow: '0 2px 8px rgba(63, 81, 181, 0.2)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          borderRight: '1px solid rgba(63, 81, 181, 0.12)',
          boxShadow: '2px 0 8px rgba(63, 81, 181, 0.1)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '4px 8px',
          '&:hover': {
            backgroundColor: 'rgba(63, 81, 181, 0.08)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(63, 81, 181, 0.16)',
            color: '#3f51b5',
            '&:hover': {
              backgroundColor: 'rgba(63, 81, 181, 0.24)',
            },
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: 'inherit',
          minWidth: 40,
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        root: {
          '& .MuiTypography-root': {
            fontSize: '0.875rem',
            fontWeight: 500,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 500,
        },
        colorPrimary: {
          backgroundColor: '#3f51b5',
          color: '#ffffff',
        },
        colorSecondary: {
          backgroundColor: '#303f9f',
          color: '#ffffff',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-root': {
            backgroundColor: 'rgba(63, 81, 181, 0.04)',
            borderBottom: '1px solid rgba(63, 81, 181, 0.12)',
            fontWeight: 600,
            color: '#1c1c1c',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(63, 81, 181, 0.04)',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(63, 81, 181, 0.08)',
          padding: '12px 16px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            height: '40px',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#3f51b5',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#3f51b5',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#666666',
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#3f51b5',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            height: '40px',
          },
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          '& .MuiInputLabel-root': {
            fontSize: '0.875rem',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          '& .MuiTab-root': {
            color: '#666666',
            fontWeight: 500,
            '&.Mui-selected': {
              color: '#3f51b5',
            },
          },
          '& .MuiTabs-indicator': {
            backgroundColor: '#3f51b5',
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          '&:hover': {
            color: '#3f51b5',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(63, 81, 181, 0.2)',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(63, 81, 181, 0.12)',
          backgroundColor: 'rgba(63, 81, 181, 0.02)',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        standardSuccess: {
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          color: '#2e7d32',
          border: '1px solid rgba(76, 175, 80, 0.2)',
        },
        standardError: {
          backgroundColor: 'rgba(244, 67, 54, 0.1)',
          color: '#d32f2f',
          border: '1px solid rgba(244, 67, 54, 0.2)',
        },
        standardWarning: {
          backgroundColor: 'rgba(255, 152, 0, 0.1)',
          color: '#f57c00',
          border: '1px solid rgba(255, 152, 0, 0.2)',
        },
        standardInfo: {
          backgroundColor: 'rgba(63, 81, 181, 0.1)',
          color: '#3f51b5',
          border: '1px solid rgba(63, 81, 181, 0.2)',
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: '#3f51b5',
          color: '#ffffff',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(63, 81, 181, 0.08)',
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(63, 81, 181, 0.12)',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(63, 81, 181, 0.12)',
        },
        bar: {
          backgroundColor: '#3f51b5',
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: '#3f51b5',
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          '& .MuiSwitch-switchBase.Mui-checked': {
            color: '#3f51b5',
          },
          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
            backgroundColor: '#3f51b5',
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: '#3f51b5',
          '&.Mui-checked': {
            color: '#3f51b5',
          },
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: '#3f51b5',
          '&.Mui-checked': {
            color: '#3f51b5',
          },
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          color: '#3f51b5',
        },
        thumb: {
          backgroundColor: '#3f51b5',
        },
        track: {
          backgroundColor: '#3f51b5',
        },
      },
    },
  },
});

export default theme; 