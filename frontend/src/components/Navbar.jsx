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
              <Link to='/dashboard'>ダッシュボード</Link>
              <Link to='/goalsetting'>目標設定</Link>
              <Link to='/'>ワークアウトフォーム</Link>
              <Link to='/workout-history'>ワークアウト履歴</Link>
              <Link to='/logout'>ログアウト</Link>
              <Link to='/goalprogress'>目標進捗</Link>
            </>
          ) : (
            <>
              <Link to='/login'>ログイン</Link>
              <Link to='/signup'>サインアップ</Link>            </>
          )}
        </>
      )}
    </nav>
  )
}

export default Navbar