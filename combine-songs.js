const fs = require('fs');
const path = require('path');

const songsDir = path.join(__dirname, 'songs');
const outputFile = path.join(__dirname, 'songs-data.json');

const songFiles = fs.readdirSync(songsDir).filter(file => file.endsWith('.js') && file !== 'example.js' );

const songs = songFiles.map(file => {
  const songPath = path.join(songsDir, file);
  return require(songPath); // Imports the song object
});

fs.writeFileSync(outputFile, JSON.stringify(songs, null, 2), 'utf-8');
console.log(`✅ Combined ${songs.length} songs into songs-data.json`);

// node combine-songs.js