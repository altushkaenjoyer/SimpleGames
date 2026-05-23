const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/auth', require('./routes/auth'));
app.use('/users', require('./routes/users'));
app.use('/games', require('./routes/games'));
app.use('/comments', require('./routes/comments'));
app.use('/admin', require('./routes/admin'));
app.use('/discussions', require('./routes/discussions'));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
