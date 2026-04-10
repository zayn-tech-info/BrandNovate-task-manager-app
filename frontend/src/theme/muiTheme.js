import { createTheme } from '@mui/material/styles';

export const muiTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0d0f14',
      paper: '#111420'
    }
  },
  components: {
    MuiSkeleton: {
      defaultProps: {
        animation: 'wave'
      },
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.08)'
        }
      }
    }
  }
});
