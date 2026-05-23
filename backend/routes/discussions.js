const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { requireAuth, optionalAuth } = require('../middleware/auth');

function withUsername(obj, users) {
  const user = users.find(u => u.id === obj.userId);
  return { ...obj, username: user?.username || 'Unknown' };
}

// GET /discussions  — список обсуждений, ?gameId= для фильтра
router.get('/', (req, res) => {
  const { gameId } = req.query;
  let discussions = db.read('discussions');
  if (gameId) discussions = discussions.filter(d => d.gameId === gameId);

  const users = db.read('users');
  const replies = db.read('replies');
  const games = db.read('games');

  const result = discussions
    .map(d => ({
      ...withUsername(d, users),
      replyCount: replies.filter(r => r.discussionId === d.id).length,
      gameName: games.find(g => g.id === d.gameId)?.name || '',
    }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json(result);
});

// GET /discussions/:id  — одно обсуждение + ответы
router.get('/:id', optionalAuth, (req, res) => {
  const discussions = db.read('discussions');
  const d = discussions.find(d => d.id === req.params.id);
  if (!d) return res.status(404).json({ error: 'Not found' });

  const users = db.read('users');
  const replies = db.read('replies')
    .filter(r => r.discussionId === d.id)
    .map(r => withUsername(r, users))
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const games = db.read('games');
  res.json({
    ...withUsername(d, users),
    gameName: games.find(g => g.id === d.gameId)?.name || '',
    replies,
  });
});

// POST /discussions  — создать обсуждение
router.post('/', requireAuth, (req, res) => {
  const users = db.read('users');
  const user = users.find(u => u.id === req.user.id);
  if (user?.muted) return res.status(403).json({ error: 'You are muted' });

  const { gameId, title, text } = req.body;
  if (!gameId || !title?.trim() || !text?.trim())
    return res.status(400).json({ error: 'gameId, title and text required' });

  const games = db.read('games');
  if (!games.find(g => g.id === gameId))
    return res.status(404).json({ error: 'Game not found' });

  const discussion = {
    id: uuidv4(),
    gameId,
    userId: req.user.id,
    title: title.trim(),
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };

  const discussions = db.read('discussions');
  discussions.push(discussion);
  db.write('discussions', discussions);
  res.status(201).json({ ...discussion, username: user?.username });
});

// DELETE /discussions/:id
router.delete('/:id', requireAuth, (req, res) => {
  const discussions = db.read('discussions');
  const d = discussions.find(d => d.id === req.params.id);
  if (!d) return res.status(404).json({ error: 'Not found' });
  if (d.userId !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ error: 'Forbidden' });

  db.write('discussions', discussions.filter(d => d.id !== req.params.id));
  const replies = db.read('replies');
  db.write('replies', replies.filter(r => r.discussionId !== req.params.id));
  res.json({ success: true });
});

// POST /discussions/:id/replies
router.post('/:id/replies', requireAuth, (req, res) => {
  const users = db.read('users');
  const user = users.find(u => u.id === req.user.id);
  if (user?.muted) return res.status(403).json({ error: 'You are muted' });

  const discussions = db.read('discussions');
  if (!discussions.find(d => d.id === req.params.id))
    return res.status(404).json({ error: 'Discussion not found' });

  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ error: 'Text required' });

  const reply = {
    id: uuidv4(),
    discussionId: req.params.id,
    userId: req.user.id,
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };

  const replies = db.read('replies');
  replies.push(reply);
  db.write('replies', replies);
  res.status(201).json({ ...reply, username: user?.username });
});

// DELETE /discussions/replies/:id
router.delete('/replies/:id', requireAuth, (req, res) => {
  const replies = db.read('replies');
  const r = replies.find(r => r.id === req.params.id);
  if (!r) return res.status(404).json({ error: 'Not found' });
  if (r.userId !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ error: 'Forbidden' });

  db.write('replies', replies.filter(r => r.id !== req.params.id));
  res.json({ success: true });
});

module.exports = router;
