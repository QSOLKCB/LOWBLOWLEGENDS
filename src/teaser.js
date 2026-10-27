// Dialogue-only pre-production teaser; no actual match or combat rendering.
const quotes = [
  { speaker: 'SIR FLEXINGTON', line: 'Your problem is not your technique. It is your mindset. And possibly your trousers.' },
  { speaker: 'PROFESSOR FIST', line: 'Technically, that uppercut was statistically insignificant.' },
  { speaker: 'THE EXECUTIVE', line: 'My lawyers will be contacting your hitbox.' },
  { speaker: 'CAPTAIN CONSPIRACY', line: 'The referee is three pigeons in a coat. I HAVE EVIDENCE.' },
  { speaker: 'PATCH NOTES', line: 'Your spine has been deprecated. Please restart to apply changes.' },
  { speaker: 'AUNTIE MAYHEM', line: 'Language, dear. Now hold still while I rearrange your elbows.' },
  { speaker: 'UNKNOWN CONTENDER', line: 'Seventeen inputs for a finisher? Stuff that. One low kick.' },
];
let position = 0;
const button = document.querySelector('#next-psyche-out');
const speaker = document.querySelector('#quote-speaker');
const line = document.querySelector('#quote-line');
if (button && speaker && line) {
  button.addEventListener('click', () => {
    position = (position + 1) % quotes.length;
    speaker.textContent = quotes[position].speaker;
    line.textContent = quotes[position].line;
  });
}

