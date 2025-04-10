const chords = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const flatToSharp = { 'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#', 'Cb': 'B', 'Fb': 'E' };
const sharpToFlat = { 'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb' };

document.title = songTitle;
document.getElementById('song-title').textContent = songTitle;

let targetKey = baseKey; 
let lastTargetKey = targetKey;
let currentShift = 0;
let useFlats = flatToSharp[baseKey] ? true : false;
let shouldClickSelected = false;

baseKey = flatToSharp[baseKey] || baseKey;
targetKey = flatToSharp[targetKey] || targetKey;



const songEl = document.getElementById('song');
const keyButtonsEl = document.getElementById('key-buttons');
const shiftButtonsEl = document.getElementById('shift-buttons');
const toggleBtn = document.getElementById('toggle-notation');

function getSemitoneShift(fromKey, toKey) {
  const fromIndex = chords.indexOf(fromKey);
  const toIndex = chords.indexOf(toKey);
  return (toIndex - fromIndex + 12) % 12;
}

function renderShiftButtons() {
  shiftButtonsEl.innerHTML = '';
  const baseIndex = chords.indexOf(targetKey);

  for (let i = 0; i > -12; i--) {
    const btn = document.createElement('button');
    const sharpKey = chords[(baseIndex + i + 12) % 12];
    const displayKey = useFlats && sharpToFlat[sharpKey] ? sharpToFlat[sharpKey] : sharpKey;

    btn.textContent = `${-i} (${displayKey})`;
    btn.dataset.shift = i;

    btn.onclick = () => {
      document.querySelectorAll('#shift-buttons button').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      currentShift = i;
      transposeAndDisplay(i);
    };

    if (i == currentShift) btn.classList.add('selected');
    shiftButtonsEl.appendChild(btn);
  }

  if (shouldClickSelected) {
    transposeAndDisplay(currentShift);
  }
}

function renderKeyButtons() {
  keyButtonsEl.innerHTML = '';
  chords.forEach(sharpKey => {
    const btn = document.createElement('button');
    const displayKey = useFlats && sharpToFlat[sharpKey] ? sharpToFlat[sharpKey] : sharpKey;

    const isBase = sharpKey === baseKey;
    const isTarget = sharpKey === targetKey;

    btn.textContent = isBase ? `${displayKey} (original)` : displayKey;
    btn.dataset.key = sharpKey;

    if (isTarget) {
      btn.classList.add('selected');
      if (shouldClickSelected) {
        setTimeout(() => btn.click(), 0);
      }
    }

    btn.onclick = () => {
      document.querySelectorAll('#key-buttons button').forEach(b => {
        const k = b.dataset.key;
        const label = useFlats && sharpToFlat[k] ? sharpToFlat[k] : k;
        b.classList.remove('selected');
        b.textContent = k === baseKey ? `${label} (original)` : label;
      });

      const previouslySelectedKey = targetKey;
      targetKey = sharpKey;

      if (targetKey !== previouslySelectedKey) {
        currentShift = 0;
      }

      lastTargetKey = targetKey;

      btn.classList.add('selected');
      btn.textContent = sharpKey === baseKey ? `${displayKey} (original)` : displayKey;

      transposeAndDisplay(currentShift);
      renderShiftButtons();
    };

    keyButtonsEl.appendChild(btn);
  });

  shouldClickSelected = false;
}

function transposeChordLine(line, transposeAmount) {
  return line.replace(/([A-G](?:#|b)?)([a-z0-9()\/#\+\-]*)/g, (match, root, suffix) => {
    suffix = suffix || "";
    const usedFlat = root.includes('b');
    const normalizedRoot = flatToSharp[root] || root;
    const rootIndex = chords.indexOf(normalizedRoot);
    if (rootIndex === -1) return match;
    const newIndex = (rootIndex + transposeAmount + chords.length) % chords.length;
    let newRoot = chords[newIndex];
    if (useFlats && sharpToFlat[newRoot]) newRoot = sharpToFlat[newRoot];

    const safeChord = (newRoot + suffix)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

    return `<span class="chord">${safeChord}</span>`;
  });
}

function transposeAndDisplay(additionalShift) {
  const shiftFromBase = getSemitoneShift(baseKey, targetKey);
  const totalShift = (shiftFromBase + parseInt(additionalShift)) % 12;

  const lines = originalSong.trim().split('\n');
  const transposed = [];

  const sectionHeaderPattern = /^(Intro|Verse|Pre[- ]?Chorus|Chorus|Bridge|Coda|Music Break|Outro|Refrain)\b/i;


  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmedLine = rawLine.trim();

    let processedLine = '';

    if (sectionHeaderPattern.test(trimmedLine)) {
      processedLine = `<span class="section-header">${trimmedLine}</span>`;
    } else if (i % 2 === 0) {
      processedLine = trimmedLine;
    } else {
      processedLine = transposeChordLine(trimmedLine, totalShift);
    }

    // 🔧 Convert leading spaces to non-breaking spaces (&nbsp;)
    const leadingSpaces = rawLine.match(/^ */)?.[0] || '';
    const nbsp = '&nbsp;'.repeat(leadingSpaces.length);

    transposed.push(nbsp + processedLine);
  }

  songEl.innerHTML = transposed.join('\n');
  const statusLabel = document.getElementById('song-title-label');
  const displayKey = useFlats && sharpToFlat[targetKey] ? sharpToFlat[targetKey] : targetKey;
  const label = `${songTitle} (${displayKey}) | Capo: ${-currentShift}`;
  statusLabel.textContent = label;
}

toggleBtn.onclick = () => {
  useFlats = !useFlats;
  toggleBtn.textContent = useFlats ? 'Show Sharps' : 'Show Flats';
  shouldClickSelected = true;
  renderKeyButtons();
};

document.addEventListener('keydown', e => {
  const keyIndex = chords.indexOf(targetKey);
  const key = e.key.toLowerCase(); // make it case-insensitive

  if (e.key === 'ArrowLeft' || key === 'a') {
    const newKey = chords[(keyIndex - 1 + chords.length) % chords.length];
    document.querySelector(`[data-key='${newKey}']`)?.click();
  }
  else if (e.key === 'ArrowRight' || key === 'd') {
    const newKey = chords[(keyIndex + 1) % chords.length];
    document.querySelector(`[data-key='${newKey}']`)?.click();
  }
  else if (e.key === 'ArrowUp' || key === 'w') {
    currentShift = currentShift > -11 ? currentShift - 1 : 0;
    document.querySelector(`[data-shift='${currentShift}']`)?.click();
  }
  else if (e.key === 'ArrowDown' || key === 's') {
    currentShift = currentShift < 0 ? currentShift + 1 : -11;
    document.querySelector(`[data-shift='${currentShift}']`)?.click();
  }
  else if (e.key === 'ArrowDown' || key === 's') {
    currentShift = currentShift < 0 ? currentShift + 1 : -11;
    document.querySelector(`[data-shift='${currentShift}']`)?.click();
  }
  else if (key === 'enter') {
    toggleBtn.click();
  }
});


renderKeyButtons();
renderShiftButtons();
transposeAndDisplay(0);