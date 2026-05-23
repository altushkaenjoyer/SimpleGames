import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getDiscussions, createDiscussion, deleteDiscussion, getGames } from '../api';

export default function ForumPage() {
  const user = useSelector(state => state.auth.user);

  const [discussions, setDiscussions] = useState([]);
  const [games, setGames] = useState([]);
  const [filterGameId, setFilterGameId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formGameId, setFormGameId] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formText, setFormText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.allSettled([getDiscussions(), getGames()]).then(([d, g]) => {
      if (d.status === 'fulfilled') setDiscussions(d.value);
      if (g.status === 'fulfilled') setGames(g.value);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() =>
    filterGameId ? discussions.filter(d => d.gameId === filterGameId) : discussions,
    [discussions, filterGameId]
  );

  async function handleCreate(e) {
    e.preventDefault();
    if (!formGameId || !formTitle.trim() || !formText.trim()) return;
    setSubmitting(true);
    try {
      const d = await createDiscussion({ gameId: formGameId, title: formTitle, text: formText });
      setDiscussions(prev => [{ ...d, replyCount: 0, gameName: games.find(g => g.id === d.gameId)?.name || '' }, ...prev]);
      setShowForm(false);
      setFormTitle(''); setFormText(''); setFormGameId('');
      toast.success('Обсуждение создано');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteDiscussion(id);
      setDiscussions(prev => prev.filter(d => d.id !== id));
      toast.success('Обсуждение удалено');
    } catch (err) {
      toast.error(err.message);
    }
  }

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="forum-page">
      <div className="forum-header">
        <h1 className="forum-title">Форум</h1>
        {user && (
          <button className="forum-new-btn" onClick={() => setShowForm(v => !v)}>
            {showForm ? '✕ Отмена' : '+ Новое обсуждение'}
          </button>
        )}
      </div>

      {showForm && (
        <form className="forum-form" onSubmit={handleCreate}>
          <div className="forum-form-row">
            <label>Игра</label>
            <select
              className="forum-select"
              value={formGameId}
              onChange={e => setFormGameId(e.target.value)}
              required
            >
              <option value="">— выберите игру —</option>
              {games.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
          <div className="forum-form-row">
            <label>Тема</label>
            <input
              className="forum-input"
              type="text"
              placeholder="Заголовок обсуждения..."
              value={formTitle}
              onChange={e => setFormTitle(e.target.value)}
              maxLength={120}
              required
            />
          </div>
          <div className="forum-form-row">
            <label>Текст</label>
            <textarea
              className="forum-textarea"
              placeholder="Опишите суть обсуждения..."
              value={formText}
              onChange={e => setFormText(e.target.value)}
              rows={4}
              required
            />
          </div>
          <button type="submit" className="forum-submit-btn" disabled={submitting}>
            {submitting ? 'Создаю...' : 'Создать'}
          </button>
        </form>
      )}

      <div className="forum-filters">
        <span className="forum-filter-label">Фильтр по игре:</span>
        <button
          className={`forum-filter-chip${filterGameId === '' ? ' active' : ''}`}
          onClick={() => setFilterGameId('')}
        >
          Все
        </button>
        {games.map(g => (
          <button
            key={g.id}
            className={`forum-filter-chip${filterGameId === g.id ? ' active' : ''}`}
            onClick={() => setFilterGameId(g.id)}
          >
            {g.name}
          </button>
        ))}
      </div>

      <div className="forum-count">{filtered.length} обсуждений</div>

      {filtered.length === 0 ? (
        <div className="forum-empty">Обсуждений пока нет. Начните первым!</div>
      ) : (
        <div className="discussion-list">
          {filtered.map(d => (
            <div key={d.id} className="discussion-card">
              <div className="discussion-card-body">
                <Link to={`/forum/${d.id}`} className="discussion-title">{d.title}</Link>
                <p className="discussion-preview">{d.text}</p>
                <div className="discussion-meta">
                  <Link to={`/user/${d.userId}`} className="discussion-author">{d.username}</Link>
                  <span className="discussion-game-tag">{d.gameName}</span>
                  <span className="discussion-date">{new Date(d.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="discussion-card-right">
                <span className="discussion-replies">{d.replyCount} <span>ответов</span></span>
                {user && (user.id === d.userId || user.role === 'admin') && (
                  <button className="discussion-del-btn" onClick={() => handleDelete(d.id)}>Удалить</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
