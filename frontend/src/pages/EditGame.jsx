import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getGame, updateGame } from '../api';

export default function EditGame() {
	const { id } = useParams();
	const navigate = useNavigate();

	const [game, setGame] = useState(null);
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [categories, setCategories] = useState('');
	const [loading, setLoading] = useState(false);

	const iconRef = useRef(null);
	const htmlRef = useRef(null);

	useEffect(() => {
		getGame(id).then(data => {
			setGame(data);
			setName(data.name);
			setDescription(data.description);
			setCategories(data.categories.join(', '));
		});
	}, [id]);

	async function handleSubmit(e) {
		e.preventDefault();
		setLoading(true);
		try {
			const fd = new FormData();
			fd.append('name', name);
			fd.append('description', description);
			fd.append('categories', categories);
			if (iconRef.current?.files[0]) fd.append('icon', iconRef.current.files[0]);
			if (htmlRef.current?.files[0]) fd.append('html', htmlRef.current.files[0]);
			await updateGame(id, fd);
			toast.success('Игра обновлена!');
			navigate('/my');
		} catch (err) {
			toast.error(err.message);
		} finally {
			setLoading(false);
		}
	}

	if (!game) return <div className="loading">Загружается...</div>;

	return (
		<div className="form-page">
			<div className="form-card">
				<h1>Редактирование игры</h1>
				<form onSubmit={handleSubmit}>
					<label>Название игры *</label>
					<input
						type="text"
						value={name}
						onChange={e => setName(e.target.value)}
						required
					/>

					<label>Описание *</label>
					<textarea
						value={description}
						onChange={e => setDescription(e.target.value)}
						rows={4}
						required
					/>

					<label>Категории <span className="hint">(разделяются запятыми)</span></label>
					<input
						type="text"
						value={categories}
						onChange={e => setCategories(e.target.value)}
					/>

					<label>Новая иконка <span className="hint">(поставьте пусто, чтобы сохранять текущий)</span></label>
					<input type="file" accept="image/*" ref={iconRef} />

					<label>Новый файл игры <span className="hint">(.html или .zip — оставь пустым чтобы не менять)</span></label>
					<input type="file" accept=".html,.htm,.zip" ref={htmlRef} />

					<div className="form-actions">
						<Link to="/my" className="cancel-btn">Отмена</Link>
						<button type="submit" className="submit-btn" disabled={loading}>
							{loading ? 'Сохраняю...' : 'Сохранить изменения'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
