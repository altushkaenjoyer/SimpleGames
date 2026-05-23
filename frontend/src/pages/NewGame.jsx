import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createGame } from '../api';

export default function NewGame() {
	const navigate = useNavigate();

	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [categories, setCategories] = useState('');
	const [loading, setLoading] = useState(false);

	const iconRef = useRef(null);
	const htmlRef = useRef(null);

	async function handleSubmit(e) {
		e.preventDefault();
		if (!htmlRef.current?.files[0]) {
			toast.error('Файл HTML обязателен');
			return;
		}
		setLoading(true);
		try {
			const fd = new FormData();
			fd.append('name', name);
			fd.append('description', description);
			fd.append('categories', categories);
			if (iconRef.current?.files[0]) fd.append('icon', iconRef.current.files[0]);
			fd.append('html', htmlRef.current.files[0]);
			await createGame(fd);
			toast.success('Игра опубликована!');
			navigate('/my');
		} catch (err) {
			toast.error(err.message);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="form-page">
			<div className="form-card">
				<h1>Новая игра</h1>
				<form onSubmit={handleSubmit}>
					<label>Название игры *</label>
					<br />
					<input
						type="text"
						value={name}
						onChange={e => setName(e.target.value)}
						required
					/>
					<br />

					<label>Описание *</label>
					<br />
					<textarea
						value={description}
						onChange={e => setDescription(e.target.value)}
						rows={4}
						required
					/>
					<br />

					<label>Категории <span className="hint">(разделяются запятыми)</span></label>
					<br />
					<input
						type="text"
						value={categories}
						onChange={e => setCategories(e.target.value)}
						placeholder="Пузырь, Экшн, RPG"
					/>
					<br />

					<label>Иконка</label>
					<br />
					<input type="file" accept="image/*" ref={iconRef} />
					<br />

					<label>Файл игры * <span className="hint">(.html или .zip с index.html внутри)</span></label>
					<br />
					<input type="file" accept=".html,.htm,.zip" ref={htmlRef} />
					<br />

					<div className="form-actions">
						<Link to="/my" className="cancel-btn">Отмена</Link>
						<button type="submit" className="submit-btn" disabled={loading}>
							{loading ? 'Опубликовываю...' : 'Опубликовать'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
