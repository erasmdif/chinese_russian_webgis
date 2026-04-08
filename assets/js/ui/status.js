export function showLoading(isVisible) {
  const overlay = document.getElementById('loading-overlay');
  overlay.classList.toggle('is-visible', Boolean(isVisible));
}

export function showNote(message = '') {
  const note = document.getElementById('map-note');
  if (!message) {
    note.hidden = true;
    note.textContent = '';
    return;
  }

  note.hidden = false;
  note.textContent = message;
}
