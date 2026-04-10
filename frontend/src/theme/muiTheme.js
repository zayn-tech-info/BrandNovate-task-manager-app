import { createTheme } from '@mui/material/styles';

export const createAppMuiTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      background: {
        default: mode === 'dark' ? '#0d0f14' : '#f8fafc',
        paper: mode === 'dark' ? '#111420' : '#ffffff'
      }
    },
    components: {
      MuiSkeleton: {
        defaultProps: {
          animation: 'wave'
        },
        styleOverrides: {
          root: {
            backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'
          }
        }
      }
    }
  });
