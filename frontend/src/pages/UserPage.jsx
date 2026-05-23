import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUser, getUserGames, getUserLikes, getUserComments } from '../api';

export default function UserPage() {
	const { id } = useParams();

	const [user, setUser] = useState(null);
	const [games, setGames] = useState([]);
	const [likedGames, setLikedGames] = useState([]);
	const [comments, setComments] = useState([]);

	useEffect(() => {
		Promise.all([
			getUser(id),
			getUserGames(id),
			getUserLikes(id),
			getUserComments(id),
		]).then(([u, g, l, c]) => {
			setUser(u);
			setGames(g);
			setLikedGames(l);
			setComments(c);
		});
	}, [id]);

	if (!user) return <div className="loading">Загружается...</div>;

	const totalLikes = games.reduce((sum, g) => sum + (g.likes?.length || 0), 0);

	return (
		<div className="my-page">
			<div className="profile-header">
				<div className="profile-avatar">
					{user.username?.[0]?.toUpperCase() || '?'}
				</div>
				<div className="profile-info">
					<h1 className="profile-username">{user.username}</h1>
					<div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
						{user.role === 'admin' && <span className="profile-badge">ADMIN</span>}
						{user.banned && <span className="profile-badge" style={{ borderColor: 'var(--pink)', color: 'var(--pink)', textShadow: '0 0 6px var(--pink)' }}>BANNED</span>}
						{user.muted && <span className="profile-badge" style={{ borderColor: 'var(--yellow)', color: 'var(--yellow)', textShadow: '0 0 6px var(--yellow)' }}>MUTED</span>}
					</div>
					<span className="stat-label" style={{ marginTop: '4px' }}>
						На сайте с {new Date(user.createdAt).toLocaleDateString()}
					</span>
				</div>
				<div className="profile-stats">
					<div className="stat-box">
						<span className="stat-num">{games.length}</span>
						<span className="stat-label">игр</span>
					</div>
					<div className="stat-box">
						<span className="stat-num">{totalLikes}</span>
						<span className="stat-label">лайков</span>
					</div>
					<div className="stat-box">
						<span className="stat-num">{comments.length}</span>
						<span className="stat-label">коммент.</span>
					</div>
				</div>
			</div>

			<div className="profile-sections">
				<div className="profile-section">
					<div className="psection-head">
<h2>Игры</h2>
						<span className="psection-count">{games.length}</span>
					</div>
					{games.length === 0 ? (
						<p className="empty-state">Нет опубликованных игр</p>
					) : (
						<div className="game-rows">
							{games.map(game => (
								<div key={game.id} className="game-row">
									<div className="game-row-left">
										<Link to={`/game/${game.id}`} className="game-row-name">{game.name}</Link>
										<div className="game-row-tags">
											{game.categories?.map(cat => (
												<span key={cat} className="row-tag">{cat}</span>
											))}
										</div>
									</div>
									<span className="game-row-likes">♥ {game.likes?.length || 0}</span>
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
						<p className="empty-state">Нет лайкнутых игр</p>
					) : (
						<div className="game-rows">
							{likedGames.map(game => (
								<div key={game.id} className="game-row">
									<div className="game-row-left">
										<Link to={`/game/${game.id}`} className="game-row-name">{game.name}</Link>
										<div className="game-row-tags">
											{game.categories?.map(cat => (
												<span key={cat} className="row-tag">{cat}</span>
											))}
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				<div className="profile-section">
					<div className="psection-head">
<h2>Комментарии</h2>
						<span className="psection-count">{comments.length}</span>
					</div>
					{comments.length === 0 ? (
						<p className="empty-state">Нет комментариев</p>
					) : (
						<div className="game-rows">
							{comments.map(comment => (
								<div key={comment.id} className="comment-row">
									<Link to={`/game/${comment.gameId}`} className="comment-game-link">→ Перейти к игре</Link>
									<p className="comment-row-text">"{comment.text}"</p>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
