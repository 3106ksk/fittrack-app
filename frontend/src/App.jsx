import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Navbar from './components/Navbar';
import Progress from './pages/Progress';
import Register from './pages/Register';
import Login from './components/Login';
import Logout from './components/Logout';
import DashboadPage from './pages/Dashboad';
import { AuthContextProvider } from './components/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import WorkoutFormPage from './pages/WorkoutForm';
function App() {
  return (
    <Router>
      <AuthContextProvider>
        <Navbar />
        <Routes>
          {/* 公開ルート - 誰でもアクセス可能 */}

          {/* 保護されたルート - ログインユーザーのみアクセス可能 */}
          <Route path='/dashboard' element={<PrivateRoute element={<DashboadPage />} />} />
          <Route path='/progress' element={<PrivateRoute element={<Progress />} />} />
          <Route path='/' element={<PrivateRoute element={<WorkoutFormPage />} />} />


          {/* 制限付き公開ルート - 未ログインユーザーのみアクセス可能（ログイン済みならダッシュボードへリダイレクト） */}
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