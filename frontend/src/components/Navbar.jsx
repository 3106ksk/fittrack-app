import {
  Dashboard as DashboardIcon,
  FitnessCenter as FitnessCenterIcon,
  History as HistoryIcon,
  Logout as LogoutIcon,
  MoreVert as MoreVertIcon,
  DirectionsRun as RunIcon,
  } from '@mui/icons-material';

import { AppBar, Avatar, Box, Button, IconButton, Toolbar, Typography, Menu, MenuItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from './Hook';

const Navbar = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };


  const isActive = (path) => {
    return location.pathname === path;
  };

  console.log(anchorEl);
  
  if(loading) {
    return(
      <AppBar>
        <Toolbar>
          <Typography variant="h6" color="div" sx={{ flexGrow: 1 }}>
            <RunIcon/>Loading...
          </Typography>
        </Toolbar>
      </AppBar>
    );
  }

  return (
    <AppBar position="sticky" color="default" elevation={1}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
          <FitnessCenterIcon
          sx={{ mr: 1, color: 'primary.main', fontSize: 40 }}
          />
          <Typography v
          ariant="h6" 
          componet="div" 
          sx={{ 
            fontWeight: 'bold',
            color: 'primary.main',
            textDecoration: 'none',
          }}
          component={Link}
          to={user ? "/" : "/login"}>
            FitStart
          </Typography>
        </Box>

        {/* ナビゲーションエリア */}
        <Box sx={{ flexGrow: 1, display: 'flex' }}>
          {user ? (
            <>
              {/* デスクトップナビゲーション */}
              <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
                <Button 
                component={Link}
                to="/dashboard"
                startIcon={<DashboardIcon/>}
                color={isActive('/dashboard') ? 'primary' : 'inherit'}
                sx={{ 
                  fontWeight: isActive('/dashboard') ? 500 : 300,
                  backgroundColor: isActive('/dashboard') ? 'primary.50' : 'transparent',
                  '&:hover': {
                    backgroundColor: isActive('/dashboard') ? 'primary.100' : 'transparent',
                  },
                }}>
                ダッシュボード
              </Button>

              {/* ワークアウトフォーム */}
              <Button 
              component={Link}
              to="/workout-form"
              startIcon={<FitnessCenterIcon/>}
              color={isActive('/workout-form') ? 'primary' : 'inherit'}
              sx={{ 
                fontWeight: isActive('/workout-form') ? 700 : 300,
                backgroundColor: isActive('/workout-form') ? 'primary.50' : 'transparent',
              }}>
                ワークアウトフォーム
              </Button>

              {/* ワークアウト履歴 */}
              <Button 
              component={Link}
              to="/workout-history"
              startIcon={<HistoryIcon/>}
              color={isActive('/workout-history') ? 'primary' : 'inherit'}
              sx={{ 
                fontWeight: isActive('/workout-history') ? 700 : 300,
                backgroundColor: isActive('/workout-history') ? 'primary.50' : 'transparent',
              }}>
                ワークアウト履歴
              </Button>
              </Box>

              {/* モバイルナビゲーション */}
              <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                <IconButton
                size="large"
                onClick={handleMenuOpen}
                color="inherit">
                  <MoreVertIcon/>
                </IconButton>
              </Box>
            </>
          ) :  null}
        </Box>

        {/* ユーザーエリア */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {user ? (
            <>
            {/* デスクトップユーザーメニュー */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
              <Avatar
              sx={{
                width: 32,
                height: 32,
                backgroundColor: 'primary.main',
                color: 'white',
                fontSize: 16,
                fontWeight: 'bold',
              }}
              >
                {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </Avatar>
              <Typography
              variant="body2" color="text.secondary">
                {user.username}
              </Typography>
              <Button
              component={Link}
              to="/logout"
              startIcon={<LogoutIcon/>}
              size="small"
              variant="outlined"
              color="error">
                ログアウト
              </Button>
            </Box>

            {/* モバイルユーザーメニュー */}
            <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
              <Avatar
              sx={{
                width: 32,
                height: 32,
                backgroundColor: 'primary.main',
                color: 'white',
                fontSize: 16,
                fontWeight: 'bold',
              }}>
                {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </Avatar>
              </Box>
            </>
          ): (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                component={Link} 
                to="/login"
                variant="outlined"
                size="small"
              >
                ログイン
              </Button>
              <Button 
                component={Link} 
                to="/signup"
                variant="contained"
                size="small"
              >
                新規登録
              </Button>
            </Box>
          )}
        </Box>
         {/* モバイルメニュー */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: { width: 200, mt: 1 }
          }}
        >
          <MenuItem component={Link} to="/dashboard" onClick={handleMenuClose}>
            <ListItemIcon>
              <DashboardIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>ダッシュボード</ListItemText>
          </MenuItem>
          <MenuItem component={Link} to="/" onClick={handleMenuClose}>
            <ListItemIcon>
              <FitnessCenterIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>ワークアウト記録</ListItemText>
          </MenuItem>
          <MenuItem component={Link} to="/workout-history" onClick={handleMenuClose}>
            <ListItemIcon>
              <HistoryIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>履歴</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem component={Link} to="/logout" onClick={handleMenuClose}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>
              <Typography color="error">ログアウト</Typography>
            </ListItemText>
          </MenuItem>
        </Menu>

      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
