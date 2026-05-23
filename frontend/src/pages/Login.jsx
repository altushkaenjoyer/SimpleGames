import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { login } from '../api';
import { loginAction } from '../store/authSlice';

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [form, setForm] = useState({ email: '', password: '' });

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await login(form);
      dispatch(loginAction({ user: res.user, token: res.token }));
      toast.success('Добро пожаловать!');
      navigate('/');
    } catch (err) {
      if (err.message === 'email_not_verified') {
        toast.error('Подтвердите email — проверьте почту', { autoClose: 6000 });
      } else {
        toast.error(err.message);
      }
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Вход</h2>
        <form onSubmit={handleSubmit}>
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
            autoComplete="current-password"
          />
          <br />
          <button type="submit">Войти</button>
        </form>
        <p className="switch">
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  );
}
