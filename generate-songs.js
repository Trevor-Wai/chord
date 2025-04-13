const fs = require('fs');
const path = require('path');

const files = fs.readdirSync('.');
const songs = [];

files.forEach(file => {
  if (
    file.endsWith('.html') &&
    file !== 'index.html' &&
    file !== 'old_example.html' &&
    file !== 'header.html' &&
    file !== 'example.html'
  ) {
    const title = path.basename(file, '.html');
    songs.push({ title, file });
  }
});

const output = `const songs = ${JSON.stringify(songs, null, 2)};`;
fs.writeFileSync('songs.js', output);

console.log('✅ songs.js updated with', songs.length, 'songs');
