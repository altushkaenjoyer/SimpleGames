import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { adminGetGames, adminDeleteGame } from '../../api';
import ConfirmModal from '../../components/ConfirmModal';

export default function AdminGames() {
  const [games, setGames] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    adminGetGames().then(data => setGames(data));
  }, []);

  async function confirmDelete() {
    try {
      await adminDeleteGame(deleteTarget);
      setGames(prev => prev.filter(g => g.id !== deleteTarget));
      toast.success('Игра удалена');
    } catch {
      toast.error('Не удалось удалить игру');
    } finally {
      setDeleteTarget(null);
    }
  }

  return (
    <div className="admin-page">
      {deleteTarget && (
        <ConfirmModal
          message="Удалить эту игру?"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div className="admin-nav">
        <Link to="/admin/users" className="admin-link">Пользователи</Link>
        <Link to="/admin/games" className="admin-link active">Игры</Link>
      </div>
      <h1>Администратор — Игры</h1>

      <div className="table-wrap games-table">
        <div className="table-head">
          <span>Название</span>
          <span>Категории</span>
          <span>Лайки</span>
          <span>Комментарии</span>
          <span>Действие</span>
        </div>
        {games.map(game => (
          <div key={game.id} className="table-row">
            <Link to={`/game/${game.id}`} className="t-game-name">{game.name}</Link>
            <span className="t-cats">{game.categories.join(', ') || '—'}</span>
            <span className="t-stat">♥ {game.likes.length}</span>
            <span className="t-stat">💬 {game.commentCount}</span>
            <div className="t-actions">
              <Link to={`/admin/games/${game.id}`} className="manage-btn">Управление</Link>
              <button onClick={() => setDeleteTarget(game.id)} className="btn-del">Удалить</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
