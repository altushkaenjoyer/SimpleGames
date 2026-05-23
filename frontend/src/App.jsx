import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import GamePage from './pages/GamePage';
import Login from './pages/Login';
import Register from './pages/Register';
import MyPage from './pages/MyPage';
import UserPage from './pages/UserPage';
import NewGame from './pages/NewGame';
import EditGame from './pages/EditGame';
import AdminUsers from './pages/admin/AdminUsers';
import AdminUserDetail from './pages/admin/AdminUserDetail';
import AdminGames from './pages/admin/AdminGames';
import AdminGameDetail from './pages/admin/AdminGameDetail';
import ForumPage from './pages/ForumPage';
import DiscussionPage from './pages/DiscussionPage';
import VerifyEmail from './pages/VerifyEmail';

function PrivateRoute({ children }) {
  const user = useSelector(state => state.auth.user);
  return user ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const user = useSelector(state => state.auth.user);
  return user?.role === 'admin' ? children : <Navigate to="/" />;
}

function Loged({ children }) {
  const user = useSelector(state => state.auth.user);
  return user ? <Navigate to="/" /> : children;
}

export default function App() {
  const theme = useSelector(state => state.theme.theme);

  return (
    <div data-theme={theme}>
      <ToastContainer position="bottom-right" autoClose={3000} theme={theme === 'dark' ? 'dark' : 'light'} />
      <BrowserRouter>
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/game/:id" element={<GamePage />} />
            <Route path="/login" element={<Loged><Login /></Loged>} />
            <Route path="/register" element={<Loged><Register /></Loged>} />
            <Route path="/user/:id" element={<UserPage />} />
            <Route path="/my" element={<PrivateRoute><MyPage /></PrivateRoute>} />
            <Route path="/new-game" element={<PrivateRoute><NewGame /></PrivateRoute>} />
            <Route path="/edit-game/:id" element={<PrivateRoute><EditGame /></PrivateRoute>} />
            <Route path="/verify/:token" element={<VerifyEmail />} />
            <Route path="/forum" element={<ForumPage />} />
            <Route path="/forum/:id" element={<DiscussionPage />} />
            <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
            <Route path="/admin/users/:id" element={<AdminRoute><AdminUserDetail /></AdminRoute>} />
            <Route path="/admin/games" element={<AdminRoute><AdminGames /></AdminRoute>} />
            <Route path="/admin/games/:id" element={<AdminRoute><AdminGameDetail /></AdminRoute>} />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}
