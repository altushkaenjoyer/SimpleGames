const fs = require('fs');
const path = require('path');

function read(collection) {
  const file = path.join(__dirname, `${collection}.json`);
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return [];
  }
}

function write(collection, data) {
  const file = path.join(__dirname, `${collection}.json`);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

module.exports = { read, write };
