import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminGetUsers, adminBanUser, adminMuteUser } from '../../api';

export default function AdminUsers() {
	const [users, setUsers] = useState([]);

	useEffect(() => {
		adminGetUsers().then(data => setUsers(data));
	}, []);

	async function handleBan(user) {
		const updated = await adminBanUser(user.id);
		setUsers(prev => prev.map(u => (u.id === user.id ? updated : u)));
	}

	async function handleMute(user) {
		const updated = await adminMuteUser(user.id);
		setUsers(prev => prev.map(u => (u.id === user.id ? updated : u)));
	}

	return (
		<div className="admin-page">
			<div className="admin-nav">
				<Link to="/admin/users" className="admin-link active">Пользователи</Link>
				<Link to="/admin/games" className="admin-link">Игры</Link>
			</div>
		<h1>Администратор — Пользователи</h1>

		<div className="table-wrap users-table">
			<div className="table-head">
				<span>Имя пользователя</span>
				<span>Электронная почта</span>
				<span>Роль</span>
				<span>Статус</span>
				<span>Действия</span>
				</div>
				{users.map(user => (
					<div key={user.id} className="table-row">
						<Link to={`/admin/users/${user.id}`} className="t-username">{user.username}</Link>
						<span className="t-email">{user.email}</span>
						<span className={`t-role ${user.role}`}>{user.role}</span>
						<span>
							{user.banned && <span className="badge-ban">Заблокирован</span>}
							{user.muted && <span className="badge-mute">Вмуте</span>}
							{!user.banned && !user.muted && <span className="badge-ok">ОК</span>}
						</span>
						<div className="t-actions">
							<button
								onClick={() => handleBan(user)}
								className={user.banned ? 'btn-unban' : 'btn-ban'}
							>
								{user.banned ? 'Разблокировать' : 'Заблокировать'}
							</button>
							<button
								onClick={() => handleMute(user)}
								className={user.muted ? 'btn-unmute' : 'btn-mute'}
							>
								{user.muted ? 'Размутить' : 'Замутить'}
							</button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
