import { buildPropertyRows, getFeatureTitle, splitStateAndProvinces } from '../data/normalize.js';
import { safeFeatureCollection } from '../core/utils.js';

function resolveTheme(countryConfig, themeKey = 'dark') {
  const themes = countryConfig.themeStyles ?? {};
  return themes[themeKey] ?? themes.dark ?? {
    provinceStyle: {},
    stateStyle: {},
    highlightStyle: {},
  };
}

function makeFeatureHandlers({ countryConfig, modal, kicker, subtitle, styleState }) {
  return function onEachFeature(feature, layer) {
    const title = getFeatureTitle(feature, countryConfig);

    layer.bindTooltip(title, {
      direction: 'top',
      sticky: true,
      className: 'feature-tooltip',
      opacity: 0.95,
    });

    layer.on('click', (event) => {
      L.DomEvent.stopPropagation(event);
      modal.open({
        kicker,
        title,
        subtitle,
        sections: [
          {
            title: 'Dettagli',
            rows: buildPropertyRows(feature, countryConfig, false),
          },
        ],
      });
    });

    layer.on('mouseover', () => {
      if (layer.bringToFront) {
        layer.bringToFront();
      }
      layer.setStyle(styleState.current.highlightStyle);
    });

    layer.on('mouseout', () => layer.setStyle(styleState.current.provinceStyle));
  };
}

export function createHistoricalCountryLayers(rawGeoJson, countryConfig, stateFeatureName, modal, initialTheme = 'dark') {
  const { stateFeature, provinces } = splitStateAndProvinces(
    rawGeoJson,
    stateFeatureName,
    countryConfig.titleCandidates
  );

  const styleState = {
    current: resolveTheme(countryConfig, initialTheme),
  };

  const baseGeoJsonOptions = {
    bubblingMouseEvents: false,
    smoothFactor: 0.5,
  };

  const provincesLayer = L.geoJSON(safeFeatureCollection(provinces), {
    ...baseGeoJsonOptions,
    interactive: true,
    pane: 'historicalProvinces',
    renderer: L.svg(),
    style: () => styleState.current.provinceStyle,
    onEachFeature: makeFeatureHandlers({
      countryConfig,
      modal,
      kicker: countryConfig.featureLabel,
      subtitle: countryConfig.label,
      styleState,
    }),
  });

  const stateLayer = L.geoJSON(stateFeature ? safeFeatureCollection([stateFeature]) : safeFeatureCollection([]), {
    ...baseGeoJsonOptions,
    interactive: false,
    pane: 'historicalStates',
    renderer: L.svg(),
    style: () => styleState.current.stateStyle,
  });

  function applyTheme(themeKey) {
    styleState.current = resolveTheme(countryConfig, themeKey);
    provincesLayer.setStyle(styleState.current.provinceStyle);
    stateLayer.setStyle(styleState.current.stateStyle);
  }

  return {
    stateFeature,
    provinceFeatures: provinces,
    provincesLayer,
    stateLayer,
    applyTheme,
  };
}
