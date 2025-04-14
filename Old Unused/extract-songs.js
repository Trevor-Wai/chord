// extract-songs.js
const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, 'html-songs');   // Folder with your old HTML files
const outputDir = path.join(__dirname, 'songs');        // Output folder for JS song modules

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

const htmlFiles = fs.readdirSync(inputDir).filter(file => file.endsWith('.html'));

htmlFiles.forEach(file => {
  const content = fs.readFileSync(path.join(inputDir, file), 'utf-8');

  const titleMatch = content.match(/let\s+songTitle\s*=\s*['"]([^'"]+)['"]/);
  const keyMatch = content.match(/let\s+baseKey\s*=\s*['"]([^'"]+)['"]/);
  const lyricsMatch = content.match(/const\s+originalSong\s*=\s*`([\s\S]*?)`;/);

  if (!titleMatch || !keyMatch || !lyricsMatch) {
    console.warn(`⚠️ Skipping ${file} (missing songTitle/baseKey/originalSong)`);
    return;
  }

  const title = titleMatch[1];
  const baseKey = keyMatch[1];
  const lyrics = lyricsMatch[1].trim();

  const output = `
module.exports = {
  title: "${title}",
  baseKey: "${baseKey}",
  lyrics: \`
${lyrics}
\`.trim()
};
`.trim();

  const safeFilename = title.replace(/[\\/:*?"<>|]/g, '_') + '.js';
  fs.writeFileSync(path.join(outputDir, safeFilename), output, 'utf-8');
  console.log(`✅ Extracted: ${title}`);
});
