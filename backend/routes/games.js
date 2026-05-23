const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AdmZip = require('adm-zip');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { requireAuth, optionalAuth } = require('../middleware/auth');

function extractZip(zipPath, destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  const zip = new AdmZip(zipPath);
  zip.extractAllTo(destDir, true);
  fs.unlinkSync(zipPath);
}

function findIndexHtml(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isFile() && entry.name.toLowerCase() === 'index.html') {
      return path.join(dir, entry.name);
    }
  }
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const found = findIndexHtml(path.join(dir, entry.name));
      if (found) return found;
    }
  }
  return null;
}

function parseCategories(categories) {
  if (!categories) return [];
  if (Array.isArray(categories)) return categories;
  return categories.split(',').map(c => c.trim()).filter(Boolean);
}

function isOwnerOrAdmin(resource, userId, userRole) {
  return resource.authorId === userId || userRole === 'admin';
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = file.fieldname === 'icon'
      ? path.join(__dirname, '../uploads/icons')
      : path.join(__dirname, '../uploads/games');
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

// GET /games
router.get('/', (req, res) => {
  const games = db.read('games');
  const comments = db.read('comments');
  const result = games.map(g => ({
    ...g,
    commentCount: comments.filter(c => c.gameId === g.id).length
  }));
  res.json(result);
});

// GET /games/:id
router.get('/:id', optionalAuth, (req, res) => {
  const games = db.read('games');
  const game = games.find(g => g.id === req.params.id);
  if (!game) return res.status(404).json({ error: 'Game not found' });

  const comments = db.read('comments');
  const users = db.read('users');
  const commentsWithUsers = comments
    .filter(c => c.gameId === game.id)
    .map(c => {
      const user = users.find(u => u.id === c.userId);
      return { ...c, username: user?.username || 'Unknown' };
    });

  res.json({ ...game, comments: commentsWithUsers });
});

// POST /games
router.post('/', requireAuth, upload.fields([{ name: 'icon', maxCount: 1 }, { name: 'html', maxCount: 1 }]), (req, res) => {
  const { name, description, categories } = req.body;
  if (!name || !description) return res.status(400).json({ error: 'Name and description required' });
  if (!req.files?.html) return res.status(400).json({ error: 'HTML or ZIP file required' });

  const uploadedFile = req.files.html[0];
  const ext = path.extname(uploadedFile.originalname).toLowerCase();
  let htmlFile;

  if (ext === '.zip') {
    const gameId = uuidv4();
    const destDir = path.join(__dirname, '../uploads/games', gameId);
    extractZip(uploadedFile.path, destDir);
    const indexPath = findIndexHtml(destDir);
    if (!indexPath) return res.status(400).json({ error: 'index.html не найден в ZIP архиве' });
    const relative = path.relative(path.join(__dirname, '../'), indexPath).replace(/\\/g, '/');
    htmlFile = `/${relative}`;
  } else {
    htmlFile = `/uploads/games/${uploadedFile.filename}`;
  }

  const game = {
    id: uuidv4(),
    name,
    description,
    categories: parseCategories(categories),
    icon: req.files?.icon ? `/uploads/icons/${req.files.icon[0].filename}` : null,
    htmlFile,
    authorId: req.user.id,
    likes: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const games = db.read('games');
  games.push(game);
  db.write('games', games);
  res.status(201).json(game);
});

// PUT /games/:id
router.put('/:id', requireAuth, upload.fields([{ name: 'icon', maxCount: 1 }, { name: 'html', maxCount: 1 }]), (req, res) => {
  const games = db.read('games');
  const idx = games.findIndex(g => g.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Game not found' });

  const game = games[idx];
  if (!isOwnerOrAdmin(game, req.user.id, req.user.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { name, description, categories } = req.body;
  games[idx] = {
    ...game,
    name: name || game.name,
    description: description || game.description,
    categories: categories ? parseCategories(categories) : game.categories,
    icon: req.files?.icon ? `/uploads/icons/${req.files.icon[0].filename}` : game.icon,
    htmlFile: req.files?.html ? `/uploads/games/${req.files.html[0].filename}` : game.htmlFile,
    updatedAt: new Date().toISOString()
  };

  db.write('games', games);
  res.json(games[idx]);
});

// DELETE /games/:id
router.delete('/:id', requireAuth, (req, res) => {
  const games = db.read('games');
  const game = games.find(g => g.id === req.params.id);
  if (!game) return res.status(404).json({ error: 'Game not found' });

  if (!isOwnerOrAdmin(game, req.user.id, req.user.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  db.write('games', games.filter(g => g.id !== req.params.id));
  const comments = db.read('comments');
  db.write('comments', comments.filter(c => c.gameId !== req.params.id));
  res.json({ success: true });
});

// POST /games/:id/like  (toggle)
router.post('/:id/like', requireAuth, (req, res) => {
  const games = db.read('games');
  const idx = games.findIndex(g => g.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Game not found' });

  const liked = games[idx].likes.includes(req.user.id);
  if (liked) {
    games[idx].likes = games[idx].likes.filter(id => id !== req.user.id);
  } else {
    games[idx].likes.push(req.user.id);
  }

  db.write('games', games);
  res.json({ likes: games[idx].likes.length, liked: !liked });
});

// POST /games/:id/comments
router.post('/:id/comments', requireAuth, (req, res) => {
  const users = db.read('users');
  const user = users.find(u => u.id === req.user.id);
  if (user?.muted) return res.status(403).json({ error: 'You are muted' });

  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Text required' });

  const games = db.read('games');
  if (!games.find(g => g.id === req.params.id)) return res.status(404).json({ error: 'Game not found' });

  const comment = {
    id: uuidv4(),
    gameId: req.params.id,
    userId: req.user.id,
    text,
    createdAt: new Date().toISOString()
  };

  const comments = db.read('comments');
  comments.push(comment);
  db.write('comments', comments);

  res.status(201).json({ ...comment, username: user?.username });
});

module.exports = router;
