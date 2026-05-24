import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getGame, adminDeleteGame, adminDeleteComment, assetUrl } from '../../api';
import ConfirmModal from '../../components/ConfirmModal';

export default function AdminGameDetail() {
	const { id } = useParams();
	const navigate = useNavigate();

	const [game, setGame] = useState(null);
	const [showDeleteGame, setShowDeleteGame] = useState(false);

	useEffect(() => {
		getGame(id).then(data => setGame(data));
	}, [id]);

	async function confirmDeleteGame() {
		try {
			await adminDeleteGame(game.id);
			toast.success('Игра удалена');
			navigate('/admin/games');
		} catch {
			toast.error('Не удалось удалить игру');
			setShowDeleteGame(false);
		}
	}

	async function handleDeleteComment(commentId) {
		try {
			await adminDeleteComment(commentId);
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
		<div className="admin-page">
			{showDeleteGame && (
				<ConfirmModal
					message={`Удалить игру "${game.name}"?`}
					onConfirm={confirmDeleteGame}
					onCancel={() => setShowDeleteGame(false)}
				/>
			)}

			<div className="admin-nav">
				<Link to="/admin/users" className="admin-link">Пользователи</Link>
				<Link to="/admin/games" className="admin-link">Игры</Link>
			</div>
			<Link to="/admin/games" className="back">Назад к играм</Link>

			<div className="game-card-admin">
				<div className="game-header">
					{game.icon && (
						<img src={assetUrl(game.icon)} className="game-icon" alt="" />
					)}
					<div>
						<h1>{game.name}</h1>
						<div className="game-meta">
							<span>♥ {game.likes.length} лайков</span>
							<span>{game.categories.join(', ') || 'Нет категориев'}</span>
						</div>
					</div>
				</div>
				<p className="game-desc">{game.description}</p>
				<div className="game-admin-actions">
					<Link to={`/edit-game/${game.id}`} className="btn-edit-game">Изменить</Link>
					<button onClick={() => setShowDeleteGame(true)} className="btn-delete-game">Удалить</button>
				</div>
			</div>

			<div className="section">
				<h2>Комментарии ({game.comments?.length || 0})</h2>
				{!game.comments?.length ? (
					<p className="empty">Комментариев нет</p>
				) : (
					<div className="item-list">
						{game.comments.map(comment => (
							<div key={comment.id} className="item-row">
								<Link to={`/admin/users/${comment.userId}`} className="username">
									{comment.username}
								</Link>
								<span className="t-comment-text">{comment.text}</span>
								<button onClick={() => handleDeleteComment(comment.id)} className="btn-del">
									Удалить
								</button>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
