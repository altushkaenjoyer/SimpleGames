const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

// PUT /comments/:id
router.put('/:id', requireAuth, (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ error: 'Text is required' });

  const comments = db.read('comments');
  const idx = comments.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Comment not found' });

  if (comments[idx].userId !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  comments[idx] = { ...comments[idx], text: text.trim() };
  db.write('comments', comments);
  res.json(comments[idx]);
});

// DELETE /comments/:id
router.delete('/:id', requireAuth, (req, res) => {
  const comments = db.read('comments');
  const comment = comments.find(c => c.id === req.params.id);
  if (!comment) return res.status(404).json({ error: 'Comment not found' });

  if (comment.userId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  db.write('comments', comments.filter(c => c.id !== req.params.id));
  res.json({ success: true });
});

module.exports = router;
