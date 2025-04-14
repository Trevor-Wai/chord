const fs = require('fs');
const path = require('path');

const songsDir = path.join(__dirname, 'songs');
const outputFile = path.join(__dirname, 'songs-data.json');

const files = fs.readdirSync(songsDir).filter(file => file.endsWith('.js') && file !== 'example.js');

const songs = files.map(file => {
  const song = require(path.join(songsDir, file));
  return {
    title: song.title,
    baseKey: song.baseKey,
    lyrics: song.lyrics.trim()
  };
});

fs.writeFileSync(outputFile, JSON.stringify(songs, null, 2), 'utf-8');

console.log(`✅ Combined ${songs.length} songs into songs-data.json`);
