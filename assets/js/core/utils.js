export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function formatLabel(rawKey) {
  return String(rawKey)
    .replaceAll('_', ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();
}

export function firstNonEmpty(props = {}, keys = []) {
  for (const key of keys) {
    const value = props[key];
    if (value !== null && value !== undefined && value !== '') {
      return value;
    }
  }
  return null;
}

export function safeFeatureCollection(features = []) {
  return { type: 'FeatureCollection', features };
}

export function humanNumber(value, options = {}) {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  if (typeof value === 'number') {
    return new Intl.NumberFormat('it-IT', options).format(value);
  }

  const numeric = Number(value);
  if (!Number.isNaN(numeric) && `${value}`.trim() !== '') {
    return new Intl.NumberFormat('it-IT', options).format(numeric);
  }

  return String(value);
}

export function createUnionBounds(boundsList = []) {
  if (!boundsList.length) {
    return null;
  }

  const master = L.latLngBounds(boundsList[0]);

  for (const bounds of boundsList.slice(1)) {
    master.extend(bounds);
  }

  return master.isValid() ? master : null;
}
