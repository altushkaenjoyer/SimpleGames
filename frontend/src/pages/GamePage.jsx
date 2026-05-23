import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getGame, likeGame, addComment, updateComment, deleteComment, getUser, assetUrl } from '../api';
import Heart from '../images/Heart.png';

export default function GamePage() {
	const { id } = useParams();
	const user = useSelector(state => state.auth.user);
	const frameWrapRef = useRef(null);
	const [isFullscreen, setIsFullscreen] = useState(false);

	useEffect(() => {
		function onFsChange() {
			setIsFullscreen(!!document.fullscreenElement);
		}
		document.addEventListener('fullscreenchange', onFsChange);
		return () => document.removeEventListener('fullscreenchange', onFsChange);
	}, []);

	function toggleFullscreen() {
		if (!document.fullscreenElement) {
			frameWrapRef.current?.requestFullscreen();
		} else {
			document.exitFullscreen();
		}
	}

	const [game, setGame] = useState(null);
	const [commentText, setCommentText] = useState('');
	const [authorName, setAuthorName] = useState('');
	const [editingId, setEditingId] = useState(null);
	const [editText, setEditText] = useState('');

	const isLiked = user && game?.likes.includes(user.id);

	useEffect(() => {
		function blockArrows(e) {
			if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
				e.preventDefault();
			}
		}
		window.addEventListener('keydown', blockArrows);
		return () => window.removeEventListener('keydown', blockArrows);
	}, []);

	useEffect(() => {
		getGame(id).then(data => {
			setGame(data);
			if (data.authorId) {
				getUser(data.authorId)
					.then(u => setAuthorName(u.username))
					.catch(() => { });
			}
		});
	}, [id]);

	async function handleLike() {
		if (!user) return;
		const res = await likeGame(game.id);
		setGame(prev => ({
			...prev,
			likes: res.liked
				? [...prev.likes, user.id]
				: prev.likes.filter(uid => uid !== user.id),
		}));
	}

	async function handleComment(e) {
		e.preventDefault();
		if (!commentText.trim()) return;
		try {
			const comment = await addComment(game.id, commentText);
			setGame(prev => ({ ...prev, comments: [...prev.comments, comment] }));
			setCommentText('');
			toast.success('Комментарий добавлен');
		} catch (err) {
			toast.error(err.message);
		}
	}

	function startEdit(comment) {
		setEditingId(comment.id);
		setEditText(comment.text);
	}

	async function handleEditSubmit(e) {
		e.preventDefault();
		if (!editText.trim()) return;
		try {
			const updated = await updateComment(editingId, editText);
			setGame(prev => ({
				...prev,
				comments: prev.comments.map(c => c.id === updated.id ? { ...c, text: updated.text } : c),
			}));
			setEditingId(null);
			toast.success('Комментарий обновлён');
		} catch (err) {
			toast.error(err.message);
		}
	}

	async function handleDeleteComment(commentId) {
		try {
			await deleteComment(commentId);
			setGame(prev => ({
				...prev,
				comments: prev.comments.filter(c => c.id !== commentId),
			}));
			toast.success('Комментарий удалён');
		} catch {
			toast.error('Не удалось удалить комментарий');
		}
	}

	if (!game) return <div className="loading">Загружается...</div>;

	return (
		<div className="game-page">
			<div className="game-frame-wrap" ref={frameWrapRef}>
				<iframe
					src={assetUrl(game.htmlFile)}
					className="game-frame"
					sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-modals"
					allowFullScreen
				/>
				<button className="fullscreen-btn" onClick={toggleFullscreen} title={isFullscreen ? 'Выйти из полного экрана' : 'Полный экран'}>
					{isFullscreen ? 'EXIT FS' : 'FULLSCREEN'}
				</button>
			</div>

			<div className="game-info">
				<div className="game-header">
					<div className="title-row">
						{game.icon && (
							<img src={assetUrl(game.icon)} className="game-icon" alt="" />
						)}
						<div>
							<h1>{game.name}</h1>
							<div className="tags">
								{game.categories.map(cat => (
									<span key={cat} className="tag">{cat}</span>
								))}
							</div>
						</div>
					</div>
					<button onClick={handleLike} className={`like-btn${isLiked ? ' liked' : ''}`}>
						<img src={Heart} alt="likes" /> {game.likes.length}
					</button>
				</div>
				<p className="description">{game.description}</p>
				<p className="author">
					От <Link to={`/user/${game.authorId}`} className="author-link">{authorName}</Link>
				</p>
			</div>

			<div className="comments-section">
				<h2>Комментарии ({game.comments?.length || 0})</h2>

				{user ? (
					<form onSubmit={handleComment} className="comment-form">
						<textarea
							value={commentText}
							onChange={e => setCommentText(e.target.value)}
							placeholder="Напишите комментарий..."
							rows={3}
						/>
						<button type="submit" disabled={!commentText.trim()}>Отправить</button>
					</form>
				) : (
					<p className="login-prompt">
						<Link to="/login">Войдите</Link> чтобы оставить комментарий.
					</p>
				)}

				<div className="comments-list">
					{game.comments?.map(comment => (
						<div key={comment.id} className="comment">
							<div className="comment-meta">
								<Link to={`/user/${comment.userId}`} className="username">
									{comment.username}
								</Link>
								<span className="time">
									{new Date(comment.createdAt).toLocaleDateString()}
								</span>
								{user && user.id === comment.userId && (
									<button onClick={() => startEdit(comment)} className="edit-comment-btn">
										Изменить
									</button>
								)}
								{user && (user.id === comment.userId || user.role === 'admin') && (
									<button onClick={() => handleDeleteComment(comment.id)} className="del-btn">
										Удалить
									</button>
								)}
							</div>

							{editingId === comment.id ? (
								<form onSubmit={handleEditSubmit} className="edit-comment-form">
									<textarea
										value={editText}
										onChange={e => setEditText(e.target.value)}
										rows={2}
									/>
									<div className="edit-comment-actions">
										<button type="submit" disabled={!editText.trim()}>Сохранить</button>
										<button type="button" onClick={() => setEditingId(null)}>Отмена</button>
									</div>
								</form>
							) : (
								<p className="comment-text">{comment.text}</p>
							)}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
