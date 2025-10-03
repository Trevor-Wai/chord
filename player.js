const chords = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const flatToSharp = { 'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#', 'Cb': 'B', 'Fb': 'E' };
const sharpToFlat = { 'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb' };

let currentShift = 0;
const sharpBtn = document.getElementById('toggle-notation');
let transposedLines = [];


function loadAndRenderSong() {
  const params = new URLSearchParams(window.location.search);
  const selectedSong = params.get("song");

  fetch("songs-data.json")
    .then(res => res.json())
    .then(data => {
      const songData = data.find(s => s.title === selectedSong);
      if (!songData) {
        document.body.innerHTML = "<h2>Song not found 😢</h2>";
        return;
      }

      document.title = songData.title;
      document.getElementById("song-title").textContent = songData.title;

      baseKey = flatToSharp[songData.baseKey] || songData.baseKey;
      targetKey = baseKey;
      originalSong = songData.lyrics;
      useFlats = flatToSharp[songData.baseKey] ? true : false;
      sharpBtn.textContent = useFlats ? 'Show Sharps' : 'Show Flats';

      renderKeyButtons();
      renderShiftButtons();
      transposeAndDisplay(0);
    });
}

function transposeChordLine(line, shift) {
  return line.replace(/([A-G](?:#|b)?)([a-z0-9()\/#+\-]*)/g, (match, root, suffix) => {
    suffix = suffix.replace('b', '♭');
    const normalizedRoot = flatToSharp[root] || root;
    const index = chords.indexOf(normalizedRoot);
    if (index === -1) return match;
    let newChord = chords[(index + shift + 12) % 12];
    if (useFlats && sharpToFlat[newChord]) newChord = sharpToFlat[newChord].replace('b', '♭');
    return `<span class="chord">${newChord + suffix}</span>`;
  });
}

function transposeAndDisplay(additionalShift) {
  const shiftFromBase = (chords.indexOf(targetKey) - chords.indexOf(baseKey) + 12) % 12;
  const totalShift = (shiftFromBase + parseInt(additionalShift)) % 12;

  const lines = originalSong.trim().split('\n');
  const transposed = lines.map((line, i) => {
    if (/^(Intro|Verse|Pre[- ]?Chorus|Chorus|Bridge|Coda|Outro|Music Break|Refrain)/i.test(line)) {
      return `<span class="section-header">${line.trim()}</span>`;
    } else if (i % 2 === 1) {
      return `<div class="chord-line">${transposeChordLine(line.trim(), totalShift)}</div>`;
    } else {
      return line;
    }
  });

  
  sliderValue = 100 - parseInt(document.getElementById("split-slider").value);
  // sliderValue = 100 - parseInt(document.getElementById("split-slider").value);
  splitIndex = Math.ceil(transposed.length * sliderValue / 100);

  document.getElementById("left-column").innerHTML = transposed.slice(0, splitIndex).join('\n');
  document.getElementById("right-column").innerHTML = transposed.slice(splitIndex).join('\n');
  // document.getElementById("song").innerHTML = transposed.join('\n');

  let displayKey = useFlats && sharpToFlat[targetKey] ? sharpToFlat[targetKey].replace('b', '♭') : targetKey;
  document.getElementById('song-title-label').textContent = `${document.title} (${displayKey}) | Capo: ${-currentShift}`;
}

function renderKeyButtons() {
  const el = document.getElementById("key-buttons");
  el.innerHTML = "";
  chords.forEach(key => {
    let displayKey = useFlats && sharpToFlat[key] ? sharpToFlat[key].replace('b', '♭') : key;
    const btn = document.createElement("button");
    btn.textContent = key === baseKey ? `${displayKey} (original)` : displayKey;
    btn.dataset.key = key;
    if (key === targetKey) btn.classList.add("selected");
    btn.onclick = () => {
      targetKey = key;
      currentShift = 0;
      renderKeyButtons();
      renderShiftButtons();
      transposeAndDisplay(currentShift);
    };
    el.appendChild(btn);
  });
}

function renderShiftButtons() {
  const el = document.getElementById("shift-buttons");
  el.innerHTML = "";
  const baseIndex = chords.indexOf(targetKey);
  for (let i = 0; i > -12; i--) {
    const btn = document.createElement("button");
    const key = chords[(baseIndex + i + 12) % 12];
    let label = useFlats && sharpToFlat[key] ? sharpToFlat[key].replace('b', '♭') : key;
    btn.textContent = `${-i} (${label})`;
    btn.dataset.shift = i;
    btn.onclick = () => {
      currentShift = i;
      renderShiftButtons();
      transposeAndDisplay(i);
    };
    if (i === currentShift) btn.classList.add("selected");
    el.appendChild(btn);
  }
}


document.addEventListener("DOMContentLoaded", () => {
  loadAndRenderSong();

  document.getElementById("split-slider").addEventListener("input", () => {
    document.getElementById("slider-value").textContent = document.getElementById("split-slider").value + "%";
    transposeAndDisplay(currentShift);
  });

  sharpBtn.addEventListener("click", () => {
    useFlats = !useFlats;
    sharpBtn.textContent = useFlats ? 'Show Sharps' : 'Show Flats';
    renderKeyButtons();
    renderShiftButtons();
    transposeAndDisplay(currentShift);
  });

});

document.addEventListener('keydown', e => {
  const keyIndex = chords.indexOf(targetKey);
  const key = e.key.toLowerCase();
  const slider = document.getElementById("split-slider");
  const current = parseInt(slider.value, 10);

  if (key === 'w') {
    const newKey = chords[(keyIndex + 1) % chords.length];
    document.querySelector(`[data-key='${newKey}']`)?.click();
  } else if (key === 's') {
    const newKey = chords[(keyIndex - 1 + chords.length) % chords.length];
    document.querySelector(`[data-key='${newKey}']`)?.click();
  } else if (key === 'a') {
    slider.value = current > 0 ? current - 5 : 0;
    slider.dispatchEvent(new Event('input'));
  } else if (key === 'd') {
    slider.value = current < 100 ? current + 5 : 100;
    slider.dispatchEvent(new Event('input'));
  } else if (key === 'enter') {
    sharpBtn.click();
  }
});
