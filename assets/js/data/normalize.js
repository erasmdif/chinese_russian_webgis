import { firstNonEmpty, formatLabel, humanNumber } from '../core/utils.js';

function isMatchValue(value, target) {
  if (value === null || value === undefined) {
    return false;
  }

  return String(value).trim().toLowerCase() === String(target).trim().toLowerCase();
}

export function splitStateAndProvinces(rawGeoJson, stateName, titleCandidates = []) {
  const features = rawGeoJson?.features ?? [];
  let stateFeature = null;
  const provinces = [];

  for (const feature of features) {
    const props = feature.properties ?? {};
    const matchesState = Object.values(props).some((value) => isMatchValue(value, stateName));

    if (!stateFeature && matchesState) {
      stateFeature = feature;
      continue;
    }

    provinces.push(feature);
  }

  if (!stateFeature && features.length) {
    const fallback = features.find((feature) =>
      isMatchValue(firstNonEmpty(feature.properties ?? {}, titleCandidates), stateName)
    );
    if (fallback) {
      stateFeature = fallback;
      return {
        stateFeature,
        provinces: features.filter((feature) => feature !== fallback),
      };
    }
  }

  return { stateFeature, provinces };
}

export function getFeatureTitle(feature, countryConfig) {
  const props = feature?.properties ?? {};
  return firstNonEmpty(props, countryConfig.titleCandidates) || 'Senza titolo';
}

export function buildPropertyRows(feature, countryConfig, isState = false) {
  const props = feature?.properties ?? {};
  const preferred = countryConfig.includeProps ?? [];
  const rows = [];

  for (const key of preferred) {
    const value = props[key];
    if (value === null || value === undefined || value === '') {
      continue;
    }

    let rendered = value;
    if (/area/i.test(key)) {
      rendered = `${humanNumber(value)} km²`;
    }

    rows.push({
      label: countryConfig.labelMap?.[key] || formatLabel(key),
      value: rendered,
    });
  }

  if (!rows.length) {
    for (const [key, value] of Object.entries(props)) {
      if (value === null || value === undefined || value === '') {
        continue;
      }
      rows.push({ label: formatLabel(key), value });
      if (rows.length >= 10) {
        break;
      }
    }
  }

  if (isState) {
    rows.unshift({ label: 'Record', value: 'Poligono statale esterno' });
  }

  return rows;
}

export function buildPlaceRows(feature) {
  const props = feature?.properties ?? {};
  const [lon, lat] = feature?.geometry?.coordinates ?? [];

  return [
    { label: 'Ordine di arrivo', value: props.order ?? '—' },
    { label: 'Nome moderno', value: props.name_modern ?? '—' },
    { label: 'Nome locale', value: props.name_local ?? '—' },
    { label: 'Nome input', value: props.name_input ?? '—' },
    { label: 'Paese', value: props.country ?? '—' },
    { label: 'Query usata', value: props.query_used ?? '—' },
    {
      label: 'Coordinate',
      value: lon !== undefined && lat !== undefined ? `${lat.toFixed(4)}, ${lon.toFixed(4)}` : '—',
    },
  ].filter((row) => row.value !== null && row.value !== undefined && row.value !== '');
}

export function buildRouteRows(feature) {
  const props = feature?.properties ?? {};
  return [
    { label: 'Tipo', value: props.type ?? '—' },
    { label: 'Descrizione', value: props.descrizione ?? props.description ?? '—' },
    { label: 'Lunghezza', value: props.lenght_km ?? props.length_km ?? '—' },
  ].filter((row) => row.value !== null && row.value !== undefined && row.value !== '');
}

export function buildSecondaryPlaceRows(feature) {
  const props = feature?.properties ?? {};
  const [lon, lat] = feature?.geometry?.coordinates ?? [];

  return [
    { label: 'Nome antico', value: props.nome_antico ?? '—' },
    { label: 'Nome moderno', value: props.nome_moderno ?? '—' },
    { label: 'Nome originale', value: props.nome_originale ?? '—' },
    { label: 'Tipologia', value: props.tipologia ?? '—' },
    { label: 'Display name', value: props.display_name ?? '—' },
    { label: 'Match score', value: props.match_score ?? '—' },
    { label: 'Metodo geometria', value: props.geometry_method ?? '—' },
    { label: 'Query associata', value: props.matched_query ?? '—' },
    {
      label: 'Coordinate',
      value: lon !== undefined && lat !== undefined ? `${lat.toFixed(4)}, ${lon.toFixed(4)}` : '—',
    },
  ].filter((row) => row.value !== null && row.value !== undefined && row.value !== '');
}
