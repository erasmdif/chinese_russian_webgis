import { buildPlaceRows } from '../data/normalize.js';

function iconForCountry(country, icons) {
  const normalized = String(country ?? '').trim().toLowerCase();
  if (normalized.includes('russia')) {
    return icons.russia;
  }
  if (normalized.includes('china')) {
    return icons.china;
  }
  return icons.fallback;
}

function createPlaceIcon(feature, icons) {
  const props = feature.properties ?? {};
  const iconPath = iconForCountry(props.country, icons);

  return L.divIcon({
    className: '',
    iconSize: [52, 52],
    iconAnchor: [26, 26],
    popupAnchor: [0, -24],
    html: `
      <div class="place-marker">
        <span class="place-marker__pulse"></span>
        <span class="place-marker__icon"><img src="${iconPath}" alt=""></span>
        <span class="place-marker__badge">${props.order ?? ''}</span>
      </div>
    `,
  });
}

function createClusterIcon(cluster) {
  const count = cluster.getChildCount();
  return L.divIcon({
    className: '',
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    html: `
      <div class="place-cluster">
        <span class="place-cluster__ring"></span>
        <span class="place-cluster__count">${count}</span>
      </div>
    `,
  });
}

function createMarkersContainer(clusterConfig = {}) {
  if (clusterConfig.enabled !== false && typeof L.markerClusterGroup === 'function') {
    return L.markerClusterGroup({
      maxClusterRadius: clusterConfig.maxClusterRadius ?? 32,
      disableClusteringAtZoom: clusterConfig.disableClusteringAtZoom ?? 7,
      spiderfyOnMaxZoom: clusterConfig.spiderfyOnMaxZoom !== false,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      removeOutsideVisibleBounds: true,
      animate: true,
      iconCreateFunction: createClusterIcon,
      clusterPane: 'markers',
      spiderLegPolylineOptions: {
        color: '#ffffff',
        weight: 1.5,
        opacity: 0.55,
      },
    });
  }

  return L.layerGroup();
}

export function createPlacesLayers(rawGeoJson, modal, icons, routeStyle, clusterConfig = {}) {
  const features = [...(rawGeoJson?.features ?? [])].sort((a, b) => {
    const left = Number(a.properties?.order ?? 0);
    const right = Number(b.properties?.order ?? 0);
    return left - right;
  });

  const markers = createMarkersContainer(clusterConfig);
  const routeCoordinates = [];

  for (const feature of features) {
    const coords = feature?.geometry?.coordinates;
    if (!Array.isArray(coords) || coords.length < 2) {
      continue;
    }

    const [lon, lat] = coords;
    routeCoordinates.push([lat, lon]);

    const marker = L.marker([lat, lon], {
      icon: createPlaceIcon(feature, icons),
      pane: 'markers',
      title: feature.properties?.name_modern || feature.properties?.name_input || 'Luogo',
    });

    marker.bindTooltip(feature.properties?.name_modern || 'Luogo', {
      direction: 'top',
      className: 'feature-tooltip',
      opacity: 0.95,
      offset: [0, -18],
    });

    marker.on('click', () => {
      modal.open({
        kicker: 'Tappa missionaria',
        title: feature.properties?.name_modern || 'Luogo',
        subtitle: feature.properties?.notes || 'Punto derivato dal layer places.',
        sections: [{ title: 'Dettagli', rows: buildPlaceRows(feature) }],
      });
    });

    markers.addLayer(marker);
  }

  const route = L.layerGroup();
  if (routeCoordinates.length >= 2) {
    route.addLayer(L.polyline(routeCoordinates, { ...routeStyle.glow, pane: 'route' }));
    route.addLayer(L.polyline(routeCoordinates, { ...routeStyle.main, pane: 'route' }));
  }

  return {
    markers,
    route,
    orderedFeatures: features,
  };
}
