import { buildPlaceRows, buildSecondaryPlaceRows } from '../data/normalize.js';

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
      maxClusterRadius: clusterConfig.maxClusterRadius ?? 20,
      disableClusteringAtZoom: clusterConfig.disableClusteringAtZoom ?? 7,
      spiderfyOnMaxZoom: clusterConfig.spiderfyOnMaxZoom !== false,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      removeOutsideVisibleBounds: true,
      animate: false,
      animateAddingMarkers: false,
      chunkedLoading: true,
      chunkInterval: 120,
      chunkDelay: 30,
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

export function createPlacesLayers(rawGeoJson, modal, icons, clusterConfig = {}) {
  const features = [...(rawGeoJson?.features ?? [])].sort((a, b) => {
    const left = Number(a.properties?.order ?? 0);
    const right = Number(b.properties?.order ?? 0);
    return left - right;
  });

  const markers = createMarkersContainer(clusterConfig);

  for (const feature of features) {
    const coords = feature?.geometry?.coordinates;
    if (!Array.isArray(coords) || coords.length < 2) {
      continue;
    }

    const [lon, lat] = coords;

    const marker = L.marker([lat, lon], {
      icon: createPlaceIcon(feature, icons),
      pane: 'markers',
      keyboard: true,
      riseOnHover: true,
      zIndexOffset: 1000,
      title: feature.properties?.name_modern || feature.properties?.name_input || 'Luogo',
    });

    marker.bindTooltip(feature.properties?.name_modern || 'Luogo', {
      direction: 'top',
      className: 'feature-tooltip',
      opacity: 0.95,
      offset: [0, -18],
      sticky: true,
    });

    marker.on('click', (event) => {
      L.DomEvent.stopPropagation(event);
      modal.open({
        kicker: 'Tappa missionaria',
        title: feature.properties?.name_modern || 'Luogo',
        subtitle: feature.properties?.notes || 'Punto derivato dal layer places.',
        sections: [{ title: 'Dettagli', rows: buildPlaceRows(feature) }],
      });
    });

    markers.addLayer(marker);
  }

  return {
    markers,
    orderedFeatures: features,
  };
}

function resolveSecondaryStyle(themeStyles, themeKey = 'dark') {
  return themeStyles?.[themeKey] ?? themeStyles?.dark ?? {
    radius: 5,
    color: '#ff4b4b',
    weight: 1.6,
    opacity: 0.98,
    fillColor: '#ff4b4b',
    fillOpacity: 0.9,
  };
}

export function createSecondaryTopoLayer(rawGeoJson, modal, radius = 5, themeStyles = {}, initialTheme = 'dark', map = null) {
  const styleState = { current: resolveSecondaryStyle(themeStyles, initialTheme) };

  const layer = L.geoJSON(rawGeoJson, {
    pane: 'secondaryTopo',
    renderer: map?.appRenderers?.secondaryTopo,
    bubblingMouseEvents: false,
    pointToLayer(feature, latlng) {
      return L.circleMarker(latlng, {
        radius,
        ...styleState.current,
      });
    },
    onEachFeature(feature, layer) {
      const title = feature?.properties?.nome_antico || feature?.properties?.nome_moderno || 'Toponimo secondario';

      layer.bindTooltip(title, {
        direction: 'top',
        className: 'feature-tooltip',
        opacity: 0.95,
        offset: [0, -8],
        sticky: true,
      });

      layer.on('click', (event) => {
        L.DomEvent.stopPropagation(event);
        modal.open({
          kicker: 'Toponimo menzionato',
          title,
          subtitle: feature?.properties?.display_name || 'Punto secondario dal layer other_topo.',
          sections: [{ title: 'Dettagli', rows: buildSecondaryPlaceRows(feature) }],
        });
      });
    },
  });

  function applyTheme(themeKey) {
    styleState.current = resolveSecondaryStyle(themeStyles, themeKey);
    layer.setStyle(styleState.current);
  }

  return { layer, applyTheme };
}
