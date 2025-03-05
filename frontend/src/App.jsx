import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Home from './pages/Home';
import Navbar from './components/Navbar';
import Progress from './pages/Progress';
import Register from './pages/Register';
import Login from './components/Login';
import DashboadPage from './pages/Dashboad';
import Logout from './pages/Logout';

function App() {
  return (

    <Router>
      <Navbar />
      <Routes>
        <Route path='/dashboard' element={<DashboadPage />}></Route >
        <Route path='/' element={<Home />}>Home</Route>
        <Route path='/progress' element={<Progress />}></Route>
        <Route path='/signup' element={<Register />}></Route >
        <Route path='/login' element={<Login />}></Route >
        <Route path='/logout' element={<Logout />}></Route >
      </Routes>
    </Router>
  );
}

export default App;