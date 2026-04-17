import { buildRouteRows } from '../data/normalize.js';

function normalizeType(value) {
  return String(value ?? '').trim().toLowerCase();
}

function routeTheme(type, config) {
  if (type === 'fluvial') {
    return config.fluvial;
  }
  if (type === 'road') {
    return config.road;
  }
  return config.other;
}

function routeTitle(feature) {
  const props = feature?.properties ?? {};
  return props.descrizione || props.description || 'Tratto di percorso';
}

function routeTooltipHtml(feature) {
  const props = feature?.properties ?? {};
  const type = props.type ?? '—';
  const length = props.lenght_km ?? props.length_km ?? '—';
  const description = props.descrizione ?? props.description ?? '—';

  return `
    <div class="route-tooltip__inner">
      <div><strong>Tipo:</strong> ${type}</div>
      <div><strong>Lunghezza:</strong> ${length} km</div>
      <div><strong>Descrizione:</strong> ${description}</div>
    </div>
  `;
}

function shipMarkerHtml(iconPath, rotation) {
  return `
    <div class="ship-marker" style="transform: rotate(${rotation}deg);">
      <img src="${iconPath}" alt="">
    </div>
  `;
}

function buildShipMarkers(lineFeature, config, iconPath) {
  const style = config.fluvial;
  const spacingKm = style.shipSpacingKm ?? 360;
  const layers = [];

  const segmentFeatures = turf.flatten(lineFeature)?.features ?? [lineFeature];

  for (const segment of segmentFeatures) {
    const totalKm = turf.length(segment, { units: 'kilometers' });
    if (!Number.isFinite(totalKm) || totalKm <= 0) {
      continue;
    }

    const placements = [];
    if (totalKm <= spacingKm) {
      placements.push(totalKm / 2);
    } else {
      for (let dist = spacingKm / 2; dist < totalKm; dist += spacingKm) {
        placements.push(dist);
      }
    }

    for (const dist of placements) {
      const point = turf.along(segment, dist, { units: 'kilometers' });
      const next = turf.along(segment, Math.min(dist + Math.min(15, totalKm / 8), totalKm), {
        units: 'kilometers',
      });
      const [lon, lat] = point.geometry.coordinates;
      const bearing = turf.bearing(point, next);

      layers.push(
        L.marker([lat, lon], {
          interactive: false,
          keyboard: false,
          pane: 'routeSymbols',
          icon: L.divIcon({
            className: '',
            iconSize: [22, 22],
            iconAnchor: [11, 11],
            html: shipMarkerHtml(iconPath, bearing),
          }),
        })
      );
    }
  }

  return layers;
}

export function createMissionaryPathLayer(rawGeoJson, modal, config, iconPath, map = null) {
  const renderer = map?.appRenderers?.route;

  const casing = L.geoJSON(rawGeoJson, {
    interactive: false,
    pane: 'route',
    renderer,
    smoothFactor: 1.1,
    style(feature) {
      return routeTheme(normalizeType(feature?.properties?.type), config).casing;
    },
  });

  const main = L.geoJSON(rawGeoJson, {
    interactive: true,
    bubblingMouseEvents: false,
    pane: 'route',
    renderer,
    smoothFactor: 1.1,
    style(feature) {
      return routeTheme(normalizeType(feature?.properties?.type), config).line;
    },
    onEachFeature(feature, layer) {
      layer.bindTooltip(routeTooltipHtml(feature), {
        direction: 'top',
        sticky: true,
        opacity: 0.97,
        className: 'route-tooltip',
        maxWidth: config.tooltipMaxWidth ?? 340,
      });

      layer.on('click', (event) => {
        L.DomEvent.stopPropagation(event);
        modal.open({
          kicker: 'Percorso missionario',
          title: routeTitle(feature),
          subtitle: `Tratto classificato come ${feature?.properties?.type ?? 'non specificato'}.`,
          sections: [{ title: 'Dettagli', rows: buildRouteRows(feature) }],
        });
      });
    },
  });

  const shipMarkers = [];
  for (const feature of rawGeoJson?.features ?? []) {
    if (normalizeType(feature?.properties?.type) === 'fluvial') {
      shipMarkers.push(...buildShipMarkers(feature, config, iconPath));
    }
  }

  return L.layerGroup([casing, main, L.layerGroup(shipMarkers)]);
}

export function createRiversLayer(rawGeoJson, style, map = null) {
  return L.geoJSON(rawGeoJson, {
    interactive: false,
    pane: 'rivers',
    renderer: map?.appRenderers?.rivers,
    smoothFactor: 1.1,
    style: () => style,
  });
}
