import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutAction } from '../store/authSlice';
import { toggleTheme } from '../store/themeSlice';

export default function Navbar() {
  const user = useSelector(state => state.auth.user);
  const theme = useSelector(state => state.theme.theme);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  function handleLogout() {
    dispatch(logoutAction());
    navigate('/');
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="site-name">SYILAB GAMES<span className="cursor" /></Link>
        <div className="nav-actions">
          <button onClick={() => dispatch(toggleTheme())} className="nav-btn theme-btn">
            {theme === 'dark' ? 'NIGHT' : 'NEON'}
          </button>
          <Link to="/forum" className="nav-btn">Форум</Link>
          {user ? (
            <>
              <Link to="/my" className="nav-btn">Моя страница</Link>
              {user.role === 'admin' && (
                <Link to="/admin/users" className="nav-btn admin-btn">Админ Панель</Link>
              )}
              <button onClick={handleLogout} className="nav-btn logout-btn">Выйти</button>
            </>
          ) : (
            <Link to="/login" className="nav-btn">Войти</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
