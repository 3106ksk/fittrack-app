import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <nav>
      <Link to='/dashboard'> Dashboard</Link>
      <Link to='/'> Home </Link>
      <Link to='/progress'> Progress</Link>
      <Link to='/signup'> Signup</Link>
      <Link to='/login'> Login</Link>
      <Link to='/logout'> Logout</Link>

    </nav >
  )
}

export default Navbar