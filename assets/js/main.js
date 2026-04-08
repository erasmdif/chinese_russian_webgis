import { APP_CONFIG } from './config.js';
import { createMap } from './core/map.js';
import { createUnionBounds } from './core/utils.js';
import { loadDatasets } from './data/loader.js';
import { createBaseMaps } from './layers/basemaps.js';
import { createHistoricalCountryLayers } from './layers/historical.js';
import { createPlacesLayers } from './layers/markers.js';
import { createSharedBorderLayer } from './layers/border.js';
import { createInfoModal } from './ui/modal.js';
import { addLegend } from './ui/legend.js';
import { addMapToolbar } from './ui/control-panel.js';
import { showLoading, showNote } from './ui/status.js';

async function init() {
  const map = createMap(APP_CONFIG);
  const modal = createInfoModal();

  const baseMaps = createBaseMaps();
  const defaultBaseKey = APP_CONFIG.ui.defaultBase in baseMaps ? APP_CONFIG.ui.defaultBase : 'dark';
  baseMaps[defaultBaseKey].layer.addTo(map);

  try {
    const datasets = await loadDatasets(APP_CONFIG.data);

    const chinaLayers = createHistoricalCountryLayers(
      datasets.china,
      APP_CONFIG.countries.china,
      APP_CONFIG.stateFeatureNames.china,
      modal,
      defaultBaseKey
    );

    const russiaLayers = createHistoricalCountryLayers(
      datasets.russia,
      APP_CONFIG.countries.russia,
      APP_CONFIG.stateFeatureNames.russia,
      modal,
      defaultBaseKey
    );

    const placesLayers = createPlacesLayers(
      datasets.places,
      modal,
      APP_CONFIG.icons,
      APP_CONFIG.routeStyle,
      APP_CONFIG.places.clustering
    );

    chinaLayers.applyTheme(defaultBaseKey);
    russiaLayers.applyTheme(defaultBaseKey);

    const sharedBorder = createSharedBorderLayer(
      chinaLayers.stateFeature,
      russiaLayers.stateFeature,
      APP_CONFIG,
      modal
    );

    const stateOutlinesGroup = L.layerGroup([chinaLayers.stateLayer, russiaLayers.stateLayer]);

    chinaLayers.provincesLayer.addTo(map);
    russiaLayers.provincesLayer.addTo(map);
    stateOutlinesGroup.addTo(map);
    if (sharedBorder.layer.getLayers().length) {
      sharedBorder.layer.addTo(map);
    }
    placesLayers.route.addTo(map);
    placesLayers.markers.addTo(map);

    const fitCandidates = [
      chinaLayers.provincesLayer,
      chinaLayers.stateLayer,
      russiaLayers.provincesLayer,
      russiaLayers.stateLayer,
      placesLayers.markers,
    ];

    const boundsCollector = [];
    for (const layer of fitCandidates) {
      if (typeof layer?.getBounds === 'function') {
        const bounds = layer.getBounds();
        if (bounds?.isValid?.()) {
          boundsCollector.push(bounds);
        }
      }
    }

    const masterBounds = createUnionBounds(boundsCollector);
    if (masterBounds) {
      map.fitBounds(masterBounds, { padding: APP_CONFIG.fitBoundsPadding });
    }

    addMapToolbar({
      map,
      baseMaps,
      defaultBaseKey,
      initialBounds: masterBounds,
      onBaseChange: (baseKey) => {
        chinaLayers.applyTheme(baseKey);
        russiaLayers.applyTheme(baseKey);
      },
      overlays: {
        chinaProvinces: {
          label: 'Province Cina',
          icon: 'bi-bounding-box',
          layer: chinaLayers.provincesLayer,
        },
        russiaProvinces: {
          label: 'Province Russia',
          icon: 'bi-bounding-box',
          layer: russiaLayers.provincesLayer,
        },
        states: {
          label: 'Confini statali',
          icon: 'bi-globe-europe-africa',
          layer: stateOutlinesGroup,
        },
        frontier: {
          label: 'Frontiera',
          icon: 'bi-bezier2',
          layer: sharedBorder.layer,
        },
        stops: {
          label: 'Tappe',
          icon: 'bi-geo-alt-fill',
          layer: placesLayers.markers,
        },
        route: {
          label: 'Percorso',
          icon: 'bi-signpost-split-fill',
          layer: placesLayers.route,
        },
      },
    });

    addLegend(map);

    const warnings = [];
    if (!(datasets.china.features ?? []).length) {
      warnings.push('china_1820.geojson è ancora vuoto.');
    }
    if (!(datasets.russia.features ?? []).length) {
      warnings.push('russia_1820.geojson è ancora vuoto.');
    }
    if (!(datasets.places.features ?? []).length) {
      warnings.push('places.geojson non contiene punti.');
    }
    if (
      !sharedBorder.lengthKm &&
      (datasets.china.features ?? []).length &&
      (datasets.russia.features ?? []).length
    ) {
      warnings.push(
        'La frontiera condivisa non è stata estratta automaticamente: aumenta la tolleranza o pulisci i poligoni statali.'
      );
    }

    showNote(warnings.join(' '));
  } catch (error) {
    console.error(error);
    showNote(error.message || 'Errore durante il caricamento della mappa.');
  } finally {
    showLoading(false);
  }
}

init();
