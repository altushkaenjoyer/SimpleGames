import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  adminGetUser, adminBanUser, adminMuteUser, adminDeleteUser,
  getUserGames, getUserComments, adminDeleteGame, adminDeleteComment,
} from '../../api';
import ConfirmModal from '../../components/ConfirmModal';

export default function AdminUserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [games, setGames] = useState([]);
  const [comments, setComments] = useState([]);
  const [showDeleteUser, setShowDeleteUser] = useState(false);

  useEffect(() => {
    Promise.all([adminGetUser(id), getUserGames(id), getUserComments(id)])
      .then(([u, g, c]) => {
        setUser(u);
        setGames(g);
        setComments(c);
      });
  }, [id]);

  async function handleBan() {
    const updated = await adminBanUser(user.id);
    setUser(updated);
    toast.success(updated.banned ? 'Пользователь заблокирован' : 'Пользователь разблокирован');
  }

  async function handleMute() {
    const updated = await adminMuteUser(user.id);
    setUser(updated);
    toast.success(updated.muted ? 'Пользователь замучен' : 'Пользователь размучен');
  }

  async function confirmDeleteUser() {
    try {
      await adminDeleteUser(user.id);
      toast.success('Пользователь удалён');
      navigate('/admin/users');
    } catch {
      toast.error('Не удалось удалить пользователя');
      setShowDeleteUser(false);
    }
  }

  async function handleDeleteGame(gameId) {
    try {
      await adminDeleteGame(gameId);
      setGames(prev => prev.filter(g => g.id !== gameId));
      toast.success('Игра удалена');
    } catch {
      toast.error('Не удалось удалить игру');
    }
  }

  async function handleDeleteComment(commentId) {
    try {
      await adminDeleteComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
      toast.success('Комментарий удалён');
    } catch {
      toast.error('Не удалось удалить комментарий');
    }
  }

  if (!user) return <div className="loading">Loading...</div>;

  return (
    <div className="admin-page">
      {showDeleteUser && (
        <ConfirmModal
          message={`Удалить пользователя "${user.username}" и всё его содержимое?`}
          onConfirm={confirmDeleteUser}
          onCancel={() => setShowDeleteUser(false)}
        />
      )}

      <div className="admin-nav">
        <Link to="/admin/users" className="admin-link">Пользователи</Link>
        <Link to="/admin/games" className="admin-link">Игры</Link>
      </div>
      <Link to="/admin/users" className="back">← Вернуться к пользователям</Link>

      <div className="user-card">
        <h1>{user.username}</h1>
        <div className="user-meta">
          <span>{user.email}</span>
          <span className={`t-role ${user.role}`}>{user.role}</span>
          <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="user-status">
          {user.banned && <span className="badge-ban">Banned</span>}
          {user.muted && <span className="badge-mute">Muted</span>}
        </div>
        <div className="user-actions">
          <button onClick={handleBan} className={`btn-action ${user.banned ? 'btn-unban' : 'btn-ban'}`}>
            {user.banned ? 'Разблокировать' : 'Заблокировать'}
          </button>
          <button onClick={handleMute} className={`btn-action ${user.muted ? 'btn-unmute' : 'btn-mute'}`}>
            {user.muted ? 'Размьютить' : 'Замьютить'}
          </button>
          <button onClick={() => setShowDeleteUser(true)} className="btn-delete-user">Удалить пользователя</button>
        </div>
      </div>

      <div className="section">
        <h2>Игры</h2>
        {games.length === 0 ? <p className="empty">Нет данных.</p> : (
          <div className="item-list">
            {games.map(game => (
              <div key={game.id} className="item-row">
                <Link to={`/game/${game.id}`} className="item-name">{game.name}</Link>
                <div className="item-actions">
                  <Link to={`/admin/games/${game.id}`} className="manage-btn">Управление</Link>
                  <button onClick={() => handleDeleteGame(game.id)} className="btn-del">Удалить</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="section">
        <h2>Комментарии</h2>
        {comments.length === 0 ? <p className="empty">Нет комментариев.</p> : (
          <div className="item-list">
            {comments.map(comment => (
              <div key={comment.id} className="item-row">
                <span className="item-name">{comment.text}</span>
                <button onClick={() => handleDeleteComment(comment.id)} className="btn-del">Удалить</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
