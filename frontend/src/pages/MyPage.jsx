import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getUserGames, getUserLikes, getUserComments, deleteGame, deleteComment } from '../api';
import ConfirmModal from '../components/ConfirmModal';

export default function MyPage() {
  const user = useSelector(state => state.auth.user);

  const [myGames, setMyGames] = useState([]);
  const [likedGames, setLikedGames] = useState([]);
  const [myComments, setMyComments] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    Promise.all([
      getUserGames(user.id),
      getUserLikes(user.id),
      getUserComments(user.id),
    ]).then(([games, likes, comments]) => {
      setMyGames(games);
      setLikedGames(likes);
      setMyComments(comments);
    });
  }, [user.id]);

  async function confirmDeleteGame() {
    try {
      await deleteGame(deleteTarget);
      setMyGames(prev => prev.filter(g => g.id !== deleteTarget));
      toast.success('Игра удалена');
    } catch {
      toast.error('Не удалось удалить игру');
    } finally {
      setDeleteTarget(null);
    }
  }

  async function handleDeleteComment(id) {
    try {
      await deleteComment(id);
      setMyComments(prev => prev.filter(c => c.id !== id));
      toast.success('Комментарий удалён');
    } catch {
      toast.error('Не удалось удалить комментарий');
    }
  }

  const totalLikes = myGames.reduce((sum, g) => sum + (g.likes?.length || 0), 0);

  return (
    <div className="my-page">
      {deleteTarget && (
        <ConfirmModal
          message="Удалить эту игру? Это действие нельзя отменить."
          onConfirm={confirmDeleteGame}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div className="profile-header">
        <div className="profile-avatar">
          {user.username?.[0]?.toUpperCase() || '?'}
        </div>
        <div className="profile-info">
          <h1 className="profile-username">{user.username}</h1>
          {user.role === 'admin' && <span className="profile-badge">ADMIN</span>}
        </div>
        <div className="profile-stats">
          <div className="stat-box">
            <span className="stat-num">{myGames.length}</span>
            <span className="stat-label">игр</span>
          </div>
          <div className="stat-box">
            <span className="stat-num">{totalLikes}</span>
            <span className="stat-label">лайков</span>
          </div>
          <div className="stat-box">
            <span className="stat-num">{myComments.length}</span>
            <span className="stat-label">коммент.</span>
          </div>
        </div>
        <Link to="/new-game" className="new-btn">+ Новая игра</Link>
      </div>

      <div className="profile-sections">
        <div className="profile-section">
          <div className="psection-head">
            <h2>Мои игры</h2>
            <span className="psection-count">{myGames.length}</span>
          </div>
          {myGames.length === 0 ? (
            <p className="empty-state">Вы ещё не загрузили ни одной игры</p>
          ) : (
            <div className="game-rows">
              {myGames.map(game => (
                <div key={game.id} className="game-row">
                  <div className="game-row-left">
                    <Link to={`/game/${game.id}`} className="game-row-name">{game.name}</Link>
                    <div className="game-row-tags">
                      {game.categories?.map(cat => (
                        <span key={cat} className="row-tag">{cat}</span>
                      ))}
                    </div>
                  </div>
                  <div className="game-row-meta">
                    <span className="game-row-likes">♥ {game.likes?.length || 0}</span>
                    <div className="game-row-actions">
                      <Link to={`/edit-game/${game.id}`} className="row-edit-btn">Изменить</Link>
                      <button onClick={() => setDeleteTarget(game.id)} className="row-del-btn">Удалить</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="profile-section">
          <div className="psection-head">
            <h2>Лайкнутые игры</h2>
            <span className="psection-count">{likedGames.length}</span>
          </div>
          {likedGames.length === 0 ? (
            <p className="empty-state">Вы ещё ничего не лайкнули</p>
          ) : (
            <div className="game-rows">
              {likedGames.map(game => (
                <div key={game.id} className="game-row">
                  <Link to={`/game/${game.id}`} className="game-row-name">{game.name}</Link>
                  <div className="game-row-tags">
                    {game.categories?.map(cat => (
                      <span key={cat} className="row-tag">{cat}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="profile-section">
          <div className="psection-head">
            <h2>Мои комментарии</h2>
            <span className="psection-count">{myComments.length}</span>
          </div>
          {myComments.length === 0 ? (
            <p className="empty-state">Вы ещё не оставили ни одного комментария</p>
          ) : (
            <div className="game-rows">
              {myComments.map(comment => (
                <div key={comment.id} className="comment-row">
                  <Link to={`/game/${comment.gameId}`} className="comment-game-link">→ Перейти к игре</Link>
                  <p className="comment-row-text">"{comment.text}"</p>
                  <button onClick={() => handleDeleteComment(comment.id)} className="row-del-btn">Удалить</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
