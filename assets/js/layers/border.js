export function createSharedBorderLayer(chinaStateFeature, russiaStateFeature, config, modal) {
  const empty = {
    layer: L.layerGroup(),
    lengthKm: null,
  };

  if (!chinaStateFeature || !russiaStateFeature) {
    return empty;
  }

  try {
    const chinaLine = turf.polygonToLine(chinaStateFeature);
    const russiaLine = turf.polygonToLine(russiaStateFeature);
    const overlap = turf.lineOverlap(chinaLine, russiaLine, {
      tolerance: config.sharedBorder.tolerance,
    });

    if (!overlap?.features?.length) {
      return empty;
    }

    const lengthKm = overlap.features.reduce(
      (sum, feature) => sum + turf.length(feature, { units: 'kilometers' }),
      0
    );

    const glow = L.geoJSON(overlap, {
      interactive: false,
      pane: 'sharedBorderGlow',
      style: config.borderStyle.glow,
    });

    const main = L.geoJSON(overlap, {
      interactive: true,
      bubblingMouseEvents: false,
      pane: 'sharedBorder',
      style: config.borderStyle.main,
      onEachFeature(_feature, layer) {
        layer.on('click', (event) => {
          L.DomEvent.stopPropagation(event);
          modal.open({
            kicker: 'Frontiera condivisa',
            title: 'Confine Cina–Russia',
            subtitle: 'Segmenti ricavati dall’overlap tra i poligoni statali esterni.',
            sections: [
              {
                title: 'Sintesi',
                rows: [
                  {
                    label: 'Lunghezza stimata',
                    value: `${new Intl.NumberFormat('it-IT', {
                      maximumFractionDigits: 1,
                    }).format(lengthKm)} km`,
                  },
                  { label: 'Tolleranza overlap', value: config.sharedBorder.tolerance },
                ],
              },
            ],
          });
        });
      },
    });

    return {
      layer: L.layerGroup([glow, main]),
      lengthKm,
    };
  } catch (error) {
    console.warn('Impossibile estrarre la frontiera condivisa:', error);
    return empty;
  }
}
