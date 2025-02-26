import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <nav>
      <Link to='/'> Home </Link>
      <Link to='/progress'> Progress</Link>
      <Link to='/signup'> Signup</Link>

    </nav >
  )
}

export default Navbar