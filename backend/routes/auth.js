require('dotenv').config();
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { SECRET } = require('../middleware/auth');
const { sendVerificationEmail } = require('../email');

// POST /auth/register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ error: 'All fields required' });

  const users = db.read('users');
  if (users.find(u => u.email === email)) return res.status(400).json({ error: 'Email already in use' });
  if (users.find(u => u.username === username)) return res.status(400).json({ error: 'Username taken' });

  const hashed = await bcrypt.hash(password, 10);
  const verificationToken = uuidv4();
  const user = {
    id: uuidv4(),
    username,
    email,
    password: hashed,
    role: users.length === 0 ? 'admin' : 'user',
    banned: false,
    muted: false,
    emailVerified: false,
    verificationToken,
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  db.write('users', users);

  try {
    await sendVerificationEmail(email, username, verificationToken);
  } catch (err) {
    console.error('Email send error:', err.message);
  }

  res.json({ message: 'Регистрация успешна. Проверьте почту для подтверждения аккаунта.' });
});

// GET /auth/verify/:token
router.get('/verify/:token', (req, res) => {
  const users = db.read('users');
  const idx = users.findIndex(u => u.verificationToken === req.params.token);
  if (idx === -1) return res.status(400).json({ error: 'Неверная или устаревшая ссылка' });

  users[idx].emailVerified = true;
  users[idx].verificationToken = null;
  db.write('users', users);

  res.json({ message: 'Email подтверждён! Теперь можете войти.' });
});

// POST /auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const users = db.read('users');
  const user = users.find(u => u.email === email);
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ error: 'Invalid credentials' });

  if (user.banned) return res.status(403).json({ error: 'Account banned' });
  if (!user.emailVerified) return res.status(403).json({ error: 'email_not_verified' });

  const { password: _, verificationToken: __, ...safeUser } = user;
  const token = jwt.sign({ id: user.id, role: user.role }, SECRET);
  res.json({ user: safeUser, token });
});

module.exports = router;
