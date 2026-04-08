import { escapeHtml } from '../core/utils.js';

function renderTable(rows = []) {
  if (!rows.length) {
    return '<p class="info-body">Nessun dato disponibile.</p>';
  }

  return `
    <table class="info-table">
      <tbody>
        ${rows
          .map(
            (row) => `
              <tr>
                <th>${escapeHtml(row.label)}</th>
                <td>${escapeHtml(row.value)}</td>
              </tr>
            `
          )
          .join('')}
      </tbody>
    </table>
  `;
}

export function createInfoModal() {
  const modal = document.getElementById('info-modal');
  const closeButton = document.getElementById('info-close');
  const backdrop = document.getElementById('info-backdrop');
  const kicker = document.getElementById('info-kicker');
  const title = document.getElementById('info-title');
  const subtitle = document.getElementById('info-subtitle');
  const content = document.getElementById('info-content');

  function close() {
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = 'hidden';
  }

  function open({ kicker: kickerText = '', title: titleText = '', subtitle: subtitleText = '', sections = [] }) {
    kicker.textContent = kickerText;
    title.textContent = titleText;
    subtitle.textContent = subtitleText;
    content.innerHTML = sections
      .map(
        (section) => `
          <section class="info-block">
            <h3>${escapeHtml(section.title || 'Dettagli')}</h3>
            ${section.rows ? renderTable(section.rows) : `<p class="info-body">${escapeHtml(section.html || '')}</p>`}
          </section>
        `
      )
      .join('');

    modal.setAttribute('aria-hidden', 'false');
  }

  closeButton.addEventListener('click', close);
  backdrop.addEventListener('click', close);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      close();
    }
  });

  return { open, close };
}
