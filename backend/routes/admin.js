const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAdmin } = require('../middleware/auth');

function safeUser(user) {
  const { password, ...u } = user;
  return u;
}

// GET /admin/users
router.get('/users', requireAdmin, (req, res) => {
  const users = db.read('users').map(safeUser);
  res.json(users);
});

// GET /admin/users/:id
router.get('/users/:id', requireAdmin, (req, res) => {
  const users = db.read('users');
  const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(safeUser(user));
});

// PUT /admin/users/:id/ban
router.put('/users/:id/ban', requireAdmin, (req, res) => {
  const users = db.read('users');
  const idx = users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });
  users[idx].banned = !users[idx].banned;
  db.write('users', users);
  res.json(safeUser(users[idx]));
});

// PUT /admin/users/:id/mute
router.put('/users/:id/mute', requireAdmin, (req, res) => {
  const users = db.read('users');
  const idx = users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });
  users[idx].muted = !users[idx].muted;
  db.write('users', users);
  res.json(safeUser(users[idx]));
});

// DELETE /admin/users/:id
router.delete('/users/:id', requireAdmin, (req, res) => {
  const users = db.read('users');
  if (!users.find(u => u.id === req.params.id)) return res.status(404).json({ error: 'User not found' });

  db.write('users', users.filter(u => u.id !== req.params.id));

  const games = db.read('games');
  const userGameIds = games.filter(g => g.authorId === req.params.id).map(g => g.id);
  db.write('games', games.filter(g => g.authorId !== req.params.id));

  const comments = db.read('comments');
  db.write('comments', comments.filter(c => c.userId !== req.params.id && !userGameIds.includes(c.gameId)));

  res.json({ success: true });
});

// GET /admin/games
router.get('/games', requireAdmin, (req, res) => {
  const games = db.read('games');
  const comments = db.read('comments');
  const result = games.map(g => ({
    ...g,
    commentCount: comments.filter(c => c.gameId === g.id).length
  }));
  res.json(result);
});

// PUT /admin/games/:id
router.put('/games/:id', requireAdmin, (req, res) => {
  const games = db.read('games');
  const idx = games.findIndex(g => g.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Game not found' });

  const { name, description, categories } = req.body;
  games[idx] = {
    ...games[idx],
    name: name || games[idx].name,
    description: description || games[idx].description,
    categories: categories || games[idx].categories,
    updatedAt: new Date().toISOString()
  };

  db.write('games', games);
  res.json(games[idx]);
});

// DELETE /admin/games/:id
router.delete('/games/:id', requireAdmin, (req, res) => {
  const games = db.read('games');
  if (!games.find(g => g.id === req.params.id)) return res.status(404).json({ error: 'Game not found' });
  db.write('games', games.filter(g => g.id !== req.params.id));
  const comments = db.read('comments');
  db.write('comments', comments.filter(c => c.gameId !== req.params.id));
  res.json({ success: true });
});

// DELETE /admin/comments/:id
router.delete('/comments/:id', requireAdmin, (req, res) => {
  const comments = db.read('comments');
  if (!comments.find(c => c.id === req.params.id)) return res.status(404).json({ error: 'Comment not found' });
  db.write('comments', comments.filter(c => c.id !== req.params.id));
  res.json({ success: true });
});

module.exports = router;
