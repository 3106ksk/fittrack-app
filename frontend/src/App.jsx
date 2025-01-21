import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Home from './pages/Home';
import Navbar from './components/Navbar';
import Progress from './pages/Progress';


function App() {
  return (

    <Router>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />}>Home</Route>
        <Route path='/progress' element={<Progress />}></Route>
      </Routes>
    </Router>
  );
}

export default App;