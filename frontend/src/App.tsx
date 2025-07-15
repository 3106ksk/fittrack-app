import { CssBaseline, ThemeProvider } from '@mui/material';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import { AuthContextProvider } from './components/AuthContext';
import Login from './components/Login';
import Logout from './components/Logout';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import DashboardPage from './pages/Dashboard';
import Register from './pages/Register';
import WorkoutFormPage from './pages/WorkoutForm';
import WorkoutHistory from './pages/WorkoutHistory';
import { theme } from './theme/theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
    <Router>
      <AuthContextProvider>
        <Navbar />
        <Routes>
          <Route
            path="/dashboard"
            element={<PrivateRoute element={<DashboardPage />} />}
          />
          <Route
            path="/workout-form"
            element={<PrivateRoute element={<WorkoutFormPage />} />}
          />
          <Route
            path="/workout-history"
            element={<PrivateRoute element={<WorkoutHistory />} />}
          />
          <Route
            path="/workout-history"
            element={<PrivateRoute element={<WorkoutHistory />} />}
          />
          <Route
            path="/signup"
            element={<PublicRoute element={<Register />} restricted={true} />}
          />
          <Route
            path="/login"
            element={<PublicRoute element={<Login />} restricted={true} />}
          />

          {/* ログアウトルート - 誰でもアクセス可能 */}
          <Route path="/logout" element={<Logout />} />
        </Routes>
      </AuthContextProvider>
    </Router>
    </ThemeProvider>
  );
}

export default App;
