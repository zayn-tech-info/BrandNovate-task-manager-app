import React, { useEffect, useMemo, useState } from 'react';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import { createAppMuiTheme } from '../theme/muiTheme';

const getMode = () => (document.documentElement.classList.contains('dark') ? 'dark' : 'light');

export const AppMuiThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(getMode);

  useEffect(() => {
    const el = document.documentElement;
    const observer = new MutationObserver(() => {
      setMode(getMode());
    });
    observer.observe(el, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const theme = useMemo(() => createAppMuiTheme(mode), [mode]);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </StyledEngineProvider>
  );
};
