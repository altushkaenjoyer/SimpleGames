const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const DB = path.join(__dirname, 'db');

function write(name, data) {
  fs.writeFileSync(path.join(DB, `${name}.json`), JSON.stringify(data, null, 2));
}

async function seed() {
  // Admin user
  const adminId = uuidv4();
  const password = await bcrypt.hash('admin123', 10);

  const users = [
    {
      id: adminId,
      username: 'admin',
      email: 'admin@portal.com',
      password,
      role: 'admin',
      banned: false,
      muted: false,
      createdAt: new Date().toISOString(),
    },
  ];

  // Games
  const games = [
    {
      id: uuidv4(),
      name: 'Cookie Clicker',
      description: 'Click the cookie to earn cookies. Buy upgrades to get more cookies automatically. A classic idle clicker game!',
      categories: ['Idle', 'Clicker'],
      icon: null,
      htmlFile: '/uploads/games/clicker.html',
      authorId: adminId,
      likes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      name: 'Snake',
      description: 'Classic snake game. Control the snake with arrow keys or WASD, eat food to grow longer. Don\'t hit the walls!',
      categories: ['Arcade', 'Classic'],
      icon: null,
      htmlFile: '/uploads/games/snake.html',
      authorId: adminId,
      likes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      name: 'Tic Tac Toe',
      description: 'Classic 2-player Tic Tac Toe. Play against a friend locally. Tracks wins, losses, and draws!',
      categories: ['Puzzle', '2 Player'],
      icon: null,
      htmlFile: '/uploads/games/tictactoe.html',
      authorId: adminId,
      likes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  write('users', users);
  write('games', games);
  write('comments', []);

  console.log('Seeded!');
  console.log('Admin login: admin@portal.com / admin123');
}

seed();
