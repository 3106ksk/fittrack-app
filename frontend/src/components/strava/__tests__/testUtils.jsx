import { createTheme, ThemeProvider } from '@mui/material/styles';

export const theme = createTheme();

export const TestWrapper = ({ children }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

