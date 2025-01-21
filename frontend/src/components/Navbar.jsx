import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <nav>
      <Link to='/'> Home </Link>
      <Link to='/progress'> Progress</Link>


    </nav >
  )
}

export default Navbar