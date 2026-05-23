import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { register } from '../api';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [done, setDone] = useState(false);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await register(form);
      setDone(true);
    } catch (err) {
      toast.error(err.message);
    }
  }

  if (done) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="verify-icon verify-ok">✉</div>
          <h1>Проверьте почту</h1>
          <p className="verify-sub">
            Письмо с подтверждением отправлено на <strong>{form.email}</strong>.<br />
            Перейдите по ссылке в письме, чтобы активировать аккаунт.
          </p>
          <Link to="/login" className="verify-btn">Войти</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Регистрация</h2>
        <form onSubmit={handleSubmit}>
          <label>Имя пользователя</label>
          <br />
          <input
            name="username"
            type="text"
            value={form.username}
            onChange={handleChange}
            required
            autoComplete="username"
          />
          <br />
          <label>Электронная почта</label>
          <br />
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />
          <br />
          <label>Пароль</label>
          <br />
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            minLength={6}
            autoComplete="new-password"
          />
          <br />
          <button type="submit">Создать аккаунт</button>
        </form>
        <p className="switch">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </div>
    </div>
  );
}
