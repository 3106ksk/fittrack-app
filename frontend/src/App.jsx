import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Navbar from './components/Navbar';
import Register from './pages/Register';
import Login from './components/Login';
import Logout from './components/Logout';
import DashboadPage from './pages/Dashboad';
import { AuthContextProvider } from './components/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import WorkoutFormPage from './pages/WorkoutForm';
import WorkoutHistory from './pages/WorkoutHistory';
import GoalsettingPage from './pages/GoalsettingPage';

function App() {
  return (
    <Router>
      <AuthContextProvider>
        <Navbar />
        <Routes>
          <Route path='/dashboard' element={<PrivateRoute element={<DashboadPage />} />} />
          <Route path='/' element={<PrivateRoute element={<WorkoutFormPage />} />} />
          <Route path='/workout-history' element={<PrivateRoute element={<WorkoutHistory />} />} />
          <Route path='/goalsetting' element={<PrivateRoute element={<GoalsettingPage />} />} />

          <Route path='/signup' element={<PublicRoute element={<Register />} restricted={true} />} />
          <Route path='/login' element={<PublicRoute element={<Login />} restricted={true} />} />

          {/* ログアウトルート - 誰でもアクセス可能 */}
          <Route path='/logout' element={<Logout />} />
        </Routes>
      </AuthContextProvider>
    </Router>
  );
}

export default App;