import { Link } from 'react-router-dom'
import { useAuth } from './Hook'

const Navbar = () => {
  const { user, loading } = useAuth()

  return (
    <nav>

      {!loading && (
        <>
          {user ? (
            <>
              <Link to='/dashboard'> Dashboard</Link>
              <Link to='/progress'> Progress</Link>
              <Link to='/'> Workout Form </Link>
              <Link to='/logout'> Logout</Link>
            </>
          ) : (
            <>
              <Link to='/login'> Login</Link>
              <Link to='/signup'> Signup</Link>            </>
          )}
        </>
      )}
    </nav>
  )
}

export default Navbar