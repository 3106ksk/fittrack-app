import {
    Dashboard as DashboardIcon,
    FitnessCenter as FitnessCenterIcon,
    History as HistoryIcon,
    Login as LoginIcon,
    Logout as LogoutIcon,
    PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import {
    AppBar,
    Avatar,
    Box,
    Button,
    Container,
    IconButton,
    Menu,
    MenuItem,
    Toolbar,
    Typography,
    useTheme,
} from '@mui/material';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from './Hook';

const Navbar = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const isActive = (path) => location.pathname === path;

  const navItems = user
    ? [
        { path: '/dashboard', label: 'ダッシュボード', icon: DashboardIcon },
        { path: '/', label: 'ワークアウト', icon: FitnessCenterIcon },
        { path: '/workout-history', label: '履歴', icon: HistoryIcon },
      ]
    : [
        { path: '/login', label: 'ログイン', icon: LoginIcon },
        { path: '/signup', label: 'サインアップ', icon: PersonAddIcon },
      ];

  if (loading) {
    return null;
  }

  return (
    <AppBar position="sticky" elevation={2}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          {/* ロゴとタイトル */}
          <FitnessCenterIcon 
            sx={{ 
              display: { xs: 'none', md: 'flex' }, 
              mr: 1,
              color: theme.palette.primary.main,
            }} 
          />
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to={user ? '/dashboard' : '/login'}
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.1rem',
              color: theme.palette.primary.main,
              textDecoration: 'none',
              flexGrow: 0,
            }}
          >
            FitTrack
          </Typography>

          {/* モバイル用ロゴ */}
          <FitnessCenterIcon 
            sx={{ 
              display: { xs: 'flex', md: 'none' }, 
              mr: 1,
              color: theme.palette.primary.main,
            }} 
          />
          <Typography
            variant="h5"
            noWrap
            component={Link}
            to={user ? '/dashboard' : '/login'}
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.1rem',
              color: theme.palette.primary.main,
              textDecoration: 'none',
            }}
          >
            FitTrack
          </Typography>

          {/* ナビゲーションボタン */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, ml: 4 }}>
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Button
                  key={item.path}
                  component={Link}
                  to={item.path}
                  startIcon={<IconComponent />}
                  sx={{
                    mr: 2,
                    color: isActive(item.path) 
                      ? theme.palette.primary.main 
                      : theme.palette.text.primary,
                    fontWeight: isActive(item.path) ? 600 : 400,
                    backgroundColor: isActive(item.path) 
                      ? theme.palette.primary.light + '20' 
                      : 'transparent',
                    '&:hover': {
                      backgroundColor: theme.palette.primary.light + '30',
                    },
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Box>

          {/* ユーザーメニュー */}
          {user && (
            <Box sx={{ flexGrow: 0 }}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <Avatar 
                  sx={{ 
                    bgcolor: theme.palette.primary.main,
                    width: 32, 
                    height: 32,
                  }}
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </Avatar>
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem 
                  component={Link} 
                  to="/logout" 
                  onClick={handleClose}
                  sx={{ minWidth: 120 }}
                >
                  <LogoutIcon sx={{ mr: 1, fontSize: 20 }} />
                  ログアウト
                </MenuItem>
              </Menu>
            </Box>
          )}

          {/* モバイル用ナビゲーション */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' }, justifyContent: 'flex-end' }}>
            {!user && (
              <>
                <IconButton
                  component={Link}
                  to="/login"
                  size="large"
                  color="inherit"
                >
                  <LoginIcon />
                </IconButton>
                <IconButton
                  component={Link}
                  to="/signup"
                  size="large"
                  color="inherit"
                >
                  <PersonAddIcon />
                </IconButton>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
