const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /users
router.get('/', (req, res) => {
  const users = db.read('users').map(({ password, email, ...u }) => u);
  res.json(users);
});

// GET /users/:id
router.get('/:id', (req, res) => {
  const users = db.read('users');
  const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password, email, ...safeUser } = user;
  res.json(safeUser);
});

// GET /users/:id/games
router.get('/:id/games', (req, res) => {
  const games = db.read('games').filter(g => g.authorId === req.params.id);
  res.json(games);
});

// GET /users/:id/likes
router.get('/:id/likes', (req, res) => {
  const games = db.read('games').filter(g => g.likes.includes(req.params.id));
  res.json(games);
});

// GET /users/:id/comments
router.get('/:id/comments', (req, res) => {
  const comments = db.read('comments').filter(c => c.userId === req.params.id);
  res.json(comments);
});

module.exports = router;
