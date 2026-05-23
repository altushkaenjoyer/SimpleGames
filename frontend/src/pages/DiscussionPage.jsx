import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getDiscussion, addReply, deleteReply, deleteDiscussion } from '../api';

export default function DiscussionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector(state => state.auth.user);

  const [discussion, setDiscussion] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getDiscussion(id).then(setDiscussion);
  }, [id]);

  async function handleReply(e) {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      const reply = await addReply(id, replyText);
      setDiscussion(prev => ({ ...prev, replies: [...prev.replies, reply] }));
      setReplyText('');
      toast.success('Ответ добавлен');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteReply(replyId) {
    try {
      await deleteReply(replyId);
      setDiscussion(prev => ({ ...prev, replies: prev.replies.filter(r => r.id !== replyId) }));
      toast.success('Ответ удалён');
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleDeleteDiscussion() {
    try {
      await deleteDiscussion(id);
      toast.success('Обсуждение удалено');
      navigate('/forum');
    } catch (err) {
      toast.error(err.message);
    }
  }

  if (!discussion) return <div className="loading">Загрузка...</div>;

  return (
    <div className="discussion-page">
      <Link to="/forum" className="back-link">← Форум</Link>

      <div className="discussion-thread">
        <div className="thread-op">
          <div className="thread-op-header">
            <div className="thread-op-meta">
              <Link to={`/user/${discussion.userId}`} className="thread-author">{discussion.username}</Link>
              <span className="thread-game-tag">{discussion.gameName}</span>
              <span className="thread-date">{new Date(discussion.createdAt).toLocaleDateString()}</span>
            </div>
            {user && (user.id === discussion.userId || user.role === 'admin') && (
              <button className="thread-del-btn" onClick={handleDeleteDiscussion}>Удалить</button>
            )}
          </div>
          <h1 className="thread-title">{discussion.title}</h1>
          <p className="thread-text">{discussion.text}</p>
        </div>

        <div className="thread-replies">
          <h2 className="thread-replies-head">
            Ответы <span className="thread-replies-count">{discussion.replies.length}</span>
          </h2>

          {discussion.replies.length === 0 && (
            <p className="forum-empty">Пока нет ответов. Будьте первым!</p>
          )}

          {discussion.replies.map((r, i) => (
            <div key={r.id} className="reply-card">
              <div className="reply-num">#{i + 1}</div>
              <div className="reply-body">
                <div className="reply-meta">
                  <Link to={`/user/${r.userId}`} className="reply-author">{r.username}</Link>
                  <span className="reply-date">{new Date(r.createdAt).toLocaleDateString()}</span>
                  {user && (user.id === r.userId || user.role === 'admin') && (
                    <button className="reply-del-btn" onClick={() => handleDeleteReply(r.id)}>Удалить</button>
                  )}
                </div>
                <p className="reply-text">{r.text}</p>
              </div>
            </div>
          ))}
        </div>

        {user ? (
          <form className="reply-form" onSubmit={handleReply}>
            <h3 className="reply-form-title">Ваш ответ</h3>
            <textarea
              className="forum-textarea"
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Напишите ответ..."
              rows={4}
            />
            <button type="submit" className="forum-submit-btn" disabled={submitting || !replyText.trim()}>
              {submitting ? 'Отправляю...' : 'Ответить'}
            </button>
          </form>
        ) : (
          <p className="forum-login-prompt">
            <Link to="/login">Войдите</Link>, чтобы ответить
          </p>
        )}
      </div>
    </div>
  );
}
