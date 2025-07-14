// src/theme/theme.ts
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#2E7D32', // フィットネス緑
      dark: '#1B5E20',
      light: '#4CAF50',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#FF6F00', // エネルギーオレンジ
      dark: '#E65100',
      light: '#FF8F00',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F8FAF8', // 軽やかなグレイッシュホワイト
      paper: '#FFFFFF',
    },
    success: {
      main: '#4CAF50',
      light: '#81C784',
      dark: '#388E3C',
    },
    info: {
      main: '#2196F3',
      light: '#64B5F6', 
      dark: '#1976D2',
    },
    warning: {
      main: '#FF9800',
      light: '#FFB74D',
      dark: '#F57C00',
    },
    error: {
      main: '#F44336',
      light: '#EF5350',
      dark: '#D32F2F',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Noto Sans JP", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 12, // 丸みを帯びたモダンデザイン
  },
  spacing: 8,
  components: {
    // Card コンポーネントのデフォルトスタイル
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          borderRadius: 16,
          transition: 'box-shadow 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    // Button コンポーネントのデフォルトスタイル
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none', // 大文字変換無効
          fontSize: '1rem',
          fontWeight: 500,
          padding: '10px 24px',
        },
        contained: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          },
        },
      },
    },
    // AppBar のデフォルトスタイル
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#333333',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
    // Chip のデフォルトスタイル
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    // LinearProgress のデフォルトスタイル
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 8,
        },
      },
    },
  },
});

export default theme;